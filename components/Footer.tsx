'use client';

import { brand, nav } from '@/lib/content';
import { go, Mark } from './Nav';

/** Footer with a giant chrome wordmark whose highlight follows the pointer like a light across a bonnet. */
export default function Footer() {
  const move = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--sx', `${((e.clientX - r.left) / r.width) * 100}%`);
  };

  return (
    <footer className="ft" onPointerMove={move}>
      <div className="ft__top wrap">
        <div className="ft__brand">
          <Mark />
          <p>
            {brand.line}
            <br />
            {brand.area}
          </p>
        </div>
        <nav className="ft__nav" aria-label="Footer">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={go(n.href)}>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ft__contact">
          <a href={brand.phoneHref}>{brand.phone}</a>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <span>{brand.hours}</span>
        </div>
      </div>
      <p className="ft__mark" aria-hidden="true">
        {brand.name}
      </p>
      <div className="ft__legal wrap">
        <p>{brand.disclaimer}</p>
        <p>
          © {new Date().getFullYear()} {brand.name} · Concept by{' '}
          <a href={brand.credit.href} target="_blank" rel="noreferrer">
            {brand.credit.label}
          </a>
        </p>
      </div>
    </footer>
  );
}
