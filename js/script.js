/**
 * LUMEO Digital Media - Interactive Web Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Dynamic Quotes Data
  const quotesData = [
    {
      text: "“At LUMEO Digital Media, we don't just generate impressions — we turn attention into market dominance, building brand empires that outlast algorithms.”",
      author: "LUMEO Executive Board & Media Strategists",
      role: "Digital Growth & Brand Acceleration",
      rating: 5,
      image: "assets/quote_leader.png"
    },
    {
      text: "“In the digital economy, visibility without strategy is just noise. We architect revenue campaigns that demand authority and deliver predictable ROI.”",
      author: "Director of Campaign Engineering",
      role: "Performance Media & PPC Strategy",
      rating: 5,
      image: "assets/hero_professional.png"
    },
    {
      text: "“Great marketing is an art; scale is a science. LUMEO bridges creative excellence with hyper-targeted analytics to propel your enterprise past competitors.”",
      author: "Chief Marketing Strategist",
      role: "SEO & Growth Ecosystems",
      rating: 5,
      image: "assets/quote_leader.png"
    }
  ];

  let currentQuoteIndex = 0;
  const quoteTextEl = document.getElementById('quoteText');
  const quoteAuthorEl = document.getElementById('quoteAuthor');
  const quoteRoleEl = document.getElementById('quoteRole');
  const quoteImgEl = document.getElementById('quoteImg');
  const prevBtn = document.getElementById('prevQuoteBtn');
  const nextBtn = document.getElementById('nextQuoteBtn');
  const audioBtn = document.getElementById('audioQuoteBtn');

  function updateQuote(index) {
    if (!quoteTextEl) return;
    const q = quotesData[index];
    quoteTextEl.style.opacity = 0;

    setTimeout(() => {
      quoteTextEl.textContent = q.text;
      if (quoteAuthorEl) quoteAuthorEl.textContent = q.author;
      if (quoteRoleEl) quoteRoleEl.textContent = q.role;
      if (quoteImgEl && q.image) quoteImgEl.src = q.image;
      quoteTextEl.style.opacity = 1;
    }, 200);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex - 1 + quotesData.length) % quotesData.length;
      updateQuote(currentQuoteIndex);
    });

    nextBtn.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotesData.length;
      updateQuote(currentQuoteIndex);
    });
  }

  // Audio quote speech synthesis simulation
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(quotesData[currentQuoteIndex].text.replace(/[“”]/g, ''));
        speech.rate = 0.95;
        speech.pitch = 1.0;
        window.speechSynthesis.speak(speech);

        audioBtn.innerHTML = '🔊 <span>Reading Quote...</span>';
        audioBtn.style.background = '#7E22CE';
        audioBtn.style.color = '#FFFFFF';

        speech.onend = () => {
          audioBtn.innerHTML = '🎙️ <span>Listen to Quote</span>';
          audioBtn.style.background = '';
          audioBtn.style.color = '';
        };
      } else {
        showToast("Audio preview ready!");
      }
    });
  }



  // 3. Counter Animation for Impact Stats
  const statNumbers = document.querySelectorAll('.stat-number');
  let animated = false;

  function runCounters() {
    if (animated) return;
    statNumbers.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      let current = 0;
      const increment = target / 50;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = prefix + target.toLocaleString() + suffix;
          clearInterval(timer);
        } else {
          counter.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
        }
      }, 30);
    });
    animated = true;
  }

  // Trigger counters when scrolled into view
  const heroStatsSection = document.querySelector('.hero-stats');
  if (heroStatsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        runCounters();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(heroStatsSection);
  }

  // 4. Google Sheets Lead Capture Form Handler
  // Paste your deployed Google Apps Script Web App URL below (see google-apps-script/Code.gs)
  const GOOGLE_SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxgMUgvHxiSHwnS00IsqN6Uw85lAJ0Q-vkXebvzs7fzjBYbGLWDsLarKGIJ5sjKpV4Tyw/exec';

  const toast = document.getElementById('toastMsg');

  function showToast(message) {
    if (!toast) return;
    const toastText = toast.querySelector('.toast-text');
    if (toastText) toastText.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 5500);
  }

  // Handle all enquiry & strategy modal forms across all pages (#auditForm, #modalForm, etc.)
  const allContactForms = document.querySelectorAll('#auditForm, #modalForm, .cta-form, .audit-form, .modal-form');

  allContactForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      const clientName = form.querySelector('#clientName, #modalClientName')?.value.trim() || 'Valued Client';
      const isModalForm = form.id === 'modalForm' || form.classList.contains('modal-form');

      if (!GOOGLE_SHEET_WEB_APP_URL || GOOGLE_SHEET_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
        console.warn('Google Sheet Web App URL is not configured in js/script.js (GOOGLE_SHEET_WEB_APP_URL).');
        showToast('⚠️ Lead sheet endpoint not configured yet. Please set GOOGLE_SHEET_WEB_APP_URL in js/script.js.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Submitting...</span>';
      }

      // Extract and normalize form fields for clean Google Sheet columns
      const formData = new FormData(form);
      const payload = new URLSearchParams();
      const rawData = {};

      formData.forEach((value, key) => {
        rawData[key] = typeof value === 'string' ? value.trim() : value;
      });

      const fullMobile = rawData['Country Code'] && rawData['Mobile Number']
        ? `${rawData['Country Code']} ${rawData['Mobile Number']}`
        : (rawData['Mobile Number'] || '');

      const modalServiceLabel = isModalForm
        ? (document.getElementById('modalServiceName')?.textContent?.trim() || rawData['Requested Service'] || '')
        : '';

      const selectedService = rawData['Selected Service'] || modalServiceLabel || rawData['Requested Service'] || '';

      payload.set('Full Name', rawData['Full Name'] || '');
      payload.set('Company Name', rawData['Company Name'] || '');
      payload.set('Work Email', rawData['Work Email'] || '');
      payload.set('Country Code', rawData['Country Code'] || '');
      payload.set('Mobile Number', rawData['Mobile Number'] || '');
      payload.set('Full Mobile Number', fullMobile);
      payload.set('Selected Service', selectedService);
      payload.set('Source Form', isModalForm ? 'Strategy Call Modal' : 'Website Enquiry Form');
      payload.set('Page', window.location.pathname.split('/').pop() || 'index.html');

      try {
        const response = await fetch(GOOGLE_SHEET_WEB_APP_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: payload.toString()
        });

        let isSuccess = response.ok;
        if (response.ok) {
          try {
            const result = await response.json();
            if (result && result.status === 'error') {
              isSuccess = false;
            }
          } catch (_) {
            // Non-JSON 200 response from Apps Script still indicates delivery
          }
        }

        if (isSuccess) {
          showToast(
            isModalForm
              ? `✨ Thank you, ${clientName}! Your consultation request for ${selectedService || 'our services'} has been saved.`
              : `✅ Thank you, ${clientName}! Your enquiry has been received and our team will contact you within 24 hours.`
          );
          form.reset();

          if (isModalForm) {
            const serviceOverlay = document.getElementById('serviceModalOverlay');
            if (serviceOverlay) {
              serviceOverlay.classList.remove('active');
              document.body.style.overflow = '';
            }
          }
        } else {
          showToast('⚠️ Could not submit right now. Please try again or reach us on WhatsApp.');
        }
      } catch (err) {
        console.error('Google Sheets submission failed:', err);
        showToast('⚠️ Network error while submitting. Please try again or reach us on WhatsApp.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  });



  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

  // 6. Interactive Cosmic Space Canvas & Starfield
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    let resizeRaf = null;

    window.addEventListener('resize', () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        if (!canvas) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      });
    }, { passive: true });

    const isMobileCanvas = isTouchDevice || window.innerWidth <= 768;
    const particles = [];
    const particleCount = isMobileCanvas ? 24 : 70;
    const useShadowBlur = !isMobileCanvas;

    class StarParticle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 0.8;
        this.alpha = Math.random() * 0.8 + 0.2;
        this.twinkleSpeed = Math.random() * 0.02 + 0.005;
        this.color = Math.random() > 0.4 ? 'rgba(255, 255, 255,' : (Math.random() > 0.5 ? 'rgba(192, 132, 252,' : 'rgba(96, 165, 250,');
      }

      update(mouse) {
        this.x += this.vx;
        this.y += this.vy;

        // Twinkle effect
        this.alpha += this.twinkleSpeed;
        if (this.alpha > 0.95 || this.alpha < 0.2) {
          this.twinkleSpeed *= -1;
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140 && dist > 0) {
            this.x -= (dx / dist) * 1.8;
            this.y -= (dy / dist) * 1.8;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${this.alpha})`;
        if (useShadowBlur) {
          ctx.shadowBlur = this.radius > 1.8 ? 12 : 4;
          ctx.shadowColor = 'rgba(192, 132, 252, 0.8)';
        }
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new StarParticle());
    }

    const mouse = { x: null, y: null };
    const heroSection = document.getElementById('hero');

    if (heroSection && !isTouchDevice) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      }, { passive: true });

      heroSection.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    let isCanvasVisible = true;
    let animFrameId = null;

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);

      // Draw faint constellation connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 12100) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse);
        particles[i].draw();
      }
    }

    function animate() {
      if (!isCanvasVisible || document.hidden || isReducedMotion) {
        animFrameId = null;
        return;
      }
      drawFrame();
      animFrameId = requestAnimationFrame(animate);
    }

    function startCanvasLoop() {
      if (isReducedMotion) {
        drawFrame();
        return;
      }
      if (!animFrameId && isCanvasVisible && !document.hidden) {
        animFrameId = requestAnimationFrame(animate);
      }
    }

    if ('IntersectionObserver' in window) {
      const canvasObserver = new IntersectionObserver((entries) => {
        isCanvasVisible = entries[0].isIntersecting;
        if (isCanvasVisible) {
          startCanvasLoop();
        } else if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
      }, { threshold: 0.05 });
      canvasObserver.observe(canvas);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      } else if (!document.hidden && isCanvasVisible) {
        startCanvasLoop();
      }
    });

    startCanvasLoop();
  }

  initHeroCanvas();

  // 7. Interactive 3D Card Tilt & Astronaut Rotation Effect (Desktop Only)
  function initHeroTiltCard() {
    const tiltCard = document.getElementById('heroTiltCard');
    const heroSection = document.getElementById('hero');
    if (!tiltCard || !heroSection || isReducedMotion || isTouchDevice) return;

    let tiltRaf = null;
    let lastClientX = 0;
    let lastClientY = 0;

    heroSection.addEventListener('mousemove', (e) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
      if (tiltRaf) return;

      tiltRaf = requestAnimationFrame(() => {
        tiltRaf = null;
        const rect = tiltCard.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        // Vertical subtle tilt (-12deg to 12deg)
        const y = lastClientY - cardCenterY;
        const tiltX = Math.max(-12, Math.min(12, (y / (rect.height / 2)) * -12));

        // Horizontal rotation based on cursor movement towards left edge
        let rotateY = 0;
        if (lastClientX < cardCenterX) {
          const leftRatio = Math.max(0, Math.min(1, (cardCenterX - lastClientX) / cardCenterX));
          rotateY = leftRatio * -50;
        } else {
          const rightMax = (window.innerWidth - cardCenterX) || 1;
          const rightRatio = Math.max(0, Math.min(1, (lastClientX - cardCenterX) / rightMax));
          rotateY = rightRatio * -50;
        }

        tiltCard.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      });
    }, { passive: true });

    heroSection.addEventListener('mouseleave', () => {
      if (tiltRaf) {
        cancelAnimationFrame(tiltRaf);
        tiltRaf = null;
      }
      tiltCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }

  initHeroTiltCard();

  // 8. Normal Service Page Interactive Logic (Filter, Search, Accordions, Modal)
  const serviceCards = document.querySelectorAll('.service-detail-card');
  const filterBtns = document.querySelectorAll('.category-filter-tabs .filter-btn');
  const serviceSearchInput = document.getElementById('serviceSearchInput');
  const accordionToggleBtns = document.querySelectorAll('.toggle-accordion-btn');
  const bookServiceBtns = document.querySelectorAll('.book-service-btn');
  const serviceModalOverlay = document.getElementById('serviceModalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalForm = document.getElementById('modalForm');
  const modalServiceName = document.getElementById('modalServiceName');
  const modalServiceVal = document.getElementById('modalServiceVal');
  const modalServiceTitle = document.getElementById('modalServiceTitle');
  const clientGoalSelect = document.getElementById('clientGoal');

  let activeCategory = 'all';
  let currentSearchQuery = '';

  function filterServiceCards() {
    serviceCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      const textContent = card.textContent.toLowerCase();

      const matchesCat = (activeCategory === 'all' || cardCat === activeCategory);
      const matchesSearch = !currentSearchQuery || textContent.includes(currentSearchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-category') || 'all';
      filterServiceCards();
    });
  });

  if (serviceSearchInput) {
    serviceSearchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      filterServiceCards();
    });
  }

  // Accordion Toggle Logic
  accordionToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const accordion = document.getElementById(targetId);
      if (!accordion) return;

      const isOpen = accordion.classList.contains('open');
      const textSpan = btn.querySelector('span:first-child');

      if (isOpen) {
        accordion.classList.remove('open');
        btn.classList.remove('open');
        if (textSpan) textSpan.textContent = 'View In-Depth Details';
      } else {
        accordion.classList.add('open');
        btn.classList.add('open');
        if (textSpan) textSpan.textContent = 'Hide Details';
      }
    });
  });

  // Strategy Booking Modal Logic
  bookServiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-service-val');
      const title = btn.getAttribute('data-service-title');

      if (modalServiceName) modalServiceName.textContent = title;
      if (modalServiceTitle) modalServiceTitle.textContent = `Book ${title} Strategy Call`;
      if (modalServiceVal) modalServiceVal.value = val;

      if (clientGoalSelect && val) {
        clientGoalSelect.value = val;
      }

      if (serviceModalOverlay) {
        serviceModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeServiceModal() {
    if (serviceModalOverlay) {
      serviceModalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn && serviceModalOverlay) {
    modalCloseBtn.addEventListener('click', closeServiceModal);

    serviceModalOverlay.addEventListener('click', (e) => {
      if (e.target === serviceModalOverlay) {
        closeServiceModal();
      }
    });
  }

  // 9. Work / Portfolio Page Interactive Logic (Filter, Video Controls, Lightbox)
  const workFilterBtns = document.querySelectorAll('.work-filter-btn');
  const workCards = document.querySelectorAll('.work-card');
  const lightboxOverlay = document.getElementById('workLightboxOverlay');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxMediaBox = document.getElementById('lightboxMediaContainer');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxSub = document.getElementById('lightboxSub');

  // Filter Work Projects (All, Images [4], Videos [2])
  workFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      workFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';

      workCards.forEach(card => {
        const type = card.getAttribute('data-type');
        if (filter === 'all' || type === filter) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
        }
      });
    });
  });

  // Video Play/Pause Overlay Logic
  const videoWrappers = document.querySelectorAll('.video-media-wrapper');
  videoWrappers.forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const iframe = wrapper.querySelector('iframe');
    const overlay = wrapper.querySelector('.video-play-overlay');

    if (video && overlay) {
      overlay.addEventListener('click', () => {
        video.play().then(() => {
          overlay.style.opacity = '0';
          overlay.style.pointerEvents = 'none';
          video.setAttribute('controls', 'controls');
        }).catch(err => {
          console.log('Video play error:', err);
          video.setAttribute('controls', 'controls');
          overlay.style.opacity = '0';
        });
      });

      video.addEventListener('click', () => {
        if (!video.paused) {
          video.pause();
          overlay.style.opacity = '1';
          overlay.style.pointerEvents = 'auto';
        }
      });

      video.addEventListener('ended', () => {
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
      });
    }

    if (iframe && overlay) {
      overlay.addEventListener('click', () => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        let src = iframe.getAttribute('src') || '';
        if (src && !src.includes('autoplay=1')) {
          src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
          iframe.setAttribute('src', src);
        }
      });
    }
  });

  // Lightbox Preview Modal for Images
  const lightboxTriggerBtns = document.querySelectorAll('.btn-preview-lightbox');
  lightboxTriggerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-src');
      const title = btn.getAttribute('data-title');

      if (lightboxMediaBox && src) {
        lightboxMediaBox.innerHTML = `<img src="${src}" alt="${title}" class="lightbox-img">`;
      }
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxSub) lightboxSub.textContent = 'LUMEO Digital Media Showcase';

      if (lightboxOverlay) lightboxOverlay.classList.add('active');
    });
  });

  if (lightboxCloseBtn && lightboxOverlay) {
    lightboxCloseBtn.addEventListener('click', () => {
      lightboxOverlay.classList.remove('active');
      if (lightboxMediaBox) lightboxMediaBox.innerHTML = '';
    });

    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) {
        lightboxOverlay.classList.remove('active');
        if (lightboxMediaBox) lightboxMediaBox.innerHTML = '';
      }
    });
  }

  // Mobile Navigation Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active');
      mobileMenuBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // URL Hash Anchor Support (e.g. services.html#google-ads)
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    const targetElement = document.getElementById(hash);
    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }

  // ==========================================================================
  // 10. LUMEO Creative Frontend Motion & Micro-Interaction Engine
  // ==========================================================================

  // --------------------------------------------------------------------------
  // A. Ambient Cursor Spotlight Trailing Accent (Desktop Only)
  // --------------------------------------------------------------------------
  if (!isReducedMotion && !isTouchDevice) {
    const cursorGlow = document.createElement('div');
    cursorGlow.id = 'ambientCursorGlow';
    cursorGlow.className = 'ambient-cursor-glow';
    document.body.appendChild(cursorGlow);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isVisible = false;
    let cursorRafId = null;

    function animateCursorGlow() {
      if (!isVisible) {
        cursorRafId = null;
        return;
      }
      currentX += (mouseX - currentX) * 0.50;
      currentY += (mouseY - currentY) * 0.50;
      cursorGlow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      cursorRafId = requestAnimationFrame(animateCursorGlow);
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        cursorGlow.classList.add('active');
        if (!cursorRafId) {
          cursorRafId = requestAnimationFrame(animateCursorGlow);
        }
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      isVisible = false;
      cursorGlow.classList.remove('active');
      if (cursorRafId) {
        cancelAnimationFrame(cursorRafId);
        cursorRafId = null;
      }
    });
  }

  // --------------------------------------------------------------------------
  // B. Magnetic Button Micro-Interactions (Desktop Only)
  // --------------------------------------------------------------------------
  if (!isReducedMotion && !isTouchDevice) {
    const magneticBtns = document.querySelectorAll(
      '.btn-primary, .btn-secondary, .btn-glow, .filter-btn, .work-filter-btn, .btn-preview-lightbox, .book-service-btn, .quote-nav-btn'
    );

    magneticBtns.forEach(btn => {
      let btnRaf = null;
      let btnX = 0;
      let btnY = 0;

      btn.addEventListener('mousemove', (e) => {
        btnX = e.clientX;
        btnY = e.clientY;
        if (btnRaf) return;
        btnRaf = requestAnimationFrame(() => {
          btnRaf = null;
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (btnX - centerX) * 0.32;
          const deltaY = (btnY - centerY) * 0.32;
          btn.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale3d(1.03, 1.03, 1.03)`;
        });
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        if (btnRaf) {
          cancelAnimationFrame(btnRaf);
          btnRaf = null;
        }
        btn.style.transform = `translate3d(0, 0, 0) scale3d(1, 1, 1)`;
      });
    });
  }

  // --------------------------------------------------------------------------
  // C. Interactive Spotlight Coordinates & 3D Tilt for Glass Cards (Desktop)
  // --------------------------------------------------------------------------
  if (!isReducedMotion && !isTouchDevice) {
    const tiltableCards = document.querySelectorAll(
      '.service-card, .service-detail-card, .work-card, .quote-card, .cta-card, .process-card, .why-card, .value-card, .feature-card'
    );

    tiltableCards.forEach(card => {
      let cardRaf = null;
      let cardClientX = 0;
      let cardClientY = 0;

      card.addEventListener('mousemove', (e) => {
        cardClientX = e.clientX;
        cardClientY = e.clientY;
        if (cardRaf) return;

        cardRaf = requestAnimationFrame(() => {
          cardRaf = null;
          const rect = card.getBoundingClientRect();
          const x = cardClientX - rect.left;
          const y = cardClientY - rect.top;

          // Update CSS variables for internal radial spotlight highlight
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -6.5;
          const rotateY = ((x - centerX) / centerX) * 6.5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(0, -6px, 0) scale3d(1.02, 1.02, 1.02)`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (cardRaf) {
          cancelAnimationFrame(cardRaf);
          cardRaf = null;
        }
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0) scale3d(1, 1, 1)`;
      });
    });
  }

  // --------------------------------------------------------------------------
  // D. Scroll Reveal Animations (IntersectionObserver System)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll(
    '.service-card, .service-detail-card, .work-card, .quote-card, .cta-card, .process-card, .stat-item, .section-header, .why-card, .value-card, .feature-card, .matrix-card'
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal-element');
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const childIndex = siblings.indexOf(el);
      if (childIndex >= 0) {
        el.style.transitionDelay = `${(childIndex % 5) * 0.09}s`;
      }
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px 80px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --------------------------------------------------------------------------
  // E. Navbar Elevation (IntersectionObserver) & rAF-Throttled Desktop Parallax
  // --------------------------------------------------------------------------
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const scrollSentinel = document.createElement('div');
    scrollSentinel.setAttribute('aria-hidden', 'true');
    scrollSentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:35px;pointer-events:none;opacity:0;';
    document.body.prepend(scrollSentinel);

    if ('IntersectionObserver' in window) {
      const navObserver = new IntersectionObserver((entries) => {
        navbar.classList.toggle('navbar-scrolled', !entries[0].isIntersecting);
      }, { threshold: 0 });
      navObserver.observe(scrollSentinel);
    }
  }

  const ambientBlobs = document.querySelectorAll('.bg-ambient-blob');
  const heroVisual = document.querySelector('.hero-visual');
  const spacePlanets = document.querySelectorAll('.space-planet');
  const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;

  if (!isReducedMotion && !isTouchDevice && !isMobileViewport) {
    let latestScrollY = window.scrollY || window.pageYOffset;
    let ticking = false;
    let isHeroVisualVisible = true;

    if (heroVisual && 'IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        isHeroVisualVisible = entries[0].isIntersecting;
      }, { rootMargin: '120px 0px 120px 0px', threshold: 0 });
      heroObserver.observe(heroVisual);
    }

    function updateParallax() {
      // Ambient Background Blobs Parallax Shift
      ambientBlobs.forEach((blob, i) => {
        const speed = (i + 1) * 0.12;
        blob.style.transform = `translate3d(0, ${latestScrollY * speed}px, 0)`;
      });

      // Hero Visual Depth Parallax (only while visible)
      if (heroVisual && isHeroVisualVisible && latestScrollY < 1000) {
        heroVisual.style.transform = `translate3d(0, ${latestScrollY * 0.15}px, 0)`;
      }

      // Floating Space Planets Parallax Depth
      spacePlanets.forEach((planet, i) => {
        const factor = (i % 2 === 0 ? 1 : -1) * (0.08 + (i * 0.04));
        planet.style.transform = `translate3d(0, ${latestScrollY * factor}px, 0)`;
      });

      ticking = false;
    }

    window.addEventListener('scroll', () => {
      latestScrollY = window.scrollY || window.pageYOffset;
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    updateParallax();
  }

  // --------------------------------------------------------------------------
  // F. Mouse Move Ambient Parallax for Floating Accents & Sparkles (rAF Throttled)
  // --------------------------------------------------------------------------
  if (!isReducedMotion && !isTouchDevice) {
    const sparkles = document.querySelectorAll('.diamond-sparkle, .quote-sparkle');
    if (sparkles.length > 0) {
      let sparkleRaf = null;
      let mouseNormX = 0;
      let mouseNormY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseNormX = e.clientX / window.innerWidth - 0.5;
        mouseNormY = e.clientY / window.innerHeight - 0.5;
        if (sparkleRaf) return;

        sparkleRaf = requestAnimationFrame(() => {
          sparkleRaf = null;
          sparkles.forEach((sparkle, i) => {
            const factor = ((i % 3) + 1) * 14;
            sparkle.style.transform = `translate3d(${mouseNormX * factor}px, ${mouseNormY * factor}px, 0) rotate(${mouseNormX * 15}deg)`;
          });
        });
      }, { passive: true });
    }
  }
});



