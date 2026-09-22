import { IsNotEmpty, IsUUID, IsString, IsOptional, Length } from 'class-validator';

export class ProfileSwitchDto {
  @IsNotEmpty({ message: 'Profile ID không được để trống' })
  @IsUUID('4', { message: 'Profile ID phải là UUID v4 hợp lệ' })
  profileId: string;

  @IsNotEmpty({ message: 'Profile Type không được để trống' })
  @IsString({ message: 'Profile Type phải là một chuỗi kí tự' })
  profileType: string;

  @IsOptional()
  @Length(4, 4, { message: 'Mã PIN bảo mật phải đúng 4 chữ số' })
  parentPin?: string;
}
