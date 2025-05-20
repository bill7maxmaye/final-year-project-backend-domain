import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseDocument, BaseSchema } from '../base.model';
import { ReportedEntityType } from '../../enum/reel/reported-entity-type.enum';
import { ReportStatus } from '../../enum/reel/report-status.enum';

// Define an interface for the nested reason details for TypeScript clarity
interface ReasonDetails {
  mainReason: string;
  subReason?: string;
  details?: string;
}

@Schema({ collection: 'reports' })
export class ReportDocument extends BaseDocument {
  // *** Define the nested object structure directly within the Prop decorator ***
  @Prop({
    type: {
      // Use 'type: {}' to define a nested schema object inline
      mainReason: { type: String, required: true }, // Schema definition for mainReason
      subReason: { type: String }, // Schema definition for subReason (optional)
      details: { type: String }, // Schema definition for details (optional)
    },
    required: true, // The reasonDetails object itself is required
  })
  // *** Use the interface for TypeScript type safety ***
  reasonDetails: ReasonDetails; // Property holding the nested object

  @Prop({ type: String, required: true })
  reporterId: string;

  @Prop({ type: String, enum: ReportedEntityType, required: true })
  reportedEntityType: ReportedEntityType;

  @Prop({ type: String, required: true })
  reportedEntityId: string;

  // You can keep additionalDetails here if it serves a *different* purpose than details within reasonDetails,
  // otherwise, it might be redundant. Assuming for now 'details' in reasonDetails is sufficient.
  // @Prop({ type: String })
  // additionalDetails?: string;

  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Prop({ type: String })
  resolutionDetails?: string;

  @Prop({ type: Date })
  resolutionDate?: Date;

  @Prop({ type: String })
  resolverId?: string;
}

const ReportSchema = SchemaFactory.createForClass(ReportDocument);
ReportSchema.add(BaseSchema);
export { ReportSchema };
