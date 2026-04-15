export interface FAQItem {
    id: number | string;
    question: string;
    answer: string;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PaginationData {
    total: number;
    page: number;
    pages: number;
}

export interface CacheItem<T> {
    data: T;
    timestamp: number;
}
