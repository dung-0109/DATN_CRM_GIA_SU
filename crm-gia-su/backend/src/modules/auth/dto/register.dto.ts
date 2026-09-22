import { IsNotEmpty, Matches, MinLength, MaxLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^0\d{9}$|^84\d{9}$/, { message: 'Số điện thoại Việt Nam không hợp lệ' })
  phone: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải dài tối thiểu 8 ký tự' })
  @MaxLength(15, { message: 'Mật khẩu tối đa 15 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsNotEmpty({ message: 'Role không được để trống' })
  @IsEnum(UserRole, { message: 'Role phải là PARENT hoặc TUTOR' })
  role: UserRole;
}
