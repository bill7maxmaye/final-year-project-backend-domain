import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListAllDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  next?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  @IsString()
  prev?: string;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortDirection?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  likedByUser?: string;
}
