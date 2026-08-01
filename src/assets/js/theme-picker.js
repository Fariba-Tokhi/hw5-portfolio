(function() {
  const STORAGE_KEY = 'theme-preference';
  const root = document.documentElement;
  const select = document.querySelector('#theme-select');
  if (!select) return;

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
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function init() {
    const current = getStoredTheme();
    select.value = current;
    applyTheme(current);

    select.addEventListener('change', function() {
      applyTheme(select.value);
    });

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
