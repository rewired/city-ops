import type { StopId } from '../types/stop';
import type { DemandNode, DemandNodeId } from '../types/demandNode';
import type { StopDemandCatchment } from '../demand/demandCatchment';

/**
 * Projection of a single demand node's capture status.
 */
export interface DemandNodeCapturePreview {
  readonly demandNodeId: DemandNodeId;
  readonly capturedByStopIds: readonly StopId[];
  readonly capturedByStopCount: number;
  readonly capturedBySelectedStop: boolean;
}

/**
 * Aggregate preview projection for network-wide demand node capture state.
 */
export interface NetworkDemandCapturePreviewProjection {
  readonly totalNodeCount: number;
  readonly capturedNodeCount: number;
  readonly selectedStopCapturedNodeCount: number;
  readonly demandNodeCaptures: readonly DemandNodeCapturePreview[];
}

/**
 * Computes structural demand node capture metrics suitable for planning overlays.
 * 
 * @param params The projection parameters.
 * @param params.demandNodes Scenario demand nodes to evaluate.
 * @param params.stopCatchments Calculated access-radius stop catchments.
 * @param params.selectedStopId Currently selected stop, if any.
 */
export const projectDemandCapturePreview = ({
  demandNodes,
  stopCatchments,
  selectedStopId
}: {
  readonly demandNodes: readonly DemandNode[];
  readonly stopCatchments: readonly StopDemandCatchment[];
  readonly selectedStopId: StopId | null;
}): NetworkDemandCapturePreviewProjection => {
  const totalNodeCount = demandNodes.length;
  let capturedNodeCount = 0;
  let selectedStopCapturedNodeCount = 0;

  // Group catchments by demand node
  const stopsCapturingNode = new Map<DemandNodeId, StopId[]>();
  for (const catchment of stopCatchments) {
    for (const nodeId of catchment.capturedDemandNodeIds) {
      const stopList = stopsCapturingNode.get(nodeId) || [];
      if (!stopList.includes(catchment.stopId)) {
        stopList.push(catchment.stopId);
      }
      stopsCapturingNode.set(nodeId, stopList);
    }
  }

  const demandNodeCaptures = demandNodes.map((node) => {
    const stopIds = stopsCapturingNode.get(node.id) || [];
    const isCaptured = stopIds.length > 0;
    const isCapturedBySelected = selectedStopId !== null && stopIds.includes(selectedStopId);

    if (isCaptured) {
      capturedNodeCount += 1;
    }
    if (isCapturedBySelected) {
      selectedStopCapturedNodeCount += 1;
    }

    return {
      demandNodeId: node.id,
      capturedByStopIds: stopIds,
      capturedByStopCount: stopIds.length,
      capturedBySelectedStop: isCapturedBySelected
    };
  });

  return {
    totalNodeCount,
    capturedNodeCount,
    selectedStopCapturedNodeCount,
    demandNodeCaptures
  };
};
