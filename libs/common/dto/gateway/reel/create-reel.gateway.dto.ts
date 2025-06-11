import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ReelPrivacy } from '../../../enum/reel/reel-visibility.enum';
export class CreateReelGatewayDto {
  // @IsNotEmpty()
  // videoFile: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPremiumContent?: boolean;

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentionedUsers?: string[];

  @IsOptional()
  @IsEnum(ReelPrivacy)
  privacy?: ReelPrivacy;

  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @IsOptional()
  @IsBoolean()
  allowSaveToDevice?: boolean;

  @IsOptional()
  @IsBoolean()
  saveWithWatermark?: boolean;

  @IsOptional()
  @IsBoolean()
  audienceControlUnder18?: boolean;
}
