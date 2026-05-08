import { useRef, useEffect } from 'react';

/**
 * Wraps children in a card with a glowing circuit-pulse border on hover.
 * Uses a conic-gradient that rotates on hover via CSS animation.
 */
export default function GlowCard({ children, className = '', as = 'div', glowColor = 'rgba(124,111,255,0.4)', ...props }) {
  const cardRef = useRef(null);
  const Tag = as;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glow-x', `${x}%`);
      card.style.setProperty('--glow-y', `${y}%`);
    };

    card.addEventListener('mousemove', handleMove);
    return () => card.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <Tag
      ref={cardRef}
      className={`glow-card ${className}`}
      style={{
        '--glow-color': glowColor,
        position: 'relative',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
      {...props}
    >
      {/* Glow border layer */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--glow-x, 50%) var(--glow-y, 50%), var(--glow-color), transparent 40%)`,
          zIndex: 0,
        }}
      />
      {/* Inner bg */}
      <div className="absolute inset-px rounded-[13px] bg-surface z-[1]" />
      {/* Content */}
      <div className="relative z-[2]">{children}</div>
    </Tag>
  );
}
