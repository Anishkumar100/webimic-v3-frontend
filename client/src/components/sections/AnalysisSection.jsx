import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import { anatomicalTeardown, colorKmeans, animationsMotion } from '../../assets/index';

gsap.registerPlugin(ScrollTrigger);

const analyses = [
  {
    image: anatomicalTeardown,
    title: 'Anatomical Teardown',
    description: 'Layer-by-layer decomposition of UI components — headers, cards, modals, forms — with bounding boxes and hierarchy mapping.',
  },
  {
    image: colorKmeans,
    title: 'K-Means Color Clustering',
    description: 'Intelligent color palette extraction using K-means clustering. Groups similar hues, calculates contrast ratios, and maps to semantic roles.',
  },
  {
    image: animationsMotion,
    title: 'Animation & Motion Analysis',
    description: 'Catalogs CSS transitions, keyframe animations, scroll-triggered effects, and hover states into a structured motion spec.',
  },
];

export default function AnalysisSection() {
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(card,
          { y: 50, opacity: 0, rotateX: 8 },
          {
            y: 0, opacity: 1, rotateX: 0,
            duration: 0.8,
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
    <SectionShell id="analysis" className="glow-teal">
      <SectionHeading
        tag="Deep Analysis"
        title="Three engines, one comprehensive audit"
        description="Webimic's analysis pipeline runs three specialized engines simultaneously for maximum coverage."
      />

      <div className="space-y-8 sm:space-y-12 lg:space-y-16">
        {analyses.map((a, i) => {
          const isReversed = i % 2 === 1;
          return (
            <div key={a.title} ref={(el) => (cardsRef.current[i] = el)}>
              <div className="glow-card group block">
                <div className="glow-card-inner bg-[#0a0a18] p-4 sm:p-6 lg:p-8 rounded-xl border border-white/5 transition-colors">
                  <div
                    className={`grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}
                    style={{ perspective: '1000px' }}
                  >
                    {/* Full landscape image with extreme 3D hover */}
                    <div className={`relative perspective-[1000px] ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
                      <div className="absolute inset-[-5%] bg-gradient-to-br from-primary/20 to-teal/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />
                      <motion.div
                        className="rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/10"
                        whileHover={{ rotateY: isReversed ? 3 : -3, rotateX: 3, scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <img
                          src={a.image}
                          alt={a.title}
                          className="w-full h-auto"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </motion.div>
                    </div>

                    {/* Description */}
                    <div className={`space-y-4 ${isReversed ? 'lg:[direction:ltr]' : ''}`}>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-1.5 h-10 rounded-full bg-gradient-to-b from-primary to-teal shadow-[0_0_15px_rgba(124,111,255,0.5)] group-hover:shadow-[0_0_25px_rgba(0,213,189,0.7)] transition-shadow duration-300" />
                        <h3 className="text-xl sm:text-2xl font-display font-bold text-text group-hover:text-white transition-colors">{a.title}</h3>
                      </div>
                      <p className="text-[15px] sm:text-[16px] text-muted leading-relaxed font-body group-hover:text-white/80 transition-colors pl-5">{a.description}</p>
                    </div>
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
