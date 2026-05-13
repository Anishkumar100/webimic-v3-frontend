import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Download, Copy, FileText, ExternalLink, Code2, PlayCircle,
  Palette, Type, Check, Ruler, Bot, Globe,
} from 'lucide-react';
import { useJobsStore } from '../store/useJobsStore';
import { api } from '../lib/api.js';
import GlowCard from '../components/effects/GlowCard';
import { docADetail, docBDetail } from '../assets/index';

const statusStyles = {
  completed: 'bg-teal/[0.08] text-teal border-teal/[0.12]',
  processing: 'bg-primary/[0.08] text-primary border-primary/[0.12]',
  queued: 'bg-info/[0.08] text-info border-info/[0.12]',
  failed: 'bg-danger/[0.08] text-danger border-danger/[0.12]',
};

const AGENT_BADGE = {
  'Orchestrator':  'text-primary bg-primary/10 border-primary/30',
  'Capture Agent': 'text-teal bg-teal/10 border-teal/30',
  'Crawl Agent':   'text-info bg-info/10 border-info/30',
  'Upload Agent':  'text-info bg-info/10 border-info/30',
  'Color Agent':   'text-primary bg-primary/10 border-primary/30',
  'Token Agent':   'text-teal bg-teal/10 border-teal/30',
  'PDF Agent':     'text-primary bg-primary/10 border-primary/30',
  'LLM Agent':     'text-info bg-info/10 border-info/30',
};
const agentBadgeClass = (agent) => AGENT_BADGE[agent] || 'text-muted bg-white/[0.04] border-white/10';

const LEVEL_COLOR = {
  INFO: 'text-info', SUCCESS: 'text-teal', WARN: 'text-amber-400', ERROR: 'text-danger', PROCESSING: 'text-primary',
};

