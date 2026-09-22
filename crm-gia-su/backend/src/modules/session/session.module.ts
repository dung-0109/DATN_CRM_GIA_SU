import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { FinanceModule } from '../finance/finance.module';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [FinanceModule],
  controllers: [SessionController],
  providers: [SessionService, PrismaService],
  exports: [SessionService],
})
export class SessionModule {}
