import type { WorkspaceToolMode } from '../session/sessionTypes';
import {
  resolveFocusedDemandGapPlanningContext,
  type FocusedDemandGapPlanningContext,
  type FocusedDemandGapPlanningEntrypointKind
} from './focusedDemandGapPlanningContext';

export type { FocusedDemandGapPlanningEntrypointKind };

/** Carries a focused demand gap action request from Inspector UI to the app shell. */
export interface FocusedDemandGapPlanningEntrypointRequest {
  readonly kind: FocusedDemandGapPlanningEntrypointKind;
  readonly position: { readonly lng: number; readonly lat: number };
}

/** Callbacks owned by the shell for applying a planning entrypoint request. */
export interface FocusedDemandGapPlanningEntrypointHandlers {
  readonly focusPosition: (position: { readonly lng: number; readonly lat: number }) => void;
  readonly selectToolMode: (mode: WorkspaceToolMode) => void;
  /** Sets the transient planning context for UI display. */
  readonly setPlanningContext: (context: FocusedDemandGapPlanningContext | null) => void;
}

/** Resolves the existing workspace tool mode opened by a planning entrypoint. */
export const resolveFocusedDemandGapPlanningEntrypointToolMode = (
  kind: FocusedDemandGapPlanningEntrypointKind
): WorkspaceToolMode => {
  return kind === 'start-stop-placement-near-gap' ? 'place-stop' : 'build-line';
};

/** Applies a planning entrypoint by focusing the map, switching an existing tool mode, and setting context. */
export const applyFocusedDemandGapPlanningEntrypoint = (
  request: FocusedDemandGapPlanningEntrypointRequest,
  handlers: FocusedDemandGapPlanningEntrypointHandlers
): void => {
  handlers.focusPosition(request.position);
  handlers.selectToolMode(resolveFocusedDemandGapPlanningEntrypointToolMode(request.kind));
  handlers.setPlanningContext(resolveFocusedDemandGapPlanningContext(request.kind));
};
