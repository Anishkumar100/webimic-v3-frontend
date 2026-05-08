import { motion } from 'framer-motion';
import { Palette, Type, Maximize } from 'lucide-react';
import GlowCard from '../components/effects/GlowCard';

const mockColors = [
  { hex: '#000005', role: 'Background', contrast: 'AAA' },
  { hex: '#7C6FFF', role: 'Primary', contrast: 'AA' },
  { hex: '#00D5BD', role: 'Teal Accent', contrast: 'AA' },
  { hex: '#FFFFFF', role: 'Text High', contrast: 'AAA' },
  { hex: '#8A8F98', role: 'Text Muted', contrast: 'AA' },
  { hex: '#FF5F57', role: 'Danger', contrast: 'AA' },
];

export default function TokenCatalogs() {
  return (
    <div className="pt-20 px-5 sm:px-6 lg:px-8 pb-12 max-w-[1100px] mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-display font-bold text-text">Global Token Catalogs</h1>
        </div>
        <p className="text-[13px] text-muted font-body">Aggregated design tokens extracted from all your recent jobs.</p>
      </motion.div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Palette className="w-4 h-4 text-primary" />
            <h2 className="text-[14px] font-display font-bold text-text uppercase tracking-wider">Color Primitives</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {mockColors.map((color, i) => (
              <GlowCard key={color.hex} className="p-3 group">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center text-center"
                >
                  <div 
                    className="w-full aspect-square rounded-lg mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-105 transition-transform duration-300" 
                    style={{ backgroundColor: color.hex }} 
                  />
                  <span className="text-[12px] font-bold text-text font-mono tracking-wide">{color.hex}</span>
                  <span className="text-[10px] text-muted font-display mt-0.5 mb-2">{color.role}</span>
                  <span className="text-[9px] text-faint border border-white/10 rounded px-1.5 py-0.5">{color.contrast} Contrast</span>
                </motion.div>
              </GlowCard>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Type className="w-4 h-4 text-teal" />
              <h2 className="text-[14px] font-display font-bold text-text uppercase tracking-wider">Typography Hierarchy</h2>
            </div>
            <GlowCard className="p-6 space-y-5">
              {[
                { label: 'Display', size: '64px', weight: '900', font: 'Inter', sample: 'Hero Headline' },
                { label: 'Heading 1', size: '48px', weight: '700', font: 'Inter', sample: 'Section Title' },
                { label: 'Body', size: '16px', weight: '400', font: 'Roboto', sample: 'Regular paragraph text used for content.' },
              ].map((t, i) => (
                <motion.div key={t.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[11px] font-mono text-muted">{t.label} • {t.font}</span>
                    <span className="text-[10px] font-mono text-faint">{t.size} / {t.weight}</span>
                  </div>
                  <div className="text-text border-b border-white/[0.04] pb-4" style={{ fontSize: t.size, fontWeight: t.weight, lineHeight: 1.1 }}>
                    {t.sample}
                  </div>
                </motion.div>
              ))}
            </GlowCard>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 px-1">
              <Maximize className="w-4 h-4 text-info" />
              <h2 className="text-[14px] font-display font-bold text-text uppercase tracking-wider">Spacing Variables</h2>
            </div>
            <GlowCard className="p-6">
              <div className="space-y-4">
                {[
                  { name: 'sp-1', val: '4px' },
                  { name: 'sp-2', val: '8px' },
                  { name: 'sp-3', val: '12px' },
                  { name: 'sp-4', val: '16px' },
                  { name: 'sp-6', val: '24px' },
                  { name: 'sp-8', val: '32px' },
                ].map((sp, i) => (
                  <motion.div key={sp.name} className="flex items-center gap-4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                    <div className="w-12 text-[11px] font-mono text-muted">{sp.name}</div>
                    <div className="w-12 text-[11px] font-mono text-faint">{sp.val}</div>
                    <div className="flex-1 bg-white/[0.02] rounded-full h-4 overflow-hidden border border-white/[0.05]">
                      <div className="h-full bg-info/40" style={{ width: sp.val }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlowCard>
          </section>
        </div>
      </div>
    </div>
  );
}
