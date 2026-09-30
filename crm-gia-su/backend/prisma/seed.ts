import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_PHONE = '0123456789';
const DEMO_PHONES = ['0000000000', '0912345678', '0923456789'];

async function main() {
  console.log('Bắt đầu nạp dữ liệu mẫu (Seeding)...');

  // 1. Xóa dữ liệu nghiệp vụ cũ theo thứ tự ràng buộc khóa ngoại
  //    (GIỮ nguyên tài khoản người dùng tự đăng ký)
  await prisma.transaction.deleteMany();
  await prisma.studentLeave.deleteMany();
  await prisma.tutorLeave.deleteMany();
  await prisma.disputeEvidence.deleteMany();
  await prisma.session.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.classApplication.deleteMany();
  await prisma.class.deleteMany();
  await prisma.tutorRequest.deleteMany();

  const demoTutorUser = await prisma.user.findUnique({
    where: { phone: '0923456789' },
    include: { tutorProfile: true },
  });
  if (demoTutorUser?.tutorProfile) {
    await prisma.tutorSchedule.deleteMany({ where: { tutorId: demoTutorUser.tutorProfile.id } });
    await prisma.tutorSubject.deleteMany({ where: { tutorId: demoTutorUser.tutorProfile.id } });
    await prisma.tutorBankAccount.deleteMany({ where: { tutorId: demoTutorUser.tutorProfile.id } });
  }
  const demoParentUser = await prisma.user.findUnique({
    where: { phone: '0912345678' },
    include: { parentProfile: true },
  });
  if (demoParentUser?.parentProfile) {
    await prisma.student.deleteMany({ where: { parentId: demoParentUser.parentProfile.id } });
  }

  // 2. Xóa các tài khoản mẫu cũ (system + demo PH/GSU) — không còn sử dụng
  const stalePhones = [...DEMO_PHONES];
  await prisma.notification.deleteMany({ where: { user: { phone: { in: stalePhones } } } });
  await prisma.auditLog.deleteMany({ where: { user: { phone: { in: stalePhones } } } });
  await prisma.tutor.deleteMany({ where: { user: { phone: { in: stalePhones } } } });
  await prisma.student.deleteMany({ where: { parent: { user: { phone: { in: stalePhones } } } } });
  await prisma.parent.deleteMany({ where: { user: { phone: { in: stalePhones } } } });
  await prisma.staff.deleteMany({ where: { user: { phone: { in: stalePhones } } } });
  await prisma.user.deleteMany({ where: { phone: { in: stalePhones } } });

  // 3. Tạo lại tài khoản Admin duy nhất
  await prisma.staff.deleteMany({ where: { user: { phone: ADMIN_PHONE } } });
  await prisma.user.deleteMany({ where: { phone: ADMIN_PHONE } });

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const staffUser = await prisma.user.create({
    data: {
      phone: ADMIN_PHONE,
      email: 'admin@trungtamgiasu.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
      staffProfile: {
        create: {
          fullName: 'Trần Văn Quyết (Admin/Học vụ)',
          department: 'ACADEMIC',
          isActive: true,
        },
      },
    },
  });
  console.log(`- Đã tạo tài khoản Admin/Staff: ${staffUser.phone}`);

  console.log('=== Nạp dữ liệu mẫu thành công! (chỉ có tài khoản Admin) ===');
}

main()
  .catch((e) => {
    console.error('Lỗi khi nạp dữ liệu mẫu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
