import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { docsNav } from '../data/docsNav';
import CTASection from '../components/sections/CTASection';
import { systemArchitecture, fullPipeline, docAvsDocB, colorKmeans } from '../assets/index';

gsap.registerPlugin(ScrollTrigger);

// Map slugs to content
const docsContent = {
  introduction: {
    image: systemArchitecture,
    body: 'Webimic is an AI-powered platform that reverse-engineers any live website into structured design tokens — colors, typography, spacing, and motion — delivered as print-ready PDF specifications and LLM-ready JSON.',
    code: '$ npx webimic analyze --url https://example.com --output ./specs',
  },
  'quick-start': {
    image: fullPipeline,
    body: 'Get started in under 2 minutes. Sign up, paste a URL, and receive your first design spec. No configuration needed.',
    code: 'curl -X POST https://api.webimic.com/v1/jobs \\\n  -H "Authorization: Bearer YOUR_KEY" \\\n  -d \'{"url": "https://example.com"}\'',
  },
  'doc-a': {
    image: docAvsDocB,
    body: 'Doc A is the observed specification — it captures exactly what exists on the live website. Every color hex, every font stack, every spacing value is extracted and organized into a structured catalog.',
  },
  'color-extraction': {
    image: colorKmeans,
    body: 'Our K-Means clustering engine groups visually similar colors, removes near-duplicates, calculates WCAG contrast ratios, and maps each color to a semantic role (primary, secondary, background, text, etc.).',
  },
};

export default function Docs() {
  const [activeSlug, setActiveSlug] = useState('introduction');
  const sectionRefs = useRef({});
  const allItems = docsNav.flatMap((s) => s.items);

  // Scroll-driven: observe sections in the content area
  useEffect(() => {
    const ctx = gsap.context(() => {
      allItems.forEach((item) => {
        const el = sectionRefs.current[item.slug];
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 40%',
          end: 'bottom 40%',
          onEnter: () => setActiveSlug(item.slug),
          onEnterBack: () => setActiveSlug(item.slug),
        });
      });
    });
    return () => ctx.revert();
  }, []);

  const activeContent = docsContent[activeSlug];

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-[240px_1fr] gap-10">
          {/* Sidebar nav — sticky, highlights on scroll */}
          <nav className="hidden lg:block" aria-label="Documentation">
            <div className="sticky top-24 space-y-6 h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-20 custom-scrollbar">
              {docsNav.map((section) => (
                <div key={section.title}>
                  <h4 className="text-[10px] font-display font-bold text-faint uppercase tracking-[0.1em] mb-2 px-3">
                    {section.title}
                  </h4>
                  <ul className="space-y-px">
                    {section.items.map((item) => (
                      <li key={item.slug}>
                        <button
                          onClick={() => {
                            setActiveSlug(item.slug);
                            sectionRefs.current[item.slug]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`relative w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                            activeSlug === item.slug
                              ? 'text-text bg-primary/[0.06]'
                              : 'text-muted hover:text-text hover:bg-white/[0.03]'
                          }`}
                        >
                          {activeSlug === item.slug && (
                            <motion.div
                              layoutId="docs-indicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-primary rounded-full"
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* Mobile dropdown */}
          <div className="lg:hidden mb-4">
            <select
              value={activeSlug}
              onChange={(e) => setActiveSlug(e.target.value)}
              className="w-full bg-surface-2 border border-white/[0.06] rounded-lg px-4 py-3 text-[13px] text-text font-body"
            >
              {allItems.map((item) => (
                <option key={item.slug} value={item.slug}>{item.label}</option>
              ))}
            </select>
          </div>

          {/* Content — all sections rendered, scroll triggers activate sidebar */}
          <div className="space-y-16 min-w-0">
            {allItems.map((item) => {
              const content = docsContent[item.slug];
              return (
                <motion.section
                  key={item.slug}
                  ref={(el) => (sectionRefs.current[item.slug] = el)}
                  className="scroll-mt-24"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-text mb-4 tracking-tight">
                    {item.label}
                  </h2>

                  {/* Image if available */}
                  {content?.image && (
                    <div className="rounded-xl overflow-hidden border border-white/[0.06] mb-6 group">
                      <img src={content.image} alt={item.label} className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]" />
                    </div>
                  )}

                  <div className="glass p-6 sm:p-8 space-y-4">
                    <p className="text-[14px] text-muted leading-relaxed font-body">
                      {content?.body || `Documentation for "${item.label}" — this section covers the core concepts and usage patterns. Full content is rendered from MDX in production.`}
                    </p>

                    {content?.code && (
                      <pre className="bg-bg/60 rounded-lg p-4 text-[12px] text-muted font-mono overflow-x-auto border border-white/[0.04] leading-relaxed">
                        {content.code}
                      </pre>
                    )}

                    {!content && (
                      <div className="space-y-3">
                        <h3 className="text-[15px] font-display font-semibold text-text">Key Concepts</h3>
                        <ul className="space-y-2 text-[13px] text-muted font-body">
                          <li className="flex items-start gap-2"><span className="text-teal mt-0.5">&#x2022;</span> Structured token catalogs for every design dimension</li>
                          <li className="flex items-start gap-2"><span className="text-teal mt-0.5">&#x2022;</span> Automatic detection and classification of UI patterns</li>
                          <li className="flex items-start gap-2"><span className="text-teal mt-0.5">&#x2022;</span> LLM-optimized JSON output for Claude and GPT</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>
      </div>
      <CTASection />
    </div>
  );
}
