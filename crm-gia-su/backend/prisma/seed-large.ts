import { PrismaClient, UserRole, ClassStatus, RequestStatus, TutorType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu nạp 100 dữ liệu mẫu lớn...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  // Mảng tên ngẫu nhiên
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi'];
  const middleNames = ['Văn', 'Thị', 'Hoàng', 'Minh', 'Ngọc', 'Quốc', 'Thanh', 'Đức', 'Gia'];
  const firstNames = ['Anh', 'Bình', 'Cường', 'Dương', 'Dũng', 'Giang', 'Hải', 'Hòa', 'Khoa', 'Linh', 'Minh', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Tùng', 'Uyên', 'Vinh', 'Vy', 'Yến'];
  const subjects = ['Toán', 'Lý', 'Hóa', 'Văn', 'Tiếng Anh', 'Sinh', 'Lịch Sử', 'Địa Lý', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Trung'];
  
  function randomName() {
    return `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${middleNames[Math.floor(Math.random() * middleNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
  }

  function randomPhone() {
    return '09' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  }

  // Tạo 100 Phụ huynh
  const parents: any[] = [];
  console.log('Đang tạo 100 Phụ huynh...');
  for (let i = 0; i < 100; i++) {
    const parent = await prisma.user.create({
      data: {
        phone: randomPhone() + `p${i}`, // Đảm bảo unique
        passwordHash,
        role: UserRole.PARENT,
        parentProfile: {
          create: {
            fullName: randomName(),
            address: `Số ${i + 1} Đường Hùng Vương`,
            district: 'Quận 1',
            province: 'TP Hồ Chí Minh',
            contactTimePref: 'ANYTIME',
          }
        }
      },
      include: { parentProfile: true }
    });
    parents.push(parent);
  }

  // Tạo 100 Học sinh
  console.log('Đang tạo 100 Học sinh...');
  const students: any[] = [];
  for (let i = 0; i < 100; i++) {
    const student = await prisma.student.create({
      data: {
        parentId: parents[i].parentProfile!.id,
        fullName: randomName(),
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        dateOfBirth: new Date(2010, 1, 1),
        grade: `${(i % 12) + 1}`,
        academicLevel: 'AVERAGE',
      }
    });
    students.push(student);
  }

  // Tạo 100 Gia sư
  const tutors: any[] = [];
  console.log('Đang tạo 100 Gia sư...');
  for (let i = 0; i < 100; i++) {
    const tutor = await prisma.user.create({
      data: {
        phone: randomPhone() + `t${i}`,
        passwordHash,
        role: UserRole.TUTOR,
        tutorProfile: {
          create: {
            fullName: randomName(),
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            dateOfBirth: new Date(1995, 1, 1),
            identityNumber: `ID${i}123456`,
            identityNumberHash: crypto.createHash('sha256').update(`ID${i}123456`).digest('hex'),
            occupation: 'Sinh viên',
            qualification: 'Đại học',
            tutorType: TutorType.STUDENT,
            status: 'ACTIVE',
            walletBalance: i % 3 === 0 ? Math.floor(Math.random() * 500) * 10000 : 0, // Random lương
            ratingAvg: 4.5 + Math.random() * 0.5,
          }
        }
      },
      include: { tutorProfile: true }
    });
    tutors.push(tutor);
  }

  // Tạo 100 Yêu cầu tìm gia sư
  console.log('Đang tạo 100 Yêu cầu & Lớp học...');
  for (let i = 0; i < 100; i++) {
    const reqStatus = i < 20 ? RequestStatus.NEW : i < 40 ? RequestStatus.PUBLISHED : RequestStatus.MATCHED;
    
    const request = await prisma.tutorRequest.create({
      data: {
        parentId: parents[i].parentProfile!.id,
        studentId: students[i].id,
        subject: subjects[i % subjects.length],
        grade: students[i].grade!,
        scheduleNotes: 'Tối thứ 2, 4, 6',
        sessionsPerWeek: 3,
        budgetPerSession: 150000 + (Math.floor(Math.random() * 10) * 10000),
        tutorGenderPref: 'ANY',
        learningMode: i % 2 === 0 ? 'OFFLINE' : 'ONLINE',
        address: parents[i].parentProfile!.address,
        status: reqStatus,
      }
    });

    if (reqStatus === RequestStatus.MATCHED) {
      const clsStatus = i < 60 ? ClassStatus.DEPOSIT : i < 80 ? ClassStatus.TRIAL : ClassStatus.TEACHING;
      await prisma.class.create({
        data: {
          tutorRequestId: request.id,
          tutorId: tutors[i].tutorProfile!.id,
          parentId: parents[i].parentProfile!.id,
          studentId: students[i].id,
          hourlyRate: request.budgetPerSession,
          tutorWageRate: Number(request.budgetPerSession) * 0.8,
          status: clsStatus,
        }
      });
    }
  }

  console.log('Hoàn tất nạp dữ liệu lớn!');
}

main()
  .catch((e) => {
    console.error('Lỗi khi nạp dữ liệu mẫu lớn:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
