import { IsNotEmpty, IsUUID, IsString, IsOptional, IsISO8601 } from 'class-validator';

export class AttendanceDto {
  @IsNotEmpty({ message: 'Lớp học không được để trống' })
  @IsUUID('4', { message: 'classId phải là UUID v4' })
  classId: string;

  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsISO8601({}, { message: 'startTime phải ở định dạng ISO8601' })
  startTime: string;

  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsISO8601({}, { message: 'endTime phải ở định dạng ISO8601' })
  endTime: string;

  @IsOptional()
  @IsString()
  description?: string;
}
