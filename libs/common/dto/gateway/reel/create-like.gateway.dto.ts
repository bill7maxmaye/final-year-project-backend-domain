import { LikeableType } from '@app/common//enum/reel/likeable-type.enum';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateLikeGatewayDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  targetId: string;

  @IsNotEmpty()
  @IsEnum(LikeableType)
  onModel: LikeableType;
}
