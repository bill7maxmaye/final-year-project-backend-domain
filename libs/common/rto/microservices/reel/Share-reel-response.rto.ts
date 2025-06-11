export class ShareReelResponseRto {
  // Public property matching the JSON key
  sharedReel: string;
  shareCount: number;

  // Private constructor
  // Parameter names match the properties for clarity
  private constructor(sharedReel: string, shareCount: number) {
    this.sharedReel = sharedReel;
    this.shareCount = shareCount;
  }

  // Static factory method to create an instance
  static from(sharedReel: string, shareCount: number): ShareReelResponseRto {
    return new ShareReelResponseRto(sharedReel, shareCount);
  }
}
