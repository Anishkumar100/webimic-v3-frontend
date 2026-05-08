import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import HeroPinned from '../components/hero/HeroPinned';
import MissionSection from '../components/sections/MissionSection';
import VisualToDataSection from '../components/sections/VisualToDataSection';
import AudienceSection from '../components/sections/AudienceSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import OutputEngineSection from '../components/sections/OutputEngineSection';
import AnalysisSection from '../components/sections/AnalysisSection';
import ArchitectureSection from '../components/sections/ArchitectureSection';
import UIGallerySection from '../components/sections/UIGallerySection';
import CTASection from '../components/sections/CTASection';
import SectionShell from '../components/layout/SectionShell';
import SectionHeading from '../components/common/SectionHeading';
import { pricingPlans } from '../data/pricingPlans';

gsap.registerPlugin(ScrollTrigger);

function PricingMiniCard({ plan, i }) {
  const hl = plan.highlighted;
  return (
    <motion.div
      className={`relative flex flex-col rounded-xl p-6 border transition-all duration-400 ${
        hl ? 'bg-primary/[0.04] border-primary/[0.18] shadow-glow' : 'bg-surface border-white/[0.06] hover:border-white/[0.1]'
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {plan.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><span className="tag text-[10px]">{plan.badge}</span></div>}
      <h3 className="font-display font-bold text-base text-text mb-1">{plan.name}</h3>
      <p className="text-[12px] text-muted mb-4 font-body">{plan.description}</p>
      <div className="mb-4">
        {plan.price !== null ? (
          <span className="text-2xl font-display font-black text-text">${plan.price}<span className="text-[12px] text-muted font-body"> {plan.period}</span></span>
        ) : (
          <span className="text-2xl font-display font-black text-gradient">Custom</span>
        )}
      </div>
      <motion.a href="/pricing" className={hl ? 'btn-primary w-full justify-center text-[12px] mb-6' : 'btn-secondary w-full justify-center text-[12px] mb-6'} whileHover={{ scale: 1.02 }}>
        {plan.cta}
      </motion.a>
      
      <ul className="space-y-2.5 flex-1 mt-2 border-t border-white/[0.04] pt-4">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[12px] font-body">
            <svg className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-muted">{f}</span>
          </li>
        ))}
        {plan.limits && plan.limits.length > 0 && plan.limits.map((l) => (
          <li key={l} className="flex items-start gap-2.5 text-[12px] font-body">
            <svg className="w-4 h-4 text-faint flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <span className="text-faint">{l}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function Landing() {
  const ctaRef = useRef(null);

  useEffect(() => {
    if (!ctaRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ctaRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <HeroPinned />
      <MissionSection />
      <VisualToDataSection />
      <AudienceSection />
      <HowItWorksSection />
      <OutputEngineSection />
      <AnalysisSection />
      <ArchitectureSection />
      <UIGallerySection />

      {/* Pricing preview */}
      <SectionShell id="pricing-preview" className="glow-violet">
        <SectionHeading
          tag="Pricing"
          title="Simple, transparent pricing"
          description="Start free. Scale when you're ready."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <PricingMiniCard key={plan.id} plan={plan} i={i} />
          ))}
        </div>
      </SectionShell>

      <CTASection />
    </>
  );
}
