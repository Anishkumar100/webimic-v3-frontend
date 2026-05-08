import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { ArrowRight, Menu, X, Sparkles } from 'lucide-react';

const navLinks = [
  { label: 'How It Works', to: '/how-it-works' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Docs', to: '/docs' },
  { label: 'Changelog', to: '/changelog' },
];

export default function Navbar() {
  const { isNavOpen, toggleNav, closeNav } = useUIStore();
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > 50) {
      setScrolled(true);
      if (latest > previous && latest > 150) {
        setHidden(true); // Hide on scroll down
      } else {
        setHidden(false); // Show on scroll up
      }
    } else {
      setScrolled(false);
      setHidden(false);
    }
  });

  useEffect(() => { closeNav(); }, [location.pathname, closeNav]);

  if (isAppRoute) return null;

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none"
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: '-100%', opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div 
          className={`pointer-events-auto flex items-center justify-between w-full max-w-5xl rounded-2xl transition-all duration-500 ease-out ${
            scrolled 
              ? 'bg-[#06060e]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] px-3 sm:px-5 py-3' 
              : 'bg-transparent border border-transparent px-1 sm:px-4 py-4'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative whitespace-nowrap" aria-label="Webimic Home">
            <motion.div
              className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shadow-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Spinning background gradient */}
              <motion.div 
                className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#7C6FFF_360deg)] opacity-70"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-[2px] rounded-[10px] bg-[#0a0a18] z-10 flex items-center justify-center bg-gradient-to-br from-[#0a0a18] to-primary/10">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-teal font-display font-black text-[16px]">W</span>
              </div>
            </motion.div>
            <div className="flex flex-col overflow-hidden h-[20px]">
              <motion.div 
                className="flex flex-col justify-start font-display font-bold text-[16px] text-text tracking-tight leading-tight"
                initial={{ y: 0 }}
                whileHover={{ y: -20 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="h-[20px] flex items-center">Webimic</span>
                <span className="h-[20px] flex items-center text-primary">Webimic</span>
              </motion.div>
            </div>
          </Link>

          {/* Desktop links - Hidden in App Route */}
          {!isAppRoute && (
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.04]">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative px-4 py-2 text-[13px] font-medium rounded-lg group overflow-hidden"
                  >
                    <span className={`relative z-10 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-muted group-hover:text-white'
                    }`}>
                      {link.label}
                    </span>
                    
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-white/[0.08] rounded-lg"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Hover effect */}
                    {!isActive && (
                      <motion.div 
                        className="absolute inset-0 bg-primary/20 translate-y-[100%] rounded-lg group-hover:translate-y-0 transition-transform duration-300 ease-out" 
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Desktop CTA / Profile - Adapts based on route */}
          <div className="hidden lg:flex items-center gap-4">
            {!isAppRoute ? (
              <>
                <Link to="/app" className="text-[13px] font-medium text-muted hover:text-white transition-colors relative group">
                  Dashboard
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/app" className="relative group overflow-hidden rounded-xl bg-white text-black px-5 py-2.5 flex items-center gap-2 font-semibold text-[13px] shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow">
                    <span className="relative z-10 flex items-center gap-1.5 font-display tracking-wide">
                      Start Mimicking <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-teal to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
                    <span className="absolute z-10 inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-display tracking-wide">
                      Start Mimicking <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-faint font-mono px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">App Mode</span>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <motion.button
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 border border-white/10 rounded-xl z-50 relative overflow-hidden group"
            onClick={toggleNav}
            whileTap={{ scale: 0.9 }}
          >
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div
              animate={{ rotate: isNavOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              {isNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.div>
          </motion.button>
        </div>
      </motion.header>

      {/* Full-page mobile menu with circular reveal */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            className="fixed inset-0 z-[90] bg-[#06060e] flex flex-col justify-center overflow-hidden"
            initial={{ clipPath: "circle(0% at 100% 0%)" }}
            animate={{ clipPath: "circle(150% at 100% 0%)" }}
            exit={{ clipPath: "circle(0% at 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Ambient background glows for mobile menu */}
            <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-teal/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none" />

            <div className="px-6 space-y-6 relative z-10 w-full max-w-sm mx-auto">
              {!isAppRoute && navLinks.map((link, i) => (
                <div key={link.to} className="overflow-hidden py-1">
                  <motion.div
                    initial={{ y: "100%", rotate: 5 }}
                    animate={{ y: 0, rotate: 0 }}
                    exit={{ y: "100%", rotate: 5 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to={link.to}
                      className="block text-4xl sm:text-5xl font-display font-black tracking-tight text-white/70 hover:text-white hover:translate-x-4 transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
              
              {!isAppRoute && (
                <div className="overflow-hidden mt-12 pt-8 border-t border-white/10">
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link to="/app" className="flex items-center justify-between w-full p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-teal/20 border border-white/10 group relative overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-primary/40 to-teal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="text-xl font-display font-bold text-white flex items-center gap-3 relative z-10">
                        <Sparkles className="w-6 h-6 text-teal" /> Dashboard
                      </span>
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center group-hover:scale-110 group-hover:rotate-[-45deg] transition-all duration-300 relative z-10">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </Link>
                  </motion.div>
                </div>
              )}
              
              {isAppRoute && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Sparkles className="w-12 h-12 text-primary mb-6 animate-pulse" />
                  <h3 className="text-3xl font-display font-bold text-white mb-2">App Mode Active</h3>
                  <p className="text-muted">Use the sidebar to navigate.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
