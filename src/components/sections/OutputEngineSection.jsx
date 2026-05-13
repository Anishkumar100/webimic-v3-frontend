import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import { docAvsDocB, docADetail, docBDetail, pdfReportCover, llmContext } from '../../assets/index';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'docA', label: 'Doc A' },
  { id: 'docB', label: 'Doc B' },
];

const content = {
  overview: {
    image: docAvsDocB,
    title: 'Two documents, one complete picture',
    desc: 'Every Webimic job produces two complementary PDFs. Doc A captures exactly what exists. Doc B suggests what could be better — including dark-mode variants, accessibility improvements, and optimized typography.',
  },
  docA: {
    image: docADetail,
    title: 'Doc A — Observed UI Specification',
    desc: 'Exact design tokens extracted from the live UI — colors with hex/HSL values, typography stacks, spacing patterns on a 4px grid, motion triggers, and component hierarchy.',
  },
  docB: {
    image: docBDetail,
    title: 'Doc B — Suggested Redesign',
    desc: 'AI-generated improvements including accessible color palette variants, optimized typography scale, dark-mode generation, and WCAG 2.1 AA compliance notes.',
  },
};

export default function OutputEngineSection() {
  const [activeTab, setActiveTab] = useState('overview');
  const c = content[activeTab];

  return (
    <SectionShell id="output-engine" className="glow-violet">
      <SectionHeading
        tag="The Output"
        title="LLM-ready PDF specifications"
        description="Image-rich, structured documents that feed directly into Claude or GPT for instant production code."
      />

      {/* Tab bar */}
      <div className="flex items-center justify-center gap-1 mb-12 bg-white/[0.02] rounded-xl p-1 max-w-md mx-auto border border-white/[0.04]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 px-4 py-3 rounded-lg text-[13px] font-display font-semibold transition-colors ${
              activeTab === tab.id ? 'text-text' : 'text-muted hover:text-text'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="output-pill"
                className="absolute inset-0 bg-white/[0.05] rounded-lg border border-white/[0.06]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content — full-width image + description wrapped in GlowCard */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="glow-card block relative">
            {/* Extreme background glow inside the card area */}
            <div className="absolute inset-[-10%] bg-gradient-to-t from-primary/20 via-teal/10 to-transparent blur-[80px] pointer-events-none -z-10 animate-pulse-ring-delay-2" />
            
            <div className="glow-card-inner bg-[#0a0a18]/90 backdrop-blur-xl p-5 sm:p-8 rounded-2xl border border-white/5 transition-colors">
              {/* Full-width landscape image with extreme 3D hover */}
              {c.image && (
                <div className="relative perspective-[1500px] mb-10">
                  <motion.div
                    className="rounded-xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 relative group"
                    whileHover={{ rotateX: 2, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-auto block"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  </motion.div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-10 items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-10 rounded-full bg-gradient-to-b from-primary to-teal shadow-[0_0_15px_rgba(124,111,255,0.6)]" />
                    <h3 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">{c.title}</h3>
                  </div>
                  <p className="text-[16px] text-white/70 leading-relaxed font-body pl-5">{c.desc}</p>
                </div>

                {/* Supporting images */}
                <div className="grid grid-cols-2 gap-4">
                  {pdfReportCover && (
                    <motion.div
                      className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 group bg-surface relative"
                      whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(124,111,255,0.2)" }}
                    >
                      <img src={pdfReportCover} alt="PDF report cover" className="w-full h-auto" loading="lazy" />
                      <div className="p-3 bg-black/50 backdrop-blur-md absolute bottom-0 inset-x-0 border-t border-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-[12px] text-white text-center font-display font-bold">PDF Report</p>
                      </div>
                    </motion.div>
                  )}
                  {llmContext && (
                    <motion.div
                      className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10 group bg-surface relative"
                      whileHover={{ scale: 1.05, y: -5, boxShadow: "0 20px 40px rgba(0,213,189,0.2)" }}
                    >
                      <img src={llmContext} alt="LLM context prompt" className="w-full h-auto" loading="lazy" />
                      <div className="p-3 bg-black/50 backdrop-blur-md absolute bottom-0 inset-x-0 border-t border-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-[12px] text-white text-center font-display font-bold">LLM Context</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </SectionShell>
  );
}
