import { Controller, Post, Get, Body, Param, UseGuards, Put } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { ApplyRequestDto } from './dto/apply-request.dto';
import { MatchTutorDto } from './dto/match-tutor.dto';
import { ResolveTrialDto } from './dto/resolve-trial.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  // 1. Phụ huynh tạo yêu cầu tìm gia sư
  @Post('tutor-requests')
  @Roles(UserRole.PARENT)
  async createRequest(
    @CurrentUser('profileId') parentId: string,
    @Body() dto: CreateRequestDto,
  ) {
    return this.matchingService.createRequest(parentId, dto);
  }

  // 2. Lấy toàn bộ yêu cầu tìm gia sư (dành cho Gia sư ứng tuyển hoặc Sales xem)
  @Get('tutor-requests')
  async findAllRequests() {
    return this.matchingService.findAllRequests();
  }

  // 3. Gia sư ứng tuyển yêu cầu tìm gia sư
  @Post('tutor-requests/:id/apply')
  @Roles(UserRole.TUTOR)
  async applyRequest(
    @CurrentUser('profileId') tutorId: string,
    @Param('id') requestId: string,
    @Body() dto: ApplyRequestDto,
  ) {
    return this.matchingService.applyRequest(tutorId, requestId, dto);
  }

  // 4. Lấy danh sách gia sư ứng tuyển của một yêu cầu (dành cho Sales duyệt)
  @Get('tutor-requests/:id/applications')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async getApplications(@Param('id') requestId: string) {
    return this.matchingService.getApplicationsForRequest(requestId);
  }

  // 5. Sales khớp lớp dạy thử
  @Post('tutor-requests/:id/match')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async matchTutor(
    @Param('id') requestId: string,
    @Body() dto: MatchTutorDto,
  ) {
    return this.matchingService.matchTutor(requestId, dto);
  }

  // 6. Quyết toán kết quả dạy thử
  @Post('classes/:id/trial-resolve')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async resolveTrial(
    @Param('id') classId: string,
    @Body() dto: ResolveTrialDto,
  ) {
    return this.matchingService.resolveTrial(classId, dto);
  }

  // 7. Sales duyệt trạng thái Yêu cầu (ví dụ: chuyển từ NEW sang PUBLISHED)
  @Put('tutor-requests/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateStatus(
    @Param('id') requestId: string,
    @Body('status') status: any,
  ) {
    return this.matchingService.updateRequestStatus(requestId, status);
  }

  // 8. Lấy danh sách lớp học của active profile (PARENT hoặc TUTOR)
  @Get('classes')
  @Roles(UserRole.PARENT, UserRole.TUTOR)
  async getClasses(
    @CurrentUser('profileId') profileId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    if (role === UserRole.PARENT) {
      return this.matchingService.findClassesByParent(profileId);
    } else {
      return this.matchingService.findClassesByTutor(profileId);
    }
  }
}
