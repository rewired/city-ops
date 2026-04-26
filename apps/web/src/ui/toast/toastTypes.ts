/** Defines the allowed visual variants for toast notifications. */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Represents a single transient notification message.
 */
export interface Toast {
  /** Deterministic identifier for React list stability. */
  readonly id: string;
  /** Semantic visual style. */
  readonly variant: ToastVariant;
  /** Bold summary heading. */
  readonly title: string;
  /** Detailed multi-line feedback text. */
  readonly detail: string;
  /** Optional override for auto-dismissal. */
  readonly durationMs?: number;
}
