import { useRef, useEffect } from 'react';
import gsap from 'gsap';

/**
 * Huly-style pulsing concentric rings behind the hero.
 * Multiple rings expand outward and fade, creating a living "heartbeat" glow.
 */
export default function HeroPulse() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rings = containerRef.current.querySelectorAll('.pulse-r');
      rings.forEach((ring, i) => {
        gsap.fromTo(ring,
          { scale: 0.3, opacity: 0.5 },
          {
            scale: 2.8,
            opacity: 0,
            duration: 5,
            delay: i * 1.2,
            repeat: -1,
            ease: 'power2.out',
          }
        );
      });

      // Central orb glow
      const orb = containerRef.current.querySelector('.pulse-orb');
      if (orb) {
        gsap.to(orb, {
          scale: 1.15,
          opacity: 0.7,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Concentric pulse rings */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="pulse-r absolute rounded-full border border-primary/20"
          style={{
            width: '300px',
            height: '300px',
          }}
        />
      ))}

      {/* Central glowing orb */}
      <div
        className="pulse-orb absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(124,111,255,0.15) 0%, rgba(124,111,255,0.03) 50%, transparent 70%)',
        }}
      />

      {/* Static ambient gradient layers */}
      <div
        className="absolute"
        style={{
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,111,255,0.04) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute"
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,213,189,0.03) 0%, transparent 60%)',
          transform: 'translate(80px, -40px)',
        }}
      />
    </div>
  );
}
