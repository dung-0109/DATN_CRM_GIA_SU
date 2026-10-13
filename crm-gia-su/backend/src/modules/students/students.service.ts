import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  private validateStudentData(fullName?: string, dateOfBirth?: string) {
    if (fullName !== undefined) {
      const trimmed = fullName.trim();
      if (!trimmed) {
        throw new BadRequestException('Họ tên học sinh không được để trống hoặc chỉ chứa khoảng trắng');
      }
      if (trimmed.length > 100) {
        throw new BadRequestException('Họ tên học sinh tối đa 100 ký tự');
      }
    }

    if (dateOfBirth !== undefined) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        throw new BadRequestException('Ngày sinh không hợp lệ');
      }
      const now = new Date();
      if (dob > now) {
        throw new BadRequestException('Ngày sinh không được ở tương lai');
      }
      let age = now.getFullYear() - dob.getFullYear();
      const m = now.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 4 || age > 25) {
        throw new BadRequestException('Độ tuổi hợp lệ của học sinh là từ 4 đến 25 tuổi');
      }
    }
  }

  // Danh sách con của phụ huynh (loại bỏ bản ghi đã xóa mềm)
  async findAll(parentId: string) {
    return this.prisma.student.findMany({
      where: { parentId, deletedAt: null },
      include: {
        classes: {
          where: { status: { in: ['TRIAL', 'TEACHING'] }, deletedAt: null },
          include: { tutorRequest: { select: { subject: true } } }
        },
        tutorRequests: {
          where: { status: { in: ['NEW', 'CONSULTING', 'PUBLISHED'] }, deletedAt: null }
        }
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(parentId: string, dto: CreateStudentDto) {
    this.validateStudentData(dto.fullName, dto.dateOfBirth);

    const student = await this.prisma.student.create({
      data: {
        parentId,
        fullName: dto.fullName.trim(),
        gender: dto.gender,
        dateOfBirth: new Date(dto.dateOfBirth),
        school: dto.school?.trim() || null,
        grade: dto.grade?.trim() || null,
        subjectsNeeded: dto.subjectsNeeded?.trim() || null,
        learningStyle: dto.learningStyle?.trim() || null,
        academicLevel: dto.academicLevel || null,
        targetGoal: dto.targetGoal?.trim() || null,
        personalityTraits: dto.personalityTraits?.trim() || null,
        studentEmail: dto.studentEmail?.trim() || null,
        studentPin: dto.studentPin?.trim() || null,
        notes: dto.notes?.trim() || null,
      },
    });
    return { message: 'Đã thêm hồ sơ học sinh thành công', student };
  }

  async update(parentId: string, studentId: string, dto: UpdateStudentDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.deletedAt) {
      throw new NotFoundException('Không tìm thấy hồ sơ học sinh');
    }
    if (student.parentId !== parentId) {
      throw new ForbiddenException('Bạn không có quyền sửa hồ sơ học sinh này');
    }

    this.validateStudentData(dto.fullName, dto.dateOfBirth);

    const updated = await this.prisma.student.update({
      where: { id: studentId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName.trim() }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.dateOfBirth !== undefined && {
          dateOfBirth: new Date(dto.dateOfBirth),
        }),
        ...(dto.school !== undefined && { school: dto.school?.trim() || null }),
        ...(dto.grade !== undefined && { grade: dto.grade?.trim() || null }),
        ...(dto.subjectsNeeded !== undefined && { subjectsNeeded: dto.subjectsNeeded?.trim() || null }),
        ...(dto.learningStyle !== undefined && { learningStyle: dto.learningStyle?.trim() || null }),
        ...(dto.academicLevel !== undefined && { academicLevel: dto.academicLevel || null }),
        ...(dto.targetGoal !== undefined && { targetGoal: dto.targetGoal?.trim() || null }),
        ...(dto.personalityTraits !== undefined && { personalityTraits: dto.personalityTraits?.trim() || null }),
        ...(dto.studentEmail !== undefined && { studentEmail: dto.studentEmail?.trim() || null }),
        ...(dto.studentPin !== undefined && { studentPin: dto.studentPin?.trim() || null }),
        ...(dto.notes !== undefined && { notes: dto.notes?.trim() || null }),
      },
    });
    return { message: 'Cập nhật hồ sơ học sinh thành công', student: updated };
  }

  // Xóa mềm theo thiết kế schema (deletedAt + deletedBy)
  async remove(parentId: string, studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student || student.deletedAt) {
      throw new NotFoundException('Không tìm thấy hồ sơ học sinh');
    }
    if (student.parentId !== parentId) {
      throw new ForbiddenException('Bạn không có quyền xóa hồ sơ học sinh này');
    }

    await this.prisma.student.update({
      where: { id: studentId },
      data: { deletedAt: new Date(), deletedBy: parentId },
    });
    return { message: 'Đã xóa hồ sơ học sinh' };
  }
}
