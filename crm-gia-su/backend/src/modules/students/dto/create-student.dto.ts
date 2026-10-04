import {
  IsNotEmpty,
  IsString,
  IsISO8601,
  IsIn,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty({ message: 'Họ tên học sinh không được để trống' })
  @IsString()
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  fullName: string;

  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsIn(['MALE', 'FEMALE', 'OTHER'], { message: 'Giới tính không hợp lệ' })
  gender: string;

  @IsNotEmpty({ message: 'Ngày sinh không được để trống' })
  @IsISO8601({}, { message: 'Ngày sinh phải ở định dạng ISO8601' })
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'Tên trường tối đa 150 ký tự' })
  school?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Lớp tối đa 20 ký tự' })
  grade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  subjectsNeeded?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  learningStyle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  studentEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  studentPin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  academicLevel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetGoal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  personalityTraits?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú tối đa 500 ký tự' })
  notes?: string;
}
