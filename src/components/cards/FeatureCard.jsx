import { motion } from 'framer-motion';

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      className="p-5 rounded-xl border border-[rgba(255,255,255,0.05)] bg-[rgba(10,10,18,0.3)] hover:border-[rgba(124,111,255,0.12)] hover:bg-[rgba(255,255,255,0.02)] transition-all duration-400 group"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-[rgba(124,111,255,0.08)] border border-[rgba(124,111,255,0.1)] flex items-center justify-center mb-3.5">
          {typeof Icon === 'function' ? <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} /> : <span className="text-sm">{Icon}</span>}
        </div>
      )}
      <h3 className="text-[13px] font-display font-semibold text-text mb-1.5">{title}</h3>
      <p className="text-[12px] text-muted leading-relaxed">{description}</p>
    </motion.div>
  );
}
