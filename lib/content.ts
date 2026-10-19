// ─────────────────────────────────────────────────────────────────────────────
//  PRESET CONFIG — Glosswerk, a FICTIONAL auto detailing studio.
//  Prices, ratings, reviews and figures are demo content. The "dirty" states in the
//  hero and before/after sliders are simulated in code for illustration.
//  Photos: assets-src/<key>.jpg → `npm run images` → reference by key below.
// ─────────────────────────────────────────────────────────────────────────────

export type ImageKey =
  | 'hero' | 'foam' | 'polish' | 'wheel' | 'tyre' | 'interior' | 'cockpit' | 'leather' | 'wheelcloth'
  | 'towel' | 'pad' | 'washing' | 'splash' | 'bmwfoam' | 'taillight' | 'amg' | 'classic' | 'classicrear'
  | 'mclaren' | 'detailer' | 'beads' | 'dark';

export const brand = {
  name: 'Glosswerk',
  line: 'Detailing Studio',
  area: 'Glyfada, Athens',
  address: ['Lazaraki 41, Glyfada', '166 75 Athens'],
  phone: '+30 210 000 0000',
  phoneHref: 'tel:+302100000000',
  email: 'studio@glosswerk.example',
  hours: 'Mon–Fri 08:00–19:00 · Sat 09:00–15:00',
  rating: '4.9',
  reviews: '412 reviews',
  credit: { label: 'Core Concepts Design', href: 'https://coreconcepts.design' },
  disclaimer:
    'Glosswerk is a fictional studio created as a design concept. Prices, ratings, reviews and figures are illustrative; "before" states are simulated in code.',
};

export const nav = [
  { label: 'Correction', href: '#correction' },
  { label: 'Ceramic', href: '#ceramic' },
  { label: 'Services', href: '#services' },
  { label: 'Results', href: '#results' },
  { label: 'Quote', href: '#quote' },
];

export const hero = {
  title: ['Deeper', 'than new.'],
  lede: 'Paint correction, ceramic coatings and protection film, done by hand under studio light in Glyfada.',
  hint: 'Move across the car to polish it',
  hintTouch: 'Drag across the car to polish it',
  done: 'Mirror finish',
};

export const marquee = ['Paint correction', 'Ceramic coating', 'Paint protection film', 'Interior detailing', 'Wheels & calipers', 'Glass coating'];

export const statement = 'We don’t wash cars. We restore the light in them.';

export const stats = [
  { value: 96, suffix: ' GU', label: 'Average gloss after correction' },
  { value: 9, suffix: ' yr', label: 'Longest ceramic warranty' },
  { value: 1800, suffix: '+', label: 'Cars finished since 2016' },
  { value: 4.9, suffix: '★', label: 'Across 412 reviews', decimals: 1 },
];

export const stages = [
  { id: 0, name: 'As it arrives', short: 'Before', text: 'Wash-induced swirls, holograms and light scratches. Under direct light, the paint looks like a spider’s web.', meta: 'Typical daily driver · 58 GU' },
  { id: 1, name: 'One-step polish', short: 'Stage 1', text: 'A single enhancement polish removes around 60% of defects and wakes up the colour. Ideal for newer cars.', meta: '1 day · from €390' },
  { id: 2, name: 'Two-step correction', short: 'Stage 2', text: 'Compound, then refine. 85–95% of defects gone, measured with a paint depth gauge at every panel.', meta: '2 days · from €690' },
  { id: 3, name: 'Correction + ceramic', short: 'Stage 3', text: 'Full correction, panel wipe and a 9-year ceramic coating. Deep, wet and sharp enough to read a sign in.', meta: '3 days · from €1,290' },
];

export const coatings = [
  { name: 'Essential', years: 2, text: 'Single layer. Hydrophobic, UV-stable, easy to wash.' },
  { name: 'Pro', years: 5, text: 'Two layers plus wheel faces and glass.' },
  { name: 'Signature', years: 9, text: 'Three layers, full-car including trim, with yearly inspection.' },
];

export const services: { title: string; text: string; from: string; time: string; image: ImageKey; size?: 'wide' | 'tall' }[] = [
  { title: 'Signature wash', text: 'Snow foam, two-bucket hand wash, iron fallout removal, clay and sealant.', from: '€89', time: '3 h', image: 'foam', size: 'wide' },
  { title: 'Paint correction', text: 'Machine polishing in one, two or three stages, measured panel by panel.', from: '€390', time: '1–3 days', image: 'polish', size: 'tall' },
  { title: 'Ceramic coating', text: 'Nano-ceramic protection with up to nine years of warranted gloss.', from: '€490', time: '1–3 days', image: 'beads' },
  { title: 'Interior detail', text: 'Steam, extraction, leather clean and conditioning, odour treatment.', from: '€180', time: '5 h', image: 'interior' },
  { title: 'Wheels & calipers', text: 'Wheels off, barrels cleaned, faces and calipers ceramic-coated.', from: '€220', time: '4 h', image: 'wheel' },
  { title: 'Paint protection film', text: 'Self-healing clear film for the front end or the whole car.', from: '€990', time: '2–4 days', image: 'amg' },
];

