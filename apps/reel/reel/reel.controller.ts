import { Controller, Logger } from '@nestjs/common';
import { ReelService } from './reel.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MICROSERVICE } from '@app/common//enum/microservice.enum';
import { CONTROLLER } from '@app/common//enum/controller.enum';
import { ACTION } from '@app/common//enum/action.enum';
import { CreateReelDto } from '@app/common//dto/microservices/reel/create-reel.dto';
import { ReelRto } from '@app/common//rto/microservices/reel/reel.rto';
import { UpdateReelDto } from '@app/common//dto/microservices/reel/update-reel.dto';

interface PaginationOptions {
  page: number;
  limit: number;
}

@Controller()
export class ReelController {
  private readonly logger = new Logger(ReelController.name);

  constructor(private readonly reelService: ReelService) {}

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.CREATE}`)
  async handleCreateReel(
    @Payload() createReelDto: CreateReelDto,
  ): Promise<ReelRto> {
    const reel = await this.reelService.createReel(createReelDto);
    return ReelRto.fromEntity(reel);
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET}`)
  async handleGetReel(@Payload() id: string): Promise<ReelRto> {
    this.logger.log(`Handling get reel with id ${id}`);
    const reel = await this.reelService.getReel(id);
    return ReelRto.fromEntity(reel);
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.UPDATE}`)
  async handleUpdateReel(
    @Payload() payload: { id: string; updateReelDto: UpdateReelDto },
  ): Promise<ReelRto> {
    this.logger.log(`Handling update reel with id ${payload.id}`);
    const reel = await this.reelService.updateReel(
      payload.id,
      payload.updateReelDto,
    );
    return ReelRto.fromEntity(reel);
  }

  @MessagePattern(`${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.DELETE}`)
  async handleDeleteReel(@Payload() id: string): Promise<void> {
    this.logger.log(`Handling delete reel with id ${id}`);
    await this.reelService.deleteReel(id);
  }

  @MessagePattern(
    `${MICROSERVICE.REELS}.${CONTROLLER.REELS}.${ACTION.GET_MANY}`,
  )
  async handleGetManyReels(
    @Payload()
    payload: {
      reelIds: string[];
      paginationOptions: PaginationOptions;
    },
  ): Promise<ReelRto[]> {
    // this.logger.log(
    //   `Handling get many reels with ids ${payload.reelIds} and pagination options ${JSON.stringify(
    //     payload.paginationOptions,
    //   )}`,
    // );
    const reels = await this.reelService.getManyReels(
      payload.reelIds,
      payload.paginationOptions,
    );
    return ReelRto.fromEntities(reels);
  }
}
