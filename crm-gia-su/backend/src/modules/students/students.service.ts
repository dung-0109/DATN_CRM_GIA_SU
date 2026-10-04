import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

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
    const student = await this.prisma.student.create({
      data: {
        parentId,
        fullName: dto.fullName,
        gender: dto.gender,
        dateOfBirth: new Date(dto.dateOfBirth),
        school: dto.school || null,
        grade: dto.grade || null,
        subjectsNeeded: dto.subjectsNeeded || null,
        learningStyle: dto.learningStyle || null,
        academicLevel: dto.academicLevel || null,
        targetGoal: dto.targetGoal || null,
        personalityTraits: dto.personalityTraits || null,
        studentEmail: dto.studentEmail || null,
        studentPin: dto.studentPin || null,
        notes: dto.notes || null,
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

    const updated = await this.prisma.student.update({
      where: { id: studentId },
      data: {
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.gender !== undefined && { gender: dto.gender }),
        ...(dto.dateOfBirth !== undefined && {
          dateOfBirth: new Date(dto.dateOfBirth),
        }),
        ...(dto.school !== undefined && { school: dto.school }),
        ...(dto.grade !== undefined && { grade: dto.grade }),
        ...(dto.subjectsNeeded !== undefined && { subjectsNeeded: dto.subjectsNeeded }),
        ...(dto.learningStyle !== undefined && { learningStyle: dto.learningStyle }),
        ...(dto.academicLevel !== undefined && { academicLevel: dto.academicLevel }),
        ...(dto.targetGoal !== undefined && { targetGoal: dto.targetGoal }),
        ...(dto.personalityTraits !== undefined && { personalityTraits: dto.personalityTraits }),
        ...(dto.studentEmail !== undefined && { studentEmail: dto.studentEmail }),
        ...(dto.studentPin !== undefined && { studentPin: dto.studentPin }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
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
