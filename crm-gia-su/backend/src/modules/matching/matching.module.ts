import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { TutorRequestsController } from './tutor-requests.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [MatchingController, TutorRequestsController],
  providers: [MatchingService, PrismaService],
  exports: [MatchingService],
})
export class MatchingModule {}
