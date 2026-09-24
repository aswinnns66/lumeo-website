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
      }
    }, { threshold: 0.5 });
    observer.observe(heroStatsSection);
  }

  // 4. Contact Form Email Submission Handler
  // Set your target recipient email address here (e.g. your specific Gmail address)
  const TARGET_GMAIL_ADDRESS = 'lumeodigitalmedia@gmail.com';

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

  // Handle all contact forms across all pages (#auditForm, #modalForm, etc.)
  const allContactForms = document.querySelectorAll('#auditForm, #modalForm, .cta-form, .audit-form, .modal-form');

  allContactForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      const clientName = form.querySelector('#clientName, #modalClientName')?.value || 'Valued Client';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳ Sending Email...</span>';
      }

      // Extract form field values
      const formData = new FormData(form);
      const dataObj = {};
      formData.forEach((value, key) => {
        dataObj[key] = value;
      });

      if (dataObj['Country Code'] && dataObj['Mobile Number']) {
        dataObj['Full Mobile Number'] = `${dataObj['Country Code']} ${dataObj['Mobile Number']}`;
      }

      dataObj['_subject'] = dataObj['_subject'] || `New Lead Enquiry from ${clientName}`;
      dataObj['_captcha'] = 'false';

      try {
        const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TARGET_GMAIL_ADDRESS)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(dataObj)
        });

        if (response.ok) {
          showToast(`📩 Thank you, ${clientName}! Your enquiry has been sent directly to ${TARGET_GMAIL_ADDRESS}.`);
          form.reset();

          const modalOverlay = document.getElementById('strategyModal');
          if (modalOverlay) modalOverlay.classList.remove('active');
        } else {
          // If response not ok, submit form directly
          form.action = `https://formsubmit.co/${encodeURIComponent(TARGET_GMAIL_ADDRESS)}`;
          form.submit();
        }
      } catch (err) {
        console.warn('Network error during form submission, submitting via standard POST:', err);
        form.action = `https://formsubmit.co/${encodeURIComponent(TARGET_GMAIL_ADDRESS)}`;
        form.submit();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  });



  // 6. Interactive Cosmic Space Canvas & Starfield
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    window.addEventListener('resize', () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    const particles = [];
    const particleCount = 70;

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

        if (mouse.x) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            this.x -= (dx / dist) * 1.8;
            this.y -= (dy / dist) * 1.8;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${this.alpha})`;
        ctx.shadowBlur = this.radius > 1.8 ? 12 : 4;
        ctx.shadowColor = 'rgba(192, 132, 252, 0.8)';
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new StarParticle());
    }

    const mouse = { x: null, y: null };
    const heroSection = document.getElementById('hero');

    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      heroSection.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw faint constellation connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update(mouse);
        p.draw();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  initHeroCanvas();

  // 7. Interactive 3D Card Tilt Effect
  function initHeroTiltCard() {
    const tiltCard = document.getElementById('heroTiltCard');
    const heroSection = document.getElementById('hero');
    if (!tiltCard || !heroSection) return;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = tiltCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = (y / (rect.height / 2)) * -12;
      const tiltY = (x / (rect.width / 2)) * 12;

      tiltCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    heroSection.addEventListener('mouseleave', () => {
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
      }
    });
  });

  if (modalCloseBtn && serviceModalOverlay) {
    modalCloseBtn.addEventListener('click', () => {
      serviceModalOverlay.classList.remove('active');
    });

    serviceModalOverlay.addEventListener('click', (e) => {
      if (e.target === serviceModalOverlay) {
        serviceModalOverlay.classList.remove('active');
      }
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('modalClientName')?.value || 'Valued Client';
      const serviceName = modalServiceName ? modalServiceName.textContent : 'Service';

      showToast(`✨ Thank you, ${name}! Your consultation request for ${serviceName} has been received.`);
      modalForm.reset();
      if (serviceModalOverlay) serviceModalOverlay.classList.remove('active');
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
  // 10. Scroll Reveal Animations (IntersectionObserver)
  // ==========================================================================
  const revealElements = document.querySelectorAll(
    '.service-card, .service-detail-card, .work-card, .quote-card, .cta-card, .process-card, .stat-item, .section-header, .why-card, .value-card, .feature-card'
  );

  revealElements.forEach((el) => {
    el.classList.add('reveal-element');
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const childIndex = siblings.indexOf(el);
      if (childIndex >= 0) {
        el.style.transitionDelay = `${(childIndex % 5) * 0.1}s`;
      }
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================================================
  // 11. Multi-Layer Scroll Parallax
  // ==========================================================================
  const ambientBlobs = document.querySelectorAll('.bg-ambient-blob');
  const heroVisual = document.querySelector('.hero-visual');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Background Blobs Parallax Shift
    ambientBlobs.forEach((blob, i) => {
      const speed = (i + 1) * 0.12;
      blob.style.transform = `translateY(${scrolled * speed}px)`;
    });

    // Hero Visual Parallax Depth
    if (heroVisual && scrolled < 900) {
      heroVisual.style.transform = `translateY(${scrolled * 0.15}px)`;
    }
  }, { passive: true });

  // ==========================================================================
  // 12. Interactive 3D Card Tilt Effect on Mouse Move
  // ==========================================================================
  const tiltableCards = document.querySelectorAll(
    '.service-card, .service-detail-card, .work-card, .quote-card, .cta-card, .process-card, .why-card, .value-card'
  );

  tiltableCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale3d(1, 1, 1)`;
    });
  });

  // ==========================================================================
  // 13. Mouse Move Parallax for Floating Accents & Sparkles
  // ==========================================================================
  const sparkles = document.querySelectorAll('.diamond-sparkle, .quote-sparkle');
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    sparkles.forEach((sparkle, i) => {
      const factor = ((i % 3) + 1) * 12;
      sparkle.style.transform = `translate(${mouseX * factor}px, ${mouseY * factor}px) rotate(${mouseX * 15}deg)`;
    });
  });
});


