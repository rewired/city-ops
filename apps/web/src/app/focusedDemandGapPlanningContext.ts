/** Identifies which existing planning workflow a focused demand gap action should open. */
export type FocusedDemandGapPlanningEntrypointKind =
  | 'start-stop-placement-near-gap'
  | 'start-line-planning-near-gap';

/** Identifies the type of planning context being displayed in the UI banner. */
export type FocusedDemandGapPlanningContextKind =
  | 'stop-placement'
  | 'line-planning';

/** Represents a transient context banner shown after a planning entrypoint is triggered. */
export interface FocusedDemandGapPlanningContext {
  /** The specific planning activity being contextually guided. */
  readonly kind: FocusedDemandGapPlanningContextKind;
  /** High-level summary of the activity. */
  readonly title: string;
  /** Guidance on how to proceed without claiming automatic actions. */
  readonly description: string;
}

/** Resolves the display context for a given planning entrypoint. */
export const resolveFocusedDemandGapPlanningContext = (
  kind: FocusedDemandGapPlanningEntrypointKind
): FocusedDemandGapPlanningContext => {
  if (kind === 'start-stop-placement-near-gap') {
    return {
      kind: 'stop-placement',
      title: 'Stop placement started',
      description: 'Place a stop near the focused demand gap. You still choose the street anchor.'
    };
  }

  return {
    kind: 'line-planning',
    title: 'Line planning started',
    description: 'Build or adjust a line toward the focused demand context. No line is created automatically.'
  };
};
