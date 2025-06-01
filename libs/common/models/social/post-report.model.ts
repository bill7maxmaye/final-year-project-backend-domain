import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { BaseDocument } from '../base.model';

@Schema({ timestamps: true })
export class PostReportDocument extends BaseDocument {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'PostDocument', // Reference to the reported post
  })
  content_id: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    ref: 'UserDocument',
  })
  reporterId?: string;

  @Prop({
    type: String,
    required: true,
  })
  mainReason: string;

  @Prop({ type: String, required: false })
  subreason?: string;

  @Prop({
    type: String,
    default: 'PENDING',
    enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'],
  })
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false,
    ref: 'UserDocument',
  })
  resolvedBy?: string;

  @Prop({ type: Date, required: false })
  resolvedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(PostReportDocument);
