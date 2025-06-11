import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';

export class CreateGiftTransactionGatewayDto {
  @IsNotEmpty()
  @IsString()
  reelId: string;

  @IsNotEmpty()
  @IsString()
  giftId: string;

  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsDate()
  transactionDate?: Date;
}
