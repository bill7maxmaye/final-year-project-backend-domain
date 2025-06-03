import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';

@Schema({ collection: 'chat_rooms' })
export class ChatRoomDocument extends BaseDocument {
  @Prop({ type: [MongooseSchema.Types.ObjectId], required: true, ref: 'User' })
  participants: Types.ObjectId[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoomDocument);
ChatRoomSchema.add(BaseSchema);
export { ChatRoomSchema as ChatRoomModel };
