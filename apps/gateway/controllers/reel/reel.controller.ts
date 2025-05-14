import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpException, // Import HttpException
  HttpStatus, // Import HttpStatus
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
import { UpdateReelGatewayDto } from '@app/common//dto/gateway/reel/update-reel.gateway.dto';
import { UpdateReelDto } from '@app/common//dto/microservices/reel/update-reel.dto';
import { PaginationOptions } from '@app/common//dto/interface/pagination-options.interface';
import { CreateLikeGatewayDto } from '@app/common//dto/gateway/reel/create-like.gateway.dto';
import { CreateLikeDto } from '@app/common//dto/microservices/reel/create-like.dto';
import { LikeReelResponse } from '@app/common//dto/interface/like.interface';
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
    this.logger.log(
      'Received request to create reel with video upload ,',
      file,
    );

    if (!file) {
      throw new HttpException('No video file provided', HttpStatus.BAD_REQUEST);
    }

    try {
      // 1. Upload the file to S3 (metadata like Content-Type, Content-Disposition: inline is set here)
      const uploadResult = await this.storageService.uploadFile(file);
      this.logger.debug(`S3 Upload Result: ${JSON.stringify(uploadResult)}`);

      // 2. Generate a signed URL for the uploaded file using the Key
      const fileSignedUrl = await this.storageService.downloadFile(
        uploadResult.Key,
      ); // Use downloadFile to get the signed URL

      // 3. Create the Reel object for the microservice
      // Use the S3 Key and the signed URL in the reel data
      const userId = uuidv4(); // Replace with actual user ID logic
      const reel = CreateReelDto.fromGateway(
        userId,
        body,
        uploadResult.Location, // Store the signed URL or the S3 Key/Location depending on microservice needs
        uploadResult.Key,
      );

      this.logger.debug(
        `Creating reel microservice payload: ${JSON.stringify(reel)}`,
      );

      // 4. Send data to the reel microservice
      const response = await this.networking.send<ReelRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.CREATE}`,
        reel,
      );

      // 5. Return success response with details
      return {
        message: 'Reel Created successfully',
        fileInfo: {
          bucket: uploadResult.Bucket,
          key: uploadResult.Key,
          location: uploadResult.Location, // Still include the direct location for info if needed
          signedUrl: fileSignedUrl, // Include the signed URL to be used for playback
        },
        reel: response,
      };
    } catch (error) {
      this.logger.error('Error during reel creation and upload:', error);
      // Re-throw or handle the error appropriately
      throw new HttpException(
        'Failed to create reel',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReelGatewayDto: UpdateReelGatewayDto,
  ): Promise<ReelRto> {
    this.logger.log(`Received request to update reel with id: ${id}`);

    const updateReelDto = UpdateReelDto.fromGatewayRequest(
      id,
      updateReelGatewayDto,
    );

    const payload = { id, updateReelDto };

    const reel = await this.networking.send<ReelRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.UPDATE}`,
      payload,
    );

    console.log('reel ', reel);
    return reel;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    this.logger.log(`Received request to delete reel with id: ${id}`);

    // You might want to add logic here to first get the reel details
    // from the microservice to retrieve the S3 Key, and then delete
    // the file from S3 using storageService.deleteFile() before
    // sending the delete command to the microservice.
    // Example:
    // const reelToDelete = await this.networking.send<ReelRto>(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET}`, id);
    // if (reelToDelete && reelToDelete.s3Key) { // Assuming reelToDelete has an s3Key property
    //     try {
    //         await this.storageService.deleteFile(reelToDelete.s3Key);
    //         this.logger.log(`Deleted S3 file: ${reelToDelete.s3Key}`);
    //     } catch (s3Error) {
    //         this.logger.error(`Failed to delete S3 file ${reelToDelete.s3Key}:`, s3Error);
    //         // Decide how to handle S3 deletion failure (e.g., log and continue, or throw)
    //     }
    // }

    await this.networking.send<void>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.DELETE}`,
      id,
    );
  }

  @Get('many') // Use Get for query parameters
  async getMany(
    @Query('page') page: string, // Query parameters are always strings
    @Query('limit') limit: string,
  ): Promise<ReelRto[]> {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage < 1 ||
      parsedLimit < 1
    ) {
      throw new HttpException(
        'Invalid pagination parameters. Page and limit must be positive integers.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const paginationOptions: PaginationOptions = {
      page: parsedPage,
      limit: parsedLimit,
    };

    this.logger.log(
      `Received request to get many reels with pagination: page=${paginationOptions.page}, limit=${paginationOptions.limit}`,
    );

    const reels = await this.networking.send<ReelRto[]>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_MANY}`,
      paginationOptions,
    );

    // Optional: If the microservice only returns S3 Keys,
    // you might need to loop through reels and generate signed URLs here
    // for each one before returning the list to the client.
    // E.g.,
    // for (const reel of reels) {
    //     if (reel.s3Key) {
    //         try {
    //             reel.videoUrl = await this.storageService.downloadFile(reel.s3Key);
    //         } catch(urlError) {
    //             this.logger.error(`Failed to generate signed URL for reel ${reel.id} key ${reel.s3Key}`, urlError);
    //             // Handle error - perhaps set videoUrl to null or a placeholder
    //             reel.videoUrl = null;
    //         }
    //     }
    // }

    return reels;
  }

  @Get(':id')
  async get(@Param('id') id: string): Promise<ReelRto> {
    this.logger.log(`Received request to get reel with id: ${id}`);

    const reel = await this.networking.send<ReelRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET}`,
      id,
    );

    // Optional: If the microservice only returns the S3 Key,
    // generate the signed URL here before returning the single reel.
    // E.g.,
    // if (reel && reel.s3Key) { // Assuming reel has an s3Key property
    //      try {
    //          reel.videoUrl = await this.storageService.downloadFile(reel.s3Key);
    //      } catch (urlError) {
    //         this.logger.error(`Failed to generate signed URL for reel ${reel.id} key ${reel.s3Key}`, urlError);
    //         reel.videoUrl = null;
    //      }
    // }

    return reel;
  }

  @Post('like')
  async reelLike(
    @Body() body: CreateLikeGatewayDto,
  ): Promise<LikeReelResponse> {
    const userId = uuidv4(); // Replace with actual user ID logic
    const updateReelDto = CreateLikeDto.fromGatewayRequest(userId, body);

    const reel = await this.networking.send<LikeReelResponse>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.LIKE_REEL}`,
      updateReelDto,
    );

    return reel;
  }

  @Post('share/:reelId')
  async shareReel(@Param('reelId') reelId: string): Promise<void> {
    this.logger.log(`Received request to share reel with id: ${reelId}`);
    await this.networking.send<void>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.SHARE_REEL}`,
      reelId,
    );
  }

  @Post('favorite/:reelId')
  async favoriteReel(@Param('reelId') reelId: string): Promise<void> {
    this.logger.log(`Received request to favorite reel with id: ${reelId}`);
    await this.networking.send<void>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.FAVORITE_REEL}`,
      reelId,
    );
  }

  // ... uncommented comment routes remain as they were ...
}
