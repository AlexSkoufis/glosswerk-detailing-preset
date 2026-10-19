'use client';

import { useRef } from 'react';
import { services } from '@/lib/content';
import { gsap, useGsap, MQ } from '@/lib/motion';
import { Img } from './Img';
import { go } from './Nav';

/** Services as a bento of cards; a soft spotlight follows the pointer across each one. */
export default function Services() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from('.services .sec-head > *', { autoAlpha: 0, y: 40, stagger: 0.1, scrollTrigger: { trigger: '.services', start: 'top 75%', once: true } });
      gsap.from('.svc', { autoAlpha: 0, y: 70, stagger: 0.08, duration: 1.3, scrollTrigger: { trigger: '.svc-grid', start: 'top 82%', once: true } });
    });
  });

  const spot = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section id="services" ref={root} className="services" aria-labelledby="svc-title">
      <div className="sec-head wrap">
        <p className="eyebrow">03 — Services</p>
        <h2 id="svc-title" className="h2">
          Everything the car
          <br />
          <em>deserves.</em>
        </h2>
      </div>
      <ul className="svc-grid wrap">
        {services.map((s, i) => (
          <li key={s.title} className={`svc${s.size ? ` svc--${s.size}` : ''}`} onPointerMove={spot}>
            <Img image={s.image} alt="" sizes="(min-width: 1024px) 50vw, 100vw" className="svc__img" />
            <div className="svc__body">
              <span className="svc__n">0{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <p className="svc__meta">
                <span>
                  From <b>{s.from}</b>
                </span>
                <span>{s.time}</span>
              </p>
            </div>
            <a href="#quote" className="svc__link" onClick={go('#quote')} aria-label={`Quote for ${s.title}`} />
          </li>
        ))}
      </ul>
    </section>
  );
}
