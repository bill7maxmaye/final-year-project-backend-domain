
import { IsMongoId, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateMessageGatewayDto {
  @IsMongoId()
  readonly receiverId: string;

  @IsOptional()
  @IsString()
  readonly content?: string;

  @IsOptional()
  @IsMongoId()
  readonly replyTo?: string;

  @IsOptional()
  @IsMongoId()
  readonly forwardedFrom?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  readonly attachments?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  readonly mentionedUserIds?: string[];
}
