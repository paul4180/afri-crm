/* Afri CRM studio: the screens that sit on the records, not on sample names. */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    /* The .gate background + .gate .panel.card shadow are now defined in
       crm.html itself (modernized two-column login layout). No override
       needed here. */

    /* ============================================================
       TODAY (Home / My activity) — modernized card-first + mobile-first
       Keeps the existing class names (.actdash, .actgrid, .actcard,
       .rowline, .timeline, .titem) so the JS render logic stays
       unchanged. Adds .today-stats row at top + .empty state pattern.
       ============================================================ */
    .today-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 0 0 18px;
    }
    .today-stat {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 16px;
      transition: border-color 0.15s, transform 0.1s, box-shadow 0.15s;
      cursor: default;
    }
    .today-stat:hover {
      border-color: #14b8a6;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
    }
    .today-stat b {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
      letter-spacing: -0.02em;
      line-height: 1.1;
    }
    .today-stat span {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    @media (max-width: 880px) {
      .today-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .today-stat b { font-size: 22px; }
    }

    /* Modernized actcards — same class names, better visuals */
    .actcard {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px 18px;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .actcard:hover {
      border-color: #cbd5e1;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
    }
    .actcard h2 {
      margin: 0 0 12px;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .actcard h2 .meta {
      font-size: 11px;
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 999px;
      color: #64748b;
      text-transform: none;
      letter-spacing: 0;
      font-weight: 600;
    }

    /* Empty state — icon + message + optional CTA */
    .empty {
      text-align: center;
      padding: 16px 8px 8px;
      color: #64748b;
    }
    .empty .empty-ico {
      font-size: 22px;
      margin-bottom: 6px;
      opacity: 0.5;
    }
    .empty p {
      margin: 0 0 8px;
      font-size: 13px;
      color: #94a3b8;
      font-style: italic;
    }
    .empty button {
      font-size: 12px;
      padding: 6px 12px;
    }

    /* Mobile-first: stack everything on small screens */
    @media (max-width: 880px) {
      .actdash { grid-template-columns: 1fr !important; }
      .actgrid { grid-template-columns: 1fr !important; }
    }

    /* ============================================================
       ONBOARDING WIZARD — modal multi-step setup for first-time
       signup. Auto-opens when workspace.done === 0. Posts to the
       same /crm/api/setup endpoint as the existing chat wizard.
       The chat wizard (drawSetup in crm.html) is still available
       via the "Use guided setup" link.
       ============================================================ */
    .wizard-overlay {
      position: fixed; inset: 0; z-index: 90;
      background:
        radial-gradient(circle at 15% 20%, rgba(13, 148, 136, 0.18) 0%, transparent 50%),
        radial-gradient(circle at 85% 80%, rgba(124, 58, 237, 0.18) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%),
        linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
      backdrop-filter: blur(8px);
      display: grid; place-items: center;
      padding: 16px;
      overflow: hidden;
      animation: wizard-fade 0.25s ease-out;
    }
    .wizard-overlay::before {
      content: '';
      position: absolute; inset: -50%;
      background:
        radial-gradient(circle at 30% 30%, rgba(45, 212, 191, 0.15) 0%, transparent 8%),
        radial-gradient(circle at 70% 60%, rgba(167, 139, 250, 0.12) 0%, transparent 10%),
        radial-gradient(circle at 50% 80%, rgba(96, 165, 250, 0.1) 0%, transparent 12%);
      animation: wizard-drift 20s linear infinite;
      pointer-events: none;
    }
    @keyframes wizard-drift {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }
    @keyframes wizard-fade { from { opacity: 0; } to { opacity: 1; } }
    .wizard-card {
      position: relative;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 24px;
      width: min(560px, 100%);
      max-height: 90vh;
      overflow: auto;
      box-shadow:
        0 30px 80px rgba(15, 23, 42, 0.5),
        0 12px 32px rgba(15, 23, 42, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset;
      animation: wizard-pop 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .wizard-card::before {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, #0d9488, #6366f1, #8b5cf6, #0d9488);
      background-size: 200% 100%;
      animation: wizard-shimmer 3s linear infinite;
      border-radius: 24px 24px 0 0;
    }
    @keyframes wizard-shimmer {
      0% { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }
    @keyframes wizard-pop {
      from { transform: translateY(20px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    .wizard-head {
      padding: 28px 28px 0;
      display: flex; justify-content: space-between; align-items: center;
    }
    .wizard-eyebrow {
      font-size: 11px; font-weight: 800; letter-spacing: 0.18em;
      color: #0d9488; text-transform: uppercase;
      display: flex; align-items: center; gap: 6px;
    }
    .wizard-eyebrow::before {
      content: ''; width: 16px; height: 2px; background: #0d9488; border-radius: 99px;
    }
    .wizard-skip {
      background: transparent; border: 1px solid #e2e8f0; color: #64748b;
      font-size: 12px; font-weight: 600; cursor: pointer;
      padding: 6px 12px; border-radius: 99px;
      transition: all 0.12s;
    }
    .wizard-skip:hover { color: #0f172a; border-color: #cbd5e1; background: #f8fafc; }
    .wizard-body { padding: 20px 28px 12px; position: relative; }
    .wizard-body-anim {
      animation: wizard-step-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes wizard-step-in {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .wizard-body h2 {
      font-size: 26px; font-weight: 800; color: #0f172a;
      margin: 0 0 8px; letter-spacing: -0.025em;
      line-height: 1.2;
    }
    .wizard-body p.wizard-sub {
      color: #64748b; font-size: 14px; line-height: 1.6;
      margin: 0 0 24px;
    }
    .wizard-choices {
      display: grid; gap: 12px; margin-bottom: 8px;
      grid-template-columns: 1fr;
    }
    @media (min-width: 480px) {
      .wizard-choices { grid-template-columns: 1fr 1fr; }
      .wizard-choices .wizard-choice.full-span { grid-column: 1 / -1; }
    }
    .wizard-choice {
      display: flex; align-items: center; gap: 14px;
      padding: 16px; border-radius: 14px;
      border: 1.5px solid #e2e8f0; background: #fff;
      cursor: pointer; text-align: left;
      transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
      font: inherit; color: #0f172a;
      position: relative; overflow: hidden;
    }
    .wizard-choice::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(13, 148, 136, 0.06), rgba(99, 102, 241, 0.04));
      opacity: 0;
      transition: opacity 0.18s;
      pointer-events: none;
    }
    .wizard-choice:hover {
      border-color: #14b8a6; transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(13, 148, 136, 0.12);
    }
    .wizard-choice:hover::before { opacity: 1; }
    .wizard-choice:active { transform: translateY(0) scale(0.98); transition-duration: 0.04s; }
    .wizard-choice.on {
      border-color: #0d9488; background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
      box-shadow:
        0 0 0 3px rgba(13, 148, 136, 0.12),
        0 8px 20px rgba(13, 148, 136, 0.18);
    }
    .wizard-choice.on::after {
      content: '✓';
      position: absolute; top: 12px; right: 12px;
      width: 22px; height: 22px; border-radius: 50%;
      background: #0d9488; color: #fff;
      font-size: 13px; font-weight: 700;
      display: grid; place-items: center;
      animation: wizard-check-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes wizard-check-pop {
      from { transform: scale(0) rotate(-90deg); }
      to { transform: scale(1) rotate(0deg); }
    }
    .wizard-choice .ico {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      display: grid; place-items: center;
      font-size: 22px; flex-shrink: 0;
      transition: all 0.18s;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
    }
    /* Per-step icon color themes */
    .wizard-choice[data-color="teal"] .ico { background: linear-gradient(135deg, #ccfbf1, #99f6e4); }
    .wizard-choice[data-color="blue"] .ico { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
    .wizard-choice[data-color="violet"] .ico { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
    .wizard-choice[data-color="amber"] .ico { background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .wizard-choice[data-color="rose"] .ico { background: linear-gradient(135deg, #fce7f3, #fbcfe8); }
    .wizard-choice[data-color="emerald"] .ico { background: linear-gradient(135deg, #d1fae5, #a7f3d0); }
    .wizard-choice.on .ico { transform: scale(1.06); }
    .wizard-choice .label b { display: block; font-size: 14px; font-weight: 700; margin-bottom: 3px; color: #0f172a; }
    .wizard-choice .label span { font-size: 12px; color: #64748b; line-height: 1.4; }
    .wizard-foot {
      padding: 16px 28px 24px;
      display: flex; gap: 10px; align-items: center;
      border-top: 1px solid #f1f5f9;
    }
    .wizard-foot .step-dots {
      display: flex; gap: 6px; flex: 1; align-items: center;
    }
    .wizard-foot .step-dots i {
      width: 8px; height: 8px; border-radius: 50%;
      background: #cbd5e1; transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .wizard-foot .step-dots i.on { background: #0d9488; width: 28px; border-radius: 99px; box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.18); }
    .wizard-foot .step-dots i.done { background: #5eead4; }
    .wizard-foot button.primary {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: #fff; border: 0; border-radius: 12px;
      padding: 12px 22px; font-weight: 700; font-size: 14px;
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);
      position: relative; overflow: hidden;
    }
    .wizard-foot button.primary::before {
      content: '';
      position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s;
    }
    .wizard-foot button.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(13, 148, 136, 0.4);
    }
    .wizard-foot button.primary:hover::before { left: 100%; }
    .wizard-foot button.primary:active { transform: translateY(0) scale(0.98); }
    .wizard-foot button.primary:disabled {
      background: #e2e8f0; color: #94a3b8; cursor: not-allowed;
      transform: none; box-shadow: none;
    }
    .wizard-foot button.primary:disabled::before { display: none; }
    .wizard-foot button.ghost {
      background: transparent; border: 0; color: #64748b;
      font-size: 13px; font-weight: 600; cursor: pointer; padding: 12px 14px;
      transition: color 0.12s;
    }
    .wizard-foot button.ghost:hover { color: #0f172a; }
    .wizard-foot a.advanced {
      margin-left: auto; font-size: 12px; color: #94a3b8;
      text-decoration: underline; text-underline-offset: 2px;
      transition: color 0.12s;
    }
    .wizard-foot a.advanced:hover { color: #475569; }
    @media (max-width: 480px) {
      .wizard-card { border-radius: 18px; }
      .wizard-head, .wizard-body, .wizard-foot { padding-left: 20px; padding-right: 20px; }
      .wizard-body h2 { font-size: 22px; }
      .wizard-choices { grid-template-columns: 1fr; }
    }

    /* ============================================================
       QUICK TOUR — 5-step tooltip overlay for first-time users.
       Auto-opens after the onboarding wizard closes. Always
       reachable via the "Tour" button in the header.
       ============================================================ */
    .tour-target-highlight {
      position: relative !important;
      z-index: 91 !important;
      box-shadow: 0 0 0 9999px rgba(2, 6, 23, 0.65), 0 0 0 4px #14b8a6 !important;
      border-radius: 10px !important;
      transition: box-shadow 0.2s !important;
    }
    .tour-tooltip {
      position: fixed;
      background: #fff;
      border-radius: 16px;
      padding: 18px 20px;
      max-width: 340px;
      z-index: 92;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 8px 18px rgba(0,0,0,0.15);
      animation: tour-pop 0.18s ease-out;
    }
    @keyframes tour-pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    .tour-tooltip .tour-eyebrow {
      font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
      color: #0d9488; text-transform: uppercase; margin-bottom: 6px;
    }
    .tour-tooltip h3 {
      font-size: 17px; font-weight: 700; color: #0f172a;
      margin: 0 0 6px; letter-spacing: -0.01em;
    }
    .tour-tooltip p {
      color: #475569; font-size: 13px; line-height: 1.5;
      margin: 0 0 14px;
    }
    .tour-tooltip .tour-foot {
      display: flex; gap: 8px; align-items: center;
      border-top: 1px solid #f1f5f9; padding-top: 10px;
      margin-top: 4px;
    }
    .tour-tooltip .tour-dots { display: flex; gap: 5px; flex: 1; }
    .tour-tooltip .tour-dots i {
      width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1;
      transition: background 0.15s, width 0.15s;
    }
    .tour-tooltip .tour-dots i.on { background: #0d9488; width: 18px; border-radius: 99px; }
    .tour-tooltip .tour-dots i.done { background: #5eead4; }
    .tour-tooltip button.tour-skip {
      background: transparent; border: 0; color: #94a3b8;
      font-size: 12px; cursor: pointer; padding: 6px 8px;
    }
    .tour-tooltip button.tour-skip:hover { color: #475569; }
    .tour-tooltip button.tour-back {
      background: transparent; border: 0; color: #64748b;
      font-size: 13px; cursor: pointer; padding: 8px 12px;
      border-radius: 8px;
    }
    .tour-tooltip button.tour-back:hover { background: #f1f5f9; color: #0f172a; }
    .tour-tooltip button.tour-next {
      background: linear-gradient(135deg, #0d9488, #0f766e);
      color: #fff; border: 0; border-radius: 10px;
      padding: 9px 16px; font-weight: 700; font-size: 13px;
      cursor: pointer; transition: transform 0.1s, box-shadow 0.15s;
    }
    .tour-tooltip button.tour-next:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13, 148, 136, 0.3); }
    .tour-tooltip button.tour-next:disabled {
      background: #e2e8f0; color: #94a3b8; cursor: not-allowed;
      transform: none; box-shadow: none;
    }
    @media (max-width: 480px) {
      .tour-tooltip { max-width: calc(100vw - 32px); padding: 16px; }
    }

    /* ============================================================
       DEALS BOARD — modernized card-first + stage-color accents
       Keeps existing .dealboard, .col, .stagepill, .dealcard,
       .colfoot, .addslot class names so the JS render logic
       stays unchanged. Enhances visuals + adds mobile-first
       responsive behavior for the list view.
       ============================================================ */
    .dealboard {
      display: flex; gap: 12px; overflow: auto;
      padding: 4px 4px 12px;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
    }
    .dealboard .col {
      min-width: 260px; flex: 1;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-top: 4px solid var(--stage-color, #cbd5e1);
      border-radius: 14px;
      padding: 12px;
      display: flex; flex-direction: column;
      max-height: 64vh;
      scroll-snap-align: start;
    }
    .stagepill {
      display: inline-flex; gap: 6px; align-items: center;
      align-self: flex-start; color: #fff; font-size: 11px;
      font-weight: 700; padding: 4px 10px; border-radius: 999px;
      margin: 0 0 8px; letter-spacing: 0.04em; text-transform: uppercase;
    }
    .stagepill .count {
      background: rgba(255, 255, 255, 0.25); padding: 1px 7px;
      border-radius: 999px; font-size: 11px;
    }
    .col-total {
      font-size: 14px; font-weight: 700; color: #0f172a;
      margin-bottom: 10px; padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .col-total .muted {
      display: block; font-size: 11px; font-weight: 500;
      color: #64748b; margin-top: 2px;
    }
    .dealboard .cards { overflow: auto; flex: 1; min-height: 80px; }

    .dealcard {
      background: #fff; border-radius: 12px; padding: 12px;
      margin-bottom: 10px;
      border-left: 3px solid var(--stage-color, #cbd5e1);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }
    .dealcard:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
    }
    .dealcard .card-top {
      display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;
    }
    .dealcard .chip {
      font-size: 10px; font-weight: 700; padding: 2px 7px;
      border-radius: 999px; letter-spacing: 0.04em;
    }
    .dealcard .chip.warn { background: #fef3c7; color: #92400e; }
    .dealcard .chip.paid { background: #dcfce7; color: #166534; }
    .dealcard .deal-name {
      display: block; color: #0f172a; font-size: 15px;
      font-weight: 700; line-height: 1.3; margin-bottom: 4px;
      letter-spacing: -0.01em;
    }
    .dealcard .deal-amount {
      font-size: 16px; font-weight: 700; color: #0f766e;
      margin-bottom: 8px; letter-spacing: -0.02em;
    }
    .dealcard .card-meta {
      display: flex; justify-content: space-between;
      align-items: center; gap: 8px; margin-bottom: 8px;
    }
    .dealcard .contact-line {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: #475569; min-width: 0; flex: 1;
    }
    .dealcard .contact-line .avatar {
      width: 22px; height: 22px; border-radius: 50%;
      background: #e2e8f0; color: #475569;
      display: grid; place-items: center;
      font-size: 9px; font-weight: 800; flex-shrink: 0;
    }
    .dealcard .contact-line span:last-child {
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .dealcard .date-chip {
      font-size: 11px; font-weight: 600; color: #64748b;
      background: #f1f5f9; padding: 3px 8px; border-radius: 6px;
      flex-shrink: 0;
    }
    .dealcard .date-chip.overdue { background: #fee2e2; color: #991b1b; }
    .dealcard .date-chip.soon { background: #ffedd5; color: #9a3412; }
    .dealcard .card-actions {
      display: flex; gap: 6px; padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }
    .dealcard .card-actions button.mini {
      font-size: 11px; padding: 5px 10px; border-radius: 8px;
      background: #f1f5f9; color: #0f766e; border: 0;
      font-weight: 600; cursor: pointer; transition: background 0.12s;
    }
    .dealcard .card-actions button.mini:hover { background: #e2e8f0; }
    .dealcard .card-actions button.mini.ghost {
      background: transparent; color: #94a3b8;
    }
    .dealcard .card-actions button.mini.ghost:hover {
      background: #fee2e2; color: #991b1b;
    }

    /* Empty state per column */
    .empty-col {
      text-align: center; padding: 16px 8px;
      color: #94a3b8;
    }
    .empty-col .empty-ico { font-size: 22px; margin-bottom: 6px; opacity: 0.6; }
    .empty-col p { margin: 0 0 8px; font-size: 12px; font-style: italic; }
    .empty-col .addslot {
      width: 100%; background: #f0fdfa; color: #0f766e;
      border: 1px dashed #99f6e4; border-radius: 999px;
      padding: 6px 12px; font-size: 12px; font-weight: 600;
      cursor: pointer; transition: background 0.12s;
    }
    .empty-col .addslot:hover { background: #ccfbf1; }

    /* List view — responsive: cards on mobile, table on desktop */
    .sheet table { width: 100%; }
    @media (max-width: 680px) {
      .sheet table, .sheet tbody, .sheet tr, .sheet td { display: block; width: auto !important; }
      .sheet thead { display: none; }
      .sheet tr {
        background: #fff; border: 1px solid #e2e8f0;
        border-radius: 12px; padding: 12px; margin-bottom: 8px;
      }
      .sheet td { padding: 4px 0 !important; border: 0 !important; }
    }

    /* Filter bar — wrap on mobile */
    .filters { flex-wrap: wrap; }
    @media (max-width: 880px) {
      .filters select, .filters input, .filters button {
        font-size: 12px; padding: 6px 10px;
      }
    }

    /* ============================================================
       DEALS BOARD v2 — research-driven modernization
       Patterns applied (Attio/Pipedrive/Folk):
       - Stage color as background tint (subtle pastel per column)
       - Health badge (At risk / Watch / Healthy) per deal
       - Bigger deal value (24px bold)
       - Stage progress bar at top of card
       - Last activity timestamp (relative)
       - Drag handle visual affordance
       - Gradient avatar based on name hash
       ============================================================ */

    /* Column background tint by stage color */
    .dealboard .col[data-stage-tint="1"] {
      background: linear-gradient(180deg,
        color-mix(in srgb, var(--stage-color, #cbd5e1) 8%, #ffffff) 0%,
        color-mix(in srgb, var(--stage-color, #cbd5e1) 4%, #f8fafc) 100%);
    }
    .dealboard .col[data-stage-tint="1"][data-closed="1"] {
      background: linear-gradient(180deg,
        color-mix(in srgb, var(--stage-color, #cbd5e1) 15%, #ffffff) 0%,
        color-mix(in srgb, var(--stage-color, #cbd5e1) 8%, #f8fafc) 100%);
    }

    /* Stage progress bar at top of deal card */
    .dealcard .stage-progress {
      position: absolute; top: 0; left: 0; right: 0;
      height: 3px; background: #f1f5f9;
      border-radius: 12px 12px 0 0; overflow: hidden;
    }
    .dealcard .stage-progress-fill {
      height: 100%; background: var(--stage-color, #cbd5e1);
      transition: width 0.3s ease;
    }
    .dealcard { position: relative; padding-top: 16px; }

    /* Drag handle (visual only — DnD logic stays in existing handlers) */
    .dealcard .drag-handle {
      position: absolute; top: 12px; left: 4px;
      width: 8px; cursor: grab; color: #cbd5e1;
      font-size: 14px; line-height: 1; user-select: none;
      opacity: 0; transition: opacity 0.15s;
    }
    .dealcard:hover .drag-handle { opacity: 1; }
    .dealcard .drag-handle:active { cursor: grabbing; }

    /* Health badge — At risk / Watch */
    .dealcard .health-badge {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 999px; letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .dealcard .health-badge.risk {
      background: #fee2e2; color: #991b1b;
    }
    .dealcard .health-badge.risk::before { content: "●"; margin-right: 1px; }
    .dealcard .health-badge.watch {
      background: #ffedd5; color: #9a3412;
    }
    .dealcard .health-badge.watch::before { content: "●"; margin-right: 1px; }
    .dealcard .health-badge.healthy {
      background: #dcfce7; color: #166534;
    }
    .dealcard .health-badge.healthy::before { content: "●"; margin-right: 1px; }

    /* Bigger, more prominent deal value */
    .dealcard .deal-amount {
      font-size: 22px; font-weight: 800; color: #0f172a;
      margin: 4px 0 10px; letter-spacing: -0.03em;
      display: flex; align-items: baseline; gap: 6px;
    }
    .dealcard .deal-amount .paid-tag {
      font-size: 10px; font-weight: 700;
      background: #dcfce7; color: #166534;
      padding: 2px 6px; border-radius: 4px;
      letter-spacing: 0.04em; text-transform: uppercase;
    }

    /* Last activity line */
    .dealcard .last-activity {
      font-size: 11px; color: #94a3b8;
      display: flex; align-items: center; gap: 4px;
    }
    .dealcard .last-activity::before { content: "⊙"; font-size: 9px; }

    /* Gradient avatar (color from name hash) */
    .dealcard .contact-line .avatar,
    .contact-card .contact-avatar {
      background: var(--avatar-bg, linear-gradient(135deg, #cbd5e1, #94a3b8)) !important;
      color: #fff !important;
      font-weight: 800;
    }

    /* Card header layout */
    .dealcard .card-header {
      display: flex; align-items: flex-start; gap: 8px;
      margin-bottom: 4px; padding-left: 8px;
    }
    .dealcard .card-header .deal-name {
      flex: 1; font-size: 15px; font-weight: 700;
      color: #0f172a; line-height: 1.3;
      letter-spacing: -0.01em;
    }

    /* Card footer */
    .dealcard .card-foot {
      display: flex; justify-content: space-between;
      align-items: center; gap: 8px;
      padding-top: 8px; border-top: 1px solid #f1f5f9;
      margin-top: 8px;
    }

    /* ============================================================
       CONTACTS PAGE v2 — card grid (Folk / Attio inspired)
       Toggle between Card grid (default, modern) and Table
       (power-user, the original .sheet table layout).
       ============================================================ */
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
    }
    .contact-card {
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 14px; padding: 16px;
      cursor: pointer; position: relative;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
    }
    .contact-card:hover {
      border-color: #14b8a6; transform: translateY(-2px);
      box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
    }
    .contact-card .contact-head {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    }
    .contact-card .contact-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 14px; font-weight: 800; color: #fff;
      flex-shrink: 0;
    }
    .contact-card .contact-name {
      font-size: 15px; font-weight: 700; color: #0f172a;
      letter-spacing: -0.01em; line-height: 1.2;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .contact-card .contact-title {
      font-size: 12px; color: #64748b;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .contact-card .contact-company {
      font-size: 13px; color: #475569; font-weight: 600;
      margin-bottom: 10px; padding-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
      display: flex; align-items: center; gap: 6px;
    }
    .contact-card .contact-company::before { content: "🏢"; font-size: 12px; opacity: 0.6; }
    .contact-card .contact-status-row {
      display: flex; align-items: center; gap: 6px;
      margin-bottom: 10px; flex-wrap: wrap;
    }
    .contact-card .status-chip {
      font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 999px; letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .contact-card .status-chip.active { background: #dcfce7; color: #166534; }
    .contact-card .status-chip.customer { background: #dbeafe; color: #1e40af; }
    .contact-card .status-chip.inactive { background: #f1f5f9; color: #64748b; }
    .contact-card .last-touched {
      font-size: 11px; color: #94a3b8; margin-left: auto;
    }
    .contact-card .contact-meta-row {
      display: grid; grid-template-columns: 1fr auto;
      gap: 8px; align-items: center; margin-bottom: 12px;
    }
    .contact-card .contact-detail {
      font-size: 12px; color: #64748b; line-height: 1.5;
    }
    .contact-card .contact-detail a {
      color: #0d9488; text-decoration: none;
    }
    .contact-card .contact-detail a:hover { text-decoration: underline; }
    .contact-card .contact-actions {
      display: flex; gap: 6px; padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }
    .contact-card .action-btn {
      flex: 1; padding: 7px; border-radius: 8px;
      background: #f8fafc; color: #475569; border: 0;
      font-size: 12px; font-weight: 600; cursor: pointer;
      text-decoration: none; text-align: center;
      transition: background 0.12s, color 0.12s;
    }
    .contact-card .action-btn:hover { background: #f1f5f9; color: #0f172a; }
    .contact-card .action-btn.primary { background: #f0fdfa; color: #0d9488; }
    .contact-card .action-btn.primary:hover { background: #ccfbf1; }

    /* Empty state for contacts grid */
    .contact-empty {
      grid-column: 1 / -1;
      text-align: center; padding: 48px 16px;
      color: #94a3b8;
    }
    .contact-empty .empty-ico {
      font-size: 40px; margin-bottom: 10px; opacity: 0.5;
    }
    .contact-empty h2 {
      font-size: 18px; color: #475569;
      margin: 0 0 6px; font-weight: 700;
    }
    .contact-empty p {
      font-size: 13px; margin: 0 0 14px; color: #94a3b8;
    }

    /* View toggle (Cards / Table) */
    .view-toggle {
      display: inline-flex; gap: 2px; padding: 2px;
      background: #f1f5f9; border-radius: 8px;
    }
    .view-toggle button {
      background: transparent; border: 0; color: #64748b;
      font-size: 12px; font-weight: 600; cursor: pointer;
      padding: 6px 10px; border-radius: 6px;
    }
    .view-toggle button.on {
      background: #fff; color: #0f172a;
      box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    }

    @media (max-width: 680px) {
      .contact-grid { grid-template-columns: 1fr; }
    }

    /* ============================================================
       FEATURE A — DRAG-AND-DROP for deal cards (HTML5 DnD)
       Visual feedback: dragging card fades, drop target column
       gets a teal dashed border + slight scale.
       Reuses existing move(dealId, stageId) handler.
       ============================================================ */
    .dealcard[draggable="true"] { -webkit-user-drag: element; }
    .dealcard.dragging { opacity: 0.4; transform: rotate(1deg); }
    .dealboard .col.drop-target {
      border-color: #14b8a6 !important;
      box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.25) inset;
      background: linear-gradient(180deg, #f0fdfa 0%, #ecfdf5 100%) !important;
    }

    /* ============================================================
       FEATURE B — COMMAND PALETTE (Cmd+K / Ctrl+K)
       Attio-style global search modal. Searches deals, contacts,
       companies, leads. Keyboard navigation (up/down/enter/esc).
       ============================================================ */
    .cmdk-overlay {
      position: fixed; inset: 0; z-index: 95;
      background: rgba(2, 6, 23, 0.7);
      backdrop-filter: blur(6px);
      display: grid; place-items: start center;
      padding: 8vh 16px 16px;
      animation: cmdk-fade 0.15s ease-out;
    }
    @keyframes cmdk-fade { from { opacity: 0; } to { opacity: 1; } }
    .cmdk-card {
      background: #fff; border-radius: 16px;
      width: min(620px, 100%);
      max-height: 70vh; overflow: hidden;
      box-shadow: 0 30px 80px rgba(0,0,0,0.4);
      display: flex; flex-direction: column;
      animation: cmdk-pop 0.18s ease-out;
    }
    @keyframes cmdk-pop { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .cmdk-search {
      padding: 16px 18px; border-bottom: 1px solid #f1f5f9;
      display: flex; align-items: center; gap: 10px;
    }
    .cmdk-search svg { width: 18px; height: 18px; color: #94a3b8; flex-shrink: 0; }
    .cmdk-search input {
      flex: 1; border: 0; outline: 0; background: transparent;
      font-size: 16px; color: #0f172a;
    }
    .cmdk-search input::placeholder { color: #94a3b8; }
    .cmdk-search kbd {
      font-size: 11px; padding: 2px 6px; border-radius: 4px;
      background: #f1f5f9; color: #64748b; font-family: ui-monospace, monospace;
    }
    .cmdk-results { overflow: auto; padding: 6px; }
    .cmdk-group { padding: 6px 8px; }
    .cmdk-group-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: #94a3b8; text-transform: uppercase;
      padding: 6px 10px 4px;
    }
    .cmdk-item {
      display: flex; align-items: center; gap: 10px;
      padding: 9px 10px; border-radius: 8px;
      cursor: pointer; font-size: 14px; color: #0f172a;
    }
    .cmdk-item.on { background: #f0fdfa; color: #0d9488; }
    .cmdk-item .cmdk-ico {
      width: 22px; height: 22px; border-radius: 6px;
      background: var(--avatar-bg, linear-gradient(135deg, #cbd5e1, #94a3b8));
      color: #fff; display: grid; place-items: center;
      font-size: 10px; font-weight: 800; flex-shrink: 0;
    }
    .cmdk-item .cmdk-label { flex: 1; min-width: 0; }
    .cmdk-item .cmdk-label b {
      display: block; font-weight: 600;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .cmdk-item .cmdk-label span {
      font-size: 12px; color: #64748b;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;
    }
    .cmdk-item .cmdk-kind {
      font-size: 10px; color: #94a3b8; text-transform: uppercase;
      letter-spacing: 0.04em; font-weight: 600;
    }
    .cmdk-empty {
      padding: 40px 16px; text-align: center;
      color: #94a3b8; font-size: 14px;
    }
    .cmdk-foot {
      padding: 8px 14px; border-top: 1px solid #f1f5f9;
      display: flex; gap: 14px; font-size: 11px; color: #94a3b8;
    }
    .cmdk-foot kbd {
      background: #f1f5f9; padding: 1px 5px; border-radius: 3px;
      font-family: ui-monospace, monospace;
    }

    /* ============================================================
       FEATURE C — DARK MODE (Attio-inspired)
       Toggle in header. localStorage persistence. Auto-detects
       prefers-color-scheme on first load. Uses [data-theme=dark]
       on <html> + CSS variable overrides.
       ============================================================ */
    :root {
      --bg-app: #f4f7fb;
      --bg-card: #fff;
      --bg-aside: #1e293b;
      --bg-header: #0f172a;
      --bg-input: #fff;
      --bg-input-soft: #f8fafc;
      --border-default: #e2e8f0;
      --border-soft: #f1f5f9;
      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --text-on-dark: #e2e8f0;
      --text-on-dark-muted: #94a3b8;
      --accent: #0d9488;
      --accent-soft: #f0fdfa;
    }
    [data-theme="dark"] {
      --bg-app: #0b1220;
      --bg-card: #1e293b;
      --bg-aside: #0f172a;
      --bg-header: #020617;
      --bg-input: #1e293b;
      --bg-input-soft: #182234;
      --border-default: #334155;
      --border-soft: #1e293b;
      --text-primary: #f8fafc;
      --text-secondary: #cbd5e1;
      --text-muted: #94a3b8;
      --text-on-dark: #e2e8f0;
      --text-on-dark-muted: #64748b;
      --accent: #14b8a6;
      --accent-soft: #042f2e;
    }
    [data-theme="dark"] body { background: var(--bg-app); color: var(--text-primary); }
    [data-theme="dark"] .sheet,
    [data-theme="dark"] .card,
    [data-theme="dark"] .actcard,
    [data-theme="dark"] .dealcard,
    [data-theme="dark"] .contact-card,
    [data-theme="dark"] .glance,
    [data-theme="dark"] .report,
    [data-theme="dark"] .timeline,
    [data-theme="dark"] .leadcard { background: var(--bg-card); border-color: var(--border-default); color: var(--text-primary); }
    [data-theme="dark"] th, [data-theme="dark"] td { color: var(--text-secondary); border-color: var(--border-default); }
    [data-theme="dark"] input, [data-theme="dark"] select, [data-theme="dark"] textarea {
      background: var(--bg-input); color: var(--text-primary); border-color: var(--border-default);
    }
    [data-theme="dark"] .hello, [data-theme="dark"] .meta, [data-theme="dark"] .muted { color: var(--text-muted); }
    [data-theme="dark"] h1, [data-theme="dark"] h2, [data-theme="dark"] b { color: var(--text-primary); }
    [data-theme="dark"] .deal-amount { color: var(--accent); }
    [data-theme="dark"] .today-stat { background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input-soft) 100%); border-color: var(--border-default); }
    [data-theme="dark"] .leadcol { background: var(--bg-input-soft); border-color: var(--border-default); }
    [data-theme="dark"] .dealboard .col { background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-input-soft) 100%) !important; border-color: var(--border-default); }
    [data-theme="dark"] .empty-col p, [data-theme="dark"] .empty p { color: var(--text-muted); }
    [data-theme="dark"] .dealcard .card-actions button.mini { background: var(--bg-input-soft); color: var(--accent); }
    [data-theme="dark"] .dealcard .card-actions button.mini.ghost { background: transparent; color: var(--text-muted); }
    [data-theme="dark"] .view-toggle { background: var(--bg-input-soft); }
    [data-theme="dark"] .view-toggle button.on { background: var(--bg-card); color: var(--text-primary); }
    [data-theme="dark"] .cmdk-search input { color: var(--text-primary); }
    [data-theme="dark"] .cmdk-search kbd { background: var(--bg-input-soft); color: var(--text-muted); }

    /* ============================================================
       FEATURE F — CSV IMPORT
       Drag-drop zone + preview table + column mapping + import
       ============================================================ */
    .csv-overlay {
      position: fixed; inset: 0; z-index: 92;
      background: rgba(2, 6, 23, 0.65);
      backdrop-filter: blur(4px);
      display: grid; place-items: center;
      padding: 16px;
      animation: wizard-fade 0.18s ease-out;
    }
    .csv-card {
      background: #fff; border-radius: 20px;
      width: min(720px, 100%); max-height: 90vh; overflow: auto;
      box-shadow: 0 30px 80px rgba(0,0,0,0.35);
    }
    .csv-head {
      padding: 20px 24px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }
    .csv-head h2 { margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
    .csv-body { padding: 20px 24px; }
    .csv-drop {
      border: 2px dashed #cbd5e1; border-radius: 12px;
      padding: 32px 16px; text-align: center;
      color: #64748b; cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .csv-drop:hover, .csv-drop.over {
      border-color: #14b8a6; background: #f0fdfa; color: #0d9488;
    }
    .csv-drop .drop-ico { font-size: 28px; margin-bottom: 6px; }
    .csv-drop p { margin: 0; font-size: 14px; }
    .csv-drop input { display: none; }
    .csv-preview {
      margin-top: 16px; max-height: 260px; overflow: auto;
      border: 1px solid #e2e8f0; border-radius: 10px;
    }
    .csv-preview table { width: 100%; font-size: 12px; }
    .csv-preview th, .csv-preview td { padding: 6px 10px; border-bottom: 1px solid #f1f5f9; text-align: left; }
    .csv-preview th { background: #f8fafc; color: #64748b; font-weight: 600; }
    .csv-map {
      margin-top: 16px; display: grid; gap: 10px;
    }
    .csv-map-row {
      display: grid; grid-template-columns: 1fr auto 1fr;
      gap: 8px; align-items: center;
    }
    .csv-map-row .arrow { color: #94a3b8; font-size: 12px; }
    .csv-foot {
      padding: 12px 24px 18px; border-top: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }
    .csv-progress { font-size: 13px; color: #64748b; }
    .csv-progress b { color: #0d9488; }

    /* ============================================================
       FEATURE E — SALES FORECAST DASHBOARD
       New page accessible from header. CSS-based bar charts
       (no chart library). Pipeline value, weighted forecast,
       win rate, deals by stage, deals by owner.
       ============================================================ */
    .forecast-stats {
      display: grid; grid-template-columns: repeat(4, 1fr);
      gap: 12px; margin: 0 0 20px;
    }
    @media (max-width: 880px) { .forecast-stats { grid-template-columns: repeat(2, 1fr); } }
    .forecast-stat {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 16px 18px;
    }
    .forecast-stat.accent {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
      color: #fff; border-color: #0d9488;
    }
    .forecast-stat.accent .label, .forecast-stat.accent .sub { color: #ccfbf1; }
    .forecast-stat .label {
      font-size: 11px; font-weight: 700; letter-spacing: 0.05em;
      text-transform: uppercase; color: #64748b; margin-bottom: 6px;
    }
    .forecast-stat .value {
      font-size: 24px; font-weight: 800; color: #0f172a;
      letter-spacing: -0.02em; line-height: 1.1;
    }
    .forecast-stat.accent .value { color: #fff; }
    .forecast-stat .sub { font-size: 12px; color: #64748b; margin-top: 4px; }

    .forecast-charts {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    }
    @media (max-width: 880px) { .forecast-charts { grid-template-columns: 1fr; } }
    .forecast-chart {
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 14px; padding: 18px;
    }
    .forecast-chart h2 {
      margin: 0 0 14px; font-size: 14px; font-weight: 700;
      color: #475569; text-transform: uppercase; letter-spacing: 0.05em;
    }
    .forecast-bar-row {
      display: grid; grid-template-columns: 110px 1fr 70px;
      gap: 10px; align-items: center; margin: 8px 0; font-size: 13px;
    }
    .forecast-bar-row .bar-label { color: #475569; font-weight: 600; }
    .forecast-bar-row .bar-track {
      height: 18px; background: #f1f5f9; border-radius: 4px; overflow: hidden;
    }
    .forecast-bar-row .bar-fill {
      height: 100%; background: linear-gradient(90deg, #14b8a6, #0d9488);
      border-radius: 4px; transition: width 0.4s ease;
    }
    .forecast-bar-row .bar-fill.warn { background: linear-gradient(90deg, #f59e0b, #b45309); }
    .forecast-bar-row .bar-fill.danger { background: linear-gradient(90deg, #ef4444, #b91c1c); }
    .forecast-bar-row .bar-value { color: #0f172a; font-weight: 700; text-align: right; }

    /* ============================================================
       FEATURE G — INLINE EDITING (contenteditable on deal name)
       Click deal name → becomes editable. Enter/blur saves via
       PATCH /crm/api/deals/:id. Esc cancels.
       ============================================================ */
    .deal-name[contenteditable="true"] {
      outline: 2px solid #14b8a6; outline-offset: 2px;
      border-radius: 4px; padding: 0 2px; cursor: text;
    }
    .deal-name[contenteditable="true"]:focus { background: #f0fdfa; }
    .deal-name.saving { opacity: 0.5; }
    .deal-name.saved { background: #dcfce7; transition: background 0.5s; }

    /* Theme toggle button (header) */
    .theme-toggle {
      background: transparent; border: 0; cursor: pointer;
      padding: 6px; border-radius: 8px; color: inherit;
      display: grid; place-items: center;
    }
    .theme-toggle:hover { background: rgba(255,255,255,0.1); }
    .theme-toggle svg { width: 18px; height: 18px; }

    /* ============================================================
       VISUAL POLISH — HubSpot-inspired redesign
       Addresses user feedback:
       - Background too white/bright → softer off-white
       - Top bar icons too bold → thinner strokes, smaller
       - Empty space unused → fill with subtle gradient/depth
       - Typography too bold → reduce to 600 max
       - Edges/curves → consistent 14px radius, softer shadows
       - Beautiful environment → layered depth, breathing room
       ============================================================ */

    /* Softer global background — warm off-white instead of pure white */
    body { background: #faf9f7 !important; color: #1e293b; }
    [data-theme="dark"] body { background: #0b1220 !important; color: #e2e8f0; }

    /* Reduce typography bold globally — was 700-800, now 600 max */
    h1, h2, h3, b, strong { font-weight: 600 !important; letter-spacing: -0.015em; }
    .deal-name, .contact-name, .deal-amount, .today-stat b, .forecast-stat .value {
      font-weight: 600 !important;
    }
    .deal-amount { letter-spacing: -0.025em; }

    /* Top bar — HubSpot-inspired: white/translucent, breathing room */
    header {
      background: rgba(255, 255, 255, 0.85) !important;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid #e8e6e1 !important;
      height: 56px !important;
      padding: 0 20px !important;
      color: #475569 !important;
    }
    [data-theme="dark"] header {
      background: rgba(15, 23, 42, 0.85) !important;
      border-bottom-color: #1e293b !important;
      color: #cbd5e1 !important;
    }
    header .search input {
      background: #f1f0ec !important;
      border: 1px solid transparent !important;
      color: #475569 !important;
      border-radius: 999px !important;
      padding: 8px 16px !important;
      width: 280px;
      height: 36px !important;
      transition: all 0.15s;
    }
    header .search input:focus,
    header .search input:hover {
      background: #fff !important;
      border-color: #d4d1c8 !important;
      outline: none;
    }
    [data-theme="dark"] header .search input { background: #1e293b !important; color: #e2e8f0 !important; }
    [data-theme="dark"] header .search input:focus { background: #0f172a !important; border-color: #334155 !important; }

    /* Top bar icons — smaller, thinner strokes, more spacing, hover states */
    header .tools {
      gap: 2px !important;
      align-items: center;
    }
    header .iconbtn {
      width: 36px !important;
      height: 36px !important;
      border-radius: 10px !important;
      padding: 0 !important;
      display: inline-grid !important;
      place-items: center;
      background: transparent !important;
      color: #64748b !important;
      border: 0 !important;
      cursor: pointer;
      transition: background 0.12s, color 0.12s;
    }
    header .iconbtn:hover {
      background: #f1f0ec !important;
      color: #0f172a !important;
    }
    header .iconbtn.on,
    header .iconbtn[aria-expanded="true"] {
      background: #e8e6e1 !important;
      color: #0f172a !important;
    }
    [data-theme="dark"] header .iconbtn { color: #94a3b8 !important; }
    [data-theme="dark"] header .iconbtn:hover { background: #1e293b !important; color: #f8fafc !important; }
    header .iconbtn svg {
      width: 16px !important;
      height: 16px !important;
      stroke-width: 1.5 !important;
    }
    /* Account pill — more polished */
    header .acct {
      background: #f1f0ec !important;
      border: 0 !important;
      border-radius: 999px !important;
      padding: 4px 12px 4px 4px !important;
      height: 36px !important;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #475569 !important;
      cursor: pointer;
      transition: background 0.12s;
    }
    header .acct:hover { background: #e8e6e1 !important; }
    header .acct .av {
      width: 28px !important;
      height: 28px !important;
      border-radius: 50% !important;
      background: linear-gradient(135deg, #14b8a6, #0d9488) !important;
      color: #fff !important;
      font-weight: 700 !important;
      display: grid; place-items: center;
      font-size: 11px !important;
    }
    [data-theme="dark"] header .acct { background: #1e293b !important; color: #cbd5e1 !important; }

    /* Sidebar — softer, cleaner, more breathing room */
    aside {
      background: #fff !important;
      border-right: 1px solid #e8e6e1 !important;
      padding: 12px 8px !important;
      color: #475569 !important;
    }
    [data-theme="dark"] aside {
      background: #0f172a !important;
      border-right-color: #1e293b !important;
      color: #94a3b8 !important;
    }
    aside button {
      border-radius: 8px !important;
      padding: 8px 12px !important;
      margin-bottom: 1px !important;
      font-weight: 500 !important;
      color: #475569 !important;
      background: transparent !important;
      font-size: 13px !important;
      transition: background 0.12s, color 0.12s;
    }
    aside button:hover { background: #f1f0ec !important; color: #0f172a !important; }
    aside button.on {
      background: #f1f0ec !important;
      color: #0f172a !important;
      font-weight: 600 !important;
    }
    [data-theme="dark"] aside button { color: #94a3b8 !important; }
    [data-theme="dark"] aside button:hover { background: #1e293b !important; color: #f8fafc !important; }
    [data-theme="dark"] aside button.on { background: #1e293b !important; color: #f8fafc !important; }
    aside .mark {
      font-weight: 700 !important;
      letter-spacing: -0.01em;
      color: #0f172a !important;
    }
    [data-theme="dark"] aside .mark { color: #f8fafc !important; }

    /* Main work area — softer padding, breathing room */
    main { padding: 24px !important; background: #faf9f7; }
    [data-theme="dark"] main { background: #0b1220; }
    .work { background: #faf9f7; }
    [data-theme="dark"] .work { background: #0b1220; }

    /* Cards — softer shadows, consistent 14px radius, less stark white */
    .card, .actcard, .dealcard, .contact-card, .glance, .report, .timeline, .sheet, .leadcard, .forecast-chart {
      background: #fff !important;
      border: 1px solid #e8e6e1 !important;
      border-radius: 14px !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03), 0 1px 3px rgba(15, 23, 42, 0.02) !important;
    }
    [data-theme="dark"] .card, [data-theme="dark"] .actcard, [data-theme="dark"] .dealcard,
    [data-theme="dark"] .contact-card, [data-theme="dark"] .glance, [data-theme="dark"] .report,
    [data-theme="dark"] .timeline, [data-theme="dark"] .sheet, [data-theme="dark"] .leadcard,
    [data-theme="dark"] .forecast-chart {
      background: #1e293b !important;
      border-color: #334155 !important;
    }
    /* Today stat tiles — softer */
    .today-stat {
      background: linear-gradient(135deg, #fff 0%, #faf9f7 100%) !important;
      border: 1px solid #e8e6e1 !important;
      border-radius: 12px !important;
    }
    .today-stat b { color: #0f172a !important; }
    .today-stat span { color: #64748b !important; font-weight: 600 !important; }
    [data-theme="dark"] .today-stat {
      background: linear-gradient(135deg, #1e293b 0%, #182234 100%) !important;
      border-color: #334155 !important;
    }
    [data-theme="dark"] .today-stat b { color: #f8fafc !important; }

    /* Login/setup page — softer gradient instead of stark white */
    .gate, .setup {
      background: linear-gradient(135deg, #f5f4f0 0%, #e8e6e1 100%) !important;
    }
    [data-theme="dark"] .gate, [data-theme="dark"] .setup {
      background: linear-gradient(135deg, #0b1220 0%, #1e293b 100%) !important;
    }
    /* The setup wizard's dark card — softer shadow, less stark */
    .setup .panel {
      background: #fff !important;
      color: #1e293b !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.04) !important;
      border: 1px solid #e8e6e1 !important;
    }
    .setup .panel .card,
    .setup .panel > div {
      color: #1e293b;
    }

    /* Forecast stat tiles — softer, more refined */
    .forecast-stat {
      background: linear-gradient(135deg, #fff 0%, #faf9f7 100%) !important;
      border: 1px solid #e8e6e1 !important;
      border-radius: 14px !important;
    }
    .forecast-stat.accent {
      background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%) !important;
      border-color: #0d9488 !important;
      box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2) !important;
    }

    /* Better bar charts in analytics — rounded, gradients, hover */
    .forecast-bar-row .bar-track {
      height: 22px !important;
      background: #f1f0ec !important;
      border-radius: 6px !important;
    }
    [data-theme="dark"] .forecast-bar-row .bar-track { background: #182234 !important; }
    .forecast-bar-row .bar-fill {
      border-radius: 6px !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08);
    }
    .forecast-bar-row { font-size: 13px !important; }
    .forecast-bar-row .bar-label { color: #475569 !important; font-weight: 500 !important; }
    .forecast-bar-row .bar-value { color: #0f172a !important; font-weight: 600 !important; }
    [data-theme="dark"] .forecast-bar-row .bar-label { color: #94a3b8 !important; }
    [data-theme="dark"] .forecast-bar-row .bar-value { color: #f8fafc !important; }

    /* Buttons — softer, more refined */
    button:not(.iconbtn):not(.theme-toggle) {
      border-radius: 10px !important;
      font-weight: 600 !important;
      transition: all 0.12s;
    }
    button:not(.iconbtn):not(.theme-toggle):not(.ghost):not(.mini):not(.action-btn):not(.addslot) {
      background: linear-gradient(135deg, #0d9488, #0f766e) !important;
      color: #fff !important;
      box-shadow: 0 1px 2px rgba(13, 148, 136, 0.2);
    }
    button.ghost {
      background: transparent !important;
      color: #475569 !important;
      border: 1px solid #e8e6e1 !important;
    }
    button.ghost:hover { background: #f1f0ec !important; color: #0f172a !important; }
    [data-theme="dark"] button.ghost { color: #94a3b8 !important; border-color: #334155 !important; }
    [data-theme="dark"] button.ghost:hover { background: #1e293b !important; color: #f8fafc !important; }

    /* Inputs — softer, more refined */
    input, select, textarea {
      border-radius: 10px !important;
      border-color: #d4d1c8 !important;
      background: #fff !important;
      color: #1e293b !important;
      transition: border-color 0.12s, box-shadow 0.12s;
    }
    input:focus, select:focus, textarea:focus {
      outline: none !important;
      border-color: #14b8a6 !important;
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1) !important;
    }
    [data-theme="dark"] input, [data-theme="dark"] select, [data-theme="dark"] textarea {
      background: #1e293b !important;
      color: #f8fafc !important;
      border-color: #334155 !important;
    }

    /* Tabs — softer pills */
    .tabs button {
      border-radius: 999px !important;
      padding: 6px 14px !important;
      font-weight: 500 !important;
      color: #64748b !important;
      background: transparent !important;
      border: 0 !important;
    }
    .tabs button.on {
      background: #1e293b !important;
      color: #fff !important;
    }
    [data-theme="dark"] .tabs button { color: #94a3b8 !important; }
    [data-theme="dark"] .tabs button.on { background: #475569 !important; color: #f8fafc !important; }

    /* Filter bar — softer selects */
    .filters select, .filters input {
      border-radius: 8px !important;
      background: #fff !important;
      border: 1px solid #e8e6e1 !important;
      padding: 6px 10px !important;
      font-size: 13px !important;
    }
    [data-theme="dark"] .filters select, [data-theme="dark"] .filters input {
      background: #1e293b !important;
      border-color: #334155 !important;
    }

    /* Health badges, chips — softer */
    .dealcard .chip, .dealcard .health-badge, .contact-card .status-chip {
      border-radius: 999px !important;
      font-weight: 600 !important;
    }

    /* Board heads — better spacing */
    .board-head {
      margin-bottom: 16px !important;
      align-items: center;
    }
    .board-head h1 {
      font-size: 24px !important;
      letter-spacing: -0.02em !important;
      margin: 0 !important;
      color: #0f172a !important;
    }
    [data-theme="dark"] .board-head h1 { color: #f8fafc !important; }

    /* Sheet heads — softer */
    .sheethead {
      border-bottom: 1px solid #e8e6e1 !important;
      padding: 14px 18px !important;
    }

    /* Empty states — softer, more visual */
    .empty, .empty-col, .contact-empty {
      color: #94a3b8 !important;
    }
    .empty .empty-ico, .empty-col .empty-ico, .contact-empty .empty-ico {
      opacity: 0.4 !important;
    }

    /* Pulse (the dark KPI cards) — softer */
    .pulse article {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
      border-radius: 14px !important;
      border: 1px solid #334155 !important;
    }
    .pulse b { color: #f8fafc !important; }
    .pulse span { color: #94a3b8 !important; }

    /* Toast notification — softer */
    .toast {
      border-radius: 10px !important;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12) !important;
    }

    /* Floating Ask button — softer shadow, more refined */
    .helper .ask {
      box-shadow: 0 8px 20px rgba(13, 148, 136, 0.3) !important;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .helper .ask:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 12px 28px rgba(13, 148, 136, 0.4) !important;
    }

    /* ============================================================
       PERFORMANCE + UX ENHANCEMENTS
       - Top loading bar (YouTube-style) on navigation
       - Faster transitions (0.08s vs 0.12s) for snappier feel
       - Active press states (scale 0.97) on buttons
       - Ripple effect on primary buttons
       - Cursor feedback on all clickable elements
       - Prefetch hover state on nav items
       ============================================================ */

    /* Top loading bar — fixed at top of viewport */
    .nav-progress {
      position: fixed; top: 0; left: 0; height: 3px; width: 0;
      background: linear-gradient(90deg, #14b8a6, #0d9488);
      z-index: 9999; opacity: 0;
      transition: width 0.3s ease, opacity 0.2s ease;
      box-shadow: 0 0 8px rgba(20, 184, 166, 0.4);
      pointer-events: none;
    }
    .nav-progress.loading { opacity: 1; width: 30%; }
    .nav-progress.loading-70 { width: 70%; }
    .nav-progress.done { width: 100%; opacity: 0; transition: width 0.15s ease, opacity 0.4s ease 0.1s; }

    /* Faster transitions globally — 0.12s → 0.08s for snappier feel */
    button, .iconbtn, .tabs button, .filters select, .filters input,
    .dealcard, .contact-card, .today-stat, .forecast-stat,
    aside button, header .iconbtn, header .acct {
      transition-duration: 0.08s !important;
    }

    /* Active press states — scale 0.97 on :active */
    button:not(.iconbtn):not(.theme-toggle):active,
    .iconbtn:active, .tabs button:active, aside button:active,
    header .acct:active, .dealcard:active, .contact-card:active {
      transform: scale(0.97) !important;
    }

    /* Cursor feedback */
    button, .iconbtn, .tabs button, aside button, .dealcard, .contact-card,
    .cmdk-item, .wizard-choice, .action-btn, .addslot, [onclick], a.linkish {
      cursor: pointer !important;
    }
    input, select, textarea { cursor: text; }
    input[type="checkbox"], input[type="radio"], select { cursor: pointer; }
    .dealcard[draggable="true"] { cursor: grab; }
    .dealcard[draggable="true"]:active { cursor: grabbing; }
    .deal-name[contenteditable="true"] { cursor: text !important; }

    /* Ripple effect — Material-style */
    .ripple-container { position: relative; overflow: hidden; }
    .ripple {
      position: absolute; border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      animation: ripple-effect 0.5s ease-out;
      pointer-events: none;
    }
    @keyframes ripple-effect {
      to { transform: scale(4); opacity: 0; }
    }

    /* Sidebar section headers (grouping) */
    .nav-section-header {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #94a3b8;
      padding: 14px 12px 4px; margin-top: 4px;
    }
    .nav-section-header:first-child { margin-top: 0; }
    [data-theme="dark"] .nav-section-header { color: #64748b; }

    /* Breadcrumb bar */
    .breadcrumb {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: #94a3b8;
      margin-bottom: 8px;
    }
    .breadcrumb a {
      color: #475569; text-decoration: none;
      padding: 2px 4px; border-radius: 4px;
      transition: background 0.08s, color 0.08s;
    }
    .breadcrumb a:hover { background: #f1f0ec; color: #0f172a; }
    [data-theme="dark"] .breadcrumb a { color: #94a3b8; }
    [data-theme="dark"] .breadcrumb a:hover { background: #1e293b; color: #f8fafc; }
    .breadcrumb .sep { color: #cbd5e1; font-size: 10px; }
    .breadcrumb .current {
      color: #0f172a; font-weight: 600;
      padding: 2px 4px;
    }
    [data-theme="dark"] .breadcrumb .current { color: #f8fafc; }

    /* "You are here" indicator on sidebar active item */
    aside button.on {
      position: relative;
    }
    aside button.on::before {
      content: ""; position: absolute; left: 0; top: 8px; bottom: 8px;
      width: 3px; border-radius: 0 3px 3px 0;
      background: linear-gradient(180deg, #14b8a6, #0d9488);
    }
    [data-theme="dark"] aside button.on::before { background: linear-gradient(180deg, #14b8a6, #0d9488); }

    /* Tooltip on hover for icon-only buttons (CSS-only via title attr enhancement) */
    [data-tooltip] { position: relative; }
    [data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute; top: calc(100% + 6px); left: 50%;
      transform: translateX(-50%);
      background: #1e293b; color: #fff;
      padding: 4px 8px; border-radius: 6px;
      font-size: 11px; font-weight: 500; white-space: nowrap;
      z-index: 100; pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    [data-theme="dark"] [data-tooltip]:hover::after { background: #475569; }

    /* Skeleton loader for cards while loading */
    .skeleton {
      background: linear-gradient(90deg, #f1f0ec 0%, #faf9f7 50%, #f1f0ec 100%);
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s infinite;
      border-radius: 8px;
      height: 14px; width: 100%;
    }
    @keyframes skeleton-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    [data-theme="dark"] .skeleton {
      background: linear-gradient(90deg, #182234 0%, #1e293b 50%, #182234 100%);
      background-size: 200% 100%;
    }

    /* Keyboard shortcut hint badge */
    kbd.shortcut {
      background: #f1f0ec; color: #475569;
      padding: 2px 6px; border-radius: 4px;
      font-size: 10px; font-family: ui-monospace, monospace;
      font-weight: 600; border: 1px solid #e8e6e1;
      box-shadow: 0 1px 0 #e8e6e1;
    }
    [data-theme="dark"] kbd.shortcut {
      background: #1e293b; color: #cbd5e1; border-color: #334155;
      box-shadow: 0 1px 0 #0b1220;
    }

    /* Prefetch hint on hover for nav items */
    aside button[data-prefetch] { position: relative; }
    aside button[data-prefetch]:hover::after {
      content: ""; position: absolute; right: 8px; top: 50%;
      width: 4px; height: 4px; border-radius: 50%;
      background: #14b8a6; transform: translateY(-50%);
      animation: pulse-dot 1s ease-in-out infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 0.3; transform: translateY(-50%) scale(0.8); }
      50% { opacity: 1; transform: translateY(-50%) scale(1); }
    }

    /* Help overlay for keyboard shortcuts */
    .shortcuts-overlay {
      position: fixed; inset: 0; z-index: 96;
      background: rgba(2, 6, 23, 0.7);
      backdrop-filter: blur(6px);
      display: grid; place-items: center;
      padding: 16px;
      animation: cmdk-fade 0.15s ease-out;
    }
    .shortcuts-card {
      background: #fff; border-radius: 16px;
      width: min(520px, 100%);
      box-shadow: 0 30px 80px rgba(0,0,0,0.4);
      overflow: hidden;
    }
    [data-theme="dark"] .shortcuts-card { background: #1e293b; color: #f8fafc; }
    .shortcuts-head {
      padding: 18px 22px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    }
    [data-theme="dark"] .shortcuts-head { border-bottom-color: #334155; }
    .shortcuts-head h2 { margin: 0; font-size: 17px; font-weight: 600; color: #0f172a; }
    [data-theme="dark"] .shortcuts-head h2 { color: #f8fafc; }
    .shortcuts-body { padding: 12px 22px 18px; }
    .shortcut-row {
      display: flex; justify-content: space-between;
      align-items: center; padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    [data-theme="dark"] .shortcut-row { border-bottom-color: #334155; }
    .shortcut-row:last-child { border-bottom: 0; }
    .shortcut-row .label { color: #475569; font-size: 13px; }
    [data-theme="dark"] .shortcut-row .label { color: #cbd5e1; }
    .shortcut-row .keys { display: flex; gap: 4px; align-items: center; }

    /* ============================================================
       FEATURE A — DRAG-AND-DROP for deal cards (HTML5 DnD)
       Cards become draggable, columns become drop targets with
       visual highlight on dragover. On drop, calls the existing
       move(dealId, stageId) handler to advance the deal.
       ============================================================ */
    .dealcard.dragging {
      opacity: 0.4; transform: rotate(2deg) scale(0.98);
    }
    .dealcard[draggable="true"] { cursor: grab; }
    .dealcard[draggable="true"]:active { cursor: grabbing; }
    .dealboard .col.drop-target {
      background: linear-gradient(180deg,
        color-mix(in srgb, var(--stage-color, #14b8a6) 25%, #ffffff) 0%,
        color-mix(in srgb, var(--stage-color, #14b8a6) 12%, #f8fafc) 100%) !important;
      border: 2px dashed var(--stage-color, #14b8a6) !important;
      border-top-width: 4px !important;
    }

    /* ============================================================
       FEATURE B — COMMAND PALETTE (⌘K)
       Attio-inspired global search. Press ⌘K (Mac) or Ctrl+K
       (Windows/Linux) anywhere in the CRM to open. Searches
       deals, contacts, companies, leads via the existing
       /crm/api/search endpoint.
       ============================================================ */
    .cmdk-overlay {
      position: fixed; inset: 0; z-index: 95;
      background: rgba(2, 6, 23, 0.65);
      backdrop-filter: blur(6px);
      display: grid; align-items: start; justify-items: center;
      padding: 12vh 16px 16px;
      animation: cmdk-fade 0.15s ease-out;
    }
    @keyframes cmdk-fade { from { opacity: 0; } to { opacity: 1; } }
    .cmdk-card {
      background: #fff; border-radius: 16px;
      width: min(640px, 100%); max-height: 70vh;
      display: flex; flex-direction: column;
      box-shadow: 0 30px 80px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.15);
      overflow: hidden;
      animation: cmdk-pop 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    @keyframes cmdk-pop { from { transform: translateY(-12px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
    .cmdk-input {
      width: 100%; padding: 18px 22px;
      border: 0; font-size: 17px; outline: none;
      border-bottom: 1px solid #f1f5f9;
      background: transparent; color: #0f172a;
    }
    .cmdk-input::placeholder { color: #94a3b8; }
    .cmdk-results { overflow: auto; flex: 1; padding: 8px; }
    .cmdk-section {
      font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
      color: #94a3b8; text-transform: uppercase;
      padding: 12px 14px 6px;
    }
    .cmdk-result {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px; border-radius: 10px;
      cursor: pointer; color: #0f172a;
      transition: background 0.1s;
    }
    .cmdk-result:hover, .cmdk-result.on {
      background: #f1f5f9;
    }
    .cmdk-result .cmdk-ico {
      width: 28px; height: 28px; border-radius: 8px;
      display: grid; place-items: center; flex-shrink: 0;
      font-size: 13px;
    }
    .cmdk-result .cmdk-ico.deal { background: #ccfbf1; color: #0f766e; }
    .cmdk-result .cmdk-ico.contact { background: #dbeafe; color: #1d4ed8; }
    .cmdk-result .cmdk-ico.company { background: #fef3c7; color: #92400e; }
    .cmdk-result .cmdk-ico.lead { background: #fce7f3; color: #be185d; }
    .cmdk-result .cmdk-meta { flex: 1; min-width: 0; }
    .cmdk-result .cmdk-title { font-size: 14px; font-weight: 600; line-height: 1.3; }
    .cmdk-result .cmdk-sub { font-size: 12px; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cmdk-result .cmdk-kind { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .cmdk-empty { padding: 32px 16px; text-align: center; color: #94a3b8; font-size: 13px; }
    .cmdk-foot {
      padding: 10px 18px; border-top: 1px solid #f1f5f9;
      font-size: 11px; color: #94a3b8; display: flex; gap: 16px;
    }
    .cmdk-foot kbd {
      background: #f1f5f9; padding: 1px 5px; border-radius: 3px;
      font-family: ui-monospace, monospace; font-size: 10px; color: #475569;
    }

    /* ============================================================
       FEATURE C — DARK MODE
       Attio-inspired dark theme. Toggled via the new moon icon
       button in the header. Persisted in localStorage('afri.theme').
       Uses CSS variables on [data-theme="dark"].
       ============================================================ */
    html[data-theme="dark"] body { background: #0e1520; color: #e2e8f0; }
    html[data-theme="dark"] .work { background: #0e1520; }
    html[data-theme="dark"] header { background: #0b1220; border-bottom: 1px solid #1e293b; }
    html[data-theme="dark"] header input { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    html[data-theme="dark"] aside { background: #0b1220; border-right: 1px solid #1e293b; }
    html[data-theme="dark"] aside button { color: #cbd5e1; }
    html[data-theme="dark"] aside button.on { background: #1e293b; color: #5eead4; }
    html[data-theme="dark"] main { color: #e2e8f0; }
    html[data-theme="dark"] h1, html[data-theme="dark"] h2, html[data-theme="dark"] b { color: #f8fafc; }
    html[data-theme="dark"] .hello, html[data-theme="dark"] .meta, html[data-theme="dark"] .muted { color: #94a3b8; }
    html[data-theme="dark"] .card,
    html[data-theme="dark"] .sheet,
    html[data-theme="dark"] .glance,
    html[data-theme="dark"] .actcard,
    html[data-theme="dark"] .timeline,
    html[data-theme="dark"] .report,
    html[data-theme="dark"] .dealcard,
    html[data-theme="dark"] .leadcard,
    html[data-theme="dark"] .contact-card {
      background: #1e293b !important; border-color: #334155 !important; color: #e2e8f0;
    }
    html[data-theme="dark"] .dealcard b, html[data-theme="dark"] .deal-name,
    html[data-theme="dark"] .contact-name { color: #f8fafc !important; }
    html[data-theme="dark"] .deal-amount { color: #5eead4 !important; }
    html[data-theme="dark"] .today-stat {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%) !important;
      border-color: #334155 !important;
    }
    html[data-theme="dark"] .today-stat b { color: #f8fafc; }
    html[data-theme="dark"] .today-stat span { color: #94a3b8; }
    html[data-theme="dark"] .col-total { color: #f8fafc; border-color: #334155 !important; }
    html[data-theme="dark"] .col-total .muted { color: #94a3b8; }
    html[data-theme="dark"] input, html[data-theme="dark"] select, html[data-theme="dark"] textarea {
      background: #0f172a; border-color: #334155; color: #e2e8f0;
    }
    html[data-theme="dark"] input:focus { border-color: #14b8a6; background: #0b1220; }
    html[data-theme="dark"] th { color: #94a3b8; }
    html[data-theme="dark"] td { border-color: #1e293b !important; }
    html[data-theme="dark"] .pulse article { background: #0b1220; color: #cbd5e1; }
    html[data-theme="dark"] .pulse b { color: #f8fafc; }
    html[data-theme="dark"] .iconbtn { color: #94a3b8; }
    html[data-theme="dark"] .iconbtn:hover { color: #5eead4; background: #1e293b; }
    html[data-theme="dark"] .ghost { background: #1e293b !important; color: #cbd5e1 !important; border-color: #334155 !important; }
    html[data-theme="dark"] .toast { background: #1e293b; color: #f8fafc; border-color: #334155; }
    html[data-theme="dark"] .empty p, html[data-theme="dark"] .empty-col p { color: #64748b; }
    html[data-theme="dark"] .coach { background: #1e293b; color: #cbd5e1; }

    /* Dark mode toggle button — same icon style as other header buttons */
    .theme-toggle { display: inline-flex; align-items: center; justify-content: center; }

    /* ============================================================
       FEATURE D — COMPANIES CARD GRID
       Reuses .contact-grid + .contact-card styles. Adds a few
       company-specific elements: industry chip, type chip,
       deals/people counts.
       ============================================================ */
    .company-card .company-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .company-card .company-avatar {
      width: 44px; height: 44px; border-radius: 12px;
      display: grid; place-items: center;
      font-size: 16px; font-weight: 800; color: #fff;
      background: var(--avatar-bg, linear-gradient(135deg, #cbd5e1, #94a3b8));
      flex-shrink: 0;
    }
    .company-card .company-name { font-size: 15px; font-weight: 700; color: #0f172a; }
    .company-card .company-industry { font-size: 12px; color: #64748b; }
    .company-card .company-meta-row { display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px solid #f1f5f9; font-size: 12px; color: #64748b; }
    .company-card .company-meta-row b { color: #0f172a; font-size: 14px; }

    /* ============================================================
       FEATURE E — FORECAST DASHBOARD
       New screen accessible from the sidebar nav. Shows:
       - 4 KPI tiles (pipeline, won this month, lost this month, conversion rate)
       - Stage distribution bar chart (pure CSS)
       - Top 5 deals by value
       ============================================================ */
    .forecast-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
    .forecast-stat {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 16px 18px;
    }
    .forecast-stat.won { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #6ee7b7; }
    .forecast-stat.lost { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #fca5a5; }
    .forecast-stat.rate { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-color: #5eead4; }
    .forecast-stat b { display: block; font-size: 26px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 2px; }
    .forecast-stat.won b { color: #166534; }
    .forecast-stat.lost b { color: #991b1b; }
    .forecast-stat.rate b { color: #0d9488; }
    .forecast-stat span { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .forecast-stat small { display: block; font-size: 11px; color: #94a3b8; margin-top: 4px; }
    @media (max-width: 880px) { .forecast-stats { grid-template-columns: repeat(2, 1fr); } }

    .forecast-chart { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 16px; }
    .forecast-chart h2 { margin: 0 0 16px; font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
    .forecast-bar-row { display: grid; grid-template-columns: 140px 1fr 80px 80px; gap: 10px; align-items: center; padding: 8px 0; }
    .forecast-bar-row .stage-name { font-size: 13px; font-weight: 600; color: #0f172a; }
    .forecast-bar-track { background: #f1f5f9; border-radius: 99px; height: 22px; overflow: hidden; position: relative; }
    .forecast-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; display: flex; align-items: center; padding-left: 10px; color: #fff; font-size: 11px; font-weight: 700; }
    .forecast-bar-row .stage-count { font-size: 12px; color: #64748b; text-align: right; }
    .forecast-bar-row .stage-value { font-size: 13px; font-weight: 700; color: #0f766e; text-align: right; }

    .forecast-top { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px; }
    .forecast-top h2 { margin: 0 0 12px; font-size: 14px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
    .forecast-top-row { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; cursor: pointer; }
    .forecast-top-row:hover { background: #f8fafc; }
    .forecast-top-row:last-child { border-bottom: 0; }
    .forecast-top-row b { color: #0f172a; font-size: 14px; }
    .forecast-top-row .stage-pill { font-size: 11px; padding: 2px 8px; border-radius: 99px; color: #fff; }
    .forecast-top-row .amount { font-size: 14px; font-weight: 700; color: #0f766e; }

    /* ============================================================
       FEATURE F — CSV IMPORT MODAL
       Drag-and-drop CSV file picker + preview + bulk import.
       Uses FileReader API + simple CSV parser on the client.
       POSTs parsed rows to /crm/api/import/contacts.
       ============================================================ */
    .import-overlay { position: fixed; inset: 0; z-index: 95; background: rgba(2, 6, 23, 0.65); backdrop-filter: blur(4px); display: grid; place-items: center; padding: 16px; }
    .import-card { background: #fff; border-radius: 16px; width: min(560px, 100%); max-height: 90vh; overflow: auto; box-shadow: 0 30px 80px rgba(0,0,0,0.35); }
    .import-head { padding: 18px 22px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
    .import-head h2 { margin: 0; font-size: 17px; font-weight: 700; color: #0f172a; }
    .import-body { padding: 18px 22px; }
    .import-drop {
      border: 2px dashed #cbd5e1; border-radius: 14px;
      padding: 32px 16px; text-align: center;
      color: #64748b; font-size: 14px;
      cursor: pointer; transition: border-color 0.15s, background 0.15s;
    }
    .import-drop:hover, .import-drop.dragover { border-color: #14b8a6; background: #f0fdfa; color: #0d9488; }
    .import-drop .ico { font-size: 28px; margin-bottom: 8px; opacity: 0.7; }
    .import-drop input[type="file"] { display: none; }
    .import-preview {
      margin-top: 14px; max-height: 240px; overflow: auto;
      border: 1px solid #e2e8f0; border-radius: 10px;
    }
    .import-preview table { width: 100%; font-size: 12px; }
    .import-preview th { background: #f8fafc; padding: 8px; text-align: left; color: #64748b; font-size: 11px; text-transform: uppercase; }
    .import-preview td { padding: 8px; border-top: 1px solid #f1f5f9; }
    .import-foot { padding: 14px 22px; border-top: 1px solid #f1f5f9; display: flex; gap: 8px; justify-content: flex-end; }
    .import-status { font-size: 13px; color: #64748b; padding: 8px 0; }
    .import-status.ok { color: #166534; }
    .import-status.err { color: #991b1b; }

    /* ============================================================
       FEATURE G — INLINE EDITING
       Click on a deal name or contact name to edit inline.
       Replaces the text node with an input, on blur or Enter
       saves via PATCH /crm/api/{type}/:id with the new value.
       Escape cancels.
       ============================================================ */
    .inline-edit-input {
      width: 100%; padding: 4px 8px;
      border: 1.5px solid #14b8a6; border-radius: 6px;
      background: #fff; color: #0f172a;
      font: inherit; font-size: inherit; font-weight: inherit;
      outline: none; box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.12);
    }
    .deal-name[contenteditable="true"]:hover,
    .contact-name[contenteditable="true"]:hover {
      cursor: text; outline: 1px dashed #14b8a6; outline-offset: 2px; border-radius: 4px;
    }

    .leadhead { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
    .leadhead h1 { font-size: 28px; margin: 0; }
    .leadtools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
    .leadboard { display: flex; gap: 12px; overflow: auto; padding-bottom: 8px; align-items: flex-start; }
    .leadcol { min-width: 270px; flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 12px; }
    .leadcol header { background: transparent; border: 0; height: auto; padding: 0 0 8px; display: flex; justify-content: space-between; align-items: center; color: #0f172a; }
    .leadcol header b { font-size: 15px; }
    .sumline { height: 4px; border-radius: 99px; background: #e2e8f0; margin: 0 0 10px; overflow: hidden; }
    .sumline i { display: block; height: 100%; background: #16a34a; }
    .leadcard { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px; margin-bottom: 10px; cursor: grab; box-shadow: 0 1px 2px rgba(15,23,42,.04); }
    .leadcard.on { outline: 2px solid #99f6e4; }
    .who { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
    .who .av { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 800; color: #0f172a; }
    .pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .pills span { font-size: 11px; font-weight: 700; background: #f1f5f9; color: #334155; border-radius: 999px; padding: 3px 8px; }
    .pills span.hot { background: #ffedd5; color: #9a3412; }
    .pills span.ok { background: #dcfce7; color: #166534; }
    .dropwell { border: 1px dashed #cbd5e1; border-radius: 14px; min-height: 92px; display: grid; place-items: center; color: #94a3b8; font-weight: 700; }
    .actdash { display: grid; grid-template-columns: 1.4fr .7fr; gap: 14px; }
    .actgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .actcard { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; }
    .actcard h2 { margin: 0 0 10px; font-size: 15px; display: flex; justify-content: space-between; }
    .rowline { display: flex; justify-content: space-between; gap: 8px; align-items: center; padding: 8px 0; border-top: 1px solid #f1f5f9; }
    .timeline { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; }
    .titem { border-left: 3px solid #99f6e4; padding: 8px 12px; margin: 8px 0; background: #f8fafc; border-radius: 0 12px 12px 0; }
    .matrix { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; }
    .matrix th, .matrix td { border-bottom: 1px solid #e2e8f0; padding: 10px 12px; font-size: 13px; text-align: center; }
    .matrix th:first-child, .matrix td:first-child { text-align: left; font-weight: 700; }
    .matrix input { width: auto; }
    .exec { display: grid; grid-template-columns: 1.3fr .7fr; gap: 12px; }
    .kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .kpi { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; }
    .kpi b { font-size: 28px; display: block; }
    .spark { display: flex; align-items: flex-end; gap: 3px; height: 36px; }
    .spark i { flex: 1; background: #86efac; border-radius: 3px 3px 0 0; display: block; }
    .hbar { display: grid; grid-template-columns: 90px 1fr 48px; gap: 8px; align-items: center; margin: 8px 0; font-size: 13px; }
    .hbar i { height: 10px; background: linear-gradient(90deg, #93c5fd, #2563eb); border-radius: 99px; display: block; }
    .inbox { display: grid; grid-template-columns: 220px 300px 1fr; min-height: 68vh; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
    .inbox nav, .inbox .list, .inbox .thread { min-height: 0; overflow: auto; }
    .inbox nav { background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 10px; }
    .inbox nav button, .inbox .list button { width: 100%; text-align: left; background: transparent; color: #0f172a; border-radius: 10px; }
    .inbox nav button.on, .inbox .list button.on { background: #e0f2fe; }
    .inbox .list { border-right: 1px solid #e2e8f0; }
    .inbox .thread { padding: 16px; }
    .bubble { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; margin: 8px 0; }
    .flow { min-height: 70vh; background: radial-gradient(#e2e8f0 1px, transparent 1px) 0 0 / 18px 18px; border-radius: 18px; padding: 28px; position: relative; }
    .node { width: min(420px, 100%); margin: 0 auto 28px; background: #fff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 14px 16px; box-shadow: 0 10px 30px rgba(15,23,42,.06); position: relative; }
    .node.trigger { outline: 2px solid #2563eb; }
    .node .tag { font-size: 12px; font-weight: 800; color: #64748b; }
    .catalog { display: grid; grid-template-columns: 220px 1fr; gap: 14px; }
    .goods { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .good { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 14px; }
    .good.on { outline: 2px solid #99f6e4; }
    .notebox { width: 380px; }
    .noteitem { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    .searchhits { position: absolute; left: 16px; top: 58px; width: min(420px, calc(100% - 32px)); background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; box-shadow: 0 16px 40px rgba(15,23,42,.12); z-index: 20; display: none; }
    .searchhits button { width: 100%; text-align: left; background: #fff; color: #0f172a; border-radius: 0; }
    header { position: relative; }
    @media (max-width: 980px) { .actdash, .exec, .inbox, .catalog { grid-template-columns: 1fr; } .actgrid, .kpis, .goods { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(style);

  const basePaint = (typeof paintNav === 'function') ? paintNav : function(){};
  paintNav = function () {
    basePaint();
    const scroll = document.querySelector('#nav .navscroll');
    const home = scroll && scroll.querySelector('button[data-page="home"]');
    if (!home) return;
    home.insertAdjacentHTML('afterend',
      '<div class="nav-section-header">Selling</div>' +
      navItem('leads', 'Leads', svg('<path d="M4 7h16M4 12h10M4 17h7"/>')) +
      navItem('deals', 'Deals', svg('<path d="M3 8h18v8H3z"/><path d="M3 12h18"/>')) +
      navItem('opportunities', 'Opportunities', svg('<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/>')) +
      '<div class="nav-section-header">People</div>' +
      navItem('contacts', 'Contacts', svg('<path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/><path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z"/><path d="M2 21c0-4.42 2.69-8 6-8s6 3.58 6 8"/><path d="M14 21c0-2.66 1.33-4 2.5-5"/>')) +
      navItem('companies', 'Companies', svg('<path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>')) +
      '<div class="nav-section-header">Work</div>' +
      navItem('tasks', 'Tasks', svg('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')) +
      navItem('calendar', 'Calendar', svg('<path d="M3 5h18v16H3z"/><path d="M3 9h18M8 3v4M16 3v4"/>')) +
      navItem('dial', 'Call list', svg('<path d="M7 3h3l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 2-2z"/>')) +
      '<div class="nav-section-header">Insights</div>' +
      navItem('analytics', 'Analytics', svg('<path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>')) +
      navItem('forecast', 'Forecast', svg('<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>')) +
      '<div class="nav-section-header">Automation</div>' +
      navItem('flow', 'Workflow', svg('<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 7h6a4 4 0 0 1 4 4v5"/>')) +
      navItem('sequences', 'Sequences', svg('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>')) +
      '<div class="nav-section-header">Setup</div>' +
      navItem('teams', 'Access', svg('<path d="M12 3 4 7v5c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7z"/>')) +
      navItem('audit', 'Organization', svg('<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>')) +
      navItem('settings', 'Settings', svg('<circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>'))
    );
    document.querySelectorAll('#nav button').forEach((el) => el.classList.toggle('on', el.dataset.page === page));
  };

  const studioDraw = draw;
  draw = function () {
    if (page === 'flow') return drawFlow();
    return studioDraw();
  };

  function initials(name) {
    const parts = String(name || '?').trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0] || '').join('').toUpperCase() || 'A';
  }
  function hue(name) {
    const colors = ['#fde68a', '#bbf7d0', '#bfdbfe', '#fecdd3', '#ddd6fe', '#fed7aa'];
    let n = 0;
    for (const ch of String(name || '')) n += ch.charCodeAt(0);
    return colors[n % colors.length];
  }
  function when(value) {
    if (!value) return '';
    const then = new Date(value);
    if (Number.isNaN(then.getTime())) return String(value).slice(0, 16);
    const days = Math.round((Date.now() - then.getTime()) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return days + ' days ago';
    return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  drawLeads = function () {
    const q = (document.getElementById('q').value || '').trim().toLowerCase();
    const rows = (bag.leads || []).filter((row) => !q || (person(row) + ' ' + (row.companyName || '') + ' ' + (row.description || '')).toLowerCase().includes(q));
    const columns = [['NEW', 'New'], ['WORKING', 'Follow up'], ['QUALIFIED', 'Negotiation'], ['CONVERTED', 'Won']];
    const dealFor = (id) => (bag.deals || []).find((row) => row.leadId === id);
    const board = columns.map(([status, label]) => {
      const list = rows.filter((row) => (row.status || 'NEW') === status);
      const sum = list.reduce((total, row) => total + Number((dealFor(row.id) || {}).amount || 0), 0);
      const cards = list.map((row) => {
        const deal = dealFor(row.id);
        const name = person(row);
        return `<article class="leadcard" draggable="true" ondragstart="leadDrag(event,'${row.id}')" onclick="openRecord('lead','${row.id}')">
          <div class="who"><span class="av" style="background:${hue(name)}">${initials(name)}</span><div><b>${esc(name)}</b><div class="meta">${esc(row.companyName || 'No company')}</div></div></div>
          <div>${esc(row.description || row.source || 'Lead')}</div>
          <div class="pills"><span>${esc(ownerName(row.ownerId) || 'Unassigned')}</span>${deal ? `<span>${money(deal.amount)}</span>` : ''}<span>${esc(row.source || 'Direct')}</span><span class="${row.rating === 'HOT' ? 'hot' : 'ok'}">${esc(row.rating || 'WARM')}</span></div>
        </article>`;
      }).join('');
      return `<section class="leadcol" ondragover="event.preventDefault()" ondrop="leadDrop(event,'${status}')">
        <header><b>${label}</b><button type="button" class="ghost" onclick="document.getElementById('leadForm').hidden=false">+</button></header>
        <div class="sumline" title="${money(sum)}"><i style="width:${Math.min(100, Math.round(sum / 1000))}%"></i></div>
        <div class="meta" style="margin-bottom:8px">${money(sum)}</div>
        ${cards || ''}<div class="dropwell">Drag here</div>
      </section>`;
    }).join('');
    document.getElementById('view').innerHTML = `<div class="leadhead"><h1>Leads</h1><div class="leadtools"><button type="button" onclick="document.getElementById('leadForm').hidden=!document.getElementById('leadForm').hidden">Create lead</button></div></div>
      <div class="card" id="leadForm" hidden><div class="pipe" style="grid-template-columns:1fr 1fr"><label>First name<input id="lFirst"></label><label>Last name<input id="lLast"></label><label>Company<input id="lCompany"></label><label>Phone<input id="lPhone"></label><label>Email<input id="lEmail"></label><label>What they asked<input id="lAbout"></label><label>Source<input id="lSource" placeholder="Phone, email, web form"></label><label>Rating<select id="lRating"><option>WARM</option><option>HOT</option><option>COLD</option></select></label><label>Owner<select id="lOwner"><option value="">Me</option>${ownerOptions()}</select></label></div><button type="button" onclick="saveLead()">Save lead</button></div>
      <div class="leadboard">${board}</div>`;
  };
  const oldSave = (typeof saveLead === 'function') ? saveLead : null;
  saveLead = async function () {
    const about = document.getElementById('lAbout');
    if (about && about.value && document.getElementById('lFirst')) {
      const firstName = document.getElementById('lFirst').value.trim();
      if (!firstName) return toast('Enter a name');
      const result = await api('/crm/api/leads', { method: 'POST', body: JSON.stringify({ firstName, lastName: document.getElementById('lLast').value, companyName: document.getElementById('lCompany').value, phone: document.getElementById('lPhone').value, email: document.getElementById('lEmail').value, source: document.getElementById('lSource').value, rating: document.getElementById('lRating').value, ownerId: document.getElementById('lOwner').value, description: about.value, status: 'NEW' }) });
      if (!result || result.error) return toast((result && result.error) || 'Could not save');
      toast('Lead saved');
      refresh();
      return;
    }
    return oldSave ? oldSave() : undefined;
  };
  window.leadDrag = (event, id) => { event.dataTransfer.setData('text/plain', id); };
  window.leadDrop = async (event, status) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (!id) return;
    const result = await api('/crm/api/leads/' + id, { method: 'PATCH', body: JSON.stringify({ status }) });
    if (!result || result.error) return toast('Could not move it');
    toast('Moved');
    refresh();
  };

  drawHome = async function () {
    const contacts = (bag.contacts || []).slice(0, 4);
    const companies = (bag.companies || []).slice(0, 4);
    const openDeals = (bag.deals || []).filter((row) => !String(row.stage || '').startsWith('CLOSED'));
    const deals = openDeals.slice(0, 4);
    const tasks = (bag.activities || []).filter((row) => row.type === 'TASK').slice(0, 4);
    const meetings = (bag.activities || []).filter((row) => row.type === 'MEETING').slice(0, 4);
    const today = new Date().toISOString().slice(0, 10);
    const tasksDue = (bag.activities || []).filter((row) => row.type === 'TASK' && row.status === 'PLANNED' && row.dueAt && String(row.dueAt).slice(0, 10) <= today).length;
    const pipelineValue = openDeals.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const hotLeads = (bag.leads || []).filter((row) => row.rating === 'HOT' && row.status !== 'CONVERTED' && row.status !== 'DEAD').length;
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const empty = (ico, msg, cta, onClick) => `<div class="empty"><div class="empty-ico">${ico}</div><p>${msg}</p>${cta ? `<button type="button" class="ghost" onclick="${onClick}">${cta}</button>` : ''}</div>`;

    const line = (title, meta, id) => `<div class="rowline"><div><b>${esc(title)}</b><div class="meta">${esc(meta)}</div></div><span class="meta">${when(id)}</span></div>`;
    const contactLines = contacts.map((row) => line(person(row), row.email || companyName(row.companyId) || 'No email', row.createdAt)).join('') || empty('👤', 'No contact yet.', 'Add one', "go('contacts','contact')");
    const companyLines = companies.map((row) => line(row.name, row.industry || row.email || 'Account', row.createdAt)).join('') || empty('🏢', 'No company yet.', 'Add one', "go('companies','company')");
    const dealLines = deals.map((row) => line(row.name, money(row.amount) + ' · ' + stageOf(row), row.createdAt)).join('') || empty('📊', 'No open deal.', 'Open one', "go('deals','deal')");
    const taskLines = tasks.map((row) => `<div class="rowline"><div><b>${esc(row.subject)}</b><div class="meta">${esc(row.status || 'PLANNED')} · ${esc(row.priority || 'NORMAL')}</div></div><span class="meta">${when(row.dueAt || row.createdAt)}</span></div>`).join('') || empty('✓', 'No task.', 'Add one', "go('tasks','task')");
    const meetLines = meetings.map((row) => `<div class="rowline"><div><b>${esc(row.subject)}</b><div class="meta">${esc(row.dueAt || 'No time')}</div></div><button type="button" class="ghost" onclick="go('calendar')">Open</button></div>`).join('') || empty('📅', 'No meeting on the calendar.', 'Add one', "go('calendar')");
    const story = (bag.activities || []).slice(0, 8).map((row) => `<article class="titem"><b>${esc(row.type || 'Note')}</b><div>${esc(row.subject)}</div><div class="meta">${when(row.createdAt)} · ${esc(ownerName(row.ownerId) || '')}</div></article>`).join('') || empty('—', 'Nothing logged yet. A call, a task, or a meeting shows here.', null, null);

    document.getElementById('view').innerHTML = `<div class="board-head"><div><h1>Today</h1><p class="hello">${hourHello()} · ${dateStr} · ${openDeals.length} open deal${openDeals.length === 1 ? '' : 's'}${tasksDue ? ' · ' + tasksDue + ' task' + (tasksDue === 1 ? '' : 's') + ' due' : ''}</p></div><span><button type="button" class="ghost" onclick="go('guide')">Start guide</button> <button type="button" class="ghost" onclick="window.__loadDemoClient()" style="background:#f0fdfa;color:#0d9488;border-color:#99f6e4">Demo data</button> <button type="button" class="ghost" onclick="refresh()">Refresh</button></span></div>
      <div class="today-stats">
        <div class="today-stat"><b>${openDeals.length}</b><span>Open deals</span></div>
        <div class="today-stat"><b>${money(pipelineValue)}</b><span>Pipeline</span></div>
        <div class="today-stat"><b>${tasksDue}</b><span>Tasks due</span></div>
        <div class="today-stat"><b>${hotLeads}</b><span>Hot leads</span></div>
      </div>
      <div class="actdash">
        <div>
          <div class="actgrid">
            <article class="actcard"><h2>Latest contacts <span class="meta">${(bag.contacts || []).length}</span></h2>${contactLines}</article>
            <article class="actcard"><h2>Latest accounts <span class="meta">${(bag.companies || []).length}</span></h2>${companyLines}</article>
            <article class="actcard"><h2>Latest deals <span class="meta">${openDeals.length}</span></h2>${dealLines}</article>
            <article class="actcard"><h2>Latest tasks <span class="meta">${tasks.length}</span></h2>${taskLines}</article>
          </div>
          <article class="actcard" style="margin-top:12px"><h2>Appointments</h2>${meetLines}</article>
        </div>
        <aside class="timeline"><h2>Activity timeline</h2>${story}</aside>
      </div>`;
  };

  drawTeams = async function () {
    const data = await api('/crm/api/access');
    const rows = (data && data.rows) || [];
    const areas = (data && data.areas) || [];
    const actions = (data && data.actions) || [];
    const roles = ['OWNER', 'ADMIN', 'MANAGER', 'SALES', 'VIEWER'];
    const on = (role, area, action) => rows.some((row) => row.roleName === role && row.area === area && row.action === action && Number(row.allowed));
    const blocks = areas.map((area) => {
      const head = actions.map((action) => `<th>${esc(action)}</th>`).join('');
      const body = roles.map((role) => `<tr><td>${role}</td>${actions.map((action) => `<td><input type="checkbox" ${on(role, area, action) ? 'checked' : ''} ${role === 'OWNER' ? 'disabled' : ''} onchange="setAccess('${role}','${area}','${action}',this.checked)"></td>`).join('')}</tr>`).join('');
      return `<h2 style="margin:18px 0 8px">${esc(area)}</h2><div class="sheet"><table class="matrix"><tr><th>Role</th>${head}</tr>${body}</table></div>`;
    }).join('') || '<p class="hello">Loading access…</p>';
    const people = bag.people || [];
    const members = (bag.teams || []).map((team) => `<article class="card"><b>${esc(team.name)}</b><div class="meta">${(team.members || []).map((id) => { const row = people.find((person) => person.id === id); return row ? (row.fullName || row.email) : id; }).join(', ') || 'No members'}</div></article>`).join('');
    document.getElementById('view').innerHTML = `<div class="board-head"><div><h1>Team and access</h1><p class="hello">Owner, admin, manager, sales, and viewer. The owner cannot be switched off. A box is a real permission on this workspace.</p></div></div>${blocks}<h2>Teams</h2><div class="card"><label>Team name<input id="teamName"></label><button type="button" onclick="saveTeam()">Add team</button></div>${members}`;
  };
  window.setAccess = async (role, area, action, allowed) => {
    const result = await api('/crm/api/access', { method: 'POST', body: JSON.stringify({ role, area, action, allowed }) });
    if (!result || result.error) { toast((result && result.error) || 'Could not save'); drawTeams(); return; }
    toast('Access updated');
  };

  drawDash = function () {
    const deals = bag.deals || [];
    const won = deals.filter((row) => stageOf(row) === 'CLOSED_WON');
    const lost = deals.filter((row) => stageOf(row) === 'CLOSED_LOST');
    const open = deals.filter((row) => !String(stageOf(row)).startsWith('CLOSED'));
    const revenue = won.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const pipeline = open.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const calls = (bag.activities || []).filter((row) => row.type === 'CALL').length;
    const emails = (bag.activities || []).filter((row) => row.type === 'EMAIL').length;
    const meetings = (bag.activities || []).filter((row) => row.type === 'MEETING').length;
    const byOwner = {};
    won.forEach((row) => { const key = ownerName(row.ownerId) || 'Unassigned'; byOwner[key] = (byOwner[key] || 0) + Number(row.amount || 0); });
    const owners = Object.entries(byOwner).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = Math.max(1, ...owners.map((row) => row[1]));
    const bars = owners.map(([name, amount]) => `<div class="hbar"><span>${esc(name)}</span><i style="width:${Math.max(6, Math.round(amount / max * 100))}%"></i><b>${money(amount)}</b></div>`).join('') || '<p class="meta">No won deal yet. The bars appear when a deal is closed won.</p>';
    const closedCount = {};
    won.forEach((row) => { const key = ownerName(row.ownerId) || 'Unassigned'; closedCount[key] = (closedCount[key] || 0) + 1; });
    const maxC = Math.max(1, ...Object.values(closedCount));
    const closedBars = Object.entries(closedCount).map(([name, count]) => `<div class="hbar"><span>${esc(name)}</span><i style="width:${Math.max(6, Math.round(count / maxC * 100))}%"></i><b>${count}</b></div>`).join('') || '<p class="meta">No closed deal yet.</p>';
    const spark = (bag.contacts || []).slice(0, 8).map(() => 20 + Math.round(Math.random() * 0)); // placeholder replaced below
    const months = {};
    (bag.contacts || []).forEach((row) => { const key = String(row.createdAt || '').slice(0, 7) || '—'; months[key] = (months[key] || 0) + 1; });
    const series = Object.values(months).slice(-8);
    const peak = Math.max(1, ...series, 1);
    const sparkHtml = series.map((n) => `<i style="height:${Math.max(8, Math.round(n / peak * 36))}px"></i>`).join('') || '<i style="height:8px"></i>';
    const rate = deals.length ? Math.round(won.length / deals.length * 100) : 0;
    document.getElementById('view').innerHTML = `<div class="board-head"><div><h1>Executive dashboard</h1><p class="hello">Numbers from this workspace. Nothing here is a sample.</p></div><button type="button" class="ghost" onclick="downloadReport()">Export</button></div>
      <div class="exec">
        <div class="kpis">
          <article class="kpi"><span class="meta">Sales revenue</span><b>${money(revenue)}</b><div class="spark">${sparkHtml}</div><div class="meta">Won deals only</div></article>
          <article class="kpi"><span class="meta">Customers</span><b>${(bag.companies || []).length}</b><div class="meta">${(bag.contacts || []).length} contacts</div></article>
          <article class="kpi"><span class="meta">Open pipeline</span><b>${money(pipeline)}</b><div class="meta">${open.length} open deals</div></article>
          <article class="kpi"><span class="meta">Win rate</span><b>${rate}%</b><div class="meta">${won.length} won · ${lost.length} lost</div></article>
        </div>
        <div>
          <article class="kpi"><h2>Activity</h2><div class="rowline"><span>Calls</span><b>${calls}</b></div><div class="rowline"><span>Emails</span><b>${emails}</b></div><div class="rowline"><span>Meetings</span><b>${meetings}</b></div></article>
          <article class="kpi" style="margin-top:12px"><h2>Conversion</h2><div class="meta">${(bag.leads || []).length} leads · ${won.length} won</div><div class="sumline"><i style="width:${rate}%"></i></div></article>
        </div>
      </div>
      <div class="exec" style="margin-top:12px">
        <article class="kpi"><h2>Revenue per person</h2>${bars}</article>
        <article class="kpi"><h2>Deals closed</h2>${closedBars}</article>
      </div>`;
    spark;
  };

  let inboxId = '';
  drawComm = async function () {
    const tickets = await api('/crm/api/tickets');
    const list = Array.isArray(tickets) ? tickets : [];
    const open = list.filter((row) => row.status !== 'CLOSED');
    const mine = open.filter((row) => row.ownerId === me.id || row.authorId === me.id);
    if (!inboxId && open[0]) inboxId = open[0].id;
    let thread = '<p class="meta">Choose a conversation.</p>';
    const current = list.find((row) => row.id === inboxId);
    if (current) {
      const data = await api('/crm/api/tickets/' + current.id);
      const replies = (data && data.replies) || [];
      thread = `<div class="board-head"><h2 style="margin:0">${esc(current.subject)}</h2><span class="meta">${esc(current.status)}</span></div>
        <article class="bubble"><b>Opened</b><div>${esc(current.body || '')}</div><div class="meta">${when(current.createdAt)}</div></article>
        ${replies.map((row) => `<article class="bubble"><div>${esc(row.body)}</div><div class="meta">${when(row.createdAt)}</div></article>`).join('')}
        <label>Reply<textarea id="inboxReply" style="height:80px"></textarea></label>
        <button type="button" onclick="sendInbox('${current.id}')">Send</button>`;
    }
    document.getElementById('view').innerHTML = `<div class="inbox">
      <nav><b>Inbox</b><button type="button" class="on">All open · ${open.length}</button><button type="button">Mine · ${mine.length}</button><button type="button" onclick="go('service')">New ticket</button></nav>
      <div class="list">${list.map((row) => `<button type="button" class="${row.id === inboxId ? 'on' : ''}" onclick="inboxId='${row.id}';drawComm()"><b>${esc(row.subject)}</b><div class="meta">${esc(row.status)} · ${when(row.createdAt)}</div></button>`).join('') || '<p class="meta" style="padding:12px">No conversation yet.</p>'}</div>
      <div class="thread">${thread}</div>
    </div>`;
  };
  window.sendInbox = async (id) => {
    const body = document.getElementById('inboxReply').value.trim();
    if (!body) return toast('Write the reply');
    const result = await api('/crm/api/tickets/' + id + '/replies', { method: 'POST', body: JSON.stringify({ body }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not send');
    toast('Sent');
    drawComm();
  };

  async function drawFlow() {
    const flows = await api('/crm/api/workflows');
    const rows = Array.isArray(flows) ? flows : [];
    const runs = await api('/crm/api/events');
    const jobs = Array.isArray(runs) ? runs : [];
    const nodes = rows.map((row) => `<article class="node trigger"><div class="tag">Trigger</div><h2 style="margin:6px 0">${esc(row.name)}</h2><div class="meta">${esc(row.trigger)} → ${esc(row.action || 'task')}</div><p>${esc(row.taskSubject || row.target || '')}</p></article><article class="node"><div class="tag">Action</div><p>${row.action === 'webhook' ? 'Send the record to another system.' : row.action === 'notify' ? 'Tell the owner.' : 'Open a follow-up task.'}</p><div class="meta">${row.active ? 'On' : 'Off'}</div></article>`).join('') || `<article class="node trigger"><div class="tag">Starting point</div><h2>No flow yet</h2><p>When a lead is added, assign it and open a follow-up. Save one on the right.</p></article>`;
    const jobList = jobs.slice(0, 8).map((row) => `<div class="rowline"><span>${esc(row.name)}</span><b>${esc(row.status)}</b></div>`).join('') || '<p class="meta">No background job yet.</p>';
    document.getElementById('view').innerHTML = `<div class="board-head"><h1>Workflow</h1><button type="button" class="ghost" onclick="go('automation')">All flows</button></div>
      <div class="catalog"><div class="flow">${nodes}</div>
      <div><article class="card"><h2>New flow</h2><label>Name<input id="flowName" placeholder="New lead follow-up"></label><label>When<select id="flowWhen"><option value="lead.created">A lead is added</option><option value="deal.won">A deal is won</option><option value="deal.lost">A deal is lost</option></select></label><label>Then<select id="flowDo"><option value="task">Open a task</option><option value="notify">Tell the owner</option></select></label><label>Task<input id="flowTask" placeholder="Call them tomorrow"></label><button type="button" onclick="saveStudioFlow()">Save flow</button></article>
      <article class="card"><h2>Jobs</h2><p class="hello">The event bus runs these in the background. A failed job retries, then stops.</p>${jobList}</article></div></div>`;
  }
  window.saveStudioFlow = async () => {
    const name = document.getElementById('flowName').value.trim();
    const taskSubject = document.getElementById('flowTask').value.trim() || name;
    if (!name) return toast('Name the flow');
    const result = await api('/crm/api/workflows', { method: 'POST', body: JSON.stringify({ name, trigger: document.getElementById('flowWhen').value, action: document.getElementById('flowDo').value, taskSubject, days: 1 }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not save');
    toast('Flow saved');
    drawFlow();
  };

  let catalogCat = 'All';
  let pickedProduct = '';
  drawProducts = function () {
    const rows = bag.products || [];
    const cats = ['All', ...new Set(rows.map((row) => row.category || 'General'))];
    const shown = rows.filter((row) => (catalogCat === 'All' || (row.category || 'General') === catalogCat) && hit(row.name + (row.code || '')));
    const cards = shown.map((row) => `<article class="good ${pickedProduct === row.id ? 'on' : ''}" onclick="pickedProduct='${row.id}';drawProducts()"><b>${esc(row.name)}</b><div class="meta">${esc(row.code || '')}</div><div>Unit price ${money(row.price)}</div><div class="meta">On hand ${Number(row.stock || 0)}</div><div class="pills"><span>${esc(row.category || 'General')}</span></div>${pickedProduct === row.id ? `<div class="filters"><button type="button" class="ghost" onclick="event.stopImmediatePropagation();adjustStock('${row.id}',-1)">−</button><button type="button" class="ghost" onclick="event.stopImmediatePropagation();adjustStock('${row.id}',1)">+</button><button type="button" onclick="event.stopImmediatePropagation();go('quotes')">Quote</button></div>` : `<button type="button" class="ghost" onclick="event.stopImmediatePropagation();pickedProduct='${row.id}';drawProducts()">Add</button>`}</article>`).join('') || '<p class="meta">No product yet.</p>';
    document.getElementById('view').innerHTML = `<div class="board-head"><h1>Catalog</h1></div>
      <div class="steps" style="justify-content:flex-start"><span class="on"></span><span></span><span></span><span></span><span></span></div>
      <p class="hello">Quotation, sales order, fulfilment, invoice, subscription. The catalog is the first step. A quote still lives under Revenue.</p>
      <div class="catalog"><aside class="card"><b>Category</b>${cats.map((name) => `<button type="button" class="${catalogCat === name ? '' : 'ghost'}" style="width:100%;margin-top:6px" onclick="catalogCat='${esc(name)}';drawProducts()">${esc(name)}</button>`).join('')}</aside>
      <div><div class="card"><div class="pipe" style="grid-template-columns:1fr 1fr 120px 120px"><label>Name<input id="pName"></label><label>Code<input id="pCode"></label><label>Price<input id="pPrice" inputmode="decimal"></label><label>On hand<input id="pStock" inputmode="decimal" value="0"></label><label>Category<input id="pCat" value="General"></label></div><button type="button" onclick="saveProduct()">Save product</button></div><div class="goods">${cards}</div></div></div>`;
  };
  const oldProduct = (typeof saveProduct === 'function') ? saveProduct : null;
  saveProduct = async function () {
    const stock = document.getElementById('pStock');
    if (!stock) return oldProduct ? oldProduct() : undefined;
    const name = document.getElementById('pName').value.trim();
    if (!name) return toast('Name the product');
    const result = await api('/crm/api/products', { method: 'POST', body: JSON.stringify({ name, code: document.getElementById('pCode').value, price: document.getElementById('pPrice').value, stock: stock.value, category: document.getElementById('pCat').value || 'General' }) });
    if (!result || result.error) return toast('Could not save');
    toast('Product saved');
    refresh();
  };
  window.adjustStock = async (id, step) => {
    const row = (bag.products || []).find((item) => item.id === id);
    if (!row) return;
    const stock = Math.max(0, Number(row.stock || 0) + step);
    const result = await api('/crm/api/products/' + id, { method: 'PATCH', body: JSON.stringify({ stock }) });
    if (!result || result.error) return toast('Could not update stock');
    row.stock = stock;
    drawProducts();
  };

  const baseBell = (typeof loadBell === 'function') ? loadBell : function(){};
  loadBell = async function () {
    const data = await api('/crm/api/notifications');
    if (!data || data.error) return baseBell();
    setBell(data.unread || 0);
    const items = data.items || [];
    document.getElementById('bellList').classList.add('notebox');
    document.getElementById('bellList').innerHTML = `<div class="alerthead"><b>Notifications</b><button type="button" onclick="readNotes()">Mark read</button></div>
      <div class="alertlist">${items.map((row) => `<div class="noteitem"><b>${esc(row.title)}</b><div class="meta">${esc(row.body || '')} · ${when(row.createdAt)}</div>
        <div class="filters"><button type="button" onclick="openNote('${row.id}','${esc(row.recordType || '')}','${esc(row.recordId || '')}')">Go to</button><button type="button" class="ghost" onclick="dismissNote('${row.id}')">Dismiss</button><button type="button" class="ghost" onclick="snoozeNote('${row.id}')">Snooze 1h</button></div></div>`).join('') || '<div class="alertempty"><b>Nothing waiting</b><div>A lead, a task, or an assignment shows here.</div></div>'}</div>`;
  };
  window.dismissNote = async (id) => { await api('/crm/api/notifications/read', { method: 'POST', body: JSON.stringify({ id }) }); loadBell(); };
  window.snoozeNote = async (id) => { await api('/crm/api/notifications/snooze', { method: 'POST', body: JSON.stringify({ id, minutes: 60 }) }); toast('Snoozed for an hour'); loadBell(); };

  drawAudit = async function () {
    const [rows, sessions, people] = await Promise.all([api('/crm/api/audit'), api('/crm/api/sessions'), api('/crm/api/people')]);
    const list = Array.isArray(rows) ? rows : [];
    const sess = Array.isArray(sessions) ? sessions : [];
    const team = Array.isArray(people) ? people : (bag.people || []);
    const actions = [...new Set(list.map((row) => row.action))];
    const objects = [...new Set(list.map((row) => row.object))];
    document.getElementById('view').innerHTML = `<div class="board-head"><div><h1>Organization</h1><p class="hello">${esc(company)}. CRM sign-in is separate from the books.</p></div></div>
      <div class="tabs"><button type="button" class="${orgTab === 'audit' ? 'on' : ''}" onclick="orgTab='audit';drawAudit()">Audit logs</button><button type="button" class="${orgTab === 'users' ? 'on' : ''}" onclick="orgTab='users';drawAudit()">Users</button><button type="button" class="${orgTab === 'sessions' ? 'on' : ''}" onclick="orgTab='sessions';drawAudit()">Sessions</button><button type="button" onclick="go('teams')">Access</button><button type="button" onclick="go('backups')">Backups</button></div>
      ${orgTab === 'users' ? `<div class="sheet"><table><tr><th>Name</th><th>Email</th><th>Role</th><th></th></tr>${team.map((row) => `<tr><td>${esc(row.fullName)}</td><td>${esc(row.email)}</td><td>${esc(row.role)}</td><td>${row.role === 'OWNER' ? '' : `<button type="button" class="ghost" onclick="flipAccount('${row.id}',${Number(row.active) === 0 ? 'true' : 'false'})">${Number(row.active) === 0 ? 'Turn on' : 'Turn off'}</button>`}</td></tr>`).join('') || '<tr><td colspan="4">No one else yet.</td></tr>'}</table></div><p class="hello"><button type="button" onclick="go('users')">Invite a person</button></p>` : ''}
      ${orgTab === 'sessions' ? `<div class="sheet"><table><tr><th>When</th><th>Network</th><th>Browser</th><th></th></tr>${sess.map((row) => `<tr><td>${esc(when(row.createdAt))}</td><td>${esc(row.ip || '')}</td><td>${esc(row.agent || '')}</td><td>${row.revokedAt ? 'Closed' : `<button type="button" class="ghost" onclick="revokeSession('${row.id}')">Close</button>`}</td></tr>`).join('') || '<tr><td colspan="4">No session stored yet. Sign in again and one is recorded.</td></tr>'}</table></div>` : ''}
      ${orgTab === 'audit' ? `<div class="filters"><select id="auditAction" onchange="auditAction=this.value;drawAudit()"><option value="">Action</option>${actions.map((name) => `<option ${auditAction === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select><select id="auditObject" onchange="auditObject=this.value;drawAudit()"><option value="">Record</option>${objects.map((name) => `<option ${auditObject === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></div><div class="sheet"><table><tr><th>Record</th><th>When</th><th>Action</th><th>Who</th><th>Type</th><th>Detail</th></tr>${list.filter((row) => (!auditAction || row.action === auditAction) && (!auditObject || row.object === auditObject)).map((row) => `<tr><td>${esc(row.object)}</td><td>${esc(String(row.createdAt || '').slice(0, 16).replace('T', ' '))}</td><td>${esc(row.action)}</td><td>${esc(row.email || row.who)}</td><td>${esc(row.object)}</td><td>${esc(row.detail || '')}</td></tr>`).join('') || '<tr><td colspan="6">No changes yet.</td></tr>'}</table></div>` : ''}`;
  };
  let orgTab = 'audit';
  let auditAction = '';
  let auditObject = '';
  window.revokeSession = async (id) => {
    const result = await api('/crm/api/sessions/' + id + '/revoke', { method: 'POST', body: '{}' });
    if (!result || result.error) return toast('Could not close it');
    toast('Session closed');
    drawAudit();
  };
  window.flipAccount = async (id, active) => {
    const result = await api('/crm/api/account/active', { method: 'POST', body: JSON.stringify({ id, active }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not change it');
    toast(active ? 'Turned on' : 'Turned off');
    refresh();
  };

  const box = document.createElement('div');
  box.id = 'searchhits';
  box.className = 'searchhits';
  document.querySelector('header').appendChild(box);
  const baseQueue = (typeof queueDraw === 'function') ? queueDraw : function(){};
  queueDraw = function () {
    baseQueue();
    clearTimeout(window.__find);
    const q = document.getElementById('q').value.trim();
    window.__find = setTimeout(async () => {
      if (q.length < 2) { box.style.display = 'none'; return; }
      const data = await api('/crm/api/search?q=' + encodeURIComponent(q));
      const hits = (data && data.hits) || [];
      box.innerHTML = hits.map((row) => `<button type="button" onclick="openRecord('${row.kind}','${row.id}');document.getElementById('searchhits').style.display='none'"><b>${esc(row.title)}</b><div class="meta">${esc(row.kind)} · ${esc(row.detail || '')}</div></button>`).join('') || '<div class="meta" style="padding:12px">No match.</div>';
      box.style.display = 'block';
    }, 180);
  };

  // ============================================================
  // ONBOARDING WIZARD — modal multi-step setup for first-time
  // signup. Auto-opens when workspace.done === 0. Posts to the
  // same /crm/api/setup endpoint as the existing chat wizard.
  // The chat wizard (openSetup in crm.html) is still available
  // via the "Use guided setup" link in the modal footer.
  // ============================================================
  window.openOnboardingWizard = function (restoredState) {
    if (document.getElementById('wizardOverlay')) return;

    const state = restoredState || {
      step: 0,
      industry: workspace.industry || '',
      channel: workspace.channel || '',
      goal: workspace.goal || '',
    };

    const STEPS = [
      {
        key: 'industry',
        question: 'What does your business do?',
        sub: 'Afri uses this to set sensible defaults for stages and tags. You can change it later.',
        choices: [
          { value: 'Services',      ico: '💼', label: 'Services',      hint: 'Consulting, agency, professional', color: 'teal' },
          { value: 'Retail',        ico: '🛍', label: 'Retail',        hint: 'Shops, e-commerce, trade', color: 'rose' },
          { value: 'Manufacturing', ico: '🏭', label: 'Manufacturing', hint: 'Production, assembly, factories', color: 'amber' },
          { value: 'Agriculture',   ico: '🌾', label: 'Agriculture',   hint: 'Farming, processing, agribusiness', color: 'emerald' },
          { value: 'Other',         ico: '✨', label: 'Other',         hint: 'Healthcare, education, hospitality, mining...', color: 'violet' },
        ],
      },
      {
        key: 'channel',
        question: 'How do you sell?',
        sub: 'The lead scoring uses your answer. A phone weighs more when buyers use WhatsApp.',
        choices: [
          { value: 'Phone & WhatsApp', ico: '📞', label: 'Phone & WhatsApp', hint: 'Most leads come in by call or chat', color: 'teal' },
          { value: 'Email',             ico: '✉', label: 'Email',             hint: 'Inbound forms, online enquiries, outreach', color: 'blue' },
          { value: 'In-person',         ico: '🤝', label: 'In-person',         hint: 'Walk-ins, meetings, field sales', color: 'amber' },
          { value: 'Mixed',              ico: '🔀', label: 'Mixed',              hint: 'Some of each — Afri uses balanced weights', color: 'violet' },
        ],
      },
      {
        key: 'goal',
        question: "What's the goal?",
        sub: 'When the goal is to close, the deal amount weighs more. When the goal is support, the touch weighs more.',
        choices: [
          { value: 'Close deals',       ico: '🎯', label: 'Close deals',       hint: 'Pipeline, revenue, conversion', color: 'rose' },
          { value: 'Customer support',   ico: '🛠', label: 'Customer support',  hint: 'Tickets, retention, service quality', color: 'blue' },
          { value: 'Job delivery',       ico: '📦', label: 'Job delivery',       hint: 'Projects, fulfillment, milestones', color: 'amber' },
        ],
      },
      {
        key: 'connect_inbox',
        question: 'Connect your inbox',
        sub: 'Send and log emails from Afri CRM. Connect Gmail, Google Calendar, or Outlook in one click. You can skip and do this later from the Integrations page.',
        actions: [
          { provider: 'gmail',    ico: '✉',  label: 'Connect Gmail',          hint: 'Sync emails, send from CRM, log conversations', color: 'rose' },
          { provider: 'calendar',  ico: '📅', label: 'Connect Google Calendar', hint: 'See meetings, sync tasks to calendar', color: 'blue' },
          { provider: 'outlook',   ico: '📧', label: 'Connect Outlook',        hint: 'Sync Outlook emails and calendar', color: 'blue' },
        ],
        skipText: 'Skip — I\'ll do this later',
      },
    ];

    const TOTAL_STEPS = STEPS.length + 1; // 4 steps + confirm

    function render() {
      const step = state.step;
      const isLast = step === STEPS.length;
      const current = !isLast ? STEPS[step] : null;

      const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const cls = i === step ? 'on' : (i < step ? 'done' : '');
        return `<i class="${cls}"></i>`;
      }).join('');

      const choices = current && current.choices ? current.choices.map((c) => {
        const on = state[current.key] === c.value ? ' on' : '';
        const safeVal = String(c.value).replace(/'/g, "\\'");
        const colorAttr = c.color ? ` data-color="${c.color}"` : '';
        return `<button type="button" class="wizard-choice${on}"${colorAttr} onclick="window.__wizardPick('${current.key}','${safeVal}')">
          <div class="ico">${c.ico}</div>
          <div class="label"><b>${esc(c.label)}</b><span>${esc(c.hint)}</span></div>
        </button>`;
      }).join('') : '';

      let body;
      if (current) {
        if (current.key === 'connect_inbox') {
          // Special render: connection action buttons + skip
          const actions = (current.actions || []).map((a) => {
            const colorAttr = a.color ? ` data-color="${a.color}"` : '';
            return `<button type="button" class="wizard-choice"${colorAttr} onclick="window.__wizardConnectInbox('${a.provider}')">
              <div class="ico">${a.ico}</div>
              <div class="label"><b>${esc(a.label)}</b><span>${esc(a.hint)}</span></div>
            </button>`;
          }).join('');
          body = `<div class="wizard-body-anim"><h2>${esc(current.question)}</h2><p class="wizard-sub">${esc(current.sub)}</p><div class="wizard-choices">${actions}</div></div>`;
        } else {
          body = `<div class="wizard-body-anim"><h2>${esc(current.question)}</h2><p class="wizard-sub">${esc(current.sub)}</p><div class="wizard-choices">${choices}</div></div>`;
        }
      } else {
        // Confirm step
        body = `<div class="wizard-body-anim"><h2>Looks good.</h2><p class="wizard-sub">Industry: <b>${esc(state.industry || '—')}</b><br>Channel: <b>${esc(state.channel || '—')}</b><br>Goal: <b>${esc(state.goal || '—')}</b><br><br>Afri will use these to set your pipeline stages, lead scoring weights, and default tags. You can change them anytime from the sidebar.</p></div>`;
      }

      // For connect_inbox step, Continue button means "skip" — always allowed
      const canNext = isLast || !!state[current.key] || current.key === 'connect_inbox';
      const nextLabel = isLast ? 'Open the CRM' : (current && current.key === 'connect_inbox' && !state.connect_inbox ? 'Skip for now' : 'Continue');

      document.getElementById('wizardBody').innerHTML = body;
      document.getElementById('wizardDots').innerHTML = dots;
      const nextBtn = document.getElementById('wizardNext');
      nextBtn.textContent = nextLabel;
      nextBtn.disabled = !canNext;
      document.getElementById('wizardBack').style.visibility = step === 0 ? 'hidden' : 'visible';
    }

    const overlay = document.createElement('div');
    overlay.id = 'wizardOverlay';
    overlay.className = 'wizard-overlay';
    overlay.innerHTML = `
      <div class="wizard-card" role="dialog" aria-labelledby="wizardTitle">
        <div class="wizard-head">
          <div class="wizard-eyebrow">AFRI CRM · SETUP</div>
          <button type="button" class="wizard-skip" onclick="window.closeOnboardingWizard()">Skip for now</button>
        </div>
        <div class="wizard-body" id="wizardBody"></div>
        <div class="wizard-foot"><div class="step-dots" id="wizardDots"></div></div>
        <div class="wizard-foot">
          <button type="button" class="ghost" id="wizardBack" onclick="window.__wizardBack()">Back</button>
          <button type="button" class="primary" id="wizardNext" onclick="window.__wizardNext()">Continue</button>
          <a href="#" class="advanced" onclick="window.closeOnboardingWizard();openSetup();return false;">Use guided setup</a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    window.__wizardPick = (key, value) => {
      state[key] = value;
      render();
      // Auto-advance after a short delay (HubSpot pattern — click a choice,
      // see it selected briefly, then move to next step automatically).
      // Skip auto-advance for connect_inbox step (uses __wizardConnectInbox instead).
      if (state.step < STEPS.length && STEPS[state.step] && STEPS[state.step].key !== 'connect_inbox') {
        clearTimeout(window.__wizardAutoTimer);
        window.__wizardAutoTimer = setTimeout(() => {
          // Only advance if the user is still on the same step (didn't click Back)
          if (state.step < STEPS.length && state[STEPS[state.step].key] === value) {
            state.step++;
            render();
          }
        }, 350);
      }
    };
    window.__wizardConnectInbox = async (provider) => {
      // Save wizard state so it can be resumed after OAuth redirect
      try {
        sessionStorage.setItem('crm-setup-draft', JSON.stringify({ ...state, step: state.step }));
      } catch {}
      // Call the OAuth start endpoint WITH the Bearer token (direct browser
      // navigation doesn't send Authorization header, so we use api() which
      // does). The server returns { url: "https://accounts.google.com/..." }
      // which we then navigate to.
      var btn = document.querySelector('.wizard-overlay .wizard-choice[onclick*="' + provider + '"]');
      if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; }
      var res = await api('/crm/api/connect/' + provider);
      if (res && res.url) {
        window.location.href = res.url;
        return;
      }
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
      toast(res && res.error ? res.error : 'Could not start OAuth. Try again or use the Integrations page.');
    };
    window.__wizardBack = () => {
      clearTimeout(window.__wizardAutoTimer);
      if (state.step > 0) { state.step--; render(); }
    };
    window.__wizardNext = async () => {
      if (state.step < STEPS.length) {
        state.step++;
        render();
        return;
      }
      const btn = document.getElementById('wizardNext');
      btn.disabled = true; btn.textContent = 'Saving…';
      const saved = await api('/crm/api/setup', { method: 'POST', body: JSON.stringify({ ...state, done: 1 }) });
      if (!saved || saved.error) {
        toast((saved && saved.error) || 'Could not save setup');
        btn.disabled = false; btn.textContent = 'Open the CRM';
        return;
      }
      Object.assign(workspace, saved);
      paintSetupCard();
      window.closeOnboardingWizard();
      enter();
      toast('Workspace ready. Scoring adapts to your answers.');
      // Mark that the wizard just completed — PR 7 (quick tour) reads this flag.
      window.__wizardJustFinished = true;
      // Auto-open the quick tour if the user hasn't seen it before
      try {
        if (!localStorage.getItem('afri.tour.done') && typeof window.openQuickTour === 'function') {
          setTimeout(() => window.openQuickTour(), 800);
        }
      } catch {}
    };
    window.closeOnboardingWizard = () => {
      const el = document.getElementById('wizardOverlay');
      if (el) el.remove();
    };

    render();
  };

  // ============================================================
  // QUICK TOUR — 5-step tooltip overlay for first-time users.
  // Auto-opens after the onboarding wizard closes. Always
  // reachable via the "Tour" button in the header.
  // ============================================================
  window.openQuickTour = function () {
    if (document.getElementById('tourTooltip')) return;

    const STEPS = [
      {
        target: null, // Welcome — no element highlighted
        eyebrow: 'AFRI CRM · TOUR',
        title: 'Welcome to Afri CRM',
        body: "Let's take a 30-second tour. You can skip anytime — you can always retake this tour from the header.",
      },
      {
        target: '#nav',
        eyebrow: 'STEP 1 OF 4 · NAVIGATION',
        title: 'The sidebar is your home base',
        body: 'Home, Leads, Inbox, Catalog, Workflow, Access, Organization, Contacts, Companies, and More. The sidebar stays put — click any item to switch screens.',
      },
      {
        target: '.today-stats',
        eyebrow: 'STEP 2 OF 4 · DASHBOARD',
        title: 'Today shows what needs you',
        body: 'Open deals, pipeline value, tasks due, and hot leads. Tap a tile to dive in. The numbers update as you add records.',
        fallback: 'Open the Home page first to see this.',
      },
      {
        target: '.helper .ask, .helper',
        eyebrow: 'STEP 3 OF 4 · ASSISTANT',
        title: 'Ask Afri about your records',
        body: "Stuck? Click the green Ask button (bottom-right). Ask 'What is unpaid?', 'What is overdue?', 'What is hot?' — Afri answers from your actual records, no sample data.",
      },
      {
        target: null, // Finish — no element highlighted
        eyebrow: 'YOU\'RE READY',
        title: 'That\'s the tour.',
        body: 'Add a contact, open a deal, or work the call list. The CRM learns from what you do — your lead scores and tasks adjust as you work.',
      },
    ];

    let step = 0;
    let highlighted = null;

    function clearHighlight() {
      if (highlighted && highlighted.nodeType) {
        highlighted.classList.remove('tour-target-highlight');
        highlighted = null;
      }
    }

    function render() {
      const current = STEPS[step];
      const isLast = step === STEPS.length - 1;
      const isFirst = step === 0;

      clearHighlight();
      const tooltip = document.getElementById('tourTooltip');
      if (!tooltip) return;

      // Highlight target if any
      let rect = null;
      if (current.target) {
        const el = document.querySelector(current.target);
        if (el) {
          el.classList.add('tour-target-highlight');
          highlighted = el;
          rect = el.getBoundingClientRect();
          // Scroll into view if not visible
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => { rect = el.getBoundingClientRect(); positionTooltip(tooltip, rect); }, 320);
          }
        }
      }

      // Build tooltip content
      const dots = STEPS.map((_, i) => {
        const cls = i === step ? 'on' : (i < step ? 'done' : '');
        return `<i class="${cls}"></i>`;
      }).join('');

      const fallbackNote = current.fallback && !rect ? `<p style="color:#b45309;font-style:italic;margin-top:-8px;margin-bottom:8px">${esc(current.fallback)}</p>` : '';

      tooltip.innerHTML = `
        <div class="tour-eyebrow">${esc(current.eyebrow)}</div>
        <h3>${esc(current.title)}</h3>
        <p>${esc(current.body)}</p>
        ${fallbackNote}
        <div class="tour-foot">
          <div class="tour-dots">${dots}</div>
          ${isFirst ? '<button type="button" class="tour-skip" onclick="window.closeQuickTour()">Skip tour</button>' : '<button type="button" class="tour-back" onclick="window.__tourBack()">Back</button>'}
          <button type="button" class="tour-next" onclick="window.__tourNext()">${isLast ? 'Done' : 'Next'}</button>
        </div>
      `;
      positionTooltip(tooltip, rect);
    }

    function positionTooltip(tooltip, rect) {
      if (!rect) {
        // Center on screen
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        return;
      }
      // Place tooltip below the target by default, fall back to above if not enough space
      const tooltipRect = tooltip.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeBelow = spaceBelow > tooltipRect.height + 20;
      const top = placeBelow ? rect.bottom + 12 : Math.max(12, rect.top - tooltipRect.height - 12);
      // Center horizontally, clamp to viewport
      let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      left = Math.max(12, Math.min(window.innerWidth - tooltipRect.width - 12, left));
      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
      tooltip.style.transform = 'none';
    }

    const tooltip = document.createElement('div');
    tooltip.id = 'tourTooltip';
    tooltip.className = 'tour-tooltip';
    tooltip.setAttribute('role', 'dialog');
    document.body.appendChild(tooltip);

    window.__tourBack = () => { if (step > 0) { step--; render(); } };
    window.__tourNext = () => {
      if (step < STEPS.length - 1) { step++; render(); return; }
      // Last step — Done
      window.closeQuickTour();
      toast('Tour done. Add a contact to get started.');
    };
    window.closeQuickTour = () => {
      clearHighlight();
      const el = document.getElementById('tourTooltip');
      if (el) el.remove();
      // Mark tour as seen so it doesn't auto-open again
      try { localStorage.setItem('afri.tour.done', '1'); } catch {}
    };

    render();
  };

  // ============================================================
  // FEATURE A — DRAG-AND-DROP for deal cards (HTML5 DnD)
  // ============================================================
  window.handleDealDragStart = function (e, dealId) {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging');
  };
  window.handleDealDragEnd = function (e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.dealboard .col.drop-target').forEach((el) => el.classList.remove('drop-target'));
  };
  window.handleColDragOver = function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drop-target');
  };
  window.handleColDragLeave = function (e) {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('drop-target');
  };
  window.handleColDrop = async function (e, stageId) {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-target');
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId && stageId && typeof window.move === 'function') {
      await window.move(dealId, stageId);
    }
  };

  // ============================================================
  // FEATURE B — COMMAND PALETTE (⌘K)
  // ============================================================
  window.openCommandPalette = function () {
    if (document.getElementById('cmdkOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'cmdkOverlay';
    overlay.className = 'cmdk-overlay';
    overlay.innerHTML = `
      <div class="cmdk-card" role="dialog" aria-label="Command palette">
        <input class="cmdk-input" id="cmdkInput" placeholder="Search deals, contacts, companies, leads..." autocomplete="off">
        <div class="cmdk-results" id="cmdkResults"><div class="cmdk-empty">Type to search across your CRM records.</div></div>
        <div class="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = document.getElementById('cmdkInput');
    const results = document.getElementById('cmdkResults');
    let searchTimer = null;
    let currentResults = [];
    let selectedIdx = -1;

    const renderResults = () => {
      if (!currentResults.length) {
        results.innerHTML = '<div class="cmdk-empty">No matches. Try a different search.</div>';
        return;
      }
      const grouped = {};
      currentResults.forEach((r) => { if (!grouped[r.kind]) grouped[r.kind] = []; grouped[r.kind].push(r); });
      const order = ['deal', 'contact', 'company', 'lead'];
      const labels = { deal: 'Deals', contact: 'Contacts', company: 'Companies', lead: 'Leads' };
      const icons = { deal: '📊', contact: '👤', company: '🏢', lead: '🎯' };
      results.innerHTML = order.filter((k) => grouped[k]).map((kind) => {
        const items = grouped[kind];
        return `<div class="cmdk-section">${labels[kind]} · ${items.length}</div>` +
          items.map((r, i) => {
            const idx = currentResults.indexOf(r);
            const cls = idx === selectedIdx ? ' on' : '';
            return `<div class="cmdk-result${cls}" data-idx="${idx}" onclick="window.__cmdkOpen(${idx})">
              <div class="cmdk-ico ${r.kind}">${icons[r.kind] || '•'}</div>
              <div class="cmdk-meta">
                <div class="cmdk-title">${esc(r.title)}</div>
                <div class="cmdk-sub">${esc(r.detail || '')}</div>
              </div>
              <span class="cmdk-kind">${esc(r.kind)}</span>
            </div>`;
          }).join('');
      }).join('');
    };

    input.addEventListener('input', () => {
      const q = input.value.trim();
      clearTimeout(searchTimer);
      if (q.length < 2) {
        currentResults = []; selectedIdx = -1;
        results.innerHTML = '<div class="cmdk-empty">Type to search across your CRM records.</div>';
        return;
      }
      searchTimer = setTimeout(async () => {
        const data = await api('/crm/api/search?q=' + encodeURIComponent(q));
        currentResults = (data && Array.isArray(data.hits)) ? data.hits : [];
        selectedIdx = currentResults.length ? 0 : -1;
        renderResults();
      }, 180);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { window.closeCommandPalette(); return; }
      if (e.key === 'ArrowDown' && currentResults.length) {
        e.preventDefault();
        selectedIdx = (selectedIdx + 1) % currentResults.length;
        renderResults();
      }
      if (e.key === 'ArrowUp' && currentResults.length) {
        e.preventDefault();
        selectedIdx = (selectedIdx - 1 + currentResults.length) % currentResults.length;
        renderResults();
      }
      if (e.key === 'Enter' && selectedIdx >= 0) {
        e.preventDefault();
        window.__cmdkOpen(selectedIdx);
      }
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeCommandPalette(); });

    window.__cmdkOpen = (idx) => {
      const r = currentResults[idx];
      if (!r) return;
      window.closeCommandPalette();
      if (typeof window.openRecord === 'function') window.openRecord(r.kind, r.id);
    };

    setTimeout(() => input.focus(), 50);
  };
  window.closeCommandPalette = function () {
    const el = document.getElementById('cmdkOverlay');
    if (el) el.remove();
  };

  // Global ⌘K / Ctrl+K keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      window.openCommandPalette();
    }
    if (e.key === 'Escape' && document.getElementById('cmdkOverlay')) {
      window.closeCommandPalette();
    }
  });

  // ============================================================
  // FEATURE C — DARK MODE
  // ============================================================
  window.toggleDarkMode = function () {
    const html = document.documentElement;
    const cur = html.getAttribute('data-theme') || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    try { localStorage.setItem('afri.theme', next); } catch {}
  };
  // Apply saved theme on load (called from crm.html boot)
  window.applySavedTheme = function () {
    let saved = 'light';
    try { saved = localStorage.getItem('afri.theme') || 'light'; } catch {}
    document.documentElement.setAttribute('data-theme', saved);
  };

  // ============================================================
  // FEATURE G — INLINE EDITING
  // Click on a deal-name or contact-name to edit inline.
  // On Enter/blur, saves via PATCH /crm/api/{type}/:id.
  // On Escape, cancels.
  // ============================================================
  window.editInline = function (el, type, id, field, label) {
    const currentValue = el.textContent.trim();
    const input = document.createElement('input');
    input.value = currentValue;
    input.className = 'inline-edit-input';
    input.placeholder = label || field;
    el.replaceWith(input);
    input.focus();
    input.select();
    let done = false;
    const finish = async (save) => {
      if (done) return;
      done = true;
      const newValue = input.value.trim();
      if (!save || newValue === currentValue || !newValue) {
        input.replaceWith(el);
        if (save && !newValue) el.textContent = currentValue;
        return;
      }
      const result = await api(`/crm/api/${type}/${id}`, { method: 'PATCH', body: JSON.stringify({ [field]: newValue }) });
      if (result && !result.error) {
        el.textContent = newValue;
        input.replaceWith(el);
        toast('Saved');
      } else {
        input.replaceWith(el);
        el.textContent = currentValue;
        toast('Could not save');
      }
    };
    input.addEventListener('blur', () => finish(true));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
  };

  // ============================================================
  // FEATURE F — CSV IMPORT
  // Opens a modal with a file drop zone. Parses CSV client-side
  // (simple RFC 4180 parser, no library). Shows a preview of
  // the first 5 rows. On "Import", POSTs all rows to
  // /crm/api/import/contacts. Shows success/skip count.
  // ============================================================
  window.parseCsv = function (text) {
    const rows = [];
    let i = 0, field = '', row = [], inQuotes = false;
    while (i < text.length) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') { field += '"'; i += 2; continue; }
        if (c === '"') { inQuotes = false; i++; continue; }
        field += c; i++; continue;
      }
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return { headers: [], rows: [] };
    const headers = rows[0].map((h) => String(h || '').trim());
    const dataRows = rows.slice(1).filter((r) => r.some((c) => String(c || '').trim())).map((r) => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = String(r[idx] || '').trim(); });
      return obj;
    });
    return { headers, rows: dataRows };
  };

  window.openImportContactsCsv = function () {
    if (document.getElementById('importOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'importOverlay';
    overlay.className = 'import-overlay';
    overlay.innerHTML = `
      <div class="import-card">
        <div class="import-head">
          <h2>Import contacts from CSV</h2>
          <button type="button" class="ghost" onclick="window.closeImportCsv()">Close</button>
        </div>
        <div class="import-body">
          <label class="import-drop" id="importDrop">
            <div class="ico">📥</div>
            <div><b>Click to choose</b> or drag a .csv file here</div>
            <div style="font-size:12px;margin-top:6px;color:#94a3b8">Columns we read: firstName, lastName, email, phone, title, city, source, status</div>
            <input type="file" accept=".csv,text/csv" id="importFile">
          </label>
          <div id="importStatus"></div>
          <div id="importPreview"></div>
        </div>
        <div class="import-foot">
          <button type="button" class="ghost" onclick="window.closeImportCsv()">Cancel</button>
          <button type="button" class="primary" id="importSubmit" disabled onclick="window.doImportContacts()">Import</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const drop = document.getElementById('importDrop');
    const file = document.getElementById('importFile');

    const handleFile = (f) => {
      if (!f) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = String(e.target.result || '');
        const parsed = window.parseCsv(text);
        window.__importRows = parsed.rows;
        const status = document.getElementById('importStatus');
        const preview = document.getElementById('importPreview');
        const submit = document.getElementById('importSubmit');
        if (!window.__importRows.length) {
          status.className = 'import-status err';
          status.textContent = 'No rows found in the CSV.';
          preview.innerHTML = '';
          submit.disabled = true;
          return;
        }
        status.className = 'import-status ok';
        status.textContent = `Parsed ${window.__importRows.length} row${window.__importRows.length === 1 ? '' : 's'} from "${f.name}". Review the preview below.`;
        const previewRows = window.__importRows.slice(0, 5);
        const headers = parsed.headers.filter((h) => h);
        preview.innerHTML = `<div class="import-preview"><table><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>${previewRows.map((r) => `<tr>${headers.map((h) => `<td>${esc(r[h] || '')}</td>`).join('')}</tr>`).join('')}</table></div>${window.__importRows.length > 5 ? `<div style="font-size:11px;color:#94a3b8;padding:6px 0">Showing first 5 of ${window.__importRows.length} rows.</div>` : ''}`;
        submit.disabled = false;
      };
      reader.readAsText(f);
    };

    file.addEventListener('change', (e) => handleFile(e.target.files[0]));

    ['dragenter', 'dragover'].forEach((ev) => {
      drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach((ev) => {
      drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('dragover'); });
    });
    drop.addEventListener('drop', (e) => {
      const f = e.dataTransfer.files[0];
      handleFile(f);
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeImportCsv(); });
  };
  window.closeImportCsv = function () {
    const el = document.getElementById('importOverlay');
    if (el) el.remove();
    window.__importRows = [];
  };
  window.doImportContacts = async function () {
    const rows = window.__importRows || [];
    if (!rows.length) return;
    const submit = document.getElementById('importSubmit');
    const status = document.getElementById('importStatus');
    submit.disabled = true; submit.textContent = 'Importing...';
    const result = await api('/crm/api/import/contacts', { method: 'POST', body: JSON.stringify({ rows }) });
    if (!result || result.error) {
      status.className = 'import-status err';
      status.textContent = (result && result.error) || 'Import failed';
      submit.disabled = false; submit.textContent = 'Import';
      return;
    }
    status.className = 'import-status ok';
    status.textContent = `Imported ${result.imported} of ${result.total} row${result.total === 1 ? '' : 's'}. Skipped ${result.skipped} (duplicates or invalid).`;
    submit.textContent = 'Done';
    window.__importRows = [];
    setTimeout(() => { window.closeImportCsv(); if (typeof refresh === 'function') refresh(); }, 1500);
  };

  // Init import rows store
  if (!window.__importRows) window.__importRows = [];

  // ============================================================
  // FEATURE C — DARK MODE TOGGLE
  // ============================================================
  window.initTheme = function () {
    const saved = localStorage.getItem('afri.theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  };
  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('afri.theme', next);
  };
  // Apply theme ASAP (called inline in <head> via script)
  if (typeof window !== 'undefined') window.initTheme();

  // ============================================================
  // FEATURE B — COMMAND PALETTE (Cmd+K)
  // ============================================================
  window.openCommandPalette = function () {
    if (document.getElementById('cmdkOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'cmdkOverlay';
    overlay.className = 'cmdk-overlay';
    overlay.innerHTML = `
      <div class="cmdk-card" role="dialog" aria-label="Command palette">
        <div class="cmdk-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" id="cmdkInput" placeholder="Search deals, contacts, companies, leads..." autocomplete="off">
          <kbd>ESC</kbd>
        </div>
        <div class="cmdk-results" id="cmdkResults"></div>
        <div class="cmdk-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeCommandPalette(); });
    document.body.appendChild(overlay);
    const input = document.getElementById('cmdkInput');
    let selected = 0;
    let results = [];
    function search(q) {
      q = q.trim().toLowerCase();
      if (!q) { results = []; render(); return; }
      const matches = (label, sub) => (label + ' ' + (sub || '')).toLowerCase().includes(q);
      const deals = (bag.deals || []).filter((r) => matches(r.name, money(r.amount))).slice(0, 5).map((r) => ({ kind: 'deal', id: r.id, label: r.name, sub: money(r.amount) + ' · ' + (stageOf(r) || ''), grad: avatarGradient(r.name), open: () => openRecord('deal', r.id) }));
      const contacts = (bag.contacts || []).filter((r) => matches(person(r), r.email)).slice(0, 5).map((r) => ({ kind: 'contact', id: r.id, label: person(r), sub: r.email || companyName(r.companyId) || 'No email', grad: avatarGradient(person(r)), open: () => openRecord('contact', r.id) }));
      const companies = (bag.companies || []).filter((r) => matches(r.name, r.industry)).slice(0, 5).map((r) => ({ kind: 'company', id: r.id, label: r.name, sub: r.industry || 'Account', grad: avatarGradient(r.name), open: () => openRecord('company', r.id) }));
      const leads = (bag.leads || []).filter((r) => matches(person(r), r.companyName)).slice(0, 5).map((r) => ({ kind: 'lead', id: r.id, label: person(r), sub: r.companyName || r.source || 'Lead', grad: avatarGradient(person(r)), open: () => openRecord('lead', r.id) }));
      const navItems = [
        { kind: 'page', id: 'home', label: 'Today', sub: 'Dashboard', grad: avatarGradient('Today'), open: () => go('home') },
        { kind: 'page', id: 'deals', label: 'Deals', sub: 'Pipeline board', grad: avatarGradient('Deals'), open: () => go('deals') },
        { kind: 'page', id: 'contacts', label: 'Contacts', sub: 'All people', grad: avatarGradient('Contacts'), open: () => go('contacts') },
        { kind: 'page', id: 'companies', label: 'Companies', sub: 'All accounts', grad: avatarGradient('Companies'), open: () => go('companies') },
        { kind: 'page', id: 'forecast', label: 'Forecast', sub: 'Sales analytics', grad: avatarGradient('Forecast'), open: () => go('forecast') },
        { kind: 'page', id: 'dial', label: 'Call list', sub: 'Work the list', grad: avatarGradient('Call'), open: () => go('dial') },
      ].filter((n) => matches(n.label, n.sub)).slice(0, 3);
      results = [...navItems, ...deals, ...contacts, ...companies, ...leads].slice(0, 12);
      selected = 0;
      render();
    }
    function render() {
      if (!results.length) {
        document.getElementById('cmdkResults').innerHTML = '<div class="cmdk-empty">No matches. Try a different search.</div>';
        return;
      }
      const groups = {};
      results.forEach((r, i) => { (groups[r.kind] = groups[r.kind] || []).push({ ...r, idx: i }); });
      const html = Object.keys(groups).map((kind) => {
        const label = kind.charAt(0).toUpperCase() + kind.slice(1) + (kind === 'page' ? 's' : 's');
        return `<div class="cmdk-group"><div class="cmdk-group-label">${label}</div>` +
          groups[kind].map((r) => `
            <div class="cmdk-item ${r.idx === selected ? 'on' : ''}" data-idx="${r.idx}" onclick="window.__cmdkPick(${r.idx})">
              <div class="cmdk-ico" style="--avatar-bg:${r.grad}">${esc((r.label || '?').slice(0, 2).toUpperCase())}</div>
              <div class="cmdk-label"><b>${esc(r.label)}</b><span>${esc(r.sub || '')}</span></div>
              <span class="cmdk-kind">${esc(r.kind)}</span>
            </div>`).join('') + '</div>';
      }).join('');
      document.getElementById('cmdkResults').innerHTML = html;
    }
    window.__cmdkPick = (idx) => {
      const r = results[idx];
      if (!r) return;
      window.closeCommandPalette();
      r.open();
    };
    input.addEventListener('input', () => search(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); selected = Math.min(results.length - 1, selected + 1); render(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); selected = Math.max(0, selected - 1); render(); }
      else if (e.key === 'Enter') { e.preventDefault(); window.__cmdkPick(selected); }
      else if (e.key === 'Escape') { window.closeCommandPalette(); }
    });
    setTimeout(() => input.focus(), 50);
  };
  window.closeCommandPalette = function () {
    const el = document.getElementById('cmdkOverlay');
    if (el) el.remove();
  };
  // Keyboard shortcut: Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      window.openCommandPalette();
    } else if (e.key === 'Escape' && document.getElementById('cmdkOverlay')) {
      window.closeCommandPalette();
    }
  });

  // ============================================================
  // FEATURE F — CSV IMPORT
  // ============================================================
  window.openCsvImport = function () {
    if (document.getElementById('csvOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'csvOverlay';
    overlay.className = 'csv-overlay';
    overlay.innerHTML = `
      <div class="csv-card" role="dialog" aria-label="Import CSV">
        <div class="csv-head">
          <h2>Import contacts from CSV</h2>
          <button type="button" class="ghost" onclick="window.closeCsvImport()">Close</button>
        </div>
        <div class="csv-body" id="csvBody">
          <label class="csv-drop" id="csvDrop">
            <div class="drop-ico">📄</div>
            <p>Click to choose a CSV file, or drag one here</p>
            <p style="font-size:11px;color:#94a3b8;margin-top:6px">Expected columns: First name, Last name, Email, Phone, Company</p>
            <input type="file" id="csvFile" accept=".csv,text/csv">
          </label>
          <div id="csvPreview"></div>
        </div>
        <div class="csv-foot" id="csvFoot" style="display:none">
          <span class="csv-progress" id="csvProgress"></span>
          <span><button type="button" class="ghost" onclick="window.closeCsvImport()">Cancel</button> <button type="button" class="primary" id="csvImportBtn" onclick="window.__csvRunImport()">Import</button></span>
        </div>
      </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeCsvImport(); });
    document.body.appendChild(overlay);
    const drop = document.getElementById('csvDrop');
    const fileInput = document.getElementById('csvFile');
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) window.__csvHandleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', () => { if (fileInput.files[0]) window.__csvHandleFile(fileInput.files[0]); });
  };
  window.closeCsvImport = function () {
    const el = document.getElementById('csvOverlay');
    if (el) el.remove();
  };
  window.__csvHandleFile = function (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = window.__parseCsv(text);
      window.__importRows = rows;
      const preview = document.getElementById('csvPreview');
      if (!rows.length) { preview.innerHTML = '<p style="color:#b91c1c;padding:8px">No rows found in the CSV. Make sure it has a header row.</p>'; return; }
      const headers = Object.keys(rows[0]);
      const head = headers.map((h) => `<th>${esc(h)}</th>`).join('');
      const body = rows.slice(0, 5).map((r) => '<tr>' + headers.map((h) => `<td>${esc(r[h] || '')}</td>`).join('') + '</tr>').join('');
      preview.innerHTML = `
        <p style="font-size:13px;color:#475569;margin:0 0 8px">Found <b>${rows.length}</b> rows. First 5 shown below.</p>
        <div class="csv-preview"><table><tr>${head}</tr>${body}</table></div>
        <div class="csv-map" id="csvMap"></div>`;
      // Build column mapping
      const map = document.getElementById('csvMap');
      const fields = [
        { key: 'firstName', label: 'First name' },
        { key: 'lastName', label: 'Last name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'companyName', label: 'Company name' },
      ];
      map.innerHTML = '<p style="font-size:13px;color:#475569;margin:0 0 8px">Map CSV columns to contact fields:</p>' + fields.map((f) => {
        const guess = headers.find((h) => h.toLowerCase().includes(f.key.toLowerCase()) || (f.key === 'firstName' && h.toLowerCase().includes('first')) || (f.key === 'lastName' && h.toLowerCase().includes('last')) || (f.key === 'companyName' && h.toLowerCase().includes('company')));
        return `<div class="csv-map-row"><span>${esc(f.label)}</span><span class="arrow">←</span><select data-field="${f.key}"><option value="">(skip)</option>${headers.map((h) => `<option value="${esc(h)}" ${guess === h ? 'selected' : ''}>${esc(h)}</option>`).join('')}</select></div>`;
      }).join('');
      document.getElementById('csvFoot').style.display = 'flex';
      document.getElementById('csvProgress').textContent = `Ready to import ${rows.length} contacts`;
    };
    reader.readAsText(file);
  };
  window.__parseCsv = function (text) {
    const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim());
    if (!lines.length) return [];
    const headers = window.__csvSplitLine(lines[0]);
    return lines.slice(1).map((line) => {
      const cells = window.__csvSplitLine(line);
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (cells[i] || '').trim(); });
      return obj;
    });
  };
  window.__csvSplitLine = function (line) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = !inQuotes; }
      else if (c === ',' && !inQuotes) { out.push(cur); cur = ''; }
      else cur += c;
    }
    out.push(cur);
    return out;
  };
  window.__csvRunImport = async function () {
    const rows = window.__importRows || [];
    if (!rows.length) return;
    const selects = document.querySelectorAll('#csvMap select');
    const mapping = {};
    selects.forEach((s) => { if (s.value) mapping[s.dataset.field] = s.value; });
    const btn = document.getElementById('csvImportBtn');
    const prog = document.getElementById('csvProgress');
    btn.disabled = true;
    let ok = 0, fail = 0;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const payload = {};
      Object.keys(mapping).forEach((field) => { payload[field] = r[mapping[field]] || ''; });
      prog.innerHTML = `Importing <b>${i + 1}/${rows.length}</b>...`;
      try {
        const res = await api('/crm/api/contacts', { method: 'POST', body: JSON.stringify(payload) });
        if (res && !res.error) ok++; else fail++;
      } catch { fail++; }
    }
    prog.innerHTML = `<b>${ok}</b> imported${fail ? `, <b>${fail}</b> failed` : ''}.`;
    btn.textContent = 'Done';
    btn.disabled = false;
    btn.onclick = () => { window.closeCsvImport(); refresh(); };
    toast(`Imported ${ok} contact${ok === 1 ? '' : 's'}`);
  };

  // ============================================================
  // FEATURE E — SALES FORECAST DASHBOARD (analytics page)
  // Separate from the existing drawForecast (which is monthly
  // target tracking). This is a richer analytics dashboard with
  // pipeline value, weighted forecast, win rate, by-stage and
  // by-owner bar charts. Accessible via 'Analytics' header button.
  // ============================================================
  window.drawSalesAnalytics = function () {
    const deals = bag.deals || [];
    const won = deals.filter((r) => String(r.stage || '').startsWith('CLOSED_WON'));
    const lost = deals.filter((r) => String(r.stage || '').startsWith('CLOSED_LOST'));
    const open = deals.filter((r) => !String(r.stage || '').startsWith('CLOSED'));
    const pipelineValue = open.reduce((s, r) => s + Number(r.amount || 0), 0);
    const weighted = open.reduce((s, r) => s + Number(r.amount || 0) * (Number(r.probability || 50) / 100), 0);
    const wonValue = won.reduce((s, r) => s + Number(r.amount || 0), 0);
    const lostValue = lost.reduce((s, r) => s + Number(r.amount || 0), 0);
    const winRate = (won.length + lost.length) > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) : 0;
    const avgDeal = open.length ? Math.round(pipelineValue / open.length) : 0;
    // By stage
    const stages = stageList();
    const byStage = stages.map(([id, label, color, chance]) => {
      const list = open.filter((r) => stageOf(r) === id);
      const value = list.reduce((s, r) => s + Number(r.amount || 0), 0);
      return { label, value, count: list.length, color };
    });
    const maxStageValue = Math.max(1, ...byStage.map((s) => s.value));
    // By owner
    const owners = (bag.people || []).slice();
    if (!owners.some((p) => p.id === 'unassigned')) owners.push({ id: 'unassigned', fullName: 'Unassigned' });
    const byOwner = owners.map((p) => {
      const list = open.filter((r) => (r.ownerId || 'unassigned') === p.id);
      const value = list.reduce((s, r) => s + Number(r.amount || 0), 0);
      return { label: p.fullName || p.email || 'Unassigned', value, count: list.length };
    }).filter((o) => o.count > 0);
    const maxOwnerValue = Math.max(1, ...byOwner.map((o) => o.value));

    const stageBars = byStage.map((s) => `
      <div class="forecast-bar-row">
        <span class="bar-label">${esc(s.label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, (s.value / maxStageValue) * 100)}%; background: linear-gradient(90deg, ${s.color}, ${s.color}dd)"></div></div>
        <span class="bar-value">${money(s.value)}</span>
      </div>`).join('') || '<p class="hello">No stages yet.</p>';

    const ownerBars = byOwner.map((o) => `
      <div class="forecast-bar-row">
        <span class="bar-label">${esc(o.label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, (o.value / maxOwnerValue) * 100)}%"></div></div>
        <span class="bar-value">${money(o.value)}</span>
      </div>`).join('') || '<p class="hello">No owners assigned yet.</p>';

    document.getElementById('view').innerHTML = `
      <div class="board-head"><div><h1>Forecast</h1><p class="hello">Sales analytics from your open pipeline. Numbers are from real deals — no samples.</p></div><button type="button" class="ghost" onclick="refresh()">Refresh</button></div>
      <div class="forecast-stats">
        <div class="forecast-stat accent"><div class="label">Pipeline value</div><div class="value">${money(pipelineValue)}</div><div class="sub">${open.length} open deal${open.length === 1 ? '' : 's'}</div></div>
        <div class="forecast-stat"><div class="label">Weighted forecast</div><div class="value">${money(weighted)}</div><div class="sub">Probability-adjusted</div></div>
        <div class="forecast-stat"><div class="label">Won this period</div><div class="value">${money(wonValue)}</div><div class="sub">${won.length} deal${won.length === 1 ? '' : 's'} won</div></div>
        <div class="forecast-stat"><div class="label">Win rate</div><div class="value">${winRate}%</div><div class="sub">${won.length} won · ${lost.length} lost</div></div>
      </div>
      <div class="forecast-charts">
        <div class="forecast-chart"><h2>Pipeline by stage</h2>${stageBars}</div>
        <div class="forecast-chart"><h2>Pipeline by owner</h2>${ownerBars}</div>
      </div>
      <div class="forecast-charts" style="margin-top:16px">
        <div class="forecast-chart"><h2>Average deal size</h2><div class="forecast-bar-row"><span class="bar-label">Open avg</span><div class="bar-track"><div class="bar-fill" style="width:80%"></div></div><span class="bar-value">${money(avgDeal)}</span></div></div>
        <div class="forecast-chart"><h2>Lost value</h2><div class="forecast-bar-row"><span class="bar-label">Total lost</span><div class="bar-track"><div class="bar-fill danger" style="width:${Math.min(100, (lostValue / Math.max(1, wonValue + lostValue)) * 100) || 0}%"></div></div><span class="bar-value">${money(lostValue)}</span></div></div>
      </div>`;
  };

  // ============================================================
  // FEATURE A + G — DRAG-AND-DROP + INLINE EDITING for deals
  // Attach handlers after drawDeals renders. We hook into the
  // existing draw flow by re-wrapping drawDeals.
  // ============================================================
  const baseDrawDeals = (typeof drawDeals === 'function') ? drawDeals : null;
  if (baseDrawDeals) {
    drawDeals = function () {
      baseDrawDeals();
      // Attach DnD + inline edit after a tick (let innerHTML settle)
      setTimeout(() => {
        // DRAG-AND-DROP: make cards draggable, columns drop targets
        document.querySelectorAll('.dealcard').forEach((card) => {
          if (card.getAttribute('data-dnd') === '1') return;
          card.setAttribute('data-dnd', '1');
          card.setAttribute('draggable', 'true');
          card.addEventListener('dragstart', (e) => {
            card.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.getAttribute('onclick').match(/'([^']+)'/)[1]);
          });
          card.addEventListener('dragend', () => card.classList.remove('dragging'));
        });
        document.querySelectorAll('.dealboard .col').forEach((col) => {
          if (col.getAttribute('data-dndcol') === '1') return;
          col.setAttribute('data-dndcol', '1');
          col.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; col.classList.add('drop-target'); });
          col.addEventListener('dragleave', () => col.classList.remove('drop-target'));
          col.addEventListener('drop', (e) => {
            e.preventDefault();
            col.classList.remove('drop-target');
            const dealId = e.dataTransfer.getData('text/plain');
            // Find the stage id from the column's first stagepill text or data attribute
            const stagePill = col.querySelector('.stagepill');
            const stageLabel = stagePill ? stagePill.textContent.trim().split(' ')[0] : '';
            const stageEntry = stageList().find((s) => String(s[1]).toLowerCase() === stageLabel.toLowerCase()) || stageList().find((s) => s[0] === col.dataset.stageId);
            if (stageEntry && dealId) move(dealId, stageEntry[0]);
          });
        });
        // INLINE EDITING: make deal names editable
        document.querySelectorAll('.dealcard .deal-name').forEach((nameEl) => {
          if (nameEl.getAttribute('data-edit') === '1') return;
          nameEl.setAttribute('data-edit', '1');
          nameEl.setAttribute('title', 'Click to edit');
          nameEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (nameEl.getAttribute('contenteditable') === 'true') return;
            nameEl.setAttribute('contenteditable', 'true');
            nameEl.focus();
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(nameEl);
            const sel = window.getSelection();
            sel.removeAllRanges(); sel.addRange(range);
          });
          nameEl.addEventListener('blur', () => window.__saveDealName(nameEl));
          nameEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); }
            else if (e.key === 'Escape') { nameEl.removeAttribute('contenteditable'); nameEl.blur(); }
          });
        });
      }, 50);
    };
  }
  window.__saveDealName = async function (nameEl) {
    const card = nameEl.closest('.dealcard');
    if (!card) return;
    const onclickAttr = card.getAttribute('onclick') || '';
    const match = onclickAttr.match(/openRecord\('deal','([^']+)'\)/);
    const dealId = match ? match[1] : '';
    const newName = nameEl.textContent.trim();
    nameEl.removeAttribute('contenteditable');
    if (!dealId || !newName) return;
    // Find the deal to compare
    const deal = (bag.deals || []).find((r) => r.id === dealId);
    if (deal && deal.name === newName) return; // no change
    nameEl.classList.add('saving');
    const res = await api('/crm/api/deals/' + dealId, { method: 'PATCH', body: JSON.stringify({ name: newName }) });
    nameEl.classList.remove('saving');
    if (res && !res.error) {
      nameEl.classList.add('saved');
      setTimeout(() => nameEl.classList.remove('saved'), 1500);
      if (deal) deal.name = newName;
    } else {
      toast((res && res.error) || 'Could not save');
    }
  };

  // ============================================================
  // PERFORMANCE + UX ENHANCEMENTS — JS hooks
  // - Top loading bar (shows on every draw() call)
  // - Ripple effect on primary button clicks
  // - Keyboard shortcuts (G+letter for navigation, ? for help)
  // - Prefetch on sidebar hover (call API before click)
  // - Debounce search input (was triggering on every keystroke)
  // ============================================================

  // --- Top loading bar ---
  window.__startProgress = function () {
    let bar = document.getElementById('navProgress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'navProgress';
      bar.className = 'nav-progress';
      document.body.appendChild(bar);
    }
    bar.className = 'nav-progress';
    bar.offsetWidth; // force reflow
    bar.classList.add('loading');
    setTimeout(() => { if (bar.classList.contains('loading')) bar.classList.add('loading-70'); }, 200);
  };
  window.__doneProgress = function () {
    const bar = document.getElementById('navProgress');
    if (!bar) return;
    bar.classList.remove('loading', 'loading-70');
    bar.classList.add('done');
    setTimeout(() => { bar.className = 'nav-progress'; }, 600);
  };

  // Wrap the existing draw() so the loading bar fires on every navigation
  if (typeof draw === 'function' && !draw.__wrapped) {
    const origDraw = (typeof draw === 'function') ? draw : function(){};
    draw = function () {
      window.__startProgress();
      const result = origDraw.apply(this, arguments);
      if (result && typeof result.then === 'function') {
        result.then(() => window.__doneProgress()).catch(() => window.__doneProgress());
      } else {
        setTimeout(window.__doneProgress, 100);
      }
      return result;
    };
    draw.__wrapped = true;
  }

  // --- Ripple effect on primary buttons ---
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('button:not(.iconbtn):not(.theme-toggle):not(.ghost):not(.mini):not(.action-btn):not(.addslot), .cmdk-item, .wizard-choice');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.classList.add('ripple-container');
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });

  // --- Keyboard shortcuts ---
  // G then letter = go to page. ? = show shortcuts help. Esc closes overlays.
  let __gPressed = false;
  let __gTimer = null;
  const SHORTCUTS = [
    { keys: ['g', 'h'], label: 'Go to Home / Today', action: () => go('home') },
    { keys: ['g', 'd'], label: 'Go to Deals', action: () => go('deals') },
    { keys: ['g', 'c'], label: 'Go to Contacts', action: () => go('contacts') },
    { keys: ['g', 'o'], label: 'Go to Companies', action: () => go('companies') },
    { keys: ['g', 'l'], label: 'Go to Leads', action: () => go('leads') },
    { keys: ['g', 't'], label: 'Go to Tasks', action: () => go('tasks') },
    { keys: ['g', 'a'], label: 'Go to Analytics', action: () => go('analytics') },
    { keys: ['g', 'p'], label: 'Go to Pipeline', action: () => go('pipeline') },
    { keys: ['g', 'f'], label: 'Go to Forecast', action: () => go('forecast') },
    { keys: ['g', 'i'], label: 'Go to Inbox', action: () => go('comm') },
    { keys: ['k'], label: 'Open command palette', action: () => window.openCommandPalette() },
    { keys: ['?'], label: 'Show this help', action: () => window.openShortcutsHelp() },
    { keys: ['/'], label: 'Focus search', action: () => { const q = document.getElementById('q'); if (q) q.focus(); } },
    { keys: ['n', 'd'], label: 'New deal', action: () => { dealPrefill = ''; openForm = 'deal'; go('deals'); } },
    { keys: ['n', 'c'], label: 'New contact', action: () => { openForm = 'contact'; go('contacts'); } },
  ];
  let __nPressed = false;
  let __nTimer = null;
  document.addEventListener('keydown', function (e) {
    // Skip if user is typing in an input/textarea/contenteditable
    const tag = e.target.tagName.toLowerCase();
    const editable = e.target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
    if (editable) {
      if (e.key === 'Escape' && e.target.blur) e.target.blur();
      return;
    }
    // Skip if a modal is open (cmd palette, wizard, etc.) — those have their own key handling
    if (document.getElementById('cmdkOverlay') || document.getElementById('wizardOverlay') || document.getElementById('csvOverlay') || document.getElementById('shortcutsOverlay')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return; // don't interfere with browser shortcuts

    const key = e.key.toLowerCase();
    if (__gPressed) {
      const sc = SHORTCUTS.find((s) => s.keys.length === 2 && s.keys[0] === 'g' && s.keys[1] === key);
      if (sc) { e.preventDefault(); sc.action(); }
      __gPressed = false; clearTimeout(__gTimer);
      return;
    }
    if (__nPressed) {
      const sc = SHORTCUTS.find((s) => s.keys.length === 2 && s.keys[0] === 'n' && s.keys[1] === key);
      if (sc) { e.preventDefault(); sc.action(); }
      __nPressed = false; clearTimeout(__nTimer);
      return;
    }
    if (key === 'g') { __gPressed = true; __gTimer = setTimeout(() => { __gPressed = false; }, 800); e.preventDefault(); return; }
    if (key === 'n') { __nPressed = true; __nTimer = setTimeout(() => { __nPressed = false; }, 800); e.preventDefault(); return; }
    const sc = SHORTCUTS.find((s) => s.keys.length === 1 && s.keys[0] === key);
    if (sc) { e.preventDefault(); sc.action(); }
  });
  window.openShortcutsHelp = function () {
    if (document.getElementById('shortcutsOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'shortcutsOverlay';
    overlay.className = 'shortcuts-overlay';
    const rows = SHORTCUTS.map((s) => {
      const keys = s.keys.map((k) => `<kbd class="shortcut">${esc(k)}</kbd>`).join('<span style="color:#cbd5e1">+</span>');
      return `<div class="shortcut-row"><span class="label">${esc(s.label)}</span><span class="keys">${keys}</span></div>`;
    }).join('');
    overlay.innerHTML = `
      <div class="shortcuts-card">
        <div class="shortcuts-head"><h2>Keyboard shortcuts</h2><button type="button" class="ghost" onclick="window.closeShortcutsHelp()">Close</button></div>
        <div class="shortcuts-body">${rows}</div>
      </div>`;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) window.closeShortcutsHelp(); });
    document.body.appendChild(overlay);
  };
  window.closeShortcutsHelp = function () {
    const el = document.getElementById('shortcutsOverlay');
    if (el) el.remove();
  };

  // --- Prefetch on sidebar hover ---
  // When user hovers a sidebar button, pre-fetch that page's data
  // (we just call the API once and cache it in window.__prefetched)
  if (!window.__prefetched) window.__prefetched = {};
  document.addEventListener('mouseover', function (e) {
    const btn = e.target.closest('aside button[onclick*="go("]');
    if (!btn) return;
    const match = btn.getAttribute('onclick').match(/go\('([^']+)'/);
    if (!match) return;
    const page = match[1];
    if (window.__prefetched[page]) return; // already prefetched
    // Find the API endpoint for this page (best-effort)
    const endpoints = {
      home: '/crm/api/home',
      deals: '/crm/api/deals',
      contacts: '/crm/api/contacts',
      companies: '/crm/api/companies',
      leads: '/crm/api/leads',
      tasks: '/crm/api/activities?type=TASK',
      opportunities: '/crm/api/deals?stage=open',
      analytics: '/crm/api/home',
      pipeline: '/crm/api/deals',
      forecast: '/crm/api/target',
      comm: '/crm/api/tickets',
      dial: '/crm/api/contacts?phone=1',
    };
    const endpoint = endpoints[page];
    if (!endpoint) return;
    btn.setAttribute('data-prefetch', '1');
    // Pre-fetch with a short delay so we don't fire on quick mouse-overs
    setTimeout(() => {
      if (!btn.matches(':hover')) return;
      fetch(endpoint, { headers: { 'Authorization': 'Bearer ' + (token || '') } })
        .then((r) => r.json())
        .then((data) => { window.__prefetched[page] = data; })
        .catch(() => {}); // silent fail — prefetch is best-effort
    }, 200);
  });

  // --- Debounce search input ---
  // The existing #q input triggers queueDraw() on every keystroke.
  // Wrap queueDraw so it debounces (only fires after 200ms of no typing).
  if (typeof queueDraw === 'function' && !queueDraw.__debounced) {
    const origQueueDraw = (typeof queueDraw === 'function') ? queueDraw : function(){};
    let __searchTimer = null;
    queueDraw = function () {
      clearTimeout(__searchTimer);
      __searchTimer = setTimeout(() => origQueueDraw.apply(this, arguments), 200);
    };
    queueDraw.__debounced = true;
  }


  // ============================================================
  // PHASE 5: SETTINGS PAGE + USER MANAGEMENT
  // ============================================================
  style.textContent += `
    .settings-layout { display: grid; grid-template-columns: 200px 1fr; gap: 20px; }
    @media (max-width: 680px) { .settings-layout { grid-template-columns: 1fr; } }
    .settings-nav { display: flex; flex-direction: column; gap: 2px; }
    .settings-nav button { display: block; width: 100%; text-align: left; padding: 10px 14px; border: 0; background: transparent; color: #64748b; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: background 0.08s, color 0.08s; }
    .settings-nav button:hover { background: #f1f0ec; color: #0f172a; }
    .settings-nav button.on { background: #f1f0ec; color: #0f172a; font-weight: 600; }
    .settings-content { min-height: 400px; }
    .settings-section { margin-bottom: 20px; }
    .settings-section h3 { font-size: 14px; font-weight: 600; color: #475569; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.05em; }
    .settings-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
    @media (max-width: 680px) { .settings-row { grid-template-columns: 1fr; } }
    .settings-row label { display: grid; gap: 4px; font-size: 13px; font-weight: 500; color: #475569; }
    .user-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .user-row:last-child { border-bottom: 0; }
    .user-row .avatar { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0; }
    .user-row .info { flex: 1; min-width: 0; }
    .user-row .info b { font-size: 14px; color: #0f172a; display: block; }
    .user-row .info span { font-size: 12px; color: #64748b; }
    .user-row .role-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .user-row .role-badge.OWNER { background: #fef3c7; color: #92400e; }
    .user-row .role-badge.ADMIN { background: #dbeafe; color: #1e40af; }
    .user-row .role-badge.MANAGER { background: #e0e7ff; color: #3730a3; }
    .user-row .role-badge.SALES { background: #d1fae5; color: #065f46; }
    .user-row .role-badge.VIEWER { background: #f1f5f9; color: #475569; }
    .user-row .status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .user-row .status-dot.active { background: #22c55e; }
    .user-row .status-dot.inactive { background: #cbd5e1; }
    .temp-password { background: #f0fdfa; border: 1px dashed #99f6e4; border-radius: 8px; padding: 12px 14px; margin: 10px 0; }
    .temp-password b { color: #0d9488; font-size: 16px; letter-spacing: 0.05em; }
    .session-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .integration-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
    .integration-row .ico { width: 36px; height: 36px; border-radius: 10px; background: #f1f0ec; display: grid; place-items: center; font-size: 18px; flex-shrink: 0; }
    .integration-row .info b { font-size: 14px; color: #0f172a; }
    .integration-row .info span { font-size: 12px; color: #64748b; display: block; }
    .integration-row .status-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .integration-row .status-badge.connected { background: #dcfce7; color: #166534; }
    .integration-row .status-badge.disconnected { background: #f1f5f9; color: #64748b; }
  `;
  if (!window.__settingsTab) window.__settingsTab = 'workspace';
  window.drawSettings = function () {
    const tab = window.__settingsTab || 'workspace';
    const tabs = [{id:'workspace',label:'Workspace'},{id:'team',label:'Team'},{id:'sessions',label:'Sessions'},{id:'integrations',label:'Integrations'},{id:'preferences',label:'Preferences'}];
    const navHtml = tabs.map(function(t) { return '<button class="' + (tab === t.id ? 'on' : '') + '" onclick="window.__settingsTab=\''+t.id+'\';drawSettings()">'+t.label+'</button>'; }).join('');
    document.getElementById('view').innerHTML = '<div class="board-head"><h1>Settings</h1></div><div class="settings-layout"><nav class="settings-nav">'+navHtml+'</nav><div class="settings-content" id="settingsContent">Loading...</div></div>';
    if (tab === 'workspace') window.__settingsWorkspace();
    else if (tab === 'team') window.__settingsTeam();
    else if (tab === 'sessions') window.__settingsSessions();
    else if (tab === 'integrations') window.__settingsIntegrations();
    else if (tab === 'preferences') window.__settingsPreferences();
  };
  window.__settingsWorkspace = async function () {
    const el = document.getElementById('settingsContent');
    const data = await api('/crm/api/setup');
    if (!data || data.error) { el.innerHTML = '<p class="hello">Could not load.</p>'; return; }
    var wsName = data.name || (me && me.company) || 'workspace';
    el.innerHTML = '<div class="settings-section"><h3>Business details</h3><div class="settings-row"><label>Business name<input id="setName" value="'+esc(data.name||'')+'"></label><label>Industry<select id="setIndustry">'+['Services','Retail','Manufacturing','Agriculture','Other'].map(function(i){return '<option '+(data.industry===i?'selected':'')+'>'+i+'</option>';}).join('')+'</select></label></div><div class="settings-row"><label>How do you sell?<select id="setChannel">'+['Phone & WhatsApp','Email','In-person','Mixed'].map(function(c){return '<option '+(data.channel===c?'selected':'')+'>'+c+'</option>';}).join('')+'</select></label><label>Whats the goal?<select id="setGoal">'+['Close deals','Customer support','Job delivery'].map(function(g){return '<option '+(data.goal===g?'selected':'')+'>'+g+'</option>';}).join('')+'</select></label></div></div><button type="button" onclick="window.__saveWorkspace()">Save changes</button> <button type="button" class="ghost" onclick="window.__loadDemo()">Load demo data</button><p class="hello" id="workspaceStatus" style="margin-top:12px"></p>' +
    '<div class="danger-zone" style="margin-top:32px;padding:18px;border:1px solid #fecaca;border-radius:14px;background:#fef2f2"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-size:20px">⚠</span><b style="color:#991b1b;font-size:15px">Danger Zone</b></div><p style="color:#7f1d1d;font-size:13px;line-height:1.6;margin:0 0 12px">Permanently delete this workspace and <b>all</b> its data — contacts, companies, deals, activities, notes, emails, pipelines, tags, automations, API keys, webhooks, and OAuth connections. <b>This cannot be undone.</b> You will be signed out immediately.</p><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button type="button" class="danger-btn" onclick="window.__openDeleteModal()">Permanently delete workspace</button><span style="font-size:11px;color:#991b1b">Workspace name: <code style="background:#fee2e2;padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace">'+esc(wsName)+'</code></span></div></div>' +
    '<div id="deleteModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center;padding:20px" onclick="if(event.target.id===\'deleteModal\')window.__closeDeleteModal()"><div class="card" style="max-width:500px;width:100%;background:#fff;padding:24px;border-radius:14px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><span style="font-size:24px">⚠</span><b style="color:#991b1b;font-size:18px">Delete this workspace?</b></div><p style="color:#374151;font-size:13px;line-height:1.6;margin:0 0 16px">You are about to permanently delete <b>'+esc(wsName)+'</b> and <b>all</b> data associated with it:</p><ul style="margin:0 0 16px 18px;padding:0;color:#374151;font-size:13px;line-height:1.7"><li>All contacts, companies, and deals</li><li>All activities, notes, and emails</li><li>All pipelines, tags, and automations</li><li>All API keys and webhooks</li><li>All OAuth connections (Gmail, Outlook, etc.)</li><li>All team members and their access</li></ul><p style="color:#7f1d1d;font-size:12px;margin:0 0 8px"><b>This action is irreversible.</b> The data cannot be recovered.</p><div style="margin-top:16px"><label style="font-size:12px;color:#475569;font-weight:600">Type your workspace name to confirm <code style="background:#fee2e2;padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace;color:#991b1b">'+esc(wsName)+'</code><input id="deleteConfirmInput" placeholder="'+esc(wsName)+'" style="margin-top:6px;border-color:#fecaca"></label></div><div style="margin-top:12px"><label style="font-size:12px;color:#475569;font-weight:600">Reason for leaving (optional)<textarea id="deleteReasonInput" placeholder="Tell us why you\'re leaving so we can improve..." style="margin-top:6px;width:100%;min-height:60px;border-color:#fecaca;font-family:inherit;font-size:13px;padding:8px"></textarea></label></div><label class="check" style="margin-top:12px;color:#475569;font-size:13px;display:flex;align-items:center;gap:8px"><input id="deleteAckCheckbox" type="checkbox"> I understand this action is permanent and cannot be undone.</label><p class="err" id="deleteError" style="margin-top:8px"></p><div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end"><button type="button" class="ghost" onclick="window.__closeDeleteModal()">Cancel</button><button type="button" class="danger-btn" id="deleteSubmitBtn" onclick="window.__confirmDelete()">Delete forever</button></div></div></div>';
  };
  window.__openDeleteModal = function () {
    var m = document.getElementById('deleteModal');
    if (m) { m.style.display = 'flex'; }
    setTimeout(function() { var i = document.getElementById('deleteConfirmInput'); if (i) i.focus(); }, 50);
  };
  window.__closeDeleteModal = function () {
    var m = document.getElementById('deleteModal');
    if (m) m.style.display = 'none';
    var i = document.getElementById('deleteConfirmInput');
    var r = document.getElementById('deleteReasonInput');
    var a = document.getElementById('deleteAckCheckbox');
    var e = document.getElementById('deleteError');
    if (i) i.value = '';
    if (r) r.value = '';
    if (a) a.checked = false;
    if (e) e.textContent = '';
  };
  window.__confirmDelete = async function () {
    var btn = document.getElementById('deleteSubmitBtn');
    var errEl = document.getElementById('deleteError');
    var name = (document.getElementById('deleteConfirmInput') || {}).value || '';
    var reason = (document.getElementById('deleteReasonInput') || {}).value || '';
    var ack = (document.getElementById('deleteAckCheckbox') || {}).checked;
    if (!name) { if (errEl) errEl.textContent = 'Type your workspace name to confirm.'; return; }
    if (!ack) { if (errEl) errEl.textContent = 'Check the box to acknowledge this cannot be undone.'; return; }
    if (!confirm('Last chance. Are you absolutely sure? This will permanently delete your workspace and all data.')) return;
    if (btn) { btn.disabled = true; btn.textContent = 'Deleting…'; }
    var res = await api('/crm/api/account', { method: 'DELETE', body: JSON.stringify({ confirm: name, reason: reason }) });
    if (res && res.ok) {
      // Sign out + redirect to login page
      token = '';
      localStorage.removeItem('crmToken');
      if (errEl) errEl.textContent = '';
      // Show a goodbye page briefly
      var view = document.getElementById('view') || document.body;
      view.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:20px"><div style="font-size:48px;margin-bottom:12px">👋</div><h1 style="color:#0f172a;margin:0 0 8px">Workspace deleted</h1><p style="color:#64748b;font-size:14px;margin:0 0 16px">Your account and all data have been permanently removed from Afri CRM.</p><p style="color:#94a3b8;font-size:12px;margin:0">Redirecting to sign in…</p></div>';
      setTimeout(function() { location.href = '/crm'; }, 2500);
    } else {
      if (btn) { btn.disabled = false; btn.textContent = 'Delete forever'; }
      if (errEl) errEl.textContent = (res && res.error) || 'Could not delete account.';
    }
  };
  window.__saveWorkspace = async function () {
    const body = { name: document.getElementById('setName').value.trim(), industry: document.getElementById('setIndustry').value, channel: document.getElementById('setChannel').value, goal: document.getElementById('setGoal').value, done: 1 };
    const res = await api('/crm/api/setup', { method: 'POST', body: JSON.stringify(body) });
    var s = document.getElementById('workspaceStatus');
    if (s) s.textContent = res && !res.error ? 'Saved.' : (res && res.error) || 'Could not save.';
    if (res && !res.error) Object.assign(workspace, res);
  };
  window.__settingsTeam = async function () {
    const el = document.getElementById('settingsContent');
    const accounts = await api('/crm/api/accounts');
    var list = (Array.isArray(accounts) ? accounts : []).map(function(a) {
      var grad = avatarGradient(a.fullName || a.email || '?');
      var init = (a.fullName || a.email || '?').slice(0, 2).toUpperCase();
      var active = Number(a.active) !== 0;
      var isOwner = a.role === 'OWNER';
      return '<div class="user-row"><div class="avatar" style="background:'+grad+'">'+esc(init)+'</div><div class="info"><b>'+esc(a.fullName||a.email)+'</b><span>'+esc(a.email)+'</span></div><span class="role-badge '+a.role+'">'+esc(a.role)+'</span><span class="status-dot '+(active?'active':'inactive')+'"></span>'+(isOwner?'':'<select onchange="window.__changeRole(\''+a.id+'\', this.value)"><option value="ADMIN" '+(a.role==='ADMIN'?'selected':'')+'>Admin</option><option value="MANAGER" '+(a.role==='MANAGER'?'selected':'')+'>Manager</option><option value="SALES" '+(a.role==='SALES'?'selected':'')+'>Sales</option><option value="VIEWER" '+(a.role==='VIEWER'?'selected':'')+'>Viewer</option></select><button type="button" class="ghost" onclick="window.__toggleActive(\''+a.id+'\', '+(active?'false':'true')+')">'+(active?'Deactivate':'Activate')+'</button>')+'</div>';
    }).join('') || '<p class="hello">No team members. Invite below.</p>';
    el.innerHTML = '<div class="settings-section"><h3>Team members</h3>'+list+'</div><div class="settings-section"><h3>Invite a team member</h3><div class="settings-row"><label>Full name<input id="inviteName" placeholder="Ada Yusuf"></label><label>Email<input id="inviteEmail" type="email" placeholder="ada@company.com"></label></div><div class="settings-row"><label>Role<select id="inviteRole"><option value="ADMIN">Admin</option><option value="MANAGER">Manager</option><option value="SALES" selected>Sales</option><option value="VIEWER">Viewer</option></select></label></div><button type="button" onclick="window.__inviteUser()">Send invite</button><div id="inviteResult"></div></div>';
  };
  window.__inviteUser = async function () {
    var email = document.getElementById('inviteEmail').value.trim();
    var fullName = document.getElementById('inviteName').value.trim();
    var role = document.getElementById('inviteRole').value;
    if (!email) { toast('Enter an email'); return; }
    var res = await api('/crm/api/accounts/invite', { method: 'POST', body: JSON.stringify({ email: email, fullName: fullName, role: role }) });
    var el = document.getElementById('inviteResult');
    if (res && !res.error) { el.innerHTML = '<div class="temp-password"><b>'+esc(res.tempPassword)+'</b><p>Share with '+esc(email)+'. They sign in at this URL and can change it later.</p></div>'; toast('Invited'); window.__settingsTeam(); }
    else el.innerHTML = '<p class="hello" style="color:#b91c1c">'+esc(res&&res.error||'Could not invite')+'</p>';
  };
  window.__changeRole = async function (id, role) {
    var res = await api('/crm/api/accounts/' + id, { method: 'PATCH', body: JSON.stringify({ role: role }) });
    toast(res && !res.error ? 'Role updated' : (res && res.error) || 'Error');
  };
  window.__toggleActive = async function (id, active) {
    var res = await api('/crm/api/account/active', { method: 'POST', body: JSON.stringify({ id: id, active: active === 'true' || active === true }) });
    toast(res && !res.error ? 'Updated' : (res && res.error) || 'Error');
    window.__settingsTeam();
  };
  window.__settingsSessions = async function () {
    var el = document.getElementById('settingsContent');
    var sessions = await api('/crm/api/sessions');
    var list = (Array.isArray(sessions) ? sessions : []).map(function(s) { var a = !s.revokedAt; return '<div class="session-row"><span class="status-dot '+(a?'active':'inactive')+'"></span><div style="flex:1;color:#64748b"><b>'+esc(s.ip||'Unknown')+'</b> &middot; '+esc(s.agent?s.agent.slice(0,60):'Unknown')+' &middot; '+when(s.createdAt)+(s.revokedAt?' &middot; Revoked':'')+'</div>'+(a?'<button type="button" class="ghost" onclick="window.__revokeSession(\''+s.id+'\')">Revoke</button>':'')+'</div>'; }).join('') || '<p class="hello">No sessions.</p>';
    el.innerHTML = '<div class="settings-section"><h3>Active sessions</h3>'+list+'</div>';
  };
  window.__revokeSession = async function (id) { await api('/crm/api/sessions/' + id + '/revoke', { method: 'POST' }); toast('Revoked'); window.__settingsSessions(); };
  window.__settingsIntegrations = async function () {
    var el = document.getElementById('settingsContent');
    el.innerHTML = '<div class="settings-section"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px"><div><h3 style="margin:0">Integration Marketplace</h3><p class="hello" style="margin:4px 0 0">Connect Gmail, Calendar, Outlook in one click. Connect other tools with API keys.</p></div><button type="button" class="ghost" onclick="go(\'integrations\')" style="font-size:12px">Open full page ›</button></div><div id="oauthSetupInline" style="margin-bottom:24px"></div><div id="intGrid" class="integration-grid">Loading...</div><div id="apiKeySection" style="margin-top:24px"></div><div id="webhookSection" style="margin-top:24px"></div></div>';
    var data = await api('/crm/api/integrations');
    var grid = document.getElementById('intGrid');
    if (!data || data.error) { grid.innerHTML = '<p class="hello">Could not load integrations.</p>'; return; }
    grid.innerHTML = data.map(function(i) {
      var statusClass = i.status === 'connected' ? 'connected' : i.status === 'ready' ? 'ready' : i.status === 'coming_soon' ? 'coming_soon' : i.status === 'always' ? 'always' : 'not_configured';
      var statusLabel = i.status === 'connected' ? ('Connected' + (i.email ? ' · ' + esc(i.email) : '')) : i.status === 'ready' ? 'Ready' : i.status === 'coming_soon' ? 'Coming soon' : i.status === 'always' ? 'Available' : 'Not configured';
      var btn = '';
      if (i.status === 'connected') {
        if (i.id === 'gmail' || i.id === 'google_calendar') btn = '<button class="ghost" onclick="window.__disconnectOAuth(\'' + (i.id === 'google_calendar' ? 'calendar' : 'gmail') + '\')">Disconnect</button>';
        else if (i.id === 'outlook') btn = '<button class="ghost" onclick="window.__disconnectOAuth(\'outlook\')">Disconnect</button>';
        else btn = '<button class="configure" onclick="go(\'settings\')">Settings</button>';
      }
      else if (i.status === 'ready') {
        if (i.oauthUrl) btn = '<button class="connect" onclick="window.__startOAuth(\'' + i.oauthUrl + '\')">Connect</button>';
        else btn = '<button class="connect" onclick="go(\'integrations\')">Connect</button>';
      }
      else if (i.status === 'not_configured') {
        if (i.id === 'gmail' || i.id === 'google_calendar' || i.id === 'outlook') btn = '<button class="configure" onclick="window.__showOAuthSetup({scroll:true})">Set up</button>';
        else if (i.id === 'whatsapp' || i.id === 'email' || i.id === 'flutterwave' || i.id === 'paystack' || i.id === 'gemini') btn = '<span style="font-size:11px;color:#94a3b8">Admin only</span>';
        else btn = '<button class="configure" onclick="go(\'integrations\')">Configure</button>';
      }
      else if (i.status === 'always') btn = '<button class="connect" onclick="window.__showApiKeys()">Manage</button>';
      else if (i.status === 'coming_soon') btn = '<span style="font-size:11px;color:#94a3b8">Notify me</span>';
      return '<div class="integration-card"><div class="top"><div class="ico">' + i.icon + '</div><div class="info"><b>' + esc(i.name) + '</b><span>' + esc(i.category) + '</span></div></div><p class="desc">' + esc(i.description) + '</p><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="status-badge ' + statusClass + '">' + statusLabel + '</span>' + btn + '</div></div>';
    }).join('');
    // Render OAuth setup panel (auto-detects container: oauthSetupSection on Integrations page, oauthSetupInline in Settings)
    window.__showOAuthSetup();
    if (window.__showApiKeys) window.__showApiKeys();
    if (window.__showWebhooks) window.__showWebhooks();
  };
  // Inline variant of OAuth setup — uses oauthSetupInline container when in Settings
  window.__showOAuthSetupInline = async function () {
    var el = document.getElementById('oauthSetupInline');
    if (!el) {
      // Create the container if missing (in Settings it's precreated; in Integrations page it might not be)
      el = document.getElementById('oauthSetupSection');
    }
    if (!el) return;
    var setup = await api('/crm/api/oauth/setup');
    if (!setup || setup.error) { el.innerHTML = ''; return; }
    var cards = setup.providers.map(function(p) {
      var redirectHtml = p.redirect_urls.map(function(u) {
        return '<code style="font-family:ui-monospace,monospace;font-size:11px;color:#0d9488;background:#f0fdfa;padding:4px 8px;border-radius:6px;word-break:break-all;display:block;margin:4px 0">' + esc(u) + '</code>';
      }).join('');
      var envHtml = '<code style="font-family:ui-monospace,monospace;font-size:11px;color:#1e40af;background:#dbeafe;padding:2px 6px;border-radius:4px">' + esc(p.env_vars.client_id) + '</code> <code style="font-family:ui-monospace,monospace;font-size:11px;color:#1e40af;background:#dbeafe;padding:2px 6px;border-radius:4px">' + esc(p.env_vars.client_secret) + '</code>';
      var statusBadge = p.platform_enabled
        ? '<span class="status-badge connected" style="background:#dcfce7;color:#166534">Enabled</span>'
        : '<span class="status-badge not_configured" style="background:#fef3c7;color:#92400e">Not enabled</span>';
      var stepsHtml = '<ol style="margin:8px 0 0 18px;padding:0;font-size:12px;color:#475569;line-height:1.7">' + p.steps.map(function(s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
      return '<div style="border:1px solid #e8e6e1;border-radius:14px;padding:18px;margin-bottom:12px;background:var(--card,#fff)"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><b style="font-size:15px;color:#0f172a">' + esc(p.name) + '</b><div style="margin-top:4px">' + statusBadge + '</div></div><a href="' + esc(p.console_url) + '" target="_blank" rel="noopener" style="font-size:12px;background:#0d9488;color:#fff;padding:6px 12px;border-radius:8px;text-decoration:none">Open console →</a></div><div style="margin-top:12px"><b style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Authorized redirect URI</b>' + redirectHtml + '</div><div style="margin-top:12px"><b style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Railway env vars</b><div style="margin-top:4px">' + envHtml + '</div></div><div style="margin-top:12px"><b style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Steps</b>' + stepsHtml + '</div><details style="margin-top:12px"><summary style="font-size:12px;color:#0d9488;cursor:pointer;font-weight:600">Or use your own client (per-workspace)</summary><div style="margin-top:8px"><label style="font-size:12px;color:#475569">Client ID<input id="ownCred_' + p.id + '_id" placeholder="Paste client ID" style="margin-top:4px"></label><label style="font-size:12px;color:#475569;margin-top:8px;display:block">Client secret<input id="ownCred_' + p.id + '_secret" type="password" placeholder="Paste client secret" style="margin-top:4px"></label><button type="button" onclick="window.__saveOwnCred(\'' + p.id + '\')" style="margin-top:8px">Save credentials</button><button type="button" class="ghost" onclick="window.__removeOwnCred(\'' + p.id + '\')" style="margin-top:8px;margin-left:6px">Remove</button><div id="ownCredResult_' + p.id + '"></div></div></details></div>';
    }).join('');
    el.innerHTML = '<div class="card"><h2>OAuth setup</h2><p class="hello" style="margin-bottom:12px">To enable one-click Connect for <b>Gmail</b>, <b>Google Calendar</b>, and <b>Outlook</b>, the workspace owner registers OAuth clients with Google and Microsoft. This is a one-time setup — after that, every user just clicks Connect.</p>' + cards + '</div>';
  };
  window.__settingsPreferences = function () {
    var el = document.getElementById('settingsContent');
    var theme = document.documentElement.getAttribute('data-theme') || 'light';
    el.innerHTML = '<div class="settings-section"><h3>Appearance</h3><div class="settings-row"><label>Theme<select onchange="window.__setTheme(this.value)"><option value="light" '+(theme==='light'?'selected':'')+'>Light</option><option value="dark" '+(theme==='dark'?'selected':'')+'>Dark</option><option value="auto" '+(!localStorage.getItem('afri.theme')?'selected':'')+'>Auto</option></select></label></div></div><div class="settings-section"><h3>Notifications</h3><p class="hello">Per-user notification preferences coming soon.</p></div>';
  };
  window.__setTheme = function (val) {
    if (val === 'auto') { localStorage.removeItem('afri.theme'); document.documentElement.removeAttribute('data-theme'); if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark'); }
    else { document.documentElement.setAttribute('data-theme', val); localStorage.setItem('afri.theme', val); }
    toast('Theme updated');
  };


  // ============================================================
  // PHASE 5 CONTINUED: Pipeline + Permissions + Webhooks tabs
  // + Modernized Tasks (card-first) + Leads avatar fix
  // ============================================================

  style.textContent += `
    .pipeline-stage-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .pipeline-stage-row:last-child { border-bottom: 0; }
    .pipeline-stage-row .color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .pipeline-stage-row .info { flex: 1; }
    .pipeline-stage-row .info b { font-size: 14px; color: #0f172a; }
    .pipeline-stage-row .info span { font-size: 12px; color: #64748b; }
    .pipeline-stage-row .chance { font-size: 12px; font-weight: 700; color: #0d9488; }
    .perm-matrix { overflow: auto; }
    .perm-matrix table { width: 100%; border-collapse: collapse; }
    .perm-matrix th, .perm-matrix td { padding: 6px 10px; border: 1px solid #e2e8f0; text-align: center; font-size: 12px; }
    .perm-matrix th { background: #f8fafc; color: #64748b; font-weight: 600; }
    .perm-matrix td:first-child { text-align: left; font-weight: 600; color: #0f172a; }
    .perm-matrix input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .webhook-row { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .webhook-row:last-child { border-bottom: 0; }
    .webhook-row .url { flex: 1; font-family: ui-monospace, monospace; font-size: 12px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .webhook-row .status-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .webhook-row .status-badge.active { background: #dcfce7; color: #166534; }
    .webhook-row .status-badge.inactive { background: #f1f5f9; color: #64748b; }
    .task-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.08s, box-shadow 0.08s, transform 0.08s; }
    .task-card:hover { border-color: #14b8a6; box-shadow: 0 4px 14px rgba(15,23,42,0.05); transform: translateY(-1px); }
    .task-card:active { transform: scale(0.98); }
    .task-card .task-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .task-card .type-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 999px; text-transform: uppercase; }
    .task-card .type-badge.TASK { background: #dbeafe; color: #1e40af; }
    .task-card .type-badge.CALL { background: #fef3c7; color: #92400e; }
    .task-card .type-badge.MEETING { background: #e0e7ff; color: #3730a3; }
    .task-card .type-badge.EMAIL { background: #d1fae5; color: #065f46; }
    .task-card .task-subject { flex: 1; font-size: 14px; font-weight: 600; color: #0f172a; }
    .task-card .task-meta { font-size: 12px; color: #64748b; display: flex; gap: 10px; align-items: center; }
    .task-card .due-chip { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
    .task-card .due-chip.overdue { background: #fee2e2; color: #991b1b; }
    .task-card .due-chip.today { background: #ffedd5; color: #9a3412; }
    .task-card .due-chip.future { background: #f1f5f9; color: #475569; }
    .task-card .done-btn { font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #f0fdfa; color: #0d9488; border: 0; font-weight: 600; cursor: pointer; }
    .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; }
    @media (max-width: 680px) { .task-grid { grid-template-columns: 1fr; } }
  `;

  // Pipeline tab in Settings
  window.__settingsPipeline = async function () {
    var el = document.getElementById('settingsContent');
    var data = await api('/crm/api/pipeline');
    var stages = (data && data.stages) || (Array.isArray(data) ? data : []);
    var list = stages.map(function(s) {
      return '<div class="pipeline-stage-row"><div class="color-dot" style="background:' + (s.color || '#cbd5e1') + '"></div><div class="info"><b>' + esc(s.name || s.label || s.code || '') + '</b><span>' + esc(s.code || '') + '</span></div><span class="chance">' + (s.probability || s.chance || 0) + '%</span></div>';
    }).join('') || '<p class="hello">No stages. The default pipeline seeds on first use.</p>';
    el.innerHTML = '<div class="settings-section"><h3>Pipeline stages</h3>' + list + '</div><p class="hello">Stages are seeded when you first use the CRM. Custom stage editing coming in a future update.</p>';
  };

  // Permissions tab in Settings
  window.__settingsPermissions = async function () {
    var el = document.getElementById('settingsContent');
    var data = await api('/crm/api/access');
    if (!data || data.error) { el.innerHTML = '<p class="hello">Could not load permissions.</p>'; return; }
    var areas = data.areas || [];
    var actions = data.actions || [];
    var rows = data.rows || [];
    var roles = ['OWNER', 'ADMIN', 'MANAGER', 'SALES', 'VIEWER'];
    var on = function(role, area, action) { return rows.some(function(r) { return r.roleName === role && r.area === area && r.action === action && Number(r.allowed); }); };
    var head = '<tr><th>Role</th>' + actions.map(function(a) { return '<th>' + esc(a) + '</th>'; }).join('') + '</tr>';
    var body = '';
    areas.forEach(function(area) {
      body += '<tr><td colspan="' + (actions.length + 1) + '" style="background:#f8fafc;font-weight:700;color:#475569;padding:8px 10px">' + esc(area) + '</td></tr>';
      roles.forEach(function(role) {
        body += '<tr><td>' + role + (role === 'OWNER' ? ' (locked)' : '') + '</td>' + actions.map(function(action) {
          var checked = on(role, area, action) ? 'checked' : '';
          var disabled = role === 'OWNER' ? 'disabled' : '';
          return '<td><input type="checkbox" ' + checked + ' ' + disabled + ' onchange="window.__setPerm(\'' + role + '\',\'' + area + '\',\'' + action + '\',this.checked)"></td>';
        }).join('') + '</tr>';
      });
    });
    el.innerHTML = '<div class="settings-section"><h3>Permission matrix</h3><div class="perm-matrix"><table>' + head + body + '</table></div></div>';
  };
  window.__setPerm = async function (role, area, action, allowed) {
    var res = await api('/crm/api/access', { method: 'POST', body: JSON.stringify({ role: role, area: area, action: action, allowed: allowed }) });
    if (!res || res.error) toast('Could not save');
  };

  // Webhooks tab in Settings
  window.__settingsWebhooks = async function () {
    var el = document.getElementById('settingsContent');
    var workflows = (bag.workflows || []).filter(function(w) { return w.action === 'webhook' && w.target; });
    var list = workflows.map(function(w) {
      return '<div class="webhook-row"><span class="status-badge ' + (Number(w.active) ? 'active' : 'inactive') + '">' + (Number(w.active) ? 'On' : 'Off') + '</span><span class="url">' + esc(w.target || '') + '</span><span style="font-size:12px;color:#64748b">' + esc(w.trigger || '') + '</span></div>';
    }).join('') || '<p class="hello">No webhooks configured. Create a workflow with a webhook action from the Automation page.</p>';
    el.innerHTML = '<div class="settings-section"><h3>Outbound webhooks</h3>' + list + '</div><p class="hello">Webhooks fire when workflow triggers match (e.g., lead.created, deal.won). Configure them from the Automation page in the sidebar.</p>';
  };

  // Update drawSettings to include new tabs
  var oldDrawSettings = window.drawSettings;
  if (oldDrawSettings) {
    window.drawSettings = function () {
      var tab = window.__settingsTab || 'workspace';
      var tabs = [{id:'workspace',label:'Workspace'},{id:'team',label:'Team'},{id:'pipeline',label:'Pipeline'},{id:'permissions',label:'Permissions'},{id:'sessions',label:'Sessions'},{id:'webhooks',label:'Webhooks'},{id:'integrations',label:'Integrations'},{id:'preferences',label:'Preferences'}];
      var navHtml = tabs.map(function(t) { return '<button class="' + (tab === t.id ? 'on' : '') + '" onclick="window.__settingsTab=\'' + t.id + '\';drawSettings()">' + t.label + '</button>'; }).join('');
      document.getElementById('view').innerHTML = '<div class="board-head"><h1>Settings</h1></div><div class="settings-layout"><nav class="settings-nav">' + navHtml + '</nav><div class="settings-content" id="settingsContent">Loading...</div></div>';
      if (tab === 'workspace') window.__settingsWorkspace();
      else if (tab === 'team') window.__settingsTeam();
      else if (tab === 'pipeline') window.__settingsPipeline();
      else if (tab === 'permissions') window.__settingsPermissions();
      else if (tab === 'sessions') window.__settingsSessions();
      else if (tab === 'webhooks') window.__settingsWebhooks();
      else if (tab === 'integrations') window.__settingsIntegrations();
      else if (tab === 'preferences') window.__settingsPreferences();
    };
  }

  // Modernize Tasks — card-first layout
  var origDrawTasks = (typeof drawTasks === 'function') ? drawTasks : null;
  if (origDrawTasks) {
    drawTasks = function () {
      var today = new Date().toISOString().slice(0, 10);
      var q = (document.getElementById('q').value || '').trim().toLowerCase();
      var rows = (bag.activities || []).filter(function(row) { return row.type === 'TASK' || row.type === 'CALL' || row.type === 'MEETING'; });
      var due = function(row) { return String(row.dueAt || '').slice(0, 10); };
      if (taskView === 'today') rows = rows.filter(function(row) { return row.status === 'PLANNED' && due(row) === today; });
      if (taskView === 'overdue') rows = rows.filter(function(row) { return row.status === 'PLANNED' && due(row) && due(row) < today; });
      if (taskView === 'upcoming') rows = rows.filter(function(row) { return row.status === 'PLANNED' && due(row) > today; });
      if (taskOwner) rows = rows.filter(function(row) { return row.ownerId === taskOwner; });
      if (taskType) rows = rows.filter(function(row) { return row.type === taskType; });
      if (q) rows = rows.filter(function(row) { return (row.subject + ' ' + (row.notes || '')).toLowerCase().includes(q); });
      rows.sort(function(a, b) { return due(a).localeCompare(due(b)); });
      var tab = function(id, label) { return '<button type="button" class="' + (taskView === id ? 'on' : '') + '" onclick="taskView=\'' + id + '\';drawTasks()">' + label + '</button>'; };
      var cards = rows.map(function(row) {
        var d = due(row);
        var dueClass = !d ? 'future' : (d < today ? 'overdue' : (d === today ? 'today' : 'future'));
        var dueLabel = d || 'No date';
        var owner = ownerName(row.ownerId) || 'Unassigned';
        var grad = avatarGradient(owner);
        var init = (owner || '?').slice(0, 2).toUpperCase();
        return '<div class="task-card" onclick="openTask(\'' + (row.relatedType || '') + '\',\'' + (row.relatedId || '') + '\')"><div class="task-top"><span class="type-badge ' + (row.type || 'TASK') + '">' + esc(row.type || 'TASK') + '</span><b class="task-subject">' + esc(row.subject || 'Untitled') + '</b></div><div class="task-meta"><div class="avatar" style="background:' + grad + ';width:24px;height:24px;border-radius:50%;font-size:9px;font-weight:800;color:#fff;display:grid;place-items:center">' + esc(init) + '</div><span>' + esc(owner) + '</span><span class="due-chip ' + dueClass + '">' + esc(dueLabel) + '</span>' + (row.status === 'PLANNED' ? '<button class="done-btn" onclick="event.stopPropagation();hold(\'' + row.id + '\')">Done</button>' : '<span style="color:#22c55e;font-weight:600">Done</span>') + '</div></div>';
      }).join('') || '<div class="empty"><div class="empty-ico">✓</div><p>No tasks match.</p></div>';
      document.getElementById('view').innerHTML = '<div class="board-head"><div><h1>Tasks</h1><p class="hello">' + rows.length + ' task' + (rows.length === 1 ? '' : 's') + '</p></div><span><button type="button" class="ghost" onclick="go(\'player\')">Work the list</button> <button type="button" onclick="document.getElementById(\'taskForm\').hidden=false">Add task</button></span></div><div class="tabs">' + tab('all', 'All') + tab('today', 'Today') + tab('overdue', 'Overdue') + tab('upcoming', 'Upcoming') + '</div><div class="task-grid">' + cards + '</div>';
    };
  }


  style.textContent += `
  /* ============================================================
     AFRI BRAND DESIGN SYSTEM
     - Inter font (geometric sans, designed for screens)
     - 4px spacing system
     - Teal primary, warm dark/light backgrounds
     - Wide sidebar (220px) with category headers
     - Minimal top bar (search + create + account)
     ============================================================ */
  body { font-family: "Inter", system-ui, -apple-system, sans-serif !important; }
  aside { width: 220px !important; }
  aside .navscroll { padding: 4px 8px !important; }
  aside button { padding: 8px 10px !important; font-size: 13px !important; display: flex; align-items: center; gap: 10px; }
  aside button svg { width: 18px !important; height: 18px !important; flex-shrink: 0; opacity: 0.7; }
  aside button.on svg { opacity: 1; }
  aside .brand { padding: 12px 14px !important; display: flex; align-items: center; gap: 10px; }
  aside .brand .mark { width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #14b8a6, #0d9488); display: grid; place-items: center; font-weight: 800; color: #fff; font-size: 16px; flex-shrink: 0; box-shadow: 0 4px 12px rgba(13,148,136,0.25); }
  aside .brand .meta { font-size: 13px; font-weight: 700; color: #0f172a; }
  [data-theme="dark"] aside .brand .meta { color: #f8fafc; }
  header { padding: 0 20px !important; }
  header .search { flex: 1; max-width: 400px; }
  header .search input { width: 100% !important; }
  header .tools { margin-left: auto; }
`;

  window.__loadDemo = async function () {
    var res = await api('/crm/api/setup/demo', { method: 'POST', body: JSON.stringify({}) });
    if (res && !res.error) { toast('Demo data loaded — refresh to see it'); setTimeout(function() { refresh(); }, 500); }
    else toast((res && res.error) || 'Could not load demo data');
  };


  // ============================================================
  // CLIENT-SIDE DEMO DATA — fills bag with sample data so the
  // CRM looks alive immediately. No API calls, no SQL. Pure JS.
  // Click "Demo" button on Home page to load.
  // ============================================================
  window.__loadDemoClient = function () {
    var now = Date.now();
    var d = function(daysAgo) { return new Date(now - daysAgo * 86400000).toISOString(); };
    var future = function(daysAhead) { return new Date(now + daysAhead * 86400000).toISOString().slice(0, 10); };
    var past = function(daysAgo) { return new Date(now - daysAgo * 86400000).toISOString().slice(0, 10); };

    var people = [
      { id: 'p1', fullName: 'Ada Okafor', email: 'ada@zenithfoods.ng' },
      { id: 'p2', fullName: 'Bola Adeyemi', email: 'bola@lekkitech.ng' },
      { id: 'p3', fullName: 'Chidi Nwosu', email: 'chidi@atlanticlog.ng' },
      { id: 'p4', fullName: 'Fatima Bello', email: 'fatima@savannahtc.ng' },
      { id: 'p5', fullName: 'Emeka Obi', email: 'emeka@naijabuilds.ng' },
      { id: 'p6', fullName: 'Grace Eze', email: 'grace@lekkitech.ng' },
      { id: 'p7', fullName: 'Tunde Adesanya', email: 'tunde@zenithfoods.ng' },
      { id: 'p8', fullName: 'Zainab Yusuf', email: 'zainab@savannahtc.ng' },
    ];

    var companies = [
      { id: 'c1', name: 'Zenith Foods Ltd', industry: 'Food & Beverage', type: 'CUSTOMER', city: 'Lagos', email: 'contact@zenithfoods.ng', phone: '01-234-5678', ownerId: 'p1', source: 'Referral', createdAt: d(25) },
      { id: 'c2', name: 'Lekki Tech Hub', industry: 'Technology', type: 'PROSPECT', city: 'Lagos', email: 'hello@lekkitech.ng', phone: '01-876-5432', ownerId: 'p2', source: 'Walk-in', createdAt: d(18) },
      { id: 'c3', name: 'Atlantic Logistics', industry: 'Transportation', type: 'CUSTOMER', city: 'Port Harcourt', email: 'info@atlanticlog.ng', phone: '084-123-4567', ownerId: 'p3', source: 'Referral', createdAt: d(12) },
      { id: 'c4', name: 'Savannah Trading Co', industry: 'Trading', type: 'PROSPECT', city: 'Abuja', email: 'sales@savannahtc.ng', phone: '09-345-6789', ownerId: 'p4', source: 'Form', createdAt: d(8) },
      { id: 'c5', name: 'Naija Builds Ltd', industry: 'Construction', type: 'PARTNER', city: 'Abuja', email: 'projects@naijabuilds.ng', phone: '09-987-6543', ownerId: 'p5', source: 'Partner', createdAt: d(5) },
    ];

    var contacts = [
      { id: 'ct1', firstName: 'Ada', lastName: 'Okafor', title: 'Operations Manager', companyId: 'c1', email: 'ada@zenithfoods.ng', phone: '0803-555-0101', city: 'Lagos', country: 'Nigeria', ownerId: 'p1', source: 'Referral', status: 'ACTIVE', createdAt: d(20) },
      { id: 'ct2', firstName: 'Bola', lastName: 'Adeyemi', title: 'CEO', companyId: 'c2', email: 'bola@lekkitech.ng', phone: '0805-555-0202', city: 'Lagos', country: 'Nigeria', ownerId: 'p2', source: 'Walk-in', status: 'ACTIVE', createdAt: d(15) },
      { id: 'ct3', firstName: 'Chidi', lastName: 'Nwosu', title: 'Sales Director', companyId: 'c3', email: 'chidi@atlanticlog.ng', phone: '0807-555-0303', city: 'Port Harcourt', country: 'Nigeria', ownerId: 'p3', source: 'Referral', status: 'ACTIVE', createdAt: d(10) },
      { id: 'ct4', firstName: 'Fatima', lastName: 'Bello', title: 'General Manager', companyId: 'c4', email: 'fatima@savannahtc.ng', phone: '0809-555-0404', city: 'Abuja', country: 'Nigeria', ownerId: 'p4', source: 'Form', status: 'ACTIVE', createdAt: d(7) },
      { id: 'ct5', firstName: 'Emeka', lastName: 'Obi', title: 'Project Director', companyId: 'c5', email: 'emeka@naijabuilds.ng', phone: '0811-555-0505', city: 'Abuja', country: 'Nigeria', ownerId: 'p5', source: 'Partner', status: 'ACTIVE', createdAt: d(4) },
      { id: 'ct6', firstName: 'Grace', lastName: 'Eze', title: 'Marketing Lead', companyId: 'c2', email: 'grace@lekkitech.ng', phone: '0813-555-0606', city: 'Lagos', country: 'Nigeria', ownerId: 'p6', source: 'Walk-in', status: 'ACTIVE', createdAt: d(3) },
      { id: 'ct7', firstName: 'Tunde', lastName: 'Adesanya', title: 'Procurement', companyId: 'c1', email: 'tunde@zenithfoods.ng', phone: '0815-555-0707', city: 'Lagos', country: 'Nigeria', ownerId: 'p7', source: 'Referral', status: 'ACTIVE', createdAt: d(2) },
      { id: 'ct8', firstName: 'Zainab', lastName: 'Yusuf', title: 'Founder', companyId: 'c4', email: 'zainab@savannahtc.ng', phone: '0817-555-0808', city: 'Abuja', country: 'Nigeria', ownerId: 'p8', source: 'Form', status: 'ACTIVE', createdAt: d(1) },
    ];

    var deals = [
      { id: 'd1', name: 'Software implementation for Zenith', companyId: 'c1', contactId: 'ct1', amount: 2500000, stage: 'PROPOSAL_SENT', probability: 60, closeDate: future(28), type: 'NEW', source: 'Referral', ownerId: 'p1', nextStep: 'Send contract', createdAt: d(10) },
      { id: 'd2', name: 'Annual support contract', companyId: 'c2', contactId: 'ct2', amount: 1200000, stage: 'NEGOTIATION', probability: 80, closeDate: future(12), type: 'NEW', source: 'Walk-in', ownerId: 'p2', nextStep: 'Finalize terms', createdAt: d(8) },
      { id: 'd3', name: 'Hardware upgrade package', companyId: 'c3', contactId: 'ct3', amount: 800000, stage: 'NEEDS_ASSESSMENT', probability: 40, closeDate: future(44), type: 'NEW', source: 'Referral', ownerId: 'p3', nextStep: 'Schedule demo', createdAt: d(5) },
      { id: 'd4', name: 'Consulting retainer', companyId: 'c4', contactId: 'ct4', amount: 3000000, stage: 'PROSPECTING', probability: 10, closeDate: future(58), type: 'NEW', source: 'Form', ownerId: 'p4', nextStep: 'Initial call', createdAt: d(3) },
      { id: 'd5', name: 'Training program', companyId: 'c5', contactId: 'ct5', amount: 450000, stage: 'CLOSED_WON', probability: 100, closeDate: past(28), type: 'NEW', source: 'Partner', ownerId: 'p5', nextStep: 'Onboarding complete', createdAt: d(30) },
    ];

    var activities = [
      { id: 'a1', type: 'CALL', subject: 'Call Ada about the software proposal', relatedType: 'deal', relatedId: 'd1', dueAt: past(1), status: 'PLANNED', priority: 'HIGH', ownerId: 'p1', notes: '', createdAt: d(3) },
      { id: 'a2', type: 'TASK', subject: 'Send updated quote to Bola', relatedType: 'contact', relatedId: 'ct2', dueAt: past(0), status: 'PLANNED', priority: 'HIGH', ownerId: 'p2', notes: '', createdAt: d(2) },
      { id: 'a3', type: 'MEETING', subject: 'Demo session with Atlantic Logistics', relatedType: 'deal', relatedId: 'd3', dueAt: future(1), status: 'PLANNED', priority: 'NORMAL', ownerId: 'p3', notes: '', createdAt: d(1) },
      { id: 'a4', type: 'TASK', subject: 'Follow up on Savannah Trading retainer', relatedType: 'deal', relatedId: 'd4', dueAt: future(7), status: 'PLANNED', priority: 'NORMAL', ownerId: 'p4', notes: '', createdAt: d(1) },
      { id: 'a5', type: 'CALL', subject: 'Check in with Emeka on training', relatedType: 'deal', relatedId: 'd5', dueAt: past(1), status: 'PLANNED', priority: 'NORMAL', ownerId: 'p5', notes: '', createdAt: d(2) },
      { id: 'a6', type: 'TASK', subject: 'Update pricing sheet for Q4', relatedType: null, relatedId: null, dueAt: past(0), status: 'PLANNED', priority: 'NORMAL', ownerId: 'p1', notes: '', createdAt: d(1) },
      { id: 'a7', type: 'EMAIL', subject: 'Send contract to Zenith Foods', relatedType: 'deal', relatedId: 'd1', dueAt: past(0), status: 'PLANNED', priority: 'HIGH', ownerId: 'p1', notes: '', createdAt: d(1) },
      { id: 'a8', type: 'CALL', subject: 'Welcome call to Zainab', relatedType: 'contact', relatedId: 'ct8', dueAt: future(1), status: 'PLANNED', priority: 'NORMAL', ownerId: 'p8', notes: '', createdAt: d(1) },
    ];

    var tags = [
      { id: 't1', name: 'VIP', color: '#dc2626' },
      { id: 't2', name: 'Wholesale', color: '#7c3aed' },
      { id: 't3', name: 'Lagos', color: '#2563eb' },
      { id: 't4', name: 'Abuja', color: '#059669' },
      { id: 't5', name: 'Repeat buyer', color: '#d97706' },
    ];

    var leads = [
      { id: 'l1', firstName: 'Kemi', lastName: 'Adeola', companyName: 'Blue Ocean Ltd', email: 'kemi@blueocean.ng', phone: '0821-555-0901', source: 'Web form', status: 'NEW', rating: 'WARM', ownerId: 'p1', createdAt: d(2) },
      { id: 'l2', firstName: 'David', lastName: 'Eze', companyName: 'Greenfield Farms', email: 'david@greenfield.ng', phone: '0823-555-0902', source: 'Referral', status: 'WORKING', rating: 'HOT', ownerId: 'p2', createdAt: d(4) },
      { id: 'l3', firstName: 'Aisha', lastName: 'Mohammed', companyName: 'Sahara Imports', email: 'aisha@saharaimports.ng', phone: '0825-555-0903', source: 'Phone', status: 'QUALIFIED', rating: 'WARM', ownerId: 'p3', createdAt: d(6) },
      { id: 'l4', firstName: 'Samuel', lastName: 'Okon', companyName: 'Delta Foods', email: 'samuel@deltafoods.ng', phone: '0827-555-0904', source: 'Walk-in', status: 'NEW', rating: 'COLD', ownerId: 'p4', createdAt: d(1) },
    ];

    // Populate bag
    bag.people = people;
    bag.companies = companies;
    bag.contacts = contacts;
    bag.deals = deals;
    bag.activities = activities;
    bag.tags = tags;
    bag.leads = leads;

    toast('Demo data loaded — every page now has content');
    draw();
  };


  style.textContent += `
  /* ============================================================
     RECORD DETAIL VIEW — modernized contact/deal/company detail
     Applies brand design system to the existing drawRecord
     CSS-only (no JS changes, can't break)
     ============================================================ */
  .reports {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin: 0 0 20px;
  }
  @media (max-width: 880px) { .reports { grid-template-columns: repeat(2, 1fr); } }
  .report {
    background: linear-gradient(135deg, #fff 0%, #faf9f7 100%) !important;
    border: 1px solid #e8e6e1 !important;
    border-radius: 12px !important;
    padding: 16px 18px !important;
    text-align: center;
    box-shadow: 0 1px 2px rgba(15,23,42,0.03);
  }
  [data-theme="dark"] .report {
    background: linear-gradient(135deg, #1e293b 0%, #182234 100%) !important;
    border-color: #334155 !important;
  }
  .report h2 {
    font-size: 11px !important; font-weight: 600 !important;
    color: #64748b !important; text-transform: uppercase;
    letter-spacing: 0.05em; margin: 0 0 8px !important;
  }
  [data-theme="dark"] .report h2 { color: #94a3b8 !important; }
  .report > div {
    font-size: 28px !important; font-weight: 700 !important;
    color: #0f172a !important; letter-spacing: -0.02em;
  }
  [data-theme="dark"] .report > div { color: #f8fafc !important; }
  .record {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }
  @media (max-width: 880px) { .record { grid-template-columns: 1fr; } }
  .stack { display: grid; gap: 16px; }
  .time {
    padding: 8px 0 8px 16px;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
    color: #475569;
    position: relative;
    line-height: 1.5;
  }
  [data-theme="dark"] .time { border-bottom-color: #334155; color: #cbd5e1; }
  .time::before {
    content: ""; position: absolute; left: 0; top: 12px;
    width: 6px; height: 6px; border-radius: 50%;
    background: #14b8a6;
  }
  .time:last-child { border-bottom: 0; }
  .score {
    display: inline-block;
    background: #f0fdfa; color: #0d9488;
    padding: 2px 10px; border-radius: 999px;
    font-size: 12px; font-weight: 700;
  }
  [data-theme="dark"] .score { background: #042f2e; color: #5eead4; }
  .card h2 {
    font-size: 12px !important; font-weight: 600 !important;
    color: #475569 !important; margin: 0 0 12px !important;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  [data-theme="dark"] .card h2 { color: #94a3b8 !important; }
  .record label {
    font-size: 12px !important; font-weight: 500;
    color: #475569;
  }
  .record input, .record select, .record textarea {
    font-size: 14px;
  }
  .record .card {
    padding: 18px;
  }
  .record .pipe {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  /* The "What happened" timeline section */
  .record .card:last-child .time {
    font-size: 13px;
  }
  /* Make the h1 title in record view more prominent */
  .record + h1, .board-head + h1 {
    font-size: 24px !important;
    letter-spacing: -0.02em;
    margin: 0 0 16px !important;
  }
`;

  // ============================================================
  // HUBSPOT-LEVEL UPGRADE
  // - Side panel forms (slide-in from right, not modal popups)
  // - Better empty states with helpful messaging
  // - Setup progress banner at bottom of sidebar
  // - Advanced filter bar with chips
  // ============================================================

  style.textContent += `
    /* SIDE PANEL — slides in from right (HubSpot-style) */
    .side-panel-overlay {
      position: fixed; inset: 0; z-index: 90;
      background: rgba(2, 6, 23, 0.4);
      backdrop-filter: blur(2px);
      opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .side-panel-overlay.open { opacity: 1; pointer-events: auto; }
    .side-panel {
      position: fixed; top: 0; right: 0; bottom: 0; z-index: 91;
      width: min(480px, 100vw);
      background: #fff;
      box-shadow: -8px 0 32px rgba(0,0,0,0.12);
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    [data-theme="dark"] .side-panel { background: #1e293b; }
    .side-panel.open { transform: translateX(0); }
    .side-panel-head {
      padding: 18px 24px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
      flex-shrink: 0;
    }
    [data-theme="dark"] .side-panel-head { border-bottom-color: #334155; }
    .side-panel-head h2 { margin: 0; font-size: 18px; font-weight: 600; color: #0f172a; }
    [data-theme="dark"] .side-panel-head h2 { color: #f8fafc; }
    .side-panel-close {
      background: transparent; border: 0; cursor: pointer;
      width: 32px; height: 32px; border-radius: 8px;
      display: grid; place-items: center; color: #64748b;
      transition: background 0.12s;
    }
    .side-panel-close:hover { background: #f1f0ec; color: #0f172a; }
    [data-theme="dark"] .side-panel-close:hover { background: #334155; color: #f8fafc; }
    .side-panel-close svg { width: 18px; height: 18px; }
    .side-panel-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .side-panel-foot {
      padding: 14px 24px; border-top: 1px solid #f1f5f9;
      display: flex; gap: 8px; justify-content: flex-end;
      flex-shrink: 0;
    }
    [data-theme="dark"] .side-panel-foot { border-top-color: #334155; }
    .side-panel-body label { display: grid; gap: 4px; font-size: 13px; font-weight: 500; color: #475569; margin-bottom: 14px; }
    .side-panel-body input, .side-panel-body select, .side-panel-body textarea {
      width: 100%; padding: 10px 14px; border-radius: 10px;
      border: 1px solid #d4d1c8; background: #fff; color: #1e293b;
      font-size: 14px; font-family: inherit;
    }
    [data-theme="dark"] .side-panel-body input,
    [data-theme="dark"] .side-panel-body select,
    [data-theme="dark"] .side-panel-body textarea {
      background: #0f172a; color: #f8fafc; border-color: #334155;
    }
    .side-panel-body input:focus, .side-panel-body select:focus, .side-panel-body textarea:focus {
      outline: none; border-color: #14b8a6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1);
    }
    .side-panel-body .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    /* SETUP PROGRESS BANNER — at bottom of sidebar (HubSpot-style) */
    .setup-banner {
      margin: 8px; padding: 14px; border-radius: 12px;
      background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%);
      border: 1px solid #99f6e4;
    }
    [data-theme="dark"] .setup-banner {
      background: linear-gradient(135deg, #042f2e 0%, #064e3b 100%);
      border-color: #0f766e;
    }
    .setup-banner b { font-size: 12px; color: #0d9488; display: block; margin-bottom: 4px; }
    .setup-banner p { font-size: 11px; color: #475569; margin: 0 0 8px; line-height: 1.4; }
    [data-theme="dark"] .setup-banner p { color: #94a3b8; }
    .setup-banner button {
      font-size: 11px; padding: 5px 12px; border-radius: 6px;
      background: #0d9488; color: #fff; border: 0; font-weight: 600;
      cursor: pointer; width: 100%;
    }
    .setup-banner button:hover { background: #0f766e; }

    /* BETTER EMPTY STATES */
    .empty-state {
      text-align: center; padding: 48px 24px;
    }
    .empty-state .empty-icon {
      width: 56px; height: 56px; margin: 0 auto 16px;
      border-radius: 16px; background: #f0fdfa;
      display: grid; place-items: center;
      font-size: 24px; color: #0d9488;
    }
    [data-theme="dark"] .empty-state .empty-icon { background: #042f2e; }
    .empty-state h2 { font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 6px; }
    [data-theme="dark"] .empty-state h2 { color: #f8fafc; }
    .empty-state p { font-size: 13px; color: #64748b; margin: 0 0 16px; line-height: 1.5; }
    .empty-state button {
      font-size: 13px; padding: 8px 18px; border-radius: 10px;
      background: #0d9488; color: #fff; border: 0; font-weight: 600;
      cursor: pointer;
    }
    .empty-state button:hover { background: #0f766e; }

    /* ADVANCED FILTER BAR */
    .filter-bar {
      display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .filter-bar .filter-chip {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 10px; border-radius: 999px;
      background: #f1f0ec; color: #475569;
      font-size: 12px; font-weight: 500;
    }
    [data-theme="dark"] .filter-bar .filter-chip { background: #1e293b; color: #94a3b8; }
    .filter-bar .filter-chip .x { cursor: pointer; opacity: 0.5; }
    .filter-bar .filter-chip .x:hover { opacity: 1; }
    .filter-bar .sort-btn {
      background: transparent; border: 1px solid #e8e6e1;
      border-radius: 8px; padding: 6px 12px; font-size: 12px;
      color: #475569; cursor: pointer;
    }
    [data-theme="dark"] .filter-bar .sort-btn { border-color: #334155; color: #94a3b8; }
  `;

  // Side panel system
  window.openSidePanel = function (title, bodyHtml, footHtml) {
    window.closeSidePanel();
    var overlay = document.createElement('div');
    overlay.className = 'side-panel-overlay';
    overlay.id = 'sidePanelOverlay';
    overlay.onclick = function(e) { if (e.target === overlay) window.closeSidePanel(); };

    var panel = document.createElement('div');
    panel.className = 'side-panel';
    panel.id = 'sidePanel';
    panel.innerHTML = 
      '<div class="side-panel-head"><h2>' + esc(title) + '</h2>' +
      '<button class="side-panel-close" onclick="window.closeSidePanel()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>' +
      '<div class="side-panel-body" id="sidePanelBody">' + bodyHtml + '</div>' +
      '<div class="side-panel-foot" id="sidePanelFoot">' + (footHtml || '<button type="button" class="ghost" onclick="window.closeSidePanel()">Cancel</button>') + '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    setTimeout(function() {
      overlay.classList.add('open');
      panel.classList.add('open');
    }, 10);
  };
  window.closeSidePanel = function () {
    var overlay = document.getElementById('sidePanelOverlay');
    var panel = document.getElementById('sidePanel');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    setTimeout(function() {
      if (overlay) overlay.remove();
      if (panel) panel.remove();
    }, 250);
  };
  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('sidePanel')) {
      window.closeSidePanel();
    }
  });

  // Override contact create to use side panel
  var origDrawContacts = (typeof drawContacts === 'function') ? drawContacts : null;
  if (origDrawContacts) {
    drawContacts = function () {
      origDrawContacts();
      // Replace the "Add contacts" button onclick to use side panel
      var addBtn = document.querySelector('[onclick*="document.getElementById(\'form\').hidden=false"]');
      if (addBtn) {
        addBtn.setAttribute('onclick', 'window.__openContactPanel()');
      }
    };
  }
  window.__openContactPanel = function () {
    var ownerOpts = (bag.people || []).map(function(p) { return '<option value="' + p.id + '">' + esc(p.fullName || p.email) + '</option>'; }).join('');
    var companyOpts = (bag.companies || []).map(function(c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('');
    window.openSidePanel('Create contact',
      '<div class="field-row"><label>First name<input id="cFirst" placeholder="Ada"></label><label>Last name<input id="cLast" placeholder="Okafor"></label></div>' +
      '<label>Job title<input id="cTitle" placeholder="Operations Manager"></label>' +
      '<label>Email<input id="cEmail" type="email" placeholder="ada@company.ng"></label>' +
      '<label>Phone<input id="cPhone" placeholder="0803-555-0101"></label>' +
      '<label>Company<select id="cCompany"><option value="">None</option>' + companyOpts + '</select></label>' +
      '<label>City<input id="cCity" placeholder="Lagos"></label>' +
      '<label>Source<input id="cSource" placeholder="Referral, walk-in"></label>' +
      '<label>Status<select id="cStatus"><option>ACTIVE</option><option>CUSTOMER</option><option>INACTIVE</option></select></label>' +
      '<label>Owner<select id="cOwner"><option value="">Me</option>' + ownerOpts + '</select></label>',
      '<button type="button" class="ghost" onclick="window.closeSidePanel()">Cancel</button> ' +
      '<button type="button" onclick="window.__saveContactPanel()">Create</button> ' +
      '<button type="button" class="ghost" onclick="window.__saveContactPanel(true)">Create and add another</button>'
    );
  };
  window.__saveContactPanel = async function (another) {
    var firstName = document.getElementById('cFirst').value.trim();
    if (!firstName) { toast('Enter a first name'); return; }
    var result = await api('/crm/api/contacts', { method: 'POST', body: JSON.stringify({
      firstName: firstName, lastName: document.getElementById('cLast').value,
      title: document.getElementById('cTitle').value, email: document.getElementById('cEmail').value,
      phone: document.getElementById('cPhone').value, city: document.getElementById('cCity').value,
      companyId: document.getElementById('cCompany').value, source: document.getElementById('cSource').value,
      status: document.getElementById('cStatus').value, ownerId: document.getElementById('cOwner').value
    }) });
    if (!result || result.error) { toast((result && result.error) || 'Could not save'); return; }
    toast(another ? 'Contact added. Add another.' : 'Contact saved');
    if (another) { window.closeSidePanel(); setTimeout(window.__openContactPanel, 300); }
    else { window.closeSidePanel(); refresh(); }
  };

  // Setup progress banner removed — paintSetupCard() in crm.html already
  // renders a setup card at the bottom of the sidebar. Having both caused
  // a duplicate (white card + green card saying the same thing).


  // ============================================================
  // HUBSPOT-LEVEL COMPLETE — rest of the upgrade
  // - Side panels for Deals, Companies, Tasks, Leads
  // - Integration prompts (Gmail/Calendar)
  // - Automatic task creation from workflows
  // - List view polish (proper column alignment)
  // - Better Calendar mobile layout
  // ============================================================

  // --- DEAL CREATE SIDE PANEL ---
  window.__openDealPanel = function (prefillStage) {
    var ownerOpts = (bag.people || []).map(function(p) { return '<option value="' + p.id + '">' + esc(p.fullName || p.email) + '</option>'; }).join('');
    var contactOpts = (bag.contacts || []).map(function(c) { return '<option value="' + c.id + '">' + esc(person(c)) + '</option>'; }).join('');
    var companyOpts = (bag.companies || []).map(function(c) { return '<option value="' + c.id + '">' + esc(c.name) + '</option>'; }).join('');
    var stageOpts = (stageList() || []).map(function(s) { return '<option value="' + s[0] + '"' + (prefillStage === s[0] ? ' selected' : '') + '>' + esc(s[1]) + '</option>'; }).join('');
    window.openSidePanel('Create deal',
      '<label>Deal name<input id="dName" placeholder="Software implementation"></label>' +
      '<div class="field-row"><label>Amount (NGN)<input id="dAmount" type="number" placeholder="2500000"></label>' +
      '<label>Close date<input id="dClose" type="date"></label></div>' +
      '<label>Stage<select id="dStage">' + stageOpts + '</select></label>' +
      '<label>Contact<select id="dContact"><option value="">None</option>' + contactOpts + '</select></label>' +
      '<label>Company<select id="dCompany"><option value="">None</option>' + companyOpts + '</select></label>' +
      '<label>Next step<input id="dNext" placeholder="Schedule demo"></label>' +
      '<label>Owner<select id="dOwner"><option value="">Me</option>' + ownerOpts + '</select></label>',
      '<button type="button" class="ghost" onclick="window.closeSidePanel()">Cancel</button> ' +
      '<button type="button" onclick="window.__saveDealPanel()">Create</button> ' +
      '<button type="button" class="ghost" onclick="window.__saveDealPanel(true)">Create and add another</button>'
    );
  };
  window.__saveDealPanel = async function (another) {
    var name = document.getElementById('dName').value.trim();
    if (!name) { toast('Name the deal'); return; }
    var stage = document.getElementById('dStage').value;
    var chance = ((stageList() || []).find(function(s) { return s[0] === stage; }) || [,,,10])[3];
    var result = await api('/crm/api/deals', { method: 'POST', body: JSON.stringify({
      name: name, amount: document.getElementById('dAmount').value, closeDate: document.getElementById('dClose').value,
      contactId: document.getElementById('dContact').value, companyId: document.getElementById('dCompany').value,
      ownerId: document.getElementById('dOwner').value, nextStep: document.getElementById('dNext').value,
      stage: stage, probability: chance
    }) });
    if (!result || result.error) { toast((result && result.error) || 'Could not save'); return; }
    toast(another ? 'Deal added. Add another.' : 'Deal saved');
    if (another) { window.closeSidePanel(); setTimeout(function() { window.__openDealPanel(); }, 300); }
    else { window.closeSidePanel(); refresh(); }
  };

  // --- COMPANY CREATE SIDE PANEL ---
  window.__openCompanyPanel = function () {
    var ownerOpts = (bag.people || []).map(function(p) { return '<option value="' + p.id + '">' + esc(p.fullName || p.email) + '</option>'; }).join('');
    window.openSidePanel('Create company',
      '<label>Company name<input id="coName" placeholder="Zenith Foods Ltd"></label>' +
      '<div class="field-row"><label>Industry<input id="coIndustry" placeholder="Food & Beverage"></label>' +
      '<label>Type<select id="coType"><option>PROSPECT</option><option>CUSTOMER</option><option>PARTNER</option></select></label></div>' +
      '<label>Email<input id="coEmail" placeholder="contact@company.ng"></label>' +
      '<label>Phone<input id="coPhone" placeholder="01-234-5678"></label>' +
      '<label>Website<input id="coWeb" placeholder="https://company.ng"></label>' +
      '<div class="field-row"><label>City<input id="coCity" placeholder="Lagos"></label>' +
      '<label>Country<input id="coCountry" value="Nigeria"></label></div>' +
      '<label>Source<input id="coSource" placeholder="Referral"></label>' +
      '<label>Owner<select id="coOwner"><option value="">Me</option>' + ownerOpts + '</select></label>',
      '<button type="button" class="ghost" onclick="window.closeSidePanel()">Cancel</button> ' +
      '<button type="button" onclick="window.__saveCompanyPanel()">Create</button> ' +
      '<button type="button" class="ghost" onclick="window.__saveCompanyPanel(true)">Create and add another</button>'
    );
  };
  window.__saveCompanyPanel = async function (another) {
    var name = document.getElementById('coName').value.trim();
    if (!name) { toast('Enter a name'); return; }
    var result = await api('/crm/api/companies', { method: 'POST', body: JSON.stringify({
      name: name, industry: document.getElementById('coIndustry').value, type: document.getElementById('coType').value,
      phone: document.getElementById('coPhone').value, email: document.getElementById('coEmail').value,
      website: document.getElementById('coWeb').value, city: document.getElementById('coCity').value,
      country: document.getElementById('coCountry').value, source: document.getElementById('coSource').value,
      ownerId: document.getElementById('coOwner').value
    }) });
    if (!result || result.error) { toast((result && result.error) || 'Could not save'); return; }
    toast(another ? 'Company added. Add another.' : 'Company saved');
    if (another) { window.closeSidePanel(); setTimeout(window.__openCompanyPanel, 300); }
    else { window.closeSidePanel(); refresh(); }
  };

  // --- TASK CREATE SIDE PANEL ---
  window.__openTaskPanel = function () {
    var ownerOpts = (bag.people || []).map(function(p) { return '<option value="' + p.id + '">' + esc(p.fullName || p.email) + '</option>'; }).join('');
    var dealOpts = (bag.deals || []).filter(function(d) { return !String(d.stage || '').startsWith('CLOSED'); }).map(function(d) { return '<option value="' + d.id + '">' + esc(d.name) + '</option>'; }).join('');
    var contactOpts = (bag.contacts || []).map(function(c) { return '<option value="' + c.id + '">' + esc(person(c)) + '</option>'; }).join('');
    window.openSidePanel('Create task',
      '<label>Task type<select id="tType"><option>TASK</option><option>CALL</option><option>MEETING</option><option>EMAIL</option></select></label>' +
      '<label>Subject<input id="tSubject" placeholder="Call Ada about proposal"></label>' +
      '<label>Due date<input id="tDue" type="date"></label>' +
      '<div class="field-row"><label>Related to<select id="tRelType"><option value="">None</option><option value="contact">Contact</option><option value="deal">Deal</option></select></label>' +
      '<label>Related record<select id="tRelId"><option value="">None</option>' + contactOpts + dealOpts + '</select></label></div>' +
      '<label>Priority<select id="tPriority"><option>NORMAL</option><option>HIGH</option><option>LOW</option></select></label>' +
      '<label>Owner<select id="tOwner"><option value="">Me</option>' + ownerOpts + '</select></label>',
      '<button type="button" class="ghost" onclick="window.closeSidePanel()">Cancel</button> ' +
      '<button type="button" onclick="window.__saveTaskPanel()">Create</button> ' +
      '<button type="button" class="ghost" onclick="window.__saveTaskPanel(true)">Create and add another</button>'
    );
  };
  window.__saveTaskPanel = async function (another) {
    var subject = document.getElementById('tSubject').value.trim();
    if (!subject) { toast('Enter a subject'); return; }
    var result = await api('/crm/api/activities', { method: 'POST', body: JSON.stringify({
      type: document.getElementById('tType').value, subject: subject,
      dueAt: document.getElementById('tDue').value, priority: document.getElementById('tPriority').value,
      relatedType: document.getElementById('tRelType').value || null,
      relatedId: document.getElementById('tRelId').value || null,
      ownerId: document.getElementById('tOwner').value
    }) });
    if (!result || result.error) { toast((result && result.error) || 'Could not save'); return; }
    toast(another ? 'Task added. Add another.' : 'Task saved');
    if (another) { window.closeSidePanel(); setTimeout(window.__openTaskPanel, 300); }
    else { window.closeSidePanel(); refresh(); }
  };

  // --- LEAD CREATE SIDE PANEL ---
  window.__openLeadPanel = function () {
    var ownerOpts = (bag.people || []).map(function(p) { return '<option value="' + p.id + '">' + esc(p.fullName || p.email) + '</option>'; }).join('');
    window.openSidePanel('Create lead',
      '<div class="field-row"><label>First name<input id="lFirst" placeholder="Kemi"></label>' +
      '<label>Last name<input id="lLast" placeholder="Adeola"></label></div>' +
      '<label>Company<input id="lCompany" placeholder="Blue Ocean Ltd"></label>' +
      '<label>Phone<input id="lPhone" placeholder="0821-555-0901"></label>' +
      '<label>Email<input id="lEmail" placeholder="kemi@blueocean.ng"></label>' +
      '<label>Source<input id="lSource" placeholder="Web form, phone, referral"></label>' +
      '<label>Rating<select id="lRating"><option>WARM</option><option>HOT</option><option>COLD</option></select></label>' +
      '<label>Owner<select id="lOwner"><option value="">Me</option>' + ownerOpts + '</select></label>',
      '<button type="button" class="ghost" onclick="window.closeSidePanel()">Cancel</button> ' +
      '<button type="button" onclick="window.__saveLeadPanel()">Create</button> ' +
      '<button type="button" class="ghost" onclick="window.__saveLeadPanel(true)">Create and add another</button>'
    );
  };
  window.__saveLeadPanel = async function (another) {
    var firstName = document.getElementById('lFirst').value.trim();
    if (!firstName) { toast('Enter a first name'); return; }
    var result = await api('/crm/api/leads', { method: 'POST', body: JSON.stringify({
      firstName: firstName, lastName: document.getElementById('lLast').value,
      companyName: document.getElementById('lCompany').value, phone: document.getElementById('lPhone').value,
      email: document.getElementById('lEmail').value, source: document.getElementById('lSource').value,
      rating: document.getElementById('lRating').value, ownerId: document.getElementById('lOwner').value
    }) });
    if (!result || result.error) { toast((result && result.error) || 'Could not save'); return; }
    toast(another ? 'Lead added. Add another.' : 'Lead saved');
    if (another) { window.closeSidePanel(); setTimeout(window.__openLeadPanel, 300); }
    else { window.closeSidePanel(); refresh(); }
  };

  // --- Override draw functions to use side panels ---
  var origDrawDeals = (typeof drawDeals === 'function' && !drawDeals.__sp) ? drawDeals : null;
  if (origDrawDeals) {
    drawDeals = function () {
      origDrawDeals();
      setTimeout(function () {
        var btn = document.querySelectorAll("[onclick*=\x27dealForm\x27]")[0];
        if (btn) btn.setAttribute('onclick', 'window.__openDealPanel()');
                // addSlot buttons keep original onclick
      }, 50);
    };
    drawDeals.__sp = true;
  }

  var origDrawPeople = (typeof drawPeople === 'function' && !drawPeople.__sp) ? drawPeople : null;
  if (origDrawPeople) {
    drawPeople = function (kind) {
      origDrawPeople(kind);
      setTimeout(function () {
        var btns = document.querySelectorAll('[onclick*="document.getElementById(\'form\').hidden=false"]');
        btns.forEach(function (b) {
          if (kind === 'contacts') b.setAttribute('onclick', 'window.__openContactPanel()');
          else b.setAttribute('onclick', 'window.__openCompanyPanel()');
        });
        var emptyBtns = document.querySelectorAll('.empty button, .contact-empty button');
        emptyBtns.forEach(function (b) {
          if (kind === 'contacts') b.setAttribute('onclick', 'window.__openContactPanel()');
          else b.setAttribute('onclick', 'window.__openCompanyPanel()');
        });
      }, 50);
    };
    drawPeople.__sp = true;
  }

  var origDrawTasks = (typeof drawTasks === 'function' && !drawTasks.__sp) ? drawTasks : null;
  if (origDrawTasks) {
    drawTasks = function () {
      origDrawTasks();
      setTimeout(function () {
        var btns = document.querySelectorAll('[onclick*="taskForm"]');
        btns.forEach(function (b) { b.setAttribute('onclick', 'window.__openTaskPanel()'); });
      }, 50);
    };
    drawTasks.__sp = true;
  }

  var origDrawLeads = (typeof drawLeads === 'function' && !drawLeads.__sp) ? drawLeads : null;
  if (origDrawLeads) {
    drawLeads = function () {
      origDrawLeads();
      setTimeout(function () {
        var btn = document.querySelectorAll("[onclick*=\x27leadForm\x27]")[0];
        if (btn) btn.setAttribute('onclick', 'window.__openLeadPanel()');
      }, 50);
    };
    drawLeads.__sp = true;
  }

  // --- Override the header "+" Create button to use side panels ---
  var origToggleCreate = (typeof toggleCreate === 'function') ? toggleCreate : null;
  if (origToggleCreate && !origToggleCreate.__sp) {
    toggleCreate = function () {
      var menu = document.getElementById('createMenu');
      var open = menu.style.display === 'block';
      menu.style.display = 'none';
      if (open) return;
      // Show a quick menu using side panels
      window.openSidePanel('Quick create',
        '<p style="color:#64748b;font-size:13px;margin:0 0 16px">Choose what to create:</p>' +
        '<button type="button" style="width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;border-radius:10px;border:1px solid #e8e6e1;background:#fff;cursor:pointer;font-size:14px;color:#0f172a" onclick="window.closeSidePanel();window.__openContactPanel()">👤 Contact</button>' +
        '<button type="button" style="width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;border-radius:10px;border:1px solid #e8e6e1;background:#fff;cursor:pointer;font-size:14px;color:#0f172a" onclick="window.closeSidePanel();window.__openCompanyPanel()">🏢 Company</button>' +
        '<button type="button" style="width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;border-radius:10px;border:1px solid #e8e6e1;background:#fff;cursor:pointer;font-size:14px;color:#0f172a" onclick="window.closeSidePanel();window.__openDealPanel()">📊 Deal</button>' +
        '<button type="button" style="width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;border-radius:10px;border:1px solid #e8e6e1;background:#fff;cursor:pointer;font-size:14px;color:#0f172a" onclick="window.closeSidePanel();window.__openTaskPanel()">✓ Task</button>' +
        '<button type="button" style="width:100%;text-align:left;padding:12px 14px;border-radius:10px;border:1px solid #e8e6e1;background:#fff;cursor:pointer;font-size:14px;color:#0f172a" onclick="window.closeSidePanel();window.__openLeadPanel()">🎯 Lead</button>',
        '<button type="button" class="ghost" onclick="window.closeSidePanel()">Cancel</button>'
      );
    };
    toggleCreate.__sp = true;
  }

  // --- INTEGRATION PROMPTS (contextual, HubSpot-style) ---
  style.textContent += `
    .integration-prompt {
      margin: 12px 0; padding: 14px 16px; border-radius: 12px;
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #fde68a;
      display: flex; align-items: center; gap: 12px;
    }
    [data-theme="dark"] .integration-prompt {
      background: linear-gradient(135deg, #422006 0%, #78350f 100%);
      border-color: #92400e;
    }
    .integration-prompt .prompt-ico { font-size: 20px; flex-shrink: 0; }
    .integration-prompt .prompt-text { flex: 1; font-size: 13px; color: #475569; line-height: 1.4; }
    [data-theme="dark"] .integration-prompt .prompt-text { color: #fcd34d; }
    .integration-prompt .prompt-text b { color: #0f172a; }
    [data-theme="dark"] .integration-prompt .prompt-text b { color: #fef3c7; }
    .integration-prompt button {
      font-size: 12px; padding: 6px 14px; border-radius: 8px;
      background: #f59e0b; color: #fff; border: 0; font-weight: 600;
      cursor: pointer; white-space: nowrap; flex-shrink: 0;
    }
    .integration-prompt button:hover { background: #d97706; }
    .integration-prompt .dismiss { background: transparent; color: #94a3b8; padding: 4px; border: 0; font-size: 16px; cursor: pointer; }
  `;

  // Show integration prompts on relevant pages
  var origDrawHome2 = (typeof drawHome === 'function' && !drawHome.__ip) ? drawHome : null;
  if (origDrawHome2) {
    drawHome = function () {
      origDrawHome2();
      setTimeout(function () {
        if (localStorage.getItem('afri.prompt.gmail')) return;
        var view = document.getElementById('view');
        if (!view) return;
        var prompt = document.createElement('div');
        prompt.className = 'integration-prompt';
        prompt.innerHTML =
          '<div class="prompt-ico">📅</div>' +
          '<div class="prompt-text"><b>Connect your calendar</b><br>See your meetings and tasks on your Google or Outlook calendar.</div>' +
          '<button onclick="go(\'settings\')">Connect</button>' +
          '<button class="dismiss" onclick="this.parentElement.remove();localStorage.setItem(\'afri.prompt.gmail\',\'1\')">×</button>';
        view.insertBefore(prompt, view.firstChild);
      }, 100);
    };
    drawHome.__ip = true;
  }

  // --- LIST VIEW POLISH (proper column alignment) ---
  style.textContent += `
    .sheet table { border-collapse: collapse; width: 100%; }
    .sheet th { font-size: 11px !important; font-weight: 600 !important; text-transform: uppercase; letter-spacing: 0.04em; color: #94a3b8 !important; padding: 10px 14px !important; background: #f8fafc; }
    [data-theme="dark"] .sheet th { background: #0f172a !important; color: #64748b !important; }
    .sheet td { padding: 12px 14px !important; font-size: 13px; vertical-align: middle; }
    .sheet tr:hover td { background: #f8fafc; }
    [data-theme="dark"] .sheet tr:hover td { background: #182234; }
    .sheet .linkish { color: #0d9488; font-weight: 500; cursor: pointer; }
    .sheet .linkish:hover { text-decoration: underline; }
  `;

  // --- CALENDAR MOBILE LAYOUT ---
  style.textContent += `
    @media (max-width: 680px) {
      .cal-grid { grid-template-columns: 1fr !important; }
      .cal-day { min-height: 60px; padding: 6px; }
      .cal-event { font-size: 10px; padding: 2px 4px; }
    }
  `;


  style.textContent += `
  /* === MOBILE OPTIMIZATIONS === */
  @media (max-width: 880px) {
    .actdash { grid-template-columns: 1fr !important; }
    .actgrid { grid-template-columns: 1fr !important; }
    .pulse { grid-template-columns: repeat(2, 1fr) !important; }
    .split { grid-template-columns: 1fr !important; }
    .pipe { grid-template-columns: 1fr !important; }
    .leadboard { scroll-snap-type: x mandatory; }
    .leadcol { min-width: 85vw !important; scroll-snap-align: center; }
    .dealcard { padding: 10px; }
    .deal-amount { font-size: 18px !important; }
    .contact-card { padding: 14px; }
    .task-card { padding: 12px; }
    .cmdk-card { width: 100% !important; }
    .wizard-card { width: 100% !important; border-radius: 16px; }
    .csv-card { width: 100% !important; }
    .side-panel { width: 100% !important; }
    .shortcuts-card { width: 100% !important; }
    .gate-grid { grid-template-columns: 1fr !important; }
    .gate .panel { padding: 20px; }
    .board-head h1 { font-size: 20px !important; }
    .board-head .hello { font-size: 12px !important; }
    .dealboard .col { max-height: none !important; }
    .filters select, .filters input { width: auto; }
    .reports { grid-template-columns: repeat(2, 1fr) !important; }
    .report > div { font-size: 20px !important; }
    .forecast-bar-row { grid-template-columns: 80px 1fr 60px !important; font-size: 12px !important; }
    .forecast-bar-row .bar-track { height: 18px !important; }
  }
`;

  // ============================================================
  // INTEGRATION MARKETPLACE + API KEYS + WEBHOOKS UI
  // ============================================================
  style.textContent += `
    .integration-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
    .integration-card { background: var(--card, #fff); border: 1px solid var(--border, #e8e6e1); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: border-color 0.12s; }
    .integration-card:hover { border-color: #14b8a6; }
    .integration-card .top { display: flex; align-items: center; gap: 12px; }
    .integration-card .ico { width: 44px; height: 44px; border-radius: 12px; background: #f1f0ec; display: grid; place-items: center; font-size: 22px; flex-shrink: 0; }
    .integration-card .info { flex: 1; min-width: 0; }
    .integration-card .info b { font-size: 15px; color: #0f172a; display: block; }
    .integration-card .info span { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
    .integration-card .desc { font-size: 12px; color: #64748b; line-height: 1.5; }
    .integration-card .status-badge { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; align-self: flex-start; }
    .integration-card .status-badge.connected { background: #dcfce7; color: #166534; }
    .integration-card .status-badge.ready { background: #dbeafe; color: #1e40af; }
    .integration-card .status-badge.not_configured { background: #f1f5f9; color: #64748b; }
    .integration-card .status-badge.coming_soon { background: #fef3c7; color: #92400e; }
    .integration-card .status-badge.always { background: #f0fdfa; color: #0d9488; }
    .integration-card button { font-size: 12px; padding: 6px 14px; border-radius: 8px; align-self: flex-start; }
    .integration-card button.connect { background: #0d9488; color: #fff; border: 0; }
    .integration-card button.configure { background: transparent; color: #0d9488; border: 1px solid #99f6e4; }
    .danger-btn { background: #dc2626; color: #fff; border: 0; padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.12s; }
    .danger-btn:hover { background: #b91c1c; }
    .danger-btn:disabled { background: #94a3b8; cursor: not-allowed; }
    .api-key-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .api-key-row:last-child { border-bottom: 0; }
    .api-key-row .key-info { flex: 1; }
    .api-key-row .key-info b { font-size: 14px; color: #0f172a; display: block; }
    .api-key-row .key-info span { font-size: 12px; color: #64748b; font-family: ui-monospace, monospace; }
    .webhook-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
    .webhook-row:last-child { border-bottom: 0; }
    .webhook-row .url { flex: 1; font-family: ui-monospace, monospace; font-size: 12px; color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  `;

  window.drawIntegrations = async function () {
    var el = document.getElementById('view');
    el.innerHTML = '<div class="board-head"><div><h1>Integrations</h1><p class="hello">Connect your apps to Afri CRM in one click</p></div></div><div id="oauthSetupSection" style="margin-bottom:24px"></div><div id="intGrid" class="integration-grid">Loading...</div><div id="apiKeySection" style="margin-top:24px"></div><div id="webhookSection" style="margin-top:24px"></div>';
    var data = await api('/crm/api/integrations');
    var grid = document.getElementById('intGrid');
    if (!data || data.error) { grid.innerHTML = '<p class="hello">Could not load integrations.</p>'; return; }
    // Check if we just came back from OAuth (URL ?tool=gmail)
    var returnedTool = new URLSearchParams(location.search).get('tool');
    if (returnedTool) {
      var toastMsg = returnedTool === 'failed' ? 'Connection failed. Try again or contact your admin.' : ('Connected ' + returnedTool + ' successfully.');
      toast(toastMsg);
      history.replaceState(null, '', '/crm');
    }
    grid.innerHTML = data.map(function(i) {
      var statusClass = i.status === 'connected' ? 'connected' : i.status === 'ready' ? 'ready' : i.status === 'coming_soon' ? 'coming_soon' : i.status === 'always' ? 'always' : 'not_configured';
      var statusLabel = i.status === 'connected' ? ('Connected' + (i.email ? ' · ' + esc(i.email) : '')) : i.status === 'ready' ? 'Ready' : i.status === 'coming_soon' ? 'Coming soon' : i.status === 'always' ? 'Available' : 'Not configured';
      var btn = '';
      if (i.status === 'connected') {
        // Real disconnect
        if (i.id === 'gmail' || i.id === 'google_calendar') btn = '<button class="ghost" onclick="window.__disconnectOAuth(\'gmail\',\'google_calendar\')">Disconnect</button>';
        else if (i.id === 'outlook') btn = '<button class="ghost" onclick="window.__disconnectOAuth(\'outlook\')">Disconnect</button>';
        else btn = '<button class="configure" onclick="go(\'settings\')">Settings</button>';
      }
      else if (i.status === 'ready') {
        // Real OAuth navigation — this is the magic
        if (i.oauthUrl) btn = '<button class="connect" onclick="window.__startOAuth(\'' + i.oauthUrl + '\')">Connect</button>';
        else btn = '<button class="connect" onclick="go(\'settings\')">Connect</button>';
      }
      else if (i.status === 'not_configured') {
        // For email/calendar/outlook: show "Set up" → opens setup panel
        if (i.id === 'gmail' || i.id === 'google_calendar' || i.id === 'outlook') btn = '<button class="configure" onclick="window.__showOAuthSetup({scroll:true})">Set up</button>';
        else if (i.id === 'whatsapp' || i.id === 'email' || i.id === 'flutterwave' || i.id === 'paystack' || i.id === 'gemini') btn = '<span style="font-size:11px;color:#94a3b8">Admin only</span>';
        else btn = '<button class="configure" onclick="go(\'settings\')">Configure</button>';
      }
      else if (i.status === 'always') btn = '<button class="connect" onclick="window.__showApiKeys()">Manage</button>';
      else if (i.status === 'coming_soon') btn = '<span style="font-size:11px;color:#94a3b8">Notify me</span>';
      var platformBadge = i.platform ? '<span style="font-size:10px;color:#0d9488;font-weight:600;text-transform:uppercase;letter-spacing:0.04em">Platform</span>' : '';
      return '<div class="integration-card"><div class="top"><div class="ico">' + i.icon + '</div><div class="info"><b>' + esc(i.name) + '</b><span>' + esc(i.category) + '</span></div></div>' + (platformBadge ? '<div>' + platformBadge + '</div>' : '') + '<p class="desc">' + esc(i.description) + '</p><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><span class="status-badge ' + statusClass + '">' + statusLabel + '</span>' + btn + '</div></div>';
    }).join('');
    // Load OAuth setup panel
    if (window.__showOAuthSetup) window.__showOAuthSetup();
    // Load API keys
    window.__showApiKeys();
    // Load webhooks
    window.__showWebhooks();
  };

  // Start OAuth — open Google/Microsoft consent in same tab
  window.__startOAuth = async function (path) {
    var res = await api(path);
    if (res && res.url) {
      // Server returns a URL string — go straight there
      window.location.href = res.url;
      return;
    }
    // Some routes return a redirect directly — just navigate
    if (res && res.error) {
      if (res.error.indexOf('not switched on') >= 0 || res.error.indexOf('not configured') >= 0) {
        toast('Admin needs to set up Google credentials first');
        if (window.__showOAuthSetup) window.__showOAuthSetup();
        return;
      }
      toast(res.error);
    } else {
      // Fallback — direct navigation triggers the OAuth flow
      window.location.href = path;
    }
  };

  // Disconnect OAuth provider
  window.__disconnectOAuth = async function (provider, alsoProvider) {
    if (!confirm('Disconnect ' + provider + '? You can reconnect any time.')) return;
    await api('/crm/api/connect/' + provider, { method: 'DELETE' });
    if (alsoProvider) await api('/crm/api/connect/' + alsoProvider, { method: 'DELETE' });
    toast('Disconnected');
    window.drawIntegrations();
  };

  // OAuth setup panel — shows redirect URL + Railway env vars + console links
  // Works in BOTH contexts: Integrations page (oauthSetupSection) AND Settings tab (oauthSetupInline)
  window.__showOAuthSetup = async function (opts) {
    var el = document.getElementById('oauthSetupSection') || document.getElementById('oauthSetupInline');
    if (!el) return;
    var setup = await api('/crm/api/oauth/setup');
    if (!setup || setup.error) { el.innerHTML = ''; return; }
    var anyEnabled = setup.providers.some(function(p) { return p.platform_enabled; });
    var banner = anyEnabled
      ? '<div style="background:#dcfce7;border:1px solid #86efac;border-radius:12px;padding:12px 16px;margin-bottom:12px;display:flex;gap:10px;align-items:center"><span style="font-size:20px">✓</span><div><b style="color:#166534;font-size:13px">Platform OAuth enabled</b><p style="color:#15803d;font-size:12px;margin:2px 0 0">Users can click Connect Gmail/Outlook — Google will ask them to allow Afri CRM. No further setup needed.</p></div></div>'
      : '<div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:12px;padding:12px 16px;margin-bottom:12px;display:flex;gap:10px;align-items:center"><span style="font-size:20px">⚠</span><div><b style="color:#92400e;font-size:13px">Action needed: enable one-click Connect</b><p style="color:#b45309;font-size:12px;margin:2px 0 0">You (workspace owner) need to register OAuth clients with Google and Microsoft, then add the env vars to Railway. The steps + redirect URLs are below — one-time setup.</p></div></div>';
    var cards = setup.providers.map(function(p) {
      var redirectHtml = p.redirect_urls.map(function(u) {
        return '<div style="display:flex;gap:6px;align-items:center;margin:4px 0"><code style="font-family:ui-monospace,monospace;font-size:11px;color:#0d9488;background:#f0fdfa;padding:4px 8px;border-radius:6px;word-break:break-all;flex:1">' + esc(u) + '</code><button type="button" class="ghost" style="font-size:10px;padding:4px 8px;flex-shrink:0" onclick="navigator.clipboard.writeText(\'' + esc(u) + '\').then(function(){toast(\'Redirect URL copied\')})">Copy</button></div>';
      }).join('');
      var envHtml = '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:4px"><code style="font-family:ui-monospace,monospace;font-size:11px;color:#1e40af;background:#dbeafe;padding:2px 6px;border-radius:4px">' + esc(p.env_vars.client_id) + '</code><code style="font-family:ui-monospace,monospace;font-size:11px;color:#1e40af;background:#dbeafe;padding:2px 6px;border-radius:4px">' + esc(p.env_vars.client_secret) + '</code></div>';
      var statusBadge = p.platform_enabled
        ? '<span class="status-badge connected" style="background:#dcfce7;color:#166534">Enabled</span>'
        : '<span class="status-badge not_configured" style="background:#fef3c7;color:#92400e">Not enabled</span>';
      var stepsHtml = '<ol style="margin:8px 0 0 18px;padding:0;font-size:12px;color:#475569;line-height:1.7">' + p.steps.map(function(s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
      return '<div style="border:1px solid #e8e6e1;border-radius:14px;padding:18px;margin-bottom:12px;background:var(--card,#fff)" data-oauth-card="' + p.id + '"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap"><div><b style="font-size:15px;color:#0f172a">' + esc(p.name) + '</b><div style="margin-top:4px">' + statusBadge + '</div></div><a href="' + esc(p.console_url) + '" target="_blank" rel="noopener" style="font-size:12px;background:#0d9488;color:#fff;padding:6px 12px;border-radius:8px;text-decoration:none">Open console →</a></div><div style="margin-top:12px"><b style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Authorized redirect URI</b>' + redirectHtml + '</div><div style="margin-top:12px"><b style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Railway env vars</b>' + envHtml + '</div><div style="margin-top:12px"><b style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Steps</b>' + stepsHtml + '</div><details style="margin-top:12px"><summary style="font-size:12px;color:#0d9488;cursor:pointer;font-weight:600">Or use your own client (per-workspace)</summary><div style="margin-top:8px"><label style="font-size:12px;color:#475569">Client ID<input id="ownCred_' + p.id + '_id" placeholder="Paste client ID" style="margin-top:4px"></label><label style="font-size:12px;color:#475569;margin-top:8px;display:block">Client secret<input id="ownCred_' + p.id + '_secret" type="password" placeholder="Paste client secret" style="margin-top:4px"></label><button type="button" onclick="window.__saveOwnCred(\'' + p.id + '\')" style="margin-top:8px">Save credentials</button><button type="button" class="ghost" onclick="window.__removeOwnCred(\'' + p.id + '\')" style="margin-top:8px;margin-left:6px">Remove</button><div id="ownCredResult_' + p.id + '"></div></div></details></div>';
    }).join('');
    el.innerHTML = '<div class="card" id="oauthSetupCard"><h2>OAuth setup</h2>' + banner + '<p class="hello" style="margin-bottom:12px">To enable one-click Connect for <b>Gmail</b>, <b>Google Calendar</b>, and <b>Outlook</b>, the workspace owner registers OAuth clients with Google and Microsoft. This is a one-time setup — after that, every user just clicks Connect.</p>' + cards + '</div>';
    // If requested, scroll to and highlight the panel
    if (opts && opts.scroll) {
      var card = document.getElementById('oauthSetupCard');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transition = 'box-shadow 0.3s';
        card.style.boxShadow = '0 0 0 4px #14b8a6';
        setTimeout(function() { card.style.boxShadow = ''; }, 1800);
      }
    }
  };
  window.__saveOwnCred = async function (provider) {
    var id = (document.getElementById('ownCred_' + provider + '_id') || {}).value;
    var secret = (document.getElementById('ownCred_' + provider + '_secret') || {}).value;
    if (!id || !secret) { toast('Paste both ID and secret'); return; }
    var res = await api('/crm/api/oauth/credentials/' + provider, { method: 'POST', body: JSON.stringify({ clientId: id, clientSecret: secret }) });
    var el = document.getElementById('ownCredResult_' + provider);
    if (res && !res.error) {
      el.innerHTML = '<p style="color:#0d9488;font-size:12px">Saved — users can now click Connect.</p>';
      toast('Credentials saved');
      window.drawIntegrations();
    } else {
      el.innerHTML = '<p style="color:#b91c1c;font-size:12px">' + esc(res && res.error || 'Could not save') + '</p>';
    }
  };
  window.__removeOwnCred = async function (provider) {
    if (!confirm('Remove your ' + provider + ' credentials? Connected accounts will be signed out.')) return;
    await api('/crm/api/oauth/credentials/' + provider, { method: 'DELETE' });
    toast('Removed');
    window.drawIntegrations();
  };

  window.__showApiKeys = async function () {
    var el = document.getElementById('apiKeySection');
    if (!el) return;
    var keys = await api('/crm/api/api-keys');
    var list = (Array.isArray(keys) ? keys : []).map(function(k) {
      return '<div class="api-key-row"><div class="key-info"><b>' + esc(k.name) + '</b><span>' + esc(k.prefix) + ' · Last used: ' + (k.lastUsedAt ? when(k.lastUsedAt) : 'never') + ' · Created: ' + when(k.createdAt) + '</span></div><button class="ghost" onclick="window.__revokeKey(\'' + k.id + '\')">Revoke</button></div>';
    }).join('') || '<p class="hello">No API keys yet.</p>';
    el.innerHTML = '<div class="card"><h2>API Keys</h2><p class="hello" style="margin-bottom:12px">Generate keys for external apps to access your CRM data. Authenticate requests with <code style="background:#f1f0ec;padding:2px 6px;border-radius:4px;font-size:11px">X-API-Key</code> header.</p>' + list + '<div style="margin-top:12px"><label style="font-size:13px;font-weight:500;color:#475569">Key name<input id="newKeyName" placeholder="Zapier integration" style="margin-top:4px"></label><button type="button" onclick="window.__createKey()">Generate key</button></div><div id="newKeyResult"></div></div>';
  };
  window.__createKey = async function () {
    var name = (document.getElementById('newKeyName') || {}).value;
    if (!name) { toast('Name the key'); return; }
    var res = await api('/crm/api/api-keys', { method: 'POST', body: JSON.stringify({ name: name }) });
    var el = document.getElementById('newKeyResult');
    if (res && !res.error) {
      el.innerHTML = '<div style="background:#f0fdfa;border:1px dashed #99f6e4;border-radius:10px;padding:14px;margin-top:10px"><b style="color:#0d9488;font-size:11px;text-transform:uppercase;letter-spacing:0.05em">Your API key (save it — shown once)</b><p style="font-family:ui-monospace,monospace;font-size:14px;color:#0f172a;margin:6px 0 0;word-break:break-all">' + esc(res.key) + '</p></div>';
      toast('API key created');
      window.__showApiKeys();
    } else {
      el.innerHTML = '<p style="color:#b91c1c">' + esc(res && res.error || 'Could not create') + '</p>';
    }
  };
  window.__revokeKey = async function (id) {
    if (!confirm('Revoke this API key? Apps using it will lose access.')) return;
    await api('/crm/api/api-keys/' + id, { method: 'DELETE' });
    toast('Key revoked');
    window.__showApiKeys();
  };

  window.__showWebhooks = async function () {
    var el = document.getElementById('webhookSection');
    if (!el) return;
    var hooks = await api('/crm/api/webhooks');
    var list = (Array.isArray(hooks) ? hooks : []).map(function(h) {
      return '<div class="webhook-row"><div class="url">' + esc(h.url) + '</div><span style="font-size:11px;color:#64748b">' + esc(h.events || '*') + '</span><button class="ghost" onclick="window.__deleteWebhook(\'' + h.id + '\')">Delete</button></div>';
    }).join('') || '<p class="hello">No webhooks yet.</p>';
    el.innerHTML = '<div class="card"><h2>Webhooks</h2><p class="hello" style="margin-bottom:12px">Receive data from external apps. POST to <code style="background:#f1f0ec;padding:2px 6px;border-radius:4px;font-size:11px">/crm/api/webhook/[id]</code> with JSON body. Sign with <code style="background:#f1f0ec;padding:2px 6px;border-radius:4px;font-size:11px">X-Afri-Signature</code> header (HMAC-SHA256).</p>' + list + '<div style="margin-top:12px"><label style="font-size:13px;font-weight:500;color:#475569">Name<input id="newHookName" placeholder="Contact form" style="margin-top:4px"></label><label style="font-size:13px;font-weight:500;color:#475569;margin-top:10px">Webhook URL (https://...) <input id="newHookUrl" placeholder="https://your-app.com/webhook" style="margin-top:4px"></label><label style="font-size:13px;font-weight:500;color:#475569;margin-top:10px">Events (comma-separated, * for all)<input id="newHookEvents" placeholder="contact.created,deal.created" style="margin-top:4px"></label><button type="button" onclick="window.__createWebhook()" style="margin-top:10px">Create webhook</button><div id="newHookResult"></div></div></div>';
  };
  window.__createWebhook = async function () {
    var name = (document.getElementById('newHookName') || {}).value;
    var url = (document.getElementById('newHookUrl') || {}).value;
    var events = (document.getElementById('newHookEvents') || {}).value;
    if (!name || !url) { toast('Name and URL required'); return; }
    var res = await api('/crm/api/webhooks', { method: 'POST', body: JSON.stringify({ name: name, url: url, events: events || '*' }) });
    var el = document.getElementById('newHookResult');
    if (res && !res.error) {
      el.innerHTML = '<div style="background:#f0fdfa;border:1px dashed #99f6e4;border-radius:10px;padding:14px;margin-top:10px"><b style="color:#0d9488;font-size:11px;text-transform:uppercase">Webhook created</b><p style="font-size:12px;color:#475569;margin:6px 0 4px">Inbound URL: <code style="font-family:ui-monospace,monospace;font-size:11px;word-break:break-all">/crm/api/webhook/' + res.id + '</code></p><p style="font-size:12px;color:#475569;margin:0">Secret: <code style="font-family:ui-monospace,monospace;font-size:11px;word-break:break-all">' + esc(res.secret) + '</code></p></div>';
      toast('Webhook created');
      window.__showWebhooks();
    } else {
      el.innerHTML = '<p style="color:#b91c1c">' + esc(res && res.error || 'Could not create') + '</p>';
    }
  };
  window.__deleteWebhook = async function (id) {
    if (!confirm('Delete this webhook?')) return;
    await api('/crm/api/webhooks/' + id, { method: 'DELETE' });
    toast('Webhook deleted');
    window.__showWebhooks();
  };

})();

