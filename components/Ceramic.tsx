'use client';

import { useEffect, useRef, useState } from 'react';
import { coatings } from '@/lib/content';
import { gsap, fitCanvas, useGsap, useInView, MQ } from '@/lib/motion';

type Drop = { x: number; y: number; r: number; vy: number; phase: number; age: number };

const MAX = 360;

/**
 * Hydrophobic demo. Spray water across the panel with the pointer (or just watch the rain).
 * Coated: water pulls into tight beads that merge and roll off, leaving nothing behind.
 * Uncoated: water spreads flat, clings, crawls slowly and dries into water spots.
 */
function BeadPanel({ coated, onCount }: { coated: boolean; onCount: (n: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inView = useInView(ref);
  const spray = useRef<{ x: number; y: number } | null>(null);
  const mode = useRef(coated);
  const reset = useRef(false);

  useEffect(() => {
    mode.current = coated;
    reset.current = true;
  }, [coated]);

  useEffect(() => {
    const c = ref.current;
    if (!c || !inView) return;
    const still = window.matchMedia(MQ.reduced).matches;
    let { ctx, w, h } = fitCanvas(c, 2);
    const bg = document.createElement('canvas');
    const wet = document.createElement('canvas');
    let wx = wet.getContext('2d')!;

    const paintBg = () => {
      bg.width = wet.width = Math.round(w);
      bg.height = wet.height = Math.round(h);
      wx = wet.getContext('2d')!;
      const b = bg.getContext('2d')!;
      const g = b.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, '#15171c');
      g.addColorStop(0.5, '#0a0b0e');
      g.addColorStop(1, '#101217');
      b.fillStyle = g;
      b.fillRect(0, 0, w, h);
      // Softbox reflections on the panel.
      b.save();
      b.translate(w * 0.62, 0);
      b.rotate(0.28);
      const band = b.createLinearGradient(-60, 0, 60, 0);
      band.addColorStop(0, 'rgba(255,255,255,0)');
      band.addColorStop(0.5, 'rgba(255,255,255,0.13)');
      band.addColorStop(1, 'rgba(255,255,255,0)');
      b.fillStyle = band;
      b.fillRect(-60, -h, 120, h * 3);
      b.restore();
      const top = b.createLinearGradient(0, 0, 0, h * 0.35);
      top.addColorStop(0, 'rgba(255,255,255,0.07)');
      top.addColorStop(1, 'rgba(255,255,255,0)');
      b.fillStyle = top;
      b.fillRect(0, 0, w, h * 0.35);
    };
    paintBg();
    const ro = new ResizeObserver(() => {
      ({ ctx, w, h } = fitCanvas(c, 2));
      paintBg();
    });
    ro.observe(c);

    let drops: Drop[] = [];
    const add = (x: number, y: number, r: number) => {
      drops.push({ x, y, r, vy: 0, phase: Math.random() * 6, age: 0 });
      if (drops.length > MAX) drops.splice(0, drops.length - MAX);
    };
    // Start with a light shower so the panel isn't empty.
    for (let i = 0; i < 90; i++) add(Math.random() * w, Math.random() * h, 1 + Math.random() ** 2 * 4);

    let rain = 0;
    let count = -1;
    let report = 0;
    const tick = (_: number, dtMs: number) => {
      const dt = Math.min(0.05, dtMs / 1000);
      const on = mode.current;
      if (reset.current) {
        reset.current = false;
        drops = [];
        wx.clearRect(0, 0, w, h);
        for (let i = 0; i < 90; i++) add(Math.random() * w, Math.random() * h, 1 + Math.random() ** 2 * 4);
      }

      // Rain and spray.
      rain += dt;
      if (!still && rain > 0.12) {
        rain = 0;
        add(Math.random() * w, Math.random() * h, 1 + Math.random() ** 2 * 3.5);
      }
      if (spray.current) {
        for (let i = 0; i < 4; i++) {
          const a = Math.random() * Math.PI * 2;
          const d = Math.random() ** 0.5 * 34;
          add(spray.current.x + Math.cos(a) * d, spray.current.y + Math.sin(a) * d, 1 + Math.random() ** 1.6 * 5);
        }
      }

      // Physics.
      const slideAt = on ? 4.4 : 8;
      const maxV = on ? 900 : 70;
      for (const d of drops) {
        d.age += dt;
        if (d.r > slideAt) {
          d.vy = Math.min(maxV, d.vy + (on ? 520 : 60) * (d.r / 10) * dt);
          d.y += d.vy * dt;
          d.x += Math.sin(d.phase + d.y * 0.03) * (on ? 0.5 : 0.2);
          if (!on) {
            // Uncoated water sheets: it leaves a wet trail behind.
            wx.fillStyle = 'rgba(160,175,200,0.035)';
            wx.beginPath();
            wx.ellipse(d.x, d.y - d.r, d.r * 1.3, d.r * 1.6, 0, 0, Math.PI * 2);
            wx.fill();
          }
        }
        if (!on && d.age > 7 && d.r <= slideAt) {
          // Dries into a mineral spot.
          wx.strokeStyle = 'rgba(220,220,210,0.16)';
          wx.lineWidth = 0.8;
          wx.beginPath();
          wx.ellipse(d.x, d.y, d.r * 1.5, d.r * 1.2, 0, 0, Math.PI * 2);
          wx.stroke();
          d.r = -1;
        }
      }
      // Merge touching drops (the moving one keeps its speed).
      drops.sort((a, b) => a.y - b.y);
      for (let i = 0; i < drops.length; i++) {
        const a = drops[i];
        if (a.r <= 0) continue;
        for (let j = i + 1; j < drops.length; j++) {
          const b = drops[j];
          if (b.y - a.y > 20) break;
          if (b.r <= 0) continue;
          const reach = (a.r + b.r) * (on ? 0.85 : 1.25);
          if (Math.abs(a.x - b.x) < reach && Math.hypot(a.x - b.x, a.y - b.y) < reach) {
            const big = a.r >= b.r ? a : b;
            const small = big === a ? b : a;
            big.x = (big.x * big.r ** 3 + small.x * small.r ** 3) / (big.r ** 3 + small.r ** 3);
            big.r = Math.min(on ? 14 : 22, Math.cbrt(big.r ** 3 + small.r ** 3));
            big.vy = Math.max(big.vy, small.vy);
            small.r = -1;
          }
        }
      }
      drops = drops.filter((d) => d.r > 0 && d.y < h + 30);
      // Slowly evaporate the wet layer.
      wx.save();
      wx.globalCompositeOperation = 'destination-out';
      wx.fillStyle = 'rgba(0,0,0,0.004)';
      wx.fillRect(0, 0, w, h);
      wx.restore();

      // Render.
      ctx.drawImage(bg, 0, 0, w, h);
      ctx.drawImage(wet, 0, 0, w, h);
      for (const d of drops) {
        const r = d.r;
        if (on) {
          ctx.fillStyle = 'rgba(0,0,0,0.38)';
          ctx.beginPath();
          ctx.ellipse(d.x, d.y + r * 0.35, r * 1.02, r * 0.95, 0, 0, Math.PI * 2);
          ctx.fill();
          const g = ctx.createRadialGradient(d.x, d.y + r * 0.2, 0, d.x, d.y, r);
          g.addColorStop(0, 'rgba(210,225,255,0.12)');
          g.addColorStop(0.72, 'rgba(210,225,255,0.04)');
          g.addColorStop(1, 'rgba(230,240,255,0.3)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
          ctx.fill();
          if (r > 1.6) {
            ctx.strokeStyle = 'rgba(255,255,255,0.28)';
            ctx.lineWidth = Math.max(0.6, r * 0.2);
            ctx.beginPath();
            ctx.arc(d.x, d.y, r * 0.66, Math.PI * 0.2, Math.PI * 0.8);
            ctx.stroke();
          }
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath();
          ctx.ellipse(d.x - r * 0.35, d.y - r * 0.4, Math.max(0.5, r * 0.26), Math.max(0.4, r * 0.18), -0.6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(190,205,230,0.07)';
          ctx.strokeStyle = 'rgba(210,220,240,0.12)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(d.x, d.y, r * 1.55, r * 1.2, Math.sin(d.phase) * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.ellipse(d.x - r * 0.5, d.y - r * 0.4, Math.max(0.4, r * 0.3), Math.max(0.3, r * 0.12), -0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      // Report the count a few times a second, not every frame.
      report += dt;
      if (report > 0.25 && drops.length !== count) {
        report = 0;
        onCount((count = drops.length));
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
    };
  }, [inView, onCount]);

  const at = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  return (
    <canvas
      ref={ref}
      className="beads__canvas"
      role="img"
      aria-label={coated ? 'Water beading into tight droplets and rolling off a ceramic-coated panel' : 'Water spreading flat and clinging to an uncoated panel'}
      onPointerMove={(e) => (e.pointerType === 'mouse' || e.buttons) && (spray.current = at(e))}
      onPointerDown={(e) => (spray.current = at(e))}
      onPointerUp={(e) => e.pointerType !== 'mouse' && (spray.current = null)}
      onPointerLeave={() => (spray.current = null)}
      onPointerCancel={() => (spray.current = null)}
    />
  );
}

export default function Ceramic() {
  const root = useRef<HTMLElement>(null);
  const [coated, setCoated] = useState(true);
  const [count, setCount] = useState(0);
  const [tier, setTier] = useState(2);

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from('.ceramic .sec-head > *, .tiers', { autoAlpha: 0, y: 40, stagger: 0.08, scrollTrigger: { trigger: '.ceramic', start: 'top 75%', once: true } });
      gsap.from('.beads', { clipPath: 'inset(0% 0% 100% 0% round 28px)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: '.beads', start: 'top 85%', once: true } });
    });
  });

  return (
    <section id="ceramic" ref={root} className="ceramic" aria-labelledby="cer-title">
      <div className="ceramic__grid wrap">
        <div className="beads">
          <BeadPanel coated={coated} onCount={setCount} />
          <div className="beads__switch" role="radiogroup" aria-label="Panel">
            <button type="button" role="radio" aria-checked={coated} className={coated ? 'on' : ''} onClick={() => setCoated(true)}>
              Ceramic coated
            </button>
            <button type="button" role="radio" aria-checked={!coated} className={!coated ? 'on' : ''} onClick={() => setCoated(false)}>
              Uncoated
            </button>
          </div>
          <dl className="beads__hud" aria-live="polite">
            <div>
              <dt>Contact angle</dt>
              <dd>{coated ? '112°' : '58°'}</dd>
            </div>
            <div>
              <dt>Behaviour</dt>
              <dd>{coated ? 'Beads & rolls off' : 'Sheets & clings'}</dd>
            </div>
            <div>
              <dt>Drops</dt>
              <dd>{count}</dd>
            </div>
          </dl>
          <p className="beads__hint" aria-hidden="true">
            Spray the panel
          </p>
        </div>

        <div className="sec-head">
          <p className="eyebrow">02 — Ceramic coating</p>
          <h2 id="cer-title" className="h2">
            Water hates it.
            <br />
            <em>Dirt can’t hold on.</em>
          </h2>
          <p className="lede">A nano-ceramic layer bonds to the clear coat and stays for years. Water beads and runs off, taking dirt with it, so the car stays cleaner and washes in minutes.</p>
          <div className="tiers" role="radiogroup" aria-label="Coating">
            {coatings.map((c, i) => (
              <button key={c.name} type="button" role="radio" aria-checked={tier === i} className={`tier${tier === i ? ' on' : ''}`} onClick={() => setTier(i)}>
                <b>
                  {c.years}
                  <small>yr</small>
                </b>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
          <p className="tier__text" key={tier}>
            {coatings[tier].text}
          </p>
        </div>
      </div>
    </section>
  );
}
