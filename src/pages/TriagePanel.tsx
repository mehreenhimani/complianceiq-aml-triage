import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { ArrowLeft, CheckCircle, X, AlertTriangle, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RiskTier } from '../types';

export const TriagePanel: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();
  const { alerts, updateAlert, darkMode, showToast } = useApp();

  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);

  const alert = useMemo(() => {
    return alerts.find(a => a.id === alertId);
  }, [alerts, alertId]);

  if (!alert) {
    return (
      <div className="text-center py-12">
        <p className="text-xl">Alert not found</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-blue-500 hover:underline"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const getRiskTierColor = (tier: RiskTier) => {
    switch (tier) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleAction = (action: 'accept' | 'dismiss' | 'escalate') => {
    const updates: any = { notes };

    if (selectedAnalyst) {
      updates.analystId = selectedAnalyst;
    }

    if (action === 'accept') {
      updates.status = 'Resolved';
      updates.timeToResolution = Math.floor(
        (Date.now() - alert.timestamp.getTime()) / 60000
      );
      showToast('Alert accepted and resolved', 'success');
    } else if (action === 'dismiss') {
      updates.status = 'Resolved';
      updates.timeToResolution = Math.floor(
        (Date.now() - alert.timestamp.getTime()) / 60000
      );
      showToast('Alert dismissed', 'info');
    } else if (action === 'escalate') {
      updates.status = 'Escalated';
      showToast('Alert escalated to senior review', 'info');
    }

    updateAlert(alert.id, updates);
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const handleFeedback = (helpful: boolean) => {
    updateAlert(alert.id, { feedbackHelpful: helpful });
    showToast(
      helpful ? 'Thank you for your feedback!' : 'Feedback recorded',
      'success'
    );
  };

  const handleAssign = () => {
    if (!selectedAnalyst) return;
    updateAlert(alert.id, {
      analystId: selectedAnalyst,
      status: alert.status === 'Open' ? 'In Review' : alert.status
    });
    showToast(`Alert assigned to ${selectedAnalyst}`, 'success');
  };

  const timeElapsed = formatDistanceToNow(alert.timestamp, { addSuffix: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{alert.id}</h1>
            <span className={`px-3 py-1 text-sm rounded border ${getRiskTierColor(alert.riskTier)}`}>
              {alert.riskTier}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{alert.entityName}</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{format(alert.timestamp, 'MMM dd, yyyy HH:mm')}</div>
          <div className="text-xs">{timeElapsed}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className="text-lg font-semibold mb-4">Alert Details</h2>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Transaction Amount</div>
              <div className="text-xl font-bold">
                €{alert.transactionAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Country</div>
              <div className="font-medium">{alert.country}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium">{alert.alertCategory}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="font-medium">{alert.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Risk Score</div>
              <div className="font-medium">{alert.riskScore}/100</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Assigned To</div>
              <div className="font-medium">{alert.analystId || 'Unassigned'}</div>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className="text-lg font-semibold mb-4">AI Assessment</h2>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Confidence Score</span>
              <span className="text-lg font-bold">{(alert.aiConfidence * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${alert.aiConfidence * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Extracted Entities</div>
            <div className="flex flex-wrap gap-2">
              {alert.extractedEntities.map((entity, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 text-xs rounded ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{entity.type}:</span> {entity.value}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Transaction Pattern</div>
            <p className="text-sm text-gray-400">{alert.transactionPattern}</p>
          </div>

          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Similar Historical Cases</div>
            <div className="space-y-1">
              {alert.similarCases.map((caseId) => (
                <div
                  key={caseId}
                  className={`px-3 py-2 rounded text-sm ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  } cursor-pointer`}
                >
                  {caseId} <span className="text-gray-500">→ Resolved</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm font-medium">AI Reasoning</span>
              {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showReasoning && (
              <div className={`mt-2 p-3 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-gray-300 mb-2">{alert.aiReasoning}</p>
                <p className="text-xs text-gray-500 italic">
                  This determination was made using a combination of pattern matching algorithms,
                  sanctions database cross-references, and historical case analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h2 className="text-lg font-semibold mb-4">Analyst Actions</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-2">Assign to Analyst</label>
              <div className="flex gap-2">
                <select
                  value={selectedAnalyst}
                  onChange={(e) => setSelectedAnalyst(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Select analyst...</option>
                  <option value="analyst1">Analyst 1</option>
                  <option value="analyst2">Analyst 2</option>
                  <option value="analyst3">Analyst 3</option>
                  <option value="analyst4">Analyst 4</option>
                  <option value="analyst5">Analyst 5</option>
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!selectedAnalyst}
                  className={`px-4 py-2 rounded ${
                    selectedAnalyst
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-600 cursor-not-allowed text-gray-400'
                  }`}
                >
                  Assign
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAction('accept')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Accept & Resolve
              </button>
              <button
                onClick={() => handleAction('dismiss')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded font-medium"
              >
                <X className="w-5 h-5" />
                Dismiss
              </button>
              <button
                onClick={() => handleAction('escalate')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
              >
                <AlertTriangle className="w-5 h-5" />
                Escalate
              </button>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add case notes..."
                rows={4}
                className={`w-full px-3 py-2 rounded border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                }`}
              />
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Was this AI assessment helpful?</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeedback(true)}
                  disabled={alert.feedbackHelpful !== null}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded ${
                    alert.feedbackHelpful === true
                      ? 'bg-green-600 text-white'
                      : alert.feedbackHelpful === null
                      ? darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  disabled={alert.feedbackHelpful !== null}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded ${
                    alert.feedbackHelpful === false
                      ? 'bg-red-600 text-white'
                      : alert.feedbackHelpful === null
                      ? darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </button>
              </div>
            </div>

            <div className={`mt-4 p-3 rounded text-sm ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Elapsed</span>
                <span className="font-medium">{timeElapsed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
