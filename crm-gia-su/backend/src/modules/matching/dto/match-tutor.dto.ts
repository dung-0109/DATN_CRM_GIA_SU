import { IsNotEmpty, IsUUID, IsNumber, Min } from 'class-validator';

export class MatchTutorDto {
  @IsNotEmpty({ message: 'Gia sư không được để trống' })
  @IsUUID('4', { message: 'tutorId phải là UUID v4' })
  tutorId: string;

  @IsNotEmpty({ message: 'Đơn giá học phí phụ huynh không được để trống' })
  @IsNumber()
  @Min(50000)
  hourlyRate: number;

  @IsNotEmpty({ message: 'Đơn giá lương gia sư không được để trống' })
  @IsNumber()
  @Min(50000)
  tutorWageRate: number;
}
