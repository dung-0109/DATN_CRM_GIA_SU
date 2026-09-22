import { IsNotEmpty, IsUUID, IsString, IsISO8601 } from 'class-validator';

export class RequestStudentLeaveDto {
  @IsNotEmpty({ message: 'Buổi học xin nghỉ không được để trống' })
  @IsUUID('4', { message: 'sessionId phải là UUID v4' })
  sessionId: string;

  @IsNotEmpty({ message: 'Lý do xin nghỉ không được để trống' })
  @IsString()
  reason: string;

  @IsNotEmpty({ message: 'Thời gian đề xuất học bù không được để trống' })
  @IsISO8601({}, { message: 'rescheduledTo phải ở định dạng ISO8601' })
  rescheduledTo: string;
}
