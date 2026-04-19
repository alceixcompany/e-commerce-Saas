type ServerFetchOptions = RequestInit & {
    next?: {
        revalidate?: number | false;
        tags?: string[];
    };
};

const uniqueTags = (tags: Array<string | undefined | null>) =>
    Array.from(new Set(tags.filter((tag): tag is string => Boolean(tag && tag.trim()))));

export const buildTaggedFetchOptions = (
    tags: Array<string | undefined | null>,
    revalidateSeconds: number,
    preview = false
): ServerFetchOptions => {
    if (preview) {
        return { cache: 'no-store' };
    }

    return {
        next: {
            revalidate: revalidateSeconds,
            tags: uniqueTags(tags),
        },
    };
};
