import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { List, LayoutGrid } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RiskTier, AlertStatus } from '../types';

export const Workflow: React.FC = () => {
  const { alerts, updateAlert, darkMode, showToast } = useApp();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('');

  const filteredAlerts = useMemo(() => {
    if (!selectedAnalyst) return alerts;
    return alerts.filter(a => a.analystId === selectedAnalyst);
  }, [alerts, selectedAnalyst]);

  const columns = useMemo(() => {
    const unassigned = filteredAlerts.filter(a => a.status === 'Open' && !a.analystId);
    const inReview = filteredAlerts.filter(a => a.status === 'In Review');
    const escalated = filteredAlerts.filter(a => a.status === 'Escalated');
    const resolved = filteredAlerts.filter(a => a.status === 'Resolved');

    return { unassigned, inReview, escalated, resolved };
  }, [filteredAlerts]);

  const analystStats = useMemo(() => {
    const analysts = ['analyst1', 'analyst2', 'analyst3', 'analyst4', 'analyst5'];
    return analysts.map(id => {
      const analystAlerts = alerts.filter(a => a.analystId === id);
      const resolved = analystAlerts.filter(a => a.status === 'Resolved' && a.timeToResolution);
      const avgTime = resolved.length > 0
        ? resolved.reduce((sum, a) => sum + (a.timeToResolution || 0), 0) / resolved.length
        : 0;
      const helpful = analystAlerts.filter(a => a.feedbackHelpful === true).length;
      const totalFeedback = analystAlerts.filter(a => a.feedbackHelpful !== null).length;
      const helpfulPercent = totalFeedback > 0 ? (helpful / totalFeedback) * 100 : 0;

      return {
        id,
        total: analystAlerts.length,
        resolved: resolved.length,
        avgTime: (avgTime / 60).toFixed(1),
        helpfulPercent: helpfulPercent.toFixed(0)
      };
    });
  }, [alerts]);

  const getRiskTierColor = (tier: RiskTier) => {
    switch (tier) {
      case 'Critical': return 'border-l-4 border-red-500';
      case 'High': return 'border-l-4 border-orange-500';
      case 'Medium': return 'border-l-4 border-yellow-500';
      case 'Low': return 'border-l-4 border-green-500';
    }
  };

  const handleStatusChange = (alertId: string, newStatus: AlertStatus) => {
    updateAlert(alertId, { status: newStatus });
    showToast(`Alert moved to ${newStatus}`, 'success');
  };

  const AlertCard: React.FC<{ alert: any }> = ({ alert }) => (
    <div
      onClick={() => navigate(`/triage/${alert.id}`)}
      className={`p-3 mb-2 rounded cursor-pointer ${
        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
      } ${getRiskTierColor(alert.riskTier)} shadow-sm`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-semibold">{alert.id}</span>
        <span className="text-xs px-2 py-1 rounded bg-gray-600">{alert.riskTier}</span>
      </div>
      <div className="text-sm mb-1 truncate">{alert.entityName}</div>
      <div className="text-xs text-gray-400 mb-2">
        €{alert.transactionAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
      </div>
      {alert.analystId && (
        <div className="text-xs text-gray-400">{alert.analystId}</div>
      )}
      <div className="text-xs text-gray-500 mt-1">
        {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analyst Workflow</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedAnalyst}
            onChange={(e) => setSelectedAnalyst(e.target.value)}
            className={`px-4 py-2 rounded border ${
              darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
            }`}
          >
            <option value="">All Analysts</option>
            <option value="analyst1">Analyst 1</option>
            <option value="analyst2">Analyst 2</option>
            <option value="analyst3">Analyst 3</option>
            <option value="analyst4">Analyst 4</option>
            <option value="analyst5">Analyst 5</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded ${
                viewMode === 'kanban'
                  ? 'bg-blue-500 text-white'
                  : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {analystStats.map(stat => (
          <div key={stat.id} className={`p-4 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
            <div className="text-sm font-semibold mb-2 capitalize">{stat.id}</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="font-medium">{stat.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resolved:</span>
                <span className="font-medium">{stat.resolved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Time:</span>
                <span className="font-medium">{stat.avgTime}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">AI Helpful:</span>
                <span className="font-medium">{stat.helpfulPercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className={`p-3 mb-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className="font-semibold">Unassigned</h3>
              <span className="text-sm text-gray-400">{columns.unassigned.length} alerts</span>
            </div>
            <div className="space-y-2">
              {columns.unassigned.map(alert => (
                <div key={alert.id}>
                  <AlertCard alert={alert} />
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(alert.id, 'In Review');
                      }}
                      className="flex-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`p-3 mb-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className="font-semibold">In Review</h3>
              <span className="text-sm text-gray-400">{columns.inReview.length} alerts</span>
            </div>
            <div className="space-y-2">
              {columns.inReview.map(alert => (
                <div key={alert.id}>
                  <AlertCard alert={alert} />
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(alert.id, 'Resolved');
                      }}
                      className="flex-1 text-xs py-1 px-2 bg-green-600 hover:bg-green-700 rounded"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(alert.id, 'Escalated');
                      }}
                      className="flex-1 text-xs py-1 px-2 bg-red-600 hover:bg-red-700 rounded"
                    >
                      Escalate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`p-3 mb-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className="font-semibold">Escalated</h3>
              <span className="text-sm text-gray-400">{columns.escalated.length} alerts</span>
            </div>
            <div className="space-y-2">
              {columns.escalated.map(alert => (
                <div key={alert.id}>
                  <AlertCard alert={alert} />
                  <div className="mt-1 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(alert.id, 'In Review');
                      }}
                      className="flex-1 text-xs py-1 px-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className={`p-3 mb-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h3 className="font-semibold">Resolved</h3>
              <span className="text-sm text-gray-400">{columns.resolved.length} alerts</span>
            </div>
            <div className="space-y-2">
              {columns.resolved.slice(0, 10).map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden`}>
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Alert ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Risk Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Analyst</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Time in Queue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredAlerts.map(alert => (
                <tr
                  key={alert.id}
                  onClick={() => navigate(`/triage/${alert.id}`)}
                  className={`cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 text-sm">{alert.id}</td>
                  <td className="px-4 py-3 text-sm">{alert.entityName}</td>
                  <td className="px-4 py-3 text-sm">{alert.riskTier}</td>
                  <td className="px-4 py-3 text-sm">
                    €{alert.transactionAmount.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-3 text-sm">{alert.status}</td>
                  <td className="px-4 py-3 text-sm">{alert.analystId || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {formatDistanceToNow(alert.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
