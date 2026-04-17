/**
 * Extracts a human-readable error message from various error types.
 * Standardizes error handling across the application.
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') return error;
    
    if (error instanceof Error) return error.message;
    
    if (typeof error === 'object' && error !== null) {
        const maybeError = error as { 
            message?: unknown; 
            error?: unknown; 
            response?: { data?: { message?: unknown } } 
        };
        
        // Handle Axios error responses
        if (maybeError.response?.data?.message) {
            return String(maybeError.response.data.message);
        }
        
        if (typeof maybeError.message === 'string') return maybeError.message;
        if (typeof maybeError.error === 'string') return maybeError.error;
    }
    
    return 'An unexpected error occurred';
}
