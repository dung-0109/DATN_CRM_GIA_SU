import { IsNotEmpty, IsUUID, IsString, IsNumber, Min } from 'class-validator';

export class PurchasePackageDto {
  @IsNotEmpty({ message: 'Lớp học không được để trống' })
  @IsUUID('4', { message: 'classId phải là UUID v4' })
  classId: string;

  @IsNotEmpty({ message: 'Tên gói học phí không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Tổng số buổi không được để trống' })
  @IsNumber()
  @Min(1)
  totalSessions: number;

  @IsNotEmpty({ message: 'Giá gói học phí không được để trống' })
  @IsNumber()
  @Min(10000)
  price: number;
}
