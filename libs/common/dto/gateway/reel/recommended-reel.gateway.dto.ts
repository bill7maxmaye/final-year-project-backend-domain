import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class RecommendedReelEntryDto {
  @IsNotEmpty()
  @IsString()
  reelId: string;

  @IsNotEmpty()
  @IsNumber()
  score: number;
}

export class RecommendedReelGatewayDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendedReelEntryDto)
  recommendedReels: RecommendedReelEntryDto[];
}
