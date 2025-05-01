import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Types } from 'mongoose';
import { BaseDocument, BaseSchema } from '../base.model';
import { LikeableType } from '../../enum/reel/likeable-type.enum';

@Schema({ collection: 'likes' })
export class LikeDocument extends BaseDocument {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    refPath: 'onModel',
  })
  targetId: Types.ObjectId;

  @Prop({ type: String, required: true, enum: Object.values(LikeableType) })
  onModel: LikeableType;
}

const LikeSchema = SchemaFactory.createForClass(LikeDocument);
LikeSchema.add(BaseSchema);
export { LikeSchema };
