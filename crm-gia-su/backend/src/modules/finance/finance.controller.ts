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

  // 2. Gia sư yêu cầu rút tiền thù lao về ngân hàng
  @Post('tutor/withdraw')
  @Roles(UserRole.TUTOR)
  async requestWithdrawal(
    @CurrentUser('profileId') tutorId: string,
    @Body() dto: { amount: number; bankAccountId?: string; notes?: string },
  ) {
    return this.financeService.requestWithdrawal(tutorId, dto);
  }

  // 3. Phụ huynh Tái tục / Gia hạn gói học (Nạp thêm buổi)
  @Post('class/:classId/renew')
  @Roles(UserRole.PARENT)
  async renewClassPackage(
    @CurrentUser('profileId') parentId: string,
    @Param('classId') classId: string,
    @Body() dto: { sessionsCount: number; amount: number },
  ) {
    return this.financeService.renewClassPackage(parentId, classId, dto);
  }

  // 4. Phụ huynh Kích hoạt Bảo hành Đổi gia sư 30 ngày
  @Post('class/:classId/warranty-claim')
  @Roles(UserRole.PARENT)
  async requestWarrantyClaim(
    @CurrentUser('profileId') parentId: string,
    @Param('classId') classId: string,
    @Body() dto: { reason: string; notes?: string },
  ) {
    return this.financeService.requestWarrantyClaim(parentId, classId, dto);
  }

  // 5. Admin CRM Lấy danh sách yêu cầu bảo hành đổi gia sư
  @Get('warranty-requests')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC, UserRole.SALES)
  async getWarrantyRequests() {
    return this.financeService.getWarrantyRequests();
  }

  // 6. Admin CRM Xử lý yêu cầu bảo hành đổi gia sư
  @Post('class/:classId/resolve-warranty')
  @Roles(UserRole.ADMIN, UserRole.ACADEMIC)
  async resolveWarrantyRequest(
    @Param('classId') classId: string,
    @Body() dto: { action: 'REPLACE_TUTOR' | 'DISMISS'; note?: string },
  ) {
    return this.financeService.resolveWarrantyRequest(classId, dto);
  }

  // 7. Kế toán/Học vụ xem lịch sử giao dịch cọc của lớp
  @Get('class/:classId/transactions')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.SALES, UserRole.ACADEMIC)
  async getClassTransactions(@Param('classId') classId: string) {
    return this.financeService.getClassTransactions(classId);
  }

  // 8. Gia sư xem lịch sử giao dịch của mình
  @Get('tutor/transactions')
  @Roles(UserRole.TUTOR)
  async getTutorTransactions(@CurrentUser('profileId') tutorId: string) {
    return this.financeService.getTutorTransactions(tutorId);
  }
}

