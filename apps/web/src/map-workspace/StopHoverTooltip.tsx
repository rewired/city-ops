import type { ReactElement } from 'react';
import type { Line } from '../domain/types/line';
import type { Stop, StopId } from '../domain/types/stop';

interface StopHoverTooltipProps {
  readonly stop: Stop;
  readonly x: number;
  readonly y: number;
  readonly sessionLines: readonly Line[];
  readonly selectedLineId: Line['id'] | null;
}

/**
 * Premium glassmorphism-style tooltip for stop hover details on the map.
 * Displays stop name, serving lines, and selected-line sequence position.
 */
export function StopHoverTooltip({
  stop,
  x,
  y,
  sessionLines,
  selectedLineId
}: StopHoverTooltipProps): ReactElement {
  const servingLines = sessionLines.filter((line) => line.stopIds.includes(stop.id));
  const selectedLine = sessionLines.find((l) => l.id === selectedLineId);
  const sequencePositions = selectedLine
    ? selectedLine.stopIds
        .map((id, index) => (id === stop.id ? index + 1 : null))
        .filter((pos): pos is number => pos !== null)
    : [];

  return (
    <div
      className="stop-hover-tooltip"
      style={{
        position: 'absolute',
        left: x + 12,
        top: y - 12,
        pointerEvents: 'none',
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        color: '#f8fafc',
        minWidth: '180px'
      }}
    >
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#f59e0b' }}>
        {stop.label ?? stop.id}
      </h3>
      
      <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Serving Lines
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {servingLines.length > 0 ? (
            servingLines.map((line) => (
              <span
                key={line.id}
                style={{
                  backgroundColor: line.id === selectedLineId ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                  color: line.id === selectedLineId ? '#0f172a' : '#f8fafc',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                {line.label}
              </span>
            ))
          ) : (
            <span style={{ opacity: 0.5, fontStyle: 'italic' }}>None</span>
          )}
        </div>

        {sequencePositions.length > 0 && selectedLine && (
          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ opacity: 0.7 }}>Position on {selectedLine.label}: </span>
            <span style={{ fontWeight: 600, color: '#f59e0b' }}>{sequencePositions.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
