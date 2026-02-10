/**
 * Vietnamese (vi-VN) Formatting Utilities
 * Các tiện ích định dạng cho Việt Nam
 */

/**
 * Format date to Vietnamese format (dd/MM/yyyy)
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Format date for input[type="date"] (yyyy-MM-dd)
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format currency to Vietnamese Dong (₫)
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0₫';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format number with Vietnamese locale
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  
  return new Intl.NumberFormat('vi-VN').format(number);
};

/**
 * Parse currency input (remove formatting)
 * @param {string} value - Currency string
 * @returns {number} Parsed number
 */
export const parseCurrency = (value) => {
  if (!value) return 0;
  
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.,]/g, '');
  
  // Replace comma with dot for decimal parsing
  const normalized = cleaned.replace(',', '.');
  
  return parseFloat(normalized) || 0;
};

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number string
 * @returns {boolean} True if valid
 */
export const isValidVietnamesePhone = (phone) => {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Vietnamese phone numbers are 10-11 digits
  // Mobile: 09x, 08x, 07x, 05x, 03x (10 digits)
  // Landline: 02x (10-11 digits)
  if (cleaned.length < 10 || cleaned.length > 11) return false;
  
  // Check if starts with valid prefix
  const validPrefixes = ['09', '08', '07', '05', '03', '02'];
  return validPrefixes.some(prefix => cleaned.startsWith(prefix));
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number string
 * @returns {string} Formatted phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as: 0xxx xxx xxx or 0xx xxx xxxx
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  }
  
  return phone;
};

/**
 * Get current date in Vietnamese timezone
 * @returns {Date} Current date
 */
export const getCurrentDate = () => {
  return new Date();
};

/**
 * Check if date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * Format date with time
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateObj);
};

/**
 * Parse Vietnamese date format (dd/MM/yyyy) to ISO format (yyyy-MM-dd)
 * @param {string} dateStr - Date string in dd/MM/yyyy format
 * @returns {string} ISO date string (yyyy-MM-dd) or empty string if invalid
 */
export const parseVietnameseDate = (dateStr) => {
  if (!dateStr) return '';
  
  // Match dd/MM/yyyy format
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  
  if (!match) return '';
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Validate ranges
  if (monthNum < 1 || monthNum > 12) return '';
  if (dayNum < 1 || dayNum > 31) return '';
  if (yearNum < 1900 || yearNum > 2100) return '';
  
  // Create date and validate it's real (e.g., not 31/02/2025)
  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  if (dateObj.getDate() !== dayNum || 
      dateObj.getMonth() !== monthNum - 1 || 
      dateObj.getFullYear() !== yearNum) {
    return '';
  }
  
  // Return in yyyy-MM-dd format
  const paddedMonth = String(monthNum).padStart(2, '0');
  const paddedDay = String(dayNum).padStart(2, '0');
  
  return `${yearNum}-${paddedMonth}-${paddedDay}`;
};

/**
 * Convert ISO date (yyyy-MM-dd) to Vietnamese format (dd/MM/yyyy)
 * @param {string} isoDate - ISO date string (yyyy-MM-dd)
 * @returns {string} Vietnamese date string (dd/MM/yyyy)
 */
export const isoToVietnameseDate = (isoDate) => {
  if (!isoDate) return '';
  
  // Match yyyy-MM-dd format
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  
  if (!match) return '';
  
  const [, year, month, day] = match;
  
  return `${day}/${month}/${year}`;
};

/**
 * Validate Vietnamese date format (dd/MM/yyyy)
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid Vietnamese date format
 */
export const isValidVietnameseDate = (dateStr) => {
  if (!dateStr) return false;
  
  // Must match dd/MM/yyyy format
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  
  if (!match) return false;
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  // Validate ranges
  if (monthNum < 1 || monthNum > 12) return false;
  if (dayNum < 1 || dayNum > 31) return false;
  if (yearNum < 1900 || yearNum > 2100) return false;
  
  // Validate it's a real date (e.g., not 31/02/2025)
  const dateObj = new Date(yearNum, monthNum - 1, dayNum);
  
  return dateObj.getDate() === dayNum && 
         dateObj.getMonth() === monthNum - 1 && 
         dateObj.getFullYear() === yearNum;
};

/**
 * Format date input value - converts between display (dd/MM/yyyy) and storage (yyyy-MM-dd)
 * @param {string} value - Input value
 * @param {'display'|'storage'} direction - Conversion direction
 * @returns {string} Formatted date
 */
export const formatDateInput = (value, direction = 'display') => {
  if (!value) return '';
  
  if (direction === 'display') {
    // Convert yyyy-MM-dd to dd/MM/yyyy
    return isoToVietnameseDate(value);
  } else {
    // Convert dd/MM/yyyy to yyyy-MM-dd
    return parseVietnameseDate(value);
  }
};

export default {
  formatDate,
  formatDateForInput,
  formatCurrency,
  formatNumber,
  parseCurrency,
  isValidVietnamesePhone,
  formatPhone,
  getCurrentDate,
  isPastDate,
  formatDateTime,
  parseVietnameseDate,
  isoToVietnameseDate,
  isValidVietnameseDate,
  formatDateInput
};
