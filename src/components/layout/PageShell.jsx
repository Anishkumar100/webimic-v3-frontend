import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Lightning from '../effects/Lightning';
import { useUIStore } from '../../store/useUIStore';
import { heroAurora, gridTexture } from '../../assets/index';

export default function PageShell({ children }) {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');
  const { isSidebarCollapsed } = useUIStore();

  return (
    <div className="relative min-h-screen">
      {/* Layer 0: Base dark background */}
      <div className="fixed inset-0 z-0 bg-[#000005]" />

      {/* Layer 1: Gradient background */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        {heroAurora && (
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${heroAurora})` }} />
        )}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 80% 60% at 30% 10%, rgba(124,111,255,0.05) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 75% 90%, rgba(0,213,189,0.03) 0%, transparent 60%)
          `
        }} />
        {gridTexture ? (
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `url(${gridTexture})`, backgroundSize: '200px', backgroundRepeat: 'repeat' }} />
        ) : (
          <div className="absolute inset-0 bg-grid" />
        )}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, #000005 100%)' }} />
      </div>

      {/* Layer 2: Lightning effect — ABOVE gradient, on all non-dashboard pages */}
      {!isAppRoute && (
        <div className="fixed inset-0 z-[2] pointer-events-none" style={{ mixBlendMode: 'screen' }}>
          <Lightning
            hue={220}
            xOffset={0}
            speed={0.8}
            intensity={1.8}
            size={1.2}
          />
        </div>
      )}

      {/* Navigation */}
      <Navbar />
      {isAppRoute && <Sidebar />}

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          className={`relative z-10 ${isAppRoute ? `pb-[88px] lg:pb-0 ${isSidebarCollapsed ? 'lg:ml-[96px]' : 'lg:ml-[280px]'}` : ''} transition-[margin] duration-300`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="main"
        >
          {children}
          {!isAppRoute && <Footer />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
