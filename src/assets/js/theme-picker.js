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

  function applyTheme(theme) {
    root.removeAttribute('data-theme');
    if (theme === 'system') {
      // Let CSS prefers-color-scheme handle it
    } else {
      root.setAttribute('data-theme', theme);
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
    updateToggleButton(theme);
  }

  function updateToggleButton(theme) {
    const toggle = document.querySelector('.theme-toggle');
    if (!toggle) return;
    const labels = { light: '☀️ Light', dark: '🌙 Dark', system: '🌓 System' };
    toggle.textContent = labels[theme] || '🌓 System';
    toggle.setAttribute('aria-pressed', theme === 'system' ? 'false' : 'true');
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
