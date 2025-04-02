import { PostPrivacy } from '@app/common/enum/social/post-privacy.enum';
import { BaseDocument, BaseSchema } from '@app/common/models/base.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'posts' })
export class PostDocument extends BaseDocument {
  @Prop({ type: String })
  userId: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: String })
  mediaUrl: string;

  @Prop({ type: String })
  privacy?: PostPrivacy;

  @Prop({ type: Boolean })
  isPinned: boolean;
}

const PostSchema = SchemaFactory.createForClass(PostDocument);
PostSchema.add(BaseSchema);
export { PostSchema };
