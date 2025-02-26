import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';
import { ObjectId } from 'mongoose';

@Schema()
export class BaseDocument {
  @Prop({ type: SchemaTypes.ObjectId })
  _id: ObjectId;
}