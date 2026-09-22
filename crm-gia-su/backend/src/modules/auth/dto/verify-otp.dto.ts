import { IsNotEmpty, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^0\d{9}$|^84\d{9}$/, { message: 'Số điện thoại Việt Nam không hợp lệ' })
  phone: string;

  @IsNotEmpty({ message: 'Mã OTP không được để trống' })
  @Length(6, 6, { message: 'Mã OTP phải có độ dài đúng 6 ký tự số' })
  otp: string;
}
