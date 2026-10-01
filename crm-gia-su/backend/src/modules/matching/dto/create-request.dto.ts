import { IsNotEmpty, IsUUID, IsString, IsNumber, Min, Max, IsDecimal } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty({ message: 'Học sinh không được để trống' })
  @IsUUID('4', { message: 'studentId phải là UUID v4' })
  studentId: string;

  @IsNotEmpty({ message: 'Môn học không được để trống' })
  @IsString()
  subject: string;

  @IsNotEmpty({ message: 'Cấp lớp không được để trống' })
  @IsString()
  grade: string;

  @IsNotEmpty({ message: 'Ghi chú lịch rảnh không được để trống' })
  @IsString()
  scheduleNotes: string;

  @IsNotEmpty({ message: 'Số buổi mỗi tuần không được để trống' })
  @IsNumber()
  @Min(1)
  @Max(7)
  sessionsPerWeek: number;

  @IsNotEmpty({ message: 'Học phí đề xuất không được để trống' })
  @IsNumber()
  @Min(50000)
  budgetPerSession: number;

  @IsNotEmpty({ message: 'Yêu cầu giới tính gia sư không được để trống' })
  @IsString()
  tutorGenderPref: string; // MALE, FEMALE, ANY

  @IsString()
  learningMode?: string; // OFFLINE, ONLINE

  @IsString()
  address?: string;

  @IsString()
  tutorTypePref?: string; // STUDENT, TEACHER, ANY

  @IsString()
  requirements?: string;
}
