import { motion } from 'framer-motion';

export default function DocCard({ label, title, image, description, isActive = false, onClick, index = 0 }) {
  return (
    <motion.button
      onClick={onClick}
      className={`text-left w-full rounded-card p-5 border transition-all duration-300 ${
        isActive
          ? 'bg-primary-soft border-primary-border shadow-glow'
          : 'glass-card hover:border-primary-border/50'
      }`}
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {image && (
        <img src={image} alt={title} className="w-full h-32 object-cover rounded-chip mb-3" loading="lazy" />
      )}
      {label && (
        <span className={`text-xs font-medium uppercase tracking-wider mb-1 block ${isActive ? 'text-primary' : 'text-muted'}`}>
          {label}
        </span>
      )}
      <h4 className="font-display font-semibold text-sm text-text">{title}</h4>
      {description && <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>}
    </motion.button>
  );
}
