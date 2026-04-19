import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const DEVELOPMENT_REVALIDATE_SECRET = 'dev-revalidate-secret';

const getExpectedSecret = () => {
    if (process.env.REVALIDATE_SECRET) return process.env.REVALIDATE_SECRET;
    if (process.env.NODE_ENV !== 'production') return DEVELOPMENT_REVALIDATE_SECRET;
    return null;
};

export async function POST(request: NextRequest) {
    const expectedSecret = getExpectedSecret();

    if (!expectedSecret) {
        return NextResponse.json(
            { success: false, message: 'Missing REVALIDATE_SECRET configuration' },
            { status: 500 }
        );
    }

    const authHeader = request.headers.get('authorization');
    const providedSecret = authHeader?.startsWith('Bearer ')
        ? authHeader.slice('Bearer '.length)
        : request.nextUrl.searchParams.get('secret');

    if (providedSecret !== expectedSecret) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const tags = Array.isArray(body?.tags)
        ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && tag.trim().length > 0)
        : [];

    if (tags.length === 0) {
        return NextResponse.json({ success: false, message: 'No tags provided' }, { status: 400 });
    }

    tags.forEach((tag: string) => revalidateTag(tag, 'max'));

    return NextResponse.json({
        success: true,
        revalidated: true,
        tags,
    });
}
