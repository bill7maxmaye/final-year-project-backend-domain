import { IsNumber, Min, Max } from 'class-validator';

export class PaginationOptionsGatewayDto {
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
