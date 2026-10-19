'use client';

import { useRef } from 'react';
import { marquee } from '@/lib/content';
import { gsap, ScrollTrigger, useGsap, MQ } from '@/lib/motion';

/** A chrome ticker that runs constantly, speeds up and leans with scroll velocity, and reverses with direction. */
export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const loop = gsap.to('.marquee__track', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
      const skew = gsap.quickTo('.marquee__track', 'skewX', { duration: 0.5, ease: 'power3.out' });
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity();
          loop.timeScale(gsap.utils.clamp(-6, 6, (self.direction || 1) * (1 + Math.abs(v) / 400)));
          skew(gsap.utils.clamp(-12, 12, v / -300));
          gsap.to(loop, { timeScale: self.direction || 1, duration: 1.2, overwrite: true, delay: 0.1 });
        },
      });
    });
  });

  const items = [...marquee, ...marquee];
  return (
    <div ref={root} className="marquee" aria-label="Services">
      <div className="marquee__track">
        {items.map((m, i) => (
          <span key={i} aria-hidden={i >= marquee.length}>
            {m}
            <i aria-hidden="true">✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
