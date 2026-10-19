'use client';

import { useEffect, useRef, useState } from 'react';
import { quote } from '@/lib/content';
import { gsap, useGsap, MQ } from '@/lib/motion';

/** Side profiles for each size class, drawn as single strokes so they can "draw on" when switched. */
const PROFILES: Record<string, string> = {
  compact:
    'M40 132 H70 a26 26 0 0 1 52 0 H238 a26 26 0 0 1 52 0 H320 V110 C318 98 306 92 290 90 L262 86 C240 64 214 52 180 52 H132 C110 52 94 64 80 82 L52 90 C44 92 40 100 40 110 Z',
  sedan:
    'M24 132 H64 a26 26 0 0 1 52 0 H262 a26 26 0 0 1 52 0 H346 V114 C344 104 334 98 318 96 L286 92 C262 70 232 56 196 56 H148 C120 56 102 68 86 86 L44 94 C32 96 24 104 24 116 Z',
  suv:
    'M26 136 H64 a28 28 0 0 1 56 0 H254 a28 28 0 0 1 56 0 H346 V104 C346 92 338 86 324 84 L300 80 C284 56 262 42 226 42 H128 C104 42 90 52 78 70 L50 80 C36 84 26 92 26 104 Z',
  van:
    'M18 136 H58 a28 28 0 0 1 56 0 H262 a28 28 0 0 1 56 0 H354 V100 C354 90 348 84 336 82 L318 80 L300 44 C296 36 290 32 280 32 H110 C94 32 84 40 76 54 L56 84 C30 88 18 94 18 108 Z',
};

const eur = (v: number) => `€${Math.round(v).toLocaleString('en-US')}`;

