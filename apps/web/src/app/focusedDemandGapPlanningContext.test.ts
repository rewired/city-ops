import { describe, it, expect } from 'vitest';
import { resolveFocusedDemandGapPlanningContext } from './focusedDemandGapPlanningContext';

describe('resolveFocusedDemandGapPlanningContext', () => {
  it('derives stop-placement context from stop-placement entrypoint', () => {
    const context = resolveFocusedDemandGapPlanningContext('start-stop-placement-near-gap');
    expect(context.kind).toBe('stop-placement');
    expect(context.title).toBe('Stop placement started');
    expect(context.description).toContain('Place a stop near');
    expect(context.description).toContain('You still choose');
    expect(context.description).not.toContain('automatically');
  });

  it('derives line-planning context from line-planning entrypoint', () => {
    const context = resolveFocusedDemandGapPlanningContext('start-line-planning-near-gap');
    expect(context.kind).toBe('line-planning');
    expect(context.title).toBe('Line planning started');
    expect(context.description).toContain('Build or adjust a line');
    expect(context.description).toContain('No line is created automatically');
  });
});
