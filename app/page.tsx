import SmoothScroll from '@/components/SmoothScroll';
import Intro from '@/components/Intro';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import Statement from '@/components/Statement';
import Correction from '@/components/Correction';
import Ceramic from '@/components/Ceramic';
import Services from '@/components/Services';
import Results from '@/components/Results';
import Process from '@/components/Process';
import Quote from '@/components/Quote';
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Page() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <SmoothScroll />
      <Intro />
      <Nav />
      <main id="main">
        <Hero />
        <Marquee />
        <Statement />
        <Correction />
        <Ceramic />
        <Services />
        <Results />
        <Process />
        <Quote />
        <Reviews />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
