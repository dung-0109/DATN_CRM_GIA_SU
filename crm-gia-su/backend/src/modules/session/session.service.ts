import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { 
  ClassStatus, 
  TransactionType, 
  TransactionStatus, 
  SessionStatus, 
  NotificationType, 
  RequestStatus, 
  ApplicationStatus 
} from '@prisma/client';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  async getSessionsByClass(classId: string) {
    return this.prisma.session.findMany({
      where: { classId, deletedAt: null },
      orderBy: { scheduledTime: 'desc' },
    });
  }

  async reviewTrial(parentId: string, classId: string, dto: any) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { 
        tutor: { select: { id: true, karmaScore: true, user: { select: { id: true } } } },
        tutorRequest: true,
        student: true,
      }
    });

    if (!targetClass) throw new NotFoundException('Không tìm thấy lớp học');
    if (targetClass.parentId !== parentId) throw new ForbiddenException('Bạn không có quyền đánh giá lớp này');
    if (targetClass.status !== ClassStatus.TRIAL && targetClass.status !== ClassStatus.DEPOSIT) {
      throw new BadRequestException('Lớp không ở trạng thái dạy thử hoặc chờ đánh giá');
    }

    return this.prisma.$transaction(async (tx) => {
      let newClassStatus: ClassStatus = ClassStatus.TEACHING;
      let karmaChange = 0;
      let depositAction: TransactionType = TransactionType.FEE_CONFIRMED;

      switch(dto.action) {
        case 'ACCEPT':
          newClassStatus = ClassStatus.TEACHING;
          depositAction = TransactionType.FEE_CONFIRMED;
          break;
        case 'REJECT_TUTOR':
          newClassStatus = ClassStatus.OPEN;
          depositAction = TransactionType.DEPOSIT_REFUNDED;
          karmaChange = -5;
          break;
        case 'REJECT_PARENT':
          newClassStatus = ClassStatus.CLOSED;
          depositAction = TransactionType.FORFEITED;
          break;
        case 'SCALE_DOWN':
          newClassStatus = ClassStatus.OPEN;
          depositAction = TransactionType.DEPOSIT_REFUNDED;
          karmaChange = -2;
          break;
        default:
          throw new BadRequestException('Hành động đánh giá không hợp lệ');
      }

      // 1. Cập nhật thông tin Lớp học (Class)
      const sessionsPerMonth = (targetClass.tutorRequest?.sessionsPerWeek || 2) * 4;
      const updatedClass = await tx.class.update({
        where: { id: classId },
        data: { 
          status: newClassStatus,
          remainingSessions: newClassStatus === ClassStatus.TEACHING ? sessionsPerMonth : 0,
          tutorId: newClassStatus === ClassStatus.OPEN ? null : targetClass.tutorId,
          cancelReason: newClassStatus !== ClassStatus.TEACHING ? dto.reason : null
        }
      });

      // 2. Nếu ACCEPT: Chốt lịch học định kỳ & sinh buổi học (Sessions) tự động
      if (dto.action === 'ACCEPT') {
        // Cập nhật trạng thái Yêu cầu tìm gia sư sang MATCHED
        if (targetClass.tutorRequestId) {
          await tx.tutorRequest.update({
            where: { id: targetClass.tutorRequestId },
            data: { status: RequestStatus.MATCHED }
          });
        }

        // Lưu danh sách ca học cố định (ClassSchedule)
        if (dto.schedules && Array.isArray(dto.schedules) && dto.schedules.length > 0) {
          await tx.classSchedule.deleteMany({ where: { classId } });
          for (const s of dto.schedules) {
            await tx.classSchedule.create({
              data: {
                classId,
                dayOfWeek: Number(s.dayOfWeek) || 2,
                slotStart: s.slotStart || '19:30',
                slotEnd: s.slotEnd || '21:00',
                isActive: true
              }
            });
          }

          // Tự động sinh danh sách buổi học (Sessions) cho 4 tuần tiếp theo
          const startDate = dto.startDate ? new Date(dto.startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
          for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
            const curDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
            const vnDay = curDate.getDay() === 0 ? 8 : curDate.getDay() + 1; // 2=T2, ..., 8=CN
            const matchedSlot = dto.schedules.find((s: any) => Number(s.dayOfWeek) === vnDay);

            if (matchedSlot) {
              const [h, m] = (matchedSlot.slotStart || '19:30').split(':').map(Number);
              const sessionTime = new Date(curDate);
              sessionTime.setHours(h || 19, m || 30, 0, 0);

              await tx.session.create({
                data: {
                  classId,
                  scheduledTime: sessionTime,
                  status: SessionStatus.SCHEDULED,
                  tutorNotes: `Buổi học chính thức. Lịch: Thứ ${vnDay === 8 ? 'CN' : vnDay} (${matchedSlot.slotStart} - ${matchedSlot.slotEnd})`,
                }
              });
            }
          }
        }

        // Gửi thông báo chúc mừng cho Gia sư
        if (targetClass.tutor?.user?.id) {
          await tx.notification.create({
            data: {
              userId: targetClass.tutor.user.id,
              type: NotificationType.CLASS_UPDATE,
              title: 'Chúc mừng! Phụ huynh đã chốt nhận bạn dạy chính thức',
              content: `Phụ huynh của em ${targetClass.student?.fullName || 'học sinh'} đã hài lòng với buổi dạy thử và chốt hợp đồng chính thức môn ${targetClass.tutorRequest?.subject || ''}. Lịch dạy cố định đã được cập nhật vào thời khóa biểu.`,
            }
          });
        }
      }

      // 3. Nếu REJECT_TUTOR: Thu hồi lớp, mở lại cho ứng viên khác & hoàn cọc
      if (dto.action === 'REJECT_TUTOR') {
        if (targetClass.tutorRequestId) {
          await tx.tutorRequest.update({
            where: { id: targetClass.tutorRequestId },
            data: { status: RequestStatus.CONSULTING }
          });
          if (targetClass.tutorId) {
            await tx.classApplication.updateMany({
              where: { tutorRequestId: targetClass.tutorRequestId, tutorId: targetClass.tutorId },
              data: { status: ApplicationStatus.REJECTED, note: dto.reason }
            });
          }
        }

        // Thông báo cho Gia sư
        if (targetClass.tutor?.user?.id) {
          await tx.notification.create({
            data: {
              userId: targetClass.tutor.user.id,
              type: NotificationType.CLASS_UPDATE,
              title: 'Kết quả buổi dạy thử',
              content: `Phụ huynh lớp ${targetClass.tutorRequest?.subject || ''} yêu cầu đổi gia sư do chưa phù hợp. Tiền cọc của bạn đã được hoàn lại.`,
            }
          });
        }
      }

      // 4. Nếu REJECT_PARENT: Hủy lớp
      if (dto.action === 'REJECT_PARENT') {
        if (targetClass.tutorRequestId) {
          await tx.tutorRequest.update({
            where: { id: targetClass.tutorRequestId },
            data: { status: RequestStatus.CANCELLED }
          });
        }
      }

      // 5. Cập nhật điểm uy tín Karma của Gia sư nếu có thay đổi
      if (karmaChange !== 0 && targetClass.tutorId) {
        await tx.tutor.update({
          where: { id: targetClass.tutorId },
          data: { karmaScore: Math.max(0, targetClass.tutor!.karmaScore + karmaChange) }
        });
      }

      // 6. Ghi nhận giao dịch tài chính (FEE_CONFIRMED / DEPOSIT_REFUNDED / FORFEITED)
      if (targetClass.tutorId) {
        await tx.transaction.create({
          data: {
            tutorId: targetClass.tutorId,
            classId: classId,
            type: depositAction,
            amount: 500000,
            status: TransactionStatus.SUCCESSFUL,
            reference: `Quyết toán cọc sau dạy thử: ${dto.action} - ${dto.reason || 'Chốt lớp chính thức'}`,
          },
        });
      }

      return {
        message: dto.action === 'ACCEPT' 
          ? 'Chúc mừng! Đã chốt nhận gia sư và kích hoạt lịch học chính thức thành công!' 
          : 'Đã gửi đánh giá và xử lý kết quả dạy thử thành công',
        class: updatedClass
      };
    });
  }

  async getDisputes() {
    const disputes = await this.prisma.session.findMany({
      where: { status: 'DISPUTED', deletedAt: null },
      include: {
        class: {
          include: { student: true, tutor: true, parent: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return disputes.map(d => ({
      ...d,
      parent: d.class.parent,
      reason: d.disputeReason
    }));
  }

  async resolveDispute(sessionId: string, outcome: string, note: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: { include: { tutor: true } } }
    });

    if (!session) throw new NotFoundException('Không tìm thấy khiếu nại');
    if (session.status !== 'DISPUTED') throw new BadRequestException('Buổi học không trong trạng thái khiếu nại');

    return this.prisma.$transaction(async (tx) => {
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: outcome === 'RESOLVED_CONFIRM' ? 'CONFIRMED' : 'CANCELLED_BY_STUDENT',
          disputeResolution: outcome as any,
          tutorNotes: note
        }
      });

      if (outcome === 'RESOLVED_CONFIRM' && session.class.tutor) {
        // Cộng lương
        await tx.tutor.update({
          where: { id: session.class.tutor.id },
          data: { walletBalance: { increment: session.class.tutorWageRate } }
        });
        await tx.transaction.create({
          data: {
            tutorId: session.class.tutor.id,
            sessionId: session.id,
            classId: session.class.id,
            type: TransactionType.TUTOR_SALARY,
            amount: session.class.tutorWageRate,
            status: TransactionStatus.SUCCESSFUL,
            reference: 'Giải quyết khiếu nại: Chốt lương hợp lệ'
          }
        });
      }
      return { message: 'Đã giải quyết khiếu nại', session: updatedSession };
    });
  }

  async triggerAutoConfirm() {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const sessions = await this.prisma.session.findMany({
      where: {
        status: 'ATTENDED',
        actualEnd: { lte: fortyEightHoursAgo }
      },
      include: { class: true }
    });

    if (sessions.length === 0) return { message: 'Không có buổi học nào cần tự động duyệt' };

    let count = 0;
    await this.prisma.$transaction(async (tx) => {
      for (const s of sessions) {
        await tx.session.update({
          where: { id: s.id },
          data: { status: 'CONFIRMED' }
        });
        if (s.class.tutorId) {
          await tx.tutor.update({
            where: { id: s.class.tutorId },
            data: { walletBalance: { increment: s.class.tutorWageRate } }
          });
          await tx.transaction.create({
            data: {
              tutorId: s.class.tutorId,
              sessionId: s.id,
              classId: s.class.id,
              type: TransactionType.TUTOR_SALARY,
              amount: s.class.tutorWageRate,
              status: TransactionStatus.SUCCESSFUL,
              reference: 'Hệ thống tự động duyệt lương sau 48h'
            }
          });
        }
        count++;
      }
    });

    return { message: `Đã tự động duyệt ${count} buổi học.` };
  }

  async recordAttendance(tutorId: string, dto: { classId: string; startTime: string; endTime: string; description?: string }) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    if (targetClass.tutorId !== tutorId) {
      throw new ForbiddenException('Bạn không phải là gia sư của lớp học này');
    }

    const session = await this.prisma.session.create({
      data: {
        classId: dto.classId,
        scheduledTime: new Date(dto.startTime),
        actualStart: new Date(dto.startTime),
        actualEnd: new Date(dto.endTime),
        status: 'ATTENDED',
        tutorNotes: dto.description || null,
      },
    });

    return {
      message: 'Ghi nhận điểm danh buổi học thành công! Chờ Phụ huynh phê duyệt.',
      session,
    };
  }

  async parentConfirmSession(parentId: string, sessionId: string, dto: { rating?: number; feedback?: string }) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: { include: { tutor: true } } },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    if (session.class.parentId !== parentId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên buổi học này');
    }

    if (session.status !== 'ATTENDED') {
      throw new BadRequestException('Buổi học chưa ở trạng thái chờ duyệt hoặc đã được xác nhận.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'CONFIRMED',
          parentRating: dto.rating ? Number(dto.rating) : null,
          parentFeedback: dto.feedback || null,
        },
      });

      if (session.class.remainingSessions > 0) {
        await tx.class.update({
          where: { id: session.classId },
          data: { remainingSessions: { decrement: 1 } },
        });
      }

      if (session.class.tutor) {
        await tx.tutor.update({
          where: { id: session.class.tutor.id },
          data: { walletBalance: { increment: session.class.tutorWageRate } },
        });

        await tx.transaction.create({
          data: {
            tutorId: session.class.tutor.id,
            sessionId: session.id,
            classId: session.class.id,
            type: TransactionType.TUTOR_SALARY,
            amount: session.class.tutorWageRate,
            status: TransactionStatus.SUCCESSFUL,
            reference: `Phụ huynh duyệt buổi học ngày ${new Date(session.scheduledTime).toLocaleDateString('vi-VN')}`,
          },
        });
      }

      return {
        message: 'Xác nhận buổi học thành công! Đã thanh toán thù lao vào ví gia sư.',
        session: updatedSession,
      };
    });
  }

  async parentDisputeSession(parentId: string, sessionId: string, dto: { reason: string }) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { class: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    if (session.class.parentId !== parentId) {
      throw new ForbiddenException('Bạn không có quyền thao tác trên buổi học này');
    }

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'DISPUTED',
        disputeReason: dto.reason,
      },
    });

    return {
      message: 'Đã gửi khiếu nại buổi học tới bộ phận Học Vụ trung tâm để giải quyết!',
      session: updated,
    };
  }
}
