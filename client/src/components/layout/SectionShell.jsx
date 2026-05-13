import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function SectionShell({ children, id, className = '', noPad = false }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      id={id}
      ref={ref}
      className={`relative ${noPad ? '' : 'py-24 sm:py-32 lg:py-40 px-5 sm:px-6 lg:px-8'} ${className}`}
    >
      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </section>
  );
}
