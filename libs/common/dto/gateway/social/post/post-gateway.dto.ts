import {
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FileUploadDto {
  @IsString()
  fieldname: string;

  @IsString()
  originalname: string;

  @IsString()
  encoding: string;

  @IsString()
  mimetype: string;

  @IsString()
  buffer: Buffer;

  @IsString()
  size: number;
}

export class CreatePostGatewayDto {
  @IsString()
  @IsOptional()
  readonly title: string;

  @IsOptional()
  readonly content?: string;

  @IsOptional()
  @IsArray()
  readonly files: FileUploadDto[];

  @ValidateNested({ each: true })
  @IsArray()
  @IsOptional()
  readonly mentions: string[];
}
