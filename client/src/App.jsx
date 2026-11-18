import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import PlanPage from './pages/PlanPage';
import FactsPage from './pages/FactsPage';
import TracePage from './pages/TracePage';
import RejectedPage from './pages/RejectedPage';
import HistoryPage from './pages/HistoryPage';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessionId, setSessionId] = useState('session_001');
  const [plan, setPlan] = useState(null);
  const [tokenSummary, setTokenSummary] = useState(null);
  const [counts, setCounts] = useState({
    factsCount: 0,
    traceCount: 0,
    rejectedCount: 0,
    planVersion: 1,
  });

  const refreshSessionData = (sid = sessionId) => {
    if (!sid) return;
    // Get plan
    api.getPlan(sid).then((res) => {
      if (res.success && res.plan) {
        setPlan(res.plan);
        setCounts((prev) => ({ ...prev, planVersion: res.plan.version }));
      }
    });

    // Get stats
    api.getSession(sid).then((res) => {
      if (res.success && res.stats) {
        setCounts((prev) => ({
          ...prev,
          factsCount: res.stats.factsCount,
          rejectedCount: res.stats.rejectedCount,
        }));
      }
    });

    // Get trace count and tokens
    api.getTrace(sid).then((res) => {
      if (res.success) {
        setCounts((prev) => ({ ...prev, traceCount: res.traces?.length || 0 }));
        if (res.tokenSummary) setTokenSummary(res.tokenSummary);
      }
    });
  };

  useEffect(() => {
    refreshSessionData();
  }, [sessionId]);

  const handleProcessComplete = (data) => {
    if (data.sessionId) setSessionId(data.sessionId);
    if (data.plan) setPlan(data.plan);
    if (data.tokenSummary) setTokenSummary(data.tokenSummary);
    refreshSessionData(data.sessionId || sessionId);
  };

  const handleExport = async () => {
    try {
      const res = await api.exportPlanAndTrace(sessionId);
      if (res.success) {
        alert(`Export completed!\nPlan saved to: ${res.planPath}\nTrace saved to: ${res.tracePath}`);
      }
    } catch (err) {
      alert(`Export error: ${err.message}`);
    }
  };

  const handleReset = () => {
    setActiveTab('upload');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar
        sessionId={sessionId}
        onExport={handleExport}
        onReset={handleReset}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard
                plan={plan}
                sessionData={counts}
                tokenSummary={tokenSummary}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'upload' && (
              <UploadPage
                onProcessComplete={handleProcessComplete}
                onNavigate={setActiveTab}
              />
            )}
            {activeTab === 'plan' && <PlanPage plan={plan} />}
            {activeTab === 'facts' && <FactsPage sessionId={sessionId} />}
            {activeTab === 'trace' && <TracePage sessionId={sessionId} />}
            {activeTab === 'rejected' && <RejectedPage sessionId={sessionId} />}
            {activeTab === 'history' && (
              <HistoryPage
                sessionId={sessionId}
                currentPlan={plan}
                onPlanUpdated={(newPlan) => {
                  setPlan(newPlan);
                  refreshSessionData();
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
