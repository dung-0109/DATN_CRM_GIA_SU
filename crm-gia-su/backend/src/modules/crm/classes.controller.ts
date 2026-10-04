import { Controller, Get, Post, Body, Param, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { CrmService } from './crm.service';
import { PrismaService } from '../../prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, ClassStatus, TransactionType, TransactionStatus } from '@prisma/client';

@Controller('api/v1/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(
    private readonly crmService: CrmService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getClasses(@CurrentUser() user: any) {
    if (user.role === UserRole.PARENT) {
      return this.crmService.getParentClasses(user.profileId);
    }
    if (user.role === UserRole.TUTOR) {
      return this.crmService.getTutorClasses(user.profileId);
    }
    return this.crmService.getAllClasses();
  }

  @Get(':id')
  async getClassDetail(@Param('id') id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id, deletedAt: null },
      include: {
        student: true,
        tutor: { select: { id: true, fullName: true, ratingAvg: true, user: { select: { phone: true, email: true } } } },
        parent: { select: { id: true, fullName: true, address: true, user: { select: { phone: true, email: true } } } },
        tutorRequest: true,
        classSchedules: { where: { deletedAt: null, isActive: true } },
        sessions: {
          where: { deletedAt: null },
          orderBy: { scheduledTime: 'desc' },
        },
      },
    });

    if (!cls) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }
    return cls;
  }

  @Post(':id/trial-resolve')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.ACADEMIC)
  async resolveTrial(
    @Param('id') classId: string,
    @Body() body: { outcome: string; note?: string },
  ) {
    const targetClass = await this.prisma.class.findUnique({
      where: { id: classId },
      include: { tutor: true },
    });

    if (!targetClass) {
      throw new NotFoundException('Không tìm thấy lớp học');
    }

    return this.prisma.$transaction(async (tx) => {
      let newStatus: ClassStatus = ClassStatus.TEACHING;
      let depositAction: TransactionType = TransactionType.FEE_CONFIRMED;

      if (body.outcome === 'SUCCESS') {
        newStatus = ClassStatus.TEACHING;
        depositAction = TransactionType.FEE_CONFIRMED;
      } else if (body.outcome === 'FAIL_REFUND') {
        newStatus = ClassStatus.CLOSED;
        depositAction = TransactionType.DEPOSIT_REFUNDED;
      } else {
        newStatus = ClassStatus.OPEN;
        depositAction = TransactionType.DEPOSIT_REFUNDED;
      }

      const updated = await tx.class.update({
        where: { id: classId },
        data: {
          status: newStatus,
          cancelReason: body.outcome !== 'SUCCESS' ? body.note : null,
          tutorId: newStatus === ClassStatus.OPEN ? null : targetClass.tutorId,
        },
      });

      if (targetClass.tutorId) {
        await tx.transaction.create({
          data: {
            tutorId: targetClass.tutorId,
            classId: targetClass.id,
            type: depositAction,
            amount: 500000,
            status: TransactionStatus.SUCCESSFUL,
            reference: `Xử lý dạy thử: ${body.outcome} - ${body.note || 'Quyết toán hợp đồng'}`,
          },
        });
      }

      return {
        message: body.outcome === 'SUCCESS' ? 'Đã chốt hợp đồng dạy chính thức thành công!' : 'Đã xử lý quyết toán lớp dạy thử.',
        class: updated,
      };
    });
  }

  @Post(':id/schedules')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC, UserRole.TUTOR)
  async setSchedules(
    @Param('id') classId: string,
    @Body() body: { schedules: Array<{ dayOfWeek: number; slotStart: string; slotEnd: string }> },
  ) {
    if (!body.schedules || !Array.isArray(body.schedules)) {
      throw new BadRequestException('Danh sách lịch học không hợp lệ');
    }

    return this.prisma.$transaction(async (tx) => {
      // Deactivate old schedules
      await tx.classSchedule.updateMany({
        where: { classId, deletedAt: null },
        data: { isActive: false, deletedAt: new Date() },
      });

      // Insert new schedules
      const created = await Promise.all(
        body.schedules.map((s) =>
          tx.classSchedule.create({
            data: {
              classId,
              dayOfWeek: s.dayOfWeek,
              slotStart: s.slotStart,
              slotEnd: s.slotEnd,
              isActive: true,
            },
          }),
        ),
      );

      return {
        message: `Đã thiết lập ${created.length} khung giờ học cố định trong tuần.`,
        schedules: created,
      };
    });
  }
}
