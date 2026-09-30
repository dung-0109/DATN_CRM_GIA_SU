import { IsNotEmpty, IsUUID, IsNumber } from 'class-validator';

export class TutorDepositDto {
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
