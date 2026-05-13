import { Routes, Route, useLocation } from 'react-router-dom';
import PageShell from './components/layout/PageShell';
import ScrollToTop from './components/common/ScrollToTop';

import Landing from './routes/Landing';
import HowItWorks from './routes/HowItWorks';
import Pricing from './routes/Pricing';
import Docs from './routes/Docs';
import Changelog from './routes/Changelog';
import Dashboard from './routes/Dashboard';
import JobDetail from './routes/JobDetail';
import Settings from './routes/Settings';
import Pipelines from './routes/Pipelines';
import TokenCatalogs from './routes/TokenCatalogs';

export default function App() {
  const location = useLocation();

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

          {/* App routes */}
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/jobs/:jobId" element={<JobDetail />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/app/pipelines" element={<Pipelines />} />
          <Route path="/app/tokens" element={<TokenCatalogs />} />

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
