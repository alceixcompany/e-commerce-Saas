import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export type ApiEnvelope<T> = {
    success?: boolean;
    data?: T;
    message?: string;
};

export function shouldFailOnCriticalPublicDataError() {
    return process.env.CI === 'true' || process.env.STRICT_PUBLIC_DATA === 'true';
}

function extractErrorMessage(payload: unknown, fallback: string) {
    if (typeof payload === 'object' && payload !== null) {
        const message = 'message' in payload ? (payload as { message?: unknown }).message : undefined;
        if (typeof message === 'string' && message.trim()) return message;
    }

    return fallback;
}

async function baseServerFetchRaw<T>(
    endpoint: string,
    options?: RequestInit,
    authMode: 'public' | 'auth' = 'public'
): Promise<T> {
    // Ensure endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${formattedEndpoint}`;

    let authHeaders: Record<string, string> = {};

    if (authMode === 'auth') {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        authHeaders = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    }

    const headers = {
        ...options?.headers,
        ...authHeaders,
    };

    try {
        const res = await fetch(url, { ...options, headers });
        let payload: unknown = null;
        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            payload = await res.json();
        } else {
            const text = await res.text();
            payload = text ? { message: text } : null;
        }

        if (!res.ok) {
            throw new Error(extractErrorMessage(payload, `API request failed: ${url} (${res.status})`));
        }

        const json = payload as ApiEnvelope<unknown> | null;

        if (json && typeof json === 'object' && 'success' in json) {
            if (json.success === false) {
                throw new Error(extractErrorMessage(json, `API request failed: ${url}`));
            }
        }

        return payload as T;
    } catch (error) {
        console.error(`[serverFetch] Error on ${url}:`, error);
        throw error;
    }
};

async function baseServerFetch<T>(
    endpoint: string,
    options?: RequestInit,
    authMode: 'public' | 'auth' = 'public'
): Promise<T> {
    const payload = await baseServerFetchRaw<ApiEnvelope<T> | T>(endpoint, options, authMode);

    if (payload && typeof payload === 'object' && 'success' in payload) {
        const envelope = payload as ApiEnvelope<T>;
        if ('data' in envelope) {
            return envelope.data as T;
        }
    }

    return payload as T;
}

/**
 * Public server fetch.
 * Does not read request cookies, so pages can remain static/ISR when possible.
 */
export const publicServerFetch = async <T,>(endpoint: string, options?: RequestInit): Promise<T> =>
    baseServerFetch<T>(endpoint, options, 'public');

/**
 * Public server fetch that preserves the full API envelope.
 * Useful for paginated endpoints that return extra metadata next to `data`.
 */
export const publicServerFetchEnvelope = async <T,>(endpoint: string, options?: RequestInit): Promise<ApiEnvelope<T> & Record<string, unknown>> =>
    baseServerFetchRaw<ApiEnvelope<T> & Record<string, unknown>>(endpoint, options, 'public');

/**
 * Authenticated server fetch that preserves the full API envelope.
 * Useful for protected paginated endpoints returning metadata beside `data`.
 */
export const serverFetchEnvelope = async <T,>(endpoint: string, options?: RequestInit): Promise<ApiEnvelope<T> & Record<string, unknown>> =>
    baseServerFetchRaw<ApiEnvelope<T> & Record<string, unknown>>(endpoint, options, 'auth');

/**
 * Authenticated server fetch.
 * Forwards the current access token from cookies for protected endpoints.
 */
export const serverFetch = async <T,>(endpoint: string, options?: RequestInit): Promise<T> =>
    baseServerFetch<T>(endpoint, options, 'auth');
