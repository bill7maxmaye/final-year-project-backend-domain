import { ReportDocument } from '../../models/reel/report.model'; // Assuming this is the path to your Mongoose model
import { BaseEntity } from '../base.entity'; // Assuming this is the path to your base entity class
import { Types } from 'mongoose'; // Import Types if reporterId/resolverId are ObjectIds

// 1. Define an interface for the nested reason details structure in the entity
interface ReportReasonDetailsEntity {
  mainReason: string;
  subReason?: string | null; // Use string | null to explicitly handle potential nulls from DB
  details?: string | null; // Use string | null
}

export class Report extends BaseEntity {
  // 2. Replace 'reason' and remove 'additionalDetails'
  public reasonDetails: ReportReasonDetailsEntity;
  // public additionalDetails: string | null; // Removed

  // Keep other properties
  public reporterId: string; // Assuming converting ObjectId to string
  public reportedEntityType: string;
  public reportedEntityId: string;
  public status: string;
  public resolutionDetails: string | null;
  public resolutionDate: Date | null;
  public resolverId: string | null; // Assuming converting ObjectId to string

  // 4. Update the constructor to accept reasonDetails
  constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    reasonDetails: ReportReasonDetailsEntity, // Accepts the nested object
    reporterId: string,
    reportedEntityType: string,
    reportedEntityId: string,
    // additionalDetails: string | null, // Removed from constructor
    status: string,
    resolutionDetails: string | null,
    resolutionDate: Date | null,
    resolverId: string | null,
  ) {
    super(id, createdAt, updatedAt);
    // Assign the new reasonDetails property
    this.reasonDetails = reasonDetails;
    // Assign other properties
    this.reporterId = reporterId;
    this.reportedEntityType = reportedEntityType;
    this.reportedEntityId = reportedEntityId;
    // this.additionalDetails = additionalDetails; // Removed assignment
    this.status = status;
    this.resolutionDetails = resolutionDetails;
    this.resolutionDate = resolutionDate;
    this.resolverId = resolverId;
  }

  // 5. Update the fromDocument factory method
  static fromDocument(document: ReportDocument): Report {
    // Handle potential null/undefined from the document, though schema says required
    const reasonDetailsFromDoc = document.reasonDetails;

    return new Report(
      // BaseEntity properties
      (document._id || document.id).toString(), // Use _id or id, ensure string
      document.createdAt,
      document.updatedAt,

      // reasonDetails mapping
      {
        // Create the ReportReasonDetailsEntity object
        mainReason: reasonDetailsFromDoc?.mainReason || '', // Map mainReason, default to empty string if missing
        subReason: reasonDetailsFromDoc?.subReason || null, // Map subReason, default to null if missing
        details: reasonDetailsFromDoc?.details || null, // Map details, default to null if missing
      },

      // Other properties mapping
      (document.reporterId as unknown as Types.ObjectId).toString(), // Ensure reporterId is string
      document.reportedEntityType.toString(), // Ensure enum is string
      document.reportedEntityId.toString(), // Ensure reportedEntityId is string

      // additionalDetails is removed
      // document.additionalDetails || null,

      document.status.toString(), // Ensure enum is string
      document.resolutionDetails || null,
      document.resolutionDate || null,
      document.resolverId
        ? (document.resolverId as unknown as Types.ObjectId).toString()
        : null, // Ensure resolverId is string or null
    );
  }

  static fromDocuments(documents: ReportDocument[]): Report[] {
    return documents.map((document) => Report.fromDocument(document));
  }
}
