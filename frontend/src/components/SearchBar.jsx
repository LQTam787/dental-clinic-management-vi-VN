import React from 'react';
import { t } from '../utils/i18n';

/**
 * SearchBar Component - Vietnamese Localized
 * Thanh tìm kiếm
 *
 * Provides a text input for searching appointments by patient name or phone number.
 * Implements a controlled component pattern where the parent manages the state.
 *
 * ✅ PROPERLY LOCALIZED - Maintains original UI structure, translates text only
 *
 * @param {Object} props
 * @param {string} props.value - Current search term
 * @param {Function} props.onChange - Callback function when input changes
 */
function SearchBar({ value, onChange, placeholder }) {
  /**
   * Handle input change
   * Extract value from event and pass to parent's onChange
   */
  const handleChange = e => {
    onChange(e.target.value);
  };

  /**
   * Handle clear button click
   * Reset search to empty string
   */
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="search-bar">
      {/* Search Icon (optional - using Unicode character) */}
      <span className="search-icon">🔍</span>

      {/* Search Input Field */}
      <input
        type="text"
        className="search-input"
        placeholder={placeholder || t('search.placeholder')}
        value={value}
        onChange={handleChange}
        aria-label={t('search.ariaLabel')}
      />

      {/* Clear Button (only shown when there's text) */}
      {value && (
        <button
          className="clear-button"
          onClick={handleClear}
          aria-label={t('search.clearAriaLabel')}
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
