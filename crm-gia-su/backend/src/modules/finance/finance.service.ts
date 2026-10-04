import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TutorDepositDto } from './dto/deposit.dto';
import { TransactionType, TransactionStatus, ClassStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async submitDeposit(tutorId: string, dto: TutorDepositDto) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    if (targetClass.status !== ClassStatus.DEPOSIT) {
      throw new BadRequestException('Lớp học này không ở trạng thái chờ nộp cọc');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Ghi log giao dịch nộp cọc (Trạng thái PENDING chờ webhook ngân hàng, ở đây giả lập SUCCESS)
      const transaction = await tx.transaction.create({
        data: {
          tutorId,
          classId: dto.classId,
          type: TransactionType.DEPOSIT_HELD,
          amount: dto.amount,
          status: TransactionStatus.SUCCESSFUL,
          reference: `Gia sư nộp cọc nhận lớp ${dto.classId}`,
        },
      });

      // 2. Cập nhật trạng thái lớp học sang TRIAL và gán gia sư
      const updatedClass = await tx.class.update({
        where: { id: dto.classId },
        data: { 
          status: ClassStatus.TRIAL,
          tutorId: tutorId
        },
      });

      return {
        message: 'Nộp cọc thành công, hệ thống đã mở khóa thông tin liên hệ phụ huynh.',
        transaction,
        class: updatedClass,
      };
    });
  }

  async getClassTransactions(classId: string) {
    return this.prisma.transaction.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
      include: {
        tutor: {
          select: { fullName: true, identityNumber: true }
        }
      }
    });
  }

  async getTutorTransactions(tutorId: string) {
    return this.prisma.transaction.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'desc' },
      include: {
        class: {
          select: { student: { select: { fullName: true } }, hourlyRate: true }
        }
      }
    });
  }
}
