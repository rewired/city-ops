// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InspectorPanel } from './InspectorPanel';
import type { InspectorPanelState } from './types';
import type { TimeBandId } from '../domain/types/timeBand';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Minimal mock data
const mockPanelState: InspectorPanelState = {
  mode: 'network',
  networkSummary: {
    status: 'idle',
    blockerCount: 0,
    warningCount: 0
  }
};

const mockKpis = {
  totalStopCount: 10,
  completedLineCount: 5
};

const mockVehicleProjection = {
  summary: { totalProjectedVehicleCount: 15 },
  lineProjections: []
};

const mockServicePlanProjection = {
  summary: { activeTimeBandId: 'peak_morning' as TimeBandId, degradedLineCount: 0, blockedLineCount: 0 },
  lineProjections: []
};

const mockDemandCaptureProjection = { status: 'unavailable' } as any;
const mockServedDemandProjection = { status: 'unavailable' } as any;
const mockServicePressureProjection = { activeDeparturesPerHourEstimate: 0 } as any;
const mockDemandGapRankingProjection = { status: 'unavailable' } as any;

interface RenderResult {
  readonly container: HTMLDivElement;
  readonly root: Root;
}

const renderInspectorPanel = (): RenderResult => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <InspectorPanel
        inspectorPanelState={mockPanelState}
        staticNetworkSummaryKpis={mockKpis}
        placedStops={[]}
        completedLines={[]}
        onStopSelectionChange={vi.fn()}
        onSelectedLineIdChange={vi.fn()}
        onLineRename={vi.fn()}
        vehicleNetworkProjection={mockVehicleProjection}
        networkServicePlanProjection={mockServicePlanProjection}
        scenarioDemandCaptureProjection={mockDemandCaptureProjection}
        servedDemandProjection={mockServedDemandProjection}
        servicePressureProjection={mockServicePressureProjection}
        demandGapRankingProjection={mockDemandGapRankingProjection}
        onPositionFocus={vi.fn()}
      />
    );
  });

  return { container, root };
};

let mounted: RenderResult | null = null;

afterEach(() => {
  if (!mounted) {
    return;
  }

  act(() => {
    mounted?.root.unmount();
  });
  mounted.container.remove();
  mounted = null;
});

describe('InspectorPanel', () => {
  it('renders with Overview tab by default and switches to other tabs', () => {
    mounted = renderInspectorPanel();

    // Should show Overview content by default
    const overviewTab = mounted.container.querySelector('button[aria-label="Overview"]');
    expect(overviewTab).not.toBeNull();
    expect(overviewTab?.getAttribute('aria-selected')).toBe('true');
    expect(mounted.container.textContent).toContain('Projected vehicles');

    // Click Demand tab
    const demandTab = mounted.container.querySelector('button[aria-label="Demand"]');
    expect(demandTab).not.toBeNull();
    act(() => {
      (demandTab as HTMLElement).click();
    });
    expect(demandTab?.getAttribute('aria-selected')).toBe('true');
    expect(overviewTab?.getAttribute('aria-selected')).toBe('false');
    expect(mounted.container.textContent).toContain('Demand capture');

    // Click Service tab
    const serviceTab = mounted.container.querySelector('button[aria-label="Service"]');
    expect(serviceTab).not.toBeNull();
    act(() => {
      (serviceTab as HTMLElement).click();
    });
    expect(serviceTab?.getAttribute('aria-selected')).toBe('true');
    expect(mounted.container.textContent).toContain('Service pressure');
    
    // Click Lines tab
    const linesTab = mounted.container.querySelector('button[aria-label="Lines"]');
    expect(linesTab).not.toBeNull();
    act(() => {
      (linesTab as HTMLElement).click();
    });
    expect(linesTab?.getAttribute('aria-selected')).toBe('true');
    expect(mounted.container.textContent).toContain('Lines');
  });
});
