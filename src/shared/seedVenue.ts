import type { Venue } from './types';

export const seedVenue: Venue = {
  id: 'venue-kochi-01', slug: 'kochi-expo', name: 'Kochi Community Expo', revision: 1, updatedAt: '2026-10-11T00:00:00+05:30',
  nodes: [{ id: 'entrance', x: .12, y: .55, label: 'Main entrance' }, { id: 'junction', x: .5, y: .55, label: 'Central junction' }, { id: 'hall', x: .82, y: .3, label: 'North hall' }, { id: 'stage', x: .82, y: .78, label: 'South hall' }],
  edges: [{ id: 'path-west', from: 'entrance', to: 'junction', points: [{ x: .12, y: .55 }, { x: .5, y: .55 }] }, { id: 'path-north', from: 'junction', to: 'hall', points: [{ x: .5, y: .55 }, { x: .82, y: .3 }] }, { id: 'path-south', from: 'junction', to: 'stage', points: [{ x: .5, y: .55 }, { x: .82, y: .78 }] }],
  places: [{ id: 'food-court', name: 'Food Court', category: 'Food', status: 'open', x: .79, y: .28, nodeId: 'hall', waitMinutes: 5 }, { id: 'main-stage', name: 'Main Stage', category: 'Stage', status: 'open', x: .84, y: .8, nodeId: 'stage' }, { id: 'help-desk', name: 'Help Desk', category: 'Facility', status: 'open', x: .2, y: .5, nodeId: 'entrance' }]
};
