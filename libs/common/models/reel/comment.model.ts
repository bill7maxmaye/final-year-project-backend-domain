import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';

@Schema({ collection: 'Reel-Comments' })
export class CommentDocument extends BaseDocument {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ required: true })
  reelId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment' })
  parentCommentId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  mentionedUserIds: string[];

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: String, default: 'free' })
  lable: string;

  @Prop({ type: Number, default: 100 })
  score: number;
}

const CommentSchema = SchemaFactory.createForClass(CommentDocument);
CommentSchema.add(BaseSchema);
export { CommentSchema };
