export class ShareReelResponseRto {
  sharedReel: string;
  shareCount: number;

  private constructor(sharedReel: string, shareCount: number) {
    this.sharedReel = sharedReel;
    this.shareCount = shareCount;
  }

  static from(sharedReel: string, shareCount: number): ShareReelResponseRto {
    return new ShareReelResponseRto(sharedReel, shareCount);
  }
}
