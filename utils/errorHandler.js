// Error handling utility for user-friendly error messages


// Firebase Auth Error Codes and their user-friendly messages
const FIREBASE_AUTH_ERRORS = {
  'auth/user-not-found': 'Account not found. Please check your email and try again.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'This email is already registered. Please use a different email or try signing in.',
  'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/too-many-requests': 'Too many failed attempts. Please wait a moment and try again.',
  'auth/requires-recent-login': 'For security reasons, please sign in again to perform this action.',
  'auth/network-request-failed': 'Network connection issue. Please check your internet connection.',
  'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
  'auth/quota-exceeded': 'Service quota exceeded. Please try again later.',
  'auth/timeout': 'Request timed out. Please try again.',
  'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
};

// Cloudinary Error Messages
const CLOUDINARY_ERRORS = {
  'upload_error': 'Failed to upload image. Please try again.',
  'invalid_file': 'Invalid image file. Please select a valid image.',
  'file_too_large': 'Image file is too large. Please select a smaller image.',
  'quota_exceeded': 'Upload quota exceeded. Please try again later.',
  'network_error': 'Network error during upload. Please check your connection.',
  'server_error': 'Upload service temporarily unavailable. Please try again.',
  'rate_limit_exceeded': 'Too many upload attempts. Please wait a moment.',
  'invalid_format': 'Unsupported image format. Please use JPEG, PNG, or GIF.',
  'corrupted_file': 'Image file appears to be corrupted. Please try another image.',
  'timeout': 'Upload timed out. Please try again.',
  'connection_failed': 'Connection to upload service failed. Please check your internet.',
};

// Network Error Messages
const NETWORK_ERRORS = {
  'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
  'TIMEOUT': 'Request timed out. Please try again.',
  'CONNECTION_REFUSED': 'Unable to connect to server. Please try again.',
  'DNS_ERROR': 'Unable to reach server. Please check your connection.',
  'SSL_ERROR': 'Secure connection failed. Please try again.',
  'ABORTED': 'Request was cancelled.',
  'FAILED': 'Request failed. Please try again.',
};

// General Error Messages
const GENERAL_ERRORS = {
  'PERMISSION_DENIED': 'Permission denied. Please check your settings.',
  'FILE_NOT_FOUND': 'File not found. Please try again.',
  'INVALID_INPUT': 'Invalid input provided. Please check your data.',
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.',
  'QUOTA_EXCEEDED': 'Service limit reached. Please try again later.',
  'SERVICE_UNAVAILABLE': 'Service temporarily unavailable. Please try again.',
  'MAINTENANCE': 'Service is under maintenance. Please try again later.',
  'UNKNOWN': 'An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message based on error type and code
 */
export const getErrorMessage = (error, context = 'general') => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Handle Firebase Auth errors
  if (context === 'auth' && error.code) {
    const firebaseMessage = FIREBASE_AUTH_ERRORS[error.code];
    if (firebaseMessage) {
      return firebaseMessage;
    }
  }

  // Handle Cloudinary errors
  if (context === 'upload' || context === 'cloudinary') {
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('upload') || errorMessage.includes('cloudinary')) {
      for (const [key, message] of Object.entries(CLOUDINARY_ERRORS)) {
        if (errorMessage.includes(key.toLowerCase())) {
          return message;
        }
      }
      return CLOUDINARY_ERRORS.upload_error;
    }
  }

  // Handle network errors
  if (context === 'network' || error.message?.toLowerCase().includes('network')) {
    const errorMessage = error.message?.toLowerCase() || '';
    
    for (const [key, message] of Object.entries(NETWORK_ERRORS)) {
      if (errorMessage.includes(key.toLowerCase())) {
        return message;
      }
    }
    return NETWORK_ERRORS.NETWORK_ERROR;
  }

  // Handle general errors with common patterns
  const errorMessage = error.message?.toLowerCase() || '';
  
  // Check for rate limiting
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
    return GENERAL_ERRORS.RATE_LIMIT;
  }

  // Check for quota exceeded
  if (errorMessage.includes('quota') || errorMessage.includes('limit exceeded')) {
    return GENERAL_ERRORS.QUOTA_EXCEEDED;
  }

  // Check for service unavailable
  if (errorMessage.includes('service unavailable') || errorMessage.includes('maintenance')) {
    return GENERAL_ERRORS.SERVICE_UNAVAILABLE;
  }

  // Check for permission denied
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
    return GENERAL_ERRORS.PERMISSION_DENIED;
  }

  // Check for validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return GENERAL_ERRORS.VALIDATION_ERROR;
  }

  // Check for timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return NETWORK_ERRORS.TIMEOUT;
  }

  // Check for connection issues
  if (errorMessage.includes('connection') || errorMessage.includes('network')) {
    return NETWORK_ERRORS.NETWORK_ERROR;
  }

  // Check for file not found
  if (errorMessage.includes('file not found') || errorMessage.includes('not found')) {
    return GENERAL_ERRORS.FILE_NOT_FOUND;
  }

  // Default fallback
  return error.message || GENERAL_ERRORS.UNKNOWN;
};

/**
 * Get error title based on context
 */
export const getErrorTitle = (context = 'general') => {
  const titles = {
    'auth': 'Authentication Error',
    'upload': 'Upload Failed',
    'cloudinary': 'Image Upload Failed',
    'network': 'Connection Error',
    'profile': 'Profile Update Failed',
    'account': 'Account Error',
    'logout': 'Logout Failed',
    'delete': 'Deletion Failed',
    'name': 'Name Update Failed',
    'avatar': 'Avatar Update Failed',
    'general': 'Error'
  };

  return titles[context] || titles.general;
};

export default {
  getErrorMessage,
  getErrorTitle
};
