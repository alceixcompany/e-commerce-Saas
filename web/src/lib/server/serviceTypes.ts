import type { PaginationData } from '@/types/common';

export type RawPaginatedPayload<T, TExtra extends object = {}> = TExtra & {
    data?: T[];
    total?: number;
    page?: number;
    pages?: number;
};

export interface PaginatedResult<T, TMeta extends object = {}> {
    data: T[];
    metadata: PaginationData & TMeta;
}

export interface SectionContentPayload<TContent> {
    identifier?: string;
    content?: TContent;
}

export const DEFAULT_PAGE = 1;

export const normalizePaginatedResult = <T, TMeta extends object = {}>(
    payload: { data?: T[]; total?: number; page?: number; pages?: number } | null | undefined,
    metadataExtras?: TMeta
): PaginatedResult<T, TMeta> => ({
    data: payload?.data ?? [],
    metadata: {
        total: payload?.total ?? 0,
        page: payload?.page ?? DEFAULT_PAGE,
        pages: payload?.pages ?? DEFAULT_PAGE,
        ...(metadataExtras ?? ({} as TMeta)),
    },
});
