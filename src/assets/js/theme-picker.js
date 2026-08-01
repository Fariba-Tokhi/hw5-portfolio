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
    
    // Set the data-theme attribute on root
    if (theme === THEMES.SYSTEM) {
      root.removeAttribute('data-theme');
      toggle.setAttribute('aria-pressed', 'false');
      // Use textContent instead of innerHTML
      toggle.textContent = '🌓 System';
    } else {
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
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function() {
      if (getStoredTheme() === THEMES.SYSTEM) {
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