export default function JobDetail() {
  const { jobId } = useParams();
  const jobs = useJobsStore((s) => s.jobs);
  const { fetchJobDetail, pollJobStatus } = useJobsStore();
  const [jobDetail, setJobDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [copied, setCopied] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [downloadError, setDownloadError] = useState(null);
  const pollRef = useRef(null);
  const wsRef = useRef(null);
  const logTailRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const detail = await fetchJobDetail(jobId);
        if (cancelled) return;
        setJobDetail(detail);
        if (detail.processingLog) {
          setAgentLogs(detail.processingLog.map(l => ({ timestamp: l.time, agent: l.agent, level: l.level, message: l.message })));
        }
        setLoadingDetail(false);

        if (detail.status === 'queued' || detail.status === 'processing') {
          let interval = 4000;
          let failures = 0;
          const MAX_FAILURES = 30;
          const MAX_INTERVAL = 30000;

          const poll = async () => {
            if (cancelled) return;
            try {
              const updated = await pollJobStatus(jobId);
              failures = 0;
              interval = 4000;
              if (updated.status === 'completed' || updated.status === 'failed') {
                const full = await fetchJobDetail(jobId);
                if (!cancelled) {
                  setJobDetail(full);
                  if (full.processingLog) {
                    setAgentLogs(full.processingLog.map(l => ({ timestamp: l.time, agent: l.agent, level: l.level, message: l.message })));
                  }
                }
                return;
              }
            } catch (e) {
              failures++;
              interval = Math.min(interval * 2, MAX_INTERVAL);
              if (failures >= MAX_FAILURES) {
                console.warn('[Poll] Max retries reached, stopping poll for', jobId);
                return;
              }
            }
            pollRef.current = setTimeout(poll, interval);
          };
          pollRef.current = setTimeout(poll, interval);
        }
      } catch (e) {
        if (!cancelled) setLoadingDetail(false);
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(pollRef.current);
    };
  }, [jobId]);

  // ─── LIVE AGENT LOG STREAM via WebSocket ────────────────────────────────────
  useEffect(() => {
    if (!jobId) return;
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'LOG') return;
          // Only show logs for THIS job. Server emits jobId on each log; skip
          // ones from other jobs to keep the feed focused.
          if (data.jobId && data.jobId !== jobId) return;
          setAgentLogs((prev) => [...prev, data].slice(-200));
        } catch { /* ignore malformed frames */ }
      };
      ws.onopen = () => {
        setAgentLogs((prev) => [...prev, {
          agent: 'Orchestrator', level: 'INFO',
          message: 'Connected to live agent feed', timestamp: new Date().toISOString(),
        }]);
      };
    } catch { /* WS not available */ }
    return () => { try { ws?.close(); } catch {} };
  }, [jobId]);

  // Auto-scroll log to bottom when new entries arrive
  useEffect(() => {
    if (logTailRef.current) logTailRef.current.scrollTop = logTailRef.current.scrollHeight;
  }, [agentLogs]);

  const job = jobDetail || jobs.find((j) => j.id === jobId);

  if (loadingDetail && !job) {
    return (
      <div className="pt-24 px-5 max-w-4xl mx-auto text-center py-20">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
          <Code2 className="w-6 h-6 text-primary animate-pulse" />
        </div>
        <p className="text-muted font-body">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="pt-24 px-5 max-w-4xl mx-auto text-center py-20">
        <h1 className="text-2xl font-display font-bold text-text mb-2">Job not found</h1>
        <p className="text-[14px] text-muted mb-6 font-body">The job you're looking for doesn't exist.</p>
        <Link to="/app" className="btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const badge = statusStyles[job.status] || statusStyles.queued;
  const isCompleted = job.status === 'completed';
  const isInFlight = job.status === 'queued' || job.status === 'processing';

  const colorPalette = jobDetail?.designTokens?.colors || [];
  const typographyData = jobDetail?.designTokens?.typography || [];
  const animationData = jobDetail?.designTokens?.animations || [];
  const spacingData = jobDetail?.designTokens?.spacing || [];
  const pages = Array.isArray(job.pages) ? job.pages : [];



  const downloadViaProxy = async (docKey, filename) => {
    setDownloadError(null);
    try {
      const blob = await api.getBlob(`/v1/jobs/${job.id}/download/${docKey}`);
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 1500);
    } catch (e) {
      setDownloadError(e.message || 'Download failed');
    }
  };
  const handleDownloadDocA = () => downloadViaProxy('a', `webimic-doc-a-${job.id}.pdf`);
  const handleDownloadDocB = () => downloadViaProxy('b', `webimic-doc-b-${job.id}.pdf`);
  const handleDownloadAllPdfs = async () => {
    await handleDownloadDocA();
    setTimeout(handleDownloadDocB, 300);
  };
  const hasPdfs = !!(job.docAUrl || job.docBUrl);
  const handleCopyLLMContext = async () => {
    if (!job.llmContextUrl) return;
    try {
      const json = await fetch(job.llmContextUrl).then((r) => r.text());
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* clipboard error */ }
  };

  return (
    <div className="pt-20 px-5 sm:px-6 lg:px-8 pb-12 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <Link to="/app" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text transition-colors font-body">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        className="rounded-xl border border-white/[0.06] bg-surface p-6 mb-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 relative z-10">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-text mb-1">{job.name}</h1>
            <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-primary hover:text-primary/80 font-mono inline-flex items-center gap-1 transition-colors">
              {job.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border ${badge} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-[12px] text-muted font-body relative z-10 border-t border-white/[0.04] pt-4">
          <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Created</span> {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
          {job.completedAt && <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Completed</span> {new Date(job.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>}
          <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Scope</span> {job.scopeMode === 'full' ? 'Full site' : 'Single page'}</div>
          {(job.pageCount || pages.length > 0) && <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Pages Analyzed</span> {job.pageCount || pages.length} pages</div>}
          <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Internal Links</span> {job.internalLinksFound || 0} found</div>
          {job.pdfSize && <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Payload</span> {job.pdfSize}</div>}
        </div>
        {job.error && <div className="mt-4 p-3 bg-danger/[0.05] border border-danger/10 rounded-lg text-[13px] text-danger font-body">{job.error}</div>}
      </motion.div>

      {/* Agent Feed / Logs */}
      {(isInFlight || agentLogs.length > 0) && (
        <motion.div
          className="mb-8 rounded-xl border border-white/[0.06] bg-[#000005] overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-2 bg-white/[0.02]">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-[12px] font-display font-bold text-text uppercase tracking-wider">Webimic Agents {isInFlight ? '— Live' : '— Log Trace'}</span>
            {isInFlight && (
              <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-mono text-teal">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                streaming
              </span>
            )}
          </div>
          <div ref={logTailRef} className="p-4 h-64 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-1.5">
            {agentLogs.length === 0 && (
              <div className="text-faint italic">Waiting for the first agent to come online…</div>
            )}
            <AnimatePresence initial={false}>
              {agentLogs.map((log, i) => (
                <motion.div
                  key={`${log.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-wrap items-baseline gap-2"
                >
                  <span className="text-faint">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  {log.agent && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${agentBadgeClass(log.agent)}`}>
                      {log.agent}
                    </span>
                  )}
                  <span className={`${LEVEL_COLOR[log.level] || 'text-info'} font-bold`}>{log.level}</span>
                  <span className="text-text/90 flex-1 min-w-0 break-words">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {isCompleted ? (
        <div className="space-y-8">
          {/* Action Bar */}
          <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <motion.button
              onClick={handleDownloadAllPdfs}
              disabled={!hasPdfs}
              className={`text-[13px] px-6 py-2.5 shadow-[0_0_20px_rgba(124,111,255,0.3)] ${hasPdfs ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
              whileHover={hasPdfs ? { scale: 1.02 } : {}}
            >
              <Download className="w-4 h-4 mr-1.5" /> {hasPdfs ? 'Download Doc A & B (PDF)' : 'PDFs Generating...'}
            </motion.button>
            <motion.button onClick={handleDownloadDocA} disabled={!job.docAUrl} className="btn-secondary text-[13px] px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed" whileHover={job.docAUrl ? { scale: 1.02 } : {}}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Doc A
            </motion.button>
            <motion.button onClick={handleDownloadDocB} disabled={!job.docBUrl} className="btn-secondary text-[13px] px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed" whileHover={job.docBUrl ? { scale: 1.02 } : {}}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Doc B
            </motion.button>
            <motion.button onClick={handleCopyLLMContext} className="btn-secondary text-[13px] px-6 py-2.5 border-primary/20 hover:bg-primary/5" whileHover={{ scale: 1.02 }}>
              {copied ? <><Check className="w-4 h-4 mr-1.5 text-teal" /> Copied!</> : <><Copy className="w-4 h-4 mr-1.5" /> Copy LLM Context (JSON)</>}
            </motion.button>
          </motion.div>
          {downloadError && (
            <p className="text-danger text-[12px] bg-danger/[0.05] border border-danger/10 rounded-lg p-3">
              Download failed: {downloadError}
            </p>
          )}

          {/* Doc A vs Doc B Showcase */}
          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <FileText className="w-5 h-5 text-teal" />
              <h2 className="text-[16px] font-display font-bold text-text">Generated Specifications</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <GlowCard className="group overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-white/[0.06] bg-[#000005]">
                  <div className="absolute top-4 left-4 z-10 tag bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold">DOC A: OBSERVED</div>
                  {pages[0]?.screenshotUrl ? (
                    <img src={pages[0].screenshotUrl} alt="Page preview" className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                  ) : docADetail ? (
                    <img src={docADetail} alt="Doc A Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-faint font-mono text-[11px]">Preview Generating...</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-[14px] font-display font-bold text-text mb-2">Live UI State Capture</h3>
                  <p className="text-[12px] text-muted leading-relaxed font-body">Pixel-perfect extraction of the live website's DOM structure, computed styles, and accessibility tree.</p>
                </div>
              </GlowCard>
              <GlowCard className="group overflow-hidden border-primary/20 shadow-[0_0_30px_rgba(124,111,255,0.05)]">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-white/[0.06] bg-[#000005]">
                  <div className="absolute top-4 left-4 z-10 tag bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[11px] font-bold">DOC B: REDESIGN</div>
                  {docBDetail ? (
                    <img src={docBDetail} alt="Doc B Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-primary/50 font-mono text-[11px]">Generating Redesign...</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-[14px] font-display font-bold text-text mb-2 text-primary">AI-Suggested Evolution</h3>
                  <p className="text-[12px] text-muted leading-relaxed font-body">Optimized variants including automatic dark mode generation, contrast fixes, and modernized spacing scales.</p>
                </div>
              </GlowCard>
            </div>
          </section>

          {/* Crawled Pages List (full site jobs) */}
          {pages.length > 1 && (
            <section>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Globe className="w-5 h-5 text-info" />
                <h2 className="text-[16px] font-display font-bold text-text">Pages Analyzed <span className="text-faint text-[12px] font-normal">({pages.length})</span></h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pages.map((p) => (
                  <div key={p.screenshotPublicId || p.url}
                    className="group rounded-lg overflow-hidden border border-white/[0.06] bg-white/[0.02] hover:border-primary/30 transition-all flex flex-col"
                  >
                    {p.screenshotUrl && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="aspect-video bg-[#000005] overflow-hidden block">
                        <img src={p.screenshotUrl} alt={p.title} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                      </a>
                    )}
                    <div className="p-3 flex-1 flex flex-col">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold text-text truncate hover:text-primary transition-colors" title={p.title}>{p.title || '—'}</a>
                      <div className="text-[10px] font-mono text-faint truncate mt-0.5" title={p.url}>{p.url}</div>
                      {p.links?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/[0.04] flex-1">
                          <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1.5">Internal Links ({p.links.length})</div>
                          <div className="text-[10px] font-mono text-muted max-h-32 overflow-y-auto no-scrollbar space-y-1">
                            {p.links.map(l => <a href={l} target="_blank" rel="noopener noreferrer" key={l} className="block truncate hover:text-info transition-colors" title={l}>{l.replace(job.url, '') || '/'}</a>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Extracted Tokens — FULL LISTS */}
          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-[16px] font-display font-bold text-text">Extracted Design Tokens</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Colors — full list */}
              <GlowCard className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <h3 className="text-[13px] font-display font-bold text-text uppercase tracking-wider">Color Palette</h3>
                  </div>
                  <span className="text-[11px] text-faint font-mono">{colorPalette.length} found</span>
                </div>
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {colorPalette.length === 0 && <div className="text-[11px] text-faint italic">No colors extracted.</div>}
                  {colorPalette.map((c) => (
                    <div key={c.hex} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded border border-white/20 shadow-inner flex-shrink-0" style={{ backgroundColor: c.hex }} />
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-muted">{c.hex}</div>
                          {c.frequency != null && (
                            <div className="text-[9px] text-faint">{(c.frequency * 100).toFixed(1)}% of pixels</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {c.role && <span className="text-[9px] text-muted px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.02]">{c.role}</span>}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${(c.wcagContrast?.onWhite) === 'FAIL' ? 'text-danger border-danger/30 bg-danger/10' : 'text-teal border-teal/30 bg-teal/10'}`}>
                          {c.wcagContrast?.onWhite || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>

              {/* Typography — full list with live preview */}
              <GlowCard className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-teal" />
                    <h3 className="text-[13px] font-display font-bold text-text uppercase tracking-wider">Typography Scale</h3>
                  </div>
                  <span className="text-[11px] text-faint font-mono">{typographyData.length} found</span>
                </div>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {typographyData.length === 0 && <div className="text-[11px] text-faint italic">No typography styles extracted.</div>}
                  {typographyData.map((t, i) => (
                    <div key={`${t.tag}-${i}`} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-end mb-1.5 gap-2">
                        <span className="text-[11px] font-mono font-bold text-primary uppercase">{t.tag}</span>
                        <span className="text-[10px] text-faint font-mono truncate">{t.fontFamilyClean} · {t.fontSize} · {t.fontWeight} · lh:{t.lineHeight}</span>
                      </div>
                      <p className="text-[14px] text-text leading-snug" style={{
                        fontFamily: t.fontFamilyClean,
                        fontWeight: t.fontWeight,
                        letterSpacing: t.letterSpacing,
                        textTransform: t.textTransform,
                      }}>
                        {t.sampleText || 'The quick brown fox jumps over the lazy dog.'}
                      </p>
                    </div>
                  ))}
                </div>
              </GlowCard>

              {/* Spacing — NEW panel */}
              <GlowCard className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-info" />
                    <h3 className="text-[13px] font-display font-bold text-text uppercase tracking-wider">Spacing Scale</h3>
                  </div>
                  <span className="text-[11px] text-faint font-mono">{spacingData.length} tokens</span>
                </div>
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {spacingData.length === 0 && <div className="text-[11px] text-faint italic">No spacing tokens extracted.</div>}
                  {spacingData.map((s) => (
                    <div key={s.name} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] font-mono text-faint w-10 flex-shrink-0">{s.name}</span>
                      <div className="flex-1 flex items-center gap-3 min-w-0">
                        <div className="h-3 bg-info/40 border-r border-info" style={{ width: `${Math.min(s.numericValue * 2, 160)}px` }} />
                        <span className="text-[11px] font-mono text-muted flex-shrink-0">{s.value}</span>
                      </div>
                      <span className="text-[9px] text-faint flex-shrink-0">×{s.usageCount} · {s.category}</span>
                    </div>
                  ))}
                </div>
              </GlowCard>

              {/* Animations — full list */}
              <GlowCard className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-primary" />
                    <h3 className="text-[13px] font-display font-bold text-text uppercase tracking-wider">Motion Catalog</h3>
                  </div>
                  <span className="text-[11px] text-faint font-mono">{animationData.length} animations</span>
                </div>
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {animationData.length === 0 && <div className="text-[11px] text-faint italic">No animations extracted.</div>}
                  {animationData.map((a, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex justify-between items-center mb-2 gap-2">
                        <span className="text-[11px] font-mono text-primary truncate" title={a.target}>{a.target}</span>
                        <span className="text-[10px] text-muted border border-white/10 rounded px-1.5 py-0.5 flex-shrink-0">{a.trigger}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ x: '-100%' }}
                            animate={{ x: '0%' }}
                            transition={{ duration: Math.max(parseFloat(a.duration) || 0.3, 0.1), repeat: Infinity, repeatDelay: 1, ease: a.easing === 'ease-out' ? 'easeOut' : 'linear' }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-faint flex-shrink-0">{a.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-faint font-mono">
                        <span>type: {a.type}</span>
                        <span>·</span>
                        <span>easing: {a.easing}</span>
                        {a.properties?.length > 0 && <><span>·</span><span className="truncate">props: {a.properties.join(', ')}</span></>}
                      </div>
                    </div>
                  ))}
                </div>
              </GlowCard>
            </div>
          </section>
        </div>
      ) : !isCompleted && (
        // In-flight: keep the existing progress hero (the live agent feed above already covers detail)
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Code2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-display font-bold text-text mb-2">Analysis in Progress</h2>
          <p className="text-[14px] text-muted font-body mb-6 text-center max-w-md">
            Webimic agents are working through the pipeline. Follow their progress above.
          </p>
          <div className="w-full max-w-sm h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-teal" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 10, ease: 'linear' }} />
          </div>
        </div>
      )}
    </div>
  );
}
