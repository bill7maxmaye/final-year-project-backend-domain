import { Report } from '@app/common//entities/reel/report.entity'; // Assuming this is the path to your entity

interface ReportReasonDetailsRto {
  mainReason: string;
  subReason?: string | null;
  details?: string | null;
}

export class ReportRto {
  public id: string;
  public reporterId: string;
  public reportedEntityType: string;
  public reportedEntityId: string;
  public status: string;

  public reasonDetails: ReportReasonDetailsRto;

  public resolutionDetails: string | null;
  public resolutionDate: string | null;
  public resolverId: string | null;

  // Base entity properties (as ISO strings)
  public createdAt: string;
  public updatedAt: string;

  // 4. Update the constructor to match the new properties
  constructor(
    id: string,
    reasonDetails: ReportReasonDetailsRto, // Accept the nested object
    reporterId: string,
    reportedEntityType: string,
    reportedEntityId: string,
    status: string,
    resolutionDetails: string | null,
    resolutionDate: string | null,
    resolverId: string | null,
    createdAt: string,
    updatedAt: string,
  ) {
    // Assign properties
    this.id = id;
    this.reasonDetails = reasonDetails; // Assign the nested object
    this.reporterId = reporterId;
    this.reportedEntityType = reportedEntityType;
    this.reportedEntityId = reportedEntityId;
    this.status = status;

    // Assign optional/nullable properties
    this.resolutionDetails = resolutionDetails;
    this.resolutionDate = resolutionDate;
    this.resolverId = resolverId;

    // Assign date properties
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // 5. Update the fromEntity factory method
  static fromEntity(entity: Report): ReportRto {
    return new ReportRto(
      // Map properties from entity to RTO
      entity.id,
      {
        // Create the ReportReasonDetailsRto object from entity's reasonDetails
        mainReason: entity.reasonDetails.mainReason,
        subReason: entity.reasonDetails.subReason || null, // Map subReason, explicitly handle null
        details: entity.reasonDetails.details || null, // Map details, explicitly handle null
      },
      entity.reporterId,
      entity.reportedEntityType,
      entity.reportedEntityId,
      entity.status,
      entity.resolutionDetails || null, // Map resolutionDetails, explicitly handle null
      entity.resolutionDate ? entity.resolutionDate.toISOString() : null, // Map Date to ISO string, handle null
      entity.resolverId || null, // Map resolverId, explicitly handle null
      entity.createdAt.toISOString(), // Map Date to ISO string
      entity.updatedAt.toISOString(), // Map Date to ISO string
    );
  }

  static fromEntities(entities: Report[]): ReportRto[] {
    return entities.map((entity) => ReportRto.fromEntity(entity));
  }

  // Optional: Add toPlainObject or toJson method for serialization if needed
  toPlainObject() {
    return {
      id: this.id,
      reasonDetails: {
        mainReason: this.reasonDetails.mainReason,
        subReason: this.reasonDetails.subReason,
        details: this.reasonDetails.details,
      },
      reporterId: this.reporterId,
      reportedEntityType: this.reportedEntityType,
      reportedEntityId: this.reportedEntityId,
      status: this.status,
      resolutionDetails: this.resolutionDetails,
      resolutionDate: this.resolutionDate,
      resolverId: this.resolverId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
