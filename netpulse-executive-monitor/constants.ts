import { NetworkNode } from './types';

export const MONITORED_NODES: NetworkNode[] = [
  { id: '1', name: 'kubernetes.docker.internal', ip: '127.0.0.1', category: 'Local' },
  { id: '2', name: 'Local Gateway', ip: '192.168.10.1', category: 'Gateway' },
  { id: '3', name: 'SMB SHARE', ip: '61.169.142.33', category: 'WAN' },
  { id: '4', name: 'Aliyun DNS', ip: '223.5.5.5', category: 'WAN' },
  { id: '5', name: 'Google DNS', ip: '8.8.8.8', category: 'WAN' },
  { id: '6', name: 'Google Meet', ip: '142.250.197.14', category: 'Service' },
  { id: '7', name: 'Zoom Meeting', ip: '170.114.52.2', category: 'Service' },
];

export const GRADE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  FAIR: 60,
};