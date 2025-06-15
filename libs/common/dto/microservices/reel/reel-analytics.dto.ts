import { ApiProperty } from '@nestjs/swagger';

export class LabelAnalyticsDto {
  @ApiProperty({ description: 'The label name' })
  label: string;

  @ApiProperty({ description: 'The percentage of reels with this label' })
  percentage: number;

  @ApiProperty({ description: 'The count of reels with this label' })
  count: number;
}

export class ReelAnalyticsDto {
  @ApiProperty({ description: 'Total number of liked reels analyzed' })
  totalReels: number;

  @ApiProperty({ description: 'Array of label analytics', type: [LabelAnalyticsDto] })
  labelAnalytics: LabelAnalyticsDto[];
} 