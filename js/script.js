// script.js - Fonctionnalités principales

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const THEME_KEY = 'rb-portfolio-theme';

  // ============ THÈME ============
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  (function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
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

  // ============ NAVIGATION ============
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function closeNav() {
    navMenu?.classList.remove('is-open');
    navToggle?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }

  navToggle?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // ============ ADMIN PANEL ============
  const adminToggle = document.getElementById('admin-toggle');
  const adminPanel = document.getElementById('admin-panel');
  const adminClose = document.getElementById('admin-close');

  function toggleAdminPanel(show) {
    if (adminPanel) {
      adminPanel.classList.toggle('hidden', show === false);
      adminPanel.classList.toggle('visible', show === true);
    }
  }

  adminToggle?.addEventListener('click', () => {
    const isHidden = adminPanel?.classList.contains('hidden');
    toggleAdminPanel(!isHidden);
  });

  adminClose?.addEventListener('click', () => {
    toggleAdminPanel(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('admin-panel');
      if (panel && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
      }
    }
  });

  // ============ HEADER & SCROLL ============
  const header = document.getElementById('site-header');
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    backToTop?.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  // ============ ACTIVE NAV LINK ============
  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(s => navObserver.observe(s));
  }

  // ============ REVEAL ANIMATIONS ============
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ============ ARCHITECTURE DIAGRAM ============
  const archDiagram = document.getElementById('archDiagram');
  if (archDiagram) {
    const nodes = archDiagram.querySelectorAll('.arch-node');
    const lines = archDiagram.querySelectorAll('.arch-line');

    function revealArch() {
      nodes.forEach(n => {
        const step = Number(n.dataset.step);
        setTimeout(() => n.classList.add('is-visible'), prefersReducedMotion ? 0 : step * 140);
      });
      lines.forEach(l => {
        const step = Number(l.dataset.step);
        setTimeout(() => l.classList.add('is-visible'), prefersReducedMotion ? 0 : step * 140);
      });
    }

    if ('IntersectionObserver' in window) {
      const archObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
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

  // ============ HERO CANVAS ============
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');
    let width, height, dpr;
    let points = [];
    let mouse = { x: null, y: null };
    let rafId;

    function getAccentColor() {
      return getComputedStyle(root).getPropertyValue('--accent').trim() || '#4F7CFF';
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = heroSection?.clientWidth || window.innerWidth;
      height = heroSection?.clientHeight || window.innerHeight;
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

    function hexToRgba(hex, alpha) {
      hex = hex.replace('#', '');
      if (hex.length === 3) { hex = hex.split('').map(c => c + c).join(''); }
      const num = parseInt(hex, 16);
      const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function step() {
      ctx.clearRect(0, 0, width, height);
      const accent = getAccentColor();
      const linkDist = 130;

      points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = hexToRgba(accent, (1 - dist / linkDist) * 0.16);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.x !== null) {
          const dx = points[i].x - mouse.x, dy = points[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
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

    heroSection?.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroSection?.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    step();
  }

  // ============ CONTACT FORM ============
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

  // ============ GESTION DES IMAGES UPLOADÉES ============

  function getUploadedImage(imageName) {
    try {
      const images = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
      return images[imageName] || null;
    } catch (e) {
      return null;
    }
  }

  function getAllUploadedImages() {
    try {
      return JSON.parse(localStorage.getItem('uploaded_images') || '{}');
    } catch (e) {
      return {};
    }
  }

  function hasUploadedImage(imageName) {
    const images = getAllUploadedImages();
    return !!images[imageName];
  }

  window.getUploadedImage = getUploadedImage;
  window.getAllUploadedImages = getAllUploadedImages;
  window.hasUploadedImage = hasUploadedImage;

})();

// ============================================================
// ==================== GESTION DES DONNÉES ====================
// ============================================================

/**
 * Récupère les données complètes du site
 */
function getSiteData() {
    if (typeof StorageManager !== 'undefined') {
        try {
            const d = StorageManager.getData();
            if (d && typeof d.then !== 'function') {
                return d;
            }
        } catch (e) {}
    }

    try {
        const raw = localStorage.getItem('portfolio_data');
        if (raw) return JSON.parse(raw);
    } catch (e) {}

    try {
        const raw = localStorage.getItem('contentData');
        if (raw) return JSON.parse(raw);
    } catch (e) {}

    return null;
}

// ============================================================
// ==================== GESTION DES PROJETS ====================
// ============================================================

/**
 * Récupère la liste des projets pour la langue courante
 */
function getProjects() {
    try {
        const data = getSiteData();
        if (!data) return [];
        
        const lang = document.documentElement.lang || 'fr';
        let projects = data?.[lang]?.projects || data?.fr?.projects || [];
        
        // Si projects est un objet, le convertir en tableau
        if (projects && typeof projects === 'object' && !Array.isArray(projects)) {
            projects = Object.values(projects).filter(p => p.title && p.description);
        }
        
        // Filtrer les projets valides
        if (Array.isArray(projects)) {
            projects = projects.filter(p => p.title && p.description);
        }
        
        return projects;
    } catch (e) {
        console.warn('Erreur getProjects:', e);
        return [];
    }
}

/**
 * Affiche les projets dans le grid - Version avec images et métriques
 */
function renderProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) {
        console.warn('⚠️ #projects-grid non trouvé');
        return;
    }

    const projects = getProjects();
    console.log('📁 Projets à afficher:', projects.length);

    // Vider le contenu existant
    grid.innerHTML = '';

    if (!projects || projects.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center; padding:4rem 0; grid-column:1/-1;">
                <div style="display:inline-block; padding:3rem 4rem; background:rgba(255,255,255,0.03); border-radius:16px; border:1px dashed rgba(255,255,255,0.1); max-width:500px;">
                    <div style="font-size:3rem; margin-bottom:1rem;">🚧</div>
                    <h3 style="font-size:1.2rem; color:#aaa; margin-bottom:0.5rem;">Projets en cours de construction</h3>
                    <p style="color:#666; font-size:0.95rem; line-height:1.6;">Je travaille actuellement sur des projets passionnants. Revenez bientôt !</p>
                </div>
            </div>
        `;
        return;
    }

    // Style du grid
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
    grid.style.gap = '2rem';
    grid.style.marginTop = '2.5rem';
    grid.style.padding = '0.5rem';

    // Générer les cartes avec images
    grid.innerHTML = projects.map((p, i) => {
        // Déterminer la couleur du statut
        const status = p.status || 'En développement';
        const statusColor = status === 'Terminé' ? '#4caf50' : 
                           status === 'En production' ? '#2196f3' : 
                           status === 'En développement' ? '#ff9800' : '#888';
        
        // Vérifier si l'image existe
        const hasImage = p.image && p.image !== '';
        
        return `
            <div class="project-card" style="
                background: rgba(255,255,255,0.03);
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.06);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                animation: fadeInUp 0.6s ease ${i * 0.12}s both;
                display: flex;
                flex-direction: column;
            "
            onmouseover="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.3)'; this.style.borderColor='rgba(100,200,255,0.15)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='rgba(255,255,255,0.06)';"
            >
                <!-- Image du projet -->
                <div style="
                    width:100%;
                    height:200px;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    overflow:hidden;
                    position:relative;
                    flex-shrink: 0;
                ">
                    ${hasImage ? `
                        <img src="${p.image}" 
                             alt="${p.title}" 
                             style="width:100%;height:100%;object-fit:cover;transition:transform 0.5s ease;"
                             loading="lazy"
                             onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;background:linear-gradient(135deg,#1a1a2e,#16213e);\\'>${p.icon || '📁'}</div>'"
                             onmouseover="if(this.parentElement.querySelector('img')) this.style.transform='scale(1.05)'"
                             onmouseout="if(this.parentElement.querySelector('img')) this.style.transform='scale(1)'"
                        >
                    ` : `
                        <div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;background:linear-gradient(135deg,#1a1a2e,#16213e);">
                            ${p.icon || '📁'}
                        </div>
                    `}
                    
                    <!-- Badge de statut -->
                    <span style="
                        position:absolute;
                        top:12px;
                        right:12px;
                        padding:3px 14px;
                        background: ${statusColor}22;
                        color: ${statusColor};
                        border-radius:20px;
                        font-size:0.6rem;
                        font-weight:500;
                        text-transform:uppercase;
                        letter-spacing:0.5px;
                        border:1px solid ${statusColor}33;
                        backdrop-filter:blur(10px);
                        -webkit-backdrop-filter:blur(10px);
                    ">${status}</span>
                </div>

                <!-- Contenu -->
                <div style="
                    padding:1.5rem;
                    flex:1;
                    display:flex;
                    flex-direction:column;
                    gap:0.5rem;
                ">
                    <!-- Titre -->
                    <h3 style="
                        color:#fff;
                        font-size:1.1rem;
                        font-weight:600;
                        margin:0;
                        line-height:1.3;
                        letter-spacing:-0.2px;
                    ">${p.title}</h3>

                    <!-- Description -->
                    <p style="
                        color:#999;
                        font-size:0.9rem;
                        line-height:1.6;
                        margin:0 0 0.5rem 0;
                        flex:1;
                    ">${p.description}</p>

                    <!-- Technologies -->
                    ${(p.technologies || p.tags) ? `
                        <div style="
                            display:flex;
                            gap:0.5rem;
                            flex-wrap:wrap;
                            margin-top:0.2rem;
                            padding-top:0.8rem;
                            border-top:1px solid rgba(255,255,255,0.04);
                        ">
                            ${(p.technologies || p.tags || []).map(t => 
                                `<span style="
                                    padding:3px 14px;
                                    background:rgba(100,200,255,0.06);
                                    border-radius:20px;
                                    font-size:0.7rem;
                                    color:#8ab4f8;
                                    border:1px solid rgba(100,200,255,0.06);
                                    font-weight:400;
                                    letter-spacing:0.2px;
                                    transition: all 0.3s ease;
                                "
                                onmouseover="this.style.background='rgba(100,200,255,0.15)'; this.style.transform='scale(1.05)';"
                                onmouseout="this.style.background='rgba(100,200,255,0.06)'; this.style.transform='scale(1)';"
                                >${t}</span>`
                            ).join('')}
                        </div>
                    ` : ''}

                    <!-- Métriques -->
                    ${p.metrics && Object.keys(p.metrics).length > 0 ? `
                        <div style="
                            display:grid;
                            grid-template-columns:repeat(auto-fit, minmax(60px, 1fr));
                            gap:0.8rem;
                            margin-top:0.5rem;
                            padding-top:0.8rem;
                            border-top:1px solid rgba(255,255,255,0.04);
                        ">
                            ${Object.entries(p.metrics).map(([key, value]) => `
                                <div style="text-align:center;">
                                    <div style="color:#fff; font-size:1rem; font-weight:600;">${value}</div>
                                    <div style="color:#666; font-size:0.55rem; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px;">${key}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join();

    console.log('✅ Projets affichés avec succès !');
}

// ============================================================
// ==================== GESTION DE LA GALERIE ====================
// ============================================================

/**
 * Récupère toutes les images de la galerie
 */
function getGalleryImages() {
    try {
        const data = getSiteData();
        const lang = document.documentElement.lang || 'fr';
        const items = data?.[lang]?.gallery?.items || data?.en?.gallery?.items || [];
        return items;
    } catch (e) {
        console.warn('Erreur galerie:', e);
        return [];
    }
}

/**
 * Récupère une image de la galerie par son ID
 */
function getGalleryImage(id) {
    const items = getGalleryImages();
    return items.find(item => item.id === id) || null;
}

/**
 * Récupère l'URL d'une image de la galerie
 */
function getGalleryImageUrl(id) {
    // 1. Vérifier dans localStorage (images uploadées)
    const cached = localStorage.getItem('gallery_image_' + id);
    if (cached) return cached;
    
    // 2. Vérifier dans uploaded_images
    const uploadedImages = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
    for (const [key, value] of Object.entries(uploadedImages)) {
        if (key.includes(id) || key.includes(`gallery_${id}`)) {
            return value;
        }
    }
    
    // 3. Sinon, chercher dans les données
    const item = getGalleryImage(id);
    if (item && item.image) {
        return 'assets/gallery/' + item.image;
    }
    
    // 4. Image par défaut
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22150%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2220%22%3E📷%3C/text%3E%3Ctext x=%22200%22 y=%22175%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2214%22%3EAucune image%3C/text%3E%3C/svg%3E';
}

/**
 * Affiche la galerie
 */
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) {
        console.warn('⚠️ #gallery-grid non trouvé');
        return;
    }

    const items = getGalleryImages();
    console.log('🖼️ Images trouvées:', items.length);

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:#666; width:100%; grid-column:1/-1;">
                <p style="font-size:48px; margin-bottom:16px;">🖼️</p>
                <p style="font-size:18px; margin-bottom:8px;">Aucune image dans la galerie</p>
                <p style="font-size:14px; opacity:0.6;">Ajoutez des images depuis l'administration</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map((item) => {
        const imageUrl = getGalleryImageUrl(item.id);
        const title = item.title || 'Sans titre';
        const description = item.description || '';
        const category = item.category || '';
        
        return `
            <div class="gallery-item reveal is-visible" data-id="${item.id}">
                <img src="${imageUrl}" 
                     alt="${title}" 
                     loading="lazy"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22150%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2220%22%3E📷%3C/text%3E%3Ctext x=%22200%22 y=%22175%22 text-anchor=%22middle%22 fill=%22%23555%22 font-size=%2214%22%3E${title}%3C/text%3E%3C/svg%3E'">
                <div class="gallery-item__overlay">
                    ${category ? `<span class="gallery-item__tag">${category}</span>` : ''}
                    <p class="gallery-item__desc">${title}</p>
                    ${description ? `<p style="font-size:12px; opacity:0.7; margin:4px 0 0;">${description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    console.log('✅ Galerie affichée avec', items.length, 'images');
}

// ============================================================
// ==================== FONCTIONS DE RAFRAÎCHISSEMENT ====================
// ============================================================

function refreshProjects() {
    renderProjects();
    console.log('🔄 Projets rafraîchis');
}

function refreshGallery() {
    renderGallery();
    console.log('🔄 Galerie rafraîchie');
}

// ============================================================
// ==================== INITIALISATION ====================
// ============================================================

function initProjects() {
    console.log('📁 Initialisation des projets...');
    setTimeout(renderProjects, 500);
}

function initGallery() {
    console.log('🖼️ Initialisation de la galerie...');
    setTimeout(renderGallery, 500);
}

// ============================================================
// ==================== ÉVÉNEMENTS ====================
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initProjects, 300);
    setTimeout(initGallery, 600);
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initProjects, 200);
    setTimeout(initGallery, 500);
}

window.addEventListener('load', function() {
    setTimeout(renderProjects, 1000);
    setTimeout(renderGallery, 1200);
});

document.addEventListener('languageChanged', function() {
    setTimeout(renderProjects, 300);
    setTimeout(renderGallery, 400);
});

window.addEventListener('storage', function(e) {
    if (e.key === 'contentData' || e.key === 'portfolio_data' || 
        (e.key && (e.key.startsWith('gallery_image_') || e.key.startsWith('project_')))) {
        console.log('🔄 Données modifiées, rechargement...');
        setTimeout(renderProjects, 300);
        setTimeout(renderGallery, 400);
    }
});

// ============================================================
// ==================== EXPOSER LES FONCTIONS ====================
// ============================================================

window.getSiteData = getSiteData;
window.getProjects = getProjects;
window.renderProjects = renderProjects;
window.refreshProjects = refreshProjects;
window.initProjects = initProjects;

window.getGalleryImages = getGalleryImages;
window.getGalleryImage = getGalleryImage;
window.getGalleryImageUrl = getGalleryImageUrl;
window.renderGallery = renderGallery;
window.refreshGallery = refreshGallery;
window.initGallery = initGallery;

console.log('📁 Script de gestion des projets et galerie chargé');
console.log('💡 Commandes disponibles :');
console.log('  - getSiteData()         - Inspecte les données brutes');
console.log('  - getProjects()         - Récupère la liste des projets');
console.log('  - renderProjects()      - Affiche les projets');
console.log('  - refreshProjects()     - Rafraîchit les projets');
console.log('  - getGalleryImages()    - Récupère toutes les images');
console.log('  - renderGallery()       - Affiche la galerie');
console.log('  - refreshGallery()      - Rafraîchit la galerie');

