/* ═══════════════════════════════════════════════════════════════
   WASABEE — Pretext Effects Engine
   Powered by @chenglou/pretext for zero-DOM text measurement
   ═══════════════════════════════════════════════════════════════ */

let pretextLoaded = false;
let pretextModule = null;

// ─── CDN LOADER ───
async function loadPretext() {
  try {
    pretextModule = await import('https://esm.sh/@chenglou/pretext@0.0.4');
    pretextLoaded = true;
    console.log('[Wasabee] Pretext loaded successfully');
    return true;
  } catch (e) {
    console.warn('[Wasabee] Pretext failed to load, graceful degradation active.', e);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// EFFECT 1: EDITORIAL TEXT REFLOW — About Section
// Text flows around interactive floating sakura orbs
// ═══════════════════════════════════════════════════════════════

const ABOUT_BODY_FONT = '17px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, Georgia, serif';
const ABOUT_LINE_HEIGHT = 28;
const DROP_CAP_LINES = 3;
const MIN_SLOT_WIDTH = 40;
const ORB_H_PAD = 14;
const ORB_V_PAD = 6;

const ABOUT_TEXT = `At Wasabee, we honor the centuries-old traditions of Japanese, Korean, Thai & Chinese cuisine while crafting something entirely new. Every dish is a canvas: from hand-rolled sushi to steaming bowls of ramen, each plate tells a story of precision, passion, and the freshest ingredients.

With two locations in Kolkata, at Bypass and Deshapriya Park, we bring authentic Oriental flavors to your neighborhood. Our chefs blend techniques from across Asia with bold, contemporary flair. Each bite is a journey — from the delicate artistry of nigiri to the fiery depths of a Korean gochujang glaze.

We source the finest ingredients, from Norwegian salmon flown in weekly to house-made kimchi aged to perfection. Our kitchen is a theater of craft where every grain of rice is seasoned with intention, every broth simmered for hours, and every plate composed with the eye of an artist.

Wasabee is more than a restaurant. It is a bridge between cultures, a meeting point of tradition and innovation, a place where every meal becomes a memory worth keeping.`;

// Sakura-themed orb definitions
const orbDefs = [
  { fx: 0.25, fy: 0.35, r: 65, vx: 12, vy: 8,  color: [195, 90, 130] },  // sakura deep
  { fx: 0.72, fy: 0.55, r: 55, vx: -9, vy: 14, color: [180, 120, 160] }, // sakura light
  { fx: 0.50, fy: 0.70, r: 48, vx: 14, vy: -10, color: [130, 6, 106] },  // wasabee brand
];

let editorialStage = null;
let editorialOrbs = [];
let editorialOrbEls = [];
let editorialLinePool = [];
let editorialDropCapEl = null;
let editorialPrepared = null;
let editorialDropCapPrepared = null;
let editorialDropCapWidth = 0;
let editorialDrag = null;
let editorialPointer = { x: -9999, y: -9999 };
let editorialLastFrame = null;
let editorialRaf = null;
let editorialActive = false;

function createOrbElement(color, parent) {
  const el = document.createElement('div');
  el.className = 'pretext-orb';
  el.style.background = `radial-gradient(circle at 35% 35%, 
    rgba(${color[0]},${color[1]},${color[2]},0.45), 
    rgba(${color[0]},${color[1]},${color[2]},0.15) 55%, 
    transparent 72%)`;
  el.style.boxShadow = `0 0 50px 12px rgba(${color[0]},${color[1]},${color[2]},0.22), 
    0 0 100px 35px rgba(${color[0]},${color[1]},${color[2]},0.08)`;
  parent.appendChild(el);
  return el;
}

function circleIntervalForBand(cx, cy, r, bandTop, bandBottom, hPad, vPad) {
  const top = bandTop - vPad;
  const bottom = bandBottom + vPad;
  if (top >= cy + r || bottom <= cy - r) return null;
  const minDy = (cy >= top && cy <= bottom) ? 0 : (cy < top ? top - cy : cy - bottom);
  if (minDy >= r) return null;
  const maxDx = Math.sqrt(r * r - minDy * minDy);
  return { left: cx - maxDx - hPad, right: cx + maxDx + hPad };
}

function carveSlots(base, blocked) {
  let slots = [base];
  for (const interval of blocked) {
    const next = [];
    for (const slot of slots) {
      if (interval.right <= slot.left || interval.left >= slot.right) {
        next.push(slot);
        continue;
      }
      if (interval.left > slot.left) next.push({ left: slot.left, right: interval.left });
      if (interval.right < slot.right) next.push({ left: interval.right, right: slot.right });
    }
    slots = next;
  }
  return slots.filter(s => s.right - s.left >= MIN_SLOT_WIDTH);
}

function syncLinePool(pool, count, parent) {
  while (pool.length < count) {
    const el = document.createElement('span');
    el.className = 'pretext-line';
    parent.appendChild(el);
    pool.push(el);
  }
  for (let i = 0; i < pool.length; i++) {
    pool[i].style.display = i < count ? '' : 'none';
  }
}

function layoutEditorialColumn(prepared, startCursor, regionX, regionY, regionW, regionH, lineHeight, circleObstacles) {
  const { layoutNextLine } = pretextModule;
  let cursor = startCursor;
  let lineTop = regionY;
  const lines = [];
  let done = false;

  while (lineTop + lineHeight <= regionY + regionH && !done) {
    const bandTop = lineTop;
    const bandBottom = lineTop + lineHeight;
    const blocked = [];

    for (const obs of circleObstacles) {
      const interval = circleIntervalForBand(obs.cx, obs.cy, obs.r, bandTop, bandBottom, obs.hPad, obs.vPad);
      if (interval) blocked.push(interval);
    }

    const slots = carveSlots({ left: regionX, right: regionX + regionW }, blocked);
    if (slots.length === 0) {
      lineTop += lineHeight;
      continue;
    }

    const sorted = [...slots].sort((a, b) => a.left - b.left);
    for (const slot of sorted) {
      const w = slot.right - slot.left;
      const line = layoutNextLine(prepared, cursor, w);
      if (!line) { done = true; break; }
      lines.push({
        x: Math.round(slot.left),
        y: Math.round(lineTop),
        text: line.text,
        width: line.width
      });
      cursor = line.end;
    }
    lineTop += lineHeight;
  }
  return { lines, cursor };
}

function initEditorialReflow() {
  const aboutContent = document.querySelector('#about .about-content');
  if (!aboutContent || !pretextLoaded) return;

  // Hide ALL original text paragraphs and keep title/stats visible
  const originalTexts = aboutContent.querySelectorAll('p.section-text');
  originalTexts.forEach(el => {
    el.style.setProperty('display', 'none', 'important');
    el.style.setProperty('visibility', 'hidden', 'important');
    el.style.setProperty('height', '0', 'important');
    el.style.setProperty('overflow', 'hidden', 'important');
    el.style.setProperty('margin', '0', 'important');
    el.style.setProperty('padding', '0', 'important');
  });
  // Also hide any .reveal containers that hold section-text
  aboutContent.querySelectorAll('.reveal').forEach(el => {
    if (el.querySelector('.section-text') || (el.classList.contains('section-text'))) return;
    // Keep title block and stats visible
  });

  // Create the editorial stage
  editorialStage = document.createElement('div');
  editorialStage.className = 'pretext-editorial-stage visible';
  editorialStage.id = 'pretext-about-stage';

  // Insert editorial stage after the title block, before stats
  const aboutStats = aboutContent.querySelector('.about-stats');
  if (aboutStats) {
    aboutStats.before(editorialStage);
  } else {
    aboutContent.appendChild(editorialStage);
  }

  // Prepare text - body text (everything after the first character, for editorial layout)
  const { prepareWithSegments, walkLineRanges } = pretextModule;
  const bodyText = ABOUT_TEXT.slice(1); // Skip first char (used as drop cap)
  editorialPrepared = prepareWithSegments(bodyText, ABOUT_BODY_FONT);

  // Drop cap
  const dropCapSize = ABOUT_LINE_HEIGHT * DROP_CAP_LINES - 4;
  const dropCapFont = `700 ${dropCapSize}px "Iowan Old Style", "Palatino Linotype", Georgia, serif`;
  editorialDropCapPrepared = prepareWithSegments(ABOUT_TEXT[0], dropCapFont);
  walkLineRanges(editorialDropCapPrepared, 9999, line => {
    editorialDropCapWidth = line.width;
  });

  // Create drop cap element
  editorialDropCapEl = document.createElement('div');
  editorialDropCapEl.className = 'pretext-drop-cap';
  editorialDropCapEl.textContent = ABOUT_TEXT[0];
  editorialDropCapEl.style.font = dropCapFont;
  editorialDropCapEl.style.lineHeight = `${dropCapSize}px`;
  editorialStage.appendChild(editorialDropCapEl);

  // Create orbs
  const stageRect = editorialStage.getBoundingClientRect();
  editorialOrbs = orbDefs.map(def => ({
    x: def.fx * Math.max(stageRect.width, 400),
    y: def.fy * Math.max(stageRect.height, 400),
    r: def.r,
    vx: def.vx,
    vy: def.vy,
    paused: false
  }));
  editorialOrbEls = orbDefs.map(def => createOrbElement(def.color, editorialStage));

  // Event listeners
  editorialStage.addEventListener('pointerdown', e => {
    const hit = hitTestEditorialOrbs(e.clientX, e.clientY);
    if (hit !== -1) {
      e.preventDefault();
      editorialDrag = {
        orbIndex: hit,
        startX: e.clientX,
        startY: e.clientY,
        startOrbX: editorialOrbs[hit].x,
        startOrbY: editorialOrbs[hit].y
      };
    }
  });

  window.addEventListener('pointermove', e => {
    if (!editorialStage) return;
    const stageRect = editorialStage.getBoundingClientRect();
    editorialPointer = { x: e.clientX - stageRect.left, y: e.clientY - stageRect.top };
    if (editorialDrag) {
      const orb = editorialOrbs[editorialDrag.orbIndex];
      orb.x = editorialDrag.startOrbX + (e.clientX - editorialDrag.startX);
      orb.y = editorialDrag.startOrbY + (e.clientY - editorialDrag.startY);
      scheduleEditorialRender();
    }
  });

  window.addEventListener('pointerup', () => {
    if (editorialDrag) {
      editorialDrag = null;
    }
  });

  // Start animation
  editorialActive = true;
  editorialLastFrame = null;
  scheduleEditorialRender();
}

function hitTestEditorialOrbs(px, py) {
  if (!editorialStage) return -1;
  const stageRect = editorialStage.getBoundingClientRect();
  const lx = px - stageRect.left;
  const ly = py - stageRect.top;
  for (let i = editorialOrbs.length - 1; i >= 0; i--) {
    const orb = editorialOrbs[i];
    const dx = lx - orb.x;
    const dy = ly - orb.y;
    if (dx * dx + dy * dy <= orb.r * orb.r) return i;
  }
  return -1;
}

function scheduleEditorialRender() {
  if (editorialRaf) return;
  editorialRaf = requestAnimationFrame(now => {
    editorialRaf = null;
    if (renderEditorial(now)) scheduleEditorialRender();
  });
}

function renderEditorial(now) {
  if (!editorialActive || !editorialStage || !editorialPrepared) return false;

  const stageRect = editorialStage.getBoundingClientRect();
  const stageW = stageRect.width;
  const stageH = Math.max(stageRect.height, 400);
  const dt = editorialLastFrame ? Math.min((now - editorialLastFrame) / 1000, 0.05) : 0.016;
  editorialLastFrame = now;

  // Animate orbs
  let stillAnimating = false;
  for (let i = 0; i < editorialOrbs.length; i++) {
    const orb = editorialOrbs[i];
    if (orb.paused || (editorialDrag && editorialDrag.orbIndex === i)) continue;
    stillAnimating = true;
    orb.x += orb.vx * dt;
    orb.y += orb.vy * dt;

    // Bounce
    if (orb.x - orb.r < 0) { orb.x = orb.r; orb.vx = Math.abs(orb.vx); }
    if (orb.x + orb.r > stageW) { orb.x = stageW - orb.r; orb.vx = -Math.abs(orb.vx); }
    if (orb.y - orb.r < 0) { orb.y = orb.r; orb.vy = Math.abs(orb.vy); }
    if (orb.y + orb.r > stageH) { orb.y = stageH - orb.r; orb.vy = -Math.abs(orb.vy); }
  }

  // Position orb DOM elements
  for (let i = 0; i < editorialOrbs.length; i++) {
    const orb = editorialOrbs[i];
    const el = editorialOrbEls[i];
    const d = orb.r * 2;
    el.style.width = `${d}px`;
    el.style.height = `${d}px`;
    el.style.left = `${orb.x - orb.r}px`;
    el.style.top = `${orb.y - orb.r}px`;
  }

  // Build circle obstacles
  const obstacles = editorialOrbs.map(orb => ({
    cx: orb.x, cy: orb.y, r: orb.r,
    hPad: ORB_H_PAD, vPad: ORB_V_PAD
  }));

  // Layout text with pretext — cursor starts at beginning (body text already excludes drop cap)
  const result = layoutEditorialColumn(
    editorialPrepared,
    { segmentIndex: 0, graphemeIndex: 0 },
    0, 0, stageW, stageH,
    ABOUT_LINE_HEIGHT, obstacles
  );

  // Render lines to DOM
  syncLinePool(editorialLinePool, result.lines.length, editorialStage);
  for (let i = 0; i < result.lines.length; i++) {
    const el = editorialLinePool[i];
    const line = result.lines[i];
    el.textContent = line.text;
    el.style.left = `${line.x}px`;
    el.style.top = `${line.y}px`;
    el.style.font = ABOUT_BODY_FONT;
    el.style.lineHeight = `${ABOUT_LINE_HEIGHT}px`;
  }

  // Update stage height
  if (result.lines.length > 0) {
    const lastLine = result.lines[result.lines.length - 1];
    const neededHeight = lastLine.y + ABOUT_LINE_HEIGHT + 30;
    editorialStage.style.minHeight = `${Math.max(neededHeight, 400)}px`;
  }

  // Position drop cap
  if (editorialDropCapEl) {
    editorialDropCapEl.style.left = '0px';
    editorialDropCapEl.style.top = '0px';
  }

  return stillAnimating || editorialDrag !== null;
}


// ═══════════════════════════════════════════════════════════════
// EFFECT 2: DYNAMIC PHILOSOPHY SPREAD
// Magazine-style text wrapping around the enso circle
// ═══════════════════════════════════════════════════════════════

const PHILOSOPHY_FONT = 'italic 19px "Iowan Old Style", "Palatino Linotype", Georgia, serif';
const PHILOSOPHY_LINE_HEIGHT = 30;

const PHILOSOPHY_TEXT = `We don't just serve food — we craft moments. Every grain of rice carries the weight of tradition. Every slice of fish tells the story of our dedication to perfection. In the art of ichigo-ichie, each encounter is unique, never to be repeated. This philosophy guides everything at Wasabee: from the first bow of welcome to the final delicate fold of a napkin. Our kitchen is a sanctuary where East meets West, where ancient techniques find new expression, and where every plate is a canvas waiting for its masterwork. This is not merely dining. This is the art of being present, of savoring the moment, of finding beauty in simplicity. Come, sit with us. Let the journey begin.`;

let philosophyStage = null;
let philosophyPrepared = null;
let philosophyLinePool = [];
let philosophyActive = false;

function initDynamicPhilosophy() {
  const philosophySection = document.querySelector('.philosophy-frame');
  if (!philosophySection || !pretextLoaded) return;

  // Create pretext stage
  philosophyStage = document.createElement('div');
  philosophyStage.className = 'pretext-philosophy-stage';
  philosophyStage.id = 'pretext-philosophy-stage';

  // Hide original quote
  const originalQuote = philosophySection.querySelector('.philosophy-content');
  if (originalQuote) originalQuote.style.display = 'none';

  // Insert stage
  const ensoCircle = philosophySection.querySelector('.enso-circle');
  if (ensoCircle) {
    ensoCircle.after(philosophyStage);
  } else {
    philosophySection.appendChild(philosophyStage);
  }

  // Prepare text
  const { prepareWithSegments } = pretextModule;
  philosophyPrepared = prepareWithSegments(PHILOSOPHY_TEXT, PHILOSOPHY_FONT);

  philosophyActive = true;
  renderPhilosophy();

  // Re-render on resize
  window.addEventListener('resize', () => {
    if (philosophyActive) requestAnimationFrame(renderPhilosophy);
  });
}

function renderPhilosophy() {
  if (!philosophyStage || !philosophyPrepared) return;

  const stageRect = philosophyStage.getBoundingClientRect();
  const stageW = stageRect.width;
  const stageH = Math.max(stageRect.height, 300);

  // Enso circle obstacle in center-ish
  const ensoObstacle = {
    cx: stageW * 0.5,
    cy: stageH * 0.35,
    r: Math.min(stageW * 0.18, 80),
    hPad: 16,
    vPad: 8
  };

  const result = layoutEditorialColumn(
    philosophyPrepared,
    { segmentIndex: 0, graphemeIndex: 0 },
    0, 0, stageW, stageH,
    PHILOSOPHY_LINE_HEIGHT,
    [ensoObstacle]
  );

  syncLinePool(philosophyLinePool, result.lines.length, philosophyStage);
  for (let i = 0; i < result.lines.length; i++) {
    const el = philosophyLinePool[i];
    const line = result.lines[i];
    el.textContent = line.text;
    el.style.left = `${line.x}px`;
    el.style.top = `${line.y}px`;
    el.style.font = PHILOSOPHY_FONT;
    el.style.lineHeight = `${PHILOSOPHY_LINE_HEIGHT}px`;
    el.style.color = 'var(--color-brand, #82066A)';
  }

  if (result.lines.length > 0) {
    const lastLine = result.lines[result.lines.length - 1];
    philosophyStage.style.minHeight = `${lastLine.y + PHILOSOPHY_LINE_HEIGHT + 20}px`;
  }
}


// ═══════════════════════════════════════════════════════════════
// EFFECT 3: TYPOGRAPHIC ASCII KANJI BACKDROP
// Flowing kanji/katakana characters form an organic background
// ═══════════════════════════════════════════════════════════════

const KANJI_CHARS = '寿司刺身餃子拉麺天婦羅和食美味料理包丁匠心技芸道場一期一会侘寂幽玄花鳥風月';
const KANJI_FONT_BASE = '"Noto Serif JP", "Hiragino Mincho ProN", serif';

let kanjiCanvas = null;
let kanjiCtx = null;
let kanjiParticles = [];
let kanjiAnimating = false;
let kanjiRaf = null;

function initTypographicBackdrop() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  kanjiCanvas = document.createElement('canvas');
  kanjiCanvas.className = 'pretext-kanji-canvas';
  kanjiCanvas.id = 'pretext-kanji-canvas';
  hero.insertBefore(kanjiCanvas, hero.firstChild);

  kanjiCtx = kanjiCanvas.getContext('2d');
  resizeKanjiCanvas();
  initKanjiParticles();

  kanjiAnimating = true;
  animateKanji();

  window.addEventListener('resize', () => {
    resizeKanjiCanvas();
    initKanjiParticles();
  });
}

function resizeKanjiCanvas() {
  if (!kanjiCanvas) return;
  const hero = kanjiCanvas.parentElement;
  kanjiCanvas.width = hero.offsetWidth * Math.min(window.devicePixelRatio, 2);
  kanjiCanvas.height = hero.offsetHeight * Math.min(window.devicePixelRatio, 2);
  kanjiCanvas.style.width = `${hero.offsetWidth}px`;
  kanjiCanvas.style.height = `${hero.offsetHeight}px`;
}

function initKanjiParticles() {
  if (!kanjiCanvas) return;
  const w = kanjiCanvas.width;
  const h = kanjiCanvas.height;
  const count = Math.floor((w * h) / 8000); // density based on area
  const capped = Math.min(count, 120);

  kanjiParticles = [];
  for (let i = 0; i < capped; i++) {
    kanjiParticles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      char: KANJI_CHARS[Math.floor(Math.random() * KANJI_CHARS.length)],
      size: 14 + Math.random() * 22,
      opacity: 0.02 + Math.random() * 0.06,
      vx: (Math.random() - 0.5) * 0.3,
      vy: 0.15 + Math.random() * 0.4,
      rotation: (Math.random() - 0.5) * 0.3,
      phase: Math.random() * Math.PI * 2
    });
  }
}

