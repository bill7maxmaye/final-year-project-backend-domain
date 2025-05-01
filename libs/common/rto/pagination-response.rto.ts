export class PaginationResponseRto {
  constructor(
    public totalItems: number,
    public currentPage: number,
    public pageSize: number,
    // Optional properties like totalPages and hasNext can be calculated
    public totalPages?: number,
    public hasNext?: boolean,
  ) {
    this.totalPages = Math.ceil(totalItems / pageSize);
    this.hasNext = currentPage < this.totalPages;
  }
}