// ============ CONSOLE DEBUG ============
console.log('%c🔐 Portfolio Admin', 'font-size:20px;font-weight:bold;color:#4F7CFF;');
console.log('Pour accéder à l\'administration :');
console.log('1. Aller sur : admin/index.html');
console.log('2. Email: admin@portfolio.com');
console.log('3. Mot de passe: Portfolio2026!');
console.log('Ou tapez: openAdmin()');

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.open('admin/index.html', '_blank');
  }
});

window.openAdmin = function() {
  window.open('admin/index.html', '_blank');
};

console.log('💡 Raccourci : Ctrl+Shift+A pour ouvrir l\'administration');
console.log('💡 Ou tapez : openAdmin() dans la console');

// ============================================================
// ==================== UTILITAIRE POUR AJOUTER DES IMAGES ====================
// ============================================================

/**
 * Fonction utilitaire pour ajouter des images aux projets
 * Exécutez dans la console : addImagesToProjects()
 */
window.addImagesToProjects = function() {
    const data = getSiteData();
    if (!data) {
        console.error('❌ Aucune donnée trouvée');
        return;
    }
    
    const lang = document.documentElement.lang || 'fr';
    
    // Images placeholder par défaut
    const defaultImages = [
        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22145%22 text-anchor=%22middle%22 fill=%22%234F7CFF%22 font-size=%2248%22%3E💰%3C/text%3E%3Ctext x=%22200%22 y=%22185%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3EGestion Financière%3C/text%3E%3C/svg%3E',
        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22145%22 text-anchor=%22middle%22 fill=%22%234CAF50%22 font-size=%2248%22%3E🌾%3C/text%3E%3Ctext x=%22200%22 y=%22185%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3ESecteur Agricole%3C/text%3E%3C/svg%3E',
        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22145%22 text-anchor=%22middle%22 fill=%22%23FF9800%22 font-size=%2248%22%3E🏍️%3C/text%3E%3Ctext x=%22200%22 y=%22185%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3EIdentification%3C/text%3E%3C/svg%3E'
    ];
    
    // Ajouter les images aux projets
    if (data[lang] && data[lang].projects) {
        data[lang].projects = data[lang].projects.map((p, i) => ({
            ...p,
            image: p.image || defaultImages[i % defaultImages.length] || defaultImages[0]
        }));
    }
    
    // Sauvegarder
    localStorage.setItem('portfolio_data', JSON.stringify(data));
    localStorage.setItem('contentData', JSON.stringify(data));
    
    console.log('✅ Images ajoutées aux projets !');
    console.log('🔄 Rafraîchissement de la page...');
    setTimeout(() => location.reload(), 1000);
};

