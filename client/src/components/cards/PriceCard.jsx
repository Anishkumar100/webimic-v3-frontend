import { motion } from 'framer-motion';

export default function PriceCard({ plan, index = 0 }) {
  const hl = plan.highlighted;

  return (
    <motion.div
      className={`relative flex flex-col rounded-xl p-6 md:p-7 border transition-all duration-400 ${
        hl
          ? 'bg-[rgba(124,111,255,0.04)] border-[rgba(124,111,255,0.18)] shadow-[0_0_60px_rgba(124,111,255,0.06)]'
          : 'bg-[rgba(10,10,18,0.4)] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]'
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
            {plan.badge}
          </span>
        </div>
      )}

      <h3 className="font-display font-bold text-lg text-text mb-1">{plan.name}</h3>
      <p className="text-[13px] text-muted mb-5">{plan.description}</p>

      <div className="mb-5">
        {plan.price !== null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-display font-bold text-text">${plan.price}</span>
            <span className="text-[13px] text-muted">{plan.period}</span>
          </div>
        ) : (
          <span className="text-3xl font-display font-bold text-gradient-primary">Custom</span>
        )}
      </div>

      <motion.button
        className={hl ? 'btn-primary w-full justify-center mb-6' : 'btn-secondary w-full justify-center mb-6'}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {plan.cta}
      </motion.button>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[12px]">
            <svg className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-muted">{f}</span>
          </li>
        ))}
        {plan.limits?.map((l) => (
          <li key={l} className="flex items-start gap-2.5 text-[12px]">
            <svg className="w-3.5 h-3.5 text-faint flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span className="text-faint">{l}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
