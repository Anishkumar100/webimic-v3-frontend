import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import { visualToData } from '../../assets/index';

gsap.registerPlugin(ScrollTrigger);

const tokens = [
  { label: 'Colors', count: '24–48 tokens', desc: 'K-means clustered palette with contrast ratios and semantic mapping', color: '#7C6FFF' },
  { label: 'Typography', count: '12–20 tokens', desc: 'Complete font stacks, sizes, weights, line heights, and letter-spacing', color: '#00D5BD' },
  { label: 'Spacing', count: '30–50 tokens', desc: 'Margin, padding, and gap patterns mapped onto a consistent 4px grid', color: '#5B8CFF' },
  { label: 'Motion', count: '5–15 patterns', desc: 'CSS transitions, keyframe animations, scroll triggers, and hover states', color: '#F5A623' },
];

export default function VisualToDataSection() {
  const imgRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    if (!imgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 1,
          scrollTrigger: { trigger: imgRef.current, start: 'top 80%', end: 'top 40%', scrub: 1 },
        }
      );
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        gsap.fromTo(bar,
          { scaleX: 0 },
          {
            scaleX: 1, duration: 0.8,
            scrollTrigger: { trigger: bar, start: 'top 90%', toggleActions: 'play none none none' },
            delay: i * 0.1,
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <SectionShell id="visual-to-data" className="glow-teal">
      <SectionHeading
        tag="The Conversion"
        title="From pixels to structured tokens"
        description="Webimic's analysis engine deconstructs visual UIs into machine-readable design tokens across four dimensions."
      />

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Full-size image with godly 3D hover glow */}
        <div className="relative perspective-[1000px] order-2 lg:order-1">
          {/* Intense background aura */}
          <div className="absolute inset-[-10%] bg-gradient-to-br from-teal/30 via-primary/20 to-teal/10 blur-[80px] opacity-60 rounded-full pointer-events-none -z-10 animate-pulse-ring-delay" />
          
          <motion.div 
            ref={imgRef} 
            className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
            whileHover={{ rotateY: 5, rotateX: 5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img src={visualToData} alt="Visual to structured data pipeline" className="w-full h-auto rounded-2xl block" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        </div>

        {/* Token breakdown using GlowCards */}
        <div className="space-y-4 order-1 lg:order-2">
          {tokens.map((token, i) => (
            <motion.div
              key={token.label}
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
            >
              <div className="glow-card group block">
                <div className="glow-card-inner p-5 sm:p-6 bg-[#0a0a18] rounded-xl border border-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-[0_0_15px_currentColor] group-hover:scale-125 transition-transform duration-300" style={{ backgroundColor: token.color, color: token.color }} />
                      <span className="text-[16px] sm:text-[18px] font-display font-bold text-text group-hover:text-white transition-colors">{token.label}</span>
                    </div>
                    <span className="text-[12px] sm:text-[13px] text-faint font-mono px-3 py-1 bg-white/5 rounded-full border border-white/10">{token.count}</span>
                  </div>
                  <p className="text-[14px] sm:text-[15px] text-muted leading-relaxed font-body ml-7 group-hover:text-white/80 transition-colors">{token.desc}</p>
                  
                  {/* Animated bar */}
                  <div className="ml-7 mt-4 h-[3px] rounded-full bg-white/[0.03] overflow-hidden relative">
                    <div
                      ref={(el) => (barsRef.current[i] = el)}
                      className="absolute left-0 top-0 bottom-0 rounded-full shadow-[0_0_10px_currentColor]"
                      style={{ backgroundColor: token.color, color: token.color, opacity: 0.8, width: `${60 + i * 10}%`, transform: 'scaleX(0)', transformOrigin: 'left' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