function animateKanji() {
  if (!kanjiAnimating || !kanjiCtx || !kanjiCanvas) return;

  const w = kanjiCanvas.width;
  const h = kanjiCanvas.height;
  const time = performance.now() * 0.001;

  kanjiCtx.clearRect(0, 0, w, h);

  for (const p of kanjiParticles) {
    // Gentle drift
    p.x += p.vx + Math.sin(time * 0.5 + p.phase) * 0.15;
    p.y += p.vy;

    // Wrap around
    if (p.y > h + p.size) {
      p.y = -p.size;
      p.x = Math.random() * w;
    }
    if (p.x < -p.size) p.x = w + p.size;
    if (p.x > w + p.size) p.x = -p.size;

    // Breathing opacity
    const breathe = Math.sin(time * 0.8 + p.phase) * 0.015;
    const alpha = Math.max(0.01, p.opacity + breathe);

    kanjiCtx.save();
    kanjiCtx.translate(p.x, p.y);
    kanjiCtx.rotate(p.rotation + Math.sin(time * 0.3 + p.phase) * 0.05);
    kanjiCtx.font = `${p.size}px ${KANJI_FONT_BASE}`;
    kanjiCtx.fillStyle = `rgba(130, 6, 106, ${alpha})`;
    kanjiCtx.textAlign = 'center';
    kanjiCtx.textBaseline = 'middle';
    kanjiCtx.fillText(p.char, 0, 0);
    kanjiCtx.restore();
  }

  kanjiRaf = requestAnimationFrame(animateKanji);
}


