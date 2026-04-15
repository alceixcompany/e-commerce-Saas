import * as Sections from './sections';

export interface PageSection {
    id: string;
    label: string;
    description: string;
    isActive: boolean;
    hasSettings: boolean;
    instanceData?: Sections.SectionData;
}

export interface CustomPage {
    _id: string;
    id: string; // Redux normalization
    title: string;
    slug: string;
    path: string;
    description: string;
    sections: (string | PageSection)[];
    [key: string]: unknown;
}

export interface PageState {
    pages: CustomPage[];
    currentPage: CustomPage | null;
    isLoading: boolean;
    hasLoadedOnce: boolean;
    error: string | null;
}
