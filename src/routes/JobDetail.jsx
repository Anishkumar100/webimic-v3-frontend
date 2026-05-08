import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Copy, FileText, ExternalLink, Code2, PlayCircle, Palette, Type } from 'lucide-react';
import { useJobsStore } from '../store/useJobsStore';
import GlowCard from '../components/effects/GlowCard';
import { docAvsDocB, docADetail, docBDetail } from '../assets/index';

const statusStyles = {
  completed: 'bg-teal/[0.08] text-teal border-teal/[0.12]',
  processing: 'bg-primary/[0.08] text-primary border-primary/[0.12]',
  queued: 'bg-info/[0.08] text-info border-info/[0.12]',
  failed: 'bg-danger/[0.08] text-danger border-danger/[0.12]',
};

// Extracted color mock data
const colorPalette = [
  { hex: '#111111', role: 'Base Bg', contrast: 'AAA' },
  { hex: '#FAFAFA', role: 'Primary Text', contrast: 'AAA' },
  { hex: '#7C6FFF', role: 'Brand Core', contrast: 'AA' },
  { hex: '#00D5BD', role: 'Accent', contrast: 'AA' },
  { hex: '#2A2A35', role: 'Surface', contrast: 'FAIL' },
];

// Extracted typography mock data
const typographyData = [
  { tag: 'h1', font: 'Inter', weight: 800, size: '64px', lh: '1.1' },
  { tag: 'h2', font: 'Inter', weight: 700, size: '48px', lh: '1.2' },
  { tag: 'p', font: 'Roboto', weight: 400, size: '16px', lh: '1.6' },
  { tag: 'code', font: 'Fira Code', weight: 500, size: '14px', lh: '1.5' },
];

// Extracted animation mock data
const animationData = [
  { trigger: 'onLoad', target: '.hero-heading', duration: '0.8s', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { trigger: 'onHover', target: '.nav-link', duration: '0.3s', easing: 'ease-out' },
  { trigger: 'onScroll', target: '.feature-card', duration: '0.6s', easing: 'power3.out' },
];

export default function JobDetail() {
  const { jobId } = useParams();
  const jobs = useJobsStore((s) => s.jobs);
  const job = jobs.find((j) => j.id === jobId);

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
          {job.pages > 0 && <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Pages Analyzed</span> {job.pages} pages</div>}
          <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Internal Links</span> {job.internalLinks || Math.floor(Math.random() * 150) + 40} found</div>
          {job.pdfSize && <div><span className="text-faint block text-[10px] uppercase tracking-wider mb-0.5">Payload</span> {job.pdfSize}</div>}
        </div>
        {job.error && <div className="mt-4 p-3 bg-danger/[0.05] border border-danger/10 rounded-lg text-[13px] text-danger font-body">{job.error}</div>}
      </motion.div>

      {isCompleted ? (
        <div className="space-y-8">
          {/* Action Bar */}
          <motion.div className="flex flex-wrap gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <motion.button className="btn-primary text-[13px] px-6 py-2.5 shadow-[0_0_20px_rgba(124,111,255,0.3)]" whileHover={{ scale: 1.02 }}><Download className="w-4 h-4 mr-1.5" /> Download Doc A & B (PDF)</motion.button>
            <motion.button className="btn-secondary text-[13px] px-6 py-2.5 border-primary/20 hover:bg-primary/5" whileHover={{ scale: 1.02 }}><Copy className="w-4 h-4 mr-1.5" /> Copy LLM Context (JSON)</motion.button>
          </motion.div>

          {/* Doc A vs Doc B Showcase */}
          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <FileText className="w-5 h-5 text-teal" />
              <h2 className="text-[16px] font-display font-bold text-text">Generated Specifications</h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Doc A */}
              <GlowCard className="group overflow-hidden">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-white/[0.06] bg-[#000005]">
                  <div className="absolute top-4 left-4 z-10 tag bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold">DOC A: OBSERVED</div>
                  {docADetail ? (
                    <img src={docADetail} alt="Doc A Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-faint font-mono text-[11px]">Preview Generating...</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-[14px] font-display font-bold text-text mb-2">Live UI State Capture</h3>
                  <p className="text-[12px] text-muted leading-relaxed font-body">An exact, pixel-perfect extraction of the live website's DOM structure, computed styles, and accessibility tree.</p>
                </div>
              </GlowCard>

              {/* Doc B */}
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

          {/* Extracted Tokens Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Colors */}
            <GlowCard className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  <h3 className="text-[13px] font-display font-bold text-text uppercase tracking-wider">K-Means Colors</h3>
                </div>
                <span className="text-[11px] text-faint font-mono">{job.tokens.colors} found</span>
              </div>
              <div className="space-y-2.5">
                {colorPalette.map((c) => (
                  <div key={c.hex} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded border border-white/20 shadow-inner" style={{ backgroundColor: c.hex }} />
                      <span className="text-[11px] font-mono text-muted">{c.hex}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-faint">{c.role}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${c.contrast === 'FAIL' ? 'text-danger border-danger/30 bg-danger/10' : 'text-teal border-teal/30 bg-teal/10'}`}>{c.contrast}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>

            {/* Typography */}
            <GlowCard className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-teal" />
                  <h3 className="text-[13px] font-display font-bold text-text uppercase tracking-wider">Typography</h3>
                </div>
                <span className="text-[11px] text-faint font-mono">{job.tokens.typography} found</span>
              </div>
              <div className="space-y-3">
                {typographyData.map((t) => (
                  <div key={t.tag} className="border-b border-white/[0.04] pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-[11px] font-mono font-bold text-primary uppercase">{t.tag}</span>
                      <span className="text-[10px] text-faint">{t.size} / {t.weight} / lh:{t.lh}</span>
                    </div>
                    <p className="text-[13px] text-text" style={{ fontFamily: t.font, fontWeight: t.weight }}>
                      The quick brown fox jumps over the lazy dog.
                    </p>
                  </div>
                ))}
              </div>
            </GlowCard>

            {/* Animations */}
            <GlowCard className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-info" />
                  <h3 className="text-[13px] font-display font-bold text-text uppercase tracking-wider">Motion Catalog</h3>
                </div>
                <span className="text-[11px] text-faint font-mono">14 found</span>
              </div>
              <div className="space-y-2.5">
                {animationData.map((a, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div className="flex justify-between mb-2">
                      <span className="text-[11px] font-mono text-info">{a.target}</span>
                      <span className="text-[10px] text-muted border border-white/10 rounded px-1.5 py-0.5">{a.trigger}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-info" 
                          initial={{ x: '-100%' }} 
                          animate={{ x: '0%' }} 
                          transition={{ duration: parseFloat(a.duration), repeat: Infinity, repeatDelay: 1, ease: a.easing === 'ease-out' ? "easeOut" : "linear" }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-faint">{a.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>

          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
            <Code2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-display font-bold text-text mb-2">Analysis in Progress</h2>
          <p className="text-[14px] text-muted font-body mb-8 text-center max-w-md">Webimic workers are currently executing the headless traversal and K-Means extraction sequence.</p>
          <div className="w-full max-w-sm h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-teal" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 10, ease: "linear" }} />
          </div>
        </div>
      )}
    </div>
  );
}
