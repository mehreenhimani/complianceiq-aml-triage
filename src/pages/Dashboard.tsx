import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RiskTier, AlertStatus } from '../types';

type SortField = 'id' | 'timestamp' | 'entityName' | 'transactionAmount' | 'riskScore' | 'aiConfidence';
type SortDirection = 'asc' | 'desc';

export const Dashboard: React.FC = () => {
  const { alerts, darkMode } = useApp();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTiers, setSelectedTiers] = useState<RiskTier[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AlertStatus[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const itemsPerPage = 20;

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(alerts.map(a => a.alertCategory)));
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts];

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTypes.length > 0) {
      filtered = filtered.filter(a => selectedTypes.includes(a.alertCategory));
    }

    if (selectedTiers.length > 0) {
      filtered = filtered.filter(a => selectedTiers.includes(a.riskTier));
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(a => selectedStatuses.includes(a.status));
    }

    if (dateRange.start) {
      filtered = filtered.filter(a => a.timestamp >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(a => a.timestamp <= endDate);
    }

    filtered.sort((a, b) => {
      let aVal: string | number | Date = a[sortField];
      let bVal: string | number | Date = b[sortField];

      if (sortField === 'timestamp') {
        aVal = (a.timestamp as Date).getTime();
        bVal = (b.timestamp as Date).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [alerts, searchTerm, selectedTypes, selectedTiers, selectedStatuses, dateRange, sortField, sortDirection]);

  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAlerts.slice(start, start + itemsPerPage);
  }, [filteredAlerts, currentPage]);

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  const kpis = useMemo(() => {
    const openAlerts = alerts.filter(a => a.status === 'Open').length;
    const criticalAlerts = alerts.filter(a => a.riskTier === 'Critical').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'Resolved' && a.timeToResolution);
    const avgResolution = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, a) => sum + (a.timeToResolution || 0), 0) / resolvedAlerts.length
      : 0;

    return {
      total: alerts.length,
      open: openAlerts,
      critical: criticalAlerts,
      avgResolution: (avgResolution / 60).toFixed(1)
    };
  }, [alerts]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const getRiskTierColor = (tier: RiskTier) => {
    switch (tier) {
      case 'Critical': return 'bg-red-500 text-white font-semibold';
      case 'High': return 'bg-orange-500 text-white font-semibold';
      case 'Medium': return 'bg-yellow-500 text-gray-900 font-semibold';
      case 'Low': return 'bg-green-500 text-white font-semibold';
    }
  };

  const toggleFilter = <T,>(array: T[], item: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-2">Alert Dashboard</h1>
      <div className="grid grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 shadow-xl border border-slate-600">
          <div className="text-sm text-slate-400 font-medium">Total Alerts</div>
          <div className="text-4xl font-bold mt-3 text-white">{kpis.total}</div>
          <div className="mt-2 text-xs text-slate-400">All compliance alerts</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-xl shadow-blue-500/20">
          <div className="text-sm text-blue-100 font-medium">Open Alerts</div>
          <div className="text-4xl font-bold mt-3 text-white">{kpis.open}</div>
          <div className="mt-2 text-xs text-blue-100">Pending review</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-red-600 to-red-500 shadow-xl shadow-red-500/20">
          <div className="text-sm text-red-100 font-medium">Critical Alerts</div>
          <div className="text-4xl font-bold mt-3 text-white">{kpis.critical}</div>
          <div className="mt-2 text-xs text-red-100">High priority</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-xl shadow-emerald-500/20">
          <div className="text-sm text-emerald-100 font-medium">Avg Resolution Time</div>
          <div className="text-4xl font-bold mt-3 text-white">{kpis.avgResolution}h</div>
          <div className="mt-2 text-xs text-emerald-100">Time to close</div>
        </div>
      </div>

      <div className="p-6 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by entity name or alert ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-sm font-medium block mb-2">Alert Type</label>
              <div className="flex flex-wrap gap-2">
                {uniqueTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter(selectedTypes, type, setSelectedTypes)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      selectedTypes.includes(type)
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Risk Tier</label>
              <div className="flex gap-2">
                {(['Critical', 'High', 'Medium', 'Low'] as RiskTier[]).map(tier => (
                  <button
                    key={tier}
                    onClick={() => toggleFilter(selectedTiers, tier, setSelectedTiers)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      selectedTiers.includes(tier)
                        ? getRiskTierColor(tier)
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Status</label>
              <div className="flex gap-2">
                {(['Open', 'In Review', 'Resolved', 'Escalated'] as AlertStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => toggleFilter(selectedStatuses, status, setSelectedStatuses)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      selectedStatuses.includes(status)
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-800 shadow-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75"
                >
                  <div className="flex items-center gap-1">Alert ID <SortIcon field="id" /></div>
                </th>
                <th
                  onClick={() => handleSort('timestamp')}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75"
                >
                  <div className="flex items-center gap-1">Timestamp <SortIcon field="timestamp" /></div>
                </th>
                <th
                  onClick={() => handleSort('entityName')}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75"
                >
                  <div className="flex items-center gap-1">Entity <SortIcon field="entityName" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                <th
                  onClick={() => handleSort('transactionAmount')}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75"
                >
                  <div className="flex items-center gap-1">Amount <SortIcon field="transactionAmount" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Country</th>
                <th
                  onClick={() => handleSort('riskScore')}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75"
                >
                  <div className="flex items-center gap-1">Risk Tier <SortIcon field="riskScore" /></div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th
                  onClick={() => handleSort('aiConfidence')}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-opacity-75"
                >
                  <div className="flex items-center gap-1">AI Confidence <SortIcon field="aiConfidence" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {paginatedAlerts.map(alert => (
                <tr
                  key={alert.id}
                  onClick={() => navigate(`/triage/${alert.id}`)}
                  className="cursor-pointer hover:bg-slate-700/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium">{alert.id}</td>
                  <td className="px-4 py-3 text-sm">{format(alert.timestamp, 'MMM dd, HH:mm')}</td>
                  <td className="px-4 py-3 text-sm">{alert.entityName}</td>
                  <td className="px-4 py-3 text-sm">{alert.alertCategory}</td>
                  <td className="px-4 py-3 text-sm">€{alert.transactionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm">{alert.country}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${getRiskTierColor(alert.riskTier)}`}>
                      {alert.riskTier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{alert.status}</td>
                  <td className="px-4 py-3 text-sm">{(alert.aiConfidence * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-700 bg-slate-700/30">
          <div className="text-sm text-slate-300">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAlerts.length)} of {filteredAlerts.length} alerts
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === 1
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-300">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg transition-all ${
                currentPage === totalPages
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
