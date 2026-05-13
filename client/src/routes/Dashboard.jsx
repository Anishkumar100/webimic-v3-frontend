import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Palette, Timer, Plus, Search } from 'lucide-react';
import { useJobsStore } from '../store/useJobsStore';
import JobsTable from '../components/dashboard/JobsTable';
import EmptyState from '../components/dashboard/EmptyState';
import NewJobModal from '../components/dashboard/NewJobModal';
import GlowCard from '../components/effects/GlowCard';

function StatCard({ label, value, change, icon: Icon, index }) {
  return (
    <GlowCard className="group cursor-default">
      <motion.div
        className="p-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.06 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] text-muted font-body">{label}</span>
          {Icon && <Icon className="w-4 h-4 text-faint group-hover:text-primary transition-colors" strokeWidth={1.5} />}
        </div>
        <p className="text-xl font-display font-bold text-text">{value}</p>
        {change != null && (
          <p className={`text-[11px] mt-1 font-medium ${change > 0 ? 'text-teal' : 'text-danger'}`}>
            {change > 0 ? '+' : ''}{change}% vs last month
          </p>
        )}
      </motion.div>
    </GlowCard>
  );
}

export default function Dashboard() {
  const { jobs, filters, setFilters, fetchJobs, loading } = useJobsStore();
  const [searchInput, setSearchInput] = useState('');
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);

  // Fetch jobs on mount
  useEffect(() => { fetchJobs(); }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (filters.status !== 'all') result = result.filter((j) => j.status === filters.status);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((j) => j.name.toLowerCase().includes(q) || j.url.toLowerCase().includes(q));
    }
    return result;
  }, [jobs, filters]);

  const stats = useMemo(() => {
    const completed = jobs.filter((j) => j.status === 'completed');
    const totalTokens = completed.reduce((sum, j) => {
      const t = j.tokens || {};
      return sum + (t.colors || 0) + (t.typography || 0) + (t.spacing || 0) + (t.animations || 0);
    }, 0);
    return { totalJobs: jobs.length, completed: completed.length, totalTokens, avgTime: '12 min' };
  }, [jobs]);

  return (
    <>
      <div className="pt-20 px-5 sm:px-6 lg:px-8 pb-12 max-w-[1100px] mx-auto">
        <motion.div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-xl font-display font-bold text-text">Dashboard</h1>
            <p className="text-[13px] text-muted mt-0.5 font-body">Manage your website analysis jobs.</p>
          </div>
          <motion.button
            className="btn-primary text-[12px] relative overflow-hidden group"
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(124,111,255,0.25)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsNewJobOpen(true)}
          >
            <span className="relative z-10 flex items-center gap-1.5"><Plus className="w-4 h-4" /> New Job</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Jobs" value={stats.totalJobs} icon={BarChart3} change={12} index={0} />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} change={8} index={1} />
          <StatCard label="Tokens" value={stats.totalTokens.toLocaleString()} icon={Palette} change={24} index={2} />
          <StatCard label="Avg. Time" value={stats.avgTime} icon={Timer} index={3} />
        </div>

        <motion.div
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); setFilters({ search: e.target.value }); }}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-[13px] text-text font-body placeholder:text-faint focus:outline-none focus:border-primary/[0.3] transition-all"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['all', 'completed', 'processing', 'queued', 'failed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilters({ status: s })}
                className={`px-3 py-2.5 rounded-lg text-[11px] font-display font-semibold whitespace-nowrap transition-all ${
                  filters.status === s
                    ? 'bg-primary/[0.08] text-primary border border-primary/[0.15]'
                    : 'text-muted border border-transparent hover:text-text hover:bg-white/[0.03]'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {loading && <div className="text-center text-muted py-8 font-body text-sm">Loading jobs...</div>}

        {!loading && filteredJobs.length > 0 ? (
          <JobsTable jobs={filteredJobs} />
        ) : !loading ? (
          <EmptyState
            title="No matching jobs"
            description={filters.search || filters.status !== 'all' ? 'Try adjusting your filters.' : 'Submit your first URL to get started.'}
          />
        ) : null}
      </div>

      <NewJobModal isOpen={isNewJobOpen} onClose={() => setIsNewJobOpen(false)} />
    </>
  );
}
