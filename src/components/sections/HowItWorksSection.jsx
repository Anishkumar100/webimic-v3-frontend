import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import { aiLoopVideo, aiVibeCodingImg, fullPipeline, steps12, steps34, step5Export } from '../../assets/index';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { num: '01', title: 'Submit URL', desc: 'Paste any website URL into Webimic. We validate, check robots.txt, and queue your job.' },
  { num: '02', title: 'Job Queued', desc: 'Your job enters a priority queue and gets assigned to an available worker in the cluster.' },
  { num: '03', title: 'Crawl & Extract', desc: 'A headless browser navigates every page, capturing screenshots, DOM, stylesheets, and animations.' },
  { num: '04', title: 'Analysis & PDFs', desc: 'AI engine extracts tokens, generates Doc A (observed) and Doc B (suggested), and builds PDF reports.' },
  { num: '05', title: 'Review & Export', desc: 'Download print-ready PDFs, copy LLM-ready JSON, or use the API to integrate into your workflow.' },
];

const pipelineImages = [steps12, steps34, step5Export].filter(Boolean);

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const pipelineRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    if (!progressRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(progressRef.current,
        { width: '0%' },
        {
          width: '100%', duration: 2, ease: 'power2.inOut',
          scrollTrigger: { trigger: progressRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SectionShell id="how-it-works" className="glow-violet overflow-hidden">
      <SectionHeading
        tag="The Pipeline"
        title="Five steps from URL to production spec"
        description="A fully automated pipeline that crawls, extracts, analyzes, and documents any website's design system."
      />

      {/* Steps + Video */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-20 items-center">
        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.button
              key={step.num}
              className={`w-full text-left flex items-start gap-5 p-5 sm:p-6 rounded-2xl border transition-all duration-500 group ${
                activeStep === i
                  ? 'bg-primary/10 border-primary/30 shadow-[0_0_30px_rgba(124,111,255,0.15)] scale-[1.02]'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
              }`}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              onClick={() => setActiveStep(i)}
            >
              <span className={`font-mono font-black text-xl sm:text-2xl flex-shrink-0 w-10 tabular-nums transition-colors duration-300 ${
                activeStep === i ? 'text-primary drop-shadow-[0_0_10px_rgba(124,111,255,0.8)]' : 'text-white/20 group-hover:text-white/40'
              }`}>
                {step.num}
              </span>
              <div className="flex-1">
                <h4 className={`text-lg sm:text-xl font-display font-bold mb-1 transition-colors duration-300 ${activeStep === i ? 'text-white' : 'text-text group-hover:text-white'}`}>
                  {step.title}
                </h4>
                <AnimatePresence mode="wait">
                  {activeStep === i && (
                    <motion.p
                      className="text-[15px] sm:text-[16px] text-white/70 font-body leading-relaxed mt-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {step.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              {activeStep === i && (
                <motion.div
                  className="w-[4px] h-10 bg-gradient-to-b from-primary to-teal rounded-full self-center flex-shrink-0 shadow-[0_0_20px_rgba(0,213,189,0.8)]"
                  layoutId="step-indicator"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Video with extreme browser chrome and glow */}
        <motion.div
          className="relative perspective-[1000px] mt-10 lg:mt-0"
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {/* Godly pulsing background glow */}
          <div className="absolute inset-[-15%] bg-gradient-to-tr from-primary/30 via-teal/20 to-primary/30 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse-ring" />
          
          <div className="browser-frame sticky top-24 shadow-[0_30px_80px_rgba(0,0,0,0.8)] border-white/10 bg-[#06060e] rounded-2xl overflow-hidden ring-1 ring-white/10 group">
            <div className="browser-chrome bg-black/50 backdrop-blur-xl border-b border-white/5 py-4 px-5">
              <div className="browser-dot bg-[#ff5f57] w-3 h-3" />
              <div className="browser-dot bg-[#ffbd2e] w-3 h-3" />
              <div className="browser-dot bg-[#28c840] w-3 h-3" />
            </div>
            <div className="relative">
              <video
                src={aiLoopVideo}
                poster={aiVibeCodingImg}
                loop muted autoPlay playsInline
                className="w-full h-auto block"
                aria-label="AI analysis loop"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full pipeline — full width, with animated progress bar */}
      <div ref={pipelineRef} className="relative">
        <div className="h-[2px] bg-white/[0.04] rounded-full mb-6 overflow-hidden">
          <div ref={progressRef} className="h-full bg-gradient-to-r from-primary via-teal to-primary rounded-full" style={{ width: '0%' }} />
        </div>

        {fullPipeline && (
          <motion.div
            className="rounded-xl overflow-hidden border border-white/[0.06] mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img src={fullPipeline} alt="Complete user journey pipeline" className="w-full h-auto" />
          </motion.div>
        )}

        {/* Step close-ups — full landscape */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { img: steps12, title: 'Steps 1–2', sub: 'Submit & Queue' },
            { img: steps34, title: 'Steps 3–4', sub: 'Crawl & Analyze' },
            { img: step5Export, title: 'Step 5', sub: 'Export & Deliver' },
          ].filter((s) => s.img).map((s, i) => (
            <motion.div
              key={s.title}
              className="rounded-xl overflow-hidden border border-white/[0.06] bg-surface group hover:border-primary/[0.12] transition-all duration-400"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <img src={s.img} alt={s.title} className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" />
              <div className="p-4">
                <h4 className="text-[13px] font-display font-bold text-text">{s.title}</h4>
                <p className="text-[12px] text-muted">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
