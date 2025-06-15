import { LikeResponse } from '@app/common//dto/interface/like.interface';

export class LikeResponseRTO {
  public status: 'LIKED' | 'UNLIKED';
  public likeCount: number;

  constructor(status: 'LIKED' | 'UNLIKED', likeCount: number) {
    this.status = status;
    this.likeCount = likeCount;
  }

  static buildFromSeparateData(
    statusData: LikeResponse,
    likeCount: number,
  ): LikeResponseRTO {
    return new LikeResponseRTO(statusData.status, likeCount);
  }
}
