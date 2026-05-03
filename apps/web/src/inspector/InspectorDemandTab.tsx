import type { ReactElement } from 'react';
import { MaterialIcon } from '../ui/icons/MaterialIcon';
import { InspectorDisclosure } from '../ui/InspectorDisclosure';
import { TIME_BAND_DISPLAY_LABELS } from '../domain/constants/timeBands';

interface InspectorDemandTabProps {
  readonly scenarioDemandCaptureProjection: import('../domain/projection/scenarioDemandCaptureProjection').ScenarioDemandCaptureProjection;
  readonly servedDemandProjection: import('../domain/projection/servedDemandProjection').ServedDemandProjection;
  readonly demandGapRankingProjection: import('../domain/projection/demandGapProjection').DemandGapRankingProjection;
  readonly demandGapOdContextProjection: import('../domain/projection/demandGapOdContextProjection').DemandGapOdContextProjection;
  readonly onPositionFocus: (position: { lng: number; lat: number }) => void;
  readonly onDemandGapFocus: (gap: import('../domain/projection/demandGapProjection').DemandGapRankingItem | null) => void;
  readonly focusedDemandGapId: string | null;
}

const PLANNING_GUIDANCE: Record<import('../domain/projection/demandGapProjection').DemandGapKind, string> = {
  'uncaptured-residential': 'Place a stop near this location to capture residential demand.',
  'captured-unserved-residential': 'Connect capturing stops to workplace destinations to serve this demand.',
  'captured-unreachable-workplace': 'Connect this workplace to residential areas via active bus lines.'
};

/**
 * Renders demand-related projections, including capture summaries, served demand, and identified gaps.
 */
