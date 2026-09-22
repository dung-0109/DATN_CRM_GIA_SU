import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class TopupDto {
  @IsNotEmpty({ message: 'Số tiền nạp không được để trống' })
  @IsNumber()
  @Min(10000, { message: 'Số tiền nạp tối thiểu là 10,000đ' })
  amount: number;
}
