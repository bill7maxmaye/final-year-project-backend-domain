import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDocument } from '../base.model';
import { defaultNumberOf, PostsNumberOfDocument } from './post-number.model';


@Schema({ timestamps: true })
export class PostDocument extends BaseDocument {
  @Prop({ required: false })
  content: string;

  @Prop({ type: [String], default: [] })
  files: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
  authorId?: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  commentIds: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  likedBy: string[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: PostsNumberOfDocument, default: defaultNumberOf })
  numberOf: PostsNumberOfDocument;
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);
