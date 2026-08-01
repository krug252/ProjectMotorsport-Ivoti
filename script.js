/* ============================================================
   PROJECT MOTORSPORT — script.js
============================================================ */

(function () {
  'use strict';

  /* ── 0. LENIS SMOOTH SCROLL INITIALIZATION ── */
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ── 1. NAVBAR & HERO SCROLL INTERACTION ── */
  const navbar    = document.getElementById('navbar');
  const navLinks  = document.querySelectorAll('.nav-link');
  const sections  = document.querySelectorAll('section[id], footer[id]');
  const heroArrow = document.getElementById('heroArrow');

  /* ── HERO CAROUSEL AUTOMATIC SLIDER (hero1 -> hero4, 2.5s loop) ── */
  const heroSlides = document.querySelectorAll('.hero-slide');
  if (heroSlides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      heroSlides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % heroSlides.length;
      heroSlides[currentSlide].classList.add('active');
    }, 2500);
  }

  /* ── VRUMVRUM SCROLL ANIMATION (rAF-optimized) ── */
  const heroVrum  = document.getElementById('heroVrum');
  const heroVrum2 = document.getElementById('heroVrum2');
  const vrumSection = document.querySelector('.hero-sobre-divider');
  let vrumSectionTop = 0;
  let vrumSectionHeight = 0;
  let vrumViewportW = 0;
  let vrumCarW = 0;
  let vrumCarW2 = 0;
  let vrumLastProgress = -1;
  let vrumLastProgress2 = -1;

  function cacheVrumLayout() {
    if (!vrumSection) return;
    vrumSectionTop    = vrumSection.offsetTop;
    vrumSectionHeight = vrumSection.offsetHeight;
    vrumViewportW     = window.innerWidth;
    if (heroVrum)  vrumCarW  = heroVrum.offsetWidth;
    if (heroVrum2) vrumCarW2 = heroVrum2.offsetWidth;
  }

  // Debounced resize handler (150ms)
  let vrumResizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(vrumResizeTimer);
    vrumResizeTimer = setTimeout(cacheVrumLayout, 150);
  }, { passive: true });

  cacheVrumLayout(); // initial calculation

  function updateVrumPosition() {
    if (vrumSectionHeight <= 0) return;

    const scrollY = window.scrollY;
    const winH = window.innerHeight;

    // --- CARRO 1: Topo (Esquerda -> Direita) ---
    const startScroll1 = Math.max(0, vrumSectionTop - (winH * 0.8));
    const endScroll1   = vrumSectionTop + (winH * 0.15);

    if (heroVrum) {
      const range1 = endScroll1 - startScroll1;
      let progress1;
      if (scrollY <= startScroll1) {
        progress1 = 0;
      } else if (scrollY >= endScroll1) {
        progress1 = 1;
      } else if (range1 > 0) {
        progress1 = (scrollY - startScroll1) / range1;
      } else {
        progress1 = 0;
      }

      if (progress1 !== vrumLastProgress) {
        vrumLastProgress = progress1;
        var totalTravel1 = vrumViewportW + vrumCarW;
        var x1 = -vrumCarW + (progress1 * totalTravel1);
        heroVrum.style.transform = 'translateX(' + x1 + 'px)';
      }
    }

    // --- CARRO 2: Fundo (Direita -> Esquerda) ---
    // Começa no scroll seguinte ao que o vrumvrum1 termina!
    if (heroVrum2) {
      const startScroll2 = endScroll1 + 30;
      const endScroll2   = Math.max(startScroll2 + 100, vrumSectionTop + vrumSectionHeight - (winH * 0.25));
      const range2       = endScroll2 - startScroll2;

      let progress2;
      if (scrollY <= startScroll2) {
        progress2 = 0;
      } else if (scrollY >= endScroll2) {
        progress2 = 1;
      } else if (range2 > 0) {
        progress2 = (scrollY - startScroll2) / range2;
      } else {
        progress2 = 0;
      }

      if (progress2 !== vrumLastProgress2) {
        vrumLastProgress2 = progress2;
        var totalTravel2 = vrumViewportW + vrumCarW2;
        var x2 = vrumViewportW - (progress2 * totalTravel2);
        heroVrum2.style.transform = 'translateX(' + x2 + 'px)';
      }
    }
  }

  // rAF loop — runs only when scroll events are firing
  let vrumScrollTicking = false;
  function onVrumScroll() {
    if (!vrumScrollTicking) {
      vrumScrollTicking = true;
      requestAnimationFrame(function () {
        updateVrumPosition();
        vrumScrollTicking = false;
      });
    }
  }
  window.addEventListener('scroll', onVrumScroll, { passive: true });
  updateVrumPosition(); // initial position

  function onScroll() {
    const scrollY = window.scrollY;
    const hero = document.getElementById('home');
    const heroHeight = hero ? hero.offsetHeight : 600;

    // Desktop: esconde o header ao chegar ao fim da Hero Section
    if (navbar && !navbar.classList.contains('menu-open')) {
      if (window.innerWidth > 900) {
        if (scrollY >= heroHeight - 80) {
          navbar.classList.add('nav-hidden');
        } else {
          navbar.classList.remove('nav-hidden');
        }
      } else {
        navbar.classList.remove('nav-hidden');
        if (scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
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

    // Exibe/oculta botão voltar ao topo após 350px de rolagem e transiciona no footer
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      if (scrollY > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }

      const footer = document.getElementById('contato');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const winHeight = window.innerHeight;

        if (footerRect.top < winHeight - 90) {
          scrollTopBtn.classList.add('in-footer');
          const targetTop = Math.max(28, footerRect.top + 90);
          scrollTopBtn.style.top = targetTop + 'px';
        } else {
          scrollTopBtn.classList.remove('in-footer');
          scrollTopBtn.style.top = '';
        }
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load

  /* ── 2. MENU HAMBÚRGUER ── */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active');
    navbar.classList.toggle('menu-open');
    hamburger.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      lenis.stop();
    } else {
      document.body.style.overflow = '';
      lenis.start();
    }
  });

  // Fecha ao clicar em qualquer link do menu
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      navbar.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      lenis.start();
    });
  });

  // Fecha ao clicar fora do menu
  document.addEventListener('click', function (e) {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
      navbar.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      lenis.start();
    }
  });

  /* ── 3. SCROLL SUAVE PARA ÂNCORAS VIA LENIS ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.1 });
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

  /* ── 5. ACTIVE NAV LINK STYLE (controlado via CSS em style.css) ── */

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
      lenis.stop();
      updateNavButtons();
    }

    function closeLightbox() {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      lenis.start();
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
