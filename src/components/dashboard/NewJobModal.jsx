import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobsStore } from '../../store/useJobsStore';

export default function NewJobModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const addJob = useJobsStore((s) => s.addJob);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url) return;
    setSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      const jobId = 'job-' + Math.random().toString(36).substr(2, 9);
      const newJob = {
        id: jobId,
        name: name || new URL(url.startsWith('http') ? url : `https://${url}`).hostname,
        url: url.startsWith('http') ? url : `https://${url}`,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        pages: Math.floor(Math.random() * 20) + 5,
        internalLinks: Math.floor(Math.random() * 150) + 20,
        pdfSize: (Math.random() * 20 + 2).toFixed(1) + ' MB',
        tokens: {
          colors: Math.floor(Math.random() * 30) + 10,
          typography: Math.floor(Math.random() * 15) + 5,
          spacing: Math.floor(Math.random() * 20) + 8,
        },
      };
      
      addJob(newJob);
      setSubmitting(false);
      setUrl('');
      setName('');
      onClose();
      navigate(`/app/jobs/${jobId}`);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[201] flex items-center justify-center px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-2xl bg-[#0a0a18] border border-white/[0.06] shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow top edge */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-display font-bold text-text">New Analysis Job</h2>
                  <motion.button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-muted hover:text-text transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-muted mb-2 uppercase tracking-wider font-display font-bold">Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-[14px] text-text font-body placeholder:text-faint focus:outline-none focus:border-primary/[0.3] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted mb-2 uppercase tracking-wider font-display font-bold">Job Name <span className="text-faint">(optional)</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Linear Homepage Audit"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-[14px] text-text font-body placeholder:text-faint focus:outline-none focus:border-primary/[0.3] transition-all"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <motion.button
                      type="submit"
                      disabled={submitting || !url}
                      className="btn-primary flex-1 justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!submitting ? { scale: 1.02 } : {}}
                      whileTap={!submitting ? { scale: 0.98 } : {}}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      ) : (
                        <>Start Analysis <ArrowRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary px-5 py-3"
                      whileHover={{ scale: 1.02 }}
                    >
                      Cancel
                    </motion.button>
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
