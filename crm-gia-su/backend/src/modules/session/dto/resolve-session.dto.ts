import { IsNotEmpty, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum ResolveAction {
  CONFIRM = 'CONFIRM',
  DISPUTE = 'DISPUTE',
}

export class ResolveSessionDto {
  @IsNotEmpty({ message: 'Hành động không được để trống' })
  @IsEnum(ResolveAction, { message: 'action phải là CONFIRM hoặc DISPUTE' })
  action: ResolveAction;

  @IsOptional()
  @IsString()
  @Length(4, 4, { message: 'Mã PIN bảo mật phải đúng 4 ký tự số' })
  pin?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
