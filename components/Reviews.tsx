'use client';

import { useRef } from 'react';
import { brand, reviews } from '@/lib/content';
import { gsap, useGsap, MQ } from '@/lib/motion';

export default function Reviews() {
  const root = useRef<HTMLElement>(null);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from('.review', { autoAlpha: 0, y: 60, rotate: (i) => (i % 2 ? 2 : -2), stagger: 0.1, duration: 1.3, scrollTrigger: { trigger: '.review-grid', start: 'top 82%', once: true } });
    });
  });

  return (
    <section ref={root} className="reviews" aria-labelledby="rev-title">
      <div className="sec-head sec-head--row wrap">
        <div>
          <p className="eyebrow">07 — Owners</p>
          <h2 id="rev-title" className="h2">
            Handed back <em>speechless.</em>
          </h2>
        </div>
        <p className="reviews__score">
          <b>{brand.rating}</b>
          <span>
            <span className="stars" aria-hidden="true">
              ★★★★★
            </span>
            {brand.reviews}
          </span>
        </p>
      </div>
      <ul className="review-grid wrap">
        {reviews.map((r) => (
          <li key={r.name} className="review">
            <span className="stars" aria-label="5 out of 5 stars">
              ★★★★★
            </span>
            <blockquote>“{r.text}”</blockquote>
            <p>
              <b>{r.name}</b>
              <span>{r.car}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
