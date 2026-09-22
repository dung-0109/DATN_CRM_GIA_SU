import { IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^0\d{9}$|^84\d{9}$/, { message: 'Số điện thoại Việt Nam không hợp lệ' })
  phone: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  otp: string;

  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(8, { message: 'Mật khẩu mới phải dài tối thiểu 8 ký tự' })
  @MaxLength(15, { message: 'Mật khẩu tối đa 15 ký tự' })
  newPassword: string;
}