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
  HttpException,
  HttpStatus,
  UseGuards,
  BadRequestException,
  ParseIntPipe,
  ParseIntPipeOptions,
} from '@nestjs/common';
import { ReelService } from './reel.service';
import { CreateReelGatewayDto } from '@app/common//dto/gateway/reel/create-reel.gateway.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'apps/gateway/storage/storage.service';
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
import { CreateReportGatewayDto } from '@app/common//dto/gateway/reel/create-report.gateway.dto';
import { ReportRto } from '@app/common//rto/microservices/reel/report.rto';
import { CreateReportDto } from '@app/common//dto/microservices/reel/create-report.dto';
import { UpdateReportGatewayDto } from '@app/common//dto/gateway/reel/update-report.gateway.dto';
import { UpdateReportDto } from '@app/common//dto/microservices/reel/update-report.dto';
import { JwtAuthGuard } from '@app/common//guards/jwt-auth.guard';
import { ActiveUser } from '@app/common//decorators/active-user-decorator';
import { User } from '@app/common//entities/user/user-entity';
import { ReportedEntityType } from '@app/common//enum/reel/reported-entity-type.enum';
import { ReelGatewayRto } from '@app/common//rto/gateway/reel/reel-gateway.rto';
import { SuccessRto } from '@app/common//rto/success.rto';
import { LikeResponseRTO } from '@app/common//rto/microservices/reel/like-response.rto';
@Controller('reel')
@UseGuards(JwtAuthGuard)
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
    @ActiveUser() user: User,
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
      const uploadResult = await this.storageService.uploadFile(file);
      this.logger.debug(`S3 Upload Result: ${JSON.stringify(uploadResult)}`);

      const fileSignedUrl = await this.storageService.downloadFile(
        uploadResult.Key,
      );

      const userId = user.id;

      const reel = CreateReelDto.fromGateway(
        userId,
        body,
        uploadResult.Location,
        uploadResult.Key,
      );

      this.logger.debug(
        `Creating reel microservice payload: ${JSON.stringify(reel)}`,
      );

      const response = await this.networking.send<ReelRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.CREATE}`,
        reel,
      );

      return {
        message: 'Reel Created successfully',
        fileInfo: {
          bucket: uploadResult.Bucket,
          key: uploadResult.Key,
          location: uploadResult.Location,
          signedUrl: fileSignedUrl,
        },
        reel: response,
      };
    } catch (error) {
      this.logger.error('Error during reel creation and upload:', error);
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
  async delete(@Param('id') id: string): Promise<SuccessRto> {
    this.logger.log(`Received request to delete reel with id: ${id}`);

    try {
      const reelKey = await this.networking.send<string>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.DELETE}`,
        id,
      );

      if (reelKey) {
        try {
          await this.storageService.deleteFile(reelKey);
          this.logger.log(`Deleted S3 file: ${reelKey}`);
        } catch (s3Error) {
          this.logger.error(`Failed to delete S3 file ${reelKey}:`, s3Error);
          // Decide how to handle S3 deletion failure (e.g., log and continue, or throw)
          // For example, you could throw the error to stop the process if S3 deletion is critical:
          // throw new Error(`Failed to delete S3 file: ${reelToDelete.s3Key}.  Error: ${s3Error}`);

          // OR you could log and continue, depending on your requirements.
        }
      }

      return new SuccessRto();
    } catch (error) {
      this.logger.error(`Error deleting reel with id: ${id}`, error);
      // Handle the error appropriately.  This might involve throwing an exception,
      // returning a specific error response, or logging and retrying.

      // Example: Throwing a custom error:
      throw new Error(`Failed to delete reel with id: ${id}. Error: ${error}`);

      // Or, return a specific error response:
      // return { success: false, message: 'Failed to delete reel' };
    }
  }

  @Get('many')
  async getMany(
    @ActiveUser() user: User,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ): Promise<ReelGatewayRto[]> {
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
      { paginationOptions: paginationOptions, userid: user.id },
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

    return this.reelService.populateReelList(reels);
  }

  @Get('after')
  async getReelsCreatedAfter(
    @ActiveUser() user: User,
    @Query('createdAt') createdAtString: string,
    @Query('limit', new ParseIntPipe({ optional: true } as ParseIntPipeOptions))
    limit?: number,
  ): Promise<ReelGatewayRto[]> {
    this.logger.log(
      `Received request to get reels created after "${createdAtString}" with limit ${limit}`,
    );

    // --- START: Date Parsing Logic ---
    let processedDateString = createdAtString.trim(); // Trim whitespace from ends

    // Attempt to correct a common non-standard format: space before offset (e.g., " 00:00")
    // Replace the LAST space with a '+' if it precedes a potential HH:mm offset
    // This is a targeted fix for the specific format shown in the error.
    const lastSpaceIndex = processedDateString.lastIndexOf(' ');
    if (
      lastSpaceIndex > -1 &&
      /^\d{2}:\d{2}$/.test(processedDateString.substring(lastSpaceIndex + 1))
    ) {
      processedDateString =
        processedDateString.substring(0, lastSpaceIndex) +
        '+' +
        processedDateString.substring(lastSpaceIndex + 1);
      this.logger.debug(
        `Corrected date string by replacing last space with +: "${createdAtString}" -> "${processedDateString}"`,
      );
    } else {
      // As a fallback, try replacing ANY space with a + sign.
      // This is less precise but might help with variations.
      // Note: This might incorrectly handle spaces within the date part if your input varies greatly.
      const originalProcessed = processedDateString;
      processedDateString = processedDateString.replace(/\s/g, '+');
      if (originalProcessed !== processedDateString) {
        this.logger.debug(
          `Corrected date string by replacing all spaces with +: "${createdAtString}" -> "${processedDateString}"`,
        );
      }
    }

    const createdAt = new Date(processedDateString); // Attempt parsing with the corrected string

    // Validate the parsed date
    if (isNaN(createdAt.getTime())) {
      this.logger.warn(
        `Failed to parse date string even after correction: "${createdAtString}" -> "${processedDateString}"`,
      );
      throw new BadRequestException(
        `Invalid date format provided for 'createdAt': ${createdAtString}. Expected ISO 8601 or similar.`,
      );
    }
    this.logger.debug(
      `Successfully parsed date string: "${createdAtString}" -> ${createdAt.toISOString()}`,
    );
    // --- END: Date Parsing Logic ---

    try {
      console.log('createdAt', createdAt);
      const reelsRtos = await this.networking.send<ReelRto[]>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_CREATED_AFTER}`,
        { createdAt: createdAt, limit, userid: user.id }, // Send the ISO string
      );

      // Populate the list of ReelRtos with gateway-specific data (like signed URLs)
      return this.reelService.populateReelList(reelsRtos);
    } catch (error) {
      this.logger.error(
        `Error handling get reels created after ${createdAtString}:`,
        error,
      );
      // Map microservice errors to appropriate HTTP exceptions if needed
      // For example, if the microservice throws NotFoundException, you might
      // catch it here and throw a NestJS NotFoundException.
      // Currently, it throws a generic 500 error for any microservice failure.
      throw new HttpException(
        'Failed to fetch reels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    @ActiveUser() user: User,
    @Body() body: CreateLikeGatewayDto,
  ): Promise<LikeResponseRTO> {
    const userId = user.id;
    const updateReelDto = CreateLikeDto.fromGatewayRequest(userId, body);

    const reel = await this.networking.send<LikeResponseRTO>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.LIKE_REEL}`,
      updateReelDto,
    );

    return reel;
  }

  @Post('share/:reelId')
  async shareReel(@Param('reelId') reelId: string): Promise<SuccessRto> {
    this.logger.log(`Received request to share reel with id: ${reelId}`);
    const response = await this.networking.send<SuccessRto>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.SHARE_REEL}`,
      reelId,
    );
    return response;
  }

  @Post('favorite/:reelId')
  async favoriteReel(@Param('reelId') reelId: string): Promise<void> {
    this.logger.log(`Received request to favorite reel with id: ${reelId}`);
    await this.networking.send<void>(
      `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.FAVORITE_REEL}`,
      reelId,
    );
  }

  @Post('report')
  async createReport(
    @ActiveUser() user: User,
    @Body() createReportGatewayDto: CreateReportGatewayDto,
  ): Promise<ReportRto> {
    this.logger.log(
      `Received request to create a report: ${JSON.stringify(createReportGatewayDto)}`,
    );

    try {
      const reporterId = user.id;

      const createReportDto = CreateReportDto.fromGatewayRequest(
        reporterId,
        createReportGatewayDto,
      );

      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.CREATE}`,
        createReportDto,
      );

      return report;
    } catch (error) {
      this.logger.error('Error creating report:', error);
      throw new HttpException(
        'Failed to create report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('report/:id')
  async getReport(@Param('id') id: string): Promise<ReportRto> {
    this.logger.log(`Received request to get report with id: ${id}`);

    try {
      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.GET}`,
        id,
      );
      return report;
    } catch (error) {
      this.logger.error(`Error getting report ${id}:`, error);
      throw new HttpException(
        'Failed to get report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getReportsByEntityId(
    @Query('reportedEntityId') reportedEntityId: string,
    @Query('reportedEntityType') reportedEntityType: ReportedEntityType,
  ) {
    try {
      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.GET_REPORTS_BY_ENTITY}`,
        {
          reportedEntityType: reportedEntityType,
          reportedEntityId: reportedEntityId,
        },
      );
      return report;
    } catch (error) {
      this.logger.error(`Error getting report ${reportedEntityId}:`, error);
      throw new HttpException(
        'Failed to get report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('report/:id')
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportGatewayDto: UpdateReportGatewayDto,
  ): Promise<ReportRto> {
    this.logger.log(`Received request to update report with id: ${id}`);

    try {
      const updateReportDto = UpdateReportDto.fromGatewayRequest(
        id,
        updateReportGatewayDto,
      );

      const report = await this.networking.send<ReportRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.UPDATE}`,
        updateReportDto,
      );
      return report;
    } catch (error) {
      this.logger.error(`Error updating report ${id}:`, error);
      throw new HttpException(
        'Failed to update report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('report/:id')
  async deleteReport(@Param('id') id: string): Promise<SuccessRto> {
    this.logger.log(`Received request to delete report with id: ${id}`);

    try {
      const response = await this.networking.send<SuccessRto>(
        `${MICROSERVICE.REELS}.${CONTROLLER.REPORTS}.${ACTION.DELETE}`,
        id,
      );
      return response;
    } catch (error) {
      this.logger.error(`Error deleting report ${id}:`, error);
      throw new HttpException(
        'Failed to delete report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
