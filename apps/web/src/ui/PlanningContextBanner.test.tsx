// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlanningContextBanner } from './PlanningContextBanner';
import type { FocusedDemandGapPlanningContext } from '../app/focusedDemandGapPlanningContext';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface RenderResult {
  readonly container: HTMLDivElement;
  readonly root: Root;
}

const renderBanner = (props: {
  readonly context: FocusedDemandGapPlanningContext;
  readonly onDismiss: () => void;
}): RenderResult => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(<PlanningContextBanner {...props} />);
  });

  return { container, root };
};

let mounted: RenderResult | null = null;

afterEach(() => {
  if (!mounted) return;
  act(() => {
    mounted?.root.unmount();
  });
  mounted.container.remove();
  mounted = null;
});

describe('PlanningContextBanner', () => {
  const mockContext: FocusedDemandGapPlanningContext = {
    kind: 'stop-placement',
    title: 'Test Title',
    description: 'Test Description'
  };

  it('renders context title and description', () => {
    mounted = renderBanner({ context: mockContext, onDismiss: () => {} });
    
    const textContent = mounted.container.textContent;
    expect(textContent).toContain('Test Title');
    expect(textContent).toContain('Test Description');
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    mounted = renderBanner({ context: mockContext, onDismiss });
    
    const dismissButton = mounted.container.querySelector('button');
    expect(dismissButton).toBeDefined();
    
    act(() => {
      dismissButton?.click();
    });
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies the correct CSS class based on context kind', () => {
    mounted = renderBanner({ context: mockContext, onDismiss: () => {} });
    const banner = mounted.container.querySelector('.planning-context-banner');
    expect(banner?.classList.contains('planning-context-banner--stop-placement')).toBe(true);
  });
});
