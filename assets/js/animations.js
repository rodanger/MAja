/**
* Animations
* Visual enhancements layered over main.js. Styles live in assets/css/animations.css.
*/
document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Header shrink + background on scroll, and scroll-top progress ring
   */
  const header = document.querySelector('#header');
  const scrollTop = document.querySelector('.scroll-top');
  const sectionLinks = Array.from(document.querySelectorAll('#navbar a[href^="#"]'))
    .filter(link => link.hash.length > 1 && document.querySelector(link.hash));
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('header-scrolled', y > 100);
    }
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTop) {
      const progress = max > 0 ? Math.min(y / max, 1) : 0;
      scrollTop.style.setProperty('--scroll-progress', progress.toFixed(3));
    }
    updateActiveLink(y, max);
    ticking = false;
  }

  /**
   * Highlight the menu link of the section in view (single page navigation)
   */
  function updateActiveLink(y, max) {
    if (!sectionLinks.length) return;
    let current = sectionLinks[0];
    if (y >= max - 2) {
      current = sectionLinks[sectionLinks.length - 1];
    } else {
      sectionLinks.forEach(link => {
        const top = document.querySelector(link.hash).getBoundingClientRect().top;
        if (top <= window.innerHeight * 0.35) current = link;
      });
    }
    sectionLinks.forEach(link => link.classList.toggle('active', link === current));
  }

  /**
   * Arriving with a section in the URL (e.g. /#gallery from the old page
   * redirects): jump again once the page has finished its layout
   */
  window.addEventListener('load', () => {
    const target = window.location.hash.length > 1 && document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (target) {
      window.requestAnimationFrame(() => target.scrollIntoView({ behavior: 'instant' }));
    }
  });

  /**
   * Gallery images load lazily: re-run the masonry layout as they arrive
   */
  const portfolioContainer = document.querySelector('.portfolio-container');
  if (portfolioContainer) {
    let layoutQueued = false;
    portfolioContainer.addEventListener('load', (event) => {
      if (event.target.tagName !== 'IMG' || layoutQueued || typeof Isotope === 'undefined') return;
      layoutQueued = true;
      window.requestAnimationFrame(() => {
        layoutQueued = false;
        const iso = Isotope.data(portfolioContainer);
        if (iso) iso.layout();
      });
    }, true);
  }

  document.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  window.addEventListener('load', onScroll);
  onScroll();

  if (reduceMotion) return;

  /**
   * Line icons draw their strokes the first time they scroll into view
   */
  const icons = document.querySelectorAll('.ico');
  if (icons.length && 'IntersectionObserver' in window) {
    const iconObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          iconObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    icons.forEach(icon => {
      icon.classList.add('is-pending');
      iconObserver.observe(icon);
    });
  }

  /**
   * 3D tilt on painting cards (desktop pointers only)
   */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const maxTilt = 6;
    document.querySelectorAll('.constructions .card-item').forEach(card => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.classList.add('is-tilting');
        card.style.setProperty('--tilt-x', (-y * maxTilt).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', (x * maxTilt).toFixed(2) + 'deg');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('is-tilting');
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  /**
   * Bounce on gallery filter click
   */
  document.querySelectorAll('.portfolio-flters li').forEach(filter => {
    filter.addEventListener('click', () => {
      filter.classList.remove('filter-bounce');
      void filter.offsetWidth; // restart the animation
      filter.classList.add('filter-bounce');
    });
    filter.addEventListener('animationend', () => filter.classList.remove('filter-bounce'));
  });

  /**
   * Fade out before navigating to another page of the site
   */
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.target === '_blank' || link.hasAttribute('download') || link.classList.contains('glightbox')) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;

      event.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => {
        window.location.href = url.href;
      }, 350);
    });
  });

  // Restore visibility when coming back with the browser's back button (bfcache)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.body.classList.remove('page-leaving');
    }
  });

});
