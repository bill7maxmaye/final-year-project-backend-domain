import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';

@Schema({ collection: 'reelGiftTransactions' })
export class GiftTransactionDocument extends BaseDocument {
  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Reel' })
  reelId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'Gift' })
  giftId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  quantity: number;

  @Prop({ type: Date, default: Date.now })
  transactionDate: Date;
}

const GiftTransactionSchema = SchemaFactory.createForClass(
  GiftTransactionDocument,
);

GiftTransactionSchema.add(BaseSchema);
export { GiftTransactionSchema };
