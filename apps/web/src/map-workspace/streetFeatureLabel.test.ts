import { describe, it, expect } from 'vitest';
import { extractStreetLabelCandidate } from './streetFeatureLabel';

describe('extractStreetLabelCandidate', () => {
  it('extracts "name" property when present', () => {
    const properties = { name: 'Reeperbahn' };
    expect(extractStreetLabelCandidate(properties)).toBe('Reeperbahn');
  });

  it('trims and collapses whitespace', () => {
    const properties = { name: '  Mönckebergstraße   12 ' };
    expect(extractStreetLabelCandidate(properties)).toBe('Mönckebergstraße 12');
  });

  it('falls back to "name:de" if "name" is missing', () => {
    const properties = { 'name:de': 'Jungfernstieg' };
    expect(extractStreetLabelCandidate(properties)).toBe('Jungfernstieg');
  });

  it('falls back to "name_de" if "name" and "name:de" are missing', () => {
    const properties = { name_de: 'Jungfernstieg' };
    expect(extractStreetLabelCandidate(properties)).toBe('Jungfernstieg');
  });

  it('falls back to "name:en" if prior names are missing', () => {
    const properties = { 'name:en': 'Central Station' };
    expect(extractStreetLabelCandidate(properties)).toBe('Central Station');
  });

  it('falls back to "name_en" if prior names are missing', () => {
    const properties = { name_en: 'Central Station' };
    expect(extractStreetLabelCandidate(properties)).toBe('Central Station');
  });

  it('falls back to "name:latin" if prior names are missing', () => {
    const properties = { 'name:latin': 'Main St' };
    expect(extractStreetLabelCandidate(properties)).toBe('Main St');
  });

  it('falls back to "name_latin" if prior names are missing', () => {
    const properties = { name_latin: 'Main St' };
    expect(extractStreetLabelCandidate(properties)).toBe('Main St');
  });

  it('prefers "name" over "name:de"', () => {
    const properties = { name: 'Main Road', 'name:de': 'Hauptstraße' };
    expect(extractStreetLabelCandidate(properties)).toBe('Main Road');
  });

  it('falls back to "ref" as final candidate', () => {
    const properties = { ref: 'A7', highway: 'motorway' };
    expect(extractStreetLabelCandidate(properties)).toBe('A7');
  });

  it('rejects "ref" if it is a generic road class', () => {
    const properties = { ref: 'residential' };
    expect(extractStreetLabelCandidate(properties)).toBeNull();
  });

  it('rejects generic road class values case-insensitively', () => {
    const properties = { name: 'Service' };
    expect(extractStreetLabelCandidate(properties)).toBeNull();
  });

  it('returns null if no usable property exists', () => {
    const properties = { highway: 'motorway', other: 'stuff' };
    expect(extractStreetLabelCandidate(properties)).toBeNull();
  });

  it('returns null for empty strings', () => {
    const properties = { name: '  ' };
    expect(extractStreetLabelCandidate(properties)).toBeNull();
  });

  it('returns null for non-string values', () => {
    const properties = { name: 123 };
    expect(extractStreetLabelCandidate(properties)).toBeNull();
  });

  it('returns null if properties are undefined', () => {
    expect(extractStreetLabelCandidate(undefined)).toBeNull();
  });
});
