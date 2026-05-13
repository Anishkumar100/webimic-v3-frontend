import { motion } from 'framer-motion';
import { Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function IconButton({ children, onClick, label, className = '', ...props }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.03)] text-muted border border-[rgba(255,255,255,0.06)]
        transition-all duration-200 hover:text-text hover:border-[rgba(124,111,255,0.15)] hover:bg-[rgba(124,111,255,0.06)] ${className}`}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
