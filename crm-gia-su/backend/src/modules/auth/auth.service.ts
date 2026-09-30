import { Injectable, BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ProfileSwitchDto } from './dto/profile-switch.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: loginDto.phone },
      include: {
        parentProfile: true,
        tutorProfile: true,
        staffProfile: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Số điện thoại hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new BadRequestException('Tài khoản chưa được kích hoạt qua OTP');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Số điện thoại hoặc mật khẩu không chính xác');
    }

    // Lấy các profile khả dụng để hiển thị ở frontend
    const profiles = await this.buildProfilesPayload(user);

    // Tạo token tạm thời (chưa trỏ đến profile cụ thể)
    const payload = { sub: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Đăng nhập thành công',
      accessToken: token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      profiles,
    };
  }

  // Xây danh sách profile khả dụng của tài khoản (dùng cho login)
  private async buildProfilesPayload(user: any) {
    const profiles: any[] = [];

    if (user.role === UserRole.PARENT && user.parentProfile) {
      profiles.push({
        id: user.parentProfile.id,
        name: user.parentProfile.fullName + ' (Phụ huynh)',
        type: UserRole.PARENT,
      });

      // Lấy danh sách học sinh (con)
      const students = await this.prisma.student.findMany({
        where: { parentId: user.parentProfile.id },
      });

      students.forEach((s) => {
        profiles.push({
          id: s.id,
          name: s.fullName + ' (Học sinh)',
          type: UserRole.PARENT, // Gốc vẫn là tài khoản PARENT
          subType: 'STUDENT',    // Ngữ cảnh con
        });
      });
    } else if (user.role === UserRole.TUTOR && user.tutorProfile) {
      profiles.push({
        id: user.tutorProfile.id,
        name: user.tutorProfile.fullName + ' (Gia sư)',
        type: UserRole.TUTOR,
      });
    } else if (user.staffProfile) {
      profiles.push({
        id: user.staffProfile.id,
        name: user.staffProfile.fullName,
        type: user.role,
      });
    }

    return profiles;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone },
    });

    if (existingUser) {
      throw new BadRequestException('Số điện thoại này đã được đăng ký');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        phone: registerDto.phone,
        fullName: registerDto.fullName,
        passwordHash: hashedPassword,
        role: registerDto.role,
        isActive: true,
      },
    });

    const defaultPinHash = await bcrypt.hash('1234', 10);

    // Tự động tạo Profile tương ứng với Role ngay khi đăng ký
    if (registerDto.role === UserRole.PARENT) {
      await this.prisma.parent.create({
        data: {
          id: user.id,
          fullName: registerDto.fullName || 'Phụ huynh chưa đặt tên',
          address: 'Chưa cập nhật',
          district: 'Chưa cập nhật',
          province: 'Chưa cập nhật',
        },
      });
      console.log(`[PROFILE SYSTEM] Đã tự động tạo Parent profile cho user ID: ${user.id}`);
    } else if (registerDto.role === UserRole.TUTOR) {
      const uniqueSuffix = Date.now().toString().slice(-4);
      await this.prisma.tutor.create({
        data: {
          id: user.id,
          fullName: registerDto.fullName || 'Gia sư chưa đặt tên',
          gender: 'Chưa rõ',
          dateOfBirth: new Date('2000-01-01'),
          identityNumber: 'Chưa cập nhật',
          identityNumberHash: 'DEFAULT_HASH_' + uniqueSuffix,
          occupation: 'Chưa cập nhật',
          qualification: 'Chưa cập nhật',
          status: 'PENDING_REVIEW',
        },
      });
      console.log(`[PROFILE SYSTEM] Đã tự động tạo Tutor profile cho user ID: ${user.id}`);
    }

    return {
      message: 'Đăng ký thành công. Tài khoản của bạn đã sẵn sàng để đăng nhập.',
      phone: user.phone,
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: verifyOtpDto.phone },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản để kích hoạt');
    }

    if (user.isActive) {
      return { message: 'Tài khoản đã được kích hoạt trước đó.' };
    }

    if (verifyOtpDto.otp !== '123456') {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    // Kích hoạt tài khoản
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { isActive: true },
    });

    const defaultPinHash = await bcrypt.hash('1234', 10);

    // Tự động tạo Profile mặc định tương ứng với Role (dùng tên đã đăng ký)
    if (updatedUser.role === UserRole.PARENT) {
      await this.prisma.parent.create({
        data: {
          id: updatedUser.id,
          fullName: updatedUser.fullName || 'Phụ huynh chưa đặt tên',
          address: 'Chưa cập nhật',
          district: 'Chưa cập nhật',
          province: 'Chưa cập nhật',
        },
      });
      console.log(`[PROFILE SYSTEM] Đã tự động tạo Parent profile cho user ID: ${updatedUser.id}`);
    } else if (updatedUser.role === UserRole.TUTOR) {
      const uniqueSuffix = Date.now().toString().slice(-4);
      await this.prisma.tutor.create({
        data: {
          id: updatedUser.id,
          fullName: updatedUser.fullName || 'Gia sư chưa đặt tên',
          gender: 'Chưa rõ',
          dateOfBirth: new Date('2000-01-01'),
          identityNumber: 'Chưa cập nhật',
          identityNumberHash: 'DEFAULT_HASH_' + uniqueSuffix,
          occupation: 'Chưa cập nhật',
          qualification: 'Chưa cập nhật',
          status: 'PENDING_REVIEW',
        },
      });
      console.log(`[PROFILE SYSTEM] Đã tự động tạo Tutor profile cho user ID: ${updatedUser.id}`);
    }

    return {
      message: 'Kích hoạt tài khoản thành công! Mã PIN Phụ huynh mặc định là 1234. Vui lòng đăng nhập.',
    };
  }

  // Yêu cầu đặt lại mật khẩu - gửi OTP (mock 123456 như đăng ký)
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: forgotPasswordDto.phone },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với số điện thoại này');
    }

    console.log(`[OTP SERVICE] Mã OTP đặt lại mật khẩu cho ${forgotPasswordDto.phone}: 123456`);

    return {
      message: 'Đã gửi mã OTP đặt lại mật khẩu. Nhập mã OTP 123456 để tiếp tục.',
      phone: user.phone,
    };
  }

  // Xác thực OTP và cập nhật mật khẩu mới
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: resetPasswordDto.phone },
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với số điện thoại này');
    }

    if (resetPasswordDto.otp !== '123456') {
      throw new BadRequestException('Mã OTP không chính xác');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    return {
      message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
    };
  }

  async profileSwitch(userId: string, currentRole: UserRole, dto: ProfileSwitchDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy tài khoản người dùng');
    }

    // 1. Chuyển đổi sang Profile PHỤ HUYNH
    if (dto.profileType === UserRole.PARENT) {
      if (user.role !== UserRole.PARENT) {
        throw new ForbiddenException('Tài khoản này không sở hữu profile Phụ huynh');
      }

      const parent = await this.prisma.parent.findUnique({
        where: { id: dto.profileId },
      });

      if (!parent || parent.id !== userId) {
        throw new ForbiddenException('Profile Phụ huynh không hợp lệ hoặc không thuộc về bạn');
      }

      // Tạo JWT chứa profile_type = PARENT
      const payload = {
        sub: user.id,
        role: user.role,
        profileId: parent.id,
        profileType: UserRole.PARENT,
      };

      const token = await this.jwtService.signAsync(payload);
      return {
        message: 'Chuyển sang profile Phụ huynh thành công',
        accessToken: token,
        profile: {
          id: parent.id,
          name: parent.fullName,
          type: UserRole.PARENT,
        },
      };
    }

    // 2. Chuyển đổi sang Profile HỌC SINH (Profile con dưới trướng Phụ huynh)
    if (dto.profileType === 'STUDENT') {
      if (user.role !== UserRole.PARENT) {
        throw new ForbiddenException('Chỉ tài khoản Phụ huynh mới có thể đổi sang Profile con Học sinh');
      }

      const parent = await this.prisma.parent.findUnique({
        where: { id: userId },
      });

      if (!parent) {
        throw new ForbiddenException('Không tìm thấy profile phụ huynh quản lý');
      }

      const student = await this.prisma.student.findFirst({
        where: {
          id: dto.profileId,
          parentId: parent.id,
        },
      });

      if (!student) {
        throw new ForbiddenException('Học sinh không thuộc tài khoản Phụ huynh này');
      }

      // Tạo JWT chứa profile_type = STUDENT (Không cần mã PIN)
      const payload = {
        sub: user.id,
        role: user.role,
        profileId: student.id,
        profileType: 'STUDENT',
      };

      const token = await this.jwtService.signAsync(payload);
      return {
        message: 'Chuyển sang profile Học sinh thành công',
        accessToken: token,
        profile: {
          id: student.id,
          name: student.fullName,
          type: 'STUDENT',
        },
      };
    }

    // 3. Chuyển đổi sang Profile GIA SƯ
    if (dto.profileType === UserRole.TUTOR) {
      if (user.role !== UserRole.TUTOR) {
        throw new ForbiddenException('Tài khoản này không sở hữu profile Gia sư');
      }

      const tutor = await this.prisma.tutor.findUnique({
        where: { id: dto.profileId },
      });

      if (!tutor || tutor.id !== userId) {
        throw new ForbiddenException('Profile Gia sư không hợp lệ hoặc không thuộc về bạn');
      }

      const payload = {
        sub: user.id,
        role: user.role,
        profileId: tutor.id,
        profileType: UserRole.TUTOR,
      };

      const token = await this.jwtService.signAsync(payload);
      return {
        message: 'Chuyển sang profile Gia sư thành công',
        accessToken: token,
        profile: {
          id: tutor.id,
          name: tutor.fullName,
          type: UserRole.TUTOR,
        },
      };
    }

    // 4. Chuyển đổi sang các vai trò ADMIN/STAFF
    if (['ADMIN', 'SALES', 'ACADEMIC', 'ACCOUNTANT'].includes(dto.profileType)) {
      if (user.role.toString() !== dto.profileType) {
        throw new ForbiddenException('Tài khoản này không có quyền truy cập vai trò nhân viên này');
      }

      const staff = await this.prisma.staff.findUnique({
        where: { id: dto.profileId },
      });

      if (!staff || staff.id !== userId) {
        throw new ForbiddenException('Profile Nhân viên không hợp lệ hoặc không thuộc về bạn');
      }

      const payload = {
        sub: user.id,
        role: user.role,
        profileId: staff.id,
        profileType: dto.profileType,
      };

      const token = await this.jwtService.signAsync(payload);
      return {
        message: `Chuyển sang vai trò ${dto.profileType} thành công`,
        accessToken: token,
        profile: {
          id: staff.id,
          name: staff.fullName,
          type: dto.profileType,
        },
      };
    }

    throw new BadRequestException('Loại profile chuyển đổi không được hỗ trợ');
  }
}
