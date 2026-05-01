import type { ReactElement } from 'react';
import { MaterialIcon } from '../ui/icons/MaterialIcon';
import { InspectorDisclosure } from '../ui/InspectorDisclosure';
import { TIME_BAND_DISPLAY_LABELS } from '../domain/constants/timeBands';

interface InspectorDemandTabProps {
  readonly scenarioDemandCaptureProjection: import('../domain/projection/scenarioDemandCaptureProjection').ScenarioDemandCaptureProjection;
  readonly servedDemandProjection: import('../domain/projection/servedDemandProjection').ServedDemandProjection;
  readonly demandGapRankingProjection: import('../domain/projection/demandGapProjection').DemandGapRankingProjection;
  readonly onPositionFocus: (position: { lng: number; lat: number }) => void;
}

/**
 * Renders demand-related projections, including capture summaries, served demand, and identified gaps.
 */
export function InspectorDemandTab({
  scenarioDemandCaptureProjection,
  servedDemandProjection,
  demandGapRankingProjection,
  onPositionFocus
}: InspectorDemandTabProps): ReactElement {
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
            <InspectorDisclosure
              summaryText="Identify gaps"
              summaryBadge={`${demandGapRankingProjection.uncapturedResidentialGaps.length + demandGapRankingProjection.capturedButUnservedResidentialGaps.length + demandGapRankingProjection.capturedButUnreachableWorkplaceGaps.length} areas`}
            >
              {[
                { title: 'Unserved homes', gaps: demandGapRankingProjection.capturedButUnservedResidentialGaps },
                { title: 'Uncaptured homes', gaps: demandGapRankingProjection.uncapturedResidentialGaps },
                { title: 'Unreachable workplaces', gaps: demandGapRankingProjection.capturedButUnreachableWorkplaceGaps }
              ].map(
                (section) =>
                  section.gaps.length > 0 && (
                    <div key={section.title} className="inspector-demand-gaps__section">
                      <h5 className="inspector-demand-gaps__section-title">{section.title}</h5>
                      <ul className="inspector-simple-list">
                        {section.gaps.map((gap) => (
                          <li key={gap.id} className="inspector-demand-gaps__item">
                            <div className="inspector-demand-gaps__item-content">
                              <span className="inspector-demand-gaps__item-label">
                                {gap.id} · {gap.activeWeight.toFixed(1)} demand
                              </span>
                              <span className="inspector-demand-gaps__item-note">{gap.note}</span>
                            </div>
                            <button
                              type="button"
                              className="inspector-demand-gaps__focus-button"
                              title="Focus on map"
                              onClick={() => onPositionFocus(gap.position)}
                            >
                              <MaterialIcon name="center_focus_strong" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </InspectorDisclosure>
          )}
        </div>
      )}
    </section>
  );
}
