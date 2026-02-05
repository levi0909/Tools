import React from 'react';
import { NetworkNode, PingRecord } from '../types';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

interface NodeCardProps {
  node: NetworkNode;
  history: PingRecord[];
  latest?: PingRecord;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, history, latest }) => {
  // Get last 20 points for sparkline
  const sparkData = history.slice(-20).map(h => ({ val: h.packetLoss ? 0 : h.latency }));
  
  const isOffline = latest?.status === 'Down';
  const isLoss = latest?.packetLoss;
  const isHighLatency = (latest?.latency || 0) > 100;

  let statusColor = 'bg-apple-green';
  let textColor = 'text-apple-green';
  
  if (isOffline) {
    statusColor = 'bg-apple-red';
    textColor = 'text-apple-red';
  } else if (isLoss || isHighLatency) {
    statusColor = 'bg-apple-orange';
    textColor = 'text-apple-orange';
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl p-4 flex flex-col justify-between h-32 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 truncate max-w-[150px]" title={node.name}>{node.name}</h3>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{node.ip}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className={`flex items-center gap-1.5 ${textColor} font-medium`}>
            <span className={`w-2 h-2 rounded-full ${statusColor} ${latest ? 'animate-pulse' : ''}`}></span>
            <span className="text-lg tabular-nums tracking-tight">
              {isOffline ? 'ERR' : isLoss ? 'LOSS' : `${latest?.latency ?? '--'} ms`}
            </span>
          </div>
        </div>
      </div>

      <div className="h-10 mt-2 w-full opacity-50">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`color-${node.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isOffline || isLoss ? '#FF3B30' : '#34C759'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isOffline || isLoss ? '#FF3B30' : '#34C759'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 'auto']} />
            <Area 
              type="monotone" 
              dataKey="val" 
              stroke={isOffline || isLoss ? '#FF3B30' : '#34C759'} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#color-${node.id})`} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NodeCard;