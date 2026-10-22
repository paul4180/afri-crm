/* Wallpaper, type, and panels are fixed in crm-studio.js.
   This file only keeps the wallpaper sharp if an old skin is cached. */
(function () {
  var s = document.createElement('style');
  s.textContent = [
    'html, body { background: #0b1220 url("/wallpaper.jpg") no-repeat center center fixed !important; background-size: cover !important; }',
    '#app, #view, main, .work { background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }',
    '#view, #view * { text-shadow: none !important; }'
  ].join('\n');
  document.head.appendChild(s);
})();
