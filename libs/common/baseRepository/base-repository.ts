import {
  Model,
  FilterQuery,
  UpdateQuery,
  MongooseUpdateQueryOptions,
  Query,
  PipelineStage,
} from 'mongoose';
import { Logger, NotFoundException } from '@nestjs/common';
import { BaseDocument } from '../models/base.model';

export abstract class BaseRepository<TDocument extends BaseDocument> {
  protected readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {
    this.logger = new Logger(model.modelName);
  }

  async create(document: Partial<TDocument>): Promise<TDocument> {
    const createdDocument = new this.model(document);
    const savedDocument = await createdDocument.save();
    return savedDocument.toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery);

    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found');
    }

    return document;
  }

  async deleteOne(filterQuery: FilterQuery<TDocument>): Promise<boolean> {
    const result = await this.model.deleteOne(filterQuery).exec();
    if (result.deletedCount === 0) {
      this.logger.warn(
        `Document not found for deletion with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found for deletion');
    }
    return true;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean(true)) as TDocument;
    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }

  find(filterQuery: FilterQuery<TDocument>): Query<TDocument[], TDocument> {
    return this.model.find(filterQuery);
  }
  FilterQuery;
  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndDelete(filterQuery)
      .lean(true)) as TDocument;
    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }

  async updateOne(
    filter: FilterQuery<TDocument>,
    updates: UpdateQuery<TDocument>,
    options: MongooseUpdateQueryOptions<TDocument> = {},
  ): Promise<boolean> {
    const result = await this.model.updateOne(filter, updates, options).exec();

    if (result.modifiedCount === 0) {
      this.logger.warn(
        `No document updated with filter: ${JSON.stringify(filter)}`,
      );
    }

    return result.modifiedCount === 1;
  }

  async updateOneAndRetrieve(
    filter: FilterQuery<TDocument>,
    updates: UpdateQuery<TDocument>,
    options: MongooseUpdateQueryOptions<TDocument> = {},
  ): Promise<TDocument> {
    const updated = await this.model
      .findOneAndUpdate(filter, updates, { new: true, ...options })
      .lean(true)
      .exec();

    if (!updated) {
      this.logger.warn(
        `Document not found for update with filter: ${JSON.stringify(filter)}`,
      );
      throw new NotFoundException('The document was not found');
    }

    return updated as TDocument;
  }

  async updateMany(
    filter: FilterQuery<TDocument>,
    updates: UpdateQuery<TDocument>,
    options: MongooseUpdateQueryOptions<TDocument> = {},
  ): Promise<number> {
    const result = await this.model.updateMany(filter, updates, options).exec();

    if (result.modifiedCount === 0) {
      this.logger.warn(
        `No documents were updated with filter: ${JSON.stringify(filter)}`,
      );
    }

    return result.modifiedCount;
  }

  async aggregateWithPipeline<T = any>(
    match: FilterQuery<TDocument>,
    pipeline: PipelineStage[],
  ): Promise<T[]> {
    const fullPipeline = [{ $match: match }, ...pipeline];

    const result = await this.model.aggregate(fullPipeline).exec();
    return result as T[];
  }

  async createMany(documents: Partial<TDocument>[]): Promise<TDocument[]> {
    const createdDocuments = await this.model.insertMany(documents, {
      ordered: true,
    });
    return createdDocuments.map((doc) => doc.toJSON() as TDocument);
  }

  async createAndPopulate(
    document: Partial<TDocument>,
    populateOptions: Parameters<typeof this.model.findById>[0][] | string[],
  ): Promise<TDocument> {
    const created = await this.model.create(document);
    const populated = await this.model
      .findById(created._id)
      .populate(populateOptions)
      .exec();

    if (!populated) {
      throw new Error(
        `Failed to populate newly created document with ID ${created._id}`,
      );
    }

    return populated as TDocument;
  }
}
