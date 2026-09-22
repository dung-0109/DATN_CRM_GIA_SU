import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RequestTutorLeaveDto } from './dto/request-tutor-leave.dto';
import { RequestStudentLeaveDto } from './dto/request-student-leave.dto';
import { LeaveStatus, SessionStatus } from '@prisma/client';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async requestTutorLeave(tutorId: string, dto: RequestTutorLeaveDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: { class: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    if (session.class.tutorId !== tutorId) {
      throw new ForbiddenException('Bạn không phải Gia sư đảm nhận lớp học này');
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Chỉ có thể xin nghỉ cho buổi học ở trạng thái SCHEDULED');
    }

    // Kiểm tra báo trước 24 giờ
    const requestTime = new Date();
    const sessionTime = new Date(session.scheduledTime);
    const diffHours = (sessionTime.getTime() - requestTime.getTime()) / (1000 * 60 * 60);
    const isLateLeave = diffHours < 24;

    return this.prisma.tutorLeave.create({
      data: {
        sessionId: dto.sessionId,
        tutorId,
        requestTime,
        reason: dto.reason,
        status: LeaveStatus.PENDING,
        rescheduleSuggested: new Date(dto.rescheduleSuggested),
        isLateLeave,
      },
    });
  }

  async approveTutorLeave(parentId: string, leaveId: string) {
    const leave = await this.prisma.tutorLeave.findUnique({
      where: { id: leaveId },
      include: {
        session: {
          include: { class: true },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ của Gia sư');
    }

    if (leave.session.class.parentId !== parentId) {
      throw new ForbiddenException('Lớp học này không thuộc quyền sở hữu của bạn');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Đơn xin nghỉ này đã được xử lý trước đó');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Phê duyệt đơn xin nghỉ
      const updatedLeave = await tx.tutorLeave.update({
        where: { id: leaveId },
        data: {
          status: LeaveStatus.APPROVED,
          parentApprovedAt: new Date(),
        },
      });

      // 2. Chuyển buổi học hiện tại sang trạng thái CANCELLED_BY_TUTOR
      await tx.session.update({
        where: { id: leave.sessionId },
        data: { status: SessionStatus.CANCELLED_BY_TUTOR },
      });

      // 3. Tự động tạo buổi dạy bù mới ở trạng thái SCHEDULED
      if (leave.rescheduleSuggested) {
        await tx.session.create({
          data: {
            classId: leave.session.classId,
            scheduledTime: leave.rescheduleSuggested,
            status: SessionStatus.SCHEDULED,
            tutorNotes: `Dạy bù cho buổi học ngày ${leave.session.scheduledTime.toLocaleDateString()} bị huỷ do Gia sư nghỉ`,
          },
        });
      }

      return {
        message: 'Đã duyệt đơn nghỉ học của Gia sư và tự động lên lịch học bù mới!',
        leave: updatedLeave,
      };
    });
  }

  async requestStudentLeave(parentId: string, dto: RequestStudentLeaveDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: dto.sessionId },
      include: { class: true },
    });

    if (!session) {
      throw new NotFoundException('Không tìm thấy buổi học');
    }

    if (session.class.parentId !== parentId) {
      throw new ForbiddenException('Lớp học này không thuộc quyền quản trị của bạn');
    }

    if (session.status !== SessionStatus.SCHEDULED) {
      throw new BadRequestException('Chỉ có thể xin nghỉ cho buổi học ở trạng thái SCHEDULED');
    }

    // Kiểm tra báo trước 4 giờ
    const requestTime = new Date();
    const sessionTime = new Date(session.scheduledTime);
    const diffHours = (sessionTime.getTime() - requestTime.getTime()) / (1000 * 60 * 60);
    const isLateLeave = diffHours < 4;

    return this.prisma.studentLeave.create({
      data: {
        sessionId: dto.sessionId,
        studentId: session.class.studentId,
        requestTime,
        reason: dto.reason,
        status: LeaveStatus.PENDING,
        parentApproved: true,
        parentApprovedAt: requestTime,
        isLateLeave,
        rescheduledTo: new Date(dto.rescheduledTo),
      },
    });
  }

  async approveStudentLeave(tutorId: string, leaveId: string) {
    const leave = await this.prisma.studentLeave.findUnique({
      where: { id: leaveId },
      include: {
        session: {
          include: { class: true },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException('Không tìm thấy đơn xin nghỉ học của Học sinh');
    }

    if (leave.session.class.tutorId !== tutorId) {
      throw new ForbiddenException('Bạn không phải Gia sư đảm nhận lớp học này');
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Đơn xin nghỉ học này đã được xử lý trước đó');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Phê duyệt đơn xin nghỉ
      const updatedLeave = await tx.studentLeave.update({
        where: { id: leaveId },
        data: { status: LeaveStatus.APPROVED },
      });

      // 2. Chuyển buổi học hiện tại sang trạng thái CANCELLED_BY_STUDENT
      await tx.session.update({
        where: { id: leave.sessionId },
        data: { status: SessionStatus.CANCELLED_BY_STUDENT },
      });

      // 3. Tự động tạo buổi dạy bù mới ở trạng thái SCHEDULED
      if (leave.rescheduledTo) {
        await tx.session.create({
          data: {
            classId: leave.session.classId,
            scheduledTime: leave.rescheduledTo,
            status: SessionStatus.SCHEDULED,
            tutorNotes: `Dạy bù cho buổi học ngày ${leave.session.scheduledTime.toLocaleDateString()} bị huỷ do Học sinh nghỉ`,
          },
        });
      }

      return {
        message: 'Đã phê duyệt lịch học bù của Học sinh thành công!',
        leave: updatedLeave,
      };
    });
  }

  async findAllLeaves(profileId: string, role: string, profileType: string) {
    if (profileType === 'PARENT' || role === 'PARENT') {
      const tutorLeaves = await this.prisma.tutorLeave.findMany({
        where: {
          session: {
            class: { parentId: profileId },
          },
        },
        include: {
          tutor: { select: { fullName: true } },
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const studentLeaves = await this.prisma.studentLeave.findMany({
        where: {
          session: {
            class: { parentId: profileId },
          },
        },
        include: {
          student: { select: { fullName: true } },
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return { tutorLeaves, studentLeaves };
    }

    if (profileType === 'TUTOR' || role === 'TUTOR') {
      const tutorLeaves = await this.prisma.tutorLeave.findMany({
        where: { tutorId: profileId },
        include: {
          tutor: { select: { fullName: true } },
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const studentLeaves = await this.prisma.studentLeave.findMany({
        where: {
          session: {
            class: { tutorId: profileId },
          },
        },
        include: {
          student: { select: { fullName: true } },
          session: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return { tutorLeaves, studentLeaves };
    }

    return { tutorLeaves: [], studentLeaves: [] };
  }
}
