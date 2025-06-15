export class ModerationDto {
  constructor(
    public readonly label: string,
    public readonly score: number,
  ) {}

  static fromGateway(label: string, score: number): ModerationDto {
    return new ModerationDto(label, score);
  }
}
