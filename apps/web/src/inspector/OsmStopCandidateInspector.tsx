import type { ReactElement } from 'react';
import { MaterialIcon } from '../ui/icons/MaterialIcon';
import type { OsmStopCandidateGroupId, OsmStopCandidateGroup } from '../domain/types/osmStopCandidate';
import type { OsmStopCandidateStreetAnchorResolution } from '../domain/osm/osmStopCandidateAnchorTypes';
import { evaluateOsmStopCandidateAdoptionEligibility } from '../domain/osm/osmStopCandidateAdoption';
import type { Stop } from '../domain/types/stop';

interface OsmStopCandidateInspectorProps {
  readonly candidateGroup: OsmStopCandidateGroup;
  readonly anchorResolution: OsmStopCandidateStreetAnchorResolution | null;
  readonly existingStops: readonly Stop[];
  readonly adoptedCandidateGroupIds: ReadonlySet<OsmStopCandidateGroupId>;
  readonly onAdopt: (group: OsmStopCandidateGroup, anchor: OsmStopCandidateStreetAnchorResolution) => void;
}

/**
 * Renders details and adoption actions for a selected OSM stop candidate group.
 */
export function OsmStopCandidateInspector({
  candidateGroup,
  anchorResolution,
  existingStops,
  adoptedCandidateGroupIds,
  onAdopt
}: OsmStopCandidateInspectorProps): ReactElement {
  const eligibility = evaluateOsmStopCandidateAdoptionEligibility({
    group: candidateGroup,
    anchor: anchorResolution,
    existingStops,
    adoptedCandidateGroupIds
  });

  const memberKinds = Array.from(new Set(candidateGroup.memberKinds)).join(', ');

  return (
    <div className="inspector-panel__content inspector-panel__content--osm-candidate">
      <header className="inspector-panel__header">
        <div className="inspector-panel__header-main">
          <div className="inspector-panel__title-row">
            <MaterialIcon name="add_location_alt" className="inspector-panel__title-icon" />
            <h2 className="inspector-panel__title">{candidateGroup.label}</h2>
          </div>
          <p className="inspector-panel__subtitle">OSM Candidate Group</p>
        </div>
      </header>

      <div className="inspector-panel__body">
        <section className="inspector-panel__section">
          <h3 className="inspector-panel__section-title">Candidate Details</h3>
          <table className="inspector-panel__table">
            <tbody>
              <tr>
                <th>Members</th>
                <td>{candidateGroup.memberCount} ({memberKinds})</td>
              </tr>
              <tr>
                <th>Anchor Status</th>
                <td>
                  <span className={`status-badge status-badge--${anchorResolution?.status ?? 'unknown'}`}>
                    {anchorResolution?.status ?? 'unresolved'}
                  </span>
                </td>
              </tr>
              {anchorResolution?.distanceMeters !== null && anchorResolution?.distanceMeters !== undefined && (
                <tr>
                  <th>Anchor Offset</th>
                  <td>{Math.round(anchorResolution.distanceMeters)}m</td>
                </tr>
              )}
              {anchorResolution?.streetLabelCandidate && (
                <tr>
                  <th>Street</th>
                  <td>{anchorResolution.streetLabelCandidate}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="inspector-panel__section">
          <h3 className="inspector-panel__section-title">Adoption</h3>
          <div className="inspector-panel__adoption-actions">
            {!eligibility.canAdopt && (
              <div className="inspector-panel__adoption-blocked-reason">
                <MaterialIcon name="info" />
                <span>{eligibility.reason}</span>
              </div>
            )}
            <button
              type="button"
              className="inspector-panel__action-button inspector-panel__action-button--primary"
              disabled={!eligibility.canAdopt}
              onClick={() => {
                if (anchorResolution) {
                  onAdopt(candidateGroup, anchorResolution);
                }
              }}
            >
              <MaterialIcon name="add_location_alt" />
              <span>Adopt stop</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
