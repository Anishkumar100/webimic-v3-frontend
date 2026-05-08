import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionShell from '../components/layout/SectionShell';
import SectionHeading from '../components/common/SectionHeading';
import CTASection from '../components/sections/CTASection';
import { changelogMock } from '../data/changelogMock';
import { phasesTimeline } from '../assets/index';

gsap.registerPlugin(ScrollTrigger);

const badgeColors = {
  primary: 'bg-primary/[0.08] text-primary border-primary/[0.12]',
  teal: 'bg-teal/[0.08] text-teal border-teal/[0.12]',
  danger: 'bg-danger/[0.08] text-danger border-danger/[0.12]',
  warning: 'bg-warning/[0.08] text-warning border-warning/[0.12]',
};

export default function Changelog() {
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!timelineRef.current) return;
    const ctx = gsap.context(() => {
      const entries = timelineRef.current.querySelectorAll('.cl-entry');
      entries.forEach((entry, i) => {
        gsap.fromTo(entry,
          { x: -30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.6,
            delay: i * 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: entry, start: 'top 85%', toggleActions: 'play none none none' },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="pt-24">
      <SectionShell id="changelog">
        <SectionHeading
          tag="Changelog"
          title="What's new in Webimic"
          description="Every update, feature, and fix — documented."
        />

        {phasesTimeline && (
          <motion.div
            className="rounded-xl overflow-hidden border border-white/[0.06] mb-14 opacity-60 hover:opacity-100 transition-opacity duration-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
          >
            <img src={phasesTimeline} alt="Release phases timeline" className="w-full h-auto" />
          </motion.div>
        )}

        <div className="max-w-3xl mx-auto">
          <div className="relative" ref={timelineRef}>
            {/* Timeline line with pulse */}
            <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-white/[0.04] to-transparent" />
            <div className="absolute left-[14px] top-0 w-[3px] h-8 bg-primary rounded-full animate-pulse" />

            <div className="space-y-6">
              {changelogMock.map((entry, i) => {
                const badgeClass = badgeColors[entry.labelColor] || badgeColors.feature;
                return (
                  <div key={entry.id} className="cl-entry relative pl-10">
                    {/* Dot */}
                    <div className="absolute left-[10px] top-3 w-[11px] h-[11px] rounded-full bg-surface border-2 border-primary" />

                    <motion.div
                      className="glass p-5 hover:border-white/[0.08] transition-all duration-300 group"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}>
                          {entry.label}
                        </span>
                        <span className="text-[11px] font-mono text-faint">{entry.version}</span>
                        <span className="text-[11px] text-faint ml-auto">{entry.date}</span>
                      </div>
                      <h3 className="text-[14px] font-display font-bold text-text mb-1 group-hover:text-primary transition-colors">{entry.title}</h3>
                      <p className="text-[13px] text-muted leading-relaxed font-body">{entry.description}</p>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionShell>
      <CTASection />
    </div>
  );
}
