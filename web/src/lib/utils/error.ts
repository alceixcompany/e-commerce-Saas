/**
 * Extract a human-readable error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    // 1. Check for specific backend response messages (Axios format)
    const response = 'response' in error ? (error as any).response : undefined;
    if (typeof response === 'object' && response !== null && 'data' in response) {
      const responseData = response.data;
      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        const responseMessage = responseData.message;
        if (typeof responseMessage === 'string' && responseMessage.trim()) {
          return responseMessage;
        }
      }
    }

    // 2. Check for top-level message property (or generic error message)
    const maybeMessage = 'message' in error ? (error as any).message : undefined;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      // Avoid generic Axios status errors if possible, but use as fallback
      return maybeMessage;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong';
};
