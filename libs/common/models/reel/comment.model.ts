import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';

@Schema({ collection: 'comments' })
export class CommentDocument extends BaseDocument {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ required: true })
  reelId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment' })
  parentCommentId?: Types.ObjectId;

  @Prop({ default: [] })
  mentionedUsers: [];

  @Prop({ type: Number, default: 0 })
  likes: number;
}

const CommentSchema = SchemaFactory.createForClass(CommentDocument);
CommentSchema.add(BaseSchema);
export { CommentSchema };
