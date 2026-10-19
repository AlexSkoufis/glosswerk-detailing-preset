'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, MQ } from '@/lib/motion';
import { brand } from '@/lib/content';

/**
 * Studio-light intro: a single LED strip draws across the dark, the wordmark catches it,
 * then the strip splits the screen open like a garage door onto the hero.
 */
export default function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia(MQ.motion).matches) return setGone(true);
    document.documentElement.classList.add('is-intro');
    const done = () => {
      document.documentElement.classList.remove('is-intro');
      window.dispatchEvent(new Event('gw:intro-done'));
      setGone(true);
    };
    const tl = gsap.timeline({ onComplete: done });
    tl.fromTo('.intro__strip', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' })
      .fromTo('.intro__word', { autoAlpha: 0, letterSpacing: '0.6em' }, { autoAlpha: 1, letterSpacing: '0.34em', duration: 0.9, ease: 'expo.out' }, 0.35)
      .fromTo('.intro__word', { backgroundPosition: '120% 0' }, { backgroundPosition: '-20% 0', duration: 1.1, ease: 'power2.inOut' }, 0.5)
      .to('.intro__word', { autoAlpha: 0, duration: 0.3 }, 1.55)
      .to('.intro__half--t', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 1.6)
      .to('.intro__half--b', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, 1.6)
      .to('.intro__strip', { scaleY: 40, autoAlpha: 0, duration: 0.8, ease: 'expo.out' }, 1.6);
    return () => {
      tl.kill();
      document.documentElement.classList.remove('is-intro');
    };
  }, []);

  if (gone) return null;
  return (
    <div ref={root} className="intro" aria-hidden="true">
      <div className="intro__half intro__half--t" />
      <div className="intro__half intro__half--b" />
      <span className="intro__strip" />
      <p className="intro__word">{brand.name}</p>
    </div>
  );
}
