import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const ctaRef = useRef(null);
  const user = useAuthStore((s) => s.user);
  const ctaTo = user ? '/app' : '/auth';

  useEffect(() => {
    if (!ctaRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ctaRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8,
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative py-32 sm:py-40 px-5 overflow-hidden">
      {/* Ambient pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-primary/[0.15]"
            style={{
              width: '300px', height: '300px',
              animation: `pulse-ring-expand 5s cubic-bezier(0.16,1,0.3,1) infinite ${i * 1.5}s`,
            }}
          />
        ))}
        {/* Massive intense glow */}
        <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-primary/30 to-teal/20 blur-[100px] animate-pulse-ring" />
      </div>

      <div ref={ctaRef} className="relative z-10 text-center max-w-2xl mx-auto">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/60 mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Ready to decode<br />the visual web?
        </h2>
        <p className="text-[16px] sm:text-[18px] text-white/70 mb-10 leading-relaxed font-body max-w-xl mx-auto">
          Join thousands of developers and designers using Webimic to reverse-engineer,
          learn from, and build upon the world's best UIs.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a
            href={ctaTo}
            className="btn-primary text-base px-8 py-4 shadow-[0_0_40px_rgba(124,111,255,0.4)] hover:shadow-[0_0_60px_rgba(124,111,255,0.6)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            {user ? 'Open Dashboard' : 'Get Started — Free'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.a>
          <motion.a 
            href="/docs" 
            className="btn-secondary px-8 py-4 border-white/10 hover:bg-white/10" 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.96 }}
          >
            Read the Docs
          </motion.a>
        </div>
      </div>
    </section>
  );
}
