import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuthStore } from '../../store/useAuthStore';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import {
  internalTeamsPanel, devTeamsPanel, agenciesPanel,
  internalTeamsIcon, devTeamsIcon, agenciesIcon,
} from '../../assets/index';

gsap.registerPlugin(ScrollTrigger);

const audiences = [
  {
    icon: internalTeamsIcon,
    panel: internalTeamsPanel,
    title: 'Internal Teams',
    description: 'Speed up design-to-dev handoff with structured specs. No more guessing colors or spacing from Figma inspections.',
  },
  {
    icon: devTeamsIcon,
    panel: devTeamsPanel,
    title: 'Design-Driven Dev Teams',
    description: 'Extract exact design tokens from any live product. Build pixel-perfect implementations with zero ambiguity.',
  },
  {
    icon: agenciesIcon,
    panel: agenciesPanel,
    title: 'Agencies & Freelancers',
    description: 'Reverse-engineer competitor UIs for client pitches. Deliver professional design audits in minutes, not days.',
  },
];

export default function AudienceSection() {
  const cardsRef = useRef([]);
  const user = useAuthStore((s) => s.user);
  const ctaTo = user ? '/app' : '/auth';

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8,
            delay: i * 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <SectionShell id="audiences" className="glow-teal">
      <SectionHeading
        tag="Who It's For"
        title="Built for builders who care about design"
        description="Whether you're an internal team, a dev shop, or a freelancer — Webimic gives you the structured design data you need."
      />

      <div className="space-y-8 lg:space-y-16 px-4 sm:px-0">
        {/* Background ambient orbs */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-teal/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {audiences.map((aud, i) => {
          const isReversed = i % 2 === 1;
          return (
            <div
              key={aud.title}
              ref={(el) => (cardsRef.current[i] = el)}
              className="glow-card group block"
            >
              <div className="glow-card-inner bg-[#0a0a18]/90 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-xl border border-white/5 transition-colors">
                <div className={`grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-14 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
                  {/* Text + icon */}
                  <div className={`space-y-5 ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
                    {aud.icon && (
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_30px_rgba(124,111,255,0.3)] transition-shadow duration-500"
                        whileHover={{ rotate: 12, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <img src={aud.icon} alt="" className="w-full h-full object-cover" />
                      </motion.div>
                    )}
                    <h3 className="text-2xl sm:text-3xl font-display font-bold text-text tracking-tight group-hover:text-white transition-colors">{aud.title}</h3>
                    <p className="text-[16px] text-muted leading-relaxed font-body max-w-md group-hover:text-white/80 transition-colors">{aud.description}</p>
                    <motion.a
                      href={ctaTo}
                      className="inline-flex items-center gap-2 text-[14px] font-bold text-primary hover:text-teal transition-colors"
                      whileHover={{ x: 6 }}
                    >
                      {user ? 'Go to dashboard' : 'Get started'}
                      <svg className="w-5 h-5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </motion.a>
                  </div>

                  {/* Full-size panel image with 3D hover */}
                  <div className={`relative perspective-[1000px] ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
                    <div className="absolute inset-[-5%] bg-gradient-to-br from-primary/20 to-teal/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
                    <motion.div
                      className="rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-white/10"
                      whileHover={{ rotateY: isReversed ? 4 : -4, rotateX: 4, scale: 1.02 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <img
                        src={aud.panel}
                        alt={`${aud.title} blueprint`}
                        className="w-full h-auto block"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
