import type { ReactElement } from 'react';
import { useToast } from './ToastProvider';
import { Toast } from './Toast';

/**
 * Renders the container for active toast notifications.
 * Placed outside the normal app flow via absolute/fixed positioning.
 */
export function ToastHost(): ReactElement {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="app-toast-host" aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
        />
      ))}
    </div>
  );
}
