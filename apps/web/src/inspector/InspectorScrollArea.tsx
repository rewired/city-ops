import type { ReactNode, ReactElement } from 'react';

interface InspectorScrollAreaProps {
  /** The content to be rendered inside the scrollable area. */
  readonly children: ReactNode;
}

/**
 * Provides a bounded, scrollable container for inspector content.
 * Applies custom scrollbar styling via the .u-scrollbar utility.
 */
export function InspectorScrollArea({ children }: InspectorScrollAreaProps): ReactElement {
  return (
    <div 
      className="inspector-scroll-area u-scrollbar" 
      style={{ 
        flex: 1, 
        overflowY: 'auto',
        minHeight: 0 // Crucial for flex child scrolling
      }}
    >
      {children}
    </div>
  );
}
