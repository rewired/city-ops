import { describe, expect, it } from 'vitest';
import { buildMapWorkspaceDebugSnapshot } from './mapWorkspaceDebugSnapshot';
import type { BuildMapWorkspaceDebugSnapshotInput } from './mapWorkspaceDebugSnapshot';
import { createStopId } from '../domain/types/stop';

describe('buildMapWorkspaceDebugSnapshot', () => {
  const baseInput: BuildMapWorkspaceDebugSnapshotInput = {
    interactionState: { status: 'idle', pointer: null },
    selectedStopId: null,
    featureDiagnostics: {
      lines: { builderFeatureCount: 0, sourceFeatureCount: 0, renderedFeatureCount: 0 },
      vehicles: { builderFeatureCount: 0, sourceFeatureCount: 0, renderedFeatureCount: 0 }
    },
    activeToolMode: 'inspect',
    placementAttemptResult: null,
    draftStopIds: [],
    draftMetadata: null,
    lastPlacedStopLabel: null,
    osmStopCandidateGroupCount: 0,
    hoveredOsmCandidateAnchorResolution: null,
    osmStopCandidateStreetLayerCount: undefined
  };

  it('should build snapshot with default idle state', () => {
    const snapshot = buildMapWorkspaceDebugSnapshot(baseInput);
    expect(snapshot.interactionStatus).toBe('idle');
    expect(snapshot.pointerSummary).toBe('none');
    expect(snapshot.geographicSummary).toBe('lng/lat unavailable');
    expect(snapshot.stopSelectionSummary).toBe('Selected stop: none');
    expect(snapshot.lineDiagnosticsSummary).toBe('Line features: builder 0 / source 0 / rendered 0');
    expect(snapshot.vehicleDiagnosticsSummary).toBe('Vehicle features: builder 0 / source 0 / rendered 0');
    expect(snapshot.draftMetadataSummary).toBe('Draft inactive');
  });

  it('should format pointer and geographic summaries when pointer is present', () => {
    const input: BuildMapWorkspaceDebugSnapshotInput = {
      ...baseInput,
      interactionState: {
        status: 'pointer-active',
        pointer: { screenX: 100.5, screenY: 200.1, lng: 9.991234, lat: 53.551234 }
      }
    };
    const snapshot = buildMapWorkspaceDebugSnapshot(input);
    expect(snapshot.pointerSummary).toBe('x:100.5 y:200.1');
    expect(snapshot.geographicSummary).toBe('lng:9.99123 lat:53.55123');
  });

  it('should format stop selection summary when a stop is selected', () => {
    const input: BuildMapWorkspaceDebugSnapshotInput = {
      ...baseInput,
      selectedStopId: createStopId('stop-1')
    };
    const snapshot = buildMapWorkspaceDebugSnapshot(input);
    expect(snapshot.stopSelectionSummary).toBe('Selected stop: stop-1');
  });

  it('should format draft metadata when active', () => {
    const input: BuildMapWorkspaceDebugSnapshotInput = {
      ...baseInput,
      draftMetadata: { draftOrdinal: 1, startedAtIsoUtc: '2026-04-28T00:00:00Z' }
    };
    const snapshot = buildMapWorkspaceDebugSnapshot(input);
    expect(snapshot.draftMetadataSummary).toBe('Draft #1 @ 2026-04-28T00:00:00Z');
  });
});
