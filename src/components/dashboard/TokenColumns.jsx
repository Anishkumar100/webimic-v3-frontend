import { motion } from 'framer-motion';

export default function TokenColumns({ tokens }) {
  const columns = [
    { label: 'Colors', count: tokens.colors, color: '#7C6FFF', items: ['Primary', 'Secondary', 'Background', 'Surface', 'Text', 'Muted', 'Border', 'Accent'] },
    { label: 'Typography', count: tokens.typography, color: '#00D5BD', items: ['Display', 'Heading 1', 'Heading 2', 'Body', 'Small', 'Caption', 'Code', 'Label'] },
    { label: 'Spacing', count: tokens.spacing, color: '#5B8CFF', items: ['4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px'] },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {columns.map((col, ci) => (
        <motion.div
          key={col.label}
          className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)] p-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ci * 0.08, duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-[13px] font-display font-semibold text-text">{col.label}</span>
            </div>
            <span className="text-[11px] text-faint">{col.count} tokens</span>
          </div>
          <div className="space-y-1">
            {col.items.slice(0, Math.min(col.count, 8)).map((item, i) => (
              <motion.div
                key={item}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.02)] text-[12px]"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: ci * 0.08 + i * 0.02 }}
              >
                <span className="text-muted">{item}</span>
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: col.color, opacity: 0.4 }} />
              </motion.div>
            ))}
            {col.count > 8 && (
              <p className="text-[11px] text-faint text-center mt-1.5">+{col.count - 8} more</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
