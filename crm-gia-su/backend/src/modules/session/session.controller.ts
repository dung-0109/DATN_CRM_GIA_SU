import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  async getSessions(@Query('classId') classId: string) {
    return this.sessionService.getSessionsByClass(classId);
  }

  // API Đánh giá dạy thử (Phụ huynh)
  @Post('class/:classId/trial-review')
  @Roles(UserRole.PARENT)
  async reviewTrial(
    @CurrentUser('profileId') parentId: string,
    @Param('classId') classId: string,
    @Body() dto: any,
  ) {
    return this.sessionService.reviewTrial(parentId, classId, dto);
  }
}
