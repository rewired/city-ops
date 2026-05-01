import type { ReactElement } from 'react';
import { InspectorDisclosure } from '../ui/InspectorDisclosure';
import { TIME_BAND_DISPLAY_LABELS } from '../domain/constants/timeBands';

interface InspectorServiceTabProps {
  readonly servicePressureProjection: import('../domain/projection/servicePressureProjection').ServicePressureProjection;
}

/**
 * Renders service-related quality and capacity metrics, such as service pressure and headways.
 */
export function InspectorServiceTab({
  servicePressureProjection
}: InspectorServiceTabProps): ReactElement {
  return (
    <section className="inspector-service-tab" aria-label="Service">
      <h3>Service</h3>

      <h4 className="inspector-section-title">Service pressure</h4>
      {servicePressureProjection.activeDeparturesPerHourEstimate === 0 ? (
        <p className="inspector-dialog__note">No active service frequency in the current time band.</p>
      ) : (
        <>
          <table className="inspector-compact-table inspector-network-summary__primary-table">
            <tbody>
              <tr>
                <th scope="row">Pressure</th>
                <td className="inspector-compact-table__value--left">
                  {servicePressureProjection.servicePressureStatus.charAt(0).toUpperCase() +
                    servicePressureProjection.servicePressureStatus.slice(1)}
                </td>
              </tr>
              <tr>
                <th scope="row">Departures/hour</th>
                <td>{servicePressureProjection.activeDeparturesPerHourEstimate.toFixed(1)}</td>
              </tr>
            </tbody>
          </table>

          <InspectorDisclosure summaryText="Pressure details">
            <table className="inspector-compact-table">
              <tbody>
                <tr>
                  <th scope="row">Active band</th>
                  <td className="inspector-compact-table__value--left">
                    {TIME_BAND_DISPLAY_LABELS[servicePressureProjection.activeTimeBandId]}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Average headway</th>
                  <td>
                    {servicePressureProjection.averageHeadwayMinutes !== null
                      ? `${servicePressureProjection.averageHeadwayMinutes.toFixed(1)} min`
                      : '—'}
                  </td>
                </tr>
                <tr>
                  <th scope="row">Demand per departure</th>
                  <td>{servicePressureProjection.servicePressureRatio.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </InspectorDisclosure>
        </>
      )}
    </section>
  );
}
