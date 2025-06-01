import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument, BaseSchema } from '../base.model';
import { ReelPrivacy } from '../../enum/reel/reel-visibility.enum';
@Schema({
  collection: 'reels',
})
export class ReelDocument extends BaseDocument {
  @Prop({ type: String, required: true })
  ownerId: string;

  @Prop({ type: String, required: true })
  videoURL: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Boolean, default: false })
  isPremiumContent: boolean;

  @Prop({ type: Number, min: 0 })
  duration: number;

  @Prop({ type: [String], default: [] })
  hashtags: string[];

  @Prop({ type: [String], default: [] })
  mentionedUserIds: string[];

  @Prop({ type: String, enum: ReelPrivacy, default: ReelPrivacy.PUBLIC })
  privacy: ReelPrivacy;

  @Prop({ type: Boolean, default: true })
  allowComments: boolean;

  @Prop({ type: Boolean, default: true })
  allowSaveToDevice: boolean;

  @Prop({ type: Boolean, default: false })
  saveWithWatermark: boolean;

  @Prop({ type: Boolean, default: false })
  audienceControlUnder18: boolean;

  @Prop({ type: [String], default: [] })
  sceneCategories: string[];

  @Prop({ type: [String], default: [] })
  dominantScenes: string[];

  @Prop({ type: [String], default: [] })
  detectedObjects: string[];

  @Prop({ type: String })
  amharicOcrText: string;

  @Prop({ type: String })
  key: string;

  @Prop({ type: String })
  englishOcrText: string;

  @Prop({ type: [String], default: [] })
  videoTypes: string[];

  @Prop({ type: Number, default: 0 })
  likes: number;

  @Prop({ type: Number, default: 0 })
  comments: number;

  @Prop({ type: Number, default: 0 })
  favoriteCount: number;

  @Prop({ type: Number, default: 0 })
  shareCount: number;
}

const ReelSchema = SchemaFactory.createForClass(ReelDocument);
ReelSchema.add(BaseSchema);
export { ReelSchema };
