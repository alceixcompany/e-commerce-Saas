/**
 * Maps backend error messages to translation keys.
 * This ensures that technical error messages are translated and user-friendly.
 */
export const mapAuthError = (message: string): string => {
  if (!message) return 'common.errors.unknown';

  const lowerMessage = message.toLowerCase();

  // Authentication & Management
  if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('invalid email or password')) {
    return 'auth.errors.invalid_credentials';
  }
  if (lowerMessage.includes('user already exists') || lowerMessage.includes('email already in use')) {
    return 'auth.errors.user_exists';
  }
  if (lowerMessage.includes('deactivated') || lowerMessage.includes('suspended')) {
    return 'auth.errors.deactivated';
  }
  if (lowerMessage.includes('too many requests') || lowerMessage.includes('too many attempts')) {
    return 'auth.errors.too_many_requests';
  }

  // Common Errors
  if (lowerMessage.includes('internal server error') || lowerMessage.includes('server error')) {
    return 'auth.errors.server_error';
  }
  if (lowerMessage.includes('network error') || lowerMessage.includes('fetch failed')) {
    return 'common.errors.network';
  }

  // Fallback: If it's already a translation key (e.g. from previous mapping), return it
  if (message.includes('.')) return message;

  return 'common.errors.unknown';
};
