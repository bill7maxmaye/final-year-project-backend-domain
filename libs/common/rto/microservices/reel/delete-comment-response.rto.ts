export class DeleteCommentResponseRto {
  deletedCommentReelId: string;
  newReelCommentCount: number;

  private constructor(deletedCommentId: string, newReelCommentCount: number) {
    this.deletedCommentReelId = deletedCommentId;
    this.newReelCommentCount = newReelCommentCount;
  }

  static from(
    deletedCommentReelId: string,
    newReelCommentCount: number,
  ): DeleteCommentResponseRto {
    return new DeleteCommentResponseRto(
      deletedCommentReelId,
      newReelCommentCount,
    );
  }
}
