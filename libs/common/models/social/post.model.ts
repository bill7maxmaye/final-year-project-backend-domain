import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDocument } from '../base.model';

@Schema({ timestamps: true })
export class PostDocument extends BaseDocument {
  @Prop({ required: false, default: '' })
  content: string;

  @Prop({ type: [String], default: [] })
  files: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: false, default: '' })
  authorId: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  commentIds: string[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    default: [],
  })
  likedBy: string[];
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);