/** Before/after sets. The "before" is a simulated treatment of the same photo. */
export const results: { id: string; label: string; image: ImageKey; caption: string }[] = [
  { id: 'paint', label: 'Paint', image: 'classic', caption: '1968 saloon · two-step correction + ceramic' },
  { id: 'interior', label: 'Interior', image: 'interior', caption: 'Quilted leather · deep clean + conditioning' },
  { id: 'lights', label: 'Lights', image: 'taillight', caption: 'Rear lamps · restoration + coating' },
];

export const quote = {
  sizes: [
    { id: 'compact', label: 'Compact', note: 'Hatchbacks, small coupés', k: 0.9 },
    { id: 'sedan', label: 'Saloon', note: 'Saloons, estates, sports cars', k: 1 },
    { id: 'suv', label: 'SUV', note: 'SUVs and crossovers', k: 1.2 },
    { id: 'van', label: 'Large', note: 'Pick-ups, vans, 7-seaters', k: 1.35 },
  ],
  packages: [
    { id: 'refresh', name: 'Refresh', price: 149, days: 0.4, items: ['Snow foam & hand wash', 'Iron fallout + clay', '6-month sealant'] },
    { id: 'enhance', name: 'Enhance', price: 549, days: 1, items: ['Everything in Refresh', 'One-step polish', '2-year ceramic coating'] },
    { id: 'signature', name: 'Signature', price: 1290, days: 3, items: ['Everything in Enhance', 'Two-step correction', '9-year ceramic, trim & glass'] },
  ],
  addons: [
    { id: 'interior', label: 'Interior deep clean', price: 180, days: 0.4 },
    { id: 'wheels', label: 'Wheels off + calipers', price: 220, days: 0.3 },
    { id: 'ppf', label: 'PPF front end', price: 990, days: 1.5 },
    { id: 'glass', label: 'Glass coating', price: 90, days: 0.1 },
    { id: 'engine', label: 'Engine bay', price: 80, days: 0.1 },
  ],
  condition: ['Like new', 'Daily driven', 'Neglected'],
  conditionK: [1, 1.1, 1.25],
};

export const process = [
  { n: '01', title: 'Inspect', text: 'Paint depth readings on every panel, photos under three light temperatures, and an honest plan.', image: 'dark' as ImageKey },
  { n: '02', title: 'Decontaminate', text: 'Snow foam, two-bucket wash, iron and tar removal, clay. Nothing touches the paint dry.', image: 'washing' as ImageKey },
  { n: '03', title: 'Correct', text: 'Machine polishing in stages, checked under swirl-finder light between every pass.', image: 'pad' as ImageKey },
  { n: '04', title: 'Protect', text: 'Panel wipe, then ceramic or film, cured under infrared lamps in a dust-controlled bay.', image: 'splash' as ImageKey },
  { n: '05', title: 'Hand over', text: 'We walk you round the car under our lights, with aftercare kit and a written report.', image: 'mclaren' as ImageKey },
];

export const reviews = [
  { name: 'Nikos A.', car: 'Porsche 911 GT3', text: 'Twelve years of swirl marks gone in two days. It looks deeper than the day I collected it.' },
  { name: 'Maria L.', car: 'BMW X5', text: 'They showed me the paint readings before touching anything. Proper professionals.' },
  { name: 'George P.', car: 'Mercedes W110', text: 'My grandfather’s car. They treated it like it was theirs. The chrome alone made me emotional.' },
  { name: 'Elena S.', car: 'Tesla Model 3', text: 'Ceramic and PPF front. Bugs and rain just slide off now. Washing takes ten minutes.' },
];

export const faq = [
  { q: 'How long does a ceramic coating really last?', a: 'With the recommended maintenance washes, our Signature coating is warranted for nine years. We inspect it yearly and top it up if needed.' },
  { q: 'Will polishing thin my clear coat?', a: 'Only minimally, and we measure before and after. We never remove more than a few microns and leave any panel close to its limit untouched.' },
  { q: 'Can I wait while you work?', a: 'For washes and interiors, yes. Our lounge has coffee and a window onto the bay. Corrections and coatings need the car overnight to cure.' },
  { q: 'Do you collect the car?', a: 'Yes, anywhere in the southern suburbs, on a covered trailer for anything that needs it.' },
];
