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
}
