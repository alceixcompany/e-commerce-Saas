export interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: {
        _id: string;
        name: string;
    };
    tags: string[];
    isPublished: boolean;
    publishedAt: string;
    views: number;
    createdAt: string;
}

export interface BlogState {
    blogs: Blog[];
    blog: Blog | null;
    isLoading: boolean;
    error: string | null;
    metadata: {
        total: number;
        page: number;
        pages: number;
    };
}
