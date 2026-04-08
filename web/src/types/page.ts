export interface CustomPage {
    _id: string;
    title: string;
    slug: string;
    path: string;
    description: string;
    sections: any[];
    [key: string]: any; // Allow for dynamic sections like advantageSection
}

export interface PageState {
    pages: CustomPage[];
    currentPage: CustomPage | null;
    isLoading: boolean;
    hasLoadedOnce: boolean;
    error: string | null;
}
