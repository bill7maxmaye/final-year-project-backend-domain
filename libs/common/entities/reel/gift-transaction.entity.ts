import { GiftTransactionDocument } from '../../models/reel/gift-transaction.model';
import { BaseEntity } from '../base.entity';

export class GiftTransaction extends BaseEntity {
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    public reelId: string,
    public giftId: string,
    public senderId: string,
    public quantity: number,
    public transactionDate: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  static fromDocument(document: GiftTransactionDocument): GiftTransaction {
    return new GiftTransaction(
      document.id,
      document.createdAt,
      document.updatedAt,
      document.reelId.toString(),
      document.giftId.toString(),
      document.senderId.toString(),
      document.quantity,
      document.transactionDate,
    );
  }

  static fromDocuments(
    documents: GiftTransactionDocument[],
  ): GiftTransaction[] {
    return documents.map((document) => GiftTransaction.fromDocument(document));
  }
}
