import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function KpiStat({ value, label, suffix = '', prefix = '', duration = 2000, className = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    const target = typeof value === 'number' ? value : parseInt(value, 10);
    if (isNaN(target)) { setCount(value); return; }

    let start = 0;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(target * eased);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <motion.div
      ref={ref}
      className={`glass-card p-5 text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-3xl font-display font-bold text-text mb-1">
        {prefix}{typeof value === 'number' ? count.toLocaleString() : count}{suffix}
      </p>
      <p className="text-sm text-muted">{label}</p>
    </motion.div>
  );
}
