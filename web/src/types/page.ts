export interface PageSection {
    id: string;
    label: string;
    description: string;
    isActive: boolean;
    hasSettings: boolean;
}

export interface CustomPage {
    _id: string;
    id: string; // Redux normalization
    title: string;
    slug: string;
    path: string;
    description: string;
    sections: (string | PageSection)[];
    [key: string]: any;
}

export interface PageState {
    pages: CustomPage[];
    currentPage: CustomPage | null;
    isLoading: boolean;
    hasLoadedOnce: boolean;
    error: string | null;
}
