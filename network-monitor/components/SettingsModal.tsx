import React, { useState } from 'react';
import { NetworkNode, NodeCategory } from '../types';

interface SettingsModalProps {
  nodes: NetworkNode[];
  onSave: (nodes: NetworkNode[]) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ nodes, onSave, onClose }) => {
  const [localNodes, setLocalNodes] = useState<NetworkNode[]>([...nodes]);

  const handleChange = (id: string, field: keyof NetworkNode, value: string) => {
    setLocalNodes(prev => prev.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const handleDelete = (id: string) => {
    setLocalNodes(prev => prev.filter(n => n.id !== id));
  };

  const handleAdd = () => {
    const newId = (Math.max(0, ...localNodes.map(n => parseInt(n.id) || 0)) + 1).toString();
    setLocalNodes(prev => [...prev, { id: newId, name: 'New Node', ip: '0.0.0.0', category: 'WAN' }]);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Network Configuration</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">IP Address</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {localNodes.map(node => (
                <tr key={node.id}>
                  <td className="py-3 pr-2">
                    <input 
                      type="text" 
                      value={node.name}
                      onChange={(e) => handleChange(node.id, 'name', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text" 
                      value={node.ip}
                      onChange={(e) => handleChange(node.id, 'ip', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <select 
                      value={node.category}
                      onChange={(e) => handleChange(node.id, 'category', e.target.value as NodeCategory)}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Local">Local</option>
                      <option value="Gateway">Gateway</option>
                      <option value="WAN">WAN</option>
                      <option value="Service">Service</option>
                    </select>
                  </td>
                  <td className="py-3 pl-2 text-right">
                    <button 
                      onClick={() => handleDelete(node.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            onClick={handleAdd}
            className="mt-4 w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            + Add Hop
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button 
            onClick={() => { onSave(localNodes); onClose(); }}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;