import type { ReactElement } from 'react';
import { MaterialIcon } from '../icons/MaterialIcon';
import type { Toast as ToastModel } from './toastTypes';

interface ToastProps {
  readonly toast: ToastModel;
  readonly onDismiss: (id: string) => void;
}

const VARIANT_ICONS = {
  success: 'check',
  error: 'error',
  warning: 'warning',
  info: 'info'
} as const;

/**
 * Renders an individual transient notification card with semantic iconography and accessible labels.
 */
export function Toast({ toast, onDismiss }: ToastProps): ReactElement {
  const role = toast.variant === 'error' || toast.variant === 'warning' ? 'alert' : 'status';
  const ariaLive = toast.variant === 'error' || toast.variant === 'warning' ? 'assertive' : 'polite';

  return (
    <div
      className={`app-toast app-toast--${toast.variant}`}
      role={role}
      aria-live={ariaLive}
      data-toast-id={toast.id}
    >
      <div className="app-toast__icon-area">
        <MaterialIcon name={VARIANT_ICONS[toast.variant]} />
      </div>
      <div className="app-toast__content">
        <strong className="app-toast__title">{toast.title}</strong>
        <p className="app-toast__detail">{toast.detail}</p>
      </div>
      <button
        type="button"
        className="app-toast__dismiss-button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <MaterialIcon name="close" />
      </button>
    </div>
  );
}
