import type { StopId } from '../domain/types/stop';

/** Defines the workspace tool modes available in the desktop shell. */
export type WorkspaceToolMode = 'inspect' | 'place-stop' | 'build-line';

/** Carries the active line-building draft selection as an ordered stop-id list. */
export interface LineBuildSelectionState {
  readonly selectedStopIds: readonly StopId[];
}

/**
 * Signal to open a specific dialog for a selected line.
 * Used for post-creation workflow automation.
 */
export interface SelectedLineDialogOpenIntent {
  readonly lineId: import('../domain/types/line').LineId;
  readonly dialogId: 'frequency';
  readonly requestId: number;
}
