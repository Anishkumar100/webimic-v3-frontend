import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import { missionPanel, reverseEngVis } from '../../assets/index';
import { Scan, BarChart3, BrainCircuit } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const points = [
  { Icon: Scan, title: 'Capture & Crawl', text: 'Submit any URL and watch Webimic crawl, capture, and dissect every visual element automatically.' },
  { Icon: BarChart3, title: 'Extract & Structure', text: 'Output structured spec documents — the exact design system behind any UI, organized into tokens.' },
  { Icon: BrainCircuit, title: 'Generate & Ship', text: 'Feed specs directly into LLMs for instant production-ready React/Tailwind code generation.' },
];

export default function MissionSection() {
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(imgRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.5,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: imgRef.current, start: 'top 80%', end: 'top 30%', scrub: 1 },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SectionShell id="mission" className="glow-violet">
      <SectionHeading
        tag="Our Mission"
        title="Decode the visual web"
        description="Webimic reverse-engineers any live website into structured design tokens — colors, typography, spacing, motion — so you can learn from, replicate, or improve upon any UI."
      />

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="space-y-4">
          {points.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.12 }}
            >
              <div className="glow-card group block">
                <div className="glow-card-inner flex flex-col sm:flex-row items-start gap-4 p-5 sm:p-6 bg-[#0a0a18] rounded-xl border border-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/[0.08] border border-primary/[0.1] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <item.Icon className="w-6 h-6 text-primary group-hover:text-teal transition-colors" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[16px] sm:text-[18px] font-display font-bold text-text mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-[14px] sm:text-[15px] text-muted leading-relaxed font-body group-hover:text-white/80 transition-colors">{item.text}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Full-size image with GSAP clipPath reveal and godly glow */}
        <div className="relative perspective-[1000px]">
          {/* Intense background aura */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-teal/20 to-primary/30 blur-[80px] opacity-60 rounded-full pointer-events-none -z-10 animate-pulse-ring" />
          
          <motion.div 
            ref={imgRef} 
            className="relative rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
            whileHover={{ rotateY: -5, rotateX: 5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <img
              src={missionPanel || reverseEngVis}
              alt="Webimic pipeline — URL to structured design tokens"
              className="w-full h-auto rounded-2xl block"
            />
            {/* Overlay shine on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </SectionShell>
  );
}
