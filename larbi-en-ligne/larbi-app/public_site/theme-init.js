// Applied before React mounts, so the page never flashes the wrong
// theme while the bundle loads. ThemeProvider (src/theme) takes over
// from here and keeps this attribute in sync afterwards.
// A separate file (not an inline <script>) so the server's Content Security
// Policy can stay "script-src 'self'" in production.
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // Storage unavailable: leave the default (light) tokens in place.
  }
})();
