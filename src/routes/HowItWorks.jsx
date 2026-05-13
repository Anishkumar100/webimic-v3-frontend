import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionShell from '../components/layout/SectionShell';
import SectionHeading from '../components/common/SectionHeading';
import CTASection from '../components/sections/CTASection';
import {
  aiLoopVideo, aiVibeCodingImg, fullPipeline, steps12, steps34, step5Export,
  docAvsDocB, docADetail, docBDetail, scaffoldingEditor, llmContext,
} from '../assets/index';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: '01', title: 'Submit a URL', desc: 'Paste any live website URL. Webimic validates and queues the job in seconds.' },
  { num: '02', title: 'Automated Crawling', desc: 'A headless browser navigates every page, capturing screenshots, DOM, and stylesheets.' },
  { num: '03', title: 'Token Extraction', desc: 'K-means clustering, font detection, spacing analysis, and motion cataloging run simultaneously.' },
  { num: '04', title: 'Document Generation', desc: 'Doc A (observed spec) and Doc B (suggested redesign) are generated as rich, image-heavy PDFs.' },
  { num: '05', title: 'Export & Use', desc: 'Download PDFs, copy LLM prompts, or use the API to integrate into your workflow.' },
];

export default function HowItWorks() {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: heroRef.current, start: 'top 80%' } }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-24">
      {/* Hero section */}
      <SectionShell id="how-overview">
        <SectionHeading
          tag="How It Works"
          title="From URL to production specs in minutes"
          description="Webimic's fully automated pipeline handles everything — crawling, extraction, analysis, and PDF generation."
        />

        <div ref={heroRef} className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-20">
          {/* Video in browser frame */}
          <div className="browser-frame">
            <div className="browser-chrome">
              <div className="browser-dot bg-[#ff5f57]" />
              <div className="browser-dot bg-[#ffbd2e]" />
              <div className="browser-dot bg-[#28c840]" />
            </div>
            <video src={aiLoopVideo} poster={aiVibeCodingImg} loop muted autoPlay playsInline className="w-full h-auto block" />
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-text mb-5 tracking-tight">The AI Vibe-Coding Loop</h3>
            <p className="text-[14px] text-muted leading-relaxed font-body mb-8">
              Webimic creates a virtuous cycle: analyze any UI → extract structured specs → feed to LLM → generate production code → iterate.
            </p>
            <div className="space-y-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-white/[0.04] hover:bg-white/[0.015] transition-all duration-300"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ x: 4 }}
                >
                  <span className="text-primary font-mono font-bold text-[14px] flex-shrink-0 w-6">{step.num}</span>
                  <div>
                    <h4 className="text-[13px] font-display font-bold text-text">{step.title}</h4>
                    <p className="text-[12px] text-muted font-body">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SectionShell>

      {/* Full pipeline — full width */}
      <SectionShell id="full-pipeline">
        <SectionHeading tag="Pipeline" title="The complete user journey" />
        <motion.div
          className="rounded-xl overflow-hidden border border-white/[0.06] mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img src={fullPipeline} alt="Full user journey pipeline" className="w-full h-auto" />
        </motion.div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { img: steps12, t: 'Steps 1–2', d: 'Submit & Queue' },
            { img: steps34, t: 'Steps 3–4', d: 'Crawl & Analyze' },
            { img: step5Export, t: 'Step 5', d: 'Export' },
          ].filter((s) => s.img).map((s, i) => (
            <motion.div
              key={s.t}
              className="rounded-xl overflow-hidden border border-white/[0.06] bg-surface group hover:border-primary/[0.12] transition-all duration-400"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <img src={s.img} alt={s.t} className="w-full h-auto group-hover:scale-[1.03] transition-transform duration-700" />
              <div className="p-4"><h4 className="text-[13px] font-display font-bold text-text">{s.t}</h4><p className="text-[12px] text-muted">{s.d}</p></div>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      {/* Output details — FULL landscape images */}
      <SectionShell id="output-details" className="glow-violet">
        <SectionHeading tag="Output" title="What you get" />

        {/* Doc A vs Doc B — full width */}
        {docAvsDocB && (
          <motion.div
            className="rounded-xl overflow-hidden border border-white/[0.06] mb-8 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img src={docAvsDocB} alt="Doc A vs Doc B comparison" className="w-full h-auto group-hover:scale-[1.01] transition-transform duration-700" />
          </motion.div>
        )}

        {/* Doc A + Doc B details — full landscape */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[
            { img: docADetail, t: 'Doc A — Observed Specification', d: 'Exact tokens extracted from the live UI' },
            { img: docBDetail, t: 'Doc B — Suggested Redesign', d: 'AI-generated improvements and dark-mode variants' },
          ].filter((s) => s.img).map((s, i) => (
            <motion.div
              key={s.t}
              className="rounded-xl overflow-hidden border border-white/[0.06] bg-surface group hover:border-primary/[0.12] transition-all duration-400"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
            >
              <img src={s.img} alt={s.t} className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="p-5">
                <h4 className="text-[14px] font-display font-bold text-text mb-1">{s.t}</h4>
                <p className="text-[12px] text-muted font-body">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scaffolding + LLM */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { img: scaffoldingEditor, t: 'Instant Scaffolding', d: 'Generated specs plug into code editors for immediate use' },
            { img: llmContext, t: 'LLM Context', d: 'Structured prompts for Claude & GPT' },
          ].filter((s) => s.img).map((s, i) => (
            <motion.div
              key={s.t}
              className="rounded-xl overflow-hidden border border-white/[0.06] bg-surface group hover:border-teal/[0.12] transition-all duration-400"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
            >
              <img src={s.img} alt={s.t} className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="p-5">
                <h4 className="text-[14px] font-display font-bold text-text mb-1">{s.t}</h4>
                <p className="text-[12px] text-muted font-body">{s.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionShell>

      <CTASection />
    </div>
  );
}
