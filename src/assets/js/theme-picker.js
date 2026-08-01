(function() {
  const STORAGE_KEY = 'theme-preference';
  const root = document.documentElement;
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (_) {}
    return 'system';
  }

  function applyTheme(theme) {
    root.removeAttribute('data-theme');
    if (theme === 'system') {
      toggle.textContent = '🌓 System';
      toggle.setAttribute('aria-pressed', 'false');
    } else {
      root.setAttribute('data-theme', theme);
      toggle.textContent = theme === 'light' ? '☀️ Light' : '🌙 Dark';
      toggle.setAttribute('aria-pressed', 'true');
    }
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function cycleTheme() {
    const current = getStoredTheme();
    const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    applyTheme(next);
  }

  function init() {
    applyTheme(getStoredTheme());
    toggle.addEventListener('click', cycleTheme);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
      if (getStoredTheme() === 'system') applyTheme('system');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
