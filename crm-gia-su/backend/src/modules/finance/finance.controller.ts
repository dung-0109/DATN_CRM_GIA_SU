import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { PurchasePackageDto } from './dto/purchase-package.dto';
import { TopupDto } from './dto/topup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // 1. Phụ huynh nạp tiền giả lập vào ví
  @Post('wallet/topup')
  @Roles(UserRole.PARENT)
  async topup(
    @CurrentUser('profileId') parentId: string,
    @Body() dto: TopupDto,
  ) {
    return this.financeService.topup(parentId, dto);
  }

  // 2. Lấy số dư ví (đối chiếu theo role/profileType đang hoạt động)
  @Get('wallet/balance')
  async getBalance(
    @CurrentUser('profileId') profileId: string,
    @CurrentUser('role') role: string,
    @CurrentUser('profileType') profileType: string,
  ) {
    return this.financeService.getBalance(profileId, role, profileType);
  }

  // 3. Phụ huynh mua gói học phí
  @Post('packages/purchase')
  @Roles(UserRole.PARENT)
  async purchasePackage(
    @CurrentUser('profileId') parentId: string,
    @Body() dto: PurchasePackageDto,
  ) {
    return this.financeService.purchasePackage(parentId, dto);
  }

  // 4. Lấy danh sách gói học phí của lớp học
  @Get('classes/:id/packages')
  async getPackages(@Param('id') classId: string) {
    return this.financeService.getPackagesByClass(classId);
  }
}
