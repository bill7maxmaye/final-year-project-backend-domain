import { IsEnum, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { ReportedEntityType } from '@app/common//enum/reel/reported-entity-type.enum';

import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class ReasonDetailsGatewayDto {
  @IsNotEmpty()
  @IsString()
  mainReason: string;

  @IsOptional()
  @IsString()
  subReason?: string; // Optional sub-reason

  @IsOptional()
  @IsString()
  details?: string; // Optional user-provided details
}
export class CreateReportGatewayDto {
  // *** Replace 'reason' and 'additionalDetails' with the nested reasonDetails object ***
  @IsNotEmptyObject() // Ensure the reasonDetails object itself is not empty/null
  @ValidateNested() // Validate the nested properties within reasonDetails
  reasonDetails: ReasonDetailsGatewayDto; // Property holding the nested object

  @IsNotEmpty()
  @IsString()
  reportedEntityId: string; // The ID of the reel, comment, or user being reported

  @IsNotEmpty()
  @IsEnum(ReportedEntityType)
  reportedEntityType: ReportedEntityType; // 'Reel', 'Comment', 'User'
}