// ═══════════════════════════════════════════════════════════════
// INTERSECTION OBSERVER — Only activate effects when visible
// ═══════════════════════════════════════════════════════════════

function setupVisibilityObservers() {
  // Editorial reflow — start/stop animation when About section is visible
  const aboutSection = document.getElementById('about');
  if (aboutSection && editorialStage) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && !editorialRaf) {
          editorialActive = true;
          editorialLastFrame = null;
          scheduleEditorialRender();
        } else if (!entry.isIntersecting) {
          editorialActive = false;
          if (editorialRaf) {
            cancelAnimationFrame(editorialRaf);
            editorialRaf = null;
          }
        }
      }
    }, { threshold: 0.1 });
    observer.observe(aboutSection);
  }

  // Kanji backdrop — stop when hero not visible
  const hero = document.getElementById('hero');
  if (hero && kanjiCanvas) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        kanjiAnimating = entry.isIntersecting;
        if (entry.isIntersecting && !kanjiRaf) {
          animateKanji();
        } else if (!entry.isIntersecting && kanjiRaf) {
          cancelAnimationFrame(kanjiRaf);
          kanjiRaf = null;
        }
      }
    }, { threshold: 0.05 });
    observer.observe(hero);
  }
}


// ═══════════════════════════════════════════════════════════════
// MAIN INIT
// ═══════════════════════════════════════════════════════════════

async function initPretextEffects() {
  // Load the pretext library
  const loaded = await loadPretext();

  // Wait for fonts
  await document.fonts.ready;

  // Effect 3: Kanji backdrop (no pretext dependency, works standalone)
  initTypographicBackdrop();

  if (loaded) {
    // Effect 1: Editorial text reflow
    initEditorialReflow();

    // Effect 2: Dynamic philosophy spread
    initDynamicPhilosophy();
  }

  // Visibility-based performance optimization
  setupVisibilityObservers();
}

// Auto-init on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPretextEffects);
} else {
  initPretextEffects();
}
