/**
 * Minimal MapLibre constructor options used by the CityOps map workspace baseline.
 */
interface MapConstructorOptions {
  readonly container: HTMLElement;
  readonly style: string;
  readonly center: readonly [number, number];
  readonly zoom: number;
  readonly minZoom: number;
  readonly maxZoom: number;
  readonly attributionControl: boolean;
}

/**
 * Screen-space coordinates emitted by pointer-like map interaction events.
 */
interface MapEventPoint {
  readonly x: number;
  readonly y: number;
}

/**
 * Geographic coordinates emitted by map interaction events when available.
 */
interface MapEventLngLat {
  readonly lng: number;
  readonly lat: number;
}

/**
 * Minimal interaction event shape consumed by the map workspace surface.
 */
interface MapLibreInteractionEvent {
  readonly point: MapEventPoint;
  readonly lngLat?: MapEventLngLat;
}

/**
 * Interaction event names used by the workspace baseline.
 */
type MapLibreInteractionEventType = 'mousemove' | 'click';

/**
 * Minimal MapLibre map API surface required by this slice for lifecycle-safe map rendering.
 */
export interface MapLibreMap {
  /** Destroys the map instance and releases related resources. */
  remove(): void;
  /** Recomputes map dimensions after container size changes. */
  resize(): void;
  /** Adds a UI control to the map at a known anchor point. */
  addControl(control: unknown, position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'): void;
  /** Registers an interaction listener for the provided baseline event type. */
  on(type: MapLibreInteractionEventType, listener: (event: MapLibreInteractionEvent) => void): void;
  /** Removes a previously registered interaction listener for the provided baseline event type. */
  off(type: MapLibreInteractionEventType, listener: (event: MapLibreInteractionEvent) => void): void;
}

/**
 * Minimal constructor API for `window.maplibregl` consumed by the workspace map component.
 */
interface MapLibreGlobal {
  readonly Map: new (options: MapConstructorOptions) => MapLibreMap;
  readonly NavigationControl: new (options: { readonly visualizePitch: boolean }) => unknown;
}

declare global {
  interface Window {
    maplibregl: MapLibreGlobal;
  }
}

export {};
