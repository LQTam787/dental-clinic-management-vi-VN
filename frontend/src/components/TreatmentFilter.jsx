import React from 'react';
import { t } from '../utils/i18n';

/**
 * TreatmentFilter Component - Vietnamese Localized
 * Bộ lọc điều trị
 *
 * Provides checkbox filters for treatment needs.
 * Implements three-state logic: unchecked (null), checked (true), unchecked again (null)
 * This allows "show all", "show only with treatment", filtering.
 *
 * ✅ PROPERLY LOCALIZED - Maintains original UI structure, translates text only
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter state
 * @param {boolean|null} props.filters.needsImplant - Implant filter
 * @param {boolean|null} props.filters.needsDenture - Denture filter
 * @param {boolean|null} props.filters.needsOrthodontics - Orthodontics filter
 * @param {Function} props.onChange - Callback when filters change
 */
function TreatmentFilter({ filters, onChange }) {
  /**
   * Handle checkbox change
   *
   * Implements three-state logic:
   * - null (unchecked, show all) → true (checked, show only true)
   * - true (checked) → null (unchecked, show all)
   *
   * @param {string} filterName - Name of the filter to toggle
   */
  const handleCheckboxChange = filterName => {
    onChange({
      ...filters,
      [filterName]: filters[filterName] === null ? true : null,
    });
  };

  /**
   * Clear all filters
   * Reset all filter values to null (show all)
   */
  const handleClearFilters = () => {
    onChange({
      needsImplant: null,
      needsDenture: null,
      needsOrthodontics: null,
    });
  };

  /**
   * Check if any filters are active
   * Used to conditionally show "Clear Filters" button
   */
  const hasActiveFilters =
    filters.needsImplant !== null ||
    filters.needsDenture !== null ||
    filters.needsOrthodontics !== null;

  return (
    <div className="treatment-filter">
      <div className="filter-label">{t('filter.label')}</div>

      <div className="filter-checkboxes">
        {/* Implant Filter - Bộ lọc Implant */}
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.needsImplant === true}
            onChange={() => handleCheckboxChange('needsImplant')}
          />
          <span>{t('filter.needsImplant')}</span>
        </label>

        {/* Denture Filter - Bộ lọc Hàm giả */}
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.needsDenture === true}
            onChange={() => handleCheckboxChange('needsDenture')}
          />
          <span>{t('filter.needsDenture')}</span>
        </label>

        {/* Orthodontics Filter - Bộ lọc Chỉnh nha */}
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.needsOrthodontics === true}
            onChange={() => handleCheckboxChange('needsOrthodontics')}
          />
          <span>{t('filter.needsOrthodontics')}</span>
        </label>
      </div>

      {/* Clear Filters Button - only shown when filters are active */}
      {hasActiveFilters && (
        <button
          className="clear-filters-button"
          onClick={handleClearFilters}
          type="button"
        >
          {t('filter.clearFilters')}
        </button>
      )}
    </div>
  );
}

export default TreatmentFilter;
