(function() {
  'use strict';
  
  // Theme states
  const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
  };
  
  const STORAGE_KEY = 'theme-preference';
  
  // Get the root element
  const root = document.documentElement;
  
  // Get the theme toggle button
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  
  // Get current theme from localStorage or default to system
  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || THEMES.SYSTEM;
    } catch (e) {
      return THEMES.SYSTEM;
    }
  }
  
  // Apply theme to root
  function applyTheme(theme) {
    if (theme === THEMES.SYSTEM) {
      root.removeAttribute('data-theme');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.textContent = '🌓 System';
    } else {
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-pressed', 'true');
      toggle.textContent = theme === THEMES.LIGHT ? '☀️ Light' : '🌙 Dark';
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // localStorage unavailable, silently continue
    }
  }
  
  // Cycle through themes
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
  
  // Initialize
  function init() {
    const stored = getStoredTheme();
    applyTheme(stored);
    
    toggle.addEventListener('click', cycleTheme);
    
    // Handle system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function() {
      if (getStoredTheme() === THEMES.SYSTEM) {
        applyTheme(THEMES.SYSTEM);
      }
    });
  }
  
  // Only run if JavaScript is available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();