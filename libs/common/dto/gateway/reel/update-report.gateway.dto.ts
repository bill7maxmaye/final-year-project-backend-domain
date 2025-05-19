import { ReportStatus } from '@app/common//enum/reel/report-status.enum';
import { IsOptional, IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateReportGatewayDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  resolutionDetails?: string;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
}
