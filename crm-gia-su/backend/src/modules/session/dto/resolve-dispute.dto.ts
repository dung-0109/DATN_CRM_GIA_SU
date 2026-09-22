import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';

export enum DisputeOutcome {
  RESOLVED_CONFIRM = 'RESOLVED_CONFIRM',
  RESOLVED_CANCEL = 'RESOLVED_CANCEL',
}

export class ResolveDisputeDto {
  @IsNotEmpty({ message: 'Phán quyết đối soát không được để trống' })
  @IsEnum(DisputeOutcome, { message: 'outcome phải là RESOLVED_CONFIRM hoặc RESOLVED_CANCEL' })
  outcome: DisputeOutcome;

  @IsOptional()
  @IsString()
  note?: string;
}