console.log('💡 Pour ajouter des images aux projets, tapez :');
console.log('  - addImagesToProjects()  - Ajoute des images aux projets');
console.log('  - getProjects()          - Voir les projets actuels');

// ============================================================
// ==================== EXEMPLE DE DONNÉES AVEC MÉTRIQUES ====================
// ============================================================

window.updateProjectsWithMetrics = function() {
    const data = getSiteData();
    if (!data) {
        console.error('❌ Aucune donnée trouvée');
        return;
    }

    const lang = document.documentElement.lang || 'fr';

    const projectsWithMetrics = [
        {
            id: "sifgc",
            title: "SIFGC — Système Intégré de Gestion Financière",
            description: "Plateforme web de gestion financière et comptable pour institutions",
            icon: "💰",
            status: "En production",
            technologies: ["Laravel", "MySQL", "Tailwind", "Livewire"],
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22145%22 text-anchor=%22middle%22 fill=%22%234F7CFF%22 font-size=%2248%22%3E💰%3C/text%3E%3Ctext x=%22200%22 y=%22185%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3EGestion Financière%3C/text%3E%3C/svg%3E',
            metrics: {
                "Patients": "5",
                "Médecins": "2",
                "À valider": "0",
                "Rendez-vous": "0"
            }
        },
        {
            id: "sina",
            title: "SINA-RCA — Système d'Information Numérique Agricole",
            description: "Digitalisation du secteur agricole en République centrafricaine",
            icon: "🌾",
            status: "En développement",
            technologies: ["Flutter", "Node.js", "PostgreSQL", "Offline-first"],
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22145%22 text-anchor=%22middle%22 fill=%22%234CAF50%22 font-size=%2248%22%3E🌾%3C/text%3E%3Ctext x=%22200%22 y=%22185%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3ESecteur Agricole%3C/text%3E%3C/svg%3E',
            metrics: {
                "Exploitations": "12",
                "Cultures": "8",
                "Rapports": "4"
            }
        },
        {
            id: "snicgtm",
            title: "SNICGTM — Identification Taxi-Motos",
            description: "Système d'identification et de contrôle par QR Code",
            icon: "🏍️",
            status: "En développement",
            technologies: ["Laravel", "MySQL", "QR Code", "API REST"],
            image: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect width=%22400%22 height=%22300%22 fill=%22%231a1a2e%22/%3E%3Ctext x=%22200%22 y=%22145%22 text-anchor=%22middle%22 fill=%22%23FF9800%22 font-size=%2248%22%3E🏍️%3C/text%3E%3Ctext x=%22200%22 y=%22185%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22%3EIdentification%3C/text%3E%3C/svg%3E',
            metrics: {
                "Taxi-Motos": "156",
                "Chauffeurs": "189",
                "QR Codes": "345"
            }
        }
    ];

    if (!data[lang]) data[lang] = {};
    data[lang].projects = projectsWithMetrics;
    
    localStorage.setItem('portfolio_data', JSON.stringify(data));
    localStorage.setItem('contentData', JSON.stringify(data));
    
    console.log('✅ Projets mis à jour avec métriques et images !');
    console.log('📁 Nombre de projets:', projectsWithMetrics.length);
    setTimeout(() => location.reload(), 1000);
};

console.log('💡 Pour ajouter des métriques aux projets, tapez :');
console.log('  - updateProjectsWithMetrics()  - Met à jour les projets avec des métriques');
console.log('  - addImagesToProjects()        - Ajoute des images aux projets existants');