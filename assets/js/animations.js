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
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle('header-scrolled', y > 100);
    }
    if (scrollTop) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(y / max, 1) : 0;
      scrollTop.style.setProperty('--scroll-progress', progress.toFixed(3));
    }
    ticking = false;
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
