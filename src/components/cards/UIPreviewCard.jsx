import { motion } from 'framer-motion';

export default function UIPreviewCard({ image, title, index = 0 }) {
  return (
    <motion.div
      className="flex-shrink-0 w-80 md:w-[380px] snap-center group"
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,18,0.4)]
          hover:border-[rgba(124,111,255,0.15)] transition-all duration-400"
        whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      >
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-primary/[0.06] via-transparent to-teal/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md pointer-events-none" />
        <img src={image} alt={title || 'Webimic UI'} className="w-full h-auto relative z-10" loading="lazy" />
      </motion.div>
      {title && <p className="mt-2.5 text-[12px] text-faint text-center">{title}</p>}
    </motion.div>
  );
}
