'use client';

import { useEffect, useState } from 'react';
import { brand, nav } from '@/lib/content';
import { scrollToTarget } from './SmoothScroll';

export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 26 L20 10 L32 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 32 H28" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export const go = (href: string, after?: () => void) => (e: React.MouseEvent) => {
  e.preventDefault();
  after?.();
  scrollToTarget(href, { offset: -70 });
};

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);

  // Hide on scroll down, show on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      setSolid(y > 60);
      setHidden(y > 300 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`nav${solid ? ' is-solid' : ''}${hidden && !open ? ' is-hidden' : ''}${open ? ' is-open' : ''}`}>
      <div className="nav__bar">
        <a href="#top" className="nav__brand" onClick={(e) => (e.preventDefault(), setOpen(false), scrollToTarget(0))} aria-label={`${brand.name} — back to top`}>
          <Mark />
          <span>{brand.name}</span>
        </a>
        <nav className="nav__links" aria-label="Main">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={go(n.href)}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href={brand.phoneHref} className="nav__phone">
          {brand.phone}
        </a>
        <a href="#quote" className="btn btn--accent btn--sm nav__cta" onClick={go('#quote')}>
          Get a quote
        </a>
        <button type="button" className="nav__menu" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
          <span className="sr">Menu</span>
          <i />
          <i />
        </button>
      </div>
      <div id="menu" className="menu" hidden={!open}>
        {nav.map((n, i) => (
          <a key={n.href} href={n.href} onClick={go(n.href, () => setOpen(false))} style={{ ['--i' as string]: i }}>
            <span>0{i + 1}</span>
            {n.label}
          </a>
        ))}
        <a href="#quote" className="btn btn--accent" onClick={go('#quote', () => setOpen(false))}>
          Get a quote
        </a>
      </div>
    </header>
  );
}
