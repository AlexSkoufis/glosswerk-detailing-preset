'use client';

import { useRef } from 'react';
import { statement, stats } from '@/lib/content';
import { gsap, SplitText, useGsap, MQ } from '@/lib/motion';
import { Img } from './Img';

/** Statement lit by a moving highlight as you scroll, over a tall photo; then counters. */
export default function Statement() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const split = SplitText.create('.statement__text', { type: 'words' });
      gsap.fromTo(split.words, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '.statement__text', start: 'top 80%', end: 'bottom 50%', scrub: true } });
      gsap.fromTo('.statement__photo img', { yPercent: -10, scale: 1.15 }, { yPercent: 10, scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.statement__photo', start: 'top bottom', end: 'bottom top', scrub: true } });
      return () => split.revert();
    });
    // Counters run in both modes (reduced motion: instant).
    const reduced = window.matchMedia(MQ.reduced).matches;
    gsap.utils.toArray<HTMLElement>('.stat__v b').forEach((b) => {
      const to = Number(b.dataset.v);
      const dec = Number(b.dataset.d ?? 0);
      const o = { v: 0 };
      if (!reduced) b.textContent = '0';
      gsap.to(o, {
        v: to,
        duration: reduced ? 0 : 2,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true },
        onUpdate: () => (b.textContent = o.v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })),
      });
    });
  });

  return (
    <section ref={root} className="statement" aria-labelledby="statement-text">
      <div className="statement__grid wrap">
        <p id="statement-text" className="statement__text">
          {statement}
        </p>
        <div className="statement__photo">
          <Img image="polish" alt="A detailer machine-polishing the wing of a black car" sizes="(min-width: 1024px) 34vw, 90vw" />
        </div>
      </div>
      <dl className="stats wrap">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <dt className="stat__v">
              <b data-v={s.value} data-d={s.decimals ?? 0}>
                {s.value.toLocaleString('en-US', { minimumFractionDigits: s.decimals ?? 0 })}
              </b>
              {s.suffix}
            </dt>
            <dd>{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
