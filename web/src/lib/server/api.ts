import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Server-side wrapper for native fetch.
 * Handles generic error checking and formatting returned by the specific backend API.
 * Automatically forwards auth token from cookies.
 */
export const serverFetch = async <T,>(endpoint: string, options?: RequestInit): Promise<T> => {
    // Ensure endpoint starts with a slash
    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${formattedEndpoint}`;
    
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    const headers = {
        ...options?.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    try {
        const res = await fetch(url, { ...options, headers });
        const json = await res.json();
        
        // If your API wraps data inside `data` property and success flag
        if (!json?.success && !json?.data) {
            throw new Error(json?.message || `API request failed: ${url}`);
        }
        
        return json.data as T;
    } catch (error) {
        console.error(`[serverFetch] Error on ${url}:`, error);
        throw error;
    }
};
