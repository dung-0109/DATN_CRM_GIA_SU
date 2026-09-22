import { IsNotEmpty, IsUUID, IsString, IsISO8601 } from 'class-validator';

export class RequestTutorLeaveDto {
  @IsNotEmpty({ message: 'Buổi học xin nghỉ không được để trống' })
  @IsUUID('4', { message: 'sessionId phải là UUID v4' })
  sessionId: string;

  @IsNotEmpty({ message: 'Lý do xin nghỉ không được để trống' })
  @IsString()
  reason: string;

  @IsNotEmpty({ message: 'Thời gian đề xuất dạy bù không được để trống' })
  @IsISO8601({}, { message: 'rescheduleSuggested phải ở định dạng ISO8601' })
  rescheduleSuggested: string;
}
