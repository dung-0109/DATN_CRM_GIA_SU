import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { RequestTutorLeaveDto } from './dto/request-tutor-leave.dto';
import { RequestStudentLeaveDto } from './dto/request-student-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // 1. Gia sư báo nghỉ học
  @Post('leaves/tutor')
  @Roles(UserRole.TUTOR)
  async requestTutorLeave(
    @CurrentUser('profileId') tutorId: string,
    @Body() dto: RequestTutorLeaveDto,
  ) {
    return this.leaveService.requestTutorLeave(tutorId, dto);
  }

  // 2. Phụ huynh phê duyệt đơn báo nghỉ và lịch học bù đề xuất của Gia sư
  @Post('leaves/tutor/:id/approve')
  @Roles(UserRole.PARENT)
  async approveTutorLeave(
    @CurrentUser('profileId') parentId: string,
    @Param('id') leaveId: string,
  ) {
    return this.leaveService.approveTutorLeave(parentId, leaveId);
  }

  // 3. Học sinh/Phụ huynh báo nghỉ học
  @Post('leaves/student')
  @Roles(UserRole.PARENT)
  async requestStudentLeave(
    @CurrentUser('profileId') parentId: string,
    @Body() dto: RequestStudentLeaveDto,
  ) {
    return this.leaveService.requestStudentLeave(parentId, dto);
  }

  // 4. Gia sư phê duyệt chốt lịch dạy bù đề xuất của Học sinh
  @Post('leaves/student/:id/approve')
  @Roles(UserRole.TUTOR)
  async approveStudentLeave(
    @CurrentUser('profileId') tutorId: string,
    @Param('id') leaveId: string,
  ) {
    return this.leaveService.approveStudentLeave(tutorId, leaveId);
  }

  // 5. Lấy danh sách đơn nghỉ của active profile
  @Get('leaves')
  async findAllLeaves(
    @CurrentUser('profileId') profileId: string,
    @CurrentUser('role') role: string,
    @CurrentUser('profileType') profileType: string,
  ) {
    return this.leaveService.findAllLeaves(profileId, role, profileType);
  }
}
