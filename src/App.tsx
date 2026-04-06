import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { TriagePanel } from './pages/TriagePanel';
import { Workflow } from './pages/Workflow';
import { Performance } from './pages/Performance';
import { Settings } from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/triage/:alertId" element={<TriagePanel />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
