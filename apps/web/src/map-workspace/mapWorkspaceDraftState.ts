import type { StopId } from '../domain/types/stop';

/**
 * Metadata describing a draft line currently being planned.
 */
export interface DraftLineMetadata {
  /** The ordinal index for the next draft line in the session. */
  readonly draftOrdinal: number;
  /** The creation timestamp in ISO UTC format. */
  readonly startedAtIsoUtc: string;
}

/**
 * State representing a line currently under construction.
 */
export interface DraftLineState {
  /** Ordered sequence of stop IDs that belong to the draft line. */
  readonly stopIds: readonly StopId[];
  /** Optional metadata associated with the draft line creation. */
  readonly metadata: DraftLineMetadata | null;
}

/**
 * Initial empty state for a draft line.
 */
export const INITIAL_DRAFT_LINE_STATE: DraftLineState = {
  stopIds: [],
  metadata: null
};
