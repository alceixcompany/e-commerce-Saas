/**
 * Extract a human-readable error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeMessage = 'message' in error ? (error as any).message : undefined;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

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
  }

  return 'Something went wrong';
};
