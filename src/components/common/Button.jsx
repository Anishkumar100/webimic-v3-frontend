import { motion } from 'framer-motion';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[10px] font-display font-semibold text-[13px] bg-danger/8 text-danger border border-danger/15 transition-all duration-300 hover:bg-danger/15',
  outline: 'btn-secondary',
};

export default function Button({ children, variant = 'primary', className = '', href, onClick, disabled, icon: Icon, ...props }) {
  const classes = `${variants[variant] || variants.primary} ${disabled ? 'opacity-40 pointer-events-none' : ''} ${className}`;

  const motionProps = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.97 },
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  };

  if (href) {
    return (
      <motion.a href={href} className={classes} {...motionProps} {...props}>
        {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button onClick={onClick} className={classes} disabled={disabled} {...motionProps} {...props}>
      {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />}
      {children}
    </motion.button>
  );
}
