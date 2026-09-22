import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { AttendanceDto } from './dto/attendance.dto';
import { ResolveSessionDto } from './dto/resolve-session.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // 1. Gia sư điểm danh buổi dạy
  @Post('sessions/attendance')
  @Roles(UserRole.TUTOR)
  async attendance(
    @CurrentUser('profileId') tutorId: string,
    @Body() dto: AttendanceDto,
  ) {
    return this.sessionService.attendance(tutorId, dto);
  }

  // 2. Lấy toàn bộ buổi học của một lớp học
  @Get('sessions')
  async getSessions(@Query('classId') classId: string) {
    return this.sessionService.getSessionsByClass(classId);
  }

  // 3. Phụ huynh phê duyệt hoặc khiếu nại buổi học
  @Post('sessions/:id/resolve')
  @Roles(UserRole.PARENT)
  async resolveSession(
    @CurrentUser('profileId') parentId: string,
    @Param('id') sessionId: string,
    @Body() dto: ResolveSessionDto,
  ) {
    return this.sessionService.resolveSession(parentId, sessionId, dto);
  }

  // 4. Học vụ lấy toàn bộ khiếu nại đang chờ xử lý
  @Get('disputes')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  async getDisputes() {
    return this.sessionService.findAllDisputes();
  }

  // 5. Học vụ ra phán quyết khiếu nại
  @Post('disputes/:id/resolve')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  async resolveDispute(
    @Param('id') sessionId: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.sessionService.resolveDispute(sessionId, dto);
  }

  // 6. Học vụ kích hoạt quét tự động duyệt các buổi dạy quá hạn (để test)
  @Post('sessions/trigger-auto-confirm')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  async triggerAutoConfirm() {
    return this.sessionService.runAutoConfirmJob(0);
  }
}
