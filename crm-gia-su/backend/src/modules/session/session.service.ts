import { Injectable, BadRequestException, NotFoundException, ForbiddenException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { FinanceService } from '../finance/finance.service';
import { AttendanceDto } from './dto/attendance.dto';
import { ResolveSessionDto, ResolveAction } from './dto/resolve-session.dto';
import { ResolveDisputeDto, DisputeOutcome } from './dto/resolve-dispute.dto';
import { SessionStatus, DisputeResolution, TransactionType, TransactionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SessionService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private financeService: FinanceService,
  ) {}

  onModuleInit() {
    // Chạy job tự động duyệt sau mỗi 1 giờ
    setInterval(() => {
      this.runAutoConfirmJob(48).catch((err) =>
        console.error('Lỗi chạy job tự động duyệt:', err),
      );
    }, 60 * 60 * 1000);
  }

  async runAutoConfirmJob(hoursThreshold = 48) {
    const cutoffTime = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);
    const sessionsToConfirm = await this.prisma.session.findMany({
      where: {
        status: SessionStatus.ATTENDED,
        updatedAt: { lte: cutoffTime },
        deletedAt: null,
      },
      include: {
        class: {
          include: {
            tutor: true,
          },
        },
      },
    });

    let successCount = 0;
    for (const session of sessionsToConfirm) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // 1. Duyệt trạng thái buổi học sang CONFIRMED
          await tx.session.update({
            where: { id: session.id },
            data: { status: SessionStatus.CONFIRMED },
          });

          // 2. Khấu trừ 1 buổi học trong gói trả trước theo FIFO
          await this.financeService.consumeSessionFIFO(tx, session.classId);

          // 3. Cộng tiền lương Gia sư
          const tutorWage = session.class.tutorWageRate.toNumber();
          if (session.class.tutorId && session.class.tutor) {
            const currentTutorWallet = session.class.tutor.walletBalance.toNumber();
            const newTutorWallet = currentTutorWallet + tutorWage;

            await tx.tutor.update({
              where: { id: session.class.tutorId },
              data: { walletBalance: newTutorWallet },
            });

            // 4. Ghi log giao dịch lương gia sư
            await tx.transaction.create({
              data: {
                tutorId: session.class.tutorId,
                classId: session.classId,
                sessionId: session.id,
                type: TransactionType.TUTOR_SALARY,
                amount: tutorWage,
                status: TransactionStatus.SUCCESSFUL,
                reference: `[Tự động duyệt ${hoursThreshold}h] Thanh toán lương buổi học ngày ${session.scheduledTime.toLocaleDateString()}`,
              },
            });
          }
        });
        successCount++;
        console.log(`[Auto-Confirm] Đã tự động duyệt buổi học ID: ${session.id}`);
      } catch (err) {
        console.error(`[Auto-Confirm] Thất bại khi duyệt buổi học ID: ${session.id}`, err);
      }
    }

    return {
      message: `Đã quét và tự động duyệt thành công ${successCount} buổi học.`,
      count: successCount,
    };
  }

  async attendance(tutorId: string, dto: AttendanceDto) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    if (targetClass.tutorId !== tutorId) {
      throw new ForbiddenException('Bạn không phải Gia sư đảm nhận lớp học này');
    }

    // Kiểm tra quy tắc BR-SCH-04: Khóa điểm danh sau 24 giờ
    const endTime = new Date(dto.endTime);
    const diffHours = (Date.now() - endTime.getTime()) / (1000 * 60 * 60);
    if (diffHours > 24) {
      throw new BadRequestException(
        'Đã quá thời hạn 24 giờ kể từ khi buổi học kết thúc để thực hiện điểm danh (ATTENDANCE_LOCKED)',
      );
    }

    return this.prisma.session.create({
      data: {
        classId: dto.classId,
        scheduledTime: new Date(dto.startTime),
        actualStart: new Date(dto.startTime),
        actualEnd: new Date(dto.endTime),
        tutorNotes: dto.description || 'Điểm danh buổi học',
        status: SessionStatus.ATTENDED,
      },
    });
  }

  async getSessionsByClass(classId: string) {
    return this.prisma.session.findMany({
      where: { classId, deletedAt: null },
      orderBy: { scheduledTime: 'desc' },
    });
  }

  async resolveSession(parentId: string, sessionId: string, dto: ResolveSessionDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            tutor: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    if (session.class.parentId !== parentId) {
      throw new ForbiddenException('Lớp học này không thuộc quyền quản trị của bạn');
    }

    if (session.status !== SessionStatus.ATTENDED) {
      throw new BadRequestException('Buổi học này không ở trạng thái chờ duyệt (ATTENDED)');
    }

    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy thông tin Phụ huynh');
    }

    if (dto.action === ResolveAction.CONFIRM) {
      if (!dto.pin) {
        throw new BadRequestException('Vui lòng cung cấp mã PIN bảo mật để xác nhận');
      }

      // Xác thực mã PIN
      const isPinValid = await bcrypt.compare(dto.pin, parent.pinHash);
      if (!isPinValid) {
        throw new BadRequestException('Mã PIN bảo mật không chính xác. Vui lòng kiểm tra lại.');
      }

      return this.prisma.$transaction(async (tx) => {
        // 1. Duyệt trạng thái buổi học sang CONFIRMED
        const updatedSession = await tx.session.update({
          where: { id: sessionId },
          data: { status: SessionStatus.CONFIRMED },
        });

        // 2. Khấu trừ 1 buổi học trong gói trả trước theo FIFO
        await this.financeService.consumeSessionFIFO(tx, session.classId);

        // 3. Cộng tiền lương Gia sư
        const tutorWage = session.class.tutorWageRate.toNumber();
        if (session.class.tutorId && session.class.tutor) {
          const currentTutorWallet = session.class.tutor.walletBalance.toNumber();
          const newTutorWallet = currentTutorWallet + tutorWage;

          await tx.tutor.update({
            where: { id: session.class.tutorId },
            data: { walletBalance: newTutorWallet },
          });

          // 4. Ghi log giao dịch lương gia sư
          await tx.transaction.create({
            data: {
              tutorId: session.class.tutorId,
              classId: session.classId,
              sessionId: sessionId,
              type: TransactionType.TUTOR_SALARY,
              amount: tutorWage,
              status: TransactionStatus.SUCCESSFUL,
              reference: `Thanh toán lương buổi học ngày ${session.scheduledTime.toLocaleDateString()}`,
            },
          });
        }

        return {
          message: 'Xác nhận buổi học và quyết toán học phí thành công!',
          session: updatedSession,
        };
      });
    } else {
      // DISPUTE
      if (!dto.reason) {
        throw new BadRequestException('Vui lòng cung cấp lý do khiếu nại buổi học');
      }

      // Chuyển buổi học sang trạng thái DISPUTED
      const updatedSession = await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          status: SessionStatus.DISPUTED,
          disputeReason: dto.reason,
        },
      });

      return {
        message: 'Gửi khiếu nại thành công. Đội ngũ học vụ sẽ liên hệ đối soát sớm.',
        session: updatedSession,
      };
    }
  }

  async findAllDisputes() {
    // Trả về danh sách các session đang có trạng thái DISPUTED
    return this.prisma.session.findMany({
      where: { status: SessionStatus.DISPUTED, deletedAt: null },
      include: {
        class: {
          include: {
            parent: {
              select: { fullName: true },
            },
            student: {
              select: { fullName: true },
            },
            tutor: {
              select: { fullName: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async resolveDispute(sessionId: string, dto: ResolveDisputeDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        class: {
          include: {
            tutor: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy thông tin buổi học khiếu nại');
    }

    if (session.status !== SessionStatus.DISPUTED) {
      throw new BadRequestException('Buổi học này không ở trạng thái khiếu nại (DISPUTED)');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.outcome === DisputeOutcome.RESOLVED_CONFIRM) {
        // Phán quyết: Buổi dạy hợp lệ -> Trừ tiền phụ huynh, trả lương gia sư
        const updatedSession = await tx.session.update({
          where: { id: sessionId },
          data: {
            status: SessionStatus.CONFIRMED,
            disputeResolution: DisputeResolution.RESOLVED_CONFIRM,
            tutorNotes: `${session.tutorNotes || ''} [Học vụ xử lý: ${dto.note || 'Duyệt dạy hợp lệ'}]`,
          },
        });

        await this.financeService.consumeSessionFIFO(tx, session.classId);

        const tutorWage = session.class.tutorWageRate.toNumber();
        if (session.class.tutorId && session.class.tutor) {
          const currentTutorWallet = session.class.tutor.walletBalance.toNumber();
          const newTutorWallet = currentTutorWallet + tutorWage;

          await tx.tutor.update({
            where: { id: session.class.tutorId },
            data: { walletBalance: newTutorWallet },
          });

          await tx.transaction.create({
            data: {
              tutorId: session.class.tutorId,
              classId: session.classId,
              sessionId: sessionId,
              type: TransactionType.TUTOR_SALARY,
              amount: tutorWage,
              status: TransactionStatus.SUCCESSFUL,
              reference: `Quyết toán lương tranh chấp buổi học ngày ${session.scheduledTime.toLocaleDateString()}`,
            },
          });
        }

        return {
          message: 'Phán quyết thành công: Duyệt buổi dạy hợp lệ và chuyển lương cho Gia sư.',
          session: updatedSession,
        };
      } else {
        // Phán quyết: Hủy buổi dạy -> Hủy buổi học, không trừ tiền, không trả lương
        const updatedSession = await tx.session.update({
          where: { id: sessionId },
          data: {
            status: SessionStatus.CANCELLED_BY_TUTOR, // hoặc CANCELLED_BY_STUDENT
            disputeResolution: DisputeResolution.RESOLVED_CANCEL,
            tutorNotes: `${session.tutorNotes || ''} [Học vụ xử lý: ${dto.note || 'Hủy buổi học'}]`,
          },
        });

        return {
          message: 'Phán quyết thành công: Hủy buổi dạy và không khấu trừ tiền của Phụ huynh.',
          session: updatedSession,
        };
      }
    });
  }
}
