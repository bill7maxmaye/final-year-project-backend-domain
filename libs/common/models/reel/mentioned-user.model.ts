import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class MentionedUserDocument {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  username: string;
}

export const MentionedUserSchema = SchemaFactory.createForClass(
  MentionedUserDocument,
);
