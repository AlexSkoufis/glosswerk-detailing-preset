'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { brand, hero } from '@/lib/content';
import { afterIntro } from '@/lib/intro';
import { gsap, SplitText, MQ } from '@/lib/motion';
import { fallbackSrc, Img } from './Img';
import { go } from './Nav';

const COLS = 48;
const ROWS = 30;
const FINISH = 0.6; // share of the car polished before the rest is finished automatically
const GU_START = 31;
const GU_END = 96;

const glossWord = (gu: number) => (gu < 45 ? 'Dull' : gu < 70 ? 'Satin' : gu < 88 ? 'Gloss' : 'Mirror');

/** object-fit: cover rectangle for an image inside a w×h box at an object-position (0..1). */
function cover(iw: number, ih: number, w: number, h: number, px: number, py: number) {
  const s = Math.max(w / iw, h / ih);
  const dw = iw * s;
  const dh = ih * s;
  return { x: (w - dw) * px, y: (h - dh) * py, w: dw, h: dh };
}

/** Deterministic PRNG so the grime pattern is the same every time. */
function rand(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/**
 * Hero: the photo is covered by a canvas of simulated road grime — dust haze, water spots, drips,
 * and a finger-written "wash me". Moving across it polishes it away with a soft pad; a live gloss
 * meter climbs from dull to mirror, and at 60% the rest is finished with a light sweep.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pad = useRef<HTMLSpanElement>(null);
  const mask = useRef(new Float32Array(COLS * ROWS).fill(1));
  const last = useRef<{ x: number; y: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [touch, setTouch] = useState(false);
  const raf = useRef(0);
  const doneRef = useRef(false);

  // ── grime ──────────────────────────────────────────────────────────────────
  const build = useCallback(() => {
    const c = canvas.current;
    const photo = root.current?.querySelector<HTMLImageElement>('.hero__media img');
    if (!c || !photo) return;
    const w = c.clientWidth;
    const h = c.clientHeight;
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    const img = new Image();
    img.src = fallbackSrc('hero');
    img.onload = () => {
      const [px, py] = getComputedStyle(photo).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
      const r = cover(img.naturalWidth, img.naturalHeight, w, h, px, py);
      const R = rand(7);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);
      // Dusty, washed-out version of the same photo.
      ctx.filter = 'grayscale(0.5) sepia(0.5) brightness(1.45) contrast(0.52) blur(2px)';
      ctx.drawImage(img, r.x, r.y, r.w, r.h);
      ctx.filter = 'none';
      ctx.fillStyle = 'rgba(118,104,86,0.3)';
      ctx.fillRect(0, 0, w, h);
      // Blotchy road film.
      for (let i = 0; i < 70; i++) {
        const x = R() * w;
        const y = R() * h;
        const rad = 40 + R() * 220;
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        const dark = R() > 0.7;
        g.addColorStop(0, dark ? `rgba(40,34,26,${0.08 + R() * 0.1})` : `rgba(170,150,120,${0.06 + R() * 0.12})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      // Drips running down from the upper half.
      for (let i = 0; i < 46; i++) {
        let x = R() * w;
        const y0 = h * (0.2 + R() * 0.5);
        const len = 40 + R() * 180;
        ctx.strokeStyle = `rgba(70,58,44,${0.12 + R() * 0.12})`;
        ctx.lineWidth = 1.5 + R() * 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y0);
        for (let y = y0; y < y0 + len; y += 8) {
          x += (R() - 0.5) * 2.5;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // Water spots.
      for (let i = 0; i < 320; i++) {
        const x = R() * w;
        const y = R() * h;
        const rad = 1.5 + R() * 6;
        ctx.strokeStyle = `rgba(225,215,195,${0.12 + R() * 0.2})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Grit.
      for (let i = 0; i < (w * h) / 260; i++) {
        ctx.fillStyle = R() > 0.5 ? `rgba(235,225,205,${0.1 + R() * 0.25})` : `rgba(30,25,20,${0.1 + R() * 0.3})`;
        ctx.fillRect(R() * w, R() * h, 0.6 + R() * 1.2, 0.6 + R() * 1.2);
      }
      // Finger-written "wash me" on the bonnet.
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.translate(w * (w > h ? 0.44 : 0.36), h * 0.6);
      ctx.rotate(-0.07);
      const fs = Math.min(w, h) * 0.075;
      ctx.font = `italic 700 ${fs}px "Segoe Script", "Bradley Hand", "Comic Sans MS", cursive`;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = fs * 0.09;
      ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeText('wash me', 0, 0);
      ctx.restore();
      mask.current.fill(1);
      setProgress(0);
    };
  }, []);

  // ── polishing ──────────────────────────────────────────────────────────────
  const stamp = useCallback((x: number, y: number, r: number, a: number) => {
    const c = canvas.current!;
    const ctx = c.getContext('2d')!;
    ctx.globalCompositeOperation = 'destination-out';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${a})`);
    g.addColorStop(0.6, `rgba(0,0,0,${a * 0.6})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    // Track coverage on a coarse grid (cheaper than reading pixels back).
    const cw = c.width / COLS;
    const ch = c.height / ROWS;
    const m = mask.current;
    for (let j = Math.max(0, Math.floor((y - r) / ch)); j <= Math.min(ROWS - 1, Math.floor((y + r) / ch)); j++) {
      for (let i = Math.max(0, Math.floor((x - r) / cw)); i <= Math.min(COLS - 1, Math.floor((x + r) / cw)); i++) {
        const d = Math.hypot((i + 0.5) * cw - x, (j + 0.5) * ch - y) / r;
        if (d < 1) m[j * COLS + i] = Math.max(0, m[j * COLS + i] - a * 0.9 * (1 - d * d));
      }
    }
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const reduced = window.matchMedia(MQ.reduced).matches;
    gsap.to(canvas.current, { autoAlpha: 0, duration: reduced ? 0 : 1.3, ease: 'power2.inOut' });
    if (!reduced) gsap.fromTo('.hero__sheen', { xPercent: -120, autoAlpha: 1 }, { xPercent: 120, duration: 1.6, ease: 'power2.inOut', delay: 0.2 });
  }, []);

  const measure = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const m = mask.current;
      let sum = 0;
      for (let i = 0; i < m.length; i++) sum += m[i];
      const p = 1 - sum / m.length;
      setProgress(p);
      if (p >= FINISH) finish();
    });
  }, [finish]);

  const polishTo = useCallback(
    (x: number, y: number) => {
      if (doneRef.current) return;
      const r = Math.max(46, Math.min(90, (canvas.current?.width ?? 1000) * 0.055));
      const from = last.current ?? { x, y };
      const dist = Math.hypot(x - from.x, y - from.y);
      const steps = Math.max(1, Math.ceil(dist / (r * 0.3)));
      for (let s = 1; s <= steps; s++) stamp(from.x + ((x - from.x) * s) / steps, from.y + ((y - from.y) * s) / steps, r, 0.32);
      last.current = { x, y };
      measure();
    },
    [stamp, measure],
  );

  useEffect(() => {
    setTouch(window.matchMedia('(hover: none)').matches);
    build();
    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => !doneRef.current && build(), 250);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [build]);

  // Intro animation + a demo pass of the pad so the idea is obvious.
  useEffect(() => {
    const el = root.current!;
    if (!window.matchMedia(MQ.motion).matches) return;
    let split: SplitText | null = null;
    const tweens: gsap.core.Animation[] = [];
    const stop = afterIntro(() => {
      split = SplitText.create('.hero__title .line', { type: 'chars' });
      tweens.push(
        gsap.from(split.chars, { yPercent: 60, autoAlpha: 0, stagger: 0.035, duration: 1.4, ease: 'expo.out' }),
        gsap.from('.hero__lede, .hero__ctas, .gauge', { autoAlpha: 0, y: 24, stagger: 0.1, duration: 1.1, delay: 0.4, ease: 'expo.out' }),
      );
      const c = canvas.current!;
      const w = c.width;
      const h = c.height;
      const demo = { t: 0 };
      last.current = null;
      tweens.push(
        gsap.to(demo, {
          t: 1,
          duration: 1.8,
          delay: 0.6,
          ease: 'power1.inOut',
          onUpdate: () => {
            const x = w * (0.22 + demo.t * 0.46);
            const y = h * (0.52 + Math.sin(demo.t * Math.PI * 2.4) * 0.07);
            polishTo(x, y);
          },
          onComplete: () => (last.current = null),
        }),
      );
    });
    return () => {
      stop();
      tweens.forEach((t) => t.kill());
      split?.revert();
      void el;
    };
  }, [polishTo]);

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (pad.current) pad.current.style.transform = `translate(${x}px, ${y}px)`;
    polishTo(x, y);
  };

  const reset = () => {
    doneRef.current = false;
    setDone(false);
    last.current = null;
    gsap.set(canvas.current, { autoAlpha: 1 });
    build();
  };

  const gu = done ? GU_END : Math.round(GU_START + (GU_END - GU_START) * Math.min(1, progress / FINISH) ** 0.8);

  return (
    <section id="top" ref={root} className={`hero${done ? ' is-done' : ''}`} aria-labelledby="hero-title">
      <div className="hero__media">
        <Img image="hero" alt="A black sports car sculpted by a single studio light" sizes="100vw" priority />
        <span className="hero__sheen" aria-hidden="true" />
      </div>
      <canvas
        ref={canvas}
        className="hero__grime"
        aria-hidden="true"
        onPointerMove={onMove}
        onPointerLeave={() => (last.current = null)}
        onPointerDown={(e) => {
          last.current = null;
          onMove(e);
        }}
        onPointerUp={() => (last.current = null)}
      />
      <span ref={pad} className="hero__pad" aria-hidden="true">
        <i />
      </span>

      <div className="hero__ui wrap">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            <span className="line">{hero.title[0]}</span>
            <span className="line">{hero.title[1]}</span>
          </h1>
          <p className="hero__lede">{hero.lede}</p>
          <div className="hero__ctas">
            <a href="#quote" className="btn btn--accent" onClick={go('#quote')}>
              Build your quote
              <span aria-hidden="true">→</span>
            </a>
            <a href="#results" className="btn btn--ghost" onClick={go('#results')}>
              See the results
            </a>
          </div>
        </div>

        <div className="gauge" role="group" aria-label="Gloss meter">
          <p className="gauge__k">
            Gloss reading <span>60° · GU</span>
          </p>
          <p className="gauge__v" aria-live="off">
            {gu}
            <small>{glossWord(gu)}</small>
          </p>
          <span className="gauge__bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${(gu - GU_START) / (GU_END - GU_START)})` }} />
          </span>
          {done ? (
            <button type="button" className="gauge__reset" onClick={reset}>
              {hero.done} ✓ <span>Dirty it again</span>
            </button>
          ) : (
            <p className="gauge__hint">
              <span className="gauge__dot" aria-hidden="true" />
              {touch ? hero.hintTouch : hero.hint}
            </p>
          )}
          <p className="sr" aria-live="polite">
            {done ? `Polished: ${GU_END} gloss units, mirror finish.` : ''}
          </p>
        </div>
      </div>
      <p className="hero__meta" aria-hidden="true">
        {brand.area} · Est. 2016
      </p>
    </section>
  );
}
