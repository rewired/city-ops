import type { ReactElement } from 'react';
import { TIME_BAND_DISPLAY_LABELS } from '../domain/constants/timeBands';
import { InspectorDisclosure } from '../ui/InspectorDisclosure';
import { NetworkInventory } from './NetworkInventory';
import type { Line } from '../domain/types/line';
import type { Stop } from '../domain/types/stop';

interface InspectorOverviewTabProps {
  readonly staticNetworkSummaryKpis: import('../domain/projection/useNetworkPlanningProjections').StaticNetworkSummaryKpis;
  readonly networkServicePlanProjection: ReturnType<typeof import('../domain/projection/lineServicePlanProjection').projectLineServicePlan>;
  readonly vehicleNetworkProjection: ReturnType<typeof import('../domain/projection/lineVehicleProjection').projectLineVehicleNetwork>;
  readonly globalStateLabel: string;
  readonly placedStops: readonly Stop[];
  readonly completedLines: readonly Line[];
  readonly onStopSelectionChange: (stopId: import('../domain/types/stop').StopId) => void;
  readonly onSelectedLineIdChange: (lineId: Line['id']) => void;
  readonly onLineRename: (lineId: Line['id'], nextLabel: string) => void;
}

/**
 * Renders the high-level network overview, including primary KPIs and the network inventory.
 */
export function InspectorOverviewTab({
  staticNetworkSummaryKpis,
  networkServicePlanProjection,
  vehicleNetworkProjection,
  globalStateLabel,
  placedStops,
  completedLines,
  onStopSelectionChange,
  onSelectedLineIdChange,
  onLineRename
}: InspectorOverviewTabProps): ReactElement {
  return (
    <section className="inspector-overview-tab" aria-label="Overview">
      <h3>Overview</h3>
      <table className="inspector-compact-table inspector-network-summary__primary-table">
        <tbody>
          <tr>
            <th scope="row">Stops</th>
            <td>{staticNetworkSummaryKpis.totalStopCount}</td>
          </tr>
          <tr>
            <th scope="row">Completed lines</th>
            <td>{staticNetworkSummaryKpis.completedLineCount}</td>
          </tr>
          <tr>
            <th scope="row">Projected vehicles</th>
            <td>{vehicleNetworkProjection.summary.totalProjectedVehicleCount}</td>
          </tr>
          <tr>
            <th scope="row">Active service band</th>
            <td className="inspector-compact-table__value--left">
              {TIME_BAND_DISPLAY_LABELS[networkServicePlanProjection.summary.activeTimeBandId]}
            </td>
          </tr>
          <tr>
            <th scope="row">Global state</th>
            <td className="inspector-compact-table__value--left">{globalStateLabel}</td>
          </tr>
          <tr>
            <th scope="row">Degraded service lines</th>
            <td>{networkServicePlanProjection.summary.degradedLineCount}</td>
          </tr>
          <tr>
            <th scope="row">Blocked service lines</th>
            <td>{networkServicePlanProjection.summary.blockedLineCount}</td>
          </tr>
        </tbody>
      </table>

      <InspectorDisclosure summaryText="Network inventory">
        <NetworkInventory
          placedStops={placedStops}
          completedLines={completedLines}
          onStopSelect={onStopSelectionChange}
          onLineSelect={onSelectedLineIdChange}
          onLineRename={onLineRename}
        />
      </InspectorDisclosure>
    </section>
  );
}
