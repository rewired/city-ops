import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Toast } from './Toast';
import type { Toast as ToastModel } from './toastTypes';

describe('Toast', () => {
  it('renders success toast with correct icon and role', () => {
    const toast: ToastModel = {
      id: 't1',
      variant: 'success',
      title: 'Success Title',
      detail: 'Success Detail'
    };

    const markup = renderToStaticMarkup(
      <Toast toast={toast} onDismiss={() => {}} />
    );

    expect(markup).toContain('app-toast--success');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('check');
    expect(markup).toContain('Success Title');
    expect(markup).toContain('Success Detail');
  });

  it('renders error toast with correct icon and role', () => {
    const toast: ToastModel = {
      id: 't2',
      variant: 'error',
      title: 'Error Title',
      detail: 'Error Detail'
    };

    const markup = renderToStaticMarkup(
      <Toast toast={toast} onDismiss={() => {}} />
    );

    expect(markup).toContain('app-toast--error');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('aria-live="assertive"');
    expect(markup).toContain('error');
    expect(markup).toContain('Error Title');
    expect(markup).toContain('Error Detail');
  });

  it('renders warning toast with warning icon and alert role', () => {
    const toast: ToastModel = {
      id: 't3',
      variant: 'warning',
      title: 'Warning Title',
      detail: 'Warning Detail'
    };

    const markup = renderToStaticMarkup(
      <Toast toast={toast} onDismiss={() => {}} />
    );

    expect(markup).toContain('app-toast--warning');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('warning');
  });

  it('renders info toast with info icon and status role', () => {
    const toast: ToastModel = {
      id: 't4',
      variant: 'info',
      title: 'Info Title',
      detail: 'Info Detail'
    };

    const markup = renderToStaticMarkup(
      <Toast toast={toast} onDismiss={() => {}} />
    );

    expect(markup).toContain('app-toast--info');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('info');
  });
});
