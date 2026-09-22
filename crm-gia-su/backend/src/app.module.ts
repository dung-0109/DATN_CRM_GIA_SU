import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MatchingModule } from './modules/matching/matching.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SessionModule } from './modules/session/session.module';
import { LeaveModule } from './modules/leave/leave.module';
import { CrmModule } from './modules/crm/crm.module';
import { StudentsModule } from './modules/students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    MatchingModule,
    FinanceModule,
    SessionModule,
    LeaveModule,
    CrmModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
