import { useEffect, useRef, useState, type ReactElement } from 'react';

import { MAP_WORKSPACE_BOOTSTRAP_CONFIG } from './mapBootstrapConfig';
import type { MapLibreMap } from './maplibreGlobal';

type MapSurfaceInteractionStatus = 'idle' | 'pointer-active' | 'click-captured';

interface MapSurfacePointerState {
  readonly screenX: number;
  readonly screenY: number;
  readonly lng?: number;
  readonly lat?: number;
}

interface MapSurfaceInteractionState {
  readonly status: MapSurfaceInteractionStatus;
  readonly pointer: MapSurfacePointerState | null;
}

/**
 * Renders the CityOps workspace as a real MapLibre map surface without gameplay semantics.
 */
export function MapWorkspaceSurface(): ReactElement {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const [interactionState, setInteractionState] = useState<MapSurfaceInteractionState>({
    status: 'idle',
    pointer: null
  });

  useEffect(() => {
    const containerElement = mapContainerRef.current;

    if (!containerElement || mapInstanceRef.current) {
      return;
    }

    const mapInstance = new window.maplibregl.Map({
      container: containerElement,
      style: MAP_WORKSPACE_BOOTSTRAP_CONFIG.styleUrl,
      center: MAP_WORKSPACE_BOOTSTRAP_CONFIG.center,
      zoom: MAP_WORKSPACE_BOOTSTRAP_CONFIG.zoom,
      minZoom: MAP_WORKSPACE_BOOTSTRAP_CONFIG.minZoom,
      maxZoom: MAP_WORKSPACE_BOOTSTRAP_CONFIG.maxZoom,
      attributionControl: true
    });

    mapInstance.addControl(new window.maplibregl.NavigationControl({ visualizePitch: false }), 'top-left');
    const toPointerState = (screenX: number, screenY: number, lng?: number, lat?: number): MapSurfacePointerState => {
      const baseState: MapSurfacePointerState = { screenX, screenY };

      if (lng !== undefined && lat !== undefined) {
        return { ...baseState, lng, lat };
      }

      return baseState;
    };
    const handlePointerMove = (event: {
      readonly point: { readonly x: number; readonly y: number };
      readonly lngLat?: { readonly lng: number; readonly lat: number };
    }): void => {
      setInteractionState({
        status: 'pointer-active',
        pointer: toPointerState(event.point.x, event.point.y, event.lngLat?.lng, event.lngLat?.lat)
      });
    };
    const handleMapClick = (event: {
      readonly point: { readonly x: number; readonly y: number };
      readonly lngLat?: { readonly lng: number; readonly lat: number };
    }): void => {
      setInteractionState({
        status: 'click-captured',
        pointer: toPointerState(event.point.x, event.point.y, event.lngLat?.lng, event.lngLat?.lat)
      });
    };

    mapInstance.on('mousemove', handlePointerMove);
    mapInstance.on('click', handleMapClick);
    mapInstanceRef.current = mapInstance;

    const handleMapResize = (): void => {
      mapInstanceRef.current?.resize();
    };
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            handleMapResize();
          })
        : null;

    if (resizeObserver) {
      resizeObserver.observe(containerElement);
    } else {
      window.addEventListener('resize', handleMapResize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', handleMapResize);
      }

      mapInstance.off('mousemove', handlePointerMove);
      mapInstance.off('click', handleMapClick);
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const pointerSummary = interactionState.pointer
    ? `x:${interactionState.pointer.screenX.toFixed(1)} y:${interactionState.pointer.screenY.toFixed(1)}`
    : 'none';
  const geographicSummary =
    interactionState.pointer?.lng !== undefined && interactionState.pointer.lat !== undefined
      ? `lng:${interactionState.pointer.lng.toFixed(5)} lat:${interactionState.pointer.lat.toFixed(5)}`
      : 'lng/lat unavailable';

  return (
    <section className="map-workspace" aria-label="Map workspace surface">
      <div ref={mapContainerRef} className="map-workspace__map" aria-label="CityOps baseline map" />

      <div className="map-workspace__overlay map-workspace__overlay--hud" aria-label="Map workspace status">
        Interaction status: {interactionState.status} | Pointer: {pointerSummary} | Geo: {geographicSummary}
      </div>
    </section>
  );
}
