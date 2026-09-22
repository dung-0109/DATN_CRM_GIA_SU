import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum TrialOutcome {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class ResolveTrialDto {
  @IsNotEmpty({ message: 'Kết quả dạy thử không được để trống' })
  @IsEnum(TrialOutcome, { message: 'outcome phải là SUCCESS hoặc FAILED' })
  outcome: TrialOutcome;

  @IsOptional()
  @IsString()
  note?: string;
}
