export class MentionedUser {
  constructor(
    public userId: string,
    public username: string,
  ) {}

  static fromDocument(userId: string, username: string): MentionedUser {
    return new MentionedUser(userId, username);
  }

  static fromDocuments(
    mensionedUsers: {
      userId: string;
      username: string;
    }[],
  ): MentionedUser[] {
    return mensionedUsers.map((document) =>
      MentionedUser.fromDocument(document.userId, document.username),
    );
  }
}
