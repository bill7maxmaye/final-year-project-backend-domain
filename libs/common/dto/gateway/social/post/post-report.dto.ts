import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class PostReportDto {
  @IsString()
  @IsNotEmpty()
  report_type: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  content_id: string;

  @IsString()
  @IsOptional()
  reporter_id?: string;

  @IsNotEmpty()
  mainReason: string;

  @IsOptional()
  subreason?: string;
}
