import { describe, expect, it, vi } from "vitest";
import { DEFAULT_ROUTE_DWELL_MINUTES_PER_SEGMENT } from "../constants/routing";
import type { LineId } from "../types/line";
import type { Stop, StopId } from "../types/stop";
import { 
  buildRoutedLineRouteSegments, 
  mapResolvedRouteSegmentToLineRouteSegment 
} from "./buildRoutedLineRouteSegments";
import { 
  createRouteDistanceMeters, 
  createRouteDurationSeconds, 
  createRoutingProviderId, 
  type ResolvedRouteSegment, 
  type RoutingAdapter, 
  type RoutingFailure 
} from "./RoutingAdapter";

describe("buildRoutedLineRouteSegments", () => {
  const lineId = "line-1" as LineId;
  const stop1: Stop = {
    id: "stop-1" as StopId,
    label: "Stop 1",
    position: { lng: 10.0, lat: 53.5 },
  };
  const stop2: Stop = {
    id: "stop-2" as StopId,
    label: "Stop 2",
    position: { lng: 10.1, lat: 53.6 },
  };
  const stop3: Stop = {
    id: "stop-3" as StopId,
    label: "Stop 3",
    position: { lng: 10.2, lat: 53.7 },
  };
  const placedStops = [stop1, stop2, stop3];
  const orderedStopIds = [stop1.id, stop2.id, stop3.id];

  const providerId = createRoutingProviderId("mock-provider");

  const createMockResolvedSegment = (distance: number, duration: number): ResolvedRouteSegment => ({
    type: "resolved",
    provider: providerId,
    distanceMeters: createRouteDistanceMeters(distance),
    durationSeconds: createRouteDurationSeconds(duration),
    geometry: {
      type: "LineString",
      coordinates: [[10.0, 53.5], [10.05, 53.55], [10.1, 53.6]],
    },
  });

  const mockFailure: RoutingFailure = {
    type: "failed",
    provider: providerId,
    reason: "NoRoute",
    message: "Could not find route",
  };

  it("maps a resolved segment to a canonical line route segment correctly", () => {
    const resolved = createMockResolvedSegment(1000, 120);
    const segment = mapResolvedRouteSegmentToLineRouteSegment(
      lineId,
      0,
      stop1.id,
      stop2.id,
      resolved
    );

    expect(segment.status).toBe("routed");
    expect(segment.distanceMeters).toBe(1000);
    expect(segment.inMotionTravelMinutes).toBe(2); // 120s / 60
    expect(segment.dwellMinutes).toBe(DEFAULT_ROUTE_DWELL_MINUTES_PER_SEGMENT);
    expect(segment.totalTravelMinutes).toBe(2 + DEFAULT_ROUTE_DWELL_MINUTES_PER_SEGMENT);
    expect(segment.orderedGeometry).toEqual(resolved.geometry.coordinates);
  });

  it("builds all segments successfully when the adapter resolves everything", async () => {
    const routingAdapter: RoutingAdapter = {
      resolveSegment: vi.fn().mockResolvedValue(createMockResolvedSegment(1000, 60)),
    };

    const result = await buildRoutedLineRouteSegments({
      lineId,
      orderedStopIds,
      placedStops,
      routingAdapter,
    });

    expect(result.routeSegments).toHaveLength(2);
    expect(result.routedSegmentCount).toBe(2);
    expect(result.fallbackSegmentCount).toBe(0);
    expect(result.routeSegments[0]!.status).toBe("routed");
    expect(result.routeSegments[1]!.status).toBe("routed");
    expect(routingAdapter.resolveSegment).toHaveBeenCalledTimes(2);
  });

  it("falls back to deterministic segments when the adapter fails", async () => {
    const routingAdapter: RoutingAdapter = {
      resolveSegment: vi.fn().mockResolvedValue(mockFailure),
    };

    const result = await buildRoutedLineRouteSegments({
      lineId,
      orderedStopIds,
      placedStops,
      routingAdapter,
    });

    expect(result.routeSegments).toHaveLength(2);
    expect(result.routedSegmentCount).toBe(0);
    expect(result.fallbackSegmentCount).toBe(2);
    expect(result.routeSegments[0]!.status).toBe("fallback-routed");
    expect(result.routeSegments[1]!.status).toBe("fallback-routed");
    
    // Fallback geometry should be a simple two-point LineString
    expect(result.routeSegments[0]!.orderedGeometry).toHaveLength(2);
    expect(result.routeSegments[0]!.orderedGeometry[0]).toEqual([stop1.position.lng, stop1.position.lat]);
    expect(result.routeSegments[0]!.orderedGeometry[1]).toEqual([stop2.position.lng, stop2.position.lat]);
  });

  it("handles mixed success and failure", async () => {
    const routingAdapter: RoutingAdapter = {
      resolveSegment: vi.fn()
        .mockResolvedValueOnce(createMockResolvedSegment(1000, 60))
        .mockResolvedValueOnce(mockFailure),
    };

    const result = await buildRoutedLineRouteSegments({
      lineId,
      orderedStopIds,
      placedStops,
      routingAdapter,
    });

    expect(result.routeSegments).toHaveLength(2);
    expect(result.routedSegmentCount).toBe(1);
    expect(result.fallbackSegmentCount).toBe(1);
    expect(result.routeSegments[0]!.status).toBe("routed");
    expect(result.routeSegments[1]!.status).toBe("fallback-routed");
  });

  it("handles closed/circular lines", async () => {
    const routingAdapter: RoutingAdapter = {
      resolveSegment: vi.fn().mockResolvedValue(createMockResolvedSegment(1000, 60)),
    };

    const result = await buildRoutedLineRouteSegments({
      lineId,
      orderedStopIds,
      placedStops,
      routingAdapter,
      closureMode: "closed",
    });

    // 3 stops in closed mode should produce 3 segments (1->2, 2->3, 3->1)
    expect(result.routeSegments).toHaveLength(3);
    expect(result.routeSegments[2]!.fromStopId).toBe(stop3.id);
    expect(result.routeSegments[2]!.toStopId).toBe(stop1.id);
  });

  it("throws error for insufficient stops", async () => {
    const routingAdapter: RoutingAdapter = {
      resolveSegment: vi.fn(),
    };

    await expect(buildRoutedLineRouteSegments({
      lineId,
      orderedStopIds: [stop1.id],
      placedStops,
      routingAdapter,
    })).rejects.toThrow("Routing requires at least two ordered stops");
  });

  it("throws error for missing stops", async () => {
    const routingAdapter: RoutingAdapter = {
      resolveSegment: vi.fn(),
    };

    await expect(buildRoutedLineRouteSegments({
      lineId,
      orderedStopIds: [stop1.id, "missing-stop" as StopId],
      placedStops,
      routingAdapter,
    })).rejects.toThrow("Routing could not resolve stop IDs");
  });
});
