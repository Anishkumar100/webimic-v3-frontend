import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, ArrowRight, Loader2, Monitor, Tablet, Smartphone, FileText, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobsStore } from '../../store/useJobsStore';

export default function NewJobModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [scopeMode, setScopeMode] = useState('single');
  const [devicePreset, setDevicePreset] = useState('desktop');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { submitJob } = useJobsStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setSubmitting(true);
    setError(null);
    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const newJob = await submitJob({
        url: fullUrl,
        name: name || new URL(fullUrl).hostname,
        scopeMode,
        devicePreset,
      });
      setSubmitting(false);
      setUrl(''); setName(''); setScopeMode('single'); setDevicePreset('desktop');
      onClose();
      navigate(`/app/jobs/${newJob.id}`);
    } catch (err) {
      setSubmitting(false);
      setError(err.message);
    }
  };

  const devices = [
    { value: 'desktop', label: 'Desktop', Icon: Monitor },
    { value: 'tablet', label: 'Tablet', Icon: Tablet },
    { value: 'mobile', label: 'Mobile', Icon: Smartphone },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-[201] flex items-center justify-center px-5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-2xl bg-[#0a0a18] border border-white/[0.06] shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden"
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-display font-bold text-text">New Analysis Job</h2>
                  <motion.button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-muted hover:text-text transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-muted mb-2 uppercase tracking-wider font-display font-bold">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                      <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" required className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-[14px] text-text font-body placeholder:text-faint focus:outline-none focus:border-primary/[0.3] transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted mb-2 uppercase tracking-wider font-display font-bold">Job Name <span className="text-faint">(optional)</span></label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Linear Homepage Audit" className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-text font-body placeholder:text-faint focus:outline-none focus:border-primary/[0.3] transition-all" />
                  </div>

                  {/* Crawl Scope */}
                  <div>
                    <label className="block text-[11px] text-muted mb-2 uppercase tracking-wider font-display font-bold">Crawl Scope</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setScopeMode('single')}
                        className={`flex flex-col items-start gap-1.5 p-3 rounded-lg text-left border transition-all ${
                          scopeMode === 'single'
                            ? 'border-primary/30 bg-primary/[0.08]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className={`w-3.5 h-3.5 ${scopeMode === 'single' ? 'text-primary' : 'text-muted'}`} />
                          <span className={`text-[12px] font-bold ${scopeMode === 'single' ? 'text-primary' : 'text-text'}`}>Single Page</span>
                        </div>
                        <span className="text-[10px] text-faint leading-snug">Just the URL you pasted. Fastest.</span>
                      </button>
                      <button type="button" onClick={() => setScopeMode('full')}
                        className={`flex flex-col items-start gap-1.5 p-3 rounded-lg text-left border transition-all ${
                          scopeMode === 'full'
                            ? 'border-primary/30 bg-primary/[0.08]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Network className={`w-3.5 h-3.5 ${scopeMode === 'full' ? 'text-primary' : 'text-muted'}`} />
                          <span className={`text-[12px] font-bold ${scopeMode === 'full' ? 'text-primary' : 'text-text'}`}>Full Site</span>
                        </div>
                        <span className="text-[10px] text-faint leading-snug">Every internal link, up to 100 pages.</span>
                      </button>
                    </div>
                  </div>

                  {/* Device Preset */}
                  <div>
                    <label className="block text-[11px] text-muted mb-2 uppercase tracking-wider font-display font-bold">Device Viewport</label>
                    <div className="flex gap-2">
                      {devices.map(({ value, label, Icon }) => (
                        <button key={value} type="button" onClick={() => setDevicePreset(value)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-medium border transition-all ${
                            devicePreset === value
                              ? 'border-primary/30 bg-primary/[0.08] text-primary'
                              : 'border-white/[0.06] bg-white/[0.02] text-muted hover:text-text'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-danger text-[12px] bg-danger/[0.05] border border-danger/10 rounded-lg p-3">{error}</p>}

                  <div className="flex gap-2.5 pt-2">
                    <motion.button type="submit" disabled={submitting || !url} className="btn-primary flex-1 justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed" whileHover={!submitting ? { scale: 1.02 } : {}} whileTap={!submitting ? { scale: 0.98 } : {}}>
                      {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>) : (<>Start Analysis <ArrowRight className="w-4 h-4" /></>)}
                    </motion.button>
                    <motion.button type="button" onClick={onClose} className="btn-secondary px-5 py-3" whileHover={{ scale: 1.02 }}>Cancel</motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
