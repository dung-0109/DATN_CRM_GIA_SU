import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApplyRequestDto } from './dto/apply-request.dto';
import { MatchTutorDto } from './dto/match-tutor.dto';
import { ResolveTrialDto, TrialOutcome } from './dto/resolve-trial.dto';
import { RequestStatus, ApplicationStatus, ClassStatus, UserRole, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async createRequest(parentId: string, dto: CreateRequestDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      throw new NotFoundException('Không tìm thấy thông tin Phụ huynh');
    }

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, parentId },
    });
    if (!student) {
      throw new BadRequestException('Học sinh không thuộc quyền quản trị của Phụ huynh này');
    }

    return this.prisma.tutorRequest.create({
      data: {
        parentId,
        studentId: dto.studentId,
        subject: dto.subject,
        grade: dto.grade,
        scheduleNotes: dto.scheduleNotes,
        sessionsPerWeek: dto.sessionsPerWeek,
        budgetPerSession: dto.budgetPerSession,
        tutorGenderPref: dto.tutorGenderPref,
        status: RequestStatus.NEW,
      },
      include: {
        student: true,
      },
    });
  }

  async findAllRequests() {
    return this.prisma.tutorRequest.findMany({
      where: { deletedAt: null },
      include: {
        parent: {
          select: {
            fullName: true,
          },
        },
        student: {
          select: {
            fullName: true,
            grade: true,
          },
        },
        _count: {
          select: {
            classApplications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async applyRequest(tutorId: string, requestId: string, dto: ApplyRequestDto) {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });
    if (!tutor) {
      throw new NotFoundException('Không tìm thấy thông tin Gia sư');
    }

    if (tutor.status !== 'ACTIVE') {
      throw new ForbiddenException('Tài khoản Gia sư chưa được phê duyệt hoạt động');
    }

    const request = await this.prisma.tutorRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu tìm Gia sư');
    }

    if (request.status !== RequestStatus.PUBLISHED) {
      throw new BadRequestException('Yêu cầu này không ở trạng thái tuyển dụng (PUBLISHED)');
    }

    // Kiểm tra đã ứng tuyển chưa
    const existingApp = await this.prisma.classApplication.findUnique({
      where: {
        tutorRequestId_tutorId: {
          tutorRequestId: requestId,
          tutorId,
        },
      },
    });
    if (existingApp) {
      throw new BadRequestException('Bạn đã ứng tuyển yêu cầu này trước đó');
    }

    return this.prisma.classApplication.create({
      data: {
        tutorRequestId: requestId,
        tutorId,
        coverLetter: dto.coverLetter,
        status: ApplicationStatus.PENDING,
      },
    });
  }

  async getApplicationsForRequest(requestId: string) {
    return this.prisma.classApplication.findMany({
      where: { tutorRequestId: requestId, deletedAt: null },
      include: {
        tutor: {
          select: {
            id: true,
            fullName: true,
            ratingAvg: true,
            occupation: true,
            qualification: true,
          },
        },
      },
    });
  }

  async matchTutor(requestId: string, dto: MatchTutorDto) {
    const request = await this.prisma.tutorRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) {
      throw new NotFoundException('Không tìm thấy yêu cầu');
    }

    if (request.status !== RequestStatus.PUBLISHED) {
      throw new BadRequestException('Yêu cầu này không ở trạng thái tuyển dụng (PUBLISHED)');
    }

    const tutor = await this.prisma.tutor.findUnique({
      where: { id: dto.tutorId },
    });
    if (!tutor) {
      throw new NotFoundException('Không tìm thấy Gia sư được khớp');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái yêu cầu
      await tx.tutorRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.MATCHED },
      });

      // 2. Phê duyệt đơn ứng tuyển của gia sư này và từ chối các gia sư khác
      await tx.classApplication.updateMany({
        where: { tutorRequestId: requestId, tutorId: dto.tutorId },
        data: { status: ApplicationStatus.SELECTED_FOR_TRIAL },
      });

      await tx.classApplication.updateMany({
        where: {
          tutorRequestId: requestId,
          tutorId: { not: dto.tutorId },
        },
        data: { status: ApplicationStatus.REJECTED },
      });

      // 3. Tạo lớp học dạy thử TRIAL_PENDING
      const newClass = await tx.class.create({
        data: {
          tutorRequestId: requestId,
          tutorId: dto.tutorId,
          parentId: request.parentId,
          studentId: request.studentId,
          hourlyRate: dto.hourlyRate,
          tutorWageRate: dto.tutorWageRate,
          status: ClassStatus.TRIAL_PENDING,
        },
      });

      return newClass;
    });
  }

  async resolveTrial(classId: string, dto: ResolveTrialDto) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        parent: true,
        tutor: true,
      },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy thông tin lớp học');
    }

    if (targetClass.status !== ClassStatus.TRIAL_PENDING) {
      throw new BadRequestException('Lớp học này không ở trạng thái chờ dạy thử (TRIAL_PENDING)');
    }

    if (dto.outcome === TrialOutcome.FAILED) {
      // DẠY THỬ THẤT BẠI: trừ tiền 1 buổi thẳng từ ví phụ huynh, cộng lương gia sư
      const hourlyRate = targetClass.hourlyRate.toNumber();
      const parentBalance = targetClass.parent.balance.toNumber();

      if (parentBalance < hourlyRate) {
        throw new BadRequestException(
          `Số dư ví Phụ huynh (${parentBalance.toLocaleString()}đ) không đủ thanh toán 1 buổi dạy thử (${hourlyRate.toLocaleString()}đ).`,
        );
      }

      return this.prisma.$transaction(async (tx) => {
        // 1. Cập nhật trạng thái lớp học
        const updatedClass = await tx.class.update({
          where: { id: classId },
          data: {
            status: ClassStatus.TRIAL_FAILED,
            trialFailedNote: dto.note || 'Dạy thử không thành công',
          },
        });

        // 2. Trừ tiền Phụ huynh
        const newParentBalance = parentBalance - hourlyRate;
        await tx.parent.update({
          where: { id: targetClass.parentId },
          data: { balance: newParentBalance },
        });

        // 3. Ghi log giao dịch trừ tiền Phụ huynh
        await tx.transaction.create({
          data: {
            parentId: targetClass.parentId,
            classId: classId,
            type: TransactionType.SESSION_DEDUCTION,
            amount: hourlyRate,
            status: TransactionStatus.SUCCESSFUL,
            reference: `Khấu trừ 1 buổi dạy thử thất bại của lớp ${classId}`,
          },
        });

        // 4. Cộng lương Gia sư
        const tutorWage = targetClass.tutorWageRate.toNumber();
        const currentTutorWallet = targetClass.tutor ? targetClass.tutor.walletBalance.toNumber() : 0;
        const newTutorWallet = currentTutorWallet + tutorWage;

        if (targetClass.tutorId) {
          await tx.tutor.update({
            where: { id: targetClass.tutorId },
            data: { walletBalance: newTutorWallet },
          });

          // 5. Ghi log giao dịch cộng tiền Gia sư
          await tx.transaction.create({
            data: {
              tutorId: targetClass.tutorId,
              classId: classId,
              type: TransactionType.TUTOR_SALARY,
              amount: tutorWage,
              status: TransactionStatus.SUCCESSFUL,
              reference: `Trả lương dạy thử của lớp ${classId}`,
            },
          });
        }

        // 6. Chuyển lại trạng thái yêu cầu tìm gia sư về PUBLISHED để tuyển tiếp
        await tx.tutorRequest.update({
          where: { id: targetClass.tutorRequestId },
          data: { status: RequestStatus.PUBLISHED },
        });

        return {
          message: 'Quyết toán dạy thử thất bại thành công. Đã khấu trừ phí 1 buổi và đưa yêu cầu trở lại đăng tuyển.',
          class: updatedClass,
        };
      });
    } else {
      // DẠY THỬ THÀNH CÔNG: Chuyển lớp sang TEACHING
      const updatedClass = await this.prisma.class.update({
        where: { id: classId },
        data: { status: ClassStatus.TEACHING },
      });

      return {
        message: 'Dạy thử thành công! Lớp học được chuyển sang trạng thái giảng dạy chính thức.',
        class: updatedClass,
      };
    }
  }

  // Tiện ích dành cho Sales cập nhật trạng thái yêu cầu (để chuyển từ NEW -> PUBLISHED)
  async updateRequestStatus(requestId: string, status: RequestStatus) {
    return this.prisma.tutorRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }

  async findClassesByParent(parentId: string) {
    return this.prisma.class.findMany({
      where: { parentId, deletedAt: null },
      include: {
        tutor: { select: { fullName: true } },
        student: { select: { fullName: true } },
      },
    });
  }

  async findClassesByTutor(tutorId: string) {
    return this.prisma.class.findMany({
      where: { tutorId, deletedAt: null },
      include: {
        student: { select: { fullName: true } },
      },
    });
  }
}
