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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // NOTE: Logic match và tạo lớp OPEN sẽ được bổ sung chi tiết theo thuật toán Smart Matching (Phase 2 tiếp theo)
}
