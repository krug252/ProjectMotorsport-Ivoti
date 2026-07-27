/* ============================================================
   PROJECT MOTORSPORT — script.js
============================================================ */

(function () {
  'use strict';

  /* ── 1. NAVBAR & HERO SCROLL INTERACTION ── */
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id], footer[id]');
  const heroArrow = document.getElementById('heroArrow');

  function onScroll() {
    const scrollY = window.scrollY;

    // Torna navbar opaca após 60px
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Seta da Hero faz fade-out suave nos primeiros 140px
    if (heroArrow) {
      const fadeLimit = 140;
      const arrowOpacity = Math.max(0, 1 - scrollY / fadeLimit);
      heroArrow.style.opacity = arrowOpacity.toFixed(2);
      heroArrow.style.pointerEvents = arrowOpacity <= 0.05 ? 'none' : 'auto';
      heroArrow.style.transform = `translate(-50%, ${scrollY * 0.25}px)`;
    }

    // Destaca o link do menu conforme a seção visível
    let currentId = '';
    sections.forEach(function (sec) {
      const top = sec.offsetTop - 100;
      if (scrollY >= top) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  /* ── 2. MENU HAMBÚRGUER ── */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Fecha ao clicar em qualquer link do menu
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Fecha ao clicar fora do menu
  document.addEventListener('click', function (e) {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ── 3. SCROLL SUAVE — âncoras com offset do header ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 8;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── 4. REVEAL AO ROLAR (Intersection Observer) ── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // revela uma vez
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* ── 5. ACTIVE NAV LINK STYLE ── */
  const style = document.createElement('style');
  style.textContent = '.nav-link.active { color: #2EC4B6; } .nav-link.active::after { width: 100%; }';
  document.head.appendChild(style);

  /* ── 6. LIGHTBOX ── */
  (function () {
    var overlay    = document.getElementById('lightboxOverlay');
    var imgEl      = document.getElementById('lightboxImg');
    var captionEl  = document.getElementById('lightboxCaption');
    var closeBtn   = document.getElementById('lightboxClose');
    var prevBtn    = document.getElementById('lightboxPrev');
    var nextBtn    = document.getElementById('lightboxNext');

    // Coleta todas as imagens clicáveis em ordem DOM
    var triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
    var currentIndex = 0;

    function openLightbox(index) {
      currentIndex = index;
      var img = triggers[currentIndex];
      imgEl.src = img.currentSrc || img.src;
      imgEl.alt = img.alt;
      captionEl.textContent = img.dataset.caption || img.alt || '';
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      updateNavButtons();
    }

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      // Limpa src após a transição para evitar flash
      setTimeout(function () { imgEl.src = ''; }, 320);
    }

    function goTo(index) {
      if (index < 0 || index >= triggers.length) return;
      currentIndex = index;
      // Pequena animação de troca
      imgEl.style.opacity = '0';
      imgEl.style.transform = 'scale(0.9)';
      setTimeout(function () {
        imgEl.src = triggers[currentIndex].currentSrc || triggers[currentIndex].src;
        imgEl.alt = triggers[currentIndex].alt;
        captionEl.textContent = triggers[currentIndex].dataset.caption || triggers[currentIndex].alt || '';
        imgEl.style.opacity = '1';
        imgEl.style.transform = 'scale(1)';
        updateNavButtons();
      }, 180);
    }

    function updateNavButtons() {
      prevBtn.classList.toggle('hidden', currentIndex === 0);
      nextBtn.classList.toggle('hidden', currentIndex === triggers.length - 1);
    }

    // Adiciona estilos de transição inline para a troca de imagem
    imgEl.style.transition = 'opacity 0.18s ease, transform 0.18s ease';

    // Clique nas imagens
    triggers.forEach(function (img, i) {
      img.addEventListener('click', function (e) {
        e.stopPropagation();
        openLightbox(i);
      });
    });

    // Fechar
    closeBtn.addEventListener('click', closeLightbox);

    // Clique no fundo do overlay fecha
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });

    // Navegação
    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      goTo(currentIndex - 1);
    });
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      goTo(currentIndex + 1);
    });

    // Teclado
    document.addEventListener('keydown', function (e) {
      if (!overlay.classList.contains('active')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   goTo(currentIndex - 1);
      if (e.key === 'ArrowRight')  goTo(currentIndex + 1);
    });

    // Swipe touch (mobile)
    var touchStartX = 0;
    overlay.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return; // ignora taps
      if (dx < 0) goTo(currentIndex + 1); // swipe esquerda → próxima
      else         goTo(currentIndex - 1); // swipe direita  → anterior
    }, { passive: true });
  }());

})();
