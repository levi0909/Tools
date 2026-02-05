import React from 'react';
import { NetworkNode, PingRecord } from '../types';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { IconLaptop, IconRouter, IconCloud, IconServer } from './Icons';

interface TopologyNodeProps {
  node: NetworkNode;
  history: PingRecord[];
  latest?: PingRecord;
  isFirst: boolean;
  isLast: boolean;
}

const TopologyNode: React.FC<TopologyNodeProps> = ({ node, history, latest, isFirst, isLast }) => {
  const sparkData = history.slice(-20).map(h => ({ val: h.packetLoss ? 0 : h.latency }));
  
  const isOffline = latest?.status === 'Down';
  const isLoss = latest?.packetLoss;
  const isHighLatency = (latest?.latency || 0) > 100;
  
  let statusColor = 'bg-apple-green';
  let latencyColor = 'text-gray-900';
  
  if (isOffline) {
    statusColor = 'bg-apple-red';
    latencyColor = 'text-apple-red';
  } else if (isLoss || isHighLatency) {
    statusColor = 'bg-apple-orange';
    latencyColor = 'text-apple-orange';
  }

  // Icon Selection
  let Icon = IconCloud;
  if (node.category === 'Local') Icon = IconLaptop;
  if (node.category === 'Gateway') Icon = IconRouter;
  if (node.category === 'Service') Icon = IconServer;

  return (
    <div className="relative pl-8 pb-8">
      {/* Topology Line */}
      {!isLast && (
        <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200 border-l border-dashed border-gray-300"></div>
      )}
      
      {/* Node Dot/Icon */}
      <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 z-10 ${isOffline ? 'border-red-500' : 'border-blue-500'}`}>
         <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-blue-500'}`}></div>
      </div>

      {/* Card Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex items-center justify-between gap-4">
        
        {/* Left: Info */}
        <div className="flex items-center gap-4 min-w-[200px]">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-600`}>
              <Icon className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-sm font-semibold text-gray-900">{node.name}</h3>
             <p className="text-xs text-gray-500 font-mono">{node.ip}</p>
           </div>
        </div>

        {/* Middle: Live Sparkline */}
        <div className="flex-1 h-8 opacity-60 max-w-[150px] hidden sm:block">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`grad-${node.id}`} x1="0" y1="0" x2="0" y2="1">
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
                fill={`url(#grad-${node.id})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Metrics */}
        <div className="flex items-center gap-4 min-w-[100px] justify-end">
           <div className="text-right">
              <div className={`text-lg font-bold tabular-nums leading-none ${latencyColor}`}>
                {isOffline ? 'DOWN' : isLoss ? 'LOSS' : `${latest?.latency ?? '--'} ms`}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400 mt-1">Latency</div>
           </div>
           <div className={`w-2.5 h-2.5 rounded-full ${statusColor} ${latest ? 'animate-pulse' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default TopologyNode;