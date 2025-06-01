import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';
import { MessageViewDocument, MessageViewSchema } from './message-view.model';

@Schema({ collection: 'chat_messages' })
export class ChatMessageDocument extends BaseDocument {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'ChatRoom',
  })
  roomId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop({ type: String })
  content: string;

  @Prop({ type: Boolean, default: false })
  edited: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMessage' })
  replyTo?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ChatMessage' })
  forwardedFrom?: Types.ObjectId;

  @Prop({ type: Map, of: Number, default: {} })
  reactions: Map<string, number>;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'ChatAttachment' })
  attachments: Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'User', default: [] })
  mentionedUserIds: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  deletedBy: Types.ObjectId[];

  @Prop({ type: [MessageViewSchema], default: [] })
  views: MessageViewDocument[];

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Boolean, default: false })
  isPinned: boolean;
}

export const ChatMessageSchema =
  SchemaFactory.createForClass(ChatMessageDocument);
ChatMessageSchema.add(BaseSchema);
