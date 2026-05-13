import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { Search, BarChart3, FileText, BrainCircuit, Shield, Moon, Zap, Lock } from 'lucide-react';
import SectionShell from '../components/layout/SectionShell';
import SectionHeading from '../components/common/SectionHeading';
import CTASection from '../components/sections/CTASection';
import { pricingPlans } from '../data/pricingPlans';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: Search, title: 'URL Analysis', description: 'Submit any live URL for instant analysis.' },
  { icon: BarChart3, title: 'Token Catalogs', description: 'Colors, typography, spacing — structured and organized.' },
  { icon: FileText, title: 'PDF Reports', description: 'Image-rich, print-ready PDF documents.' },
  { icon: BrainCircuit, title: 'LLM-Ready', description: 'JSON metadata optimized for Claude and GPT.' },
  { icon: Shield, title: 'WCAG Audit', description: 'Automatic accessibility compliance checks.' },
  { icon: Moon, title: 'Dark Mode Gen', description: 'Auto-generated dark mode variants.' },
  { icon: Zap, title: 'Fast Pipeline', description: 'Results in under 2 minutes.' },
  { icon: Lock, title: 'Secure', description: 'SOC 2 compliant. Data deleted after 30 days.' },
];

const faqs = [
  { q: 'Can I try Webimic for free?', a: 'Yes! The Starter plan gives you 3 free jobs per month, forever. No credit card required.' },
  { q: 'What happens when I hit my job limit?', a: 'You can upgrade to Pro for unlimited jobs, or wait until your monthly limit resets.' },
  { q: 'Do you offer refunds?', a: 'Yes — we offer a 14-day money-back guarantee on Pro plans.' },
  { q: 'Can I use the API on the free plan?', a: 'API access is available on Pro and Enterprise plans. Starter is dashboard-only.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, and Enterprise plans can be invoiced.' },
];

function PricingCard({ plan, index }) {
  const cardRef = useRef(null);
  const hl = plan.highlighted;

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7,
          delay: index * 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: cardRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });
    return () => ctx.revert();
  }, [index]);

  return (
    <motion.div
      ref={cardRef}
      className={`relative flex flex-col rounded-xl p-6 sm:p-7 border transition-all duration-400 ${
        hl
          ? 'bg-primary/[0.04] border-primary/[0.18] shadow-glow-lg'
          : 'bg-surface border-white/[0.06] hover:border-white/[0.1]'
      }`}
      whileHover={{ y: -5 }}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="tag text-[10px]">{plan.badge}</span>
        </div>
      )}

      <h3 className="font-display font-bold text-lg text-text mb-1">{plan.name}</h3>
      <p className="text-[13px] text-muted mb-6 font-body">{plan.description}</p>

      <div className="mb-6">
        {plan.price !== null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-display font-black text-text">${plan.price}</span>
            <span className="text-[13px] text-muted font-body">{plan.period}</span>
          </div>
        ) : (
          <span className="text-4xl font-display font-black text-gradient">Custom</span>
        )}
      </div>

      <motion.button
        className={`${hl ? 'btn-primary' : 'btn-secondary'} w-full justify-center mb-7`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {plan.cta}
      </motion.button>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px] font-body">
            <svg className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="text-muted">{f}</span>
          </li>
        ))}
        {plan.limits && plan.limits.length > 0 && plan.limits.map((l) => (
          <li key={l} className="flex items-start gap-2.5 text-[13px] font-body">
            <svg className="w-4 h-4 text-faint flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            <span className="text-faint">{l}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function Pricing() {
  return (
    <div className="pt-24">
      <SectionShell id="pricing-hero">
        <SectionHeading
          tag="Pricing"
          title="Simple pricing, powerful results"
          description="Start free. Upgrade when your team needs more power."
        />
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-20">
          {pricingPlans.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="all-features" className="glow-violet">
        <SectionHeading tag="Everything Included" title="Features across all plans" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                className="p-5 rounded-xl border border-white/[0.05] bg-surface hover:border-primary/[0.12] hover:bg-white/[0.015] transition-all duration-400 group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                whileHover={{ y: -3 }}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/[0.08] border border-primary/[0.1] flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-[13px] font-display font-bold text-text mb-1">{f.title}</h3>
                <p className="text-[12px] text-muted leading-relaxed font-body">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </SectionShell>

      <SectionShell id="faq">
        <SectionHeading tag="FAQ" title="Frequently asked questions" />
        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, i) => (
            <motion.details
              key={i}
              className="rounded-xl border border-white/[0.06] bg-surface group"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <summary className="px-5 py-4 cursor-pointer text-[14px] font-display font-semibold text-text flex items-center justify-between list-none select-none">
                {faq.q}
                <span className="text-faint text-sm group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <div className="px-5 pb-5 text-[13px] text-muted leading-relaxed font-body">{faq.a}</div>
            </motion.details>
          ))}
        </div>
      </SectionShell>

      <CTASection />
    </div>
  );
}
