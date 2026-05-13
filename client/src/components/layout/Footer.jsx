import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles, Code, MessageSquare, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', to: '/how-it-works' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Changelog', to: '/changelog' },
      { label: 'Dashboard', to: '/app' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/docs' },
      { label: 'API Reference', to: '/docs' },
      { label: 'Guides', to: '/docs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
];

export default function Footer() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.8, 1]);
  const user = useAuthStore((s) => s.user);
  const ctaTo = user ? '/app' : '/auth';

  return (
    <footer ref={containerRef} className="relative mt-32 bg-[#030308] overflow-hidden pt-24 pb-10 rounded-t-[40px] sm:rounded-t-[80px] border-t border-white/[0.04]">
      {/* Animated background rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-40"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(124,111,255,0.4) 0%, transparent 70%)'
          }}
        />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
      </div>

      <motion.div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10" style={{ y, opacity }}>
        
        {/* Massive CTA */}
        <div className="flex flex-col items-center text-center mb-32 relative">
          {/* Decorative floating elements */}
          <motion.div 
            className="absolute top-10 left-[10%] w-24 h-24 rounded-full bg-primary/20 blur-2xl"
            animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-10 right-[10%] w-32 h-32 rounded-full bg-teal/20 blur-3xl"
            animate={{ y: [0, 30, 0], scale: [1, 1.5, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />

          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-[13px] font-display font-medium text-teal mb-8 backdrop-blur-md"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <Sparkles className="w-4 h-4" /> Start building today
          </motion.div>
          
          <h2 className="text-5xl sm:text-7xl md:text-[100px] font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 tracking-tighter mb-10 leading-[0.9]">
            Ready to <br/> reverse-engineer?
          </h2>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to={ctaTo} className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-[2px] bg-gradient-to-r from-primary via-teal to-primary background-animate shadow-[0_0_40px_rgba(124,111,255,0.3)]">
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-teal to-primary animate-[spin_4s_linear_infinite] opacity-80 blur-md" />
              <div className="relative inline-flex items-center gap-3 px-8 py-4 sm:px-10 sm:py-5 bg-[#06060e] rounded-full transition-all duration-300 group-hover:bg-transparent">
                <span className="text-white font-display font-bold text-lg sm:text-xl tracking-wide">{user ? 'Go to Dashboard' : 'Get Started for Free'}</span>
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 py-16 border-t border-white/[0.06]">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-4 mb-8 group w-fit">
              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-primary to-teal flex items-center justify-center shadow-[0_0_20px_rgba(124,111,255,0.4)] group-hover:shadow-[0_0_40px_rgba(0,213,189,0.5)] transition-shadow duration-500 relative overflow-hidden">
                 <motion.div 
                  className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(255,255,255,0.5)_360deg)] opacity-50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-[2px] rounded-[12px] bg-[#0a0a18] z-10 flex items-center justify-center bg-gradient-to-br from-[#0a0a18] to-primary/20">
                  <span className="text-white font-display font-black text-[18px]">W</span>
                </div>
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">Webimic</span>
            </Link>
            <p className="text-[15px] text-muted leading-relaxed font-body max-w-sm mb-8">
              AI-powered reverse-engineering of website UIs into structured design data and LLM-ready specs.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-display font-bold text-white uppercase tracking-widest mb-8">{col.title}</h4>
              <ul className="space-y-5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.label === 'Dashboard' && !user ? '/auth' : link.to} className="group flex items-center text-[15px] text-muted hover:text-white transition-colors font-body relative w-fit">
                      <span className="relative z-10">{link.label}</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-teal transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/[0.04]">
          <p className="text-[13px] text-faint font-body">&copy; {new Date().getFullYear()} TheWebytes. All rights reserved.</p>
          
          <div className="flex items-center gap-3">
            {[
              { icon: X, href: '#', label: 'X' },
              { icon: Code, href: '#', label: 'GitHub' },
              { icon: MessageSquare, href: '#', label: 'Discord' },
            ].map((item) => (
              <motion.a
                key={item.label}
                href={item.href}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/[0.05] text-muted hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15] transition-all shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(124,111,255,0.2)]"
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={item.label}
              >
                <item.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
        
        {/* Massive background text */}
        <div className="absolute bottom-[-5%] left-0 right-0 pointer-events-none overflow-hidden flex justify-center opacity-[0.03] select-none z-0">
          <span className="text-[20vw] font-display font-black leading-none text-white whitespace-nowrap">
            WEBIMIC
          </span>
        </div>
      </motion.div>
    </footer>
  );
}
