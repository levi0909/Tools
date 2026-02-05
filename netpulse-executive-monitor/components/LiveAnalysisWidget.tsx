import React from 'react';
import { AggregatedStats } from '../types';
import { IconActivity } from './Icons';

interface LiveAnalysisWidgetProps {
  realtimeStats: AggregatedStats; // Last 1 minute
  sessionStats: AggregatedStats; // Total Session
  isMonitoring: boolean;
}

const LiveAnalysisWidget: React.FC<LiveAnalysisWidgetProps> = ({ realtimeStats, sessionStats, isMonitoring }) => {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-apple-green bg-green-50 border-green-200';
      case 'Good': return 'text-apple-blue bg-blue-50 border-blue-200';
      case 'Fair': return 'text-apple-orange bg-yellow-50 border-yellow-200';
      case 'Poor': return 'text-apple-red bg-red-50 border-red-200';
      default: return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
      if (score >= 90) return '#34C759'; // Green
      if (score >= 80) return '#0071E3'; // Blue
      if (score >= 60) return '#FF9500'; // Orange
      return '#FF3B30'; // Red
  };

  // SVG Gauge calculation
  // Using a 100x100 viewBox for easier calculation and to prevent clipping
  const radius = 40;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const center = 50;
  
  const realtimeOffset = circumference - (realtimeStats.score / 100) * circumference;
  const sessionOffset = circumference - (sessionStats.score / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real-time Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {isMonitoring && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apple-green opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isMonitoring ? 'bg-apple-green' : 'bg-gray-300'}`}></span>
                    </span>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Live Quality (60s)</h3>
                </div>
                
                <div className="flex items-baseline gap-3 mb-2">
                   <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold border ${getStatusColor(realtimeStats.status)}`}>
                       {realtimeStats.status}
                   </div>
                   {/* Professional IT Metric: Jitter */}
                   {realtimeStats.jitter > 0 && (
                     <div className="text-xs font-mono text-gray-500" title="Jitter (Standard Deviation)">
                        ±{realtimeStats.jitter}ms Jitter
                     </div>
                   )}
                </div>

                <div className="text-[10px] text-gray-400 font-medium">
                  Loss: {realtimeStats.packetLossRate}% | Max: {realtimeStats.maxLatency}ms
                </div>
            </div>

            {/* Gauge - Fixed ViewBox */}
            <div className="relative w-20 h-20 flex-shrink-0">
                 <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                    <circle cx={center} cy={center} r={radius} stroke="#F3F4F6" strokeWidth={stroke} fill="transparent" />
                    <circle 
                        cx={center} cy={center} r={radius} 
                        stroke={getScoreColor(realtimeStats.score)} 
                        strokeWidth={stroke} 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={realtimeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 leading-none">{realtimeStats.score}</span>
                 </div>
            </div>
        </div>

        {/* Session Card */}
        <div className="bg-white/60 rounded-2xl p-5 border border-gray-200/60 shadow-sm flex items-center justify-between">
            <div>
                 <div className="flex items-center gap-2 mb-2">
                    <IconActivity className="w-3.5 h-3.5 text-gray-500" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Session Overall</h3>
                </div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold border mb-2 ${getStatusColor(sessionStats.status)}`}>
                    {sessionStats.status}
                </div>
                <div className="text-[10px] text-gray-400 font-medium">
                   Cumulative assessment
                </div>
            </div>
             {/* Gauge - Fixed ViewBox */}
             <div className="relative w-20 h-20 flex-shrink-0 opacity-80">
                 <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                    <circle cx={center} cy={center} r={radius} stroke="#F3F4F6" strokeWidth={stroke} fill="transparent" />
                    <circle 
                        cx={center} cy={center} r={radius} 
                        stroke={getScoreColor(sessionStats.score)} 
                        strokeWidth={stroke} 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={sessionOffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 leading-none">{sessionStats.score}</span>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default LiveAnalysisWidget;