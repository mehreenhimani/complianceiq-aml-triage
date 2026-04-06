import React, { useState } from 'react';
import { Save, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { settings, rules, updateSettings, updateRule, addRule, darkMode, showToast } = useApp();

  const [localSettings, setLocalSettings] = useState(settings);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', condition: '', action: '' });

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    showToast('Settings saved successfully', 'success');
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.condition || !newRule.action) {
      showToast('Please fill in all rule fields', 'error');
      return;
    }

    addRule({
      id: `rule-${Date.now()}`,
      name: newRule.name,
      condition: newRule.condition,
      action: newRule.action,
      active: true
    });

    setNewRule({ name: '', condition: '', action: '' });
    setShowAddRule(false);
    showToast('Rule added successfully', 'success');
  };

  const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer">
      <span>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : darkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings & Guardrails</h1>

      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h2 className="text-xl font-semibold mb-6">Risk Thresholds</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Auto-Escalation Threshold (Risk Score)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="70"
                max="100"
                value={localSettings.autoEscalationThreshold}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  autoEscalationThreshold: parseInt(e.target.value)
                })}
                className="flex-1"
              />
              <span className="text-xl font-bold w-12">{localSettings.autoEscalationThreshold}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Alerts scoring above this threshold will be automatically escalated
            </p>
          </div>

          <ToggleSwitch
            checked={localSettings.requireHumanReviewCritical}
            onChange={(checked) => setLocalSettings({
              ...localSettings,
              requireHumanReviewCritical: checked
            })}
            label="Require human review for all Critical alerts"
          />

          <ToggleSwitch
            checked={localSettings.autoDismissLowRisk}
            onChange={(checked) => setLocalSettings({
              ...localSettings,
              autoDismissLowRisk: checked
            })}
            label="Auto-dismiss Low risk alerts below confidence 0.70"
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Max alerts per analyst per day
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={localSettings.maxAlertsPerAnalyst}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                maxAlertsPerAnalyst: parseInt(e.target.value)
              })}
              className={`w-32 px-3 py-2 rounded border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Compliance Rules Engine</h2>
          <button
            onClick={() => setShowAddRule(!showAddRule)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        {showAddRule && (
          <div className={`p-4 mb-4 rounded border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., High Value Transfer"
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Trigger Condition</label>
                <input
                  type="text"
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  placeholder="e.g., Amount >€1,000,000"
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <input
                  type="text"
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  placeholder="e.g., Flag for review"
                  className={`w-full px-3 py-2 rounded border ${
                    darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
              >
                Save Rule
              </button>
              <button
                onClick={() => {
                  setShowAddRule(false);
                  setNewRule({ name: '', condition: '', action: '' });
                }}
                className={`px-4 py-2 rounded ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Rule Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Trigger Condition</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td className="px-4 py-3 text-sm font-medium">{rule.name}</td>
                  <td className="px-4 py-3 text-sm">{rule.condition}</td>
                  <td className="px-4 py-3 text-sm">{rule.action}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateRule(rule.id, { active: !rule.active })}
                      className={`px-3 py-1 text-xs rounded ${
                        rule.active
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {rule.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h2 className="text-xl font-semibold mb-6">Human-in-the-Loop Requirements</h2>

        <div className="space-y-4">
          <div className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="font-medium mb-3">EU AI Act Compliance Checklist</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span>Transparency in AI decision-making processes</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span>Human oversight for high-risk decisions</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span>Audit trail for all AI-assisted decisions</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span>Right to explanation for automated decisions</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked readOnly className="rounded" />
                <span>Data protection and privacy safeguards</span>
              </div>
            </div>
          </div>

          <ToggleSwitch
            checked={localSettings.logAllDecisions}
            onChange={(checked) => setLocalSettings({
              ...localSettings,
              logAllDecisions: checked
            })}
            label="Log all AI decisions for audit trail"
          />

          <ToggleSwitch
            checked={localSettings.requireSignOffCritical}
            onChange={(checked) => setLocalSettings({
              ...localSettings,
              requireSignOffCritical: checked
            })}
            label="Require human sign-off before case closure for Critical alerts"
          />

          <ToggleSwitch
            checked={localSettings.explainabilityRequired}
            onChange={(checked) => setLocalSettings({
              ...localSettings,
              explainabilityRequired: checked
            })}
            label="Model explainability report required for escalations"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
        >
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};
