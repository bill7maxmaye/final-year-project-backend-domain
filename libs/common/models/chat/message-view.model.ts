import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseSchema } from '../base.model';

@Schema()
export class MessageViewDocument {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  viewerId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  viewedAt: Date;
}

export const MessageViewSchema =
  SchemaFactory.createForClass(MessageViewDocument);
MessageViewSchema.add(BaseSchema);
export { MessageViewSchema as MessageViewModel };
