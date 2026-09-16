/**
 * Scribbleverse Theme Switcher
 * Handles Light (Paper Cream) and Dark (Chalkboard) modes with zero flash.
 */

(function () {
  const THEME_KEY = 'scribbleverse_theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    // Light mode is the default mode for all new visitors
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update button aria attributes if button is loaded
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to Paper Mode' : 'Switch to Chalkboard Mode');
      toggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Paper Mode' : 'Switch to Chalkboard Mode');
    }
  }

  // Apply immediately upon script execution
  applyTheme(getPreferredTheme());

  // Attach listener after DOM load
  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    // Sound toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    if (soundBtn && window.CuteAudio) {
      const updateSoundUI = () => {
        const muted = window.CuteAudio.isMuted();
        soundBtn.setAttribute('title', muted ? 'Cute Sound Effects (Muted)' : 'Cute Sound Effects (Active)');
        if (soundIcon) soundIcon.textContent = muted ? '🔇' : '🔊';
      };
      updateSoundUI();

      soundBtn.addEventListener('click', () => {
        const isMuted = window.CuteAudio.toggleMute();
        updateSoundUI();
        if (!isMuted) window.CuteAudio.pop();
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        if (window.CuteAudio) window.CuteAudio.pop();
      });
    }

    // Mobile nav toggle & popping interactions
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('is-open');
        const isOpen = navLinks.classList.contains('is-open');
        mobileToggle.setAttribute('aria-expanded', isOpen);
        if (window.CuteAudio && !window.CuteAudio.isMuted()) {
          window.CuteAudio.pop();
        }
      });
    }

    // Popping sound on hover and auto-close on mobile link click
    const navLinkEls = document.querySelectorAll('.nav-link');
    navLinkEls.forEach(link => {
      link.addEventListener('mouseenter', () => {
        if (window.CuteAudio && !window.CuteAudio.isMuted()) {
          window.CuteAudio.pop();
        }
      });
      link.addEventListener('click', () => {
        if (window.CuteAudio && !window.CuteAudio.isMuted()) {
          window.CuteAudio.click();
        }
        if (navLinks && navLinks.classList.contains('is-open')) {
          navLinks.classList.remove('is-open');
          if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks && navLinks.classList.contains('is-open')) {
        if (!navLinks.contains(e.target) && mobileToggle && !mobileToggle.contains(e.target)) {
          navLinks.classList.remove('is-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });
})();
