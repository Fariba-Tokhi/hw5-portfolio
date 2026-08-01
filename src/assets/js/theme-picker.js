(function() {
  const STORAGE_KEY = 'theme-preference';
  const root = document.documentElement;
  const options = document.querySelectorAll('.theme-option');
  if (!options.length) return;

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

  function syncControls(theme) {
    options.forEach(function(input) {
      input.checked = input.value === theme;
    });
  }

  function init() {
    const current = getStoredTheme();
    syncControls(current);
    applyTheme(current);

    options.forEach(function(input) {
      input.addEventListener('change', function() {
        if (input.checked) applyTheme(input.value);
      });
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
