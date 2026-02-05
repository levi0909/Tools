import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MONITORED_NODES } from '../constants';
import { PingRecord, NetworkNode, AggregatedStats } from '../types';
import { simulatePing, formatBeijingTime, calculateStats } from '../utils';
import TopologyNode from './TopologyNode';
import SummaryReport from './SummaryReport';
import SettingsModal from './SettingsModal';
import LiveAnalysisWidget from './LiveAnalysisWidget';
import { IconSettings } from './Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const MainLayout: React.FC = () => {
  // Config State
  const [nodes, setNodes] = useState<NetworkNode[]>(MONITORED_NODES);
  const [showSettings, setShowSettings] = useState(false);

  // Runtime State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [logs, setLogs] = useState<PingRecord[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  
  // Stats State
  const [realtimeStats, setRealtimeStats] = useState<AggregatedStats>({ score: 100, status: 'Excellent', avgLatency: 0, maxLatency: 0, jitter: 0, packetLossRate: 0 });
  const [sessionStats, setSessionStats] = useState<AggregatedStats>({ score: 100, status: 'Excellent', avgLatency: 0, maxLatency: 0, jitter: 0, packetLossRate: 0 });

  // Refs
  const clockRef = useRef<number>();
  const monitorRef = useRef<number>();

  // Clock
  useEffect(() => {
    clockRef.current = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(clockRef.current);
  }, []);

  // Monitoring
  useEffect(() => {
    if (isMonitoring) {
      if (!startTime) setStartTime(Date.now());
      
      monitorRef.current = window.setInterval(() => {
        const timestamp = Date.now();
        const newRecords = nodes.map(node => ({
          timestamp,
          nodeId: node.id,
          ...simulatePing(node.ip)
        }));
        
        setLogs(prev => {
          const updatedLogs = [...prev, ...newRecords];
          // Calculate Stats on update
          const lastMinuteLogs = updatedLogs.filter(l => l.timestamp > Date.now() - 60000);
          setRealtimeStats(calculateStats(lastMinuteLogs));
          setSessionStats(calculateStats(updatedLogs));
          return updatedLogs;
        });
      }, 1000); 
    } else {
      clearInterval(monitorRef.current);
    }
    return () => clearInterval(monitorRef.current);
  }, [isMonitoring, startTime, nodes]);

  const toggleMonitoring = () => {
    if (isMonitoring) {
      setIsMonitoring(false);
      setShowSummary(true);
    } else {
      setLogs([]);
      setStartTime(Date.now());
      setIsMonitoring(true);
      setShowSummary(false);
      setRealtimeStats(calculateStats([]));
      setSessionStats(calculateStats([]));
    }
  };

  const closeSummary = () => {
    setShowSummary(false);
    setStartTime(null);
    setLogs([]);
  };

  // Improved Chart Data Processing Engine
  const chartData = useMemo(() => {
    if (logs.length === 0) return [];

    // Keep data window manageable
    const windowSize = nodes.length * 120; 
    const recentLogs = logs.slice(-windowSize);

    const dataMap = new Map<number, any>();

    recentLogs.forEach(record => {
      if (!dataMap.has(record.timestamp)) {
        dataMap.set(record.timestamp, {
          timestamp: record.timestamp,
          timeStr: formatBeijingTime(record.timestamp),
        });
      }
      const point = dataMap.get(record.timestamp);
      point[record.nodeId] = record.packetLoss ? null : record.latency;
    });

    return Array.from(dataMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-60); // Show last 60 seconds
  }, [logs, nodes.length]);

  // IT Feature: Extract Anomalies
  const anomalies = logs.filter(l => l.latency > 150 || l.packetLoss).slice(-5).reverse();

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold shadow-lg">NP</div>
             <h1 className="text-xl font-bold tracking-tight hidden sm:block">NetPulse Executive</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-gray-500">Beijing Time (UTC+8)</div>
              <div className="text-lg font-mono font-semibold tabular-nums leading-none">
                {formatBeijingTime(currentTime)}
              </div>
            </div>
            
            <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>

            <button
              onClick={() => setShowSettings(true)}
              disabled={isMonitoring}
              className={`p-2 rounded-full transition-colors ${isMonitoring ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Configure Network Topology"
            >
              <IconSettings className="w-6 h-6" />
            </button>

            <button
              onClick={toggleMonitoring}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-all shadow-sm ${
                isMonitoring 
                  ? 'bg-white border border-apple-red text-apple-red hover:bg-red-50' 
                  : 'bg-black text-white hover:scale-105 active:scale-95'
              }`}
            >
              {isMonitoring ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-apple-red animate-pulse"></span>
                  End Meeting
                </>
              ) : (
                'Start Monitoring'
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Split View */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Panel: Topology / Trace Route */}
        <aside className="w-full lg:w-[450px] bg-gray-50/50 border-r border-gray-200 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900">Network Topology</h2>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{nodes.length} Hops Configured</span>
          </div>

          <div className="space-y-0">
             {nodes.map((node, index) => (
               <TopologyNode
                 key={node.id}
                 node={node}
                 history={logs.filter(l => l.nodeId === node.id)}
                 latest={logs.filter(l => l.nodeId === node.id).slice(-1)[0]}
                 isFirst={index === 0}
                 isLast={index === nodes.length - 1}
               />
             ))}
          </div>
        </aside>

        {/* Right Panel: Analytics */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* 1. Quality Assessment Section */}
          <section>
             <h2 className="text-lg font-bold text-gray-900 mb-4">Link Stability Assessment</h2>
             <LiveAnalysisWidget 
               realtimeStats={realtimeStats} 
               sessionStats={sessionStats} 
               isMonitoring={isMonitoring}
             />
          </section>

          {/* 2. Charts Section */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Latency Timeline</h2>
                <p className="text-gray-500 text-xs mt-1">Real-time latency performance across all monitored hops.</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-100 rounded-full">
                    <div className="w-full border-t border-dashed border-red-500 w-4 h-0"></div>
                    <span className="text-[10px] font-medium text-red-600">Threshold (150ms)</span>
                 </div>
              </div>
            </div>
            
            {/* Fixed height container ensures Recharts renders correctly */}
            <div className="w-full h-[400px]">
              {logs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="timeStr" 
                      stroke="#9CA3AF" 
                      fontSize={11} 
                      tickMargin={10}
                      tickFormatter={(val) => val.split(' ')[1] || val}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={11} 
                      unit="ms" 
                      width={45} 
                      domain={[0, (dataMax: number) => Math.max(dataMax, 200)]} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                    />
                    <ReferenceLine 
                        y={150} 
                        stroke="#EF4444" 
                        strokeDasharray="4 4" 
                        strokeWidth={2}
                        label={{ position: 'insideTopRight', value: 'Poor Quality', fill: '#EF4444', fontSize: 11, fontWeight: 600 }} 
                    />
                    
                    {nodes.map((node, index) => {
                       const colors = ['#14B8A6', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];
                       const color = colors[index % colors.length];

                       return (
                        <Line 
                          key={node.id}
                          type="monotone" 
                          dataKey={node.id} 
                          name={node.name}
                          stroke={color} 
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5 }}
                          isAnimationActive={false} // Disable animation for smoother real-time updates
                          connectNulls={true}
                        />
                       )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                  <div className="p-4 bg-white rounded-full mb-3 shadow-sm">
                     <IconSettings className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium">Waiting for session start</p>
                </div>
              )}
            </div>
          </section>

          {/* 3. Incident/Anomaly Log (IT Engineer Feature) */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-apple-orange"></span>
                Recent Anomalies (Event Log)
            </h2>
            <div className="overflow-hidden">
                {anomalies.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-400 font-medium bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="py-2 px-3">Time</th>
                                <th className="py-2 px-3">Node</th>
                                <th className="py-2 px-3">Issue</th>
                                <th className="py-2 px-3">Measured Value</th>
                                <th className="py-2 px-3 text-right">Normal Range</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {anomalies.map((log, idx) => {
                                const node = nodes.find(n => n.id === log.nodeId);
                                const isLoss = log.packetLoss;
                                return (
                                    <tr key={`${log.timestamp}-${idx}`}>
                                        <td className="py-2 px-3 font-mono text-gray-500">{formatBeijingTime(log.timestamp)}</td>
                                        <td className="py-2 px-3 font-medium text-gray-900">{node?.name}</td>
                                        <td className="py-2 px-3">
                                            {isLoss ? 
                                                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold">PACKET LOSS</span> : 
                                                <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold">HIGH LATENCY</span>
                                            }
                                        </td>
                                        <td className="py-2 px-3 font-mono font-bold">
                                            {isLoss ? '100% Loss' : `${log.latency}ms`}
                                        </td>
                                        <td className="py-2 px-3 text-right text-gray-400 font-mono text-xs">
                                            {isLoss ? '0% Loss' : '< 100ms'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-6 text-gray-400 text-sm bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                        No anomalies detected in the last few events. System stable.
                    </div>
                )}
            </div>
          </section>
        </div>
      </main>

      {/* Configuration Modal */}
      {showSettings && (
        <SettingsModal 
          nodes={nodes} 
          onSave={setNodes} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {/* End Session Report Modal */}
      {showSummary && startTime && (
        <SummaryReport 
          nodes={nodes}
          session={{
            id: startTime.toString(),
            startTime,
            endTime: Date.now(),
            records: logs
          }}
          onClose={closeSummary}
        />
      )}
    </div>
  );
};

export default MainLayout;