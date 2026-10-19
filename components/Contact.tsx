'use client';

import { useRef, useState } from 'react';
import { brand, faq } from '@/lib/content';
import { gsap, useGsap, MQ } from '@/lib/motion';
import { Img } from './Img';

/** Book a free paint inspection, studio details and FAQ, over a dark studio photo. */
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo('.contact__bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true } });
      gsap.from('.inspect-card, .faq', { autoAlpha: 0, y: 50, stagger: 0.12, duration: 1.2, scrollTrigger: { trigger: '.contact__grid', start: 'top 80%', once: true } });
    });
  });

  return (
    <section id="contact" ref={root} className="contact" aria-labelledby="contact-title">
      <div className="contact__bg" aria-hidden="true">
        <Img image="classicrear" alt="" sizes="100vw" />
      </div>
      <div className="contact__grid wrap">
        <div className="inspect-card">
          <p className="eyebrow">Free paint inspection</p>
          <h2 id="contact-title" className="h2">
            Bring it in.
            <br />
            <em>We’ll show you.</em>
          </h2>
          <p className="lede">Twenty minutes under our lights with a paint depth gauge. You’ll see exactly what we see, and leave with an honest plan.</p>
          {sent ? (
            <p className="inspect-card__ok" role="status">
              Thanks. This is a demo, so nothing was sent.
            </p>
          ) : (
            <form
              className="inspect-card__form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label>
                <span>Name</span>
                <input required autoComplete="name" />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" required autoComplete="tel" />
              </label>
              <label className="wide">
                <span>Car (make, model, year)</span>
                <input placeholder="e.g. Porsche 911, 2019" />
              </label>
              <button type="submit" className="btn btn--accent wide">
                Book my inspection <span aria-hidden="true">→</span>
              </button>
            </form>
          )}
          <div className="studio-info">
            <address>
              {brand.address.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <p>{brand.hours}</p>
            <p>
              <a href={brand.phoneHref}>{brand.phone}</a>
              <br />
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </p>
          </div>
        </div>

        <div className="faq" id="faq">
          <h3>Questions</h3>
          <dl>
            {faq.map((f, i) => (
              <div key={f.q} className={`faq__item${open === i ? ' is-open' : ''}`}>
                <dt>
                  <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                    {f.q}
                    <i aria-hidden="true" />
                  </button>
                </dt>
                <dd id={`faq-${i}`}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
