'use client';

import { useRef } from 'react';
import { process } from '@/lib/content';
import { gsap, ScrollTrigger, useGsap, MQ } from '@/lib/motion';
import { Img } from './Img';

/** Five steps on a vertical LED strip that lights up as you scroll; each step switches on when the light reaches it. */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo('.steps__led i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
      gsap.from('.process .sec-head > *', { autoAlpha: 0, y: 40, stagger: 0.1, scrollTrigger: { trigger: '.process', start: 'top 75%', once: true } });
    });
    gsap.utils.toArray<HTMLElement>('.step').forEach((el) => {
      // Lit from the moment the strip reaches it, until you scroll back above it.
      ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'max', toggleClass: 'is-lit' });
    });
  });

  return (
    <section ref={root} className="process" aria-labelledby="proc-title">
      <div className="sec-head wrap">
        <p className="eyebrow">05 — Process</p>
        <h2 id="proc-title" className="h2">
          Five steps.
          <br />
          <em>No shortcuts.</em>
        </h2>
      </div>
      <ol className="steps wrap">
        <span className="steps__led" aria-hidden="true">
          <i />
        </span>
        {process.map((p) => (
          <li key={p.n} className="step">
            <span className="step__n">{p.n}</span>
            <div className="step__body">
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
            <div className="step__img">
              <Img image={p.image} alt="" sizes="(min-width: 1024px) 26vw, 80vw" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
