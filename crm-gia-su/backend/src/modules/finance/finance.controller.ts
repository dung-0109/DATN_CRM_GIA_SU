import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { TutorDepositDto } from './dto/deposit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // 1. Gia sư nộp cọc nhận lớp
  @Post('deposit')
  @Roles(UserRole.TUTOR)
  async submitDeposit(
    @CurrentUser('profileId') tutorId: string,
    @Body() dto: TutorDepositDto,
  ) {
    return this.financeService.submitDeposit(tutorId, dto);
  }

  // 2. Kế toán/Học vụ xem lịch sử giao dịch cọc của lớp
  @Get('class/:classId/transactions')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALES, UserRole.ACADEMIC)
  async getClassTransactions(@Param('classId') classId: string) {
    return this.financeService.getClassTransactions(classId);
  }
}
