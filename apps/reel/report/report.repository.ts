import { BaseRepository } from '@app/common//baseRepository/base-repository';
import { ReportDocument } from '@app/common//models/reel/report.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReportsRepository extends BaseRepository<ReportDocument> {
  constructor(
    @InjectModel(ReportDocument.name)
    readonly model: Model<ReportDocument>,
  ) {
    super(model);
  }
}
