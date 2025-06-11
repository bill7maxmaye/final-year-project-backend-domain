import { Reel } from '@app/common//entities/reel/reel.entity';
import { ReelPrivacy } from '@app/common//enum/reel/reel-visibility.enum';

export class ReelRto {
  constructor(
    public id: string,
    public ownerId: string,
    public videoURL: string,
    public description: string,
    public isPremiumContent: boolean,
    public duration: number,
    public hashtags: string[],
    public mentionedUserIds: string[], // Assuming this is an array of user IDs mentioned in the description
    public privacy: ReelPrivacy,
    public allowComments: boolean,
    public allowSaveToDevice: boolean,
    public saveWithWatermark: boolean,
    public audienceControlUnder18: boolean,
    public likes: number,
    public comments: number,
    public favoriteCount: number,
    public shareCount: number,
    public createdAt: string,
    public updatedAt: string,
    // --- Add the new field here ---
    public isLiked: boolean, // True if the current user has liked this reel
    // ------------------------------
  ) {}

  /**
   * Creates a ReelRto from a Reel entity, checking against a set of liked reel IDs.
   * @param entity The Reel entity from the database.
   * @param likedReelIds A Set containing the IDs of reels liked by the current user. Pass an empty Set or null/undefined if the user is not logged in.
   * @returns The ReelRto representing the reel.
   */
  static fromEntity(entity: Reel, likedReelIds?: Set<string> | null): ReelRto {
    // --- Logic to determine isLiked based on input Set ---
    // Check if the likedReelIds Set is provided and if the entity's ID exists within it.
    const isLikedByUser = likedReelIds != null && likedReelIds.has(entity.id);
    // -----------------------------------------------------

    return new ReelRto(
      entity.id,
      entity.ownerId,
      entity.videoURL,
      entity.description,
      entity.isPremiumContent,
      entity.duration,
      entity.hashtags,
      entity.mentionedUsers, // Assuming entity.mentionedUsers is already string[]
      entity.privacy,
      entity.allowComments,
      entity.allowSaveToDevice,
      entity.saveWithWatermark,
      entity.audienceControlUnder18,
      entity.likes,
      entity.comments,
      entity.favoriteCount,
      entity.shareCount,
      entity.createdAt.toISOString(),
      entity.updatedAt.toISOString(),
      // --- Pass the calculated isLiked status ---
      isLikedByUser,
      // ------------------------------------------
    );
  }

  /**
   * Creates an array of ReelRto from Reel entities, checking each against a set of liked reel IDs.
   * @param entities The array of Reel entities.
   * @param likedReelIds A Set containing the IDs of reels liked by the current user. Pass an empty Set or null/undefined if the user is not logged in.
   * @returns An array of ReelRto.
   */
  static fromEntities(
    entities: Reel[],
    likedReelIds?: Set<string> | null,
  ): ReelRto[] {
    // Pass the likedReelIds Set down to the fromEntity method for each entity
    return entities.map((entity) => ReelRto.fromEntity(entity, likedReelIds));
  }
}