export function InspectorDemandTab({
  scenarioDemandCaptureProjection,
  servedDemandProjection,
  demandGapRankingProjection,
  demandGapOdContextProjection,
  onPositionFocus,
  onDemandGapFocus,
  focusedDemandGapId
}: InspectorDemandTabProps): ReactElement {
  const renderGapList = (gaps: readonly import('../domain/projection/demandGapProjection').DemandGapRankingItem[], title: string): ReactElement | null => {
    if (gaps.length === 0) return null;

    return (
      <div className="inspector-demand-gaps__section">
        <h4 className="inspector-demand-gaps__section-title">{title}</h4>
        {gaps.map((gap) => {
          const isFocused = gap.id === focusedDemandGapId;
          return (
            <div key={gap.id} className={`inspector-demand-gaps__item ${isFocused ? 'inspector-demand-gaps__item--focused' : ''}`}>
              <div className="inspector-demand-gaps__item-content">
                <span className="inspector-demand-gaps__item-label">
                  Pressure: {gap.activeWeight.toFixed(1)}
                </span>
                <span className="inspector-demand-gaps__item-note">{gap.note}</span>
                {isFocused && (
                  <div className="inspector-demand-gaps__guidance" aria-live="polite">
                    <MaterialIcon name="info" />
                    <span>{PLANNING_GUIDANCE[gap.kind]}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`inspector-demand-gaps__focus-button ${isFocused ? 'inspector-demand-gaps__focus-button--active' : ''}`}
                title="Focus on map"
                onClick={() => onDemandGapFocus(gap)}
              >
                <MaterialIcon name="center_focus_strong" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="inspector-demand-tab" aria-label="Demand">
      <h3>Demand</h3>

      <h4 className="inspector-section-title">Demand capture</h4>
      {scenarioDemandCaptureProjection.status === 'unavailable' ? (
        <p className="inspector-dialog__note">Demand projection unavailable.</p>
      ) : (
        <>
          <p className="inspector-dialog__note">
            Place stops to capture nearby scenario demand.
          </p>
          <table className="inspector-compact-table inspector-network-summary__primary-table">
            <tbody>
              <tr>
                <th scope="row">Residential nodes</th>
                <td>
                  {scenarioDemandCaptureProjection.residentialSummary.capturedCount} / {scenarioDemandCaptureProjection.residentialSummary.totalCount}
                </td>
              </tr>
              <tr>
                <th scope="row">Workplace destinations</th>
                <td>
                  {scenarioDemandCaptureProjection.workplaceSummary.capturedCount} / {scenarioDemandCaptureProjection.workplaceSummary.totalCount}
                </td>
              </tr>
            </tbody>
          </table>

          <InspectorDisclosure summaryText="Capture details">
            <table className="inspector-compact-table">
              <tbody>
                <tr>
                  <th scope="row">Access radius</th>
                  <td>
                    {scenarioDemandCaptureProjection.accessRadiusMeters}m
                  </td>
                </tr>
                {scenarioDemandCaptureProjection.gatewaySummary.totalCount > 0 && (
                  <tr>
                    <th scope="row">Gateways</th>
                    <td>
                      {scenarioDemandCaptureProjection.gatewaySummary.capturedCount} / {scenarioDemandCaptureProjection.gatewaySummary.totalCount}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </InspectorDisclosure>
        </>
      )}

      <h4 className="inspector-section-title">Served demand</h4>
      {servedDemandProjection.status === 'unavailable' ? (
        <p className="inspector-dialog__note">Served demand projection unavailable.</p>
      ) : (
        <>
          <table className="inspector-compact-table inspector-network-summary__primary-table">
            <tbody>
              <tr>
                <th scope="row">Residential served</th>
                <td>
                  {Math.round(servedDemandProjection.servedResidentialActiveWeight)} / {Math.round(servedDemandProjection.capturedResidentialActiveWeight)}
                </td>
              </tr>
              <tr>
                <th scope="row">Workplace reachable</th>
                <td>
                  {Math.round(servedDemandProjection.reachableWorkplaceActiveWeight)} / {Math.round(servedDemandProjection.capturedWorkplaceActiveWeight)}
                </td>
              </tr>
            </tbody>
          </table>

          <InspectorDisclosure summaryText="Service details">
            <table className="inspector-compact-table">
              <tbody>
                <tr>
                  <th scope="row">Active band</th>
                  <td className="inspector-compact-table__value--left">
                    {TIME_BAND_DISPLAY_LABELS[servedDemandProjection.activeTimeBandId]}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Unserved captured res.</th>
                  <td>
                    {Math.round(servedDemandProjection.unservedResidentialActiveWeight)}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Active service lines</th>
                  <td>{servedDemandProjection.activeServiceLineCount}</td>
                </tr>
              </tbody>
            </table>
          </InspectorDisclosure>
        </>
      )}

      <h4 className="inspector-section-title">Demand gaps</h4>
      {demandGapRankingProjection.status === 'unavailable' ? (
        <p className="inspector-dialog__note">Demand gap ranking unavailable.</p>
      ) : (
        <div className="inspector-demand-gaps">
          {demandGapRankingProjection.uncapturedResidentialGaps.length === 0 &&
            demandGapRankingProjection.capturedButUnservedResidentialGaps.length === 0 &&
            demandGapRankingProjection.capturedButUnreachableWorkplaceGaps.length === 0 ? (
            <p className="inspector-dialog__note">No major demand gaps identified.</p>
          ) : (
            <>
              <InspectorDisclosure
                summaryText="Identify gaps"
                summaryBadge={`${demandGapRankingProjection.uncapturedResidentialGaps.length + demandGapRankingProjection.capturedButUnservedResidentialGaps.length + demandGapRankingProjection.capturedButUnreachableWorkplaceGaps.length} areas`}
              >
                {renderGapList(demandGapRankingProjection.capturedButUnservedResidentialGaps, 'Unserved homes')}
                {renderGapList(demandGapRankingProjection.uncapturedResidentialGaps, 'Uncaptured homes')}
                {renderGapList(demandGapRankingProjection.capturedButUnreachableWorkplaceGaps, 'Unreachable workplaces')}
              </InspectorDisclosure>

              {focusedDemandGapId && demandGapOdContextProjection.status === 'ready' && (
                <div className="inspector-demand-gaps__od-context">
                  <h4 className="inspector-demand-gaps__section-title">Planning context</h4>
                  <p className="inspector-dialog__note">{demandGapOdContextProjection.guidance}</p>
                  {demandGapOdContextProjection.candidates.length > 0 && (
                    <table className="inspector-compact-table">
                      <thead>
                        <tr>
                          <th scope="col">Candidate {demandGapOdContextProjection.problemSide === 'origin' ? 'destination' : 'origin'}</th>
                          <th scope="col">Weight</th>
                          <th scope="col">Dist.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demandGapOdContextProjection.candidates.map(candidate => (
                          <tr key={candidate.id}>
                            <td>{candidate.id.split('-').pop()?.slice(0, 8)}</td>
                            <td>{candidate.activeWeight.toFixed(1)}</td>
                            <td>{(candidate.distanceMeters / 1000).toFixed(1)}km</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
