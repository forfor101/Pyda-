/**
 * Real-time Form Validation Utilities for Megatrend Movers & Logistics
 * Handles client-side validation with actionable error feedback.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  isUrgent?: boolean;
}

/**
 * Validates full name: minimum 2 characters, letters, spaces, hyphens, dots.
 */
export const validateFullName = (name: string): ValidationResult => {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  if (!/^[a-zA-Z\u00C0-\u024F\s\.\-']+$/.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid name without special symbols or numbers.' };
  }
  return { isValid: true };
};

/**
 * Validates phone / WhatsApp numbers (Nigerian & International formats).
 * Accepts: 08062466212, +2348062466212, 09012345678, +1-555-..., etc.
 */
export const validatePhone = (phone: string): ValidationResult => {
  const trimmed = (phone || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone or WhatsApp number is required.' };
  }

  // Strip spaces, dashes, parentheses
  const cleanDigits = trimmed.replace(/[\s\-\(\)\.]/g, '');

  // Must contain only digits or start with + followed by digits
  if (!/^\+?[0-9]{9,15}$/.test(cleanDigits)) {
    return {
      isValid: false,
      error: 'Please enter a valid phone number (9 to 15 digits, e.g. 0806 246 6212 or +234 806 246 6212).'
    };
  }

  // Check if standard Nigerian local format (starts with 0 and has 11 digits)
  if (cleanDigits.startsWith('0') && cleanDigits.length !== 11) {
    return {
      isValid: false,
      error: `Nigerian phone numbers starting with '0' must be exactly 11 digits (currently ${cleanDigits.length} digits).`
    };
  }

  // Check if international Nigerian format (+234 followed by 10 digits)
  if (cleanDigits.startsWith('+234') && cleanDigits.length !== 14) {
    return {
      isValid: false,
      error: `Nigerian numbers with +234 should have 10 digits after the prefix (e.g. +2348062466212).`
    };
  }

  return { isValid: true };
};

/**
 * Validates email addresses using standard RFC-compliant pattern.
 */
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = (email || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email address is required.' };
  }

  // Standard email regex requiring @ and at least one dot in domain with 2+ char TLD
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address (e.g. name@company.com).'
    };
  }

  // Prevent consecutive dots or trailing dots
  if (trimmed.includes('..') || trimmed.endsWith('.')) {
    return { isValid: false, error: 'Email cannot contain consecutive or trailing periods.' };
  }

  return { isValid: true };
};

/**
 * Validates moving date (prevents past dates, flags urgent bookings within 48 hours).
 */
export const validateMovingDate = (dateStr: string): ValidationResult => {
  if (!dateStr) {
    return { isValid: false, error: 'Target moving date is required.' };
  }

  const selectedDate = new Date(dateStr);
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Please select a valid date.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateStr);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      isValid: false,
      error: 'Moving date cannot be in the past. Please choose today or a future date.'
    };
  }

  if (diffDays <= 2) {
    return {
      isValid: true,
      isUrgent: true,
      warning: '⚡ Express / Urgent dispatch: Same-day or 48-hour bookings receive immediate coordinator dispatch.'
    };
  }

  return { isValid: true };
};

/**
 * Validates message / inquiry details: minimum character length.
 */
export const validateMessage = (message: string, minLength: number = 10): ValidationResult => {
  const trimmed = (message || '').trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please provide details about your moving requirement.' };
  }
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `Please provide more details (${trimmed.length}/${minLength} characters minimum).`
    };
  }
  return { isValid: true };
};
