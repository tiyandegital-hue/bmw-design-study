# BMW — Design Study · DESIGN.md
*Unofficial learning exercise. Not affiliated with BMW AG. Specs cited from BMW press material / Wikipedia (checked 23 Oct 2026). Photos: Wikimedia Commons, CC-licensed, credits in credits.json.*

## Psychology brief — the BMW customer (written BEFORE design, per workflow)
- **Who:** affluent, self-made, predominantly (not only) male-skewing buyer, 35–55. The car is a *competence signal* — proof of success that also rewards the driver privately.
- **What they actually buy:** not transport — **control and mastery**. BMW's century-deep promise is the driving itself ("the driver is the hero, the car is the instrument"). Every screen must make the visitor feel *more capable*, never merely impressed.
- **Status logic:** quiet dominance, not loud luxury. Understatement with exact numbers beats adjectives. A BMW buyer distrusts hype; **precision IS the persuasion** — 530 hp, 3.5 s, 650 Nm, stated flatly, sourced, no exclamation marks.
- **Identity anchors:** kidney grille, Hofmeister kink, M tricolor. Recognition in 0.4 s. The site borrows the same discipline: one blue, sharp corners, two font weights — *restraint as confidence*.
- **Ownership effect:** the configurator instinct — let them touch the car (3D, paint choices) and the endowment effect starts before any price appears. Interaction precedes transaction.
- **Peak–end:** peak = the 3D car turning under their own drag. End = a test drive, the one experience money-signal can't fake. The whole site funnels to a drive, not a brochure download.
- **Trust gap & close:** performance claims are checkable (WLTP, official 0–100) — cite the standard next to the number, always. Fake urgency is banned; the cars sell out on specification, not countdowns.

## Tokens (from the awesome-design-md BMW corpus file)
```yaml
canvas: "#FFFFFF"        surface-soft: "#F7F7F7"   surface-card: "#FAFAFA"
ink: "#262626"           body: "#3C3C3C"           muted: "#6B6B6B"
hairline: "#E6E6E6"      surface-dark: "#1A2129"   surface-dark-elevated: "#262E38"
voltage: "#1C69D4"       voltage-active: "#0653B6"  # the ONLY call-to-action color
m-stripe: "#0066B1 / #1C69D4 / #E22718"  # brand-coded accent, quarantined to M moments, never a CTA
radius-ceiling: 0px      # BMW = engineered edges; buttons & cards square
type: Archivo (BMW Type Next substitute) — display 700, body 300, NOTHING else
spacing: 4px base; section 96px desktop / 64px phone; margins 28 / 18, EQUAL
```

## Pages (multipage — standing rule)
`index.html` home (3D hero, featured, interior, electric teaser, ending) · `models.html` (filterable range) · `electric.html` (i range, verified range/charging) · `experience.html` (test-drive booking, full form states) · `privacy.html` · `terms.html`. Shared `style.css`, `app.js`; 3D isolated in `three-scene.js` (home only).

## Motion system
- One WebGL scene (hero). GSAP: 1 intro timeline + ScrollTrigger reveals + counters. Lenis smooth scroll. Marquee = CSS. Card tilt = pointer, rAF-throttled. Preloader = real percentage of assets, max ~1.4 s.
- Every animation moves content that is already in the DOM; no-JS and reduced-motion both get the complete static page.
- Paint configurator: 4 real BMW colour names; switching repaints the 3D material AND the hero spec line — the page's one interactive idea (ownership effect).

## Do / Don't
- DO state numbers flatly with their standard (WLTP). DO let white space carry the price signal. DON'T use gradient hero washes, rounded pill buttons, emoji, fake reviews, countdown timers, or the BMW roundel as a graphic asset (text wordmark only).
- DON'T copy bmw.com copy or imagery — all photography is CC-licensed Commons work, credited.

## Known gaps
- The 3D car is a procedural concept sculpture (extruded coupé profile), not a CAD model of a real BMW — the hero labels it a study render.
- Prices are not shown (BMW pricing is market-specific; inventing BDT prices would break the honesty law). The funnel ends at a test drive instead.
