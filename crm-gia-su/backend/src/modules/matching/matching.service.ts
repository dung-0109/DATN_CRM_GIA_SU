import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RequestStatus, ApplicationStatus, ClassStatus } from '@prisma/client';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  async findAllRequests() {
    return this.prisma.tutorRequest.findMany({
      where: { deletedAt: null, status: RequestStatus.PUBLISHED },
      include: {
        parent: { select: { fullName: true } },
        student: { select: { fullName: true, grade: true } },
        _count: { select: { classApplications: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Thuật toán Smart Matching
  async suggestTutors(requestId: string) {
    const request = await this.prisma.tutorRequest.findUnique({
      where: { id: requestId },
      include: {
        classApplications: {
          include: {
            tutor: {
              include: {
                classes: {
                  include: {
                    sessions: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!request) throw new NotFoundException('Không tìm thấy yêu cầu tìm gia sư');

    // Đánh giá điểm phù hợp (Match Score) cho từng gia sư ứng tuyển
    const scoredTutors = request.classApplications.map(app => {
      const tutor = app.tutor;
      let score = 0;

      // 1. Điểm uy tín Karma (Trọng số cao nhất: Tối đa 100 điểm)
      score += tutor.karmaScore;

      // 2. Điểm học vị / chuyên môn (Tối đa 30 điểm)
      if (tutor.qualification?.toLowerCase().includes('sư phạm') || tutor.qualification?.toLowerCase().includes('giáo viên')) {
        score += 30;
      } else if (tutor.qualification?.toLowerCase().includes('đại học')) {
        score += 15;
      }

      // 3. Phân tích lịch sử dạy học
      const pastClasses = tutor.classes;
      let totalSessions = 0;
      let totalDisputes = 0;

      pastClasses.forEach(c => {
        c.sessions.forEach(s => {
          totalSessions++;
          if (s.status === 'DISPUTED') totalDisputes++;
        });
      });

      // Cộng điểm kinh nghiệm (0.5 điểm mỗi buổi dạy thành công, tối đa 50 điểm)
      const successfulSessions = totalSessions - totalDisputes;
      score += Math.min(successfulSessions * 0.5, 50);

      // Trừ điểm nghiêm trọng nếu có lịch sử bị khiếu nại (Trừ 20 điểm mỗi lần)
      score -= (totalDisputes * 20);

      return {
        applicationId: app.id,
        tutorId: tutor.id,
        tutorName: tutor.fullName,
        qualification: tutor.qualification,
        karmaScore: tutor.karmaScore,
        matchScore: Math.round(score),
        coverLetter: app.coverLetter,
        appliedAt: app.appliedAt,
      };
    });

    // Sắp xếp giảm dần theo Match Score
    return scoredTutors.sort((a, b) => b.matchScore - a.matchScore);
  }

  async assignTutor(requestId: string, tutorId: string) {
    const request = await this.prisma.tutorRequest.findUnique({
      where: { id: requestId },
      include: { classApplications: true }
    });

    if (!request) throw new NotFoundException('Yêu cầu không tồn tại');
    if (request.status !== RequestStatus.PUBLISHED) {
      throw new BadRequestException('Yêu cầu không ở trạng thái đang tuyển');
    }

    const application = request.classApplications.find(a => a.tutorId === tutorId);
    if (!application) {
      throw new BadRequestException('Gia sư này chưa ứng tuyển vào lớp');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Đóng Yêu Cầu Tìm Gia Sư
      await tx.tutorRequest.update({
        where: { id: requestId },
        data: { status: RequestStatus.MATCHED }
      });

      // 2. Chuyển trạng thái ứng tuyển
      await tx.classApplication.updateMany({
        where: { tutorRequestId: requestId },
        data: { status: ApplicationStatus.REJECTED }
      });

      await tx.classApplication.update({
        where: { id: application.id },
        data: { status: ApplicationStatus.SELECTED_FOR_TRIAL }
      });

      // 3. Tạo Lớp Học (Class) ở trạng thái DEPOSIT
      const newClass = await tx.class.create({
        data: {
          tutorRequestId: requestId,
          parentId: request.parentId,
          studentId: request.studentId,
          tutorId: tutorId,
          hourlyRate: request.budgetPerSession,
          tutorWageRate: request.budgetPerSession, // Giả sử thu 100% cho gia sư, trung tâm chỉ lấy cọc
          remainingSessions: request.sessionsPerWeek * 4,
          status: ClassStatus.DEPOSIT,
        }
      });

      return {
        message: 'Khớp lớp thành công. Đang chờ gia sư nộp cọc 500k.',
        class: newClass
      };
    });
  }

  async createRequest(parentId: string, dto: any) {
    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, parentId, deletedAt: null },
    });
    if (!student) {
      throw new BadRequestException('Học sinh không tồn tại hoặc không thuộc quyền quản lý của bạn');
    }

    return this.prisma.tutorRequest.create({
      data: {
        parentId,
        studentId: dto.studentId,
        subject: dto.subject,
        grade: dto.grade,
        scheduleNotes: dto.scheduleNotes,
        sessionsPerWeek: dto.sessionsPerWeek,
        budgetPerSession: dto.budgetPerSession,
        tutorGenderPref: dto.tutorGenderPref,
        learningMode: dto.learningMode || 'OFFLINE',
        address: dto.address,
        tutorTypePref: dto.tutorTypePref || 'ANY',
        requirements: dto.requirements,
        status: RequestStatus.PUBLISHED,
      },
      include: {
        student: { select: { fullName: true, grade: true } },
      },
    });
  }

  async findMyRequests(parentId: string) {
    return this.prisma.tutorRequest.findMany({
      where: { parentId, deletedAt: null },
      include: {
        student: { select: { fullName: true, grade: true } },
        classApplications: {
          include: {
            tutor: {
              select: {
                id: true,
                fullName: true,
                gender: true,
                tutorType: true,
                qualification: true,
                ratingAvg: true,
                karmaScore: true,
              }
            }
          }
        },
        _count: { select: { classApplications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequest(parentId: string, requestId: string, dto: any) {
    const request = await this.prisma.tutorRequest.findFirst({
      where: { id: requestId, parentId, deletedAt: null },
    });
    if (!request) {
      throw new NotFoundException('Yêu cầu không tồn tại hoặc không thuộc quyền quản lý của bạn');
    }
    if (request.status === RequestStatus.MATCHED) {
      throw new BadRequestException('Lớp học đã được ghép gia sư, không thể chỉnh sửa');
    }

    return this.prisma.tutorRequest.update({
      where: { id: requestId },
      data: {
        subject: dto.subject ?? request.subject,
        grade: dto.grade ?? request.grade,
        scheduleNotes: dto.scheduleNotes ?? request.scheduleNotes,
        sessionsPerWeek: dto.sessionsPerWeek ? Number(dto.sessionsPerWeek) : request.sessionsPerWeek,
        budgetPerSession: dto.budgetPerSession ? Number(dto.budgetPerSession) : request.budgetPerSession,
        tutorGenderPref: dto.tutorGenderPref ?? request.tutorGenderPref,
        learningMode: dto.learningMode ?? request.learningMode,
        address: dto.address ?? request.address,
        tutorTypePref: dto.tutorTypePref ?? request.tutorTypePref,
        requirements: dto.requirements ?? request.requirements,
      },
      include: {
        student: { select: { fullName: true, grade: true } },
      },
    });
  }

  async cancelRequest(parentId: string, requestId: string) {
    const request = await this.prisma.tutorRequest.findFirst({
      where: { id: requestId, parentId, deletedAt: null },
    });
    if (!request) {
      throw new NotFoundException('Yêu cầu không tồn tại hoặc không thuộc quyền quản lý của bạn');
    }
    if (request.status === RequestStatus.MATCHED) {
      throw new BadRequestException('Lớp học đã được khớp, vui lòng liên hệ trung tâm để xử lý hủy lớp');
    }

    return this.prisma.tutorRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.CANCELLED,
      },
    });
  }

  async selectTutorForParent(parentId: string, requestId: string, tutorId: string) {
    const request = await this.prisma.tutorRequest.findFirst({
      where: { id: requestId, parentId, deletedAt: null },
    });
    if (!request) {
      throw new NotFoundException('Yêu cầu không tồn tại hoặc không thuộc quyền quản lý của bạn');
    }
    return this.assignTutor(requestId, tutorId);
  }
}
