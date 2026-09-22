import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PurchasePackageDto } from './dto/purchase-package.dto';
import { TopupDto } from './dto/topup.dto';
import { TransactionType, TransactionStatus, PackageStatus, UserRole, ClassStatus } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async topup(parentId: string, dto: TopupDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy thông tin Phụ huynh');
    }

    const currentBalance = parent.balance.toNumber();
    const newBalance = currentBalance + dto.amount;

    return this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật số dư Phụ huynh
      const updatedParent = await tx.parent.update({
        where: { id: parentId },
        data: { balance: newBalance },
      });

      // 2. Ghi log giao dịch nạp tiền
      await tx.transaction.create({
        data: {
          parentId,
          type: TransactionType.TUITION_DEPOSIT,
          amount: dto.amount,
          status: TransactionStatus.SUCCESSFUL,
          reference: `Nạp tiền giả lập vào ví phụ huynh`,
        },
      });

      return {
        message: 'Nạp tiền vào tài khoản thành công',
        balance: updatedParent.balance.toNumber(),
      };
    });
  }

  async getBalance(profileId: string, role: string, profileType: string) {
    if (profileType === 'PARENT' || role === 'PARENT') {
      const parent = await this.prisma.parent.findUnique({
        where: { id: profileId },
      });
      if (!parent) throw new NotFoundException('Không tìm thấy thông tin Phụ huynh');
      return { balance: parent.balance.toNumber() };
    }

    if (profileType === 'TUTOR' || role === 'TUTOR') {
      const tutor = await this.prisma.tutor.findUnique({
        where: { id: profileId },
      });
      if (!tutor) throw new NotFoundException('Không tìm thấy thông tin Gia sư');
      return { balance: tutor.walletBalance.toNumber() };
    }

    return { balance: 0 };
  }

  async purchasePackage(parentId: string, dto: PurchasePackageDto) {
    const parent = await this.prisma.parent.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new NotFoundException('Không tìm thấy thông tin Phụ huynh');
    }

    const targetClass = await this.prisma.class.findUnique({
      where: { id: dto.classId },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    if (targetClass.parentId !== parentId) {
      throw new ForbiddenException('Lớp học này không thuộc quyền sở hữu của bạn');
    }

    const parentBalance = parent.balance.toNumber();
    if (parentBalance < dto.price) {
      throw new BadRequestException(
        `Số dư ví (${parentBalance.toLocaleString()}đ) không đủ để thanh toán gói học phí (${dto.price.toLocaleString()}đ). Vui lòng nạp thêm tiền.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Trừ tiền tài khoản Phụ huynh
      const newBalance = parentBalance - dto.price;
      await tx.parent.update({
        where: { id: parentId },
        data: { balance: newBalance },
      });

      // 2. Tạo gói học phí
      const newPackage = await tx.package.create({
        data: {
          classId: dto.classId,
          parentId,
          name: dto.name,
          totalSessions: dto.totalSessions,
          usedSessions: 0,
          price: dto.price,
          status: PackageStatus.ACTIVE,
        },
      });

      // 3. Ghi log giao dịch mua gói (trừ tiền)
      await tx.transaction.create({
        data: {
          parentId,
          classId: dto.classId,
          packageId: newPackage.id,
          type: TransactionType.TUITION_DEPOSIT, // Sử dụng làm lịch sử nạp/mua
          amount: dto.price,
          status: TransactionStatus.SUCCESSFUL,
          reference: `Mua gói học phí: ${dto.name} (${dto.totalSessions} buổi)`,
        },
      });

      // 4. Đồng bộ cache remaining_sessions của lớp học
      const newRemainingSessions = targetClass.remainingSessions + dto.totalSessions;
      
      // Nếu lớp đang ở trạng thái chờ mua gói sau khi dạy thử thành công,
      // khi mua gói lần đầu tiên, chuyển trạng thái sang TEACHING
      const nextStatus = targetClass.status === ClassStatus.TRIAL_PENDING 
        ? ClassStatus.TEACHING 
        : targetClass.status;

      const updatedClass = await tx.class.update({
        where: { id: dto.classId },
        data: { 
          remainingSessions: newRemainingSessions,
          status: nextStatus
        },
      });

      return {
        message: 'Mua gói học phí thành công!',
        package: newPackage,
        class: updatedClass,
        balance: newBalance,
      };
    });
  }

  async getPackagesByClass(classId: string) {
    return this.prisma.package.findMany({
      where: { classId, deletedAt: null },
      orderBy: { purchasedAt: 'desc' },
    });
  }

  // Thuật toán trừ buổi học lũy kế FIFO (được gọi từ Module điểm danh)
  async consumeSessionFIFO(tx: any, classId: string) {
    // Tìm gói học phí cũ nhất còn hoạt động (FIFO)
    const oldestPackage = await tx.package.findFirst({
      where: {
        classId,
        status: PackageStatus.ACTIVE,
      },
      orderBy: { purchasedAt: 'asc' },
    });

    if (!oldestPackage) {
      throw new BadRequestException('Lớp học không còn buổi học nào trong gói trả trước. Vui lòng mua thêm gói.');
    }

    const nextUsedSessions = oldestPackage.usedSessions + 1;
    const isExhausted = nextUsedSessions >= oldestPackage.totalSessions;

    // 1. Cập nhật gói học phí
    await tx.package.update({
      where: { id: oldestPackage.id },
      data: {
        usedSessions: nextUsedSessions,
        status: isExhausted ? PackageStatus.EXHAUSTED : PackageStatus.ACTIVE,
      },
    });

    // 2. Lấy thông tin lớp để cập nhật cache
    const targetClass = await tx.class.findUnique({
      where: { id: classId },
    });

    if (targetClass) {
      const nextRemaining = Math.max(0, targetClass.remainingSessions - 1);
      
      // Cập nhật cache remaining_sessions của lớp
      await tx.class.update({
        where: { id: classId },
        data: { remainingSessions: nextRemaining },
      });
    }

    return oldestPackage.id;
  }
}
