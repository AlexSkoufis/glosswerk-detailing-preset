'use client';

import { useRef, useState } from 'react';
import { results } from '@/lib/content';
import { gsap, useGsap, MQ } from '@/lib/motion';
import { Img } from './Img';

/**
 * Before/after comparison. The "before" is the same photo with a simulated neglected finish
 * (dulled, hazed, dusty) — clearly labelled as such. Drag the handle or use the arrow keys.
 */
export default function Results() {
  const root = useRef<HTMLElement>(null);
  const [tab, setTab] = useState(0);
  const [pos, setPos] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const r = results[tab];

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from('.results .sec-head > *', { autoAlpha: 0, y: 40, stagger: 0.1, scrollTrigger: { trigger: '.results', start: 'top 75%', once: true } });
      // Sweep the handle once when it first comes into view, to show it moves.
      const o = { p: 50 };
      gsap.timeline({ scrollTrigger: { trigger: '.compare', start: 'top 70%', once: true } })
        .to(o, { p: 18, duration: 0.9, ease: 'power2.inOut', onUpdate: () => setPos(o.p) })
        .to(o, { p: 80, duration: 1.1, ease: 'power2.inOut', onUpdate: () => setPos(o.p) })
        .to(o, { p: 50, duration: 0.8, ease: 'power2.inOut', onUpdate: () => setPos(o.p) });
    });
  });

  const drag = (e: React.PointerEvent) => {
    if (!frame.current || (e.type === 'pointermove' && !e.buttons)) return;
    const b = frame.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((e.clientX - b.left) / b.width) * 100)));
  };

  return (
    <section id="results" ref={root} className="results" aria-labelledby="res-title">
      <div className="sec-head sec-head--row wrap">
        <div>
          <p className="eyebrow">04 — Results</p>
          <h2 id="res-title" className="h2">
            Slide from <em>tired</em>
            <br />
            to finished.
          </h2>
        </div>
        <div className="tabs" role="tablist" aria-label="Result">
          {results.map((x, i) => (
            <button key={x.id} type="button" role="tab" aria-selected={tab === i} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wrap">
        <div
          ref={frame}
          className="compare"
          style={{ ['--p' as string]: `${pos}%` }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            drag(e);
          }}
          onPointerMove={drag}
        >
          <div className="compare__after" key={`a-${r.id}`}>
            <Img image={r.image} alt={`After: ${r.caption}`} sizes="(min-width: 1400px) 1300px, 100vw" />
          </div>
          <div className="compare__before" key={`b-${r.id}`} aria-hidden="true">
            <Img image={r.image} alt="" sizes="(min-width: 1400px) 1300px, 100vw" />
            <span className="compare__grime" />
          </div>
          <span className="compare__tag compare__tag--b">Before · simulated</span>
          <span className="compare__tag compare__tag--a">After</span>
          <span className="compare__handle" aria-hidden="true">
            <i>‹ ›</i>
          </span>
          <input
            className="compare__range"
            type="range"
            min={0}
            max={100}
            value={Math.round(pos)}
            onChange={(e) => setPos(+e.target.value)}
            aria-label="Before and after comparison: share of the image showing the before state"
          />
        </div>
        <p className="compare__cap">{r.caption}</p>
      </div>
    </section>
  );
}
