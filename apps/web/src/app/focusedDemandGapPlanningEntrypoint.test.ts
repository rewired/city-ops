import { describe, expect, it, vi } from 'vitest';
import {
  applyFocusedDemandGapPlanningEntrypoint,
  resolveFocusedDemandGapPlanningEntrypointToolMode,
  type FocusedDemandGapPlanningEntrypointRequest
} from './focusedDemandGapPlanningEntrypoint';

const getSingleInvocationOrder = (
  mockFn: { readonly mock: { readonly invocationCallOrder: readonly number[] } },
  label: string
): number => {
  const [callOrder] = mockFn.mock.invocationCallOrder;
  if (callOrder === undefined) {
    throw new Error(`Expected ${label} to have been called.`);
  }
  return callOrder;
};

describe('focusedDemandGapPlanningEntrypoint', () => {
  describe('resolveFocusedDemandGapPlanningEntrypointToolMode', () => {
    it('resolves start-stop-placement-near-gap to place-stop', () => {
      expect(resolveFocusedDemandGapPlanningEntrypointToolMode('start-stop-placement-near-gap')).toBe('place-stop');
    });

    it('resolves start-line-planning-near-gap to build-line', () => {
      expect(resolveFocusedDemandGapPlanningEntrypointToolMode('start-line-planning-near-gap')).toBe('build-line');
    });
  });

  describe('applyFocusedDemandGapPlanningEntrypoint', () => {
    it('triggers map focus, tool mode selection, and planning context for stop placement', () => {
      const focusPosition = vi.fn();
      const selectToolMode = vi.fn();
      const setPlanningContext = vi.fn();

      const request: FocusedDemandGapPlanningEntrypointRequest = {
        kind: 'start-stop-placement-near-gap',
        position: { lng: 10, lat: 53 }
      };

      applyFocusedDemandGapPlanningEntrypoint(request, {
        focusPosition,
        selectToolMode,
        setPlanningContext
      });

      expect(focusPosition).toHaveBeenCalledWith({ lng: 10, lat: 53 });
      expect(selectToolMode).toHaveBeenCalledWith('place-stop');
      expect(setPlanningContext).toHaveBeenCalledWith(expect.objectContaining({
        kind: 'stop-placement',
        title: 'Stop placement started'
      }));

      // Ensure focus happens before tool mode selection for better UX sequencing
      const focusCallOrder = getSingleInvocationOrder(focusPosition, 'focusPosition');
      const selectModeCallOrder = getSingleInvocationOrder(selectToolMode, 'selectToolMode');
      expect(focusCallOrder).toBeLessThan(selectModeCallOrder);
    });

    it('triggers map focus, tool mode selection, and planning context for line planning', () => {
      const focusPosition = vi.fn();
      const selectToolMode = vi.fn();
      const setPlanningContext = vi.fn();

      const request: FocusedDemandGapPlanningEntrypointRequest = {
        kind: 'start-line-planning-near-gap',
        position: { lng: 10.1, lat: 53.5 }
      };

      applyFocusedDemandGapPlanningEntrypoint(request, {
        focusPosition,
        selectToolMode,
        setPlanningContext
      });

      expect(focusPosition).toHaveBeenCalledWith({ lng: 10.1, lat: 53.5 });
      expect(selectToolMode).toHaveBeenCalledWith('build-line');
      expect(setPlanningContext).toHaveBeenCalledWith(expect.objectContaining({
        kind: 'line-planning',
        title: 'Line planning started'
      }));
    });
  });
});
