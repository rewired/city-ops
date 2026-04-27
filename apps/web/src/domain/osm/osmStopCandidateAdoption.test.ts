import { describe, it, expect } from 'vitest';
import { evaluateOsmStopCandidateAdoptionEligibility, createStopFromOsmCandidateGroup } from './osmStopCandidateAdoption';
import { createOsmStopCandidateGroupId } from '../types/osmStopCandidate';
import { createStopId } from '../types/stop';

describe('osmStopCandidateAdoption', () => {
  const mockGroup: import('../types/osmStopCandidate').OsmStopCandidateGroup = {
    id: createOsmStopCandidateGroupId('group-1'),
    label: 'Test Stop',
    displayPosition: { lng: 10, lat: 50 },
    routingAnchorPosition: { lng: 10, lat: 50 },
    memberIds: [],
    memberKinds: ['bus-stop'],
    memberCount: 1,
    passengerVisibleMemberCount: 1,
    vehicleAnchorMemberCount: 0,
    berthCountHint: 1,
    source: 'osm'
  };

  const mockAnchor: import('./osmStopCandidateAnchorTypes').OsmStopCandidateStreetAnchorResolution = {
    candidateGroupId: mockGroup.id,
    status: 'ready' as const,
    source: 'street-snap',
    originalAnchorPosition: { lng: 10, lat: 50 },
    streetAnchorPosition: { lng: 10.0001, lat: 50.0001 },
    distanceMeters: 10,
    streetLabelCandidate: 'Main St',
    reason: 'Nearby street found'
  };

  describe('evaluateOsmStopCandidateAdoptionEligibility', () => {
    it('returns adoptable for a ready anchor and no duplicates', () => {
      const result = evaluateOsmStopCandidateAdoptionEligibility({
        group: mockGroup,
        anchor: mockAnchor,
        existingStops: [],
        adoptedCandidateGroupIds: new Set()
      });

      expect(result.status).toBe('adoptable');
      expect(result.canAdopt).toBe(true);
    });

    it('returns already-adopted if the id is in the adopted set', () => {
      const result = evaluateOsmStopCandidateAdoptionEligibility({
        group: mockGroup,
        anchor: mockAnchor,
        existingStops: [],
        adoptedCandidateGroupIds: new Set([mockGroup.id])
      });

      expect(result.status).toBe('already-adopted');
      expect(result.canAdopt).toBe(false);
    });

    it('returns anchor-not-ready if anchor is null or not ready', () => {
      const result = evaluateOsmStopCandidateAdoptionEligibility({
        group: mockGroup,
        anchor: null,
        existingStops: [],
        adoptedCandidateGroupIds: new Set()
      });

      expect(result.status).toBe('anchor-not-ready');
      expect(result.canAdopt).toBe(false);

      const result2 = evaluateOsmStopCandidateAdoptionEligibility({
        group: mockGroup,
        anchor: { ...mockAnchor, status: 'review' },
        existingStops: [],
        adoptedCandidateGroupIds: new Set()
      });

      expect(result2.status).toBe('anchor-not-ready');
    });

    it('returns too-close-to-existing-stop if an existing stop is within 15m', () => {
      const result = evaluateOsmStopCandidateAdoptionEligibility({
        group: mockGroup,
        anchor: mockAnchor,
        existingStops: [
          {
            id: createStopId('stop-1'),
            label: 'Existing',
            position: { lng: 10.0001, lat: 50.0001 } // Exact match with anchor
          }
        ],
        adoptedCandidateGroupIds: new Set()
      });

      expect(result.status).toBe('too-close-to-existing-stop');
      expect(result.canAdopt).toBe(false);
    });
  });

  describe('createStopFromOsmCandidateGroup', () => {
    it('creates a stop with the street anchor position', () => {
      const stop = createStopFromOsmCandidateGroup({
        group: mockGroup,
        anchor: mockAnchor,
        nextStopIndex: 5
      });

      expect(stop.id).toBe('stop-5');
      expect(stop.position).toEqual(mockAnchor.streetAnchorPosition);
      expect(stop.label).toBe(mockGroup.label);
    });

    it('throws if anchor is not ready', () => {
      expect(() =>
        createStopFromOsmCandidateGroup({
          group: mockGroup,
          anchor: { ...mockAnchor, status: 'review' },
          nextStopIndex: 1
        })
      ).toThrow();
    });
  });
});
