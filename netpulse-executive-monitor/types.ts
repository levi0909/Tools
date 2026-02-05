export type NodeCategory = 'Local' | 'Gateway' | 'WAN' | 'Service';

export interface NetworkNode {
  id: string;
  name: string;
  ip: string;
  category: NodeCategory;
}

export interface PingRecord {
  timestamp: number;
  nodeId: string;
  latency: number; // in ms
  status: 'Up' | 'Down';
  packetLoss: boolean;
}

export interface AggregatedStats {
  avgLatency: number;
  maxLatency: number;
  jitter: number; // Standard deviation of latency
  packetLossRate: number;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  score: number; // 0-100
}

export interface SessionData {
  id: string;
  startTime: number;
  endTime?: number;
  records: PingRecord[];
}