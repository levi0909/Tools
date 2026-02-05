import { PingRecord, AggregatedStats } from './types';

// Format time to Beijing Time (UTC+8)
export const formatBeijingTime = (timestamp: number, includeSeconds = true): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hour12: false,
  }).format(new Date(timestamp));
};

export const getBeijingDate = (timestamp: number): string => {
   return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(timestamp));
}

// Generate a pseudo-random number from a string seeded
const stringHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Simulate a network ping based on IP characteristics
export const simulatePing = (ip: string): { latency: number; status: 'Up' | 'Down'; packetLoss: boolean } => {
  const hash = stringHash(ip);
  
  // Use hash to determine "baseline" performance for this IP, so it feels consistent
  // Base latency between 5ms and 80ms based on IP hash
  let baseLatency = 5 + (hash % 75); 
  
  // Localhost override
  if (ip === '127.0.0.1' || ip === 'localhost') baseLatency = 1;
  else if (ip.startsWith('192.168') || ip.startsWith('10.')) baseLatency = 5;

  const jitter = 10;
  const lossChance = 0.005;

  // Occasional random spike
  if (Math.random() > 0.98) {
    baseLatency += 150;
  }
  
  // Occasional medium spike (Jitter simulation)
  if (Math.random() > 0.8) {
    baseLatency += Math.random() * 30;
  }

  // Calculate
  const isDown = Math.random() < 0.0005; // Very rare complete down
  const isLoss = !isDown && Math.random() < lossChance;

  if (isDown) return { latency: 0, status: 'Down', packetLoss: true };
  if (isLoss) return { latency: 0, status: 'Up', packetLoss: true };

  const latency = Math.floor(baseLatency + Math.random() * jitter);
  return { latency, status: 'Up', packetLoss: false };
};

export const calculateStats = (records: PingRecord[]): AggregatedStats => {
  if (records.length === 0) {
    return { avgLatency: 0, maxLatency: 0, jitter: 0, packetLossRate: 0, status: 'Excellent', score: 100 };
  }

  const validPings = records.filter(r => !r.packetLoss && r.status === 'Up');
  const totalPings = records.length;
  
  const avgLatency = validPings.length > 0 
    ? validPings.reduce((acc, curr) => acc + curr.latency, 0) / validPings.length
    : 0;

  const maxLatency = validPings.reduce((acc, curr) => Math.max(acc, curr.latency), 0);
  
  // Calculate Jitter (Standard Deviation of Latency)
  let jitter = 0;
  if (validPings.length > 1) {
    const variance = validPings.reduce((acc, curr) => acc + Math.pow(curr.latency - avgLatency, 2), 0) / (validPings.length - 1);
    jitter = Math.sqrt(variance);
  }

  const packetLossRate = totalPings > 0 
    ? ((totalPings - validPings.length) / totalPings) * 100 
    : 0;

  // Scoring Logic (0-100)
  // Deduct for latency > 50ms, heavily deduct for packet loss and high jitter
  let score = 100;
  if (avgLatency > 50) score -= 10;
  if (avgLatency > 150) score -= 20;
  if (maxLatency > 200) score -= 10;
  if (jitter > 30) score -= 15; // Jitter penalty
  score -= (packetLossRate * 10); // 1% loss = -10 points (Severe)

  let status: AggregatedStats['status'] = 'Excellent';
  if (score < 60) status = 'Poor';
  else if (score < 80) status = 'Fair';
  else if (score < 90) status = 'Good';

  return {
    avgLatency: Math.round(avgLatency),
    maxLatency,
    jitter: Math.round(jitter),
    packetLossRate: Number(packetLossRate.toFixed(2)),
    status,
    score: Math.max(0, Math.round(score)),
  };
};

export const exportToCSV = (records: PingRecord[], nodes: any[]) => {
  const headers = ['Timestamp (BJ Time)', 'Node Name', 'IP Address', 'Latency (ms)', 'Status', 'Packet Loss'];
  const rows = records.map(r => {
    const node = nodes.find(n => n.id === r.nodeId);
    return [
      formatBeijingTime(r.timestamp),
      node?.name || 'Unknown',
      node?.ip || 'Unknown',
      r.latency,
      r.status,
      r.packetLoss ? 'Yes' : 'No'
    ].join(',');
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `network_report_${new Date().toISOString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};