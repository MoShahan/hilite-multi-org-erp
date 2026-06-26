export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

export const isAllowedPageSize = (
  pageSize: number,
): pageSize is PageSizeOption => {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize);
};
