import type { MapSurfaceInteractionState, PlacementAttemptResult } from './mapWorkspaceInteractions';
import type { WorkspaceToolMode } from '../session/sessionTypes';
import type { StopId } from '../domain/types/stop';
import type { OsmStopCandidateStreetAnchorResolution } from '../domain/osm/osmStopCandidateAnchorTypes';
import { buildPlacementUiFeedback, buildLineModeUiFeedback, LINE_OVERLAY_COPY } from './mapWorkspaceUiFeedback';

/**
 * Canonical map diagnostics payload surfaced to shell-owned debug modal state.
 */
export interface MapWorkspaceDebugSnapshot {
  /** Current status of map interactions (e.g., idle, dragging). */
  readonly interactionStatus: MapSurfaceInteractionState['status'];
  /** Screen coordinates of the pointer. */
  readonly pointerSummary: string;
  /** Geographic coordinates (lng/lat) of the pointer. */
  readonly geographicSummary: string;
  /** Diagnostic counts for line features. */
  readonly lineDiagnosticsSummary: string;
  /** Diagnostic counts for vehicle features. */
  readonly vehicleDiagnosticsSummary: string;
  /** Summary of the currently selected stop. */
  readonly stopSelectionSummary: string;
  /** Instructions for stop placement. */
  readonly placementInstruction: string;
  /** Fallback text/hint for street placement rules. */
  readonly placementStreetRuleHint: string;
  /** Instructions for building a line. */
  readonly buildLineInstruction: string;
  /** Minimum requirements to complete a line. */
  readonly buildLineMinimumRequirement: string;
  /** Explanatory note for completed lines overlay. */
  readonly completedOverlayNote: string;
  /** Explanatory note for draft lines overlay. */
  readonly draftOverlayNote: string;
  /** Summary of the active draft line metadata. */
  readonly draftMetadataSummary: string;
  /** Label of the last placed stop, if any. */
  readonly lastPlacedStopLabel: string | null;
  /** Total count of raw OSM candidates. */
  readonly osmStopCandidateRawCount?: number | undefined;
  /** Total count of consolidated OSM candidate groups. */
  readonly osmStopCandidateGroupCount?: number | undefined;
  /** Last known status of the hovered OSM candidate anchor. */
  readonly osmStopCandidateAnchorLastStatus?: string | undefined;
  /** Last known distance in meters for the hovered OSM candidate anchor. */
  readonly osmStopCandidateAnchorLastDistanceMeters?: number | undefined;
  /** Count of street layers resolved from the map style. */
  readonly osmStopCandidateStreetLayerCount?: number | undefined;
}

/**
 * Input parameters required to construct a MapWorkspaceDebugSnapshot.
 */
export interface BuildMapWorkspaceDebugSnapshotInput {
  /** Current map interaction state. */
  readonly interactionState: MapSurfaceInteractionState;
  /** ID of the currently selected stop, if any. */
  readonly selectedStopId: StopId | null;
  /** Feature diagnostic counts. */
  readonly featureDiagnostics: {
    readonly lines: {
      readonly builderFeatureCount: number;
      readonly sourceFeatureCount: number;
      readonly renderedFeatureCount: number;
    };
    readonly vehicles: {
      readonly builderFeatureCount: number;
      readonly sourceFeatureCount: number;
      readonly renderedFeatureCount: number;
    };
  };
  /** Active workspace tool mode. */
  readonly activeToolMode: WorkspaceToolMode;
  /** Result of the last placement attempt. */
  readonly placementAttemptResult: PlacementAttemptResult | null;
  /** IDs of stops in the current draft line. */
  readonly draftStopIds: readonly StopId[];
  /** Metadata for the current draft line. */
  readonly draftMetadata: {
    readonly draftOrdinal: number;
    readonly startedAtIsoUtc: string;
  } | null;
  /** Label of the last placed stop. */
  readonly lastPlacedStopLabel: string | null;
  /** Number of OSM candidate groups. */
  readonly osmStopCandidateGroupCount: number;
  /** Anchor resolution details for the hovered OSM candidate. */
  readonly hoveredOsmCandidateAnchorResolution: OsmStopCandidateStreetAnchorResolution | null | undefined;
  /** Number of street layers resolved. */
  readonly osmStopCandidateStreetLayerCount: number | undefined;
}

