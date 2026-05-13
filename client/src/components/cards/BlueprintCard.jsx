import { motion } from 'framer-motion';

export default function BlueprintCard({ image, title, description, index = 0, className = '' }) {
  return (
    <motion.div
      className={`rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)] group
        hover:border-[rgba(124,111,255,0.12)] transition-all duration-400 ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
    >
      {image && (
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title || 'Blueprint diagram'}
            className="w-full h-48 md:h-52 object-cover object-top transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07070f] via-transparent to-transparent opacity-70" />
        </div>
      )}
      {(title || description) && (
        <div className="p-5">
          {title && <h3 className="text-[13px] font-display font-semibold text-text mb-1">{title}</h3>}
          {description && <p className="text-[12px] text-muted leading-relaxed">{description}</p>}
        </div>
      )}
    </motion.div>
  );
}
