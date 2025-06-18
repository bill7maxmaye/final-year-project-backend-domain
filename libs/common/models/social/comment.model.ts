import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDocument } from '../base.model';

@Schema({ timestamps: true })
export class PostCommentDocument extends BaseDocument {
  @Prop({ type: String, default: null })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null, required: false })
  authorId?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null, required: false })
  postId?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    required: false,
  })
  parentId: string;

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    default: [],
    ref: 'PostComment',
  })
  replies: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  likedBy: string[];

  @Prop({ type: [String], default: [] })
  files: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  mentions: string[];

  @Prop({ type: String, default: 'free' })
  lable: string;

  @Prop({ type: Number, default: 100 })
  score: number;
}

export const PostCommentSchema =
  SchemaFactory.createForClass(PostCommentDocument);
