import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1/matching')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('requests')
  async getAllRequests() {
    return this.matchingService.findAllRequests();
  }

  @Get('requests/:id/suggest')
  @Roles(UserRole.ADMIN)
  async suggestTutors(@Param('id') id: string) {
    return this.matchingService.suggestTutors(id);
  }

  @Post('requests/:id/assign')
  @Roles(UserRole.ADMIN)
  async assignTutor(
    @Param('id') requestId: string,
    @Body('tutorId') tutorId: string
  ) {
    return this.matchingService.assignTutor(requestId, tutorId);
  }
}
