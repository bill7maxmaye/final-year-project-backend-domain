import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';
import { MentionedUserDocument } from './mentioned-user.model';

@Schema({ collection: 'comments' })
export class CommentDocument extends BaseDocument {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    refPath: 'onModel',
  })
  targetId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['Reel', 'Comment'] })
  onModel: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Comment' })
  parentCommentId: Types.ObjectId;

  @Prop({ type: MentionedUserDocument, default: [] })
  mentionedUsers: MentionedUserDocument[];

  @Prop({ type: Number, default: 0 })
  likes: number;
}

const CommentSchema = SchemaFactory.createForClass(CommentDocument);
CommentSchema.add(BaseSchema);
export { CommentSchema };
