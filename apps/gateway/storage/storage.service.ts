import { Inject, Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import {
  AWS_S3_BUCKET,
  S3_PROVIDER,
} from '@app/common//constant/storage.constants';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(S3_PROVIDER) private readonly s3: S3) {}

  async uploadFile(file: Express.Multer.File) {
    this.logger.log('uploading file ', file);
    const { originalname, mimetype, buffer } = file;

    let finalMimeType = mimetype;

    if (
      mimetype === 'application/octet-stream' &&
      originalname &&
      originalname.toLowerCase().endsWith('.mp4')
    ) {
      this.logger.warn(
        `Mimetype is generic (${mimetype}), overriding to video/mp4 based on extension for ${originalname}.`,
      );
      finalMimeType = 'video/mp4';
    } else if (mimetype.startsWith('video/')) {
      // Already correctly identified as a video
      this.logger.debug(
        `Mimetype correctly identified as video: ${mimetype} for ${originalname}`,
      );
      finalMimeType = mimetype; // Use the detected video mimetype
    } else {
      // Handle other file types or potentially log a warning
      this.logger.warn(
        `Unexpected or non-video mimetype detected: ${mimetype} for ${originalname}`,
      );
      // You might want to throw an error or handle this differently if only videos are allowed
      finalMimeType = mimetype; // Use the detected mimetype (might still be application/octet-stream if not video)
    }
    // --- End of Workaround ---

    // Add a check if finalMimeType is still application/octet-stream here if you want to reject it
    if (finalMimeType === 'application/octet-stream') {
      this.logger.error(
        `Cannot determine proper mimetype for ${originalname}, defaulting to application/octet-stream`,
      );
    }

    return await this.s3_upload(
      buffer,
      AWS_S3_BUCKET,
      originalname,
      finalMimeType,
    );
  }

  async s3_upload(
    file: Buffer,
    bucket: string,
    name: string,
    mimetype: string,
  ): Promise<S3.ManagedUpload.SendData> {
    const targetLocation = 'POC/' + String(name);
    const params: S3.PutObjectRequest = {
      Bucket: bucket,
      Key: targetLocation,
      Body: file,
      ContentType: mimetype,
      ContentDisposition: 'inline',
    };

    try {
      const s3Response: S3.ManagedUpload.SendData = await this.s3
        .upload(params)
        .promise();

      this.logger.log('Uploaded file successfully to s3 bucket!! ');
      return s3Response;
    } catch (e) {
      this.logger.error('Error uploading file to S3:', e);
      throw e;
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
  ): Promise<S3.ManagedUpload.SendData[]> {
    this.logger.log(`Uploading ${files.length} files`);

    const uploadResults: S3.ManagedUpload.SendData[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(file);
        uploadResults.push(result);
      } catch (error) {
        this.logger.error(`Error uploading file ${file.originalname}:`, error);

        throw error;
      }
    }

    return uploadResults;
  }

  async listObject(): Promise<any> {
    this.logger.log('Listing objects in S3 bucket');

    const params: S3.Types.ListObjectsV2Request = {
      Bucket: AWS_S3_BUCKET,
      Delimiter: '/',
      Prefix: 'POC/',
    };

    const result = await this.s3.listObjectsV2(params).promise();

    console.log('List object: ', result);
    return result;
  }

  async downloadFile(fileKey: string): Promise<string> {
    this.logger.log(`Generating signed URL for file: ${fileKey}`);

    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
      Expires: 300,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      this.logger.log(`Generated signed URL: ${url}`);
      return url;
    } catch (error) {
      this.logger.error(`Error generating signed URL for ${fileKey}:`, error);
      throw error;
    }
  }

  async deleteFile(fileKey: string): Promise<S3.DeleteObjectOutput> {
    this.logger.log(`Deleting file: ${fileKey} from S3 bucket`);

    const params: S3.Types.DeleteObjectRequest = {
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
    };

    try {
      const result: S3.DeleteObjectOutput = await this.s3
        .deleteObject(params)
        .promise();

      this.logger.log(`File ${fileKey} deleted successfully`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting file ${fileKey}:`, error);
      throw error;
    }
  }
}
