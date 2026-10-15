---
name: Grupo Larssen
description: Rota da Madeira, one daylight road from the forest to the obra, signposted in road-sign green and lined in road yellow.
colors:
  papel: "#f3f4f1"
  concreto: "#e7e9e4"
  linha: "#d3d6cf"
  linha-2: "#bfc3ba"
  tinta: "#1b211d"
  tinta-2: "#48504a"
  tinta-3: "#6a716b"
  verde: "#54763a"
  verde-esc: "#3d5829"
  verde-fundo: "#e4ebd9"
  amarelo: "#f2b705"
  amarelo-esc: "#c99500"
  asfalto: "#2b302c"
  ticket-papel: "#fdfdfb"
  serrado: "#6b4416"
  autoclavado: "#2e6e57"
  whatsapp: "#13773f"
  erro: "#b3261e"
  branco: "#ffffff"
typography:
  display:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "clamp(2.3rem, 5vw, 4.2rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  statement:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  numeral:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "\"tnum\" 1"
  lead:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 1.6vw, 1.4rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  control:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.02em"
  label:
    fontFamily: "Barlow Condensed, Barlow, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  carimbo: "5px"
  marco: "6px 6px 3px 3px"
  sm: "8px"
  field: "9px"
  md: "10px"
  placa: "12px"
  pill: "20px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "26px"
  xl: "40px"
  margem: "clamp(16px, 4vw, 56px)"
  gutter: "clamp(30px, 5vw, 80px)"
  bloco: "clamp(80px, 11vw, 160px)"
  trilho: "64px"
  container: "1240px"
components:
  button-orcamento:
    backgroundColor: "{colors.amarelo}"
    textColor: "{colors.tinta}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-verde:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.branco}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp}"
    textColor: "{colors.branco}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  button-on-yellow:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.branco}"
    typography: "{typography.control}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "52px"
  placa:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.branco}"
    rounded: "{rounded.placa}"
    padding: "18px 18px 12px"
  marco-km:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.marco}"
    padding: "11px 8px 6px"
  ticket:
    backgroundColor: "{colors.ticket-papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    padding: "6px 20px 18px"
  button-add-romaneio:
    backgroundColor: "{colors.amarelo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "42px"
  button-add-romaneio-added:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.branco}"
  carimbo:
    textColor: "{colors.serrado}"
    typography: "{typography.label}"
    rounded: "{rounded.carimbo}"
    padding: "4px 8px 3px"
  chip:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
  chip-selected:
    backgroundColor: "{colors.verde}"
    textColor: "{colors.branco}"
  input:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    height: "46px"
  legenda-3d:
    backgroundColor: "{colors.branco}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.placa}"
    padding: "16px 18px"
    width: "330px"
  gaveta-romaneio:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    width: "min(460px, 100%)"
  button-romaneio-topo:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.branco}"
    rounded: "{rounded.md}"
    padding: "0 16px 0 14px"
    height: "48px"
---

# Design System: Grupo Larssen

## Overview

**Creative North Star: "Rota da Madeira"**

The whole site is one road. Km 0 is the talhão, the end is the client's obra, and the five group companies (Florestal, Madeireira, Tratadas, Escavações, Log) are exits on it. The visual system is borrowed from the Brazilian highway in daylight: neutral concrete shoulder for the ground, asphalt for ink and road surfaces, green road signs for everything that names or navigates, and painted yellow for the route itself and the one action the route leads to, the orçamento. Wood color is never painted; it arrives only through real photographs of the real plant.

Density is generous and physical. Sections breathe on a tall block rhythm, headlines are set in a condensed highway grotesk at sign scale, and specifications (bitolas, km, m³, hectares) are treated as content in tabular numerals on ruled lines. Products are romaneios: ruled paper load tickets with a perforated tear edge and rubber stamps for each processing stage. Motion is abundant but tied to travel: a scroll-driven 3D drive through forest, sawmill and autoclave; a fixed road rail with a truck and km counter; a horizontal route section with a truck on asphalt; autoclave stations that advance with scroll.

