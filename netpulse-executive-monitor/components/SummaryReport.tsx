import React from 'react';
import { AggregatedStats, NetworkNode, SessionData } from '../types';
import { calculateStats, formatBeijingTime, exportToCSV } from '../utils';

interface SummaryReportProps {
  session: SessionData;
  nodes: NetworkNode[];
  onClose: () => void;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ session, nodes, onClose }) => {
  const globalStats = calculateStats(session.records);
  const durationMinutes = ((session.endTime || Date.now()) - session.startTime) / 1000 / 60;

  // Calculate per-node stats
  const nodeStats = nodes.map(node => {
    const nodeRecords = session.records.filter(r => r.nodeId === node.id);
    return {
      node,
      stats: calculateStats(nodeRecords)
    };
  });

  const getGradeColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'text-apple-green';
      case 'Good': return 'text-apple-blue';
      case 'Fair': return 'text-apple-orange';
      case 'Poor': return 'text-apple-red';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Network Report</h2>
            <p className="text-gray-500 mt-1">
              {formatBeijingTime(session.startTime, false)} - {session.endTime ? formatBeijingTime(session.endTime, false) : 'Now'} 
              <span className="mx-2">•</span> 
              {durationMinutes.toFixed(1)} Minutes Duration
            </p>
          </div>
          <div className="text-right">
             <div className="text-sm font-medium text-gray-400 uppercase tracking-wider">Overall Grade</div>
             <div className={`text-5xl font-bold ${getGradeColor(globalStats.status)} tracking-tighter`}>
               {globalStats.status}
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto bg-white flex-1">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-gray-500 text-sm font-medium mb-1">Avg Latency</div>
              <div className="text-3xl font-bold text-gray-900">{globalStats.avgLatency}<span className="text-lg text-gray-400 ml-1">ms</span></div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-gray-500 text-sm font-medium mb-1">Packet Loss</div>
              <div className="text-3xl font-bold text-gray-900">{globalStats.packetLossRate}<span className="text-lg text-gray-400 ml-1">%</span></div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-gray-500 text-sm font-medium mb-1">Stability Score</div>
              <div className="text-3xl font-bold text-gray-900">{globalStats.score}<span className="text-lg text-gray-400 ml-1">/100</span></div>
            </div>
          </div>

          {/* Node Breakdown */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Node Performance Breakdown</h3>
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-medium">Node Name</th>
                  <th className="p-4 font-medium">IP Address</th>
                  <th className="p-4 font-medium">Avg Latency</th>
                  <th className="p-4 font-medium">Max Latency</th>
                  <th className="p-4 font-medium">Packet Loss</th>
                  <th className="p-4 font-medium text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nodeStats.map((item) => (
                  <tr key={item.node.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{item.node.name}</td>
                    <td className="p-4 font-mono text-gray-500 text-sm">{item.node.ip}</td>
                    <td className="p-4 text-gray-700">{item.stats.avgLatency} ms</td>
                    <td className="p-4 text-gray-700">{item.stats.maxLatency} ms</td>
                    <td className="p-4 text-gray-700">{item.stats.packetLossRate}%</td>
                    <td className="p-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        item.stats.status === 'Excellent' ? 'bg-green-50 text-green-700 border-green-200' :
                        item.stats.status === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        item.stats.status === 'Fair' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {item.stats.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
           <button 
            onClick={() => exportToCSV(session.records, nodes)}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Download CSV
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-transform active:scale-95 shadow-md"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryReport;