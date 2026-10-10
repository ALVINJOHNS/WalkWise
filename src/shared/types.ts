export type Point = { x: number; y: number };
export type Venue = {
  id: string; slug: string; name: string; revision: number; updatedAt: string; mapImage?: string;
  nodes: Array<{ id: string; x: number; y: number; label?: string }>;
  edges: Array<{ id: string; from: string; to: string; points: Point[]; blocked?: boolean }>;
  places: Array<{ id: string; name: string; category: string; description?: string; status: 'open' | 'closed' | 'delayed'; x: number; y: number; nodeId?: string; waitMinutes?: number }>;
};
