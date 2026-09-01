(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'rb-portfolio-theme';

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  (function initTheme(){
    const saved = localStorage.getItem(THEME_KEY);
    if (saved){
      applyTheme(saved);
    } else {
      const systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(systemLight ? 'light' : 'dark');
    }
  })();

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function closeNav(){
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  const header = document.getElementById('site-header');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  const backToTop = document.getElementById('backToTop');

  function onScroll(){
    header.classList.toggle('is-scrolled', window.scrollY > 12);
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  if ('IntersectionObserver' in window && sections.length){
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => navObserver.observe(s));
  }

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion){
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  const archDiagram = document.getElementById('archDiagram');
  if (archDiagram){
    const nodes = archDiagram.querySelectorAll('.arch-node');
    const lines = archDiagram.querySelectorAll('.arch-line');

    function revealArch(){
      nodes.forEach(n => {
        const step = Number(n.dataset.step);
        setTimeout(() => n.classList.add('is-visible'), prefersReducedMotion ? 0 : step * 140);
      });
      lines.forEach(l => {
        const step = Number(l.dataset.step);
        setTimeout(() => l.classList.add('is-visible'), prefersReducedMotion ? 0 : step * 140);
      });
    }

    if ('IntersectionObserver' in window){
      const archObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting){
            revealArch();
            obs.disconnect();
          }
        });
      }, { threshold: 0.35 });
      archObserver.observe(archDiagram);
    } else {
      revealArch();
    }
  }

  const canvas = document.getElementById('heroCanvas');
  if (canvas && !prefersReducedMotion){
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');
    let width, height, dpr;
    let points = [];
    let mouse = { x: null, y: null };
    let rafId;

    function getAccentColor(){
      return getComputedStyle(root).getPropertyValue('--accent').trim() || '#4F7CFF';
    }

    function resize(){
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = heroSection.clientWidth;
      height = heroSection.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / 26000);
      points = Array.from({ length: Math.min(count, 60) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
      }));
    }

    function step(){
      ctx.clearRect(0, 0, width, height);
      const accent = getAccentColor();
      const linkDist = 130;

      points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      for (let i = 0; i < points.length; i++){
        for (let j = i + 1; j < points.length; j++){
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist){
            ctx.strokeStyle = hexToRgba(accent, (1 - dist / linkDist) * 0.16);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.x !== null){
          const dx = points[i].x - mouse.x, dy = points[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160){
            ctx.strokeStyle = hexToRgba(accent, (1 - dist / 160) * 0.3);
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      points.forEach(p => {
        ctx.fillStyle = hexToRgba(accent, 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });

      rafId = requestAnimationFrame(step);
    }

    function hexToRgba(hex, alpha){
      hex = hex.replace('#', '');
      if (hex.length === 3){ hex = hex.split('').map(c => c + c).join(''); }
      const num = parseInt(hex, 16);
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroSection.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    step();
  }

  /* ---------------------------------------------------------
     CONTACT FORM — envoi vers Formspree
  --------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
      formNote.textContent = '';
      formNote.style.color = 'var(--color-text, #333)';
      
      try {
        const formData = new FormData(contactForm);
        
        const response = await fetch('https://formspree.io/f/xzebdlrd', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          formNote.textContent = '✅ Message envoyé avec succès ! Je vous répondrai rapidement.';
          formNote.style.color = '#4caf50';
          contactForm.reset();
        } else {
          const data = await response.json();
          formNote.textContent = '❌ Erreur : ' + (data.error || 'Veuillez réessayer.');
          formNote.style.color = '#f44336';
        }
      } catch (error) {
        formNote.textContent = '❌ Erreur de connexion. Vérifiez votre réseau.';
        formNote.style.color = '#f44336';
      }
      
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  }

})();
