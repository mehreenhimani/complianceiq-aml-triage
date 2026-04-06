import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

type TimeRange = '30days' | '90days' | '12months';

export const Performance: React.FC = () => {
  const { alerts, darkMode } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('90days');

  const falsePositiveData = useMemo(() => {
    return [
      { week: 'Week 1', rate: 45 },
      { week: 'Week 2', rate: 43 },
      { week: 'Week 3', rate: 41 },
      { week: 'Week 4', rate: 38 },
      { week: 'Week 5', rate: 36 },
      { week: 'Week 6', rate: 34 },
      { week: 'Week 7', rate: 32 },
      { week: 'Week 8', rate: 29 },
      { week: 'Week 9', rate: 27 },
      { week: 'Week 10', rate: 25 },
      { week: 'Week 11', rate: 23 },
      { week: 'Week 12', rate: 22 }
    ];
  }, []);

  const alertVolumeByCategory = useMemo(() => {
    const categories = ['Suspicious Transaction', 'KYC Flag', 'Sanctions Hit', 'Unusual Account Activity', 'PEP Match', 'Structuring Pattern'];
    return categories.map(cat => ({
      category: cat.split(' ')[0],
      count: alerts.filter(a => a.alertCategory === cat).length
    }));
  }, [alerts]);

  const resolutionTimeData = useMemo(() => {
    return [
      { week: 'Week 1', time: 6.8 },
      { week: 'Week 2', time: 6.5 },
      { week: 'Week 3', time: 6.2 },
      { week: 'Week 4', time: 5.9 },
      { week: 'Week 5', time: 5.6 },
      { week: 'Week 6', time: 5.3 },
      { week: 'Week 7', time: 5.0 },
      { week: 'Week 8', time: 4.8 },
      { week: 'Week 9', time: 4.6 },
      { week: 'Week 10', time: 4.5 },
      { week: 'Week 11', time: 4.3 },
      { week: 'Week 12', time: 4.2 }
    ];
  }, []);

  const analystThroughput = useMemo(() => {
    const analysts = ['analyst1', 'analyst2', 'analyst3', 'analyst4', 'analyst5'];
    return analysts.map(id => ({
      analyst: id.replace('analyst', 'Analyst '),
      resolved: alerts.filter(a => a.analystId === id && a.status === 'Resolved').length
    }));
  }, [alerts]);

  const riskTierDistribution = useMemo(() => {
    const tiers = ['Critical', 'High', 'Medium', 'Low'];
    return tiers.map(tier => ({
      name: tier,
      value: alerts.filter(a => a.riskTier === tier).length
    }));
  }, [alerts]);

  const aiConfidenceData = useMemo(() => {
    return [
      { week: 'Week 1', confidence: 72 },
      { week: 'Week 2', confidence: 74 },
      { week: 'Week 3', confidence: 76 },
      { week: 'Week 4', confidence: 78 },
      { week: 'Week 5', confidence: 80 },
      { week: 'Week 6', confidence: 82 },
      { week: 'Week 7', confidence: 84 },
      { week: 'Week 8', confidence: 85 },
      { week: 'Week 9', confidence: 87 },
      { week: 'Week 10', confidence: 88 },
      { week: 'Week 11', confidence: 90 },
      { week: 'Week 12', confidence: 91 }
    ];
  }, []);

  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];

  const chartColors = {
    line: '#3B82F6',
    bar: '#8B5CF6',
    grid: '#475569',
    text: '#94A3B8'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
          <p className="text-slate-300 text-sm font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
              {entry.unit || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === '30days'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90days')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === '90days'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            Last 90 Days
          </button>
          <button
            onClick={() => setTimeRange('12months')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === '12months'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            Last 12 Months
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-xl shadow-emerald-500/20">
          <div className="text-sm text-emerald-100 font-medium">False Positive Rate</div>
          <div className="flex items-end gap-2 mt-3">
            <div className="text-4xl font-bold text-white">22%</div>
            <div className="flex items-center text-emerald-100 text-sm mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="ml-1">from 45%</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-100">51% improvement</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-xl shadow-blue-500/20">
          <div className="text-sm text-blue-100 font-medium">Avg Resolution Time</div>
          <div className="text-4xl font-bold text-white mt-3">4.2 hrs</div>
          <div className="mt-2 text-xs text-blue-100">Per alert average</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 shadow-xl shadow-purple-500/20">
          <div className="text-sm text-purple-100 font-medium">Analyst Hours Saved</div>
          <div className="text-4xl font-bold text-white mt-3">2,100</div>
          <div className="mt-2 text-xs text-purple-100">This quarter</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 shadow-xl shadow-amber-500/20">
          <div className="text-sm text-amber-100 font-medium">Model Accuracy</div>
          <div className="flex items-end gap-2 mt-3">
            <div className="text-4xl font-bold text-white">91.3%</div>
            <div className="flex items-center text-amber-100 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xs text-amber-100">Trending upward</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">False Positive Rate Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={falsePositiveData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="week"
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
              />
              <YAxis
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
                label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft', fill: chartColors.text }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="line"
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#EF4444"
                strokeWidth={3}
                name="False Positive Rate (%)"
                dot={{ fill: '#EF4444', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Alert Volume by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={alertVolumeByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="category"
                stroke={chartColors.text}
                style={{ fontSize: '11px' }}
                tick={{ fill: chartColors.text }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
                label={{ value: 'Alert Count', angle: -90, position: 'insideLeft', fill: chartColors.text }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="count" fill="#8B5CF6" name="Total Alerts" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Average Resolution Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={resolutionTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="week"
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
              />
              <YAxis
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: chartColors.text }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="time"
                stroke="#10B981"
                strokeWidth={3}
                name="Avg Resolution Time (hrs)"
                dot={{ fill: '#10B981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Analyst Throughput</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analystThroughput}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="analyst"
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
              />
              <YAxis
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
                label={{ value: 'Alerts Resolved', angle: -90, position: 'insideLeft', fill: chartColors.text }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="resolved" fill="#3B82F6" name="Resolved Alerts" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">Alert Distribution by Risk Tier</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskTierDistribution}
                cx="50%"
                cy="50%"
                labelLine
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {riskTierDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-xl bg-slate-800 shadow-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-white">AI Model Confidence Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={aiConfidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                dataKey="week"
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
              />
              <YAxis
                stroke={chartColors.text}
                style={{ fontSize: '12px' }}
                tick={{ fill: chartColors.text }}
                domain={[70, 95]}
                label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft', fill: chartColors.text }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#F59E0B"
                strokeWidth={3}
                name="AI Confidence Score (%)"
                dot={{ fill: '#F59E0B', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
