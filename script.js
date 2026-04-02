/* ========================================
   WASABEE - Oriental Cuisine
   Interactive Scripts & Animations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Start animations
  setTimeout(initAnimations, 100);


  // === NAVIGATION ===
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const menuOverlay = document.querySelector('.menu-overlay');
  const menuLinks = document.querySelectorAll('.menu-overlay-links a');
  
  // Scroll detection logic removed so the navbar stays absolute and scrolls away
  
  // Hamburger toggle
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      menuOverlay.classList.toggle('active');
      
      if (menuOverlay.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }
  
  // Close overlay on link click
  menuLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      menuOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // === HERO TITLE CHARACTER ANIMATION ===
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const text = heroTitle.textContent;
    heroTitle.innerHTML = '';
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${2 + i * 0.08}s`;
      heroTitle.appendChild(span);
    });
  }

  // === SMOOTH SCROLL FOR NAV LINKS ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      }
    });
  });

  // === MAIN ANIMATIONS INIT ===
  function initAnimations() {
    // Scroll Reveal (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .img-reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve so we can add stagger delay
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach((el, i) => {
      // Add stagger delay for sibling elements
      if (el.dataset.delay) {
        el.style.transitionDelay = el.dataset.delay + 's';
      }
      revealObserver.observe(el);
    });

    // === PARALLAX ===
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    function updateParallax() {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const rect = el.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2;
        const offset = (centerY - window.innerHeight / 2) * speed;
        el.style.setProperty('--parallax-y', offset + 'px');
      });
    }
    
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();

    // === COUNTER ANIMATION ===
    const counters = document.querySelectorAll('[data-count]');
    
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const start = performance.now();
          
          function updateCounter(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out expo
            const ease = 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(ease * target);
            
            el.textContent = current + suffix;
            
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = target + suffix;
            }
          }
          
          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(el => counterObserver.observe(el));
  }

  // === GALLERY LIGHTBOX ===
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightboxImg && lightbox) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // === MENU CATEGORY FILTER ===
  const menuCatBtns = document.querySelectorAll('.menu-cat-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  
  menuCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      menuCatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const category = btn.dataset.category;
      
      menuItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.style.display = 'flex';
          item.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // === MARQUEE DUPLICATE ===
  const marqueeTracks = document.querySelectorAll('.marquee-track');
  marqueeTracks.forEach(track => {
    const clone = track.innerHTML;
    track.innerHTML += clone;
  });

  // Scroll progress handled in updateBrandingScroll below

  // === IMAGE LAZY LOADING ===
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px'
  });
  
  lazyImages.forEach(img => imageObserver.observe(img));

  // === MAGNETIC BUTTON EFFECT ===
  const magneticBtns = document.querySelectorAll('.cta-btn');
  
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // === TEXT SPLIT FOR SECTION TITLES (add stagger) ===
  document.querySelectorAll('.stagger-words').forEach(el => {
    const words = el.textContent.split(' ');
    el.innerHTML = words.map((word, i) => 
      `<span class="word" style="animation-delay: ${i * 0.1}s">${word}</span>`
    ).join(' ');
  });


  // === LUXURY CURSOR & SCROLL PROGRESS ===
  const cursorOuter = document.querySelector('.cursor-outer');
  const cursorInner = document.querySelector('.cursor-inner');
  const scrollProgress = document.querySelector('.scroll-progress');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  if (cursorOuter && cursorInner) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const updateCursor = () => {
      const easing = 0.15;
      cursorX += (mouseX - cursorX) * easing;
      cursorY += (mouseY - cursorY) * easing;

      cursorOuter.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      cursorInner.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      requestAnimationFrame(updateCursor);
    };
    updateCursor();

    const interactables = document.querySelectorAll('a, button, .menu-item, .platform-card, .insta-item, .gallery-item');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => cursorOuter.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorOuter.classList.remove('hover'));
    });
  }

  // === BRANDING SCROLL MOTION ===

  const heroScrollText = document.querySelector('.hero-scroll-text');
  const mainHeroTitle = document.querySelector('.hero-title');
  
  // Wait for hero animation to complete before allowing JS to control title
  let heroAnimationDone = false;
  setTimeout(() => { heroAnimationDone = true; }, 4000);
  
  function updateBrandingScroll() {
    const scrollY = window.scrollY;
    
    // Update scroll progress bar
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollProgress && totalHeight > 0) {
      scrollProgress.style.width = `${(scrollY / totalHeight) * 100}%`;
    }
    
    // Parallax branding text: slides left as user scrolls down
    if (heroScrollText) {
      const xOffset = scrollY * 0.35;
      heroScrollText.style.transform = `translate(calc(-50% - ${xOffset}px), -55%)`;
    }
    
    // Hero title: scale up and fade as user scrolls (only after initial reveal animation)
    if (mainHeroTitle && heroAnimationDone) {
      const scale = Math.min(1 + scrollY * 0.0008, 1.3);
      const opacity = Math.max(1 - scrollY / 500, 0);
      mainHeroTitle.style.transform = `scale(${scale})`;
      mainHeroTitle.style.opacity = opacity;
    }
  }

  // Single unified scroll listener for performance
  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateBrandingScroll);
  }, { passive: true });


});

// === FADE IN UP KEYFRAME (used by JS) ===
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
