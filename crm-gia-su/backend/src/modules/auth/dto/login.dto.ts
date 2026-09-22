import { IsNotEmpty, Matches, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^0\d{9}$|^84\d{9}$/, { message: 'Số điện thoại Việt Nam không hợp lệ (phải gồm 10 chữ số, bắt đầu bằng 0 hoặc 84)' })
  phone: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải dài tối thiểu 8 ký tự' })
  @MaxLength(15, { message: 'Mật khẩu tối đa 15 ký tự' })
  password: string;
}
