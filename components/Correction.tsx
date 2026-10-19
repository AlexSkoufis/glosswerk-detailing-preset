'use client';

import { useEffect, useRef, useState } from 'react';
import { stages } from '@/lib/content';
import { gsap, fitCanvas, useGsap, useInView, MQ } from '@/lib/motion';

type Swirl = { a: number; r: number; len: number; b: number };
type Rid = { x: number; y: number; ang: number; len: number; b: number };

/** How visible the defects are at each stage: [swirl share, swirl brightness, straight scratches]. */
const LEVEL: [number, number, number][] = [
  [1, 1, 1],
  [0.45, 0.4, 0.55],
  [0.16, 0.14, 0.12],
  [0, 0, 0],
];

/**
 * An inspection light on black paint. Swirl marks show up as concentric arcs around the light's
 * reflection, just as they do under a detailer's swirl-finder torch. Pick a stage to see how much
 * of that web each level of correction removes. The light follows the pointer, or drifts on its own.
 */
function InspectionPanel({ stage }: { stage: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inView = useInView(ref);
  const target = useRef({ share: 1, bright: 1, rids: 1 });
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const [share, bright, rids] = LEVEL[stage];
    gsap.to(target.current, { share, bright, rids, duration: 0.9, ease: 'power2.inOut' });
  }, [stage]);

  useEffect(() => {
    const c = ref.current;
    if (!c || !inView) return;
    const still = window.matchMedia(MQ.reduced).matches;
    let { ctx, w, h } = fitCanvas(c, 2);
    const ro = new ResizeObserver(() => ({ ctx, w, h } = fitCanvas(c, 2)));
    ro.observe(c);

    // Pre-generate the defects (relative to the light) and a metallic-flake layer.
    let seed = 3;
    const R = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const swirls: Swirl[] = Array.from({ length: 700 }, () => ({ a: R() * Math.PI * 2, r: 14 + R() ** 0.8 * 300, len: 0.04 + R() * 0.22, b: 0.3 + R() * 0.7 }));
    const rids: Rid[] = Array.from({ length: 14 }, () => ({ x: R(), y: R(), ang: R() * Math.PI, len: 40 + R() * 160, b: 0.4 + R() * 0.6 }));
    const flakes = document.createElement('canvas');
    flakes.width = 400;
    flakes.height = 400;
    const fx = flakes.getContext('2d')!;
    for (let i = 0; i < 2600; i++) {
      fx.fillStyle = `rgba(255,255,255,${R() * 0.06})`;
      fx.fillRect(R() * 400, R() * 400, 1, 1);
    }

    const light = { x: w * 0.55, y: h * 0.45 };
    let t = 0;
    const draw = (_: number, dt: number) => {
      if (!still) t += dt / 1000;
      const goal = pointer.current ?? { x: w * (0.5 + Math.sin(t * 0.45) * 0.28), y: h * (0.46 + Math.sin(t * 0.7 + 1) * 0.2) };
      light.x += (goal.x - light.x) * 0.14;
      light.y += (goal.y - light.y) * 0.14;
      const { share, bright, rids: ridK } = target.current;

      // Paint: deep black with a faint blue-grey falloff.
      const base = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, Math.max(w, h));
      base.addColorStop(0, '#1a1c21');
      base.addColorStop(0.35, '#0d0e11');
      base.addColorStop(1, '#060607');
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = ctx.createPattern(flakes, 'repeat')!;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      // Softbox reflection: a long diagonal band, sharper when the paint is corrected.
      ctx.save();
      ctx.translate(w * 0.5, h * 0.5);
      ctx.rotate(-0.42);
      const band = ctx.createLinearGradient(0, -h * 0.14, 0, h * 0.14);
      const k = 0.1 + (1 - share) * 0.12;
      band.addColorStop(0, 'rgba(255,255,255,0)');
      band.addColorStop(0.5 - k * 0.4, `rgba(255,255,255,${0.05 + (1 - share) * 0.05})`);
      band.addColorStop(0.5, `rgba(255,255,255,${0.1 + (1 - share) * 0.1})`);
      band.addColorStop(0.5 + k * 0.4, `rgba(255,255,255,${0.05 + (1 - share) * 0.05})`);
      band.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = band;
      ctx.fillRect(-w, -h * 0.14, w * 2, h * 0.28);
      ctx.restore();

      // Swirls: arcs concentric with the light's reflection, fading with distance.
      ctx.lineCap = 'round';
      const n = Math.floor(swirls.length * share);
      for (let i = 0; i < n; i++) {
        const s = swirls[i];
        const fall = Math.max(0, 1 - s.r / 320) ** 1.6;
        const a = fall * s.b * bright * 0.55;
        if (a < 0.01) continue;
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(light.x, light.y, s.r, s.a, s.a + s.len);
        ctx.stroke();
      }
      // Random isolated deeper scratches (RIDS) that glint near the light.
      for (const r of rids) {
        const x = r.x * w;
        const y = r.y * h;
        const d = Math.hypot(x - light.x, y - light.y);
        const a = Math.max(0, 1 - d / 360) * r.b * ridK * 0.5;
        if (a < 0.01) continue;
        ctx.strokeStyle = `rgba(255,255,255,${a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - (Math.cos(r.ang) * r.len) / 2, y - (Math.sin(r.ang) * r.len) / 2);
        ctx.lineTo(x + (Math.cos(r.ang) * r.len) / 2, y + (Math.sin(r.ang) * r.len) / 2);
        ctx.stroke();
      }

      // The light itself: haze shrinks as the finish gets clearer.
      const haze = 60 + share * 90;
      const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, haze);
      glow.addColorStop(0, 'rgba(255,255,255,0.95)');
      glow.addColorStop(0.1, 'rgba(255,250,240,0.6)');
      glow.addColorStop(0.35, `rgba(255,245,230,${0.1 + share * 0.12})`);
      glow.addColorStop(1, 'rgba(255,245,230,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(light.x, light.y, haze, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(light.x, light.y, 5, 0, Math.PI * 2);
      ctx.fill();
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      ro.disconnect();
    };
  }, [inView]);

  return (
    <canvas
      ref={ref}
      className="inspect__canvas"
      role="img"
      aria-label={`Black paint under an inspection light: ${stages[stage].name}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
      onPointerLeave={() => (pointer.current = null)}
    />
  );
}

export default function Correction() {
  const root = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const s = stages[stage];

  useGsap(root, () => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from('.correction .sec-head > *', { autoAlpha: 0, y: 40, stagger: 0.1, scrollTrigger: { trigger: '.correction', start: 'top 75%', once: true } });
      gsap.from('.inspect', { autoAlpha: 0, scale: 0.94, duration: 1.4, scrollTrigger: { trigger: '.inspect', start: 'top 85%', once: true } });
    });
  });

  return (
    <section id="correction" ref={root} className="correction" aria-labelledby="corr-title">
      <div className="correction__grid wrap">
        <div className="sec-head">
          <p className="eyebrow">01 — Paint correction</p>
          <h2 id="corr-title" className="h2">
            Swirls hide
            <br />
            <em>in the light.</em>
          </h2>
          <p className="lede">Every wash leaves microscopic scratches. Under direct light they form a web around every reflection. Move the inspection light, then step through the stages.</p>

          <div className="stages" role="radiogroup" aria-label="Correction stage">
            {stages.map((x) => (
              <button key={x.id} type="button" role="radio" aria-checked={stage === x.id} className={stage === x.id ? 'on' : ''} onClick={() => setStage(x.id)}>
                <span>{x.short}</span>
              </button>
            ))}
            <i className="stages__pill" style={{ transform: `translateX(${stage * 100}%)` }} aria-hidden="true" />
          </div>
          <div className="stage" key={stage} aria-live="polite">
            <h3>{s.name}</h3>
            <p>{s.text}</p>
            <p className="stage__meta">{s.meta}</p>
          </div>
        </div>

        <div className="inspect">
          <InspectionPanel stage={stage} />
          <div className="inspect__hud" aria-hidden="true">
            <span>Swirl finder · 6500K</span>
            <span>
              Defects <b>{[100, 38, 8, 0][stage]}%</b>
            </span>
          </div>
          <p className="inspect__hint" aria-hidden="true">
            Move the light
          </p>
        </div>
      </div>
    </section>
  );
}
