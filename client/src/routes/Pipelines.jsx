import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Activity, Server, Cpu, Database, ChevronRight } from 'lucide-react';
import GlowCard from '../components/effects/GlowCard';
import { api } from '../lib/api.js';

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
            <span className={`text-[12px] truncate block ${isIdle ? 'text-muted' : 'text-primary'}`}>{worker.currentTask || worker.task}</span>
          </div>
        </div>
      </motion.div>
    </GlowCard>
  );
}

export default function Pipelines() {
  const [workerStatus, setWorkerStatus] = useState({
    workers: [
      { id: 'w-01', region: 'local', status: 'idle', load: 5, currentTask: 'Waiting for jobs' },
      { id: 'w-02', region: 'local', status: 'idle', load: 3, currentTask: 'Waiting for jobs' },
    ],
    queueDepth: 0,
    activeWorkers: 0,
    tokensExtractedToday: 0,
  });
  const [logs, setLogs] = useState([
    { timestamp: new Date().toISOString(), level: 'INFO', message: 'System initialized. Waiting for connections...' },
  ]);

  useEffect(() => {
    // Initial HTTP fetch for current status
    api.get('/v1/workers/status').then((data) => {
      setWorkerStatus(data);
    }).catch(() => {});

    // WebSocket for live updates
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'WORKER_UPDATE') {
          setWorkerStatus((prev) => ({
            ...prev,
            workers: prev.workers.map((w) => w.id === data.workerId ? { ...w, ...data } : w),
          }));
        }
        if (data.type === 'LOG') {
          setLogs((prev) => [data, ...prev].slice(0, 50));
        }
        if (data.type === 'JOB_STATUS_UPDATE') {
          setLogs((prev) => [{
            timestamp: new Date().toISOString(),
            level: data.status === 'completed' ? 'SUCCESS' : data.status === 'failed' ? 'ERROR' : 'INFO',
            message: `Job ${data.jobId} → ${data.status} (${data.progress || 0}%)`,
          }, ...prev].slice(0, 50));
        }
      };
      ws.onopen = () => {
        setLogs((prev) => [{ timestamp: new Date().toISOString(), level: 'SUCCESS', message: 'WebSocket connected to pipeline.' }, ...prev]);
      };
    } catch (e) { /* WS not available */ }
    return () => ws?.close();
  }, []);

  const levelColor = { INFO: 'text-info', SUCCESS: 'text-teal', WARN: 'text-danger', ERROR: 'text-danger', PROCESSING: 'text-primary' };

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
            <p className="text-2xl font-black text-text font-display">{workerStatus.queueDepth}</p>
          </div>
        </GlowCard>
        <GlowCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
            <Server className="w-5 h-5 text-teal" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-display uppercase tracking-wider mb-0.5">Active Nodes</p>
            <p className="text-2xl font-black text-text font-display">{workerStatus.activeWorkers}</p>
          </div>
        </GlowCard>
        <GlowCard className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-info/10 border border-info/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="text-[11px] text-muted font-display uppercase tracking-wider mb-0.5">Tokens Extracted Today</p>
            <p className="text-2xl font-black text-text font-display">{workerStatus.tokensExtractedToday?.toLocaleString() || '0'}</p>
          </div>
        </GlowCard>
      </div>

      <h2 className="text-[14px] font-display font-bold text-text mb-4 uppercase tracking-wider">Worker Cluster Status</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {workerStatus.workers.map((w, i) => (
          <WorkerCard key={w.id} worker={w} index={i} />
        ))}
      </div>
      
      {/* Live terminal log */}
      <motion.div 
        className="mt-8 rounded-xl border border-white/[0.06] bg-[#000005] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="px-4 py-2 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.02]">
          <Cpu className="w-4 h-4 text-faint" />
          <span className="text-[11px] font-mono text-muted uppercase">System Logs</span>
          <span className="ml-auto text-[10px] text-faint font-mono">{logs.length} entries</span>
        </div>
        <div className="p-4 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="text-faint">
              [{new Date(log.timestamp).toLocaleTimeString()}]{' '}
              <span className={levelColor[log.level] || 'text-info'}>{log.level}</span>{' '}
              {log.message}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
