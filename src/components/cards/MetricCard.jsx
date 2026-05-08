import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function MetricCard({ label, value, change, icon: Icon, index = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className="p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)]
        hover:border-[rgba(124,111,255,0.12)] transition-all duration-300"
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-muted">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-faint" strokeWidth={1.5} />}
      </div>
      <p className="text-xl font-display font-bold text-text">{value}</p>
      {change !== undefined && change !== null && (
        <p className={`text-[11px] mt-1.5 font-medium ${change > 0 ? 'text-teal' : change < 0 ? 'text-danger' : 'text-muted'}`}>
          {change > 0 ? '+' : ''}{change}% vs last month
        </p>
      )}
    </motion.div>
  );
}