Confirmed rejections (PRODUCT.md, Douglas' standing rules): no dark ground, no cream/beige paper, no serif display with gold and black, no purple or neon gradients, no colored glow. Original company logos stay legible in their own colors and are never redrawn.

**Key Characteristics:**
- Neutral concrete ground (never cream), asphalt ink, sign-green signage, road-yellow route.
- Barlow Condensed 800 at road-sign scale for headings and every control; Barlow for reading.
- Tabular numerals for every km, bitola, count and year.
- Products as ruled romaneio tickets with serrilha and stage carimbos.
- Road furniture as UI: placas, marcos de km, asphalt strips with dashed yellow centerlines.
- Scroll-linked motion everywhere; autonomous loops are decoration and switch off in calmo mode.

## Colors

A daylight roadside palette: cool neutral concrete and asphalt, one saturated sign green, one reserved road yellow, with wood tones left to photography.

### Primary
- **Road-Sign Green** (verde): the group color from the logo. Owns all signage: placas, the header mark, the mobile menu, the transition cortina, the autoclave section, the footer, the gaveta header, the selected chip, the "added" state of add-to-romaneio, km labels on the rail, checkmarks in service lists, focus border on fields.
- **Deep Sign Green** (verde-esc): green as text on light ground (link arrows, active nav, big spec numerals, the floresta carimbo, the active mini-route stage).
- **Green Wash** (verde-fundo): the only tinted fill, behind channel icons on the contact page.

### Secondary
- **Road Yellow** (amarelo): painted-line yellow. Route lines and dashes, the km rail progress, the top of every marco, the active station on the autoclave route, the active stop of the product mini-route, the orçamento action (primary buttons, add-to-romaneio, the romaneio counter badge, the closing orçamento band). Also the focus ring, text selection and skip link, where it acts as a safety color.
- **Worn Yellow** (amarelo-esc): yellow at ink weight for thin marks on light ground: the dashed route on the Brazil map, the tick before each bitola, link underline on hover.

### Tertiary
- **Sawn Brown** (serrado) and **Autoclave Teal** (autoclavado): stamp inks for the serraria and autoclave carimbos only. Beneficiamento uses a one-off ochre ink (#7a5a14) and floresta uses Deep Sign Green.
- **WhatsApp Green** (whatsapp): the WhatsApp channel button only, darkened from the brand green to carry white text.

### Neutral
- **Concrete Paper** (papel): the page ground, the gaveta body, the loader.
- **Shoulder Concrete** (concreto): alternate section ground (route section, map section, light capas), scrollbar track, quantity-button hover.
- **Joint Line** (linha) and **Kerb Line** (linha-2): hairlines, dashed list rules, field and chip strokes, image placeholders.
- **Asphalt Ink** (tinta): text, the romaneio header button, buttons on the yellow band, toast.
- **Weathered Ink** (tinta-2) and **Faded Ink** (tinta-3): secondary copy, ticket codes, labels.
- **Asphalt** (asfalto): road surfaces only (rail, route strip, timeline, loader bar, footer road, dark capa fallback), always edged in a pale kerb line (#d8d2c4) where it is a full road.
- **Ticket Paper** (ticket-papel): the near-white stock of romaneio tickets.
- **Error Red** (erro): invalid field border and error text.

### Named Rules
**The Painted Line Rule.** Road Yellow is reserved for the route (lines, dashes, km markers, progress, active stops) and the orçamento action (primary button, add-to-romaneio, counter, closing band). Focus ring and selection are the only other uses. Never use it as a decorative fill, a heading color or a generic highlight.

**The Signage Rule.** Anything that names a place or a company on the route is a green placa with white condensed type. Green is not used for body text blocks or large decorative fills outside the signage surfaces listed above.

**The No Cream Rule.** The ground is neutral concrete (papel / concreto). Warm cream or beige grounds are rejected; wood warmth comes only from photographs.

## Typography

**Display Font:** Barlow Condensed (with Barlow, system-ui)
**Body Font:** Barlow (with system-ui)

**Character:** The Brazilian highway-sign grotesk in two widths. Condensed heavy for anything you would read on a sign at speed (headings, buttons, nav, labels, numbers); regular Barlow for anything you read standing still. Both are self-hosted (fontes/fontes.css, weights 400 to 800).

### Hierarchy
- **Display** (800, clamp(3rem, 7.4vw, 6rem), 0.98): page h1, hero and capas. Balanced wrap; capas cap at 14ch.
- **Headline** (800, clamp(2.3rem, 5vw, 4.2rem), 0.98): section h2.
- **Statement** (700, clamp(2rem, 4.2vw, 3.6rem), 1.12): the scroll-lit sentence; words start at 18% ink and light up as you scroll, data words light in green. Max 22ch.
- **Title** (800, clamp(1.5rem, 2.4vw, 2.1rem), 1.04): h3, route stops, company blocks; fixed 24 to 30px inside tickets, stations, legenda and gaveta.
- **Numeral** (800, 28 to 40px, 1, tabular): spec figures in data rows, numbers tables and CCA facts; years at 34px on the timeline.
- **Lead** (400, clamp(1.15rem, 1.6vw, 1.4rem), 1.45, Weathered Ink): the paragraph under a section head.
- **Body** (400, 18px, 1.55): reading text, max 68ch; secondary copy 16 to 17px.
- **Control** (700, 16 to 18px, 1, 0.02 to 0.03em): buttons, nav (600, 17px), chips (600, 16px), links with arrows.
- **Label** (600 to 800, 11 to 15px, 0.06 to 0.14em, uppercase): ticket code lines, field labels, placa titles, carimbos, km tags, counts, table headers.

### Named Rules
**The Tabular Rule.** Every km, bitola, quantity, year and statistic uses tabular numerals so values align like a spec sheet.

**The Two Widths Rule.** Condensed is for signs and controls, regular is for reading. Never set a paragraph in Barlow Condensed, never set a heading or button in regular Barlow.

## Layout

A single centered column (max 1240px, side margin clamp(16px, 4vw, 56px)) that, at 1100px and up, shifts right by a 64px rail gutter so content never collides with the fixed road rail on the left. Sections stack on a tall vertical rhythm (clamp(80px, 11vw, 160px)) with alternating Concrete Paper and Shoulder Concrete grounds, interrupted by full-color bands (green autoclave, yellow orçamento, green footer) and full-bleed photo bands with dark-green scrims.

Two-column splits use unequal fractions (1.05 to 1.3 against 1) with a gutter of clamp(30px, 5vw, 80px); company blocks alternate image side. The gallery is a 12-column 7/5, 5/7 rhythm. The catalog is an auto-fill grid of tickets (min 300px, 26px gap) under a sticky filter bar. The route section pins and scrolls horizontally on wide screens, and stacks vertically below 760px.

Breakpoints: 1100px (rail, desktop nav and Lenis on; below it the rail becomes a 4px top progress bar and the nav becomes a full-screen green menu), 900/860px (splits collapse to one column), 760px (route stacks), 560 to 520px (footer one column, romaneio button drops its label).

## Elevation & Depth

Depth comes from physical objects on the shoulder, not from layered UI. Surfaces are flat at rest; photographs, tickets and floating panels carry a soft, low, ink-tinted drop shadow, and pressable controls carry a bottom inset like a raised plate. The 3D hero carries the real depth: a flat-shaded Lambert daylight scene with no post-processing.

### Shadow Vocabulary
- **Lifted Object** (`box-shadow: 0 18px 40px -22px rgba(27,33,29,.45), 0 2px 6px -2px rgba(27,33,29,.12)`): photos, legenda 3D, contact form map, ticket on hover, toast.
- **Resting Object** (`box-shadow: 0 8px 22px -14px rgba(27,33,29,.5)`): tickets at rest, placas, map pins, contact form, channel cards on hover.
- **Pressed Plate** (`box-shadow: 0 10px 22px -14px rgba(27,33,29,.7), inset 0 -3px 0 rgba(0,0,0,.14)`): buttons; the drop grows to 16px/26px on hover with a 2px lift.
- **Sign Keyline** (`box-shadow: inset 0 0 0 4px #54763a, inset 0 0 0 6px rgba(255,255,255,.92)`): the white border inside every placa.
- **Gaveta Edge** (`box-shadow: -20px 0 50px -20px rgba(0,0,0,.4)`): the romaneio drawer.

### Named Rules
**The Ink Shadow Rule.** Shadows are always tinted with Asphalt Ink, negative-spread and soft. No colored glow, no hard offset shadows.

## Shapes

Corners are road-furniture rounded, never pill and never sharp: placas and photos at 12px, buttons and tickets at 10px, fields at 9px, nav items and gallery tiles at 8px, carimbos at 5px. The marco de km has a sign-post silhouette (6px top, 3px bottom). Chips are the only pill (20px). Station numbers on the autoclave route are the only circles. Recurring geometry: dashed yellow centerlines (10/10 vertical, 18/16 horizontal), dashed hairline list rules, ruled-paper backgrounds (one line every 32px on tickets, 48px in the gaveta), and the scalloped serrilha tear edge on tickets.

## Components

### Buttons
Raised plates with condensed type, confident and tactile.
- **Shape:** gently rounded plate (10px), 52px tall, 24px side padding, optional 20px leading/trailing line icon.
- **Orçamento (primary):** Road Yellow with Asphalt Ink text. This is the only yellow button.
- **Verde / Branco / Linha:** Road-Sign Green with white, white with ink, or transparent with a 2px currentColor inset outline, for secondary routes.
- **WhatsApp:** WhatsApp Green with white text, always paired next to the orçamento action.
- **On the yellow band:** buttons invert to Asphalt Ink with white text so the band itself is the yellow.
- **Hover / Active:** lift 2px with a deeper drop (0.25s, ease-out-expo), press 1px down. Disabled at 45% opacity, no lift.
- **Arrow link:** condensed 700 in Deep Sign Green, arrow slides 5px right on hover.

### Placa (road sign)
- **Style:** solid Road-Sign Green panel, 12px corners, white 2px keyline inset 4px from the edge, white Barlow Condensed, Resting Object shadow.
- **Uses:** the header mark, the hero exits sign (titled list of the five companies, each a link with a white km tag in Deep Sign Green), company placas on collages and capas, the loader mark. Rows highlight with 16% white on hover or when active.

### Marco de km
- **Style:** white sign-post (6px/6px/3px/3px corners) with a 6px Road Yellow cap and a Kerb Line inset hairline; condensed 700 12px uppercase label over a 20px tabular number.
- **Uses:** km markers on route photos, map pins on the 3D scene (with a white stake), the legenda 3D.

### Romaneio ticket (product card)
- **Corner Style:** 10px, overflow clipped.
- **Background:** Ticket Paper, photo on top (16:10), then the serrilha (a 14px scalloped tear edge punched in the page color), then a body ruled every 32px.
- **Content:** uppercase code line, 26px condensed title (whole card is the link), use line, bitolas list with a short Worn Yellow tick before each tabular value, carimbos, and a footer with species and the add-to-romaneio button.
- **Shadow Strategy:** Resting Object at rest; on hover lifts 4px to Lifted Object and the photo scales to 1.06 (0.4s / 0.8s).
- **Add to romaneio:** 42px Road Yellow button (9px corners); turns Road-Sign Green with white text once added.
- **On the product page** the ticket becomes the sticky spec column next to a 4:3 photo, with a ruled bitola table and a mini-route (forest, sawmill, beneficiamento, autoclave) where reached stops are asphalt with a yellow dot.

### Carimbo (stage stamp)
- **Style:** 2.5px outline in the stage ink, same-color condensed 800 12px uppercase text at 0.12em, 5px corners, rotated between -2 and 2 degrees, multiply blend so it reads as ink on paper.
- **Inks:** floresta Deep Sign Green, serraria Sawn Brown, beneficiamento ochre, autoclave Autoclave Teal.

### Trilho da rota (signature)
- **Desktop (1100px+):** a fixed 20px asphalt rail on the left edge with a kerb outline, a dashed yellow centerline that scrolls with the page, a solid yellow "done" line growing with scroll, a truck marker riding at the scroll position, and a km tag (green, white uppercase 11px) beside it. Company sections branch off as short green exit ticks that turn yellow when active.
- **Below 1100px:** collapses to a 4px concrete bar under the header with a yellow progress fill; it hides with the header.
- The same road vocabulary repeats as the horizontal route strip with a truck, the timeline spine, the loader bar counting km 0 to 21, and the footer road.

### Legenda 3D
- **Style:** 92% white panel, 12px corners, Lifted Object shadow, 330px wide, bottom-right of the 3D stage; a marco on the left spanning two rows, a 24px title and 16px copy. Below 1100px it moves top-left under the header at up to 360px with 14px copy.

### Cortina (page transition)
- A full-screen Road-Sign Green panel that slides up from below (0.55s) with the white group mark fading in, then exits upward (0.7s). The home page instead uses a concrete loader that clips away upward (0.9s).

### Gaveta do romaneio (quote drawer)
- **Style:** right-side drawer, min(460px, 100%), Concrete Paper body ruled every 48px, Road-Sign Green header with a 30px condensed title and an outlined close button, white footer with the form and send actions; 45% Asphalt Ink scrim. Slides in over 0.55s.
- **Rows:** condensed 19px item name, faded spec, a white quantity stepper (1.5px Kerb stroke, 8px corners, tabular input), and a remove button that tints red on hover; rows separate with dashed Kerb rules.
- **Trigger:** the header romaneio button in Asphalt Ink with a Road Yellow count badge that pops to 1.35x when an item is added. A toast in Asphalt Ink with a yellow icon confirms.

### Chips and filters
- **Style:** 40px white pills with a 1.5px Kerb stroke and condensed 600 16px text; hover strokes green; pressed fills Road-Sign Green with white. They live in a sticky 96% Concrete Paper filter bar with a search field and an uppercase result count.

### Inputs / Fields
- **Style:** white, 1.5px Kerb Line stroke, 9px corners, min 46px tall, 17px text, uppercase condensed 14px label above.
- **Focus:** stroke turns Road-Sign Green with an 18% green 3px halo. Global focus-visible elsewhere is a 3px Road Yellow outline offset 3px.
- **Error:** stroke and message in Error Red.

### Navigation
- **Header:** fixed, 78px (68px mobile), transparent over the hero, turning 94% Concrete Paper with a hairline and blur once scrolled; hides on scroll down. Green placa mark left; condensed 600 17px nav items at 44px tall with 8px corners, green-tinted hover and current state; the empresas item opens a dropdown that is itself a green placa.
- **Mobile:** a green menu button opens a full-screen Road-Sign Green menu that wipes down (clip-path, 0.6s) with 30 to 44px condensed links and the five exits with their icons.

### Motion
- **Easing:** one curve, ease-out-expo (cubic-bezier(.22, 1, .36, 1)), for every transform; durations 0.25s for controls, 0.4 to 0.55s for panels, 0.9 to 1.25s for reveals and image masks.
- **Reveals:** content rises 26px and fades in; photos unmask top-down with a ground-colored cover.
- **Calmo policy (prefers-reduced-motion):** keep everything that is driven by scroll and conveys position (the 3D camera progress, the km rail and truck, the horizontal route, autoclave stations, the lit statement, fades). Drop everything autonomous or displacing: Lenis smooth scroll, parallax on photos and route images, mouse parallax and idle animation in the 3D scene, the scroll-hint drip, the map origin pulse, the moving footer road, reveal translation, and hover lifts on tickets and buttons.

## Do's and Don'ts

### Do:
- **Do** keep the ground Concrete Paper (#f3f4f1) or Shoulder Concrete (#e7e9e4) and let wood color come only from real photographs.
- **Do** reserve Road Yellow (#f2b705) for the route and the orçamento action, plus focus and selection.
- **Do** name every company and destination on a green placa with the white inset keyline.
- **Do** set every km, bitola, count and year in tabular numerals.
- **Do** present products as romaneio tickets: ruled stock, serrilha, bitolas list and stage carimbos.
- **Do** tie motion to scroll position, use the single ease-out-expo curve, and honor the calmo policy.
- **Do** pair the orçamento button with the WhatsApp button wherever a path ends.
- **Do** keep original company logos in their own colors on white or light ground.

### Don't:
- **Don't** use cream or beige grounds, or a dark page ground.
- **Don't** use serif display with gold and black, purple or neon gradients, or colored glow.
- **Don't** use yellow as a decorative fill, heading color or generic highlight.
- **Don't** set paragraphs in Barlow Condensed or headings and buttons in regular Barlow.
- **Don't** use hard offset shadows or uncolored black shadows; shadows are soft and ink-tinted.
- **Don't** redraw or recolor the original company logos.
- **Don't** add autonomous loops that cannot be switched off by the calmo policy.

## Additions (2026-10-15, improvement round)

- **3D scene finish:** MeshStandard materials with a RoomEnvironment reflection for metal, glass and water; layered pines, pale-trunk eucalyptus and clustered native crowns; canopy-darkened ground; açude; drifting cloud sprites; sawmill dust in the sun; the sun follows the camera target so shadows stay crisp. Post chain on desktop: RenderPass → OutputPass → grading pass (slight contrast and warmth, vignette, film grain).
- **Dissolve to paper:** the last 14% of the hero scroll dissolves the scene into the page ground (#F3F4F1) through fbm noise with a thin signage-green edge; signage, caption and pins fade with it. Mobile (no post chain) fades the canvas instead.
- **Section headings with km post:** `.cabeca.com-marco` places a marco de km beside the h2 (never above it). Use only where the km is real route information.
- **Catalog as romaneio:** products are grouped by line (`.grupo-cat` with marco, h2, description and item count) and shown by default as a ruled ledger (`.vista-lista`: photo, name and use, bitolas, carimbos, species and add button per row). A "Fotos" toggle switches to the ticket grid (`.vista-grade`); the choice is remembered per visitor. Filters hide empty groups. On phones the filter chips are a single swipeable strip.

## 3D scene v3 (2026-10-15, realism round)

- **Materials:** CC0 Poly Haven sources in `assets/3d` (see `ORIGEM.txt`): sky HDRI `kloofendal_48d_partly_cloudy_puresky` for image-based lighting and background, terrain splat (aerial grass, forest leaves, red laterite soil, sawdust) driven by a per-vertex `pesos` attribute, textured asphalt with yellow centre and white edge lines, corrugated metal roofs, plaster walls, bark logs and plank bundles.
- **Trees:** photographic sprites (pinus, eucalipto, araucária, nativa) generated in Google Gemini on magenta, keyed and packed into `arvores.webp`; rendered as instanced cylindrical billboards with wind sway, alpha-tested shadows and per-instance tint.
- **Brand in scene:** green "GRUPO LARSSEN" road sign at the yard entrance (logo drawn from `assets/logos/grupo.svg`), boiler chimney with smoke.
- **Post chain (desktop):** soft bloom (threshold above 1), output, final pass with miniature tilt-shift blur at top and bottom, grading, vignette, grain and the dissolve to paper. Mobile skips normal maps and post.
