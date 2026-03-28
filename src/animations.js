document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Progress Bar
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  // 2. Sticky Header Box Shadow
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('premium-shadow');
        header.style.transition = 'box-shadow 0.3s ease';
      } else {
        header.classList.remove('premium-shadow');
      }
    });
  }

  // 3. Intersection Observer for Scroll Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // Handle count-up animation
        if (entry.target.classList.contains('count-up')) {
          const targetStr = entry.target.getAttribute('data-target') || '0';
          const target = parseInt(targetStr, 10);
          if (!isNaN(target) && target > 0) {
            let count = 0;
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            const updateCount = () => {
              count += increment;
              if (count < target) {
                entry.target.innerText = Math.ceil(count).toString();
                requestAnimationFrame(updateCount);
              } else {
                entry.target.innerText = targetStr; // Restore original string (e.g., "100+")
                entry.target.classList.remove('count-up');
              }
            };
            updateCount();
          } else {
             entry.target.classList.remove('count-up');
          }
        }
        
        // Optional: Stop observing once animated (if you only want it to happen once)
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Function to apply animations to elements
  const applyAnimations = () => {
    // Hero Section
    const heroHeading = document.querySelector('h1');
    if (heroHeading && !heroHeading.classList.contains('reveal')) {
      heroHeading.classList.add('reveal', 'visible');
      heroHeading.style.transitionDuration = '0.8s';
    }
    
    const heroSubtitle = document.querySelector('h1 + p, h1 + div > p');
    if (heroSubtitle && !heroSubtitle.classList.contains('reveal')) {
      heroSubtitle.classList.add('reveal', 'visible');
      heroSubtitle.style.transitionDelay = '0.3s';
    }

    const heroButtons = document.querySelectorAll('.hero-buttons a, .hero-buttons button, [class*="hero"] button, [class*="hero"] a');
    heroButtons.forEach(btn => {
      if (!btn.classList.contains('fade-scale')) {
        btn.classList.add('fade-scale', 'visible');
        btn.style.transitionDelay = '0.5s';
      }
    });

    const heroBg = document.querySelector('[class*="hero"] img.absolute, [class*="hero"] .absolute.inset-0 img');
    if (heroBg && !heroBg.classList.contains('ken-burns')) {
      heroBg.classList.add('ken-burns');
    }

    // Navigation
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
      if (!link.classList.contains('hover-underline')) {
        link.classList.add('hover-underline');
      }
    });

    const logo = document.querySelector('header img[alt*="logo" i], header img[src*="logo" i]');
    if (logo && !logo.hasAttribute('data-animated')) {
      logo.style.opacity = '0';
      logo.style.transition = 'opacity 0.5s ease';
      setTimeout(() => logo.style.opacity = '1', 100);
      logo.setAttribute('data-animated', 'true');
    }

    // Scroll Triggered Elements
    const cards = document.querySelectorAll('.grid > div, .card, article');
    cards.forEach((card, index) => {
      if (!card.classList.contains('reveal')) {
        card.classList.add('reveal');
        card.style.transitionDelay = `${(index % 4) * 0.1}s`; // Stagger up to 4 items
        observer.observe(card);
      }
    });

    const sectionHeadings = document.querySelectorAll('h2, h3:not(article h3)');
    sectionHeadings.forEach(heading => {
      if (!heading.classList.contains('slide-left')) {
        heading.classList.add('slide-left');
        observer.observe(heading);
      }
    });

    const featureIcons = document.querySelectorAll('.lucide, [class*="icon"]');
    featureIcons.forEach(icon => {
      if (!icon.classList.contains('bounce-scale')) {
        icon.classList.add('bounce-scale');
        observer.observe(icon);
      }
    });

    const dividers = document.querySelectorAll('hr, .divider');
    dividers.forEach(divider => {
      if (!divider.classList.contains('width-expand')) {
        divider.classList.add('width-expand');
        observer.observe(divider);
      }
    });

    const authorCards = document.querySelectorAll('[class*="author"], [class*="member"]');
    authorCards.forEach(card => {
      if (!card.classList.contains('fade-scale')) {
        card.classList.add('fade-scale');
        observer.observe(card);
      }
    });

    const images = document.querySelectorAll('img:not(header img)');
    images.forEach(img => {
      if (!img.classList.contains('fade-zoom')) {
        img.classList.add('fade-zoom');
        observer.observe(img);
        
        // Lazy load fade-in
        if (img.complete) {
          img.classList.add('visible');
        } else {
          img.addEventListener('load', () => {
            img.classList.add('visible');
          });
        }
      }
    });

    // Buttons & CTAs
    const buttons = document.querySelectorAll('button, .btn, a[class*="bg-"]');
    buttons.forEach(btn => {
      if (!btn.classList.contains('btn-animate')) {
        btn.classList.add('btn-animate');
      }
    });

    // Form Elements
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (!input.classList.contains('input-glow')) {
        input.classList.add('input-glow');
      }
    });

    const submitBtns = document.querySelectorAll('button[type="submit"]');
    submitBtns.forEach(btn => {
      if (!btn.hasAttribute('data-loading-listener')) {
        btn.addEventListener('click', function() {
          // Only add loading if form is valid (simplified check)
          const form = this.closest('form');
          if (!form || form.checkValidity()) {
             this.classList.add('loading');
             setTimeout(() => this.classList.remove('loading'), 2000); // Remove after 2s for demo
          }
        });
        btn.setAttribute('data-loading-listener', 'true');
      }
    });

    // Table of Contents / Lists
    const listItems = document.querySelectorAll('ul li, ol li');
    listItems.forEach((li, index) => {
      if (!li.classList.contains('reveal')) {
        li.classList.add('reveal');
        li.style.transitionDelay = `${(index % 10) * 0.08}s`;
        observer.observe(li);
      }
    });

    const articleRows = document.querySelectorAll('tr, .article-row');
    articleRows.forEach(row => {
      if (!row.classList.contains('row-highlight')) {
        row.classList.add('row-highlight');
      }
    });

    // Footer
    const footerSections = document.querySelectorAll('footer > div > div');
    footerSections.forEach((section, index) => {
      if (!section.classList.contains('reveal')) {
        section.classList.add('reveal');
        section.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(section);
      }
    });

    const socialIcons = document.querySelectorAll('footer a .lucide, footer a[href*="twitter"], footer a[href*="facebook"], footer a[href*="linkedin"]');
    socialIcons.forEach(icon => {
      // If the icon is an SVG, apply to parent A tag for better transform origin
      const target = icon.tagName.toLowerCase() === 'svg' ? icon.parentElement : icon;
      if(target && !target.classList.contains('social-icon-animate')) {
        target.classList.add('social-icon-animate');
      }
    });

    // Stats / Counters
    const statNumbers = document.querySelectorAll('[class*="stat-number"], [class*="count"]');
    statNumbers.forEach(stat => {
      if (!stat.classList.contains('count-up') && !stat.hasAttribute('data-target')) {
        const text = stat.innerText.replace(/[^0-9]/g, '');
        if (text && parseInt(text, 10) > 0) {
          stat.setAttribute('data-target', stat.innerText); // Store original text
          stat.innerText = '0';
          stat.classList.add('count-up');
          observer.observe(stat);
        }
      }
    });

    const statCards = document.querySelectorAll('[class*="stat-card"]');
    statCards.forEach(card => {
      if (!card.classList.contains('pulse-border')) {
        card.classList.add('pulse-border');
      }
    });
  };

  // Run initially
  applyAnimations();

  // Re-run when React router changes (MutationObserver on root)
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const mutationObserver = new MutationObserver((mutations) => {
      // Debounce to prevent running too often
      clearTimeout(window.animationTimeout);
      window.animationTimeout = setTimeout(() => {
        applyAnimations();
      }, 100);
    });
    
    mutationObserver.observe(rootElement, { childList: true, subtree: true });
  }
});
