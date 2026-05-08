import { motion } from 'framer-motion';
import { GitBranch, Activity, Server, Cpu, Database, ChevronRight } from 'lucide-react';
import GlowCard from '../components/effects/GlowCard';

const workers = [
  { id: 'w-01', region: 'us-east-1', status: 'active', load: 85, task: 'Analyzing stripe.com' },
  { id: 'w-02', region: 'us-east-1', status: 'active', load: 62, task: 'Extracting tokens from linear.app' },
  { id: 'w-03', region: 'eu-west-1', status: 'idle', load: 5, task: 'Waiting for jobs' },
  { id: 'w-04', region: 'ap-south-1', status: 'active', load: 94, task: 'Processing LLM generation' },
];

function WorkerCard({ worker, index }) {
  const isIdle = worker.status === 'idle';
  return (
    <GlowCard className="p-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isIdle ? 'bg-faint' : 'bg-primary animate-pulse'}`} />
            <span className="text-[13px] font-display font-bold text-text uppercase tracking-wider">{worker.id}</span>
          </div>
          <span className="text-[11px] font-mono text-muted">{worker.region}</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-faint">CPU Load</span>
              <span className={worker.load > 90 ? 'text-danger' : 'text-teal'}>{worker.load}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${worker.load > 90 ? 'bg-danger' : 'bg-teal'}`}
                initial={{ width: 0 }}
                animate={{ width: `${worker.load}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
          <div>
            <span className="text-[11px] text-faint block mb-0.5">Current Task</span>
            <span className={`text-[12px] truncate block ${isIdle ? 'text-muted' : 'text-primary'}`}>{worker.task}</span>
          </div>
        </div>
      </motion.div>
    </GlowCard>
  );
}

export default function Pipelines() {
  return (
    <div className="pt-20 px-5 sm:px-6 lg:px-8 pb-12 max-w-[1100px] mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold text-text">Pipeline Infrastructure</h1>
        </div>
        <p className="text-[13px] text-muted font-body">Monitor global worker nodes and extraction queues in real-time.</p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <GlowCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-display uppercase tracking-wider mb-0.5">Global Queue</p>
            <p className="text-2xl font-black text-text font-display">12</p>
          </div>
        </GlowCard>
        <GlowCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-teal" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-display uppercase tracking-wider mb-0.5">Active Nodes</p>
            <p className="text-2xl font-black text-text font-display">24</p>
          </div>
        </GlowCard>
        <GlowCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-display uppercase tracking-wider mb-0.5">Tokens Extracted Today</p>
            <p className="text-2xl font-black text-text font-display">48.2k</p>
          </div>
        </GlowCard>
      </div>

      <h2 className="text-[14px] font-display font-bold text-text mb-4 uppercase tracking-wider">Worker Cluster Status</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {workers.map((w, i) => (
          <WorkerCard key={w.id} worker={w} index={i} />
        ))}
      </div>
      
      {/* Mock terminal log */}
      <motion.div 
        className="mt-8 rounded-xl border border-white/[0.06] bg-[#000005] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.02]">
          <Cpu className="w-4 h-4 text-faint" />
          <span className="text-[11px] font-mono text-muted uppercase">System Logs</span>
        </div>
        <div className="p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1">
          <div className="text-faint">[14:32:01] <span className="text-info">INFO</span> System boot complete. All regions online.</div>
          <div className="text-faint">[14:32:05] <span className="text-teal">SUCCESS</span> w-01 extracted 402 tokens from stripe.com.</div>
          <div className="text-faint">[14:32:12] <span className="text-primary">PROCESSING</span> w-04 generating LLM prompts for Job #892...</div>
          <div className="text-faint">[14:32:18] <span className="text-danger">WARN</span> Rate limit approached on target linear.app. Backing off 2s.</div>
          <div className="text-faint">[14:32:20] <span className="text-teal">SUCCESS</span> w-04 completed LLM generation. Writing Doc B.</div>
        </div>
      </motion.div>
    </div>
  );
}
