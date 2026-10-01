import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ClassStatus, TransactionType, TransactionStatus } from '@prisma/client';

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
      include: { tutor: true }
    });

    if (!targetClass) throw new NotFoundException('Không tìm thấy lớp học');
    if (targetClass.parentId !== parentId) throw new ForbiddenException('Không có quyền');
    if (targetClass.status !== ClassStatus.TRIAL) throw new BadRequestException('Lớp không ở trạng thái dạy thử');

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
          depositAction = TransactionType.DEPOSIT_REFUNDED; // Refund 50% logic would be handled by accountant later
          karmaChange = -2;
          break;
        default:
          throw new BadRequestException('Hành động không hợp lệ');
      }

      // Update class
      const updatedClass = await tx.class.update({
        where: { id: classId },
        data: { 
          status: newClassStatus,
          tutorId: newClassStatus === ClassStatus.OPEN ? null : targetClass.tutorId,
          cancelReason: newClassStatus !== ClassStatus.TEACHING ? dto.reason : null
        }
      });

      // Update Tutor Karma
      if (karmaChange !== 0 && targetClass.tutorId) {
        await tx.tutor.update({
          where: { id: targetClass.tutorId },
          data: { karmaScore: targetClass.tutor!.karmaScore + karmaChange }
        });
      }

      // Create transaction record for deposit resolution
      if (targetClass.tutorId) {
         await tx.transaction.create({
            data: {
              tutorId: targetClass.tutorId,
              classId: classId,
              type: depositAction,
              amount: 500000,
              status: TransactionStatus.SUCCESSFUL,
              reference: `Quyết toán cọc sau dạy thử: ${dto.action}`,
            },
         });
      }

      return {
        message: 'Đánh giá dạy thử thành công',
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
}
