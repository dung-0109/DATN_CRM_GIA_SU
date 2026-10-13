import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TutorDepositDto } from './dto/deposit.dto';
import { TransactionType, TransactionStatus, ClassStatus, NotificationType, SessionStatus } from '@prisma/client';

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
      // 1. Ghi log giao dịch nộp cọc
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

  // 1. Gia sư rút tiền thù lao về ngân hàng
  async requestWithdrawal(tutorId: string, dto: { amount: number; bankAccountId?: string; notes?: string }) {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        tutorBankAccounts: true,
        user: true,
      },
    });

    if (!tutor) {
      throw new NotFoundException('Không tìm thấy thông tin gia sư');
    }

    const withdrawAmount = Number(dto.amount);
    if (!withdrawAmount || withdrawAmount < 50000) {
      throw new BadRequestException('Số tiền rút tối thiểu là 50,000 đ');
    }

    const currentBalance = Number(tutor.walletBalance);
    if (currentBalance < withdrawAmount) {
      throw new BadRequestException(`Số dư khả dụng (${currentBalance.toLocaleString()} đ) không đủ để rút ${withdrawAmount.toLocaleString()} đ`);
    }

    const targetBank = tutor.tutorBankAccounts.find((b) => b.id === dto.bankAccountId) ||
      tutor.tutorBankAccounts.find((b) => b.isDefault) ||
      tutor.tutorBankAccounts[0];

    const bankDesc = targetBank
      ? `${targetBank.bankName} - ${targetBank.accountNumberEncrypted || 'STK'} (${targetBank.accountHolder})`
      : 'Tài khoản ngân hàng liên kết';

    return this.prisma.$transaction(async (tx) => {
      // Trừ số dư ví gia sư
      const updatedTutor = await tx.tutor.update({
        where: { id: tutorId },
        data: {
          walletBalance: { decrement: withdrawAmount },
        },
      });

      // Ghi nhận Transaction
      const transaction = await tx.transaction.create({
        data: {
          tutorId,
          type: TransactionType.SALARY_WITHDRAWAL,
          amount: withdrawAmount,
          status: TransactionStatus.SUCCESSFUL,
          reference: `Rút thù lao về ${bankDesc}`,
        },
      });

      // Thông báo cho Gia sư
      await tx.notification.create({
        data: {
          userId: tutor.id,
          type: NotificationType.WALLET_UPDATE,
          title: '💸 Rút tiền thù lao thành công',
          content: `Yêu cầu rút ${withdrawAmount.toLocaleString()} đ về ${bankDesc} đã hoàn tất. Số dư ví hiện tại: ${Number(updatedTutor.walletBalance).toLocaleString()} đ.`,
        },
      });

      // Thông báo cho Admin / Kế toán
      const adminUsers = await tx.user.findMany({
        where: { role: { in: ['ADMIN', 'ACCOUNTANT'] }, isActive: true },
        select: { id: true },
      });

      for (const adm of adminUsers) {
        await tx.notification.create({
          data: {
            userId: adm.id,
            type: NotificationType.WALLET_UPDATE,
            title: '💸 [YÊU CẦU RÚT TIỀN] Gia sư rút thù lao',
            content: `Gia sư ${tutor.fullName} vừa rút ${withdrawAmount.toLocaleString()} đ về ${bankDesc}.`,
          },
        });
      }

      return {
        message: `Rút thành công ${withdrawAmount.toLocaleString()} đ về tài khoản ngân hàng.`,
        remainingBalance: Number(updatedTutor.walletBalance),
        transaction,
      };
    });
  }

  // 2. Phụ huynh Tái tục / Gia hạn gói học
  async renewClassPackage(parentId: string, classId: string, dto: { sessionsCount: number; amount: number }) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        parent: true,
        tutor: true,
        student: true,
        classSchedules: true,
        sessions: {
          orderBy: { scheduledTime: 'desc' },
          take: 1,
        },
      },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    if (targetClass.parentId !== parentId) {
      throw new ForbiddenException('Bạn không sở hữu lớp học này');
    }

    if (targetClass.status !== ClassStatus.TEACHING) {
      throw new BadRequestException('Chỉ có thể gia hạn lớp học đang trong giai đoạn chính thức');
    }

    const sessionsToAdd = Number(dto.sessionsCount) || 8;
    const totalPayment = Number(dto.amount) || (sessionsToAdd * Number(targetClass.hourlyRate));

    return this.prisma.$transaction(async (tx) => {
      // 1. Tăng số buổi còn lại của lớp
      const updatedClass = await tx.class.update({
        where: { id: classId },
        data: {
          remainingSessions: { increment: sessionsToAdd },
        },
      });

      // 2. Ghi nhận giao dịch học phí chu kỳ mới
      const transaction = await tx.transaction.create({
        data: {
          parentId,
          classId,
          tutorId: targetClass.tutorId,
          type: TransactionType.FEE_CONFIRMED,
          amount: totalPayment,
          status: TransactionStatus.SUCCESSFUL,
          reference: `Tái tục chu kỳ mới: Gia hạn ${sessionsToAdd} buổi học cho con ${targetClass.student?.fullName || ''}`,
        },
      });

      // 3. Tự động sinh tiếp các buổi học (Sessions) mới trong tương lai
      const lastSessionDate = targetClass.sessions[0]?.scheduledTime
        ? new Date(targetClass.sessions[0].scheduledTime)
        : new Date();

      const activeSchedules = targetClass.classSchedules.filter((s) => s.isActive);
      const scheduleDays = activeSchedules.length > 0
        ? activeSchedules.map((s) => ({
            day: s.dayOfWeek === 8 ? 0 : s.dayOfWeek - 1, // Chuyển đổi 2..8 -> 1..0 (JS getDay())
            start: s.slotStart,
            end: s.slotEnd,
          }))
        : [{ day: 1, start: '18:00', end: '20:00' }, { day: 3, start: '18:00', end: '20:00' }];

      let countCreated = 0;
      let checkDate = new Date(lastSessionDate);
      checkDate.setDate(checkDate.getDate() + 1); // Bắt đầu từ ngày sau buổi cuối

      while (countCreated < sessionsToAdd) {
        const dayOfWeek = checkDate.getDay();
        const matched = scheduleDays.find((s) => s.day === dayOfWeek);

        if (matched) {
          const [startHour, startMin] = matched.start.split(':').map(Number);
          const [endHour, endMin] = matched.end.split(':').map(Number);

          const sessionStart = new Date(checkDate);
          sessionStart.setHours(startHour, startMin, 0, 0);

          const sessionEnd = new Date(checkDate);
          sessionEnd.setHours(endHour, endMin, 0, 0);

          await tx.session.create({
            data: {
              classId,
              scheduledTime: sessionStart,
              actualStart: sessionStart,
              actualEnd: sessionEnd,
              status: SessionStatus.SCHEDULED,
            },
          });
          countCreated++;
        }
        checkDate.setDate(checkDate.getDate() + 1);
      }

      // 4. Thông báo cho Phụ huynh
      await tx.notification.create({
        data: {
          userId: parentId,
          type: NotificationType.CLASS_UPDATE,
          title: '🎉 Tái tục gói học thành công',
          content: `Bạn đã gia hạn thành công gói ${sessionsToAdd} buổi học cho con ${targetClass.student?.fullName}. Tổng số buổi còn lại: ${updatedClass.remainingSessions} buổi.`,
        },
      });

      // 5. Thông báo cho Gia sư
      if (targetClass.tutorId) {
        await tx.notification.create({
          data: {
            userId: targetClass.tutorId,
            type: NotificationType.CLASS_UPDATE,
            title: '✨ Phụ huynh đã gia hạn gói học',
            content: `Phụ huynh của em ${targetClass.student?.fullName} đã gia hạn thêm ${sessionsToAdd} buổi học. Hệ thống đã tự động lên lịch học tiếp theo.`,
          },
        });
      }

      return {
        message: `Đã gia hạn thành công ${sessionsToAdd} buổi học!`,
        remainingSessions: updatedClass.remainingSessions,
        transaction,
      };
    });
  }

  // 3. Phụ huynh Kích hoạt Bảo hành Đổi gia sư 30 ngày
  async requestWarrantyClaim(parentId: string, classId: string, dto: { reason: string; notes?: string }) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: {
        student: true,
        tutor: true,
        parent: true,
      },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    if (targetClass.parentId !== parentId) {
      throw new ForbiddenException('Bạn không sở hữu lớp học này');
    }

    if (targetClass.status !== ClassStatus.TEACHING) {
      throw new BadRequestException('Chính sách bảo hành đổi gia sư chỉ áp dụng cho lớp học chính thức');
    }

    const warrantyTag = `[BẢO HÀNH ĐỔI GIA SƯ 30 NGÀY] Lý do: ${dto.reason}. Ghi chú: ${dto.notes || 'Không có'}`;

    return this.prisma.$transaction(async (tx) => {
      // Đánh dấu vào cancelReason để Admin CRM nhận diện hồ sơ bảo hành
      const updatedClass = await tx.class.update({
        where: { id: classId },
        data: {
          cancelReason: warrantyTag,
        },
      });

      // Tạo thông báo khẩn cấp cho toàn bộ Admin & Học vụ
      const academicStaff = await tx.user.findMany({
        where: { role: { in: ['ADMIN', 'ACADEMIC'] }, isActive: true },
        select: { id: true },
      });

      for (const staff of academicStaff) {
        await tx.notification.create({
          data: {
            userId: staff.id,
            type: NotificationType.DISPUTE_ALERT,
            title: `🛡️ [BẢO HÀNH 30 NGÀY] Yêu cầu đổi gia sư lớp #${classId.slice(0, 8)}`,
            content: `Phụ huynh ${targetClass.parent.fullName} yêu cầu đổi gia sư cho học sinh ${targetClass.student.fullName} (Gia sư hiện tại: ${targetClass.tutor?.fullName || 'Chưa rõ'}). Lý do: ${dto.reason}. Ghi chú: ${dto.notes || 'Không có'}. Số buổi còn lại bảo lưu: ${targetClass.remainingSessions} buổi.`,
          },
        });
      }

      // Thông báo xác nhận cho Phụ huynh
      await tx.notification.create({
        data: {
          userId: parentId,
          type: NotificationType.SYSTEM,
          title: '🛡️ Đã tiếp nhận yêu cầu bảo hành đổi gia sư',
          content: 'Hệ thống đã tiếp nhận yêu cầu bảo hành 30 ngày của bạn. Chuyên viên học vụ sẽ liên hệ trong vòng 24h để gửi hồ sơ 3 gia sư mới thay thế hoàn toàn miễn phí.',
        },
      });

      return {
        message: 'Đã gửi yêu cầu bảo hành đổi gia sư thành công! Chuyên viên học vụ sẽ liên hệ trong 24h.',
        class: updatedClass,
      };
    });
  }

  // 4. Lấy danh sách các yêu cầu bảo hành đổi gia sư (Dành cho Admin / Học vụ CRM)
  async getWarrantyRequests() {
    return this.prisma.class.findMany({
      where: {
        cancelReason: {
          contains: '[BẢO HÀNH ĐỔI GIA SƯ',
        },
      },
      include: {
        student: true,
        tutor: true,
        parent: true,
        tutorRequest: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // 5. Admin CRM Xử lý yêu cầu bảo hành đổi gia sư
  async resolveWarrantyRequest(classId: string, dto: { action: 'REPLACE_TUTOR' | 'DISMISS'; note?: string }) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { parent: true, student: true, tutor: true },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.action === 'REPLACE_TUTOR') {
        // Mở lại lớp để tuyển gia sư mới, bảo lưu số buổi còn lại
        const updated = await tx.class.update({
          where: { id: classId },
          data: {
            tutorId: null,
            status: ClassStatus.OPEN,
            cancelReason: `Đã kích hoạt đổi gia sư mới theo chính sách bảo hành. Bảo lưu ${targetClass.remainingSessions} buổi học. Ghi chú: ${dto.note || ''}`,
          },
        });

        // Xóa các buổi học tương lai chưa diễn ra của gia sư cũ
        await tx.session.deleteMany({
          where: {
            classId,
            status: SessionStatus.SCHEDULED,
          },
        });

        // Thông báo phụ huynh
        await tx.notification.create({
          data: {
            userId: targetClass.parentId,
            type: NotificationType.CLASS_UPDATE,
            title: '✅ Đã phê duyệt đổi gia sư mới',
            content: `Lớp học của con ${targetClass.student.fullName} đã được mở lại tuyển gia sư mới với số buổi bảo lưu là ${targetClass.remainingSessions} buổi. Trung tâm đang gửi các hồ sơ gia sư phù hợp nhất để bạn lựa chọn.`,
          },
        });

        return {
          message: 'Đã phê duyệt đổi gia sư mới, lớp học đã được mở lại để matching gia sư khác!',
          class: updated,
        };
      } else {
        // Hòa giải / Hủy yêu cầu bảo hành
        const updated = await tx.class.update({
          where: { id: classId },
          data: {
            cancelReason: `Đã xử lý hòa giải yêu cầu bảo hành: ${dto.note || 'Tiếp tục học cùng gia sư hiện tại'}`,
          },
        });

        return {
          message: 'Đã xử lý hoàn tất yêu cầu bảo hành.',
          class: updated,
        };
      }
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

