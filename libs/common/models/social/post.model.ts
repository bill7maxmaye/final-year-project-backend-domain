import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDocument } from '../base.model';

@Schema({ timestamps: true })
export class PostDocument extends BaseDocument {
  @Prop({ required: false, default: '' })
  content: string;

  @Prop({ type: [String], default: [] })
  files: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, default: '' })
  authorId: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  commentIds: string[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    default: [],
  })
  likedBy: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
  mentions?: string[];

  @Prop({ type: Number, default: 0 })
  reportCount: number;

  @Prop({ type: String })
  label: string;

  @Prop({ type: Number })
  score: number;

  @Prop({ type: [String], default: [] })
  transcription_named_entities: string[];

  @Prop({ type: [String], default: [] })
  transcription_keywords: string[];

  @Prop({ type: String })
  transcription_sentiment: string;

  @Prop({ type: String })
  transcription_text: string;

  @Prop({ type: String })
  transcription_label: string;
}

export const PostSchema = SchemaFactory.createForClass(PostDocument);

// Add text index for content search
PostSchema.index({ content: 'text' });
