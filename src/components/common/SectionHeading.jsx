import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function SectionHeading({ tag, title, description, align = 'center' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''} mb-16 lg:mb-20`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {tag && (
        <motion.span
          className="tag mb-4 inline-block"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {tag}
        </motion.span>
      )}
      <h2 className="text-section-sm sm:text-section font-display font-bold text-text mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-[15px] sm:text-base text-muted leading-relaxed font-body">{description}</p>
      )}
    </motion.div>
  );
}
