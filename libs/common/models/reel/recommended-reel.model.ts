import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument } from '../base.model';
import { Types } from 'mongoose';

// Interface for individual recommended reel entry
interface RecommendedReelEntry {
  reelId: Types.ObjectId;
  score: number;
}

@Schema({ collection: 'recommended_reels' })
export class RecommendedReelDocument extends BaseDocument {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({
    type: [
      {
        reelId: { type: Types.ObjectId, required: true },
        score: { type: Number, required: true },
      },
    ],
    default: [],
  })
  recommendedReels: RecommendedReelEntry[];

  @Prop({ type: Date, default: Date.now })
  lastUpdated: Date;
}

export const RecommendedReelSchema = SchemaFactory.createForClass(
  RecommendedReelDocument,
);
