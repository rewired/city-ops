import type { Line } from '../domain/types/line';
import type { Stop } from '../domain/types/stop';
import type { StopSelectionState } from '../map-workspace/MapWorkspaceSurface';

/** Carries inspector data when a completed line is the active selection context. */
export interface LineSelectedInspectorPanelState {
  readonly mode: 'line-selected';
  readonly selectedLine: Line;
}

/** Carries inspector data when a stop is the active selection context. */
export interface StopSelectedInspectorPanelState {
  readonly mode: 'stop-selected';
  readonly selection: StopSelectionState;
  readonly stop: Stop;
}

/** Carries inspector data when an OSM candidate is the active selection context. */
export interface OsmCandidateSelectedInspectorPanelState {
  readonly mode: 'osm-candidate-selected';
  readonly candidateGroupId: import('../domain/types/osmStopCandidate').OsmStopCandidateGroupId;
}

/** Carries inspector data when neither a line nor stop is selected. */
export interface EmptyInspectorPanelState {
  readonly mode: 'empty';
}

/** Represents the resolved inspector view model after applying selection priority rules. */
export type InspectorPanelState =
  | LineSelectedInspectorPanelState
  | StopSelectedInspectorPanelState
  | OsmCandidateSelectedInspectorPanelState
  | EmptyInspectorPanelState;
