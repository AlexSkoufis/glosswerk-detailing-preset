# Glosswerk — Auto Detailing Preset

A dark, studio-lit homepage for a **fictional** paint correction and ceramic coating studio in Glyfada, Athens. Near-black panels, chrome type set wide and thin (Anybody at full width) with Instrument Sans + JetBrains Mono, and one lava-orange accent.

Next.js 15 (static export) · GSAP 3 + ScrollTrigger · Lenis · Canvas 2D · plain CSS. No UI libraries.

```bash
npm install
npm run dev       # dev output goes to .next-dev, so builds never disturb a running dev server
npm run build     # static site in ./out — upload anywhere
npm run images    # rebuild responsive AVIF/WebP after changing photos in assets-src/ (needs: npm i -D sharp)
```

## Signature pieces

| Section | What it does |
|---|---|
| Intro | A single LED strip draws across the dark, the wordmark catches its light, then the strip splits the screen open like a garage door onto the hero. |
| Hero | The car is covered in simulated road grime: dust haze, water spots, drips and a finger-written "wash me". Moving the pointer (or dragging on touch) polishes it away while a gloss meter climbs from Dull to Mirror; at 60% the rest finishes with a light sweep. |
| Marquee | A chrome ticker that speeds up and leans with scroll velocity and reverses with scroll direction. |
| Statement | A line lit by a moving highlight as you scroll, over a tall photo, followed by counters. |
| Correction | An inspection light on black paint. Swirl marks show as arcs around the reflection, as they do under a swirl-finder torch; pick a stage to see how much each level of correction removes. |
| Ceramic | Spray water across a panel with the pointer. Coated, it beads, merges and rolls off; uncoated, it sheets, clings and dries into water spots. |
| Services | A bento of service cards with prices and times; a soft spotlight follows the pointer across each. |
| Results | Before/after sliders (drag or arrow keys). The "before" is the same photo with a simulated neglected finish, labelled as such. |
| Process | Five steps on a vertical LED strip that switch on as the light reaches them. |
| Quote | Pick size, package, condition and extras; the car silhouette redraws and the total and time count to their new values. Demo only. |
| Reviews & contact | Client reviews, then a free paint inspection booking, studio details and FAQ over a dark studio photo. |
| Footer | A giant chrome wordmark whose highlight follows the pointer like light across a bonnet. |

## Re-skin

- **Copy & data** — `lib/content.ts`: studio details, navigation, hero, marquee, stats, correction stages, coatings, services, results, quote pricing, process, reviews, FAQ.
- **Photos** — drop `<key>.jpg` into `assets-src/`, add the key to `ImageKey` in `lib/content.ts`, run `npm run images`.
- **Colour** — tokens at the top of `app/globals.css` (`--bg`, `--panel`, `--ink`, `--accent`, `--chrome`).
- **Type** — `app/layout.tsx`.
- **Quote maths** — `quote.packages[].price` and `days`, `quote.addons`, size factors `quote.sizes[].k` and `quote.conditionK`.

## Connecting the booking form

`components/Contact.tsx` does not send anything. Connect it to your booking system or an email service before launch.

## Accessibility & motion

`prefers-reduced-motion` skips the intro and stops the grime, ticker, light effects and counters (final states are shown). The stage picker, sliders, quote options and FAQ are real buttons and inputs with visible focus.

## Demo content

Glosswerk, its prices, ratings, reviews and figures are fictional, and the "before" states are simulated in code. The source and licence of the photographs in `assets-src/` are not recorded: replace them with the studio's own photography, or confirm each one's licence, before launch.
