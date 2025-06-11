import { CreateGiftTransactionGatewayDto } from '../../gateway/reel/create-gift-transaction.gateway.dto';

export class CreateGiftTransactionDto {
  constructor(
    readonly id: string,
    readonly body: CreateGiftTransactionGatewayDto,
  ) {}

  static fromGatewayRequest(
    id: string,
    body: CreateGiftTransactionGatewayDto,
  ): CreateGiftTransactionDto {
    return new CreateGiftTransactionDto(id, body);
  }
}
