import { describe, expect, it } from 'vitest';
import { calculateStopCatchments } from './demandCatchment';
import type { DemandNode } from '../types/demandNode';
import { createDemandNodeId, createDemandWeight } from '../types/demandNode';
import type { Stop } from '../types/stop';
import { createStopId } from '../types/stop';

describe('demandCatchment', () => {
  describe('calculateStopCatchments', () => {
    it('captures demand nodes within radius and ignores those outside', () => {
      const stop: Stop = {
        id: createStopId('stop-1'),
        position: { lng: 13.4, lat: 52.5 }
      };

      const closeNode: DemandNode = {
        id: createDemandNodeId('node-close'),
        label: 'Close',
        position: { lng: 13.4, lat: 52.5 }, // Same position, dist = 0
        role: 'origin',
        demandClass: 'residential',
        weightByTimeBand: {
          'band-1': createDemandWeight(10)
        }
      };

      const farNode: DemandNode = {
        id: createDemandNodeId('node-far'),
        label: 'Far',
        position: { lng: 13.5, lat: 52.6 }, // Far away
        role: 'origin',
        demandClass: 'residential',
        weightByTimeBand: {
          'band-1': createDemandWeight(5)
        }
      };

      const catchments = calculateStopCatchments([stop], [closeNode, farNode]);
      expect(catchments).toHaveLength(1);
      
      const catchment = catchments[0];
      expect(catchment.stopId).toBe('stop-1');
      expect(catchment.capturedDemandNodeIds).toEqual(['node-close']);
      expect(catchment.residentialOriginWeightByTimeBand['band-1']).toBe(10);
      expect(catchment.workplaceDestinationWeightByTimeBand['band-1']).toBeUndefined();
    });

    it('aggregates weights properly and separates residential origins from workplace destinations', () => {
      const stop: Stop = {
        id: createStopId('stop-1'),
        position: { lng: 13.4, lat: 52.5 }
      };

      const res1: DemandNode = {
        id: createDemandNodeId('res-1'),
        label: 'Res 1',
        position: { lng: 13.4, lat: 52.5 },
        role: 'origin',
        demandClass: 'residential',
        weightByTimeBand: {
          'band-morning': createDemandWeight(10),
          'band-evening': createDemandWeight(2)
        }
      };

      const res2: DemandNode = {
        id: createDemandNodeId('res-2'),
        label: 'Res 2',
        position: { lng: 13.401, lat: 52.5 }, // Very close
        role: 'origin',
        demandClass: 'residential',
        weightByTimeBand: {
          'band-morning': createDemandWeight(5)
        }
      };

      const work1: DemandNode = {
        id: createDemandNodeId('work-1'),
        label: 'Work 1',
        position: { lng: 13.402, lat: 52.501 }, // Very close
        role: 'destination',
        demandClass: 'workplace',
        weightByTimeBand: {
          'band-morning': createDemandWeight(20)
        }
      };

      const catchments = calculateStopCatchments([stop], [res1, res2, work1]);
      
      const catchment = catchments[0];
      expect(catchment.capturedDemandNodeIds).toEqual(['res-1', 'res-2', 'work-1']);
      
      expect(catchment.residentialOriginWeightByTimeBand['band-morning']).toBe(15);
      expect(catchment.residentialOriginWeightByTimeBand['band-evening']).toBe(2);
      
      expect(catchment.workplaceDestinationWeightByTimeBand['band-morning']).toBe(20);
      expect(catchment.workplaceDestinationWeightByTimeBand['band-evening']).toBeUndefined();
    });

    it('returns empty catchments if no nodes match', () => {
      const stop: Stop = {
        id: createStopId('stop-1'),
        position: { lng: 13.4, lat: 52.5 }
      };

      const catchments = calculateStopCatchments([stop], []);
      
      expect(catchments[0].capturedDemandNodeIds).toHaveLength(0);
      expect(Object.keys(catchments[0].residentialOriginWeightByTimeBand)).toHaveLength(0);
      expect(Object.keys(catchments[0].workplaceDestinationWeightByTimeBand)).toHaveLength(0);
    });
  });
});
