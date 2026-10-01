import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1/tutor-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TutorRequestsController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post()
  @Roles(UserRole.PARENT)
  async create(
    @CurrentUser('profileId') parentId: string,
    @Body() dto: CreateRequestDto,
  ) {
    return this.matchingService.createRequest(parentId, dto);
  }

  @Get('my')
  @Roles(UserRole.PARENT)
  async getMyRequests(@CurrentUser('profileId') parentId: string) {
    return this.matchingService.findMyRequests(parentId);
  }

  @Put(':id')
  @Roles(UserRole.PARENT)
  async updateRequest(
    @CurrentUser('profileId') parentId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.matchingService.updateRequest(parentId, id, dto);
  }

  @Post(':id/cancel')
  @Roles(UserRole.PARENT)
  async cancelRequest(
    @CurrentUser('profileId') parentId: string,
    @Param('id') id: string,
  ) {
    return this.matchingService.cancelRequest(parentId, id);
  }

  @Post(':id/select-tutor')
  @Roles(UserRole.PARENT)
  async selectTutor(
    @CurrentUser('profileId') parentId: string,
    @Param('id') id: string,
    @Body('tutorId') tutorId: string,
  ) {
    return this.matchingService.selectTutorForParent(parentId, id, tutorId);
  }
}
