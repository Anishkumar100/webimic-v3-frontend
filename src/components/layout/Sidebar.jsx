import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { Zap, GitBranch, Palette, FileText, Settings, PanelLeftClose, PanelLeft, Globe, Menu, X } from 'lucide-react';

const sidebarItems = [
  { label: 'Website', to: '/', icon: Globe, end: true },
  { label: 'Jobs', to: '/app', icon: Zap, end: true },
  { label: 'Pipelines', to: '/app/pipelines', icon: GitBranch },
  { label: 'Token Catalogs', to: '/app/tokens', icon: Palette },
  { label: 'Docs', to: '/docs', icon: FileText },
  { label: 'Settings', to: '/app/settings', icon: Settings },
];

export default function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:flex fixed left-4 top-24 bottom-4 z-40 flex-col bg-[#06060e]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden"
        animate={{ width: isSidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        aria-label="App sidebar"
      >
        {/* Ambient background glow inside sidebar */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 blur-[40px] pointer-events-none" />

        <div className="flex-1 py-4 px-3 overflow-y-auto relative z-10 no-scrollbar">
          <nav className="space-y-1.5">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className="relative block"
                >
                  {({ isActive }) => (
                    <motion.div
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-colors duration-300 group overflow-hidden ${
                        isActive ? 'text-white' : 'text-muted hover:text-white'
                      }`}
                      whileHover={{ x: isActive ? 0 : 4 }}
                    >
                      {/* Active Pill Background */}
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-pill"
                          className="absolute inset-0 bg-primary/15 border border-primary/30 rounded-xl shadow-[0_0_20px_rgba(124,111,255,0.15)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}

                      {/* Hover Pill Background */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                      )}

                      <div className="relative z-10 flex items-center justify-center w-6 h-6">
                        <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(124,111,255,0.8)]' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2 : 1.5} />
                      </div>

                      <AnimatePresence>
                        {!isSidebarCollapsed && (
                          <motion.span
                            className="relative z-10 truncate font-display tracking-wide"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="px-3 py-3 border-t border-white/[0.04] relative z-10 bg-black/20">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] text-muted hover:text-white hover:bg-white/5 transition-colors font-body group"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
            ) : (
              <PanelLeftClose className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div
              className="px-4 py-4 border-t border-white/[0.04] flex items-center gap-3 relative z-10 bg-black/40"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-[11px] font-black text-white shadow-[0_0_15px_rgba(0,213,189,0.4)] ring-2 ring-white/10">TW</div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-white truncate leading-tight font-display">TheWebytes</p>
                <p className="text-[11px] text-teal truncate leading-tight font-mono mt-0.5">Pro Plan</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[9999] w-10 h-10 flex items-center justify-center bg-[#06060e]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9990] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              className="fixed top-0 left-0 bottom-0 w-[280px] z-[9995] bg-[#06060e] border-r border-white/[0.08] flex flex-col lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Ambient glow */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-primary/10 blur-[40px] pointer-events-none" />

              <div className="flex items-center justify-between p-6 border-b border-white/[0.04]">
                <span className="font-display font-bold text-lg text-text">Webimic</span>
                <button onClick={() => setIsMobileOpen(false)} className="text-muted hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) => `
                        relative group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-display text-[14px]
                        ${isActive ? 'text-white font-bold' : 'text-muted hover:text-white hover:bg-white/5'}
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.div layoutId="mobile-sidebar-pill" className="absolute inset-0 bg-primary/15 border border-primary/30 rounded-xl shadow-[0_0_15px_rgba(124,111,255,0.2)]" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                          )}
                          <Icon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? 'text-primary scale-110' : 'text-muted group-hover:text-white'}`} strokeWidth={isActive ? 2 : 1.5} />
                          <span className="relative z-10">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/[0.04]">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-[10px] font-black text-white">TW</div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-white truncate">TheWebytes</p>
                    <p className="text-[10px] text-teal truncate">Pro Plan</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
