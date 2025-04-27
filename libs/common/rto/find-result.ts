export class FindResult<T> {
  constructor(
    public data: T[],
    public total: number,
    public next?: string,
    public previous?: string,
  ) {}

  static fromListAll<T>(
    data: T[],
    total?: number,
    next?: string,
    previous?: string,
  ) {
    return new FindResult<T>(data, total ?? data.length, next, previous);
  }

  static fromDefault<T>(): FindResult<T> {
    return new FindResult<T>([], 0);
  }
}
