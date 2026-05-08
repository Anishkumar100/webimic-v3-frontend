import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SectionShell from '../layout/SectionShell';
import SectionHeading from '../common/SectionHeading';
import { systemArchitecture, workerCluster, phasesTimeline, scaffoldingEditor } from '../../assets/index';

gsap.registerPlugin(ScrollTrigger);

const details = [
  { image: workerCluster, title: 'Worker Cluster', desc: 'Auto-scaling from 2 to 16 headless browser instances based on queue depth and priority.' },
  { image: phasesTimeline, title: 'Pipeline Phases', desc: 'Five distinct stages with checkpointing, retry logic, and real-time progress tracking.' },
  { image: scaffoldingEditor, title: 'Instant Scaffolding', desc: 'Generated specs plug directly into VS Code, Cursor, or any editor for immediate use.' },
];

export default function ArchitectureSection() {
  const mainRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (mainRef.current) {
        gsap.fromTo(mainRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1,
            scrollTrigger: { trigger: mainRef.current, start: 'top 80%', toggleActions: 'play none none none' },
          }
        );
      }
      nodesRef.current.forEach((node, i) => {
        if (!node) return;
        gsap.to(node, {
          scale: 1.6, opacity: 0,
          duration: 2.5,
          repeat: -1,
          delay: i * 0.8,
          ease: 'power2.out',
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <SectionShell id="architecture" className="glow-teal">
      <SectionHeading
        tag="Under the Hood"
        title="Scalable, production-grade architecture"
        description="Built to process thousands of jobs concurrently with auto-scaling workers and fault-tolerant pipeline stages."
      />

      {/* Main architecture diagram — full width with extreme 3D hover */}
      <div className="relative perspective-[1500px] mb-12">
        <div className="absolute inset-[-5%] bg-gradient-to-tr from-teal/20 via-primary/10 to-teal/20 blur-[80px] opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10 animate-pulse-ring-delay" />
        
        <motion.div 
          ref={mainRef} 
          className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group"
          whileHover={{ rotateX: 3, rotateY: 3, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <img src={systemArchitecture} alt="Webimic scalable system architecture" className="w-full h-auto block" />
          
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

          {/* GSAP animated pulse nodes — upgraded for extreme glow */}
          <div className="absolute inset-0 pointer-events-none">
            {[
              { top: '22%', left: '18%', color: '#00D5BD' },
              { top: '40%', left: '52%', color: '#7C6FFF' },
              { top: '58%', left: '76%', color: '#00D5BD' },
              { top: '48%', left: '34%', color: '#7C6FFF' },
            ].map((pos, i) => (
              <div
                key={i}
                ref={(el) => (nodesRef.current[i] = el)}
                className="absolute w-4 h-4 rounded-full mix-blend-screen"
                style={{ top: pos.top, left: pos.left, backgroundColor: pos.color, boxShadow: `0 0 20px ${pos.color}` }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detail cards — full landscape images wrapped in GlowCard */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {details.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="glow-card block h-full">
              <div className="glow-card-inner bg-[#0a0a18] rounded-xl overflow-hidden border border-white/5 group h-full flex flex-col">
                <div className="overflow-hidden">
                  <img src={card.image} alt={card.title} className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.05]" loading="lazy" />
                </div>
                <div className="p-5 sm:p-6 flex-1 bg-gradient-to-b from-transparent to-black/40">
                  <h3 className="text-[16px] sm:text-[18px] font-display font-bold text-text mb-2 group-hover:text-teal transition-colors">{card.title}</h3>
                  <p className="text-[13px] sm:text-[14px] text-muted leading-relaxed font-body group-hover:text-white/80 transition-colors">{card.desc}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionShell>
  );
}
