
export interface BufferState {
  id: string;
  items: number[];
  capacity: number;
}

export interface FunnelNode {
  id: string;
  left?: FunnelNode;
  right?: FunnelNode;
  buffer: BufferState;
  isActive: boolean;
  type: 'merger' | 'input';
}

export interface SortFrame {
  array: number[];
  funnelRoot: FunnelNode;
  description: string;
  activeIndices: number[];
  mergedCount: number;
}

export interface AIInsight {
  title: string;
  content: string;
}
