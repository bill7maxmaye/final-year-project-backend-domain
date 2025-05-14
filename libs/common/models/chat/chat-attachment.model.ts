import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';

@Schema({ collection: 'chat_attachments' })
export class ChatAttachmentDocument extends BaseDocument {
  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: String, enum: ['image', 'video', 'file'], required: true })
  type: 'image' | 'video' | 'file';

  @Prop({ type: String })
  fileName?: string;

  @Prop({ type: Number })
  sizeInBytes?: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  uploadedBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  uploadedAt: Date;
}

export const ChatAttachmentSchema = SchemaFactory.createForClass(
  ChatAttachmentDocument,
);
ChatAttachmentSchema.add(BaseSchema);
