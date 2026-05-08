import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function VideoFrame({ src, poster, className = '', alt = 'Video preview' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={`relative rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] group ${className}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Hover glow */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/[0.08] via-transparent to-teal/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Chrome bar */}
      <div className="flex items-center gap-1.5 px-3.5 py-2 bg-[rgba(0,0,0,0.4)] border-b border-[rgba(255,255,255,0.04)] relative z-10">
        <span className="w-2 h-2 rounded-full bg-[#ff5f57]/60" />
        <span className="w-2 h-2 rounded-full bg-[#ffbd2e]/60" />
        <span className="w-2 h-2 rounded-full bg-[#28c840]/60" />
      </div>

      <video
        src={src}
        poster={poster}
        loop
        muted
        autoPlay
        playsInline
        className="w-full h-full object-cover relative z-10"
        aria-label={alt}
      />

      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-t from-bg/20 via-transparent to-transparent" />
    </motion.div>
  );
}
