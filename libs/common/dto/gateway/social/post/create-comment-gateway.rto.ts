import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
} from 'class-validator';

export class CreatePostCommentGatewayDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  content: string;

  @IsNotEmpty()
  @IsMongoId()
  @IsOptional()
  authorId: string;

  @IsNotEmpty()
  @IsMongoId()
  postId: string;

  @IsNotEmpty()
  @IsMongoId()
  @IsOptional()
  parentId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  files?: string[];

  @IsOptional()
  @IsArray()
  mentions?: string[];
}
