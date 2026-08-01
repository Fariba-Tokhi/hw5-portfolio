(function() {
  'use strict';
  
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  };
  
  const STORAGE_KEY = 'theme-preference';
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  
  if (!toggle) return;
  
  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.values(THEMES).includes(stored)) {
        return stored;
      }
    } catch (e) {
      // localStorage unavailable
    }
    return THEMES.SYSTEM;
  }
  
  function applyTheme(theme) {
    // Clear any existing theme attribute
    root.removeAttribute('data-theme');
    
    if (theme === THEMES.SYSTEM) {
      // System theme: remove attribute so CSS prefers-color-scheme takes over
      root.removeAttribute('data-theme');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.textContent = '🌓 System';
    } else {
      // Apply the theme
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-pressed', 'true');
      toggle.textContent = theme === THEMES.LIGHT ? '☀️ Light' : '🌙 Dark';
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // localStorage unavailable
    }
  }
  
  function cycleTheme() {
    const current = getStoredTheme();
    let next;
    
    if (current === THEMES.SYSTEM) {
      next = THEMES.LIGHT;
    } else if (current === THEMES.LIGHT) {
      next = THEMES.DARK;
    } else {
      next = THEMES.SYSTEM;
    }
    
    applyTheme(next);
  }
  
  function init() {
    const stored = getStoredTheme();
    applyTheme(stored);
    
    toggle.addEventListener('click', cycleTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function() {
      if (getStoredTheme() === THEMES.SYSTEM) {
        // Re-apply system theme to reflect change
        applyTheme(THEMES.SYSTEM);
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
