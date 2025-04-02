import { BaseDocument, BaseSchema } from '@app/common/models/base.model';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'users' })
export class UserDocument extends BaseDocument {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, default: 'user' })
  role: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  gender: string;

  @Prop({ type: String, default: '' })
  profilePic: string;

  @Prop({ type: Date })
  lastLogin: Date;

  @Prop({ type: Date })
  dob?: Date;

  @Prop({ type: String, default: '' })
  bio: string;

  @Prop({ type: [String] })
  preferences: string[];

  @Prop({ type: String, default: 'inactive' })
  status: string;
}

const UserSchema = SchemaFactory.createForClass(UserDocument);
UserSchema.add(BaseSchema);
export { UserSchema };
