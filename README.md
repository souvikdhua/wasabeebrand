# WASABEE — Oriental Cuisine · Kolkata

> *A cinematic, motion-rich restaurant website built for a premium dining experience.*

---

## 🎯 The Vision

Wasabee is not just a restaurant — it's an experience. The website needed to reflect that identity completely. Inspired by the legendary **[Sushi Jiro](https://www.sushi-jiro.jp)** website — one of the most beautiful and minimal restaurant sites in the world — the goal was to build something that felt:

- **Cinematic** — every scroll should feel like a film sequence
- **Minimal** — nothing unnecessary, every element earns its place
- **Authentic** — rooted in Japanese/Oriental visual language with Kanji accents, red ink aesthetic, and editorial typography
- **Functional** — not just beautiful, but conversion-ready with direct ordering links to Zomato, Swiggy, WhatsApp, and Google Maps

The client's brand identity is deeply tied to **red** — a bold, high-contrast palette drawn from traditional Japanese art and Japanese street posters. The brand artwork (koi fish, Japanese umbrellas, gyoza, Wasabee wordmark in red line art) directly influences the entire visual tone of the site.

---

## 🌐 Live Links

| Platform | Link |
|----------|------|
| **Zomato** | [zoma.to/r/22188](http://zoma.to/r/22188) |
| **Swiggy** | [swiggy.com/.../wasabee](https://www.swiggy.com/city/kolkata/wasabee-kalikapur-ruby-area-rest33209) |
| **Google Maps** | [maps.google](https://share.google/Fpbui7WFzKV8RP00X) |
| **Google Rating** | ⭐ 4.5 / 5 |

---

## 📍 Locations & Contact

| Branch | Address | Phone |
|--------|---------|-------|
| **Bypass – South City Connector** | 30, Arya Vidyalaya Road, Kolkata 700 078 (Opp. National Furniture) | 9163764444 · 9831626544 |
| **Deshapriya Park** | Kolkata | 9073948146 · 9163000200 |
| **Corporate / Events** | — | +91 89813 59413 |
| **Website** | [wasabee.in](http://www.wasabee.in) | — |

---

## 🏗️ Project Architecture

```
wasabee/
├── index.html        # Single-page application — all sections
├── styles.css        # Full design system + component styles (~2100 lines)
├── script.js         # All JS animations, interactions, observers
└── images/
    ├── wasabee logo .svg       # Official Wasabee wordmark (SVG)
    ├── wasabee-brand.jpg       # Brand graphic (koi, umbrellas, gyoza) 
    ├── lucky-cat.jpg           # Red Maneki-neko cat poster (Hero BG)
    ├── noodles-cat.jpg         # "Noodles For Life" cat illustration
    ├── sushi-poster.jpg        # Sushi dictionary illustration poster
    ├── menu-card.jpg           # NOM menu card artwork
    ├── zomato-1.svg            # Official Zomato brand SVG
    ├── swiggy-1.svg            # Official Swiggy brand SVG
    ├── google-maps-logo.svg    # Official Google Maps pin SVG
    └── whatsapp-logo.svg       # Official WhatsApp brand SVG
```

---

## 🎨 Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0a0a0a` | Primary background |
| `--color-surface` | `#111111` | Cards, overlays |
| `--color-red` | `#c62828` | Primary brand accent |
| `--color-red-bright` | `#e53935` | Hover states, highlights |
| `--color-cream` | `#f5f0e8` | Primary text |
| `--color-gold` | `#d4a574` | Prices, special accents |
| `--color-text-muted` | `#9e9e9e` | Secondary text |
| `--color-text-dim` | `#616161` | Tertiary text |

### Typography
| Font | Role | Source |
|------|------|--------|
| **Playfair Display** | Headings, brand | Google Fonts |
| **Inter** | Body copy, UI labels | Google Fonts |
| **Noto Serif JP** | Japanese Kanji accents | Google Fonts |

### Motion Language
All animations use a custom cubic-bezier `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` for a signature deceleration feel — smooth, authoritative, premium.

---

## 📄 Page Sections

### 1. `#hero` — Full Screen Hero
- **Background**: Red Maneki-neko cat poster (Ken Burns slow zoom animation)
- **Overlay**: Multi-stop gradient for depth
- **Content**: Japanese Kanji subtitle → WASABEE title (character-by-character reveal)
- **Action Marquee**: An edge-to-edge red ticker pinned to the bottom of the hero overlay. Features infinitely scrolling, pause-on-hover bold typography for Google Maps (4.5★), Zomato, Swiggy, WhatsApp.

### 2. `#about` — About Wasabee
- Split grid: Brand image left, story copy right
- Red decorative border offset on image
- Animated stat counters (years of excellence, dishes, etc.)
- Japanese character watermark

### 3. `#menu` — Full Menu with Category Filter
All 60+ menu items across 8 categories:

| Category | Items |
|----------|-------|
| **Dumplings** | Gyoza, Siu Mai, Prawn Har Gow, Xiao Long Bao, Bao Buns |
| **Korean Sushi** | Kimbap varieties, Korean Spicy Rolls |
| **Japanese Sushi** | Sushi Platter, Uramaki, California, Buta No Tempura, Chicken Teriyaki, Nigiri, Maki, Tamaki, Futomaki, Philadelphia |
| **Korean Mains** | Bibimbap, Tteokbokki, Korean Fried Rice, Japchae, Kimchi Fried Rice |
| **Japanese Classics** | Tonkatsu, Chicken Katsu, Ramen (various), Tempura, Yakitori |
| **Thai / Pan Asian** | Pad Thai, Thai Curries, Tom Yum, Som Tum |
| **Chinese** | Dim Sum, Spring Rolls, Hakka Noodles, Manchurian |
| **Desserts** | Mochi, Matcha, Korean Bingsu |

### 4. `#gallery` — Image Gallery
- 4-column masonry-style grid with lightbox
- Hover overlay with title reveal
- Click to expand in full-screen lightbox

### 5. `#features` — Brand Feature Cards
- Three editorial cards: Space / Experience / Craft
- Hover lift with red title color transition

### 6. `#order` — Order Online
- Delivery platform cards: Zomato, Swiggy, Google Maps
- Real ratings, brand logos, CTAs

### 7. `#reservation` — Reserve a Table
- Elegant CTA with animated red fill button

### 8. `#contact` — Access / Locations
- Both location addresses and phone numbers
- Embedded Google Maps (dark-filtered, full-color on hover)
- Operating hours grid

---

## ✨ Key Interactions & Animations

| Feature | Implementation |
|---------|----------------|
| **Preloader** | WASABEE wordmark → red line reveals → fade out |
| **Custom cursor** | Red magnetic dot + ring that follows with lag (desktop only) |
| **Character reveal** | Hero title letters fly up one by one with staggered delay |
| **Scroll reveal** | `IntersectionObserver` triggers fade/slide/scale on viewport entry |
| **Parallax** | `data-parallax` attribute system on section backgrounds |
| **Ken Burns** | Hero image slowly zooms and pans over 25s |
| **Counter animation** | Stats count up from 0 with easeOutExpo curve |
| **Magnetic buttons** | CTA buttons physically follow mouse cursor |
| **Gallery lightbox** | Click-to-expand with `<Escape>` to close |
| **Menu filter** | Category tabs instantly show/hide items with `fadeInUp` animation |
| **Marquee** | Red ticker strip with auto-duplicated content |
| **Hamburger menu** | Full-screen dark overlay with link stagger |

---

## 🚀 Deployment

### Local Development
```bash
# Navigate to project
cd "/Users/souvik/Documents/untitled folder/wasabee"

# Serve locally (Node.js)
npx serve .
# or
python3 -m http.server 3000
```
Open `http://localhost:3000`

### GitHub
Repository: [github.com/souvikdhua/wasabee-website](https://github.com/souvikdhua/wasabee-website)

```bash
# Push updates
git add .
git commit -m "your message"
git push origin main
```

### Netlify
1. Connect GitHub repo at [app.netlify.com](https://app.netlify.com)
2. Build command: *(leave blank)*
3. Publish directory: `.`
4. Auto-deploys on every `git push`

---

## 🗺️ Roadmap / Future Enhancements

- [ ] Online reservation form with email notification
- [ ] WhatsApp order button with pre-filled menu message
- [ ] Multi-language toggle (English / Japanese / Bengali)
- [ ] Admin CMS for menu updates (Netlify CMS / Contentful)
- [ ] Instagram feed integration in Gallery section
- [ ] SEO optimization — Google Search Console setup
- [ ] Performance audit — image WebP conversion, lazy loading
- [ ] Mobile gesture enhancements (swipe gallery)

---

## 👤 Credits

**Brand & Vision**: Wasabee Oriental Cuisine, Kolkata  
**Design Inspiration**: [sushi-jiro.jp](https://www.sushi-jiro.jp)  
**Development**: Built with pure HTML · CSS · JavaScript — no frameworks, no dependencies  
**Fonts**: Google Fonts (Playfair Display, Inter, Noto Serif JP)

---

*"Good design is as little design as possible."* — Dieter Rams
