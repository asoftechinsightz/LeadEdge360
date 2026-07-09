/** Shared API primitives — mirrors docs/openapi.json */

export interface ApiError {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
  traceId?: string;
  status?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore?: boolean;
}

export type PaginatedResponse<T, K extends string = 'items'> = {
  meta?: PaginationMeta;
} & Record<K, T[]>;

export interface SuccessResponse {
  success?: boolean;
  ok?: boolean;
}
