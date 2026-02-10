import React, { useEffect } from 'react';
import { t } from '../utils/i18n';

/**
 * Modal Component - Vietnamese Localized
 * Cửa sổ Modal
 *
 * Reusable modal overlay for displaying forms and dialogs.
 * Features:
 * - Semi-transparent backdrop
 * - Centered content
 * - Close on backdrop click
 * - Close button
 * - Prevents body scroll when open
 * - Keyboard accessible (ESC to close)
 *
 * ✅ PROPERLY LOCALIZED - Maintains original UI structure, translates text only
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback when modal should close
 * @param {string} props.title - Modal title
 * @param {ReactNode} props.children - Modal content
 * @param {string} props.size - Modal size: 'small', 'medium', 'large' (default: 'medium')
 */
function Modal({ isOpen, onClose, title, children, size = 'medium' }) {
  // ============================================
  // SIDE EFFECTS
  // ============================================

  /**
   * Prevent body scroll when modal is open
   * Restore scroll when modal closes
   */
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Cleanup function
      return () => {
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  /**
   * Close modal on ESC key press
   */
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle backdrop click
   * Close modal when clicking outside content area
   */
  const handleBackdropClick = e => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  // Don't render anything if modal is not open
  if (!isOpen) {
    return null;
  }

  // Determine modal size class
  const sizeClass = `modal-content-${size}`;

  return (
    <div
      className="modal-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={`modal-content ${sizeClass}`}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label={t('modal.closeAriaLabel')}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