/**
 * Builds a MapWorkspaceDebugSnapshot from explicit typed inputs.
 * Centralizes string formatting and diagnostic aggregation for the debug modal.
 * 
 * @param input The typed inputs required for the snapshot.
 * @returns A fully populated MapWorkspaceDebugSnapshot.
 */
export function buildMapWorkspaceDebugSnapshot(input: BuildMapWorkspaceDebugSnapshotInput): MapWorkspaceDebugSnapshot {
  const {
    interactionState,
    selectedStopId,
    featureDiagnostics,
    activeToolMode,
    placementAttemptResult,
    draftStopIds,
    draftMetadata,
    lastPlacedStopLabel,
    osmStopCandidateGroupCount,
    hoveredOsmCandidateAnchorResolution,
    osmStopCandidateStreetLayerCount
  } = input;

  const pointerSummary = interactionState.pointer
    ? `x:${interactionState.pointer.screenX.toFixed(1)} y:${interactionState.pointer.screenY.toFixed(1)}`
    : 'none';

  const geographicSummary =
    interactionState.pointer?.lng !== undefined && interactionState.pointer.lat !== undefined
      ? `lng:${interactionState.pointer.lng.toFixed(5)} lat:${interactionState.pointer.lat.toFixed(5)}`
      : 'lng/lat unavailable';

  const stopSelectionSummary = selectedStopId ? `Selected stop: ${selectedStopId}` : 'Selected stop: none';

  const lineDiagnosticsSummary = `Line features: builder ${featureDiagnostics.lines.builderFeatureCount} / source ${featureDiagnostics.lines.sourceFeatureCount} / rendered ${featureDiagnostics.lines.renderedFeatureCount}`;

  const vehicleDiagnosticsSummary = `Vehicle features: builder ${featureDiagnostics.vehicles.builderFeatureCount} / source ${featureDiagnostics.vehicles.sourceFeatureCount} / rendered ${featureDiagnostics.vehicles.renderedFeatureCount}`;

  const placementUiFeedback = buildPlacementUiFeedback(activeToolMode, placementAttemptResult ?? 'none');
  const buildLineUiFeedback = buildLineModeUiFeedback(activeToolMode, draftStopIds);

  const draftMetadataSummary = draftMetadata
    ? `Draft #${draftMetadata.draftOrdinal} @ ${draftMetadata.startedAtIsoUtc}`
    : 'Draft inactive';

  return {
    interactionStatus: interactionState.status,
    pointerSummary,
    geographicSummary,
    lineDiagnosticsSummary,
    vehicleDiagnosticsSummary,
    stopSelectionSummary,
    placementInstruction: placementUiFeedback.modeInstruction ?? 'n/a',
    placementStreetRuleHint: placementUiFeedback.streetRuleHint ?? 'n/a',
    buildLineInstruction: buildLineUiFeedback.modeInstruction ?? 'n/a',
    buildLineMinimumRequirement: buildLineUiFeedback.minimumStopRequirement ?? 'n/a',
    completedOverlayNote: LINE_OVERLAY_COPY.completed,
    draftOverlayNote: LINE_OVERLAY_COPY.draft,
    draftMetadataSummary,
    lastPlacedStopLabel,
    osmStopCandidateGroupCount,
    osmStopCandidateAnchorLastStatus: hoveredOsmCandidateAnchorResolution?.status,
    osmStopCandidateAnchorLastDistanceMeters: hoveredOsmCandidateAnchorResolution?.distanceMeters ?? undefined,
    osmStopCandidateStreetLayerCount
  };
}
