const DEVELOPMENT_REVALIDATE_SECRET = 'dev-revalidate-secret';

const getFrontendOrigin = () => {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000')
        .split(',')
        .map((value) => value.trim())
        .find(Boolean);

    return frontendUrl || 'http://localhost:3000';
};

const getRevalidateSecret = () => {
    if (process.env.REVALIDATE_SECRET) return process.env.REVALIDATE_SECRET;
    if (process.env.NODE_ENV !== 'production') return DEVELOPMENT_REVALIDATE_SECRET;
    return null;
};

const triggerRevalidation = async (tags = []) => {
    const sanitizedTags = Array.from(new Set(tags.filter(Boolean)));
    if (sanitizedTags.length === 0) return false;

    const secret = getRevalidateSecret();
    if (!secret) {
        console.warn('[revalidate] Skipped because REVALIDATE_SECRET is not configured.');
        return false;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
        const response = await fetch(`${getFrontendOrigin()}/api/revalidate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${secret}`,
            },
            body: JSON.stringify({ tags: sanitizedTags }),
            signal: controller.signal,
        });

        if (!response.ok) {
            const message = await response.text().catch(() => '');
            console.warn(`[revalidate] Failed with status ${response.status}: ${message}`);
            return false;
        }

        return true;
    } catch (error) {
        console.warn('[revalidate] Request failed:', error.message || error);
        return false;
    } finally {
        clearTimeout(timeout);
    }
};

module.exports = {
    triggerRevalidation,
};
