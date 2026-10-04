import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1/crm')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  // Lấy số liệu tổng quan dashboard (Admin, Sales, Học vụ)
  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.ACADEMIC)
  async getDashboardStats() {
    return this.crmService.getDashboardStats();
  }

  // 1. Lấy danh sách Gia sư (Sales, Học vụ, Admin)
  @Get('tutors')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.ACADEMIC)
  async getAllTutors() {
    return this.crmService.getAllTutors();
  }

  // Lấy danh sách Phụ huynh (Admin, Sales, Học vụ)
  @Get('parents')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.ACADEMIC)
  async getAllParents() {
    return this.crmService.getAllParents();
  }

  // 2. Cập nhật trạng thái Gia sư: ACTIVE, BANNED, PENDING_REVIEW (Admin, Sales)
  @Post('tutors/:id/status')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  async updateTutorStatus(
    @Param('id') tutorId: string,
    @Body('status') status: string,
  ) {
    return this.crmService.updateTutorStatus(tutorId, status);
  }

  // 3. Lấy danh sách lớp học tổng quan (Tất cả nhân viên)
  @Get('classes')
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.ACADEMIC, UserRole.ACCOUNTANT)
  async getAllClasses() {
    return this.crmService.getAllClasses();
  }

  // 4. Kế toán/Admin quyết toán ví tiền của gia sư về 0 (duyệt chuyển khoản lương)
  @Post('tutors/:id/payout')
  @Roles(UserRole.ADMIN, UserRole.ACCOUNTANT)
  async payoutTutor(@Param('id') tutorId: string) {
    return this.crmService.payoutTutor(tutorId);
  }

  // 5. Ngân hàng Gia sư (TUTOR role)
  @Get('tutor/bank-accounts')
  @Roles(UserRole.TUTOR)
  async getBankAccounts(@CurrentUser('profileId') tutorId: string) {
    return this.crmService.getBankAccounts(tutorId);
  }

  @Post('tutor/bank-accounts')
  @Roles(UserRole.TUTOR)
  async addBankAccount(
    @CurrentUser('profileId') tutorId: string,
    @Body() body: { bankName: string; accountNumber: string; accountHolder: string },
  ) {
    return this.crmService.addBankAccount(tutorId, body);
  }

  @Delete('tutor/bank-accounts/:id')
  @Roles(UserRole.TUTOR)
  async deleteBankAccount(
    @CurrentUser('profileId') tutorId: string,
    @Param('id') accountId: string,
  ) {
    return this.crmService.deleteBankAccount(tutorId, accountId);
  }

  // 6. Lịch rảnh Gia sư (TUTOR role)
  @Get('tutor/schedules')
  @Roles(UserRole.TUTOR)
  async getSchedules(@CurrentUser('profileId') tutorId: string) {
    return this.crmService.getSchedules(tutorId);
  }

  @Post('tutor/schedules')
  @Roles(UserRole.TUTOR)
  async updateSchedules(
    @CurrentUser('profileId') tutorId: string,
    @Body('schedules') schedules: { dayOfWeek: number; slotStart: string; slotEnd: string }[],
  ) {
    return this.crmService.updateSchedules(tutorId, schedules);
  }

  // 7. Cập nhật hồ sơ cá nhân Gia sư
  @Post('tutor/profile')
  @Roles(UserRole.TUTOR)
  async updateTutorProfile(
    @CurrentUser('profileId') tutorId: string,
    @Body() body: any,
  ) {
    return this.crmService.updateTutorProfile(tutorId, body);
  }

  // 8. Cập nhật hồ sơ cá nhân Phụ huynh
  @Post('parent/profile')
  @Roles(UserRole.PARENT)
  async updateParentProfile(
    @CurrentUser('profileId') parentId: string,
    @Body() body: any,
  ) {
    return this.crmService.updateParentProfile(parentId, body);
  }

  // 9. Lấy hồ sơ cá nhân Gia sư
  @Get('tutor/profile')
  @Roles(UserRole.TUTOR)
  async getTutorProfile(@CurrentUser('profileId') tutorId: string) {
    return this.crmService.getTutorProfile(tutorId);
  }

  // 10. Lấy hồ sơ cá nhân Phụ huynh
  @Get('parent/profile')
  @Roles(UserRole.PARENT)
  async getParentProfile(@CurrentUser('profileId') parentId: string) {
    return this.crmService.getParentProfile(parentId);
  }

  // 11. Thống kê số liệu cho Phụ huynh
  @Get('parent/stats')
  @Roles(UserRole.PARENT)
  async getParentStats(@CurrentUser('profileId') parentId: string) {
    return this.crmService.getParentStats(parentId);
  }

  // 12. Lấy danh sách lớp học của Phụ huynh
  @Get('parent/classes')
  @Roles(UserRole.PARENT)
  async getParentClasses(@CurrentUser('profileId') parentId: string) {
    return this.crmService.getParentClasses(parentId);
  }

  // 13. Lấy danh sách lớp học của Gia sư
  @Get('tutor/classes')
  @Roles(UserRole.TUTOR)
  async getTutorClasses(@CurrentUser('profileId') tutorId: string) {
    return this.crmService.getTutorClasses(tutorId);
  }

  // 14. Lấy danh sách đánh giá của Gia sư
  @Get('tutor/reviews')
  @Roles(UserRole.TUTOR)
  async getTutorReviews(@CurrentUser('profileId') tutorId: string) {
    return this.crmService.getTutorReviews(tutorId);
  }
}

