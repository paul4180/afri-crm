/* Outlook-style background and glass panels. Loaded only by the CRM page. */
(function () {
  var s = document.createElement('style');
  s.textContent = [
    'html, body {',
    '  background: #0b1220 url("/wallpaper.jpg") no-repeat center center fixed !important;',
    '  background-size: cover !important;',
    '  min-height: 100vh;',
    '}',
    '#app, #view { background: transparent !important; backdrop-filter: none !important; }',
    'aside, #nav {',
    '  background: rgba(15, 18, 32, 0.92) !important;',
    '  color: #e2e8f0 !important;',
    '  border-right: 1px solid rgba(255,255,255,0.06) !important;',
    '}',
    'header {',
    '  background: rgba(15, 18, 32, 0.88) !important;',
    '  color: #e2e8f0 !important;',
    '}',
    '.card, .leadcard, .actcard, .today-stat, .glance, .panel {',
    '  background: rgba(20, 24, 40, 0.72) !important;',
    '  backdrop-filter: blur(16px) !important;',
    '  -webkit-backdrop-filter: blur(16px) !important;',
    '  border: 1px solid rgba(255,255,255,0.08) !important;',
    '  color: #e2e8f0 !important;',
    '}',
    '#view, #view * { text-shadow: none !important; }',
    '#view .meta, #view .hello { color: #94a3b8 !important; font-weight: 500 !important; }',
    '@media (max-width: 820px) {',
    '  html, body { background: #0b1220 !important; }',
    '}'
  ].join('\n');
  document.head.appendChild(s);
})();
