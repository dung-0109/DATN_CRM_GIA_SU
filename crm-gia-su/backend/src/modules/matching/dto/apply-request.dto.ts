import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Thư tự giới thiệu không được dài quá 500 ký tự' })
  coverLetter?: string;
}
