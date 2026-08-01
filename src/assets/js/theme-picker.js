(function() {
  const STORAGE_KEY = 'theme-preference';
  const root = document.documentElement;

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (_) {}
    return 'system';
  }

  function setThemeState(theme) {
    // Explicitly set data-theme attribute on root
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    // Also set a data-theme-state for debugging
    root.setAttribute('data-theme-state', theme);
  }

  function applyTheme(theme) {
    setThemeState(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;

    // Clear all text and set the correct one using textContent
    toggle.textContent = '';

    const labels = {
      light: '☀️ Light',
      dark: '🌙 Dark',
      system: '🌓 System'
    };

    const textNode = document.createTextNode(labels[theme] || '🌓 System');
    toggle.appendChild(textNode);

    if (theme === 'system') {
      toggle.setAttribute('aria-pressed', 'false');
    } else {
      toggle.setAttribute('aria-pressed', 'true');
    }
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    applyTheme(next);
  }

  function init() {
    const theme = getStoredTheme();
    applyTheme(theme);

    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', cycleTheme);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
      if (getStoredTheme() === 'system') {
        applyTheme('system');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
