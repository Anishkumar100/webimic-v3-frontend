import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import PageShell from './components/layout/PageShell';
import ScrollToTop from './components/common/ScrollToTop';
import { useAuthStore } from './store/useAuthStore';

import Landing from './routes/Landing';
import HowItWorks from './routes/HowItWorks';
import Pricing from './routes/Pricing';
import Docs from './routes/Docs';
import Changelog from './routes/Changelog';
import Auth from './routes/Auth';
import Dashboard from './routes/Dashboard';
import JobDetail from './routes/JobDetail';
import Settings from './routes/Settings';
import Pipelines from './routes/Pipelines';
import TokenCatalogs from './routes/TokenCatalogs';

function ProtectedRoute({ children }) {
  const { user, authReady } = useAuthStore();
  if (!authReady) return <div className="pt-24 text-center text-muted">Checking session...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const location = useLocation();
  const bootstrapAuth = useAuthStore((s) => s.bootstrapAuth);
  const authReady = useAuthStore((s) => s.authReady);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    bootstrapAuth();
  }, [bootstrapAuth]);

  return (
    <>
      <ScrollToTop />
      <PageShell>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/auth" element={!authReady ? <div className="pt-24 text-center text-muted">Loading...</div> : user ? <Navigate to="/app" replace /> : <Auth />} />

          {/* App routes */}
          <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/app/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} />
          <Route path="/app/tokens" element={<ProtectedRoute><TokenCatalogs /></ProtectedRoute>} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-display font-black text-gradient mb-4">404</h1>
                  <p className="text-muted text-lg mb-8">Page not found.</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </div>
            }
          />
        </Routes>
      </PageShell>
    </>
  );
}
