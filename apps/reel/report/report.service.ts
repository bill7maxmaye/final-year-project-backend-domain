import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { ReportsRepository } from './report.repository';
import { CreateReportDto } from '@app/common//dto/microservices/reel/create-report.dto';
import { ReportStatus } from '@app/common//enum/reel/report-status.enum';
import { Report } from '@app/common//entities/reel/report.entity';
import { UpdateReportDto } from '@app/common//dto/microservices/reel/update-report.dto';
import { ReportDocument } from '@app/common//models/reel/report.model';
import { ReportedEntityType } from '@app/common//enum/reel/reported-entity-type.enum';
@Injectable()
export class ReportService {
  constructor(private readonly reportRepository: ReportsRepository) {}

  async createReport(createReportDto: CreateReportDto): Promise<Report> {
    try {
      const { reporterId, body } = createReportDto;

      console.log(body);
      const report = await this.reportRepository.create({
        reporterId,
        status: ReportStatus.PENDING,
        ...body,
      });

      return Report.fromDocument(report);
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async getReport(id: string): Promise<Report> {
    try {
      const report = await this.reportRepository.findOne({
        _id: new Types.ObjectId(id),
      });

      if (!report) {
        throw new NotFoundException(`Report with ID "${id}" not found`);
      }

      return Report.fromDocument(report);
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Report ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async updateReport(
    id: string,
    updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    try {
      const updatedReport = await this.reportRepository.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        updateReportDto,
      );

      if (!updatedReport) {
        throw new NotFoundException(`Report with ID "${id}" not found`);
      }

      return Report.fromDocument(updatedReport);
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Report ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async deleteReport(id: string): Promise<void> {
    try {
      const result = await this.reportRepository.deleteOne({
        _id: new Types.ObjectId(id),
      });

      if (!result) {
        throw new NotFoundException(`Report with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof Types.ObjectId) {
        throw new NotFoundException(`Invalid Report ID "${id}"`);
      } else {
        throw error;
      }
    }
  }

  async getReportsByEntity(
    reportedEntityId: string,
    reportedEntityType: ReportedEntityType,
  ): Promise<Report[]> {
    try {
      const filterQuery: FilterQuery<ReportDocument> = {
        reportedEntityId: reportedEntityId,
        reportedEntityType: reportedEntityType,
      };

      const reports = await this.reportRepository.find(filterQuery);

      return Report.fromDocuments(reports);
    } catch (error) {
      console.error(
        `Error fetching reports for entity ID "${reportedEntityId}" and type "${reportedEntityType}":`,
        error,
      );
      throw error;
    }
  }

  async getReportsByReporterId(reporterId: string): Promise<Report[]> {
    try {
      const filterQuery: FilterQuery<ReportDocument> = {
        reporterId: reporterId,
      };

      const reports = await this.reportRepository.find(filterQuery);

      return Report.fromDocuments(reports);
    } catch (error) {
      console.error(
        `Error fetching reports for reporter ID "${reporterId}":`,
        error,
      );
      throw error;
    }
  }
}
