/**
 * Translation Helper Utility
 * Tiện ích hỗ trợ dịch thuật
 */

import viVN from '../locales/vi-VN';

// Current locale (can be extended to support multiple languages)
const currentLocale = viVN;

/**
 * Get translation by key path
 * @param {string} keyPath - Dot-notation path to translation key (e.g., 'patient.title.new')
 * @param {object} params - Optional parameters for string interpolation
 * @returns {string} Translated string
 */
export const t = (keyPath, params = {}) => {
  const keys = keyPath.split('.');
  let value = currentLocale;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath;
    }
  }

  // If value is an object, something went wrong
  if (typeof value !== 'string') {
    console.warn(`Translation key is not a string: ${keyPath}`);
    return keyPath;
  }

  // Interpolate parameters
  return interpolate(value, params);
};

/**
 * Interpolate parameters into translation string
 * @param {string} str - String with placeholders like {name}
 * @param {object} params - Parameters to interpolate
 * @returns {string} Interpolated string
 */
const interpolate = (str, params) => {
  if (!params || Object.keys(params).length === 0) {
    return str;
  }

  return str.replace(/\{(\w+)\}/g, (match, key) => {
    return params.hasOwnProperty(key) ? params[key] : match;
  });
};

/**
 * Get translation object by key path
 * Useful for accessing multiple related translations
 * @param {string} keyPath - Dot-notation path to translation object
 * @returns {object} Translation object
 */
export const getTranslations = (keyPath) => {
  const keys = keyPath.split('.');
  let value = currentLocale;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Translation object not found: ${keyPath}`);
      return {};
    }
  }

  return value;
};

/**
 * Check if translation key exists
 * @param {string} keyPath - Dot-notation path to translation key
 * @returns {boolean} True if key exists
 */
export const hasTranslation = (keyPath) => {
  const keys = keyPath.split('.');
  let value = currentLocale;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return false;
    }
  }

  return typeof value === 'string';
};

/**
 * Get localized error message from backend error response
 * Converts backend error codes to Vietnamese error messages
 * @param {object} error - Axios error object from API call
 * @returns {string} Localized error message in Vietnamese
 */
export const getLocalizedErrorMessage = (error) => {
  // No response - network error
  if (!error.response) {
    return t('errors.connection');
  }

  const { data, status } = error.response;

  // Check for errorCode field (sent by backend GlobalExceptionHandler)
  if (data && data.errorCode) {
    const errorKey = `errors.backend.${data.errorCode}`;
    
    // Try to get localized message for this error code
    if (hasTranslation(errorKey)) {
      return t(errorKey);
    }
  }

  // Fallback: Use HTTP status code
  switch (status) {
    case 400:
      return t('errors.invalidData');
    case 404:
      return t('errors.notFound');
    case 409:
      // Check if it's a duplicate phone error
      if (data && data.errorCode === 'DUPLICATE_PHONE') {
        return t('errors.duplicatePhone');
      }
      if (data && data.message && data.message.toLowerCase().includes('phone')) {
        return t('errors.duplicatePhone');
      }
      return t('errors.conflict');
    case 500:
      return t('errors.server');
    default:
      // Last resort: use backend message or generic error
      if (data && data.message) {
        return data.message;
      }
      return t('errors.backend.UNKNOWN_ERROR');
  }
};

export default {
  t,
  getTranslations,
  hasTranslation,
  getLocalizedErrorMessage
};
