import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/v1/students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // Danh sách con của phụ huynh
  @Get()
  @Roles(UserRole.PARENT)
  async findAll(@CurrentUser('profileId') parentId: string) {
    return this.studentsService.findAll(parentId);
  }

  // Thêm con
  @Post()
  @Roles(UserRole.PARENT)
  async create(
    @CurrentUser('profileId') parentId: string,
    @Body() dto: CreateStudentDto,
  ) {
    return this.studentsService.create(parentId, dto);
  }

  // Cập nhật thông tin con
  @Put(':id')
  @Roles(UserRole.PARENT)
  async update(
    @CurrentUser('profileId') parentId: string,
    @Param('id') studentId: string,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.studentsService.update(parentId, studentId, dto);
  }

  // Xóa hồ sơ con (xóa mềm)
  @Delete(':id')
  @Roles(UserRole.PARENT)
  async remove(
    @CurrentUser('profileId') parentId: string,
    @Param('id') studentId: string,
  ) {
    return this.studentsService.remove(parentId, studentId);
  }
}
