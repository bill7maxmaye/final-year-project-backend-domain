import {
  Body,
  Controller,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ReelService } from './reel.service';
import { CreateReelGatewayDto } from '@app/common//dto/gateway/reel/create-reel.gateway.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'apps/gateway/storage/storage.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateReelDto } from '@app/common//dto/microservices/reel/create-reel.dto';
import { NetworkingService } from '@pp/networking';
import { ReelRto } from '@app/common//rto/microservices/reel/reel.rto';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';

@Controller('reel')
export class ReelController {
  private readonly logger = new Logger(ReelController.name);

  constructor(
    private readonly reelService: ReelService,
    private readonly storageService: StorageService,
    private readonly networking: NetworkingService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('videoFile'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateReelGatewayDto,
  ) {
    this.logger.log('Received request to upload file with additional data');

    try {
      const uploadResult = await this.storageService.uploadFile(file);
      const userId = uuidv4();

      const reel = CreateReelDto.fromGateway(
        userId,
        body,
        uploadResult.Location,
        uploadResult.Key,
      );

      this.logger.debug(`Creating reel: ${JSON.stringify(reel)}`);

      const response = await this.networking.send<ReelRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.CREATE}`,
        reel,
      );

      return {
        message: 'Reel Created successfully',
        fileInfo: uploadResult,
        reel: response,
      };
    } catch (error) {
      this.logger.error('Error during upload:', error);
      throw error;
    }
  }
}