/** Configure size, package, condition and extras; the total and time update live (and count between values). */
export default function Quote() {
  const root = useRef<HTMLElement>(null);
  const [size, setSize] = useState(1);
  const [pkg, setPkg] = useState(1);
  const [cond, setCond] = useState(1);
  const [extras, setExtras] = useState<string[]>(['interior']);
  const [sent, setSent] = useState(false);
  const shown = useRef<HTMLSpanElement>(null);
  const path = useRef<SVGPathElement>(null);

  const s = quote.sizes[size];
  const p = quote.packages[pkg];
  const addons = quote.addons.filter((a) => extras.includes(a.id));
  const total = (p.price * s.k + addons.reduce((t, a) => t + a.price * (a.id === 'ppf' ? s.k : 1), 0)) * quote.conditionK[cond];
  const days = p.days * quote.conditionK[cond] + addons.reduce((t, a) => t + a.days, 0);
  const time = days < 0.9 ? `${Math.max(3, Math.round(days * 9))} hours` : `${Math.ceil(days)} ${Math.ceil(days) === 1 ? 'day' : 'days'}`;

  // Count the displayed total towards the new value.
  const last = useRef(total);
  useEffect(() => {
    const el = shown.current;
    if (!el) return;
    const o = { v: last.current };
    last.current = total;
    const reduced = window.matchMedia(MQ.reduced).matches;
    const t = gsap.to(o, { v: total, duration: reduced ? 0 : 0.8, ease: 'power3.out', onUpdate: () => (el.textContent = eur(o.v)) });
    return () => void t.kill();
  }, [total]);

  // Redraw the silhouette when the size changes.
  useEffect(() => {
    const el = path.current;
    if (!el || window.matchMedia(MQ.reduced).matches) return;
    const len = el.getTotalLength();
    gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' });
  }, [size]);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from('.quote .sec-head > *', { autoAlpha: 0, y: 40, stagger: 0.1, scrollTrigger: { trigger: '.quote', start: 'top 75%', once: true } });
      gsap.from('.q-form > *, .q-sum', { autoAlpha: 0, y: 40, stagger: 0.07, duration: 1.1, scrollTrigger: { trigger: '.q-grid', start: 'top 80%', once: true } });
    });
  });

  return (
    <section id="quote" ref={root} className="quote" aria-labelledby="quote-title">
      <div className="sec-head wrap">
        <p className="eyebrow">06 — Instant quote</p>
        <h2 id="quote-title" className="h2">
          Build it. <em>See the price.</em>
        </h2>
      </div>

      <div className="q-grid wrap">
        <div className="q-form">
          <fieldset className="q-block">
            <legend>
              <span>1</span> Vehicle size
            </legend>
            <div className="q-sizes">
              {quote.sizes.map((x, i) => (
                <label key={x.id} className={`q-size${size === i ? ' on' : ''}`}>
                  <input type="radio" name="size" checked={size === i} onChange={() => setSize(i)} />
                  <svg viewBox="0 0 370 170" aria-hidden="true">
                    <path d={PROFILES[x.id]} />
                  </svg>
                  <b>{x.label}</b>
                  <small>{x.note}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="q-block">
            <legend>
              <span>2</span> Package
            </legend>
            <div className="q-pkgs">
              {quote.packages.map((x, i) => (
                <label key={x.id} className={`q-pkg${pkg === i ? ' on' : ''}`}>
                  <input type="radio" name="pkg" checked={pkg === i} onChange={() => setPkg(i)} />
                  <span className="q-pkg__top">
                    <b>{x.name}</b>
                    <em>from {eur(x.price)}</em>
                  </span>
                  <ul>
                    {x.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="q-block">
            <legend>
              <span>3</span> Condition
            </legend>
            <div className="q-cond">
              <input type="range" min={0} max={2} step={1} value={cond} onChange={(e) => setCond(+e.target.value)} aria-valuetext={quote.condition[cond]} aria-label="Paint condition" style={{ ['--p' as string]: cond / 2 }} />
              <div className="q-cond__labels" aria-hidden="true">
                {quote.condition.map((c, i) => (
                  <span key={c} className={cond === i ? 'on' : ''}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="q-block">
            <legend>
              <span>4</span> Extras
            </legend>
            <div className="q-extras">
              {quote.addons.map((a) => {
                const on = extras.includes(a.id);
                return (
                  <label key={a.id} className={`q-extra${on ? ' on' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => setExtras((x) => (on ? x.filter((y) => y !== a.id) : [...x, a.id]))} />
                    <i aria-hidden="true" />
                    {a.label}
                    <em>+{eur(a.price)}</em>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <aside className="q-sum" aria-live="polite" aria-label="Your quote">
          <svg className="q-car" viewBox="0 0 370 170" aria-hidden="true">
            <defs>
              <linearGradient id="car-g" x1="0" x2="1">
                <stop offset="0" stopColor="#fff" stopOpacity=".2" />
                <stop offset=".5" stopColor="#fff" />
                <stop offset="1" stopColor="#FF5A1F" />
              </linearGradient>
            </defs>
            <path ref={path} d={PROFILES[s.id]} key={s.id} />
            <line x1="0" y1="160" x2="370" y2="160" />
          </svg>
          <p className="q-sum__k">
            {s.label} · {p.name} · {quote.condition[cond]}
          </p>
          <p className="q-sum__total">
            <span ref={shown}>{eur(total)}</span>
            <small>est. incl. VAT</small>
          </p>
          <dl className="q-sum__rows">
            <div>
              <dt>{p.name} package</dt>
              <dd>{eur(p.price * s.k)}</dd>
            </div>
            {addons.map((a) => (
              <div key={a.id}>
                <dt>{a.label}</dt>
                <dd>{eur(a.price * (a.id === 'ppf' ? s.k : 1))}</dd>
              </div>
            ))}
            {cond > 0 && (
              <div>
                <dt>Condition adjustment</dt>
                <dd>+{Math.round((quote.conditionK[cond] - 1) * 100)}%</dd>
              </div>
            )}
            <div className="q-sum__time">
              <dt>Time in studio</dt>
              <dd>{time}</dd>
            </div>
          </dl>
          {sent ? (
            <p className="q-sum__ok" role="status">
              Request received. This is a demo, so nothing was sent. A real studio would call you within the hour.
            </p>
          ) : (
            <form
              className="q-sum__form"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <label className="sr" htmlFor="q-phone">
                Phone number
              </label>
              <input id="q-phone" type="tel" required placeholder="Your phone number" autoComplete="tel" />
              <button type="submit" className="btn btn--accent">
                Request this slot <span aria-hidden="true">→</span>
              </button>
            </form>
          )}
          <p className="q-sum__note">Final price confirmed after a free paint inspection.</p>
        </aside>
      </div>
    </section>
  );
}
