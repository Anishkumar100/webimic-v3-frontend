import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuthStore } from '../../store/useAuthStore';
import HeroPulse from './HeroPulse';
import { heroAurora, gridTexture, heroVideo, dashboardOverview, heroComposite } from '../../assets/index';
import { ArrowRight, Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HeroPinned() {
  const sectionRef = useRef(null);
  const videoFrameRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const headlineOpacity = useTransform(scrollYProgress, [0.1, 0.35], [1, 0]);
  const headlineY = useTransform(scrollYProgress, [0.1, 0.35], [0, -80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const user = useAuthStore((s) => s.user);
  const ctaTo = user ? '/app' : '/auth';

  /* GSAP scroll-triggered video reveal */
  useEffect(() => {
    if (!videoFrameRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(videoFrameRef.current,
        { y: 200, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: videoFrameRef.current,
            start: 'top 90%',
            end: 'top 40%',
            scrub: 1,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ── Background ──────────────────────────── */}
        <motion.div className="absolute inset-0 z-0" style={{ scale: bgScale }}>
          {heroAurora && (
            <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${heroAurora})` }} />
          )}
          {gridTexture && (
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url(${gridTexture})`, backgroundSize: '200px', backgroundRepeat: 'repeat' }} />
          )}
          {/* Vignette */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, transparent 30%, #000005 100%)' }} />
        </motion.div>

        {/* ── Headline + CTA ──────────────────────── */}
        <motion.div
          className="relative z-20 flex flex-col items-center justify-center h-[100vh] min-h-[800px] px-4 sm:px-6 pt-24 sm:pt-32"
          style={{ opacity: headlineOpacity, y: headlineY }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-[13px] font-display font-medium text-white mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(124,111,255,0.2)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(124,111,255,0.15)' }}
          >
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" /> AI-Powered Design Intelligence
          </motion.div>

          <motion.h1
            className="text-center text-[4rem] sm:text-hero-md lg:text-hero font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/30 max-w-5xl tracking-tighter leading-[0.95]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            Reverse-engineer{' '}
            <br className="hidden sm:block" />
            any website UI
          </motion.h1>

          <motion.p
            className="text-center text-lg sm:text-xl md:text-2xl text-muted max-w-2xl mt-8 mb-10 font-body leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Extract design tokens, typography, color systems, and motion patterns.
            Export LLM-ready PDF specs for instant production code.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
          >
            <motion.a
              href={ctaTo}
              className="w-full sm:w-auto relative group overflow-hidden rounded-full bg-white text-black px-8 py-4 flex items-center justify-center gap-2 font-display font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(124,111,255,0.5)] transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                {user ? 'Open Dashboard' : 'Get Started'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-teal to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
              <span className="absolute z-10 inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-display font-bold text-lg">
                {user ? 'Open Dashboard' : 'Get Started'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.a>
            <motion.a
              href="/how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center gap-2 font-display font-bold text-white hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Demo
            </motion.a>
          </motion.div>
        </motion.div>

        {/* ── Scroll indicator ────────────────────── */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 1.5 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center p-1">
            <motion.div 
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{ y: [0, 16, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Video frame (scroll-revealed, FIXED below fold) ── */}
      <div className="relative z-10 mt-[20vh] px-2 sm:px-6 lg:px-8 pb-32 perspective-[2000px]">
        <motion.div 
          ref={videoFrameRef} 
          className="max-w-5xl mx-auto relative group"
          whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Godly blue background glow */}
          <div className="absolute inset-[-10%] bg-gradient-to-b from-primary/30 to-teal/10 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10" />

          <div className="browser-frame shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-white/10 bg-[#06060e] overflow-hidden rounded-2xl ring-1 ring-white/10 relative z-10">
            <div className="browser-chrome bg-black/50 backdrop-blur-xl border-b border-white/5 py-4 px-5">
              <div className="browser-dot bg-[#ff5f57] w-3 h-3" />
              <div className="browser-dot bg-[#ffbd2e] w-3 h-3" />
              <div className="browser-dot bg-[#28c840] w-3 h-3" />
              <div className="flex-1 flex justify-center">
                <div className="bg-white/5 border border-white/5 rounded-lg px-4 py-1.5 text-[12px] text-faint font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal animate-pulse" /> app.webimic.com
                </div>
              </div>
            </div>
            <div className="relative">
              {heroVideo ? (
                <video
                  src={heroVideo}
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="w-full h-auto block"
                  aria-label="Webimic reverse-engineering demo"
                />
              ) : (
                <img
                  src={dashboardOverview || heroComposite}
                  alt="Webimic Dashboard"
                  className="w-full h-auto block"
                />
              )}
              {/* Highlight sweep effect on video */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
