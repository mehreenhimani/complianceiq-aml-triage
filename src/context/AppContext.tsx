import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ComplianceAlert, Settings, ComplianceRule } from '../types';
import { generateMockAlerts, defaultRules } from '../utils/mockData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  alerts: ComplianceAlert[];
  settings: Settings;
  rules: ComplianceRule[];
  darkMode: boolean;
  toasts: Toast[];
  updateAlert: (id: string, updates: Partial<ComplianceAlert>) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  updateRule: (id: string, updates: Partial<ComplianceRule>) => void;
  addRule: (rule: ComplianceRule) => void;
  toggleDarkMode: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: Settings = {
  autoEscalationThreshold: 85,
  requireHumanReviewCritical: true,
  autoDismissLowRisk: false,
  maxAlertsPerAnalyst: 50,
  logAllDecisions: true,
  requireSignOffCritical: true,
  explainabilityRequired: true
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>(() => {
    const stored = localStorage.getItem('complianceAlerts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.map((alert: ComplianceAlert) => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        }));
      } catch {
        return generateMockAlerts();
      }
    }
    return generateMockAlerts();
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const stored = localStorage.getItem('complianceSettings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [rules, setRules] = useState<ComplianceRule[]>(() => {
    const stored = localStorage.getItem('complianceRules');
    return stored ? JSON.parse(stored) : defaultRules;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('darkMode');
    return stored ? JSON.parse(stored) : false;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem('complianceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('complianceSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('complianceRules', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const updateAlert = (id: string, updates: Partial<ComplianceAlert>) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, ...updates } : alert
    ));
  };

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const updateRule = (id: string, updates: Partial<ComplianceRule>) => {
    setRules(prev => prev.map(rule =>
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const addRule = (rule: ComplianceRule) => {
    setRules(prev => [...prev, rule]);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <AppContext.Provider value={{
      alerts,
      settings,
      rules,
      darkMode,
      toasts,
      updateAlert,
      updateSettings,
      updateRule,
      addRule,
      toggleDarkMode,
      showToast,
      removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
