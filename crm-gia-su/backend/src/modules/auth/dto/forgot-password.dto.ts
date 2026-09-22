import { IsNotEmpty, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^0\d{9}$|^84\d{9}$/, { message: 'Số điện thoại Việt Nam không hợp lệ' })
  phone: string;
}