import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ReactionsDocument, defaultReactions } from './reactions.model';
import { BaseDocument } from '../base.model';

export type CommentDocument = Comment & BaseDocument;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  authorId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  postId: string;

  @Prop({ type: Object, default: defaultReactions })
  reactions: ReactionsDocument;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  likedBy: string[];

  @Prop({ default: false })
  isDeleted: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
