import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { ClassStatus, RequestStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [revenueAgg, activeClasses, activeTutors, matchedRequests] =
      await Promise.all([
        this.prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'FEE_CONFIRMED' } }),
        this.prisma.class.count({
          where: { status: ClassStatus.TEACHING, deletedAt: null },
        }),
        this.prisma.tutor.count({
          where: { status: 'ACTIVE', deletedAt: null },
        }),
        this.prisma.tutorRequest.findMany({
          where: { status: RequestStatus.MATCHED, deletedAt: null },
          select: { createdAt: true, updatedAt: true },
        }),
      ]);

    const timeToMatchHours =
      matchedRequests.length > 0
        ? matchedRequests.reduce(
            (sum, r) =>
              sum +
              (r.updatedAt.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60),
            0,
          ) / matchedRequests.length
        : null;

    return {
      totalRevenue: Number(revenueAgg._sum.amount ?? 0),
      activeClasses,
      activeTutors,
      timeToMatchHours: timeToMatchHours !== null ? Math.round(timeToMatchHours * 10) / 10 : null,
      tutorChangeRate: null as number | null,
    };
  }

  async getAllTutors() {
    return this.prisma.tutor.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTutorStatus(tutorId: string, status: string) {
    const tutor = await this.prisma.tutor.findUnique({ where: { id: tutorId } });
    if (!tutor) {
      throw new NotFoundException('Không tìm thấy hồ sơ Gia sư');
    }
    return this.prisma.tutor.update({
      where: { id: tutorId },
      data: { status },
    });
  }

  async getAllClasses() {
    return this.prisma.class.findMany({
      where: { deletedAt: null },
      include: {
        parent: { select: { fullName: true } },
        student: { select: { fullName: true } },
        tutor: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async payoutTutor(tutorId: string) {
    const tutor = await this.prisma.tutor.findUnique({ where: { id: tutorId } });
    if (!tutor) {
      throw new NotFoundException('Không tìm thấy hồ sơ Gia sư');
    }

    const amount = tutor.walletBalance.toNumber();
    if (amount <= 0) {
      return { message: 'Ví tiền gia sư bằng 0, không cần thanh toán.' };
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Đưa số dư ví về 0
      await tx.tutor.update({
        where: { id: tutorId },
        data: { walletBalance: 0 },
      });

      // 2. Tạo bản ghi giao dịch rút lương
      await tx.transaction.create({
        data: {
          tutorId,
          type: 'SALARY_WITHDRAWAL',
          amount,
          status: 'SUCCESSFUL',
          reference: `Kế toán quyết toán chuyển khoản lương gia sư ngày ${new Date().toLocaleDateString()}`,
        },
      });

      return {
        message: `Quyết toán lương gia sư ${tutor.fullName} thành công: đã thanh toán ${amount.toLocaleString()}đ.`,
      };
    });
  }

  async getBankAccounts(tutorId: string) {
    const list = await this.prisma.tutorBankAccount.findMany({
      where: { tutorId },
      orderBy: { createdAt: 'asc' },
    });
    return list.map((acc) => ({
      id: acc.id,
      tutorId: acc.tutorId,
      bankName: acc.bankName,
      accountHolder: acc.accountHolder,
      accountNumber: acc.accountNumberEncrypted,
      isDefault: acc.isDefault,
    }));
  }

  async addBankAccount(tutorId: string, data: { bankName: string; accountNumber: string; accountHolder: string }) {
    const count = await this.prisma.tutorBankAccount.count({
      where: { tutorId },
    });
    if (count >= 3) {
      throw new Error('Tối đa chỉ được liên kết 3 tài khoản ngân hàng.');
    }
    return this.prisma.tutorBankAccount.create({
      data: {
        tutorId,
        bankName: data.bankName,
        accountNumberEncrypted: data.accountNumber,
        accountHolder: data.accountHolder,
        isDefault: count === 0,
      },
    });
  }

  async deleteBankAccount(tutorId: string, accountId: string) {
    const acc = await this.prisma.tutorBankAccount.findFirst({
      where: { id: accountId, tutorId },
    });
    if (!acc) {
      throw new NotFoundException('Không tìm thấy tài khoản ngân hàng');
    }
    return this.prisma.tutorBankAccount.delete({
      where: { id: accountId },
    });
  }

  async getSchedules(tutorId: string) {
    return this.prisma.tutorSchedule.findMany({
      where: { tutorId },
      orderBy: [{ dayOfWeek: 'asc' }, { slotStart: 'asc' }],
    });
  }

  async updateSchedules(tutorId: string, schedules: { dayOfWeek: number; slotStart: string; slotEnd: string }[]) {
    return this.prisma.$transaction(async (tx) => {
      await tx.tutorSchedule.deleteMany({
        where: { tutorId },
      });

      if (schedules && schedules.length > 0) {
        await tx.tutorSchedule.createMany({
          data: schedules.map((s) => ({
            tutorId,
            dayOfWeek: s.dayOfWeek,
            slotStart: s.slotStart,
            slotEnd: s.slotEnd,
            isActive: true,
          })),
        });
      }

      return tx.tutorSchedule.findMany({
        where: { tutorId },
        orderBy: [{ dayOfWeek: 'asc' }, { slotStart: 'asc' }],
      });
    });
  }

  async updateTutorProfile(
    tutorId: string,
    data: {
      fullName?: string;
      gender?: string;
      dateOfBirth?: string;
      identityNumber?: string;
      occupation?: string;
      qualification?: string;
    },
  ) {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.identityNumber !== undefined) {
      updateData.identityNumber = data.identityNumber;
      updateData.identityNumberHash = crypto.createHash('sha256').update(data.identityNumber).digest('hex');
    }
    if (data.occupation !== undefined) updateData.occupation = data.occupation;
    if (data.qualification !== undefined) updateData.qualification = data.qualification;

    return this.prisma.tutor.update({
      where: { id: tutorId },
      data: updateData,
    });
  }

  async updateParentProfile(
    parentId: string,
    data: {
      fullName?: string;
      address?: string;
      district?: string;
      province?: string;
      newPin?: string;
    },
  ) {
    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.province !== undefined) updateData.province = data.province;


    return this.prisma.parent.update({
      where: { id: parentId },
      data: updateData,
    });
  }

  async getTutorProfile(tutorId: string) {
    return this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });
  }

  async getParentProfile(parentId: string) {
    return this.prisma.parent.findUnique({
      where: { id: parentId },
    });
  }
}

