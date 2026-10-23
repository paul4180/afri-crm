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

    /* Softer global background — now uses the Outlook-style mountain-lake
       night-sky wallpaper as the page background, with frosted-glass
       panels on top (glassmorphism). Same effect as Outlook on Windows 11. */
    body {
      background: url('/wallpaper.jpg') no-repeat center center fixed !important;
      background-size: cover !important;
      color: #1e293b;
      min-height: 100vh;
    }
    [data-theme="dark"] body {
      background: url('/wallpaper.jpg') no-repeat center center fixed !important;
      background-size: cover !important;
      color: #e2e8f0;
    }
    /* ============================================================
       FROSTED-GLASS SHELL + OPAQUE CARDS = CRISP TEXT READABILITY
       Design philosophy (matching Windows 11 desktop pattern):
       - Body has the wallpaper (visible at the edges)
       - #app shell = VERY translucent (0.18 opacity, 20px blur) →
         dreamy wallpaper blur visible behind everything
       - Cards = OPAQUE (rgba 0.96) → text perfectly crisp, no smear
       - NO backdrop-filter on cards (avoids GPU compositing text blur)
       - Strong borders + drop shadows so cards stand out from wallpaper
       This is what Windows 11 does: wallpaper visible behind windows,
       but windows themselves are solid (text is crisp).
       Mobile keeps a solid background (no wallpaper for performance).
       ============================================================ */
    #app, #view {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-theme="dark"] #app, [data-theme="dark"] #view {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    /* Login/signup gate — opaque enough to read the form */
    .gate, .setup {
      background: rgba(250, 249, 247, 0.85) !important;
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
    }
    [data-theme="dark"] .gate, [data-theme="dark"] .setup {
      background: rgba(11, 18, 32, 0.88) !important;
      backdrop-filter: blur(24px) saturate(180%);
      -webkit-backdrop-filter: blur(24px) saturate(180%);
    }
    /* CARDS = OPAQUE — text is perfectly crisp, no GPU blur smear.
       This is the key fix for the "blurry letters" problem.
       Strong border + shadow makes cards stand out from the wallpaper
       visible through the translucent #app shell. */
    .card, .leadcard, .today-stat, .dealboard .col, .leadcol {
      background: #ffffff !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.06) !important;
    }
    [data-theme="dark"] .card, [data-theme="dark"] .leadcard,
    [data-theme="dark"] .today-stat, [data-theme="dark"] .dealboard .col,
    [data-theme="dark"] .leadcol {
      background: #1e293b !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.2) !important;
    }
    /* FONT SMOOTHING — antialiased rendering for clearer letters */
    body, #view, #view *, .card, .leadcard, .today-stat {
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
      text-rendering: optimizeLegibility !important;
    }
    #view h1, #view h2, #view h3, #view b, #view strong { font-weight: 600 !important; }
    #view, #view * { text-shadow: none !important; }
    [data-theme="dark"] #view { color: #e7edf5; }
    /* Muted/meta text — brighter in dark mode for readability */
    [data-theme="dark"] #view .meta, [data-theme="dark"] #view .hello,
    [data-theme="dark"] #view .sub {
      color: rgba(255, 255, 255, 0.85) !important;
    }
    /* Large numbers (deal amounts, stats) — make them pop */
    [data-theme="dark"] #view .deal-amount, [data-theme="dark"] #view .today-stat b,
    [data-theme="dark"] #view .forecast-stat .value {
      color: #fff !important;
      font-weight: 700 !important;
    }
    .gate, .setup {
      min-height: 100vh !important;
      place-items: center !important;
      padding: 32px 16px !important;
    }

    /* ============================================================
       MOBILE COMPATIBILITY — disable wallpaper + frosted glass on
       mobile for performance + readability. Mobile uses solid
       backgrounds and the existing mobile shell styles.
       ============================================================ */
    [data-shell="mobile"] body {
      background: var(--m-bg, #0f172a) !important;
    }
    [data-shell="mobile"] #app, [data-shell="mobile"] #view {
      background: transparent !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-shell="mobile"] .card, [data-shell="mobile"] .leadcard,
    [data-shell="mobile"] .today-stat {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }

    /* ============================================================
       DESIGNED ICON-ONLY VERTICAL SIDEBAR (64px wide)
       NO PANEL BACKGROUND — the wallpaper shows directly behind
       the icons. Each icon is a self-contained colorful gradient
       circle (like Windows taskbar icons), always colored — not
       just on hover. Active icon gets a white ring.
       Categories:
         • Home = teal/cyan gradient (primary brand)
         • Selling (deals, opportunities, leads) = teal/green
         • People (contacts, companies) = blue
         • Work (tasks, calendar, inbox, feed) = orange/amber
         • Insights (forecast, dashboard) = purple
         • Platform (automation, integrations, guide) = slate gray
       ============================================================ */
    #nav {
      width: 64px !important;
      min-width: 64px !important;
      max-width: 64px !important;
      /* Dark glass rail, like Outlook's folder pane */
      background: rgba(15, 18, 32, 0.86) !important;
      backdrop-filter: blur(16px) saturate(140%) !important;
      -webkit-backdrop-filter: blur(16px) saturate(140%) !important;
      border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
      padding: 8px 0 !important;
      overflow: visible !important;
      box-shadow: none !important;
    }
    [data-theme="light"] #nav {
      background: rgba(255, 255, 255, 0.82) !important;
      border-right-color: rgba(0, 0, 0, 0.06) !important;
    }
    /* Brand area — show only the A logo */
    #nav .brand {
      display: flex !important;
      justify-content: center !important;
      padding: 8px 0 16px !important;
      margin: 0 !important;
    }
    #nav .brand > div { display: none !important; }
    #nav .brand .logo {
      width: 44px !important;
      height: 44px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 14px !important;
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%) !important;
      color: #fff !important;
      font-weight: 800 !important;
      font-size: 20px !important;
      box-shadow: 0 6px 16px rgba(13, 148, 136, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }
    /* Hide section labels in icon-only mode */
    #nav .navlabel { display: none !important; }
    /* Nav scroll area — vertical icon column */
    #nav .navscroll {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 0 !important;
    }
    /* Each nav button — 40x40 rounded icon button.
       Base state: NO background (transparent). On hover/active, the
       category gradient fills the button. */
    #nav [data-page], #nav button:not(.fold) {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      padding: 0 !important;
      margin: 0 !important;
      border-radius: 12px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      background: rgba(255, 255, 255, 0.08) !important;
      color: rgba(255, 255, 255, 0.85) !important;
      position: relative !important;
      transition: all 0.2s ease !important;
      cursor: pointer !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(4px) !important;
      -webkit-backdrop-filter: blur(4px) !important;
    }
    [data-theme="light"] #nav [data-page],
    [data-theme="light"] #nav button:not(.fold) {
      background: rgba(15, 23, 42, 0.05) !important;
      color: rgba(15, 23, 42, 0.75) !important;
      border-color: rgba(0, 0, 0, 0.08) !important;
    }
    /* Hide the text label inside buttons — show only the .ico span */
    #nav [data-page] > span:not(.ico),
    #nav button:not(.fold) > span:not(.ico):not(.chev) { display: none !important; }
    #nav .chev { display: none !important; }

    /* ===== CATEGORY-COLORED GRADIENT ICON BACKGROUNDS =====
       On hover OR active, each icon gets its category gradient. */

    /* HOME — teal/cyan gradient */
    #nav [data-page="home"]:hover, #nav [data-page="home"][class*="on"] {
      background: linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #0e7490 100%) !important;
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 4px 14px rgba(6, 182, 212, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }
    /* SELLING (deals, opportunities, leads) — teal/green gradient */
    #nav [data-page="deals"]:hover, #nav [data-page="deals"][class*="on"],
    #nav [data-page="opportunities"]:hover, #nav [data-page="opportunities"][class*="on"],
    #nav [data-page="leads"]:hover, #nav [data-page="leads"][class*="on"] {
      background: linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f766e 100%) !important;
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }
    /* PEOPLE (contacts, companies) — blue gradient */
    #nav [data-page="contacts"]:hover, #nav [data-page="contacts"][class*="on"],
    #nav [data-page="companies"]:hover, #nav [data-page="companies"][class*="on"] {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%) !important;
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }
    /* WORK (tasks, calendar, inbox, feed) — orange/amber gradient */
    #nav [data-page="tasks"]:hover, #nav [data-page="tasks"][class*="on"],
    #nav [data-page="calendar"]:hover, #nav [data-page="calendar"][class*="on"],
    #nav [data-page="inbox"]:hover, #nav [data-page="inbox"][class*="on"],
    #nav [data-page="feed"]:hover, #nav [data-page="feed"][class*="on"] {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%) !important;
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 4px 14px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }
    /* INSIGHTS (forecast, dashboard) — purple gradient */
    #nav [data-page="forecast"]:hover, #nav [data-page="forecast"][class*="on"],
    #nav [data-page="dashboard"]:hover, #nav [data-page="dashboard"][class*="on"] {
      background: linear-gradient(135deg, #a855f7 0%, #9333ea 50%, #7c3aed 100%) !important;
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }
    /* PLATFORM (automation, integrations, guide) — slate gradient */
    #nav [data-page="automation"]:hover, #nav [data-page="automation"][class*="on"],
    #nav [data-page="integrations"]:hover, #nav [data-page="integrations"][class*="on"],
    #nav [data-page="guide"]:hover, #nav [data-page="guide"][class*="on"] {
      background: linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%) !important;
      color: #fff !important;
      border-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 4px 14px rgba(100, 116, 139, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    }

    /* Active page indicator — glowing vertical accent bar on LEFT edge */
    #nav [data-page][class*="on"]::before,
    #nav [data-page][aria-current="page"]::before {
      content: '' !important;
      position: absolute !important;
      left: -10px !important;
      top: 10px !important;
      bottom: 10px !important;
      width: 4px !important;
      border-radius: 0 4px 4px 0 !important;
      background: #14b8a6 !important;
      box-shadow: 0 0 10px rgba(20, 184, 166, 0.7) !important;
    }
    /* Navfoot — vertical stack of More + fold buttons */
    #nav .navfoot, #nav .navend {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 8px 0 !important;
    }
    #nav #setupCard { display: none !important; }
    /* Icon size — slightly larger + thicker stroke for better visibility */
    #nav .ico {
      width: 24px !important;
      height: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }
    #nav .ico svg {
      width: 24px !important;
      height: 24px !important;
      stroke-width: 1.6 !important;
    }
    /* When icon button has gradient bg, make icon stroke pure white */
    #nav [data-page]:hover .ico svg, #nav [data-page][class*="on"] .ico svg {
      stroke: #fff !important;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25)) !important;
    }
    /* CSS-only tooltip on hover */
    #nav [data-page]:hover::after,
    #nav button:not(.fold):hover::after {
      content: attr(data-tooltip) !important;
      position: absolute !important;
      left: calc(100% + 14px) !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      background: rgba(15, 23, 42, 0.95) !important;
      color: #fff !important;
      padding: 7px 14px !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      white-space: nowrap !important;
      pointer-events: none !important;
      z-index: 9999 !important;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    /* ============================================================
       OUTLOOK-STYLE TOP RIBBON — frosted glass header with accent border
       ============================================================ */
    header {
      background: rgba(255, 255, 255, 0.45) !important;
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border-bottom: 1px solid rgba(13, 148, 136, 0.25) !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06) !important;
    }
    [data-theme="dark"] header {
      background: rgba(15, 23, 42, 0.5) !important;
      backdrop-filter: blur(20px) saturate(160%);
      -webkit-backdrop-filter: blur(20px) saturate(160%);
      border-bottom: 1px solid rgba(20, 184, 166, 0.3) !important;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3) !important;
    }

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
    main { padding: 16px !important; background: transparent !important; }
    [data-theme="dark"] main { background: transparent !important; }
    .work { background: transparent !important; }
    [data-theme="dark"] .work { background: transparent !important; }

    /* Cards — softer shadows, consistent 14px radius, less stark white */
    .card, .actcard, .dealcard, .contact-card, .glance, .report, .timeline, .sheet, .leadcard, .forecast-chart {
      background: rgba(255, 255, 255, 0.88) !important;
      backdrop-filter: blur(12px) saturate(140%) !important;
      -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
      border: 1px solid rgba(255, 255, 255, 0.5) !important;
      border-radius: 14px !important;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.12) !important;
    }
    [data-theme="dark"] .card, [data-theme="dark"] .actcard, [data-theme="dark"] .dealcard,
    [data-theme="dark"] .contact-card, [data-theme="dark"] .glance, [data-theme="dark"] .report,
    [data-theme="dark"] .timeline, [data-theme="dark"] .sheet, [data-theme="dark"] .leadcard,
    [data-theme="dark"] .forecast-chart {
      background: rgba(22, 28, 45, 0.84) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(14px) saturate(140%) !important;
      -webkit-backdrop-filter: blur(14px) saturate(140%) !important;
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
    if (!scroll) return;
    // REPLACE navscroll content entirely — no duplicates with basePaint's items
    scroll.innerHTML =
      navItem('home', 'Home', svg('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>')) +
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
      '<div class="nav-section-header">Insights</div>' +
      navItem('dashboard', 'Dashboard', svg('<path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>')) +
      navItem('forecast', 'Forecast', svg('<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>')) +
      '<div class="nav-section-header">Platform</div>' +
      navItem('automation', 'Automation', svg('<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>')) +
      navItem('integrations', 'Integrations', svg('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>')) +
      navItem('guide', 'Start guide', svg('<path d="M5 21V4M5 4h10l-1.5 3L15 10H5"/>'));
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
      if (!q) { box.style.display = 'none'; return; }
      const hits = await window.crmLookup(q);
      const paint = (value) => String(value || '').replace(/[&<>]/g, (c) => ({'&':'&','<':'<','>':'>'}[c]));
      box.innerHTML = hits.map((row) => `<button type="button" onclick="openSearchHit('${row.kind}','${row.id}')"><b>${paint(row.title)}</b><div class="meta">${paint(row.kind)} · ${paint(row.detail || '')}</div></button>`).join('') || `<div class="meta" style="padding:12px">No record matches “${paint(q)}”. Try a name, email, phone, or company.</div>`;
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
          // Pattern A: If user came from Google SSO with calendar auto-connected, hide the Calendar button
          // and show a "Calendar connected ✓" badge instead
          const calendarAlreadyConnected = window.__ssoCalendarConnected === true;
          let actions = (current.actions || []).filter(function(a) {
            // Skip calendar button if already connected via SSO
            if (a.provider === 'calendar' && calendarAlreadyConnected) return false;
            return true;
          }).map((a) => {
            const colorAttr = a.color ? ` data-color="${a.color}"` : '';
            return `<button type="button" class="wizard-choice"${colorAttr} onclick="window.__wizardConnectInbox('${a.provider}')">
              <div class="ico">${a.ico}</div>
              <div class="label"><b>${esc(a.label)}</b><span>${esc(a.hint)}</span></div>
            </button>`;
          }).join('');
          // Add a "Calendar connected" celebration card if calendar was auto-connected
          const calendarCard = calendarAlreadyConnected ? `
            <div class="wizard-choice on" data-color="emerald" style="cursor:default;pointer-events:none">
              <div class="ico">📅</div>
              <div class="label"><b>Google Calendar connected</b><span>Your meetings will appear on the home dashboard</span></div>
            </div>` : '';
          body = `<div class="wizard-body-anim"><h2>${esc(current.question)}</h2><p class="wizard-sub">${esc(current.sub)}</p><div class="wizard-choices">${calendarCard}${actions}</div></div>`;
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
      if (!q) {
        currentResults = []; selectedIdx = -1;
        results.innerHTML = '<div class="cmdk-empty">Type a name, email, phone, or company.</div>';
        return;
      }
      searchTimer = setTimeout(async () => {
        currentResults = await window.crmLookup(q);
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

  // Show integration prompts OR today's meetings on home page (depending on connection state)
  var origDrawHome2 = (typeof drawHome === 'function' && !drawHome.__ip) ? drawHome : null;
  if (origDrawHome2) {
    drawHome = async function () {
      origDrawHome2();
      setTimeout(async function () {
        var view = document.getElementById('view');
        if (!view) return;
        // Try to fetch today's meetings via the /crm/api/day endpoint (uses calendar connection)
        var day = null;
        try { day = await api('/crm/api/day'); } catch (e) { day = null; }
        if (day && day.events && day.events.length > 0) {
          // Calendar is connected AND user has meetings today — show today's meetings card
          var eventsHtml = day.events.map(function(e) {
            var time = e.when ? new Date(e.when).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
            return '<div style="display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #f1f5f9"><span style="font-size:16px">📅</span><div style="flex:1"><b style="font-size:13px;color:#0f172a;display:block">' + esc(e.title) + '</b>' + (time ? '<span style="font-size:11px;color:#64748b">' + time + '</span>' : '') + '</div></div>';
          }).join('');
          var card = document.createElement('div');
          card.className = 'integration-prompt';
          card.style.background = 'linear-gradient(135deg, #ecfdf5, #f0fdfa)';
          card.style.borderColor = '#99f6e4';
          card.innerHTML =
            '<div class="prompt-ico">📅</div>' +
            '<div class="prompt-text"><b>Today\'s meetings</b><br>From your connected Google Calendar</div>' +
            '<div style="flex:1;min-width:0;margin:0 16px">' + eventsHtml + '</div>' +
            '<button class="dismiss" onclick="this.parentElement.remove()" style="font-size:18px">×</button>';
          view.insertBefore(card, view.firstChild);
        } else if (day && day.events && day.events.length === 0 && window.__ssoCalendarConnected) {
          // Calendar connected but no meetings today — show a welcome state
          var card = document.createElement('div');
          card.className = 'integration-prompt';
          card.style.background = 'linear-gradient(135deg, #ecfdf5, #f0fdfa)';
          card.style.borderColor = '#99f6e4';
          card.innerHTML =
            '<div class="prompt-ico">📅</div>' +
            '<div class="prompt-text"><b>Google Calendar connected</b><br>No meetings scheduled for today — enjoy the focus time.</div>' +
            '<button class="dismiss" onclick="this.parentElement.remove()" style="font-size:18px">×</button>';
          view.insertBefore(card, view.firstChild);
        } else if (!localStorage.getItem('afri.prompt.gmail')) {
          // Calendar not connected — show the original "Connect your calendar" prompt
          var prompt = document.createElement('div');
          prompt.className = 'integration-prompt';
          prompt.innerHTML =
            '<div class="prompt-ico">📅</div>' +
            '<div class="prompt-text"><b>Connect your calendar</b><br>See your meetings and tasks on your Google or Outlook calendar.</div>' +
            '<button onclick="go(\'integrations\')">Connect</button>' +
            '<button class="dismiss" onclick="this.parentElement.remove();localStorage.setItem(\'afri.prompt.gmail\',\'1\')">×</button>';
          view.insertBefore(prompt, view.firstChild);
        }
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

  // ============================================================
  // MOBILE APP PROMO — HubSpot-style popup with QR code
  // Appears on desktop after 30s, or via "Get mobile app" button
  // in the top nav. Dismissable with "Remind me later" (7-day snooze)
  // ============================================================
  style.textContent += `
    .mobile-promo-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; padding: 20px; animation: mobile-fade 0.25s ease-out; }
    .mobile-promo-overlay.on { display: flex; }
    @keyframes mobile-fade { from { opacity: 0; } to { opacity: 1; } }
    .mobile-promo-card { position: relative; background: #fff; border-radius: 24px; max-width: 880px; width: 100%; overflow: hidden; box-shadow: 0 40px 100px rgba(15, 23, 42, 0.4), 0 12px 32px rgba(15, 23, 42, 0.2); display: grid; grid-template-columns: 1.2fr 1fr; animation: mobile-pop 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); }
    @keyframes mobile-pop { from { transform: scale(0.95) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    @media (max-width: 720px) { .mobile-promo-card { grid-template-columns: 1fr; max-height: 90vh; overflow: auto; } }
    .mobile-promo-left { padding: 40px 36px; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f766e 100%); color: #fff; position: relative; overflow: hidden; }
    .mobile-promo-left::before { content: ''; position: absolute; inset: -50%; background: radial-gradient(circle at 30% 30%, rgba(45, 212, 191, 0.18) 0%, transparent 8%), radial-gradient(circle at 70% 60%, rgba(167, 139, 250, 0.15) 0%, transparent 10%); animation: mobile-drift 25s linear infinite; pointer-events: none; }
    @keyframes mobile-drift { 0% { transform: rotate(0deg) scale(1); } 50% { transform: rotate(180deg) scale(1.15); } 100% { transform: rotate(360deg) scale(1); } }
    .mobile-promo-left > * { position: relative; z-index: 1; }
    .mobile-promo-eyebrow { display: inline-flex; align-items: center; gap: 8px; background: rgba(45, 212, 191, 0.12); border: 1px solid rgba(45, 212, 191, 0.3); padding: 6px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #2dd4bf; margin-bottom: 20px; }
    .mobile-promo-eyebrow::before { content: ''; width: 6px; height: 6px; background: #2dd4bf; border-radius: 50%; box-shadow: 0 0 8px #2dd4bf; }
    .mobile-promo-left h2 { font-family: 'Fraunces', serif; font-size: 30px; font-weight: 800; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 16px; }
    .mobile-promo-left h2 .grad { background: linear-gradient(135deg, #2dd4bf 0%, #5eead4 50%, #2dd4bf 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
    .mobile-promo-left p.sub { color: rgba(226, 232, 240, 0.85); font-size: 15px; line-height: 1.55; margin-bottom: 28px; }
    .mobile-promo-features { display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px; }
    .mobile-promo-feature { display: flex; align-items: flex-start; gap: 12px; }
    .mobile-promo-feature .ico { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: rgba(45, 212, 191, 0.12); color: #2dd4bf; border: 1px solid rgba(45, 212, 191, 0.2); }
    .mobile-promo-feature .info b { display: block; font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 2px; }
    .mobile-promo-feature .info span { font-size: 12.5px; color: rgba(226, 232, 240, 0.7); line-height: 1.45; }
    .mobile-promo-rating { display: flex; align-items: center; gap: 10px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
    .mobile-promo-stars { color: #fbbf24; font-size: 14px; letter-spacing: 2px; }
    .mobile-promo-rating .rating-text { font-size: 12px; color: rgba(226, 232, 240, 0.7); }
    .mobile-promo-rating .rating-text b { color: #fff; font-weight: 700; }
    .mobile-promo-right { padding: 40px 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 16px; }
    .mobile-promo-qr-wrap { padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); }
    .mobile-promo-qr-wrap img { display: block; width: 180px; height: 180px; border-radius: 8px; }
    .mobile-promo-qr-caption { font-size: 13px; color: #64748b; line-height: 1.5; max-width: 240px; }
    .mobile-promo-qr-caption b { color: #0f172a; }
    .mobile-promo-badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
    .mobile-promo-badge { display: flex; align-items: center; gap: 8px; background: #0f172a; color: #fff; padding: 8px 14px; border-radius: 10px; text-decoration: none; transition: transform 0.15s, background 0.15s; }
    .mobile-promo-badge:hover { transform: translateY(-1px); background: #1e293b; }
    .mobile-promo-badge svg { width: 18px; height: 18px; flex-shrink: 0; }
    .mobile-promo-badge .badge-text { display: flex; flex-direction: column; line-height: 1.1; }
    .mobile-promo-badge .badge-text small { font-size: 9px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
    .mobile-promo-badge .badge-text b { font-size: 13px; font-weight: 700; }
    .mobile-promo-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.1); border: 0; color: #fff; font-size: 18px; cursor: pointer; display: grid; place-items: center; transition: background 0.15s; z-index: 10; }
    .mobile-promo-close:hover { background: rgba(255, 255, 255, 0.2); }
    .mobile-promo-actions { display: flex; gap: 8px; margin-top: 8px; }
    .mobile-promo-dismiss { background: transparent; border: 1px solid #e2e8f0; color: #64748b; padding: 8px 16px; border-radius: 99px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .mobile-promo-dismiss:hover { background: #f8fafc; color: #0f172a; }

    /* Top-nav Get Mobile App button */
    .nav-mobile-btn { display: flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; font-size: 12px; font-weight: 700; border: 0; cursor: pointer; box-shadow: 0 2px 8px rgba(13, 148, 136, 0.25); transition: transform 0.15s, box-shadow 0.15s; }
    .nav-mobile-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(13, 148, 136, 0.4); }
    .nav-mobile-btn svg { width: 14px; height: 14px; }
    @media (max-width: 720px) { .nav-mobile-btn .nav-mobile-label { display: none; } .nav-mobile-btn { padding: 7px 10px; } }

    /* Business card scanner UI */
    .scan-card-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; padding: 20px; }
    .scan-card-overlay.on { display: flex; }
    .scan-card-modal { background: #fff; border-radius: 20px; max-width: 480px; width: 100%; overflow: hidden; box-shadow: 0 30px 80px rgba(15, 23, 42, 0.4); }
    .scan-card-head { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; }
    .scan-card-head h3 { font-family: 'Fraunces', serif; font-size: 19px; font-weight: 700; color: #0f172a; margin: 0; }
    .scan-card-head button { background: transparent; border: 0; font-size: 24px; color: #94a3b8; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
    .scan-card-head button:hover { background: #f1f5f9; color: #0f172a; }
    .scan-card-body { padding: 24px; }
    .scan-card-video-wrap { position: relative; background: #0f172a; border-radius: 12px; overflow: hidden; aspect-ratio: 4/3; display: grid; place-items: center; }
    .scan-card-video-wrap video { width: 100%; height: 100%; object-fit: cover; }
    .scan-card-video-wrap .placeholder { color: #94a3b8; font-size: 14px; text-align: center; padding: 20px; }
    .scan-card-video-wrap .placeholder svg { display: block; margin: 0 auto 12px; opacity: 0.5; }
    .scan-card-capture { display: block; margin: 16px auto 0; padding: 12px 24px; background: linear-gradient(135deg, #0d9488, #0f766e); color: #fff; border: 0; border-radius: 99px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); transition: transform 0.15s; }
    .scan-card-capture:hover { transform: translateY(-1px); }
    .scan-card-capture:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; transform: none; }
    .scan-card-hint { text-align: center; color: #64748b; font-size: 12px; margin-top: 12px; line-height: 1.5; }
    .scan-card-preview { max-width: 100%; max-height: 200px; border-radius: 8px; margin: 12px 0; display: block; }
    .scan-card-use { display: block; margin: 12px auto 0; padding: 12px 24px; background: #0f766e; color: #fff; border: 0; border-radius: 99px; font-size: 14px; font-weight: 700; cursor: pointer; }
    .scan-card-use:hover { background: #0d9488; }
  `;

  // Get the install URL for the QR code
  function getInstallUrl() {
    return window.location.origin + '/crm';
  }

  // Build the mobile app promo popup
  window.__showMobilePromo = function () {
    if (document.getElementById('mobilePromoOverlay')) {
      document.getElementById('mobilePromoOverlay').classList.add('on');
      return;
    }
    var installUrl = getInstallUrl();
    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=' + encodeURIComponent(installUrl);
    var overlay = document.createElement('div');
    overlay.id = 'mobilePromoOverlay';
    overlay.className = 'mobile-promo-overlay';
    overlay.innerHTML = ''
      + '<div class="mobile-promo-card">'
      + '  <button class="mobile-promo-close" onclick="window.__closeMobilePromo()" aria-label="Close">×</button>'
      + '  <div class="mobile-promo-left">'
      + '    <div class="mobile-promo-eyebrow">Afri OS · Mobile</div>'
      + '    <h2>Save time away from your desk with the <span class="grad">mobile app</span></h2>'
      + '    <p class="sub">Get more done with app-only features built for how African businesses actually sell — on the phone, in the field, between meetings.</p>'
      + '    <div class="mobile-promo-features">'
      + '      <div class="mobile-promo-feature">'
      + '        <div class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></div>'
      + '        <div class="info"><b>Business card scanner</b><span>Snap a photo of any card — Afri extracts the name, email, and phone, and creates the contact for you.</span></div>'
      + '      </div>'
      + '      <div class="mobile-promo-feature">'
      + '        <div class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.351 1.903.67 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.319 1.85.543 2.81.67A2 2 0 0 1 22 16.92z"/></svg></div>'
      + '        <div class="info"><b>Sales Caller ID</b><span>When a contact calls, see their deal stage, last touch, and notes before you pick up.</span></div>'
      + '      </div>'
      + '      <div class="mobile-promo-feature">'
      + '        <div class="ico"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 6-6"/></svg></div>'
      + '        <div class="info"><b>Dashboards on the go</b><span>Pipeline value, today\'s meetings, tasks due — all on your home screen. Installable as a PWA.</span></div>'
      + '      </div>'
      + '    </div>'
      + '    <div class="mobile-promo-rating">'
      + '      <span class="mobile-promo-stars">★★★★★</span>'
      + '      <span class="rating-text"><b>4.7/5</b> · Rated by African founders</span>'
      + '    </div>'
      + '  </div>'
      + '  <div class="mobile-promo-right">'
      + '    <div class="mobile-promo-qr-wrap">'
      + '      <img src="' + qrUrl + '" alt="QR code to install Afri CRM mobile" width="180" height="180">'
      + '    </div>'
      + '    <p class="mobile-promo-qr-caption"><b>Scan with your phone camera</b> to install Afri CRM as a progressive web app. Works on iOS and Android. No app store needed.</p>'
      + '    <div class="mobile-promo-badges">'
      + '      <a href="' + installUrl + '" class="mobile-promo-badge" target="_blank" rel="noopener">'
      + '        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.95 2.42-4.37 2.53-4.44-1.38-2.02-3.53-2.3-4.3-2.32-1.83-.19-3.58 1.07-4.5 1.07-.94 0-2.37-1.05-3.91-1.02-2.01.03-3.87 1.17-4.91 2.98-2.09 3.63-.53 9 1.49 11.96 1 1.45 2.18 3.07 3.71 3.01 1.49-.06 2.05-.96 3.85-.96 1.78 0 2.3.96 3.86.93 1.6-.03 2.6-1.46 3.57-2.92 1.13-1.65 1.59-3.26 1.61-3.34-.04-.01-3.07-1.18-3.1-4.66M14.06 4.27c.82-1.0 1.37-2.4 1.22-3.78-1.18.05-2.61.78-3.45 1.78-.76.89-1.42 2.31-1.24 3.67 1.31.1 2.65-.67 3.47-1.67z"/></svg>'
      + '        <div class="badge-text"><small>Install on</small><b>iOS · Safari</b></div>'
      + '      </a>'
      + '      <a href="' + installUrl + '" class="mobile-promo-badge" target="_blank" rel="noopener">'
      + '        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5V3.5c0-.59.34-1.11.84-1.35l13.69 9.85-13.69 9.85c-.5-.24-.84-.76-.84-1.35M17.04 12L21 14.6l-3.96 2.6V12zm0 0V9.4L21 12l-3.96 0z"/></svg>'
      + '        <div class="badge-text"><small>Install on</small><b>Android · Chrome</b></div>'
      + '      </a>'
      + '    </div>'
      + '    <div class="mobile-promo-actions">'
      + '      <button class="mobile-promo-dismiss" onclick="window.__snoozeMobilePromo()">Remind me in 7 days</button>'
      + '    </div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(overlay);
    // Close on backdrop click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) window.__closeMobilePromo();
    });
    // Close on Escape
    setTimeout(function() {
      document.addEventListener('keydown', window.__mobilePromoEscHandler = function(e) {
        if (e.key === 'Escape') window.__closeMobilePromo();
      });
    }, 100);
  };

  window.__closeMobilePromo = function () {
    var o = document.getElementById('mobilePromoOverlay');
    if (o) o.classList.remove('on');
    if (window.__mobilePromoEscHandler) {
      document.removeEventListener('keydown', window.__mobilePromoEscHandler);
      window.__mobilePromoEscHandler = null;
    }
  };

  window.__snoozeMobilePromo = function () {
    try { localStorage.setItem('afri.mobile.snooze', new Date(Date.now() + 7 * 86400000).toISOString()); } catch {}
    window.__closeMobilePromo();
    toast('Got it. We\'ll remind you in 7 days.');
  };

  // Auto-show after 30s on desktop (only if not snoozed + not on mobile)
  (function () {
    var isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    if (isMobile) return; // Don't show on mobile — they're already on mobile
    var snooze = null;
    try { snooze = localStorage.getItem('afri.mobile.snooze'); } catch {}
    if (snooze && new Date(snooze) > new Date()) return; // Still snoozed
    try { if (localStorage.getItem('afri.mobile.dismissed')) return; } catch {}
    setTimeout(function () {
      if (document.getElementById('mobilePromoOverlay')) return; // Already shown
      // Only show if user is still on the page (didn't navigate away)
      if (document.visibilityState === 'visible') {
        window.__showMobilePromo();
      }
    }, 30000);
  })();

  // Inject "Get mobile app" button into the CRM top nav
  (function () {
    function injectMobileBtn() {
      var nav = document.querySelector('.app > header, header, .topbar, #topbar, .nav');
      if (!nav) {
        // Fallback: try to find the bell/notifications area
        var bell = document.getElementById('bell') || document.querySelector('[onclick*="loadBell"]');
        if (!bell || !bell.parentElement) { setTimeout(injectMobileBtn, 1000); return; }
        nav = bell.parentElement;
      }
      if (document.getElementById('navMobileBtn')) return; // Already injected
      var btn = document.createElement('button');
      btn.id = 'navMobileBtn';
      btn.className = 'nav-mobile-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 18h6M9 2h6"/></svg><span class="nav-mobile-label">Mobile app</span>';
      btn.onclick = window.__showMobilePromo;
      // Insert at the start of nav, before any other elements
      nav.insertBefore(btn, nav.firstChild);
    }
    // Wait for the nav to exist (SPA might not have rendered yet)
    setTimeout(injectMobileBtn, 1500);
  })();

  // ============================================================
  // BUSINESS CARD SCANNER — camera capture + form pre-fill
  // Mobile-only feature on the Contacts page
  // ============================================================
  window.__openScanCard = function () {
    if (document.getElementById('scanCardOverlay')) {
      document.getElementById('scanCardOverlay').classList.add('on');
      window.__startScanCardCamera();
      return;
    }
    var overlay = document.createElement('div');
    overlay.id = 'scanCardOverlay';
    overlay.className = 'scan-card-overlay';
    overlay.innerHTML = ''
      + '<div class="scan-card-modal">'
      + '  <div class="scan-card-head">'
      + '    <h3>Scan business card</h3>'
      + '    <button onclick="window.__closeScanCard()" aria-label="Close">×</button>'
      + '  </div>'
      + '  <div class="scan-card-body">'
      + '    <div class="scan-card-video-wrap" id="scanVideoWrap">'
      + '      <div class="placeholder">'
      + '        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>'
      + '        Camera starting...'
      + '      </div>'
      + '    </div>'
      + '    <button class="scan-card-capture" id="scanCaptureBtn" onclick="window.__captureScanCard()" disabled>Capture card</button>'
      + '    <p class="scan-card-hint">Hold the card steady in the frame. After capture, you can review the photo and pre-fill the new contact form.</p>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) window.__closeScanCard();
    });
    window.__startScanCardCamera();
  };

  window.__startScanCardCamera = async function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      var wrap = document.getElementById('scanVideoWrap');
      if (wrap) {
        wrap.innerHTML = '<div class="placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>Camera not available on this device. Try on mobile or use a different browser.</div>';
      }
      return;
    }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      window.__scanCardStream = stream;
      var wrap = document.getElementById('scanVideoWrap');
      if (wrap) {
        wrap.innerHTML = '<video id="scanVideo" autoplay playsinline muted></video>';
        var video = document.getElementById('scanVideo');
        video.srcObject = stream;
        var btn = document.getElementById('scanCaptureBtn');
        if (btn) btn.disabled = false;
      }
    } catch (e) {
      var wrap = document.getElementById('scanVideoWrap');
      if (wrap) {
        wrap.innerHTML = '<div class="placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>Camera permission denied. Allow camera access in your browser settings.</div>';
      }
    }
  };

  window.__captureScanCard = function () {
    var video = document.getElementById('scanVideo');
    if (!video) return;
    var canvas = document.createElement('canvas');
    // Capture at 720p max for reasonable file size
    var maxW = 720;
    var aspect = video.videoWidth / video.videoHeight || (4/3);
    canvas.width = Math.min(maxW, video.videoWidth || maxW);
    canvas.height = canvas.width / aspect;
    var ctx = canvas.getContext('2d');
    // Draw the video frame, optionally rotated/mirrored
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    // Stop the camera stream
    if (window.__scanCardStream) {
      window.__scanCardStream.getTracks().forEach(function (t) { t.stop(); });
      window.__scanCardStream = null;
    }
    // Show preview
    var wrap = document.getElementById('scanVideoWrap');
    if (wrap) {
      wrap.innerHTML = '<img src="' + dataUrl + '" class="scan-card-preview" alt="Captured business card">';
    }
    var btn = document.getElementById('scanCaptureBtn');
    if (btn) {
      btn.textContent = 'Use this card';
      btn.onclick = function () { window.__useScannedCard(dataUrl); };
    }
  };

  window.__useScannedCard = function (dataUrl) {
    window.__closeScanCard();
    // Open the new-contact side panel with the scanned image attached
    if (typeof window.openSidePanel === 'function') {
      window.openSidePanel('new-contact', { scannedCard: dataUrl });
    } else {
      // Fallback: just trigger the contacts create flow + show toast
      if (typeof go === 'function') go('contacts');
      setTimeout(function () {
        toast('Card captured! Fill in the contact details to save.');
      }, 300);
    }
  };

  window.__closeScanCard = function () {
    var o = document.getElementById('scanCardOverlay');
    if (o) o.classList.remove('on');
    if (window.__scanCardStream) {
      window.__scanCardStream.getTracks().forEach(function (t) { t.stop(); });
      window.__scanCardStream = null;
    }
  };

  // ============================================================
  // MOBILE PHASE 1 v2 — Completely rebuilt mobile shell
  // Detects mobile EARLY (in crm.html <head>, before paintNav runs)
  // and renders an entirely separate mobile UI:
  //   - Top bar with search + logo + bell
  //   - Bottom tab bar (Home / Contacts / Deals / Tasks / Profile)
  //   - Floating Action Button (FAB) → bottom-sheet quick add
  //   - Mobile-specific home page (cards stacked, 2x2 stats, today's
  //     meetings, quick actions row)
  // Designed for: instant switching (no delays), beautiful visuals
  // (glass-morphism, custom SVG icons, smooth animations), large
  // touch targets, dark mode support, safe-area-inset for iPhone.
  // Does NOT modify or break any desktop code paths.
  // ============================================================

  // Mobile shell CSS — applied only when <html data-shell="mobile">
  style.textContent += `
    /* ===== MOBILE SHELL TOKENS (v2 design system) ===== */
    :root {
      --m-bg: #f6f7f9;
      --m-surface: #ffffff;
      --m-surface-elevated: rgba(255,255,255,0.96);
      --m-text: #0f172a;
      --m-text-muted: #64748b;
      --m-text-subtle: #94a3b8;
      --m-border: #e8eaed;
      --m-border-strong: #cbd5e1;
      --m-accent: #0d9488;
      --m-accent-light: #2dd4bf;
      --m-accent-dark: #0f766e;
      --m-accent-tint: rgba(13,148,136,0.08);
      --m-accent-tint-strong: rgba(13,148,136,0.16);
      --m-shadow: 0 2px 8px rgba(15,23,42,0.04);
      --m-shadow-md: 0 8px 24px rgba(15,23,42,0.08);
      --m-shadow-lg: 0 20px 50px rgba(15,23,42,0.15);
      --m-shadow-fab: 0 8px 20px rgba(13,148,136,0.35), 0 0 0 6px rgba(13,148,136,0.08);
      --m-radius-sm: 10px;
      --m-radius: 14px;
      --m-radius-lg: 20px;
      --m-radius-xl: 24px;
      --m-topbar-h: 56px;
      --m-tabbar-h: 64px;
    }
    [data-theme="dark"] {
      --m-bg: #0a0e1a;
      --m-surface: #0f172a;
      --m-surface-elevated: rgba(15,23,42,0.94);
      --m-text: #f1f5f9;
      --m-text-muted: #94a3b8;
      --m-text-subtle: #64748b;
      --m-border: #1e293b;
      --m-border-strong: #334155;
      --m-shadow: 0 2px 8px rgba(0,0,0,0.2);
      --m-shadow-md: 0 8px 24px rgba(0,0,0,0.3);
      --m-shadow-lg: 0 20px 50px rgba(0,0,0,0.4);
    }

    /* ===== MOBILE LAYOUT — hide desktop chrome ===== */
    [data-shell="mobile"] body {
      background: var(--m-bg) !important;
      padding: var(--m-topbar-h) 0 var(--m-tabbar-h) 0 !important;
      margin: 0 !important;
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
    }
    [data-shell="mobile"] #nav,
    [data-shell="mobile"] aside,
    [data-shell="mobile"] .app > header:not(.m-topbar),
    [data-shell="mobile"] header:not(.m-topbar):not(.mobile-promo-card),
    [data-shell="mobile"] #moreBtn,
    [data-shell="mobile"] .helper,
    [data-shell="mobile"] .ask-fab,
    [data-shell="mobile"] .nav-mobile-btn,
    [data-shell="mobile"] .navfoot,
    [data-shell="mobile"] #setupCard { display: none !important; }

    [data-shell="mobile"] .app,
    [data-shell="mobile"] .app.rail {
      display: block !important;
      grid-template-columns: none !important;
      padding: 0 !important;
    }
    [data-shell="mobile"] #view {
      padding: 12px 14px 12px !important;
      max-width: 100% !important;
      margin: 0 !important;
      min-height: calc(100vh - var(--m-topbar-h) - var(--m-tabbar-h) - 24px);
    }
    [data-shell="mobile"] * {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    [data-shell="mobile"] body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    /* ===== MOBILE TOP BAR ===== */
    .m-topbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 90;
      height: var(--m-topbar-h);
      padding: 0 14px;
      padding-top: env(safe-area-inset-top, 0);
      background: rgba(255,255,255,0.98);
      border-bottom: 0.5px solid var(--m-border);
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      box-sizing: border-box;
    }
    [data-theme="dark"] .m-topbar { background: rgba(15,23,42,0.98); }
    .m-icon-btn {
      width: 40px; height: 40px; border-radius: var(--m-radius-sm);
      background: transparent; border: 0;
      color: var(--m-text);
      display: grid; place-items: center; cursor: pointer;
      transition: background 0.15s, transform 0.1s; position: relative;
      -webkit-tap-highlight-color: transparent;
    }
    .m-icon-btn:active { background: var(--m-accent-tint); transform: scale(0.92); }
    .m-bell-count {
      position: absolute; top: 6px; right: 6px;
      min-width: 16px; height: 16px; padding: 0 4px;
      border-radius: 99px; background: #ef4444; color: #fff;
      font-size: 10px; font-weight: 700; display: grid; place-items: center;
      border: 2px solid var(--m-surface-elevated);
      line-height: 1;
    }
    .m-brand {
      display: flex; align-items: center; gap: 8px;
      font-family: 'Fraunces', serif;
      font-size: 19px; font-weight: 700; color: var(--m-text);
      cursor: pointer; letter-spacing: -0.01em;
    }
    .m-brand b { color: var(--m-accent); }
    .m-brand img { display: block; }

    /* ===== MOBILE BOTTOM TAB BAR ===== */
    .m-tabbar {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 90;
      height: var(--m-tabbar-h);
      padding: 6px 8px;
      padding-bottom: max(6px, env(safe-area-inset-bottom, 0));
      background: rgba(255,255,255,0.98);
      border-top: 0.5px solid var(--m-border);
      display: flex; align-items: stretch; justify-content: space-around;
      box-sizing: border-box;
    }
    [data-theme="dark"] .m-tabbar { background: rgba(15,23,42,0.98); }
    .m-tab {
      flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
      background: transparent; border: 0;
      color: var(--m-text-subtle);
      font-size: 10px; font-weight: 600; cursor: pointer; padding: 4px;
      transition: color 0.18s, transform 0.1s;
      -webkit-tap-highlight-color: transparent;
      position: relative;
    }
    .m-tab:active { transform: scale(0.92); }
    .m-tab svg { display: block; transition: transform 0.18s; }
    .m-tab.on { color: var(--m-accent); }
    .m-tab.on svg { transform: translateY(-1px); }
    .m-tab.on::before {
      content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
      width: 24px; height: 3px; background: var(--m-accent);
      border-radius: 99px;
    }
    .m-tab span { line-height: 1; }

    /* ===== MOBILE FAB (Floating Action Button) ===== */
    .m-fab {
      position: fixed; bottom: calc(var(--m-tabbar-h) + 14px); right: 16px; z-index: 88;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, var(--m-accent) 0%, var(--m-accent-dark) 100%);
      color: #fff; border: 0; cursor: pointer;
      display: grid; place-items: center;
      box-shadow: var(--m-shadow-fab);
      transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s;
      -webkit-tap-highlight-color: transparent;
    }
    .m-fab:active { transform: scale(0.88); }
    .m-fab:hover { transform: translateY(-2px) rotate(90deg); }

    /* ===== MOBILE HOME PAGE (Phase 1) ===== */
    .m-home { display: flex; flex-direction: column; gap: 14px; padding-bottom: 12px; }
    .m-greeting {
      padding: 18px 4px 8px;
      display: flex; flex-direction: column; gap: 2px;
    }
    .m-greeting .hello {
      font-family: 'Fraunces', serif;
      font-size: 28px; font-weight: 700; color: var(--m-text);
      letter-spacing: -0.025em; line-height: 1.15;
    }
    .m-greeting .hello b { color: var(--m-accent); }
    .m-greeting .date {
      font-size: 13px; color: var(--m-text-muted);
      display: flex; align-items: center; gap: 6px;
    }
    .m-greeting .date .dot { width: 4px; height: 4px; background: var(--m-text-subtle); border-radius: 50%; }

    /* Today's meetings card (large, beautiful) */
    .m-meetings {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f766e 100%);
      color: #fff;
      border-radius: var(--m-radius-lg);
      padding: 18px 18px 16px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--m-shadow-md);
    }
    .m-meetings::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(circle at 80% 20%, rgba(45,212,191,0.18), transparent 40%), radial-gradient(circle at 20% 80%, rgba(167,139,250,0.15), transparent 40%);
      pointer-events: none;
    }
    .m-meetings > * { position: relative; z-index: 1; }
    .m-meetings .label {
      font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      color: var(--m-accent-light); margin-bottom: 8px;
      display: flex; align-items: center; gap: 6px;
    }
    .m-meetings .label::before { content: ''; width: 5px; height: 5px; background: var(--m-accent-light); border-radius: 50%; box-shadow: 0 0 8px var(--m-accent-light); }
    .m-meetings h3 {
      font-family: 'Fraunces', serif; font-size: 20px; font-weight: 700; margin: 0 0 14px;
      letter-spacing: -0.015em; line-height: 1.2;
    }
    .m-meetings .empty {
      color: rgba(255,255,255,0.7); font-size: 13px; line-height: 1.5; margin: 0;
    }
    .m-meeting-row {
      display: flex; align-items: center; gap: 12px; padding: 10px 0;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .m-meeting-row:first-of-type { border-top: 0; padding-top: 0; }
    .m-meeting-time {
      font-family: 'Fraunces', serif; font-size: 13px; font-weight: 700;
      color: var(--m-accent-light); min-width: 50px;
    }
    .m-meeting-title { font-size: 13.5px; font-weight: 600; color: #fff; line-height: 1.3; flex: 1; }

    /* 2x2 stat grid */
    .m-stats-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    }
    .m-stat-card {
      background: var(--m-surface);
      border: 0.5px solid var(--m-border);
      border-radius: var(--m-radius);
      padding: 16px 14px;
      position: relative;
      overflow: hidden;
      box-shadow: var(--m-shadow);
      transition: transform 0.18s ease;
    }
    .m-stat-card:active { transform: scale(0.96); }
    .m-stat-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
      background: var(--m-accent);
      border-radius: var(--m-radius) var(--m-radius) 0 0;
    }
    .m-stat-card.violet::before { background: #8b5cf6; }
    .m-stat-card.amber::before { background: #f59e0b; }
    .m-stat-card.rose::before { background: #ec4899; }
    .m-stat-card .label {
      font-size: 11px; font-weight: 600; color: var(--m-text-muted);
      text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px;
    }
    .m-stat-card .value {
      font-family: 'Fraunces', serif;
      font-size: 26px; font-weight: 800; color: var(--m-text);
      letter-spacing: -0.025em; line-height: 1;
    }
    .m-stat-card .unit { font-size: 14px; color: var(--m-text-muted); margin-left: 2px; font-family: 'Inter', sans-serif; font-weight: 600; }
    .m-stat-card .sub {
      font-size: 11px; color: var(--m-text-subtle); margin-top: 4px;
    }

    /* Quick actions row */
    .m-quick-actions {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
    }
    .m-quick-action {
      background: var(--m-surface);
      border: 0.5px solid var(--m-border);
      border-radius: var(--m-radius);
      padding: 14px 6px;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      cursor: pointer;
      transition: transform 0.12s;
      -webkit-tap-highlight-color: transparent;
    }
    .m-quick-action:active { transform: scale(0.93); }
    .m-quick-action .ico {
      width: 40px; height: 40px; border-radius: 12px;
      display: grid; place-items: center;
    }
    .m-quick-action .ico.teal { background: linear-gradient(135deg, #ccfbf1, #5eead4); color: var(--m-accent-dark); }
    .m-quick-action .ico.violet { background: linear-gradient(135deg, #ede9fe, #c4b5fd); color: #5b21b6; }
    .m-quick-action .ico.amber { background: linear-gradient(135deg, #fef3c7, #fcd34d); color: #92400e; }
    .m-quick-action .ico.rose { background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #9f1239; }
    .m-quick-action span { font-size: 11px; font-weight: 600; color: var(--m-text); }

    /* Recent activity card */
    .m-card {
      background: var(--m-surface);
      border: 0.5px solid var(--m-border);
      border-radius: var(--m-radius);
      box-shadow: var(--m-shadow);
      overflow: hidden;
    }
    .m-card-head {
      padding: 14px 16px 10px;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    .m-card-head h3 {
      font-family: 'Fraunces', serif;
      font-size: 16px; font-weight: 700; color: var(--m-text);
      margin: 0; letter-spacing: -0.01em;
    }
    .m-card-head a {
      font-size: 12px; font-weight: 600; color: var(--m-accent);
    }
    .m-card-body { padding: 0 16px 14px; }
    .m-row {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 0;
      border-top: 0.5px solid var(--m-border);
    }
    .m-row:first-child { border-top: 0; }
    .m-row .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #ccfbf1, #99f6e4); color: var(--m-accent-dark);
      display: grid; place-items: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }
    .m-row .avatar.violet { background: linear-gradient(135deg, #ede9fe, #ddd6fe); color: #5b21b6; }
    .m-row .avatar.amber { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; }
    .m-row .avatar.rose { background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #9f1239; }
    .m-row .info { flex: 1; min-width: 0; }
    .m-row .info b { display: block; font-size: 13px; font-weight: 700; color: var(--m-text); margin-bottom: 1px; line-height: 1.25; }
    .m-row .info span { display: block; font-size: 11.5px; color: var(--m-text-muted); line-height: 1.3; }
    .m-row .time { font-size: 11px; color: var(--m-text-subtle); flex-shrink: 0; }

    /* ===== MOBILE QUICK-ADD BOTTOM SHEET ===== */
    .m-quick-sheet { position: fixed; inset: 0; z-index: 200; pointer-events: none; }
    .m-quick-sheet.on { pointer-events: auto; }
    .m-quick-backdrop { position: absolute; inset: 0; background: rgba(15,23,42,0.5); opacity: 0; transition: opacity 0.25s; }
    .m-quick-sheet.on .m-quick-backdrop { opacity: 1; }
    .m-quick-card {
      position: absolute; bottom: 0; left: 0; right: 0;
      background: var(--m-surface);
      border-radius: var(--m-radius-xl) var(--m-radius-xl) 0 0;
      padding: 8px 16px max(20px, env(safe-area-inset-bottom, 0));
      box-shadow: 0 -10px 40px rgba(15,23,42,0.15);
      transform: translateY(100%);
      transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .m-quick-sheet.on .m-quick-card { transform: none; }
    .m-quick-handle {
      width: 36px; height: 4px; background: var(--m-border-strong);
      border-radius: 99px; margin: 8px auto 16px;
    }
    .m-quick-card h3 {
      font-family: 'Fraunces', serif;
      font-size: 18px; font-weight: 700; color: var(--m-text);
      margin: 0 0 18px; text-align: center; letter-spacing: -0.015em;
    }
    .m-quick-grid {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;
    }
    .m-quick-grid button {
      background: transparent; border: 0; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      font-size: 11.5px; font-weight: 600; color: var(--m-text-muted); padding: 6px 2px;
      -webkit-tap-highlight-color: transparent;
    }
    .m-quick-ico {
      width: 56px; height: 56px; border-radius: 16px;
      display: grid; place-items: center;
      transition: transform 0.15s;
    }
    .m-quick-grid button:active .m-quick-ico { transform: scale(0.88); }
    .m-quick-ico.teal { background: linear-gradient(135deg, #ccfbf1, #5eead4); color: var(--m-accent-dark); }
    .m-quick-ico.violet { background: linear-gradient(135deg, #ede9fe, #c4b5fd); color: #5b21b6; }
    .m-quick-ico.amber { background: linear-gradient(135deg, #fef3c7, #fcd34d); color: #92400e; }
    .m-quick-ico.rose { background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #9f1239; }
    .m-quick-cancel {
      display: block; width: 100%; padding: 13px; border-radius: var(--m-radius);
      background: var(--m-bg); border: 0;
      color: var(--m-text-muted); font-size: 15px; font-weight: 700; cursor: pointer;
      font-family: inherit;
    }
  `;

  // Mobile shell injection — runs once on DOMContentLoaded
  function injectMobileShell() {
    if (!window.__afriMobile) return;
    if (document.getElementById('mobileTopbar')) return; // already injected

    // TOP BAR
    var topbar = document.createElement('header');
    topbar.id = 'mobileTopbar';
    topbar.className = 'm-topbar';
    topbar.innerHTML =
      '<button class="m-icon-btn" onclick="window.__toggleMobileSearch()" aria-label="Search">'
      + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
      + '</button>'
      + '<div class="m-brand" onclick="go(\'home\')">'
      + '<img src="/logo.svg" alt="Afri OS" width="22" height="22">'
      + '<span>Afri <b>OS</b></span>'
      + '</div>'
      + '<button class="m-icon-btn" id="mBell" onclick="window.__toggleMobileBell()" aria-label="Notifications">'
      + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>'
      + '<span class="m-bell-count" id="mBellCount" style="display:none">0</span>'
      + '</button>';
    document.body.appendChild(topbar);

    // BOTTOM TAB BAR
    var tabbar = document.createElement('nav');
    tabbar.id = 'mobileTabbar';
    tabbar.className = 'm-tabbar';
    tabbar.innerHTML =
      '<button class="m-tab" data-tab="home" onclick="go(\'home\')">'
      + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8M5 10v10a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V10"/></svg>'
      + '<span>Home</span>'
      + '</button>'
      + '<button class="m-tab" data-tab="contacts" onclick="go(\'contacts\')">'
      + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11l-3 3-2-2"/></svg>'
      + '<span>Contacts</span>'
      + '</button>'
      + '<button class="m-tab" data-tab="deals" onclick="go(\'deals\')">'
      + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h7l-3-3M4 13l7 7-3 3M4 13h16"/></svg>'
      + '<span>Deals</span>'
      + '</button>'
      + '<button class="m-tab" data-tab="tasks" onclick="go(\'tasks\')">'
      + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>'
      + '<span>Tasks</span>'
      + '</button>'
      + '<button class="m-tab" data-tab="more" onclick="window.__drawMobileMore()">'
      + '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>'
      + '<span>More</span>'
      + '</button>';
    document.body.appendChild(tabbar);

    // FAB
    var fab = document.createElement('button');
    fab.id = 'mobileFab';
    fab.className = 'm-fab';
    fab.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>';
    fab.onclick = window.__openMobileQuickAdd;
    document.body.appendChild(fab);

    // Sync active tab on navigation
    window.__syncMobileTabs = function () {
      var p = window.page || 'home';
      var map = {
        home: 'home', contacts: 'contacts', companies: 'contacts',
        deals: 'deals', opportunities: 'deals',
        tasks: 'tasks', activities: 'tasks',
        settings: 'more', integrations: 'more', more: 'more',
        calendar: 'more', feed: 'more', forecast: 'more',
        dashboard: 'more', automation: 'more', sequences: 'more',
        audit: 'more', guide: 'more'
      };
      var tab = map[p] || 'home';
      document.querySelectorAll('.m-tab').forEach(function (t) {
        t.classList.toggle('on', t.dataset.tab === tab);
      });
    };
    // Wrap go() so tabs sync after navigation
    var origGo = window.go;
    if (typeof origGo === 'function' && !origGo.__mobileWrapped) {
      window.go = function (p) {
        var r = origGo.apply(this, arguments);
        if (window.__syncMobileTabs) window.__syncMobileTabs();
        return r;
      };
      window.go.__mobileWrapped = true;
    }
    setTimeout(window.__syncMobileTabs, 100);

    // Inject floating scan button (accessible from any mobile page)
    if (window.__injectScanFab) window.__injectScanFab();

    // Render mobile home (will be re-rendered on go('home'))
    setTimeout(function () {
      if (window.__afriMobile && (window.page === 'home' || !window.page)) {
        window.__drawMobileHome();
      }
    }, 200);
  }

  // Mobile home page — completely separate from desktop home
  window.__drawMobileHome = async function () {
    if (!window.__afriMobile) return;
    var view = document.getElementById('view');
    if (!view) return;

    var name = (me && me.fullName) ? me.fullName.split(' ')[0] : 'there';
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Fetch today's data (calendar events + inbox)
    var day = null;
    try { day = await api('/crm/api/day'); } catch (e) { day = null; }
    var meetings = (day && day.events) ? day.events.slice(0, 3) : [];

    // Compute stats from actual bag data (bag.home is never populated by refresh())
    var todayStr = new Date().toISOString().slice(0, 10);
    var allDeals = bag.deals || [];
    var openDeals = allDeals.filter(function(d) { return d.stage !== 'WON' && d.stage !== 'LOST'; }).length;
    var pipelineVal = allDeals.filter(function(d) { return d.stage !== 'WON' && d.stage !== 'LOST'; }).reduce(function(s, d) { return s + (Number(d.amount) || 0); }, 0);
    var allTasks = bag.activities || [];
    var tasksDue = allTasks.filter(function(t) { return t.dueAt && t.dueAt <= todayStr && t.status !== 'HELD' && t.status !== 'DONE'; }).length;
    var allLeads = bag.leads || [];
    var hotLeads = allLeads.filter(function(l) { return (Number(l.score) || 0) >= 70; }).length;

    // Recent contacts (top 3 from bag)
    var recentContacts = (bag.contacts || []).slice(0, 3);

    view.innerHTML =
      '<div class="m-home">'
      // Greeting
      + '<div class="m-greeting">'
      + '  <div class="hello">' + greeting + ', <b>' + esc(name) + '</b></div>'
      + '  <div class="date">' + new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + '</div>'
      + '</div>'

      // Today's meetings card
      + '<div class="m-meetings">'
      + '  <div class="label">Today\'s meetings</div>'
      + (meetings.length > 0
          ? meetings.map(function (m) {
              var time = m.when ? new Date(m.when).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
              return '<div class="m-meeting-row"><div class="m-meeting-time">' + esc(time) + '</div><div class="m-meeting-title">' + esc(m.title || 'Busy') + '</div></div>';
            }).join('')
          : '<p class="empty">No meetings scheduled for today. Connect your calendar to see meetings here.</p>')
      + '</div>'

      // 2x2 stat grid
      + '<div class="m-stats-grid">'
      + '  <div class="m-stat-card" onclick="go(\'deals\')">'
      + '    <div class="label">Open deals</div>'
      + '    <div class="value">' + openDeals + '</div>'
      + '    <div class="sub">Active pipeline</div>'
      + '  </div>'
      + '  <div class="m-stat-card violet" onclick="go(\'deals\')">'
      + '    <div class="label">Pipeline</div>'
      + '    <div class="value">₦' + (pipelineVal / 1000000).toFixed(1) + '<span class="unit">M</span></div>'
      + '    <div class="sub">Total value</div>'
      + '  </div>'
      + '  <div class="m-stat-card amber" onclick="go(\'tasks\')">'
      + '    <div class="label">Tasks due</div>'
      + '    <div class="value">' + tasksDue + '</div>'
      + '    <div class="sub">Today + overdue</div>'
      + '  </div>'
      + '  <div class="m-stat-card rose" onclick="go(\'contacts\')">'
      + '    <div class="label">Hot leads</div>'
      + '    <div class="value">' + hotLeads + '</div>'
      + '    <div class="sub">Score 70+</div>'
      + '  </div>'
      + '</div>'

      // Quick actions row
      + '<div class="m-quick-actions">'
      + '  <button class="m-quick-action" onclick="window.__openMobileQuickAdd()">'
      + '    <div class="ico teal"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></div>'
      + '    <span>Add</span>'
      + '  </button>'
      + '  <button class="m-quick-action" onclick="go(\'contacts\')">'
      + '    <div class="ico violet"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M3 22c0-5 4-7 6-7s6 2 6 7"/><circle cx="17" cy="9" r="3"/></svg></div>'
      + '    <span>Contacts</span>'
      + '  </button>'
      + '  <button class="m-quick-action" onclick="go(\'deals\')">'
      + '    <div class="ico amber"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M7 7h4l2 5-2 5H7M13 7h4l2 5-2 5h-4"/></svg></div>'
      + '    <span>Deals</span>'
      + '  </button>'
      + '  <button class="m-quick-action" onclick="window.__openScanCard && window.__openScanCard()">'
      + '    <div class="ico rose"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></div>'
      + '    <span>Scan</span>'
      + '  </button>'
      + '</div>'

      // Recent contacts
      + (recentContacts.length > 0
          ? '<div class="m-card">'
            + '<div class="m-card-head"><h3>Recent contacts</h3><a onclick="go(\'contacts\')">All →</a></div>'
            + '<div class="m-card-body">'
            + recentContacts.map(function (c, i) {
                var colors = ['teal', 'violet', 'amber', 'rose'];
                var colorClass = colors[i % colors.length];
                var initials = ((c.firstName || '').charAt(0) + (c.lastName || '').charAt(0)).toUpperCase() || '?';
                return '<div class="m-row" onclick="go(\'contacts\')">'

                  + '<div class="avatar ' + colorClass + '">' + esc(initials) + '</div>'
                  + '<div class="info"><b>' + esc(((c.firstName || '') + ' ' + (c.lastName || '')).trim() || c.name || 'Unknown') + '</b>'
                  + '<span>' + esc(c.email || c.phone || 'No contact') + '</span></div>'
                  + '</div>';
              }).join('')
            + '</div></div>'
          : '')
      + '</div>';
  };

  // Quick-add bottom sheet
  window.__openMobileQuickAdd = function () {
    var sheet = document.getElementById('mobileQuickSheet');
    if (sheet) { sheet.classList.add('on'); return; }
    sheet = document.createElement('div');
    sheet.id = 'mobileQuickSheet';
    sheet.className = 'm-quick-sheet';
    sheet.innerHTML =
      '<div class="m-quick-backdrop" onclick="window.__closeMobileQuickAdd()"></div>'
      + '<div class="m-quick-card">'
      + '  <div class="m-quick-handle"></div>'
      + '  <h3>Quick add</h3>'
      + '  <div class="m-quick-grid">'
      + '    <button onclick="window.__closeMobileQuickAdd(); window.__openContactPanel && window.__openContactPanel();">'
      + '      <div class="m-quick-ico teal"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="4"/><path d="M3 22c0-5 4-7 6-7s6 2 6 7"/><circle cx="17" cy="9" r="3"/></svg></div>'
      + '      <span>Contact</span>'
      + '    </button>'
      + '    <button onclick="window.__closeMobileQuickAdd(); window.__openDealPanel && window.__openDealPanel();">'
      + '      <div class="m-quick-ico violet"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M7 7h4l2 5-2 5H7M13 7h4l2 5-2 5h-4"/></svg></div>'
      + '      <span>Deal</span>'
      + '    </button>'
      + '    <button onclick="window.__closeMobileQuickAdd(); window.__openTaskPanel && window.__openTaskPanel();">'
      + '      <div class="m-quick-ico amber"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 11l2 2 4-4"/></svg></div>'
      + '      <span>Task</span>'
      + '    </button>'
      + '    <button onclick="window.__closeMobileQuickAdd(); if (typeof window.__openScanCard === \'function\') window.__openScanCard();">'
      + '      <div class="m-quick-ico rose"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></div>'
      + '      <span>Scan card</span>'
      + '    </button>'
      + '  </div>'
      + '  <button class="m-quick-cancel" onclick="window.__closeMobileQuickAdd()">Cancel</button>'
      + '</div>';
    document.body.appendChild(sheet);
    // Slight delay for the transition to work
    setTimeout(function () { sheet.classList.add('on'); }, 10);
  };
  window.__closeMobileQuickAdd = function () {
    var s = document.getElementById('mobileQuickSheet');
    if (s) {
      s.classList.remove('on');
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 300);
    }
  };

  // Mobile search + bell toggles
  window.__toggleMobileSearch = function () {
    if (typeof go === 'function') go('home');
    setTimeout(function () {
      var q = document.getElementById('q');
      if (q) q.focus();
    }, 200);
  };
  window.__toggleMobileBell = function () {
    var bell = document.getElementById('bellList');
    if (bell) {
      var isVisible = bell.style.display === 'block';
      bell.style.display = isVisible ? 'none' : 'block';
    } else if (typeof loadBell === 'function') {
      loadBell();
    }
  };

  // Override drawHome for mobile — ONLY on mobile, never on desktop
  if (window.__afriMobile) {
    var origDrawHome = window.drawHome;
    if (typeof origDrawHome === 'function' && !origDrawHome.__mobileWrapped) {
      window.drawHome = function () { return window.__drawMobileHome(); };
      window.drawHome.__mobileWrapped = true;
    }
  }

  // ============================================================
  // PHASE 2: Mobile contacts list
  // ============================================================
  style.textContent += `
    .m-contacts-head { padding: 14px 4px 10px; display: flex; align-items: center; gap: 8px; }
    .m-contacts-head h2 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700; color: var(--m-text); margin: 0; flex: 1; letter-spacing: -0.02em; }
    .m-scan-btn { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #9f1239; border: 0; display: grid; place-items: center; cursor: pointer; flex-shrink: 0; }
    .m-scan-btn:active { transform: scale(0.9); }
    .m-search-bar { position: sticky; top: calc(var(--m-topbar-h) + 4px); z-index: 5; background: var(--m-bg); padding: 6px 0 10px; }
    .m-search-bar input { width: 100%; padding: 11px 14px 11px 40px; border-radius: 12px; border: 0.5px solid var(--m-border); background: var(--m-surface); color: var(--m-text); font-size: 14px; font-family: inherit; outline: none; box-sizing: border-box; }
    [data-theme="dark"] .m-search-bar input { background: var(--m-surface); border-color: var(--m-border); }
    .m-search-bar { position: relative; }
    .m-search-bar svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); margin-top: 3px; color: var(--m-text-subtle); pointer-events: none; }
    .m-contact-list { display: flex; flex-direction: column; gap: 0; background: var(--m-surface); border: 0.5px solid var(--m-border); border-radius: var(--m-radius); overflow: hidden; }
    .m-contact-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 0.5px solid var(--m-border); cursor: pointer; transition: background 0.1s; }
    .m-contact-row:last-child { border-bottom: 0; }
    .m-contact-row:active { background: var(--m-accent-tint); }
    .m-contact-row .avatar { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
    .m-contact-row .info { flex: 1; min-width: 0; }
    .m-contact-row .info b { display: block; font-size: 14px; font-weight: 700; color: var(--m-text); line-height: 1.2; margin-bottom: 2px; }
    .m-contact-row .info span { display: block; font-size: 12px; color: var(--m-text-muted); line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .m-contact-row .actions { display: flex; gap: 4px; flex-shrink: 0; }
    .m-contact-row .act-btn { width: 32px; height: 32px; border-radius: 8px; border: 0; display: grid; place-items: center; cursor: pointer; }
    .m-contact-row .act-btn.call { background: #dcfce7; color: #166534; }
    .m-contact-row .act-btn.email { background: #dbeafe; color: #1e40af; }
    .m-contact-row .act-btn.wa { background: #d1fae5; color: #065f46; }
    .m-contact-row .act-btn:active { transform: scale(0.88); }
    .m-empty { text-align: center; padding: 40px 20px; color: var(--m-text-muted); font-size: 14px; }
  `;
  window.__drawMobileContacts = async function () {
    var view = document.getElementById('view');
    if (!view) return;
    var contacts = (bag.contacts || []).slice(0, 50);
    var colors = ['teal','violet','amber','rose','emerald','blue'];
    view.innerHTML =
      '<div class="m-contacts-head">'
      + '<h2>Contacts</h2>'
      + '<button class="m-import-btn" onclick="window.__importPhoneContacts && window.__importPhoneContacts()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 22h6M9 2h6"/></svg><span>Phone</span></button>'
      + '<button class="m-scan-btn" onclick="window.__openScanCard && window.__openScanCard()" aria-label="Scan card"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></button>'
      + '</div>'
      + '<div class="m-search-bar">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
      + '<input id="mContactSearch" placeholder="Search contacts..." oninput="window.__filterMobileContacts(this.value)">'
      + '<button class="m-auto-scroll-btn" onclick="window.__toggleAutoScroll(this)"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg><span>Auto</span></button>'
      + '</div>'
      + '<div id="mContactListWrap" class="m-contact-list-wrap">'
      + '<div id="mContactList" class="m-contact-list">'
      + (contacts.length > 0 ? contacts.map(function (c, i) {
          var colorClass = colors[i % colors.length];
          var initials = ((c.firstName || '').charAt(0) + (c.lastName || '').charAt(0)).toUpperCase() || '?';
          var name = ((c.firstName || '') + ' ' + (c.lastName || '')).trim() || c.name || 'Unknown';
          var phone = c.phone || '';
          var email = c.email || '';
          return '<div class="m-contact-row" onclick="go(\'contacts\')" data-name="' + esc(name.toLowerCase()) + '">'
            + '<div class="avatar ' + colorClass + '">' + esc(initials) + '</div>'
            + '<div class="info"><b>' + esc(name) + '</b><span>' + esc(email || phone || 'No contact info') + '</span></div>'
            + '<div class="actions">'
            + (phone ? '<a class="act-btn call" href="tel:' + esc(phone.replace(/[^+0-9]/g, '')) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.67 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.54 2.81.67A2 2 0 0 1 22 16.92z"/></svg></a>' : '')
            + (email ? '<a class="act-btn email" href="mailto:' + esc(email) + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg></a>' : '')
            + (phone ? '<a class="act-btn wa" href="https://wa.me/' + esc(phone.replace(/[^0-9]/g, '').replace(/^0/, '234')) + '" target="_blank"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.44 1.28 4.88L2 22l5.24-1.28A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5 14.5c-.2.5-1.2 1-1.7 1-.5 0-1.1.05-1.8-.3-.4-.2-.9-.4-1.5-.8-1.3-.9-2.2-2.4-2.3-2.5-.1-.1-.5-.7-.5-1.3 0-.6.3-1 .4-1.1.1-.1.2-.2.3-.2.1 0 .15 0 .2.01.1.01.2.01.3.2.1.2.4.8.5.9.1.15.1.3 0 .4-.1.1-.2.2-.3.3-.1.1-.2.2-.1.4.1.2.5 1 1.1 1.6.8.7 1.4 1 1.6 1.1.2.1.3.1.4-.1.1-.2.5-.5.6-.7.1-.2.2-.2.4-.1.2.1 1 .5 1.2.6.2.1.3.1.3.2.1.1.1.3 0 .5z"/></svg></a>' : '')
            + '</div>'
            + '</div>';
        }).join('') : '<div class="m-empty">No contacts yet.<br>Tap the + button to add one,<br>or scan a business card.</div>')
      + '</div>'  // close mContactList
      + '</div>';  // close mContactListWrap
  };
  window.__filterMobileContacts = function (q) {
    q = (q || '').toLowerCase();
    document.querySelectorAll('.m-contact-row').forEach(function (row) {
      var name = row.dataset.name || '';
      row.style.display = (!q || name.indexOf(q) >= 0) ? 'flex' : 'none';
    });
  };
  if (window.__afriMobile) {
    var origDrawContacts = window.drawContacts;
    if (typeof origDrawContacts === 'function' && !origDrawContacts.__mobileWrapped) {
      window.drawContacts = function () { return window.__drawMobileContacts(); };
      window.drawContacts.__mobileWrapped = true;
    }
  }

  // ============================================================
  // PHASE 3: Mobile deals board
  // ============================================================
  style.textContent += `
    .m-deals-head { padding: 14px 4px 10px; }
    .m-deals-head h2 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700; color: var(--m-text); margin: 0; letter-spacing: -0.02em; }
    .m-deals-head p { font-size: 13px; color: var(--m-text-muted); margin: 4px 0 0; }
    .m-stage-tabs { display: flex; gap: 6px; overflow-x: auto; padding: 8px 0 12px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .m-stage-tabs::-webkit-scrollbar { display: none; }
    .m-stage-tab { padding: 7px 14px; border-radius: 99px; background: var(--m-surface); border: 0.5px solid var(--m-border); color: var(--m-text-muted); font-size: 12px; font-weight: 600; white-space: nowrap; cursor: pointer; transition: all 0.15s; }
    .m-stage-tab:active { transform: scale(0.93); }
    .m-stage-tab.on { background: var(--m-accent); color: #fff; border-color: var(--m-accent); }
    .m-deal-card { background: var(--m-surface); border: 0.5px solid var(--m-border); border-radius: var(--m-radius); padding: 14px; margin-bottom: 8px; cursor: pointer; box-shadow: var(--m-shadow); }
    .m-deal-card:active { transform: scale(0.98); }
    .m-deal-card .top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
    .m-deal-card .name { font-size: 14px; font-weight: 700; color: var(--m-text); line-height: 1.3; flex: 1; }
    .m-deal-card .amount { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 800; color: var(--m-accent); white-space: nowrap; letter-spacing: -0.02em; }
    .m-deal-card .meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--m-text-muted); }
    .m-deal-card .stage-badge { padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
    .m-deal-card .stage-badge.new { background: #dbeafe; color: #1e40af; }
    .m-deal-card .stage-badge.qualified { background: #fef3c7; color: #92400e; }
    .m-deal-card .stage-badge.proposal { background: #ede9fe; color: #5b21b6; }
    .m-deal-card .stage-badge.negotiation { background: #fce7f3; color: #9f1239; }
    .m-deal-card .stage-badge.won { background: #dcfce7; color: #166534; }
    .m-deal-card .stage-badge.lost { background: #fee2e2; color: #991b1b; }
  `;
  window.__drawMobileDeals = async function () {
    var view = document.getElementById('view');
    if (!view) return;
    var deals = (bag.deals || []).slice(0, 30);
    var stages = ['NEW','QUALIFICATION','PROPOSAL','NEGOTIATION','WON','LOST'];
    var stageLabels = { NEW: 'New', QUALIFICATION: 'Qualified', PROPOSAL: 'Proposal', NEGOTIATION: 'Negotiation', WON: 'Won', LOST: 'Lost' };
    var currentStage = 'all';
    view.innerHTML =
      '<div class="m-deals-head">'
      + '<h2>Deals</h2>'
      + '<p>' + deals.length + ' deals · ₦' + (deals.reduce(function(s,d){return s + (d.amount||0)},0)/1000000).toFixed(1) + 'M pipeline</p>'
      + '</div>'
      + '<div class="m-stage-tabs" id="mStageTabs">'
      + '<button class="m-stage-tab on" onclick="window.__filterMobileDeals(\'all\', this)">All</button>'
      + stages.map(function(s) { return '<button class="m-stage-tab" onclick="window.__filterMobileDeals(\'' + s + '\', this)">' + (stageLabels[s]||s) + '</button>'; }).join('')
      + '</div>'
      + '<div id="mDealList">'
      + (deals.length > 0 ? deals.map(function (d) {
          var stage = d.stage || 'NEW';
          var stageClass = stage.toLowerCase().replace(/[^a-z]/g, '');
          return '<div class="m-deal-card" data-stage="' + esc(stage) + '" onclick="go(\'deals\')">'
            + '<div class="top">'
            + '<div class="name">' + esc(d.name || 'Untitled deal') + '</div>'
            + '<div class="amount">₦' + (Number(d.amount || 0) / 1000).toFixed(0) + 'K</div>'
            + '</div>'
            + '<div class="meta">'
            + '<span class="stage-badge ' + stageClass + '">' + esc(stageLabels[stage] || stage) + '</span>'
            + (d.closeDate ? '<span>· ' + new Date(d.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</span>' : '')
            + '</div>'
            + '</div>';
        }).join('') : '<div class="m-empty">No deals yet.<br>Tap the + button to create one.</div>')
      + '</div>';
  };
  window.__filterMobileDeals = function (stage, btn) {
    document.querySelectorAll('.m-stage-tab').forEach(function (t) { t.classList.remove('on'); });
    if (btn) btn.classList.add('on');
    document.querySelectorAll('.m-deal-card').forEach(function (card) {
      card.style.display = (stage === 'all' || card.dataset.stage === stage) ? 'block' : 'none';
    });
  };
  if (window.__afriMobile) {
    var origDrawDeals = window.drawDeals;
    if (typeof origDrawDeals === 'function' && !origDrawDeals.__mobileWrapped) {
      window.drawDeals = function () { return window.__drawMobileDeals(); };
      window.drawDeals.__mobileWrapped = true;
    }
  }

  // ============================================================
  // PHASE 4: Mobile tasks
  // ============================================================
  style.textContent += `
    .m-tasks-head { padding: 14px 4px 10px; }
    .m-tasks-head h2 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700; color: var(--m-text); margin: 0; letter-spacing: -0.02em; }
    .m-tasks-head p { font-size: 13px; color: var(--m-text-muted); margin: 4px 0 0; }
    .m-task-section { margin-bottom: 16px; }
    .m-task-section h3 { font-size: 12px; font-weight: 700; color: var(--m-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px 4px; }
    .m-task-list { background: var(--m-surface); border: 0.5px solid var(--m-border); border-radius: var(--m-radius); overflow: hidden; }
    .m-task-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-bottom: 0.5px solid var(--m-border); cursor: pointer; }
    .m-task-row:last-child { border-bottom: 0; }
    .m-task-row:active { background: var(--m-accent-tint); }
    .m-task-row.overdue { border-left: 3px solid #ef4444; }
    .m-task-row.done { opacity: 0.5; }
    .m-task-row.done .title { text-decoration: line-through; }
    .m-task-check { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--m-border-strong); flex-shrink: 0; display: grid; place-items: center; cursor: pointer; transition: all 0.15s; }
    .m-task-check:active { transform: scale(0.85); }
    .m-task-check.done { background: var(--m-accent); border-color: var(--m-accent); color: #fff; }
    .m-task-check.done svg { display: block; }
    .m-task-check svg { display: none; }
    .m-task-info { flex: 1; min-width: 0; }
    .m-task-info .title { font-size: 14px; font-weight: 600; color: var(--m-text); line-height: 1.3; }
    .m-task-info .meta { font-size: 11px; color: var(--m-text-muted); margin-top: 2px; }
    .m-task-info .meta .due { color: #ef4444; font-weight: 600; }
  `;
  window.__drawMobileTasks = async function () {
    var view = document.getElementById('view');
    if (!view) return;
    var tasks = (bag.activities || []).filter(function (a) { return a.type === 'TASK' || a.type === 'TODO' || a.type === 'CALL' || a.type === 'MEETING'; }).slice(0, 30);
    var today = new Date().toISOString().slice(0, 10);
    var overdue = tasks.filter(function (t) { return t.dueAt && t.dueAt < today && t.status !== 'HELD' && t.status !== 'DONE'; });
    var todayTasks = tasks.filter(function (t) { return t.dueAt === today && t.status !== 'HELD' && t.status !== 'DONE'; });
    var upcoming = tasks.filter(function (t) { return t.dueAt && t.dueAt > today && t.status !== 'HELD' && t.status !== 'DONE'; }).slice(0, 5);
    function renderTaskRow(t) {
      var done = t.status === 'HELD' || t.status === 'DONE';
      var isOverdue = t.dueAt && t.dueAt < today && !done;
      return '<div class="m-task-row' + (done ? ' done' : '') + (isOverdue ? ' overdue' : '') + '">'
        + '<div class="m-task-check' + (done ? ' done' : '') + '" onclick="window.__toggleMobileTask(this)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>'
        + '<div class="m-task-info"><div class="title">' + esc(t.subject || t.notes || 'Untitled task') + '</div>'
        + '<div class="meta">' + (t.dueAt ? '<span class="' + (isOverdue ? 'due' : '') + '">' + (isOverdue ? 'Overdue' : 'Due') + ': ' + new Date(t.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '</span>' : 'No due date') + '</div></div>'
        + '</div>';
    }
    view.innerHTML =
      '<div class="m-tasks-head">'
      + '<h2>Tasks</h2>'
      + '<p>' + (overdue.length + todayTasks.length) + ' due today · ' + overdue.length + ' overdue</p>'
      + '</div>'
      + (overdue.length > 0 ? '<div class="m-task-section"><h3>Overdue</h3><div class="m-task-list">' + overdue.map(renderTaskRow).join('') + '</div></div>' : '')
      + (todayTasks.length > 0 ? '<div class="m-task-section"><h3>Today</h3><div class="m-task-list">' + todayTasks.map(renderTaskRow).join('') + '</div></div>' : '')
      + (upcoming.length > 0 ? '<div class="m-task-section"><h3>Upcoming</h3><div class="m-task-list">' + upcoming.map(renderTaskRow).join('') + '</div></div>' : '')
      + (overdue.length + todayTasks.length + upcoming.length === 0 ? '<div class="m-empty">No tasks.<br>Tap the + button to create one.</div>' : '');
  };
  window.__toggleMobileTask = function (check) {
    var row = check.parentElement;
    if (check.classList.contains('done')) {
      check.classList.remove('done'); row.classList.remove('done');
    } else {
      check.classList.add('done'); row.classList.add('done');
      if (navigator.vibrate) navigator.vibrate(10);
    }
  };
  if (window.__afriMobile) {
    var origDrawTasks = window.drawTasks;
    if (typeof origDrawTasks === 'function' && !origDrawTasks.__mobileWrapped) {
      window.drawTasks = function () { return window.__drawMobileTasks(); };
      window.drawTasks.__mobileWrapped = true;
    }
  }

  // ============================================================
  // PHASE 5: Mobile profile + settings
  // ============================================================
  style.textContent += `
    .m-profile-head { padding: 20px 4px 16px; text-align: center; }
    .m-profile-avatar { width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 12px; background: linear-gradient(135deg, #0d9488, #0f766e); display: grid; place-items: center; color: #fff; font-family: 'Fraunces', serif; font-size: 28px; font-weight: 800; }
    .m-profile-head h2 { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700; color: var(--m-text); margin: 0 0 4px; }
    .m-profile-head p { font-size: 13px; color: var(--m-text-muted); margin: 0; }
    .m-profile-head .ws { font-size: 12px; color: var(--m-accent); font-weight: 600; margin-top: 8px; }
    .m-settings-section { margin-bottom: 16px; }
    .m-settings-section h3 { font-size: 12px; font-weight: 700; color: var(--m-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 8px 4px; }
    .m-settings-list { background: var(--m-surface); border: 0.5px solid var(--m-border); border-radius: var(--m-radius); overflow: hidden; }
    .m-settings-row { display: flex; align-items: center; gap: 12px; padding: 14px; border-bottom: 0.5px solid var(--m-border); cursor: pointer; }
    .m-settings-row:last-child { border-bottom: 0; }
    .m-settings-row:active { background: var(--m-accent-tint); }
    .m-settings-row .ico { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0; }
    .m-settings-row .ico.teal { background: #ccfbf1; color: #0f766e; }
    .m-settings-row .ico.violet { background: #ede9fe; color: #5b21b6; }
    .m-settings-row .ico.amber { background: #fef3c7; color: #92400e; }
    .m-settings-row .ico.rose { background: #fce7f3; color: #9f1239; }
    .m-settings-row .ico.blue { background: #dbeafe; color: #1e40af; }
    .m-settings-row .label { flex: 1; font-size: 14px; font-weight: 600; color: var(--m-text); }
    .m-settings-row .value { font-size: 12px; color: var(--m-text-muted); }
    .m-settings-row .arrow { color: var(--m-text-subtle); font-size: 18px; }
    .m-integration-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
    .m-integration-badge.on { background: #dcfce7; color: #166534; }
    .m-integration-badge.off { background: #f1f5f9; color: #64748b; }
    .m-signout-btn { display: block; width: 100%; padding: 14px; border-radius: var(--m-radius); background: #fee2e2; color: #991b1b; border: 0; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; margin-top: 16px; }
    .m-signout-btn:active { transform: scale(0.97); }
  `;
  window.__drawMobileProfile = async function () {
    var view = document.getElementById('view');
    if (!view) return;
    var name = (me && me.fullName) || 'User';
    var email = (me && me.email) || '';
    var company = (me && me.company) || 'Afri CRM';
    var initials = name.split(' ').map(function(w){return w.charAt(0)}).join('').toUpperCase().slice(0,2);
    view.innerHTML =
      '<div class="m-profile-head">'
      + '<div class="m-profile-avatar">' + esc(initials) + '</div>'
      + '<h2>' + esc(name) + '</h2>'
      + '<p>' + esc(email) + '</p>'
      + '<div class="ws">' + esc(company) + '</div>'
      + '</div>'
      + '<div class="m-settings-section">'
      + '<h3>Integrations</h3>'
      + '<div class="m-settings-list">'
      + '<div class="m-settings-row" onclick="go(\'integrations\')"><div class="ico teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg></div><div class="label">Gmail</div><span class="m-integration-badge ' + (window.__ssoCalendarConnected ? 'on' : 'off') + '">' + (window.__ssoCalendarConnected ? 'Connected' : 'Off') + '</span></div>'
      + '<div class="m-settings-row" onclick="go(\'integrations\')"><div class="ico violet"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg></div><div class="label">Calendar</div><span class="m-integration-badge ' + (window.__ssoCalendarConnected ? 'on' : 'off') + '">' + (window.__ssoCalendarConnected ? 'Connected' : 'Off') + '</span></div>'
      + '<div class="m-settings-row" onclick="go(\'integrations\')"><div class="ico blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 22h6"/></svg></div><div class="label">Mobile app</div><span class="value">PWA</span></div>'
      + '</div>'
      + '</div>'
      + '<div class="m-settings-section">'
      + '<h3>Preferences</h3>'
      + '<div class="m-settings-list">'
      + '<div class="m-settings-row" onclick="go(\'settings\')"><div class="ico amber"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2"/></svg></div><div class="label">Workspace</div><div class="arrow">›</div></div>'
      + '<div class="m-settings-row" onclick="go(\'settings\')"><div class="ico rose"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 22c0-4 4-6 8-6s8 2 8 6"/></svg></div><div class="label">Team</div><div class="arrow">›</div></div>'
      + '<div class="m-settings-row" onclick="go(\'settings\')"><div class="ico violet"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 3 7v5c0 5 3.5 7.5 8 9 4.5-1.5 8-4 8-9V7z"/></svg></div><div class="label">Permissions</div><div class="arrow">›</div></div>'
      + '<div class="m-settings-row" onclick="window.__setTheme(document.documentElement.getAttribute(\'data-theme\') === \'dark\' ? \'light\' : \'dark\')"><div class="ico blue"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div><div class="label">Dark mode</div><div class="arrow">›</div></div>'
      + '</div>'
      + '</div>'
      + '<div class="m-settings-section">'
      + '<h3>Account</h3>'
      + '<div class="m-settings-list">'
      + '<div class="m-settings-row" onclick="go(\'settings\')"><div class="ico teal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div><div class="label">Sessions</div><div class="arrow">›</div></div>'
      + '<div class="m-settings-row" onclick="go(\'integrations\')"><div class="ico amber"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg></div><div class="label">API keys</div><div class="arrow">›</div></div>'
      + '</div>'
      + '</div>'
      + '<button class="m-signout-btn" onclick="logout()">Sign out</button>';
  };

  // ============================================================
  // PHASE 6: Mobile "More" page (replaces Profile tab)
  // ============================================================
  style.textContent += `
    .m-more-head { padding: 14px 4px 10px; }
    .m-more-head h2 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 700; color: var(--m-text); margin: 0; letter-spacing: -0.02em; }
    .m-more-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
    .m-more-item { background: var(--m-surface); border: 0.5px solid var(--m-border); border-radius: var(--m-radius); padding: 16px 8px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: transform 0.12s; }
    .m-more-item:active { transform: scale(0.93); }
    .m-more-item .ico { width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; }
    .m-more-item span { font-size: 11px; font-weight: 600; color: var(--m-text); text-align: center; }
    .m-more-section h3 { font-size: 12px; font-weight: 700; color: var(--m-text-muted); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 10px 4px; }
    .m-more-section { margin-bottom: 20px; }
  `;
  window.__drawMobileMore = function () {
    var view = document.getElementById('view');
    if (!view) return;
    document.querySelectorAll('.m-tab').forEach(function (t) { t.classList.toggle('on', t.dataset.tab === 'more'); });
    window.page = 'more';
    view.innerHTML =
      '<div class="m-more-head"><h2>More</h2></div>'
      + '<div class="m-more-section">'
      + '<h3>Sales</h3>'
      + '<div class="m-more-grid">'
      + '<div class="m-more-item" onclick="go(\'contacts\')"><div class="ico" style="background:linear-gradient(135deg,#ccfbf1,#99f6e4);color:#0f766e"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22c0-5 4-7 6-7s6 2 6 7"/><circle cx="9" cy="8" r="4"/></svg></div><span>Companies</span></div>'
      + '<div class="m-more-item" onclick="go(\'deals\')"><div class="ico" style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);color:#1e40af"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 6-6"/></svg></div><span>Opportunities</span></div>'
      + '<div class="m-more-item" onclick="go(\'calendar\')"><div class="ico" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></svg></div><span>Calendar</span></div>'
      + '<div class="m-more-item" onclick="go(\'feed\')"><div class="ico" style="background:linear-gradient(135deg,#fce7f3,#fbcfe8);color:#9f1239"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg></div><span>Activity</span></div>'
      + '<div class="m-more-item" onclick="go(\'forecast\')"><div class="ico" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);color:#5b21b6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/></svg></div><span>Forecast</span></div>'
      + '<div class="m-more-item" onclick="go(\'sequences\')"><div class="ico" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:#065f46"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/></svg></div><span>Sequences</span></div>'
      + '</div>'
      + '</div>'
      + '<div class="m-more-section">'
      + '<h3>Platform</h3>'
      + '<div class="m-more-grid">'
      + '<div class="m-more-item" onclick="go(\'dashboard\')"><div class="ico" style="background:linear-gradient(135deg,#ccfbf1,#99f6e4);color:#0f766e"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg></div><span>Dashboard</span></div>'
      + '<div class="m-more-item" onclick="go(\'automation\')"><div class="ico" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></svg></div><span>Automation</span></div>'
      + '<div class="m-more-item" onclick="go(\'integrations\')"><div class="ico" style="background:linear-gradient(135deg,#dbeafe,#bfdbfe);color:#1e40af"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div><span>Integrations</span></div>'
      + '</div>'
      + '</div>'
      + '<div class="m-more-section">'
      + '<h3>Data</h3>'
      + '<div class="m-more-grid">'
      + '<div class="m-more-item" onclick="go(\'settings\')"><div class="ico" style="background:linear-gradient(135deg,#fce7f3,#fbcfe8);color:#9f1239"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="4"/><path d="M3 22c0-5 4-7 6-7s6 2 6 7"/></svg></div><span>People</span></div>'
      + '<div class="m-more-item" onclick="go(\'settings\')"><div class="ico" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);color:#5b21b6"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2 4 6v6c0 5 3 7 8 9 5-2 8-4 8-9V6z"/></svg></div><span>Pipeline</span></div>'
      + '<div class="m-more-item" onclick="go(\'audit\')"><div class="ico" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:#065f46"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="9"/></svg></div><span>Audit log</span></div>'
      + '</div>'
      + '</div>'
      // Profile section at bottom of More page
      + '<div class="m-more-section">'
      + '<h3>Profile</h3>'
      + '<div id="mProfileContent"></div>'
      + '</div>';
    // Load profile content into the div
    setTimeout(function () {
      var pc = document.getElementById('mProfileContent');
      if (pc && window.__drawMobileProfile) {
        // Temporarily move the view to the profile div
        var realView = document.getElementById('view');
        if (realView) {
          // Call the profile renderer and move its output
          var saved = realView.innerHTML;
          window.__drawMobileProfile();
          var profileHTML = realView.innerHTML;
          realView.innerHTML = saved;
          pc.innerHTML = profileHTML.replace(/^<div class="m-profile-head"/, '<div class="m-profile-head" style="padding-top:0"');
        }
      }
    }, 100);
  };

  // ============================================================
  // PHASE 7: Mobile-native features (haptics, pull-to-refresh)
  // ============================================================
  // Add haptic feedback to all buttons on mobile
  (function () {
    if (!window.__afriMobile) return;
    document.addEventListener('click', function (e) {
      if (e.target.closest('button, .m-tab, .m-contact-row, .m-deal-card, .m-task-row, .m-more-item, .m-quick-action')) {
        if (navigator.vibrate) navigator.vibrate(8);
      }
    }, true);
  })();

  // Pull-to-refresh (simulated)
  style.textContent += `
    .m-ptr { position: fixed; top: var(--m-topbar-h); left: 0; right: 0; height: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--m-bg); z-index: 80; transition: height 0.2s; }
    .m-ptr.on { height: 44px; }
    .m-ptr svg { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
  `;
  (function () {
    if (!window.__afriMobile) return;
    var ptr = document.createElement('div');
    ptr.id = 'mPtr';
    ptr.className = 'm-ptr';
    ptr.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--m-accent)" stroke-width="2" style="display:none"><path d="M21 12a9 9 0 1 1-6.2-8.55"/></svg>';
    document.body.appendChild(ptr);
    var startY = 0, pulling = false;
    document.addEventListener('touchstart', function (e) {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });
    document.addEventListener('touchmove', function (e) {
      if (pulling && window.scrollY === 0) {
        var diff = e.touches[0].clientY - startY;
        if (diff > 60 && diff < 120) {
          ptr.classList.add('on');
          ptr.querySelector('svg').style.display = 'block';
        }
      }
    }, { passive: true });
    document.addEventListener('touchend', function () {
      if (ptr.classList.contains('on')) {
        // Refresh: reload the current page
        setTimeout(function () {
          ptr.classList.remove('on');
          ptr.querySelector('svg').style.display = 'none';
          if (window.__afriMobile) {
            var p = window.page || 'home';
            if (p === 'home' && window.__drawMobileHome) window.__drawMobileHome();
            else if (p === 'contacts' && window.__drawMobileContacts) window.__drawMobileContacts();
            else if (p === 'deals' && window.__drawMobileDeals) window.__drawMobileDeals();
            else if (p === 'tasks' && window.__drawMobileTasks) window.__drawMobileTasks();
            else if (p === 'more' && window.__drawMobileMore) window.__drawMobileMore();
          }
          if (navigator.vibrate) navigator.vibrate(20);
        }, 800);
      }
      pulling = false;
    }, { passive: true });
  })();

  // ============================================================
  // MOBILE SIDE PANEL — make desktop side panels work as bottom
  // sheets on mobile (full-width, slide up from bottom)
  // ============================================================
  style.textContent += `
    [data-shell="mobile"] .side-panel-overlay { z-index: 200; background: rgba(2,6,23,0.6); backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
    [data-shell="mobile"] .side-panel {
      top: auto !important; bottom: 0 !important; right: 0 !important; left: 0 !important;
      width: 100% !important; max-width: 100% !important;
      max-height: 90vh; border-radius: 24px 24px 0 0 !important;
      transform: translateY(100%) !important;
      box-shadow: 0 -8px 40px rgba(15,23,42,0.25) !important;
      background: #fff !important;
    }
    [data-theme="dark"][data-shell="mobile"] .side-panel { background: #0f172a !important; }
    [data-shell="mobile"] .side-panel.open { transform: none !important; }

    /* Header — drag handle + title + close */
    [data-shell="mobile"] .side-panel-head {
      border-radius: 24px 24px 0 0;
      padding: 12px 20px 14px;
      position: relative;
      border-bottom: 1px solid #f1f5f9 !important;
      flex-shrink: 0;
    }
    [data-theme="dark"][data-shell="mobile"] .side-panel-head { border-bottom-color: #1e293b !important; }
    [data-shell="mobile"] .side-panel-head::before {
      content: ''; position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
      width: 36px; height: 4px; background: #cbd5e1; border-radius: 99px;
    }
    [data-shell="mobile"] .side-panel-head h2 {
      font-family: 'Fraunces', serif;
      font-size: 18px !important; font-weight: 700;
      padding-top: 8px;
      letter-spacing: -0.015em;
    }
    [data-shell="mobile"] .side-panel-close {
      width: 32px; height: 32px; border-radius: 8px;
      background: #f1f5f9 !important; padding: 0 !important;
      display: grid; place-items: center;
    }
    [data-theme="dark"][data-shell="mobile"] .side-panel-close { background: #1e293b !important; }

    /* Body — scrollable form area */
    [data-shell="mobile"] .side-panel-body {
      padding: 20px; overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      flex: 1;
    }

    /* Form labels — above inputs, clear and readable */
    [data-shell="mobile"] .side-panel-body label {
      font-size: 13px; font-weight: 700; color: #475569;
      margin-bottom: 6px; display: block;
      text-transform: none; letter-spacing: -0.005em;
    }
    [data-theme="dark"][data-shell="mobile"] .side-panel-body label { color: #94a3b8; }

    /* Form inputs — large, clear, touch-friendly */
    [data-shell="mobile"] .side-panel-body input,
    [data-shell="mobile"] .side-panel-body select,
    [data-shell="mobile"] .side-panel-body textarea {
      font-size: 16px !important; /* prevents iOS zoom on focus */
      padding: 14px 16px !important;
      border-radius: 12px !important;
      width: 100% !important;
      border: 1.5px solid #e2e8f0 !important;
      background: #fff !important;
      color: #0f172a !important;
      margin-bottom: 16px !important;
      box-sizing: border-box !important;
      -webkit-appearance: none;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    [data-theme="dark"][data-shell="mobile"] .side-panel-body input,
    [data-theme="dark"][data-shell="mobile"] .side-panel-body select,
    [data-theme="dark"][data-shell="mobile"] .side-panel-body textarea {
      background: #1e293b !important;
      border-color: #334155 !important;
      color: #f1f5f9 !important;
    }
    [data-shell="mobile"] .side-panel-body input:focus,
    [data-shell="mobile"] .side-panel-body select:focus,
    [data-shell="mobile"] .side-panel-body textarea:focus {
      border-color: #0d9488 !important;
      box-shadow: 0 0 0 3px rgba(13,148,136,0.12) !important;
    }
    [data-shell="mobile"] .side-panel-body input::placeholder { color: #94a3b8; }

    /* Select dropdown arrow */
    [data-shell="mobile"] .side-panel-body select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: right 14px center !important;
      padding-right: 40px !important;
    }

    /* Field rows — stack vertically on mobile */
    [data-shell="mobile"] .field-row { flex-direction: column; gap: 0; }
    [data-shell="mobile"] .field-row label { width: 100% !important; }
    [data-shell="mobile"] .field-row label:last-child { margin-bottom: 16px; }

    /* Checkboxes */
    [data-shell="mobile"] .side-panel-body .check {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 0; font-size: 14px; color: #0f172a;
    }
    [data-shell="mobile"] .side-panel-body .check input {
      width: 20px !important; height: 20px !important; margin: 0 !important;
    }

    /* Footer — sticky buttons at bottom */
    [data-shell="mobile"] .side-panel-foot {
      padding: 12px 20px max(16px, env(safe-area-inset-bottom, 0));
      border-top: 1px solid #f1f5f9;
      flex-shrink: 0;
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    [data-theme="dark"][data-shell="mobile"] .side-panel-foot { border-top-color: #1e293b; }
    [data-shell="mobile"] .side-panel-foot button {
      padding: 13px 20px; border-radius: 12px; font-size: 14px; font-weight: 700;
      flex: 1; min-width: 100px;
    }
    [data-shell="mobile"] .side-panel-foot button:not(.ghost) {
      background: linear-gradient(135deg, #0d9488, #0f766e) !important;
      color: #fff !important; border: 0 !important;
      box-shadow: 0 4px 12px rgba(13,148,136,0.25);
    }
    [data-shell="mobile"] .side-panel-foot button.ghost {
      background: #f1f5f9 !important; color: #475569 !important; border: 0 !important;
    }
    [data-theme="dark"][data-shell="mobile"] .side-panel-foot button.ghost {
      background: #1e293b !important; color: #94a3b8 !important;
    }
  `;

  // ============================================================
  // FIX: Wait for data before rendering mobile pages
  // The bag (data cache) is loaded by enter() in boot(). Mobile
  // pages render before enter() completes → empty/undefined data.
  // Fix: check if bag is populated, show loading state if not.
  // ============================================================
  window.__mobileDataReady = function () {
    return bag && bag.contacts && Array.isArray(bag.contacts) && bag.contacts.length >= 0;
  };
  window.__mobileShowLoading = function () {
    var view = document.getElementById('view');
    if (!view) return;
    view.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:50vh;gap:12px"><div style="width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#0d9488;border-radius:50%;animation:spin 0.8s linear infinite"></div><p style="color:#64748b;font-size:14px">Loading your data...</p></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
  };

  // Wrap __drawMobileHome to wait for data
  var origDrawMobileHome = window.__drawMobileHome;
  if (typeof origDrawMobileHome === 'function') {
    window.__drawMobileHome = async function () {
      if (!window.__mobileDataReady()) {
        window.__mobileShowLoading();
        setTimeout(function () { if (window.__afriMobile) window.__drawMobileHome(); }, 500);
        return;
      }
      return origDrawMobileHome.apply(this, arguments);
    };
  }
  // Wrap __drawMobileContacts
  var origDrawMobileContacts = window.__drawMobileContacts;
  if (typeof origDrawMobileContacts === 'function') {
    window.__drawMobileContacts = async function () {
      if (!window.__mobileDataReady()) {
        window.__mobileShowLoading();
        setTimeout(function () { if (window.__afriMobile) window.__drawMobileContacts(); }, 500);
        return;
      }
      return origDrawMobileContacts.apply(this, arguments);
    };
  }
  // Wrap __drawMobileDeals
  var origDrawMobileDeals = window.__drawMobileDeals;
  if (typeof origDrawMobileDeals === 'function') {
    window.__drawMobileDeals = async function () {
      if (!window.__mobileDataReady()) {
        window.__mobileShowLoading();
        setTimeout(function () { if (window.__afriMobile) window.__drawMobileDeals(); }, 500);
        return;
      }
      return origDrawMobileDeals.apply(this, arguments);
    };
  }
  // Wrap __drawMobileTasks
  var origDrawMobileTasks = window.__drawMobileTasks;
  if (typeof origDrawMobileTasks === 'function') {
    window.__drawMobileTasks = async function () {
      if (!window.__mobileDataReady()) {
        window.__mobileShowLoading();
        setTimeout(function () { if (window.__afriMobile) window.__drawMobileTasks(); }, 500);
        return;
      }
      return origDrawMobileTasks.apply(this, arguments);
    };
  }

  // ============================================================
  // PHONE CONTACTS IMPORT — uses navigator.contacts API (where
  // supported — Chrome on Android, Safari on iOS 17+)
  // ============================================================
  style.textContent += `
    .m-import-btn { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 12px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e40af; border: 0; font-size: 13px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
    .m-import-btn:active { transform: scale(0.93); }
    .m-import-btn svg { width: 16px; height: 16px; }
  `;
  window.__importPhoneContacts = async function () {
    if (!('contacts' in navigator) || !('select' in navigator.contacts)) {
      toast('Phone contacts import not supported. Use CSV import on desktop.');
      return;
    }
    try {
      var contacts = await navigator.contacts.select(['name', 'email', 'tel'], { multiple: true });
      if (!contacts || contacts.length === 0) { toast('No contacts selected.'); return; }
      var imported = 0;
      for (var i = 0; i < contacts.length; i++) {
        var c = contacts[i];
        var nameParts = (c.name && c.name[0]) ? c.name[0].split(' ') : [''];
        var firstName = nameParts[0] || '';
        var lastName = nameParts.slice(1).join(' ') || '';
        var email = (c.email && c.email[0]) ? c.email[0] : '';
        var phone = (c.tel && c.tel[0]) ? c.tel[0] : '';
        if (!firstName && !email && !phone) continue;
        var res = await api('/crm/api/contacts', { method: 'POST', body: JSON.stringify({ firstName: firstName, lastName: lastName, email: email, phone: phone, source: 'Phone import', status: 'ACTIVE' }) });
        if (res && !res.error) imported++;
      }
      toast('Imported ' + imported + ' contact' + (imported !== 1 ? 's' : '') + ' from your phone');
      await refresh();
      if (window.__afriMobile && window.__drawMobileContacts) window.__drawMobileContacts();
      if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    } catch (e) {
      toast('Could not import contacts: ' + (e.message || 'permission denied'));
    }
  };

  // ============================================================
  // AUTO-SCROLL for mobile contact list — slow continuous scroll
  // that pauses on touch interaction
  // ============================================================
  style.textContent += `
    .m-auto-scroll-btn { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 10px; background: var(--m-surface); border: 0.5px solid var(--m-border); color: var(--m-text-muted); font-size: 12px; font-weight: 600; cursor: pointer; flex-shrink: 0; }
    .m-auto-scroll-btn:active { transform: scale(0.93); }
    .m-auto-scroll-btn.on { background: var(--m-accent-tint-strong); color: var(--m-accent); border-color: var(--m-accent); }
    .m-contact-list-wrap { position: relative; overflow: hidden; }
    .m-contact-list-wrap.auto { height: calc(100vh - 280px); overflow-y: auto; -webkit-overflow-scrolling: touch; }
    .m-contact-list-wrap.auto.paused { animation-play-state: paused; }
  `;
  window.__toggleAutoScroll = function (btn) {
    var wrap = document.getElementById('mContactListWrap');
    if (!wrap) return;
    if (wrap.classList.contains('auto')) {
      wrap.classList.remove('auto');
      if (btn) { btn.classList.remove('on'); btn.querySelector('span').textContent = 'Auto'; }
      if (window.__autoScrollInterval) { clearInterval(window.__autoScrollInterval); window.__autoScrollInterval = null; }
    } else {
      wrap.classList.add('auto');
      if (btn) { btn.classList.add('on'); btn.querySelector('span').textContent = 'Stop'; }
      // Slow auto-scroll: scroll down 1px every 50ms (~20px/s)
      window.__autoScrollInterval = setInterval(function () {
        if (!wrap.classList.contains('paused')) {
          wrap.scrollTop += 1;
          // Loop back to top when reaching bottom
          if (wrap.scrollTop + wrap.clientHeight >= wrap.scrollHeight - 5) {
            wrap.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 50);
      // Pause on touch
      wrap.addEventListener('touchstart', function () { wrap.classList.add('paused'); }, { passive: true });
      wrap.addEventListener('touchend', function () { setTimeout(function () { wrap.classList.remove('paused'); }, 2000); }, { passive: true });
    }
  };

  // ============================================================
  // ADVANCED BUSINESS CARD SCANNER — accessible from more places
  // Floating scan button that appears on any mobile page
  // ============================================================
  style.textContent += `
    .m-scan-fab {
      position: fixed; bottom: calc(var(--m-tabbar-h) + 78px); left: 16px; z-index: 88;
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #fce7f3, #fbcfe8); color: #9f1239;
      border: 0.5px solid #fbcfe8; cursor: pointer;
      display: grid; place-items: center;
      box-shadow: 0 4px 12px rgba(244,114,182,0.25);
      transition: transform 0.15s;
    }
    .m-scan-fab:active { transform: scale(0.88); }
    .m-scan-fab svg { width: 20px; height: 20px; }

    /* Shell: the rail fills its column. Collapsed is 76px, not a 64px
       strip sitting inside a 248px hole. Labels stay visible until collapse. */
    .app { display: grid !important; grid-template-columns: 240px minmax(0, 1fr) !important; min-height: 100vh; }
    .app.rail { grid-template-columns: 76px minmax(0, 1fr) !important; }
    .work, #view, main { min-width: 0 !important; }
    #nav {
      width: auto !important; min-width: 0 !important; max-width: none !important;
      height: 100vh !important; overflow: hidden !important; padding: 14px 10px 12px !important;
      background: rgba(12, 16, 28, 0.92) !important;
    }
    #nav .brand { display: flex !important; align-items: center !important; gap: 10px !important; justify-content: flex-start !important; padding: 4px 8px 14px !important; }
    #nav .brand > div { display: block !important; }
    #nav .brand .logo { width: 36px !important; height: 36px !important; border-radius: 10px !important; font-size: 16px !important; box-shadow: none !important; }
    #nav .navlabel { display: block !important; padding: 14px 10px 4px !important; }
    #nav .navscroll { align-items: stretch !important; gap: 2px !important; overflow: auto !important; }
    #nav [data-page], #nav button:not(.fold),
    #nav [data-page]:hover, #nav [data-page][class*="on"] {
      width: 100% !important; height: auto !important; min-width: 0 !important; min-height: 36px !important;
      padding: 7px 8px !important; margin: 0 !important; justify-content: flex-start !important; gap: 10px !important;
      background: transparent !important; border: 0 !important; box-shadow: none !important; border-radius: 8px !important;
      color: #cbd5e1 !important;
    }
    #nav [data-page].on, #nav [data-page]:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; }
    #nav [data-page] > span:not(.ico), #nav button:not(.fold) > span:not(.ico):not(.chev) { display: inline !important; }
    #nav .ico { width: 28px !important; height: 28px !important; border-radius: 8px !important; background: rgba(255,255,255,0.07) !important; flex: none !important; }
    #nav [data-page][class*="on"]::before { display: none !important; }
    #nav .navfoot, #nav .navend { flex-direction: row !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; }
    .app.rail #nav .brand > div,
    .app.rail #nav .navlabel,
    .app.rail #nav [data-page] > span:not(.ico),
    .app.rail #nav button:not(.fold) > span:not(.ico) { display: none !important; }
    .app.rail #nav .navscroll, .app.rail #nav .navfoot, .app.rail #nav .navend { align-items: center !important; }
    .app.rail #nav [data-page], .app.rail #nav button:not(.fold) {
      width: 44px !important; min-width: 44px !important; justify-content: center !important; padding: 6px !important;
    }
    .app.rail .launcher { left: 88px !important; }
    header { display: flex !important; align-items: center !important; gap: 12px !important; padding: 10px 16px !important; }
    header .tools { display: flex !important; align-items: center !important; gap: 2px !important; }
    header .iconbtn { width: 34px !important; height: 34px !important; border-radius: 8px !important; background: transparent !important; color: #e2e8f0 !important; }
    .launcher {
      left: 256px !important; right: 24px !important; bottom: 20px !important; width: auto !important; max-width: 680px !important;
      background: rgba(15, 18, 32, 0.96) !important; border: 1px solid rgba(255,255,255,0.08) !important;
      border-radius: 16px !important;
    }
    .launcher .hubs button, .launcher button.fly {
      background: transparent !important; color: #e2e8f0 !important; border: 0 !important; border-radius: 10px !important;
      box-shadow: none !important; width: 100% !important; height: auto !important; min-height: 0 !important;
      justify-content: flex-start !important; padding: 10px 12px !important; text-align: left !important;
    }
    .launcher .hubs button.on, .launcher .hubs button:hover, .launcher button.fly:hover {
      background: rgba(20, 184, 166, 0.16) !important; color: #99f6e4 !important;
    }
    .guides nav {
      background: rgba(22, 28, 45, 0.88) !important; color: #e7edf5 !important;
      border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 16px !important; padding: 8px !important;
    }
    .guides nav button { background: transparent !important; color: #e2e8f0 !important; border-radius: 10px !important; box-shadow: none !important; }
    .guides nav button.on, .guides nav button:hover { background: rgba(255,255,255,0.08) !important; }

    /* Dashboard tiles were white with light text, so the numbers vanished. */
    #view .kpi, #view .actcard, #view .card, #view .sheet, #view .desk, #view .guide {
      background: rgba(16, 22, 36, 0.94) !important;
      color: #e7edf5 !important;
      border: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,0.18) !important;
    }
    #view .kpi b, #view .actcard b, #view .card b, #view .rowline b, #view .hbar b {
      color: #f8fafc !important;
    }
    #view .kpi h2, #view .card h2, #view .actcard h2, #view .kpi .meta, #view .meta, #view .hello, #view .rowline span, #view .hbar span {
      color: #94a3b8 !important;
    }
    #view .rowline { border-top-color: rgba(255,255,255,0.08) !important; }
    #view .sumline { background: rgba(255,255,255,0.12) !important; }
    #view .hbar i { background: #14b8a6 !important; }
    #view .guides { display: flex !important; flex-direction: column !important; gap: 14px !important; }
    #view .guides nav {
      display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 6px !important;
      width: 100% !important; background: rgba(12, 16, 28, 0.9) !important;
      border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 14px !important; padding: 6px !important;
    }
    #view .guides nav button, #view .guides nav button.on, #view .tabs button, #view .filters button, #view button.ghost {
      background: transparent !important; color: #cbd5e1 !important; border-radius: 10px !important;
      border: 1px solid transparent !important; box-shadow: none !important; width: auto !important;
      padding: 8px 14px !important; font-weight: 600 !important;
    }
    #view .guides nav button.on {
      background: rgba(15, 118, 110, 0.45) !important; color: #ecfdf5 !important;
      border-color: rgba(45, 212, 191, 0.4) !important;
    }
    #view .guides nav button:hover, #view .tabs button:hover { background: rgba(255,255,255,0.06) !important; }
    #view .pulse article { background: rgba(16, 22, 36, 0.94) !important; border: 1px solid rgba(255,255,255,0.08) !important; }
    #view .pulse b { color: #f8fafc !important; }
    #view .pulse span { color: #94a3b8 !important; }

    /* Scrollbar: thin and dark, no white track and no arrow buttons.
       Same pattern HubSpot and Attio use: the bar only appears over the list. */
    #nav .navscroll, #view, .work {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.35) transparent;
    }
    #nav .navscroll::-webkit-scrollbar, #view::-webkit-scrollbar, .work::-webkit-scrollbar { width: 8px; height: 8px; }
    #nav .navscroll::-webkit-scrollbar-track, #view::-webkit-scrollbar-track, .work::-webkit-scrollbar-track { background: transparent; }
    #nav .navscroll::-webkit-scrollbar-thumb, #view::-webkit-scrollbar-thumb, .work::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.28);
      border-radius: 99px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    #nav .navscroll::-webkit-scrollbar-thumb:hover, #view::-webkit-scrollbar-thumb:hover { background: rgba(226, 232, 240, 0.45); background-clip: padding-box; }
    #nav .navscroll::-webkit-scrollbar-button, #view::-webkit-scrollbar-button { display: none; width: 0; height: 0; }

    #nav {
      background:
        radial-gradient(140px 90px at 30% 0%, rgba(45, 212, 191, 0.16), transparent 72%),
        linear-gradient(180deg, #121a2e 0%, #0b1020 100%) !important;
    }
    .nav-section-header {
      display: block !important;
      font-size: 10px !important;
      letter-spacing: 0.16em !important;
      color: #64748b !important;
      padding: 16px 8px 6px !important;
      white-space: nowrap !important;
    }
    .app.rail .nav-section-header { display: none !important; }
    #nav .ico { background: transparent !important; color: inherit !important; }
    #nav [data-page="home"] .ico { color: #2dd4bf !important; background: rgba(45, 212, 191, 0.14) !important; }
    #nav [data-page="leads"] .ico, #nav [data-page="deals"] .ico, #nav [data-page="opportunities"] .ico { color: #34d399 !important; background: rgba(52, 211, 153, 0.14) !important; }
    #nav [data-page="contacts"] .ico, #nav [data-page="companies"] .ico { color: #60a5fa !important; background: rgba(96, 165, 250, 0.14) !important; }
    #nav [data-page="tasks"] .ico, #nav [data-page="calendar"] .ico, #nav [data-page="inbox"] .ico, #nav [data-page="feed"] .ico { color: #fb923c !important; background: rgba(251, 146, 60, 0.14) !important; }
    #nav [data-page="dashboard"] .ico, #nav [data-page="forecast"] .ico { color: #c084fc !important; background: rgba(192, 132, 252, 0.16) !important; }
    #nav [data-page="automation"] .ico, #nav [data-page="integrations"] .ico, #nav [data-page="guide"] .ico { color: #cbd5e1 !important; background: rgba(148, 163, 184, 0.14) !important; }
    #nav [data-page].on { box-shadow: inset 3px 0 0 #2dd4bf !important; background: rgba(255,255,255,0.06) !important; }
    #nav [data-page] { transition: background 0.15s ease !important; }
    #nav [data-page]:hover .ico { transform: translateY(-1px); }
    #nav .ico { transition: transform 0.15s ease !important; }
  `;
  window.__injectScanFab = function () {
    if (!window.__afriMobile) return;
    if (document.getElementById('mScanFab')) return;
    var fab = document.createElement('button');
    fab.id = 'mScanFab';
    fab.className = 'm-scan-fab';
    fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>';
    fab.onclick = function () { if (window.__openScanCard) window.__openScanCard(); };
    document.body.appendChild(fab);
  };

  // Inject mobile shell as early as possible — no setTimeout delays
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectMobileShell);
  } else {
    // DOM already loaded, inject immediately
    injectMobileShell();
  }
  // Also inject after boot() runs (in case DOM was already ready but SPA hadn't loaded yet)
  setTimeout(injectMobileShell, 300);

})();

// deployment trigger 1792579054
// direct push 1792579593


(function () {
  const skin = document.createElement('style');
  skin.textContent = `
    .app {
      display: grid !important;
      grid-template-columns: 248px minmax(0, 1fr) !important;
      grid-template-rows: 56px minmax(0, 1fr) !important;
      height: 100vh !important;
      background: #f5f8fa !important;
    }
    .app.rail { grid-template-columns: 76px minmax(0, 1fr) !important; }
    .app > header {
      grid-column: 1 / -1 !important;
      grid-row: 1 !important;
      height: 56px !important;
      background: #1b1e22 !important;
      color: #fff !important;
      border: 0 !important;
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 0 14px !important;
      position: relative !important;
      z-index: 5 !important;
    }
    .app > header .search { flex: 0 1 360px !important; }
    .app > header .search input {
      background: #2c3238 !important;
      color: #fff !important;
      border: 0 !important;
      border-radius: 999px !important;
      height: 36px !important;
      padding: 0 36px 0 16px !important;
    }
    .app > header .search input::placeholder { color: #9aa6b2 !important; }
    .app > header .iconbtn, .app > header .acct { color: #fff !important; background: transparent !important; }
    .app > header .acct { border-radius: 999px !important; padding: 4px 10px 4px 4px !important; }
    #nav {
      grid-row: 2 !important;
      background: #2d333b !important;
      color: #f5f8fa !important;
      border-right: 0 !important;
      width: auto !important;
      max-width: none !important;
      min-width: 0 !important;
    }
    #nav .brand b, #nav .brand .meta { color: #fff !important; }
    #nav [data-page], #nav button:not(.fold),
    #nav [data-page]:hover, #nav [data-page][class*="on"] {
      color: #f5f8fa !important;
      background: transparent !important;
      box-shadow: none !important;
      border: 0 !important;
      border-radius: 8px !important;
      font-weight: 500 !important;
      font-size: 14px !important;
    }
    #nav [data-page].on, #nav [data-page]:hover { background: rgba(255,255,255,0.08) !important; }
    #nav .ico, #nav [data-page] .ico {
      width: 18px !important; height: 18px !important;
      background: transparent !important;
      color: #d5dde5 !important;
      border-radius: 0 !important;
    }
    .nav-section-header { color: #8fa4b8 !important; letter-spacing: 0.08em !important; }
    .app.rail .nav-section-header { display: none !important; }
    .work { grid-row: 2 !important; background: #f5f8fa !important; min-width: 0 !important; display: block !important; overflow: auto !important; }
    #view {
      background: #fff !important;
      color: #33475b !important;
      margin: 12px !important;
      min-height: calc(100vh - 80px) !important;
      border-radius: 16px !important;
      border: 1px solid #e5e8eb !important;
      padding: 22px 24px 32px !important;
      box-shadow: none !important;
    }
    #view, #view .meta, #view .hello, #view h1, #view h2, #view b, #view p, #view td, #view th, #view label, #view span {
      color: #33475b !important;
      text-shadow: none !important;
    }
    #view .meta, #view .hello { color: #516f90 !important; }
    #view .kpi, #view .card, #view .actcard, #view .desk, #view .sheet, #view .guide, #view .pulse article, #view .guides nav {
      background: #fff !important;
      color: #33475b !important;
      border: 1px solid #eaf0f6 !important;
      box-shadow: none !important;
    }
    #view .desk { border: 0 !important; padding: 0 !important; }
    #view table { background: #fff !important; color: #33475b !important; }
    #view .tabs { border-bottom: 1px solid #e5e8eb !important; gap: 4px !important; }
    #view .tabs button, #view .guides nav button, #view .filters button, #view button.ghost {
      background: transparent !important;
      color: #33475b !important;
      border: 0 !important;
      border-radius: 8px !important;
      box-shadow: none !important;
    }
    #view .tabs button.on { background: #eaf0f6 !important; color: #33475b !important; box-shadow: inset 0 -2px 0 #33475b !important; border-radius: 8px 8px 0 0 !important; }
    #view .banner { background: #e5f8fb !important; border: 1px solid #99d6e4 !important; border-radius: 12px !important; color: #33475b !important; padding: 14px 16px !important; }
    #view button:not(.ghost):not(.x):not(.iconbtn) { background: #0b6b4f !important; color: #fff !important; border-radius: 20px !important; }
    #view .empty h2 { font-size: 28px !important; font-weight: 650 !important; letter-spacing: -0.02em !important; }
    .hs-hello { font-size: 16px; color: #33475b; margin: 0; }
    .hs-title { font-family: Georgia, "Times New Roman", serif; font-size: 42px; font-weight: 500; letter-spacing: -0.03em; margin: 8px 0 18px; color: #2d3e50; }
    .hs-home { display: grid; grid-template-columns: minmax(0, 1.4fr) 280px; gap: 18px; align-items: start; }
    .hs-card { border: 1px solid #cbd6e2; border-radius: 12px; padding: 16px 18px; display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 12px; background: #f7fbfd; }
    .hs-card b { display: block; font-size: 16px; margin-bottom: 4px; }
    .hs-card p { margin: 0; color: #516f90; font-size: 14px; }
    .hs-side { border-left: 1px solid #e5e8eb; padding-left: 18px; }
    .hs-side h2 { margin: 0 0 4px; font-size: 16px; }
    .hs-metric { font-size: 42px; font-weight: 500; margin: 18px 0 0; letter-spacing: -0.03em; }
    .hs-metric span { display: block; font-size: 14px; color: #516f90; font-weight: 400; margin-top: 2px; }
    @media (max-width: 980px) { .hs-home { grid-template-columns: 1fr; } .hs-side { border: 0; padding: 0; } }
  `;
  document.head.appendChild(skin);

  const earlier = paintNav;
  paintNav = function () {
    earlier();
    const scroll = document.querySelector('#nav .navscroll');
    if (!scroll) return;
    const item = (id, label, icon) => navItem(id, label, icon);
    scroll.innerHTML =
      item('home', 'Home', svg('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>')) +
      item('contacts', 'Contacts', svg('<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3"/>')) +
      item('companies', 'Companies', svg('<path d="M4 21V5h9v16M13 9h7v12"/><path d="M7 9h2M7 13h2M16 13h2"/>')) +
      item('deals', 'Deals', svg('<path d="M4 7h16v10H4z"/><path d="M4 12h16"/>')) +
      item('tasks', 'Tasks', svg('<path d="M8 7h12M8 12h12M8 17h12"/><path d="M4 7h.01M4 12h.01M4 17h.01"/>')) +
      '<div class="nav-section-header">Sales</div>' +
      item('automation', 'Automation', svg('<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>')) +
      item('agent', 'Agent', svg('<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>')) +
      item('marketing', 'Marketing', svg('<path d="M4 10v4l10 4V6z"/><path d="M14 8.5a4 4 0 0 1 0 7"/>')) +
      item('feed', 'Activity', svg('<path d="M5 6h14M5 12h14M5 18h10"/>')) +
      item('forecast', 'Forecast', svg('<path d="M4 16l5-5 3 3 7-7"/><path d="M14 7h5v5"/>')) +
      '<div class="nav-section-header">Platform</div>' +
      item('integrations', 'Integrations', svg('<circle cx="7" cy="12" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="17" cy="17" r="3"/><path d="M10 12h4M14.5 9.5 12 12l2.5 2.5"/>')) +
      item('dashboard', 'Reporting', svg('<path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>')) +
      item('guide', 'Start guide', svg('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2 2"/>'));
    document.querySelectorAll('#nav button').forEach((el) => el.classList.toggle('on', el.dataset.page === page));
  };

  drawHome = async function () {
    const first = (me.fullName || 'there').split(' ')[0];
    if (!homePack) {
      const [brain, day, guide] = await Promise.all([api('/crm/api/brain'), api('/crm/api/day'), api('/crm/api/guide')]);
      homePack = { brain: brain || {}, day: day || {}, guide: guide || null };
    }
    const today = new Date().toISOString().slice(0, 10);
    const due = (row) => String(row.dueAt || '').slice(0, 10);
    const tasks = (bag.activities || []).filter((row) => row.type === 'TASK' || row.type === 'CALL' || row.type === 'MEETING');
    const dueToday = tasks.filter((row) => row.status === 'PLANNED' && due(row) === today);
    const meetings = tasks.filter((row) => row.type === 'MEETING' && row.status === 'PLANNED' && (!due(row) || due(row) === today));
    const openDeals = (bag.deals || []).filter((row) => !String(stageOf(row)).startsWith('CLOSED'));
    const when = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('view').innerHTML = `
      <div class="hs-home">
        <div>
          <p class="hs-hello">${hello}, ${esc(first)}</p>
          <h1 class="hs-title">Here's where to start today</h1>
          <article class="hs-card">
            <div><b>Create a new contact</b><p>See their details and the conversations you have had in one place.</p></div>
            <button type="button" onclick="go('contacts','contact')">Create contact</button>
          </article>
          <article class="hs-card">
            <div><b>Create a deal</b><p>Track the naira moving through your pipeline, from first talk to closed won.</p></div>
            <button type="button" class="ghost" onclick="go('deals','deal')">Create deal</button>
          </article>
          <article class="hs-card">
            <div><b>Work today's tasks</b><p>${dueToday.length} due today. ${tasks.filter((row) => row.status === 'PLANNED' && due(row) && due(row) < today).length} overdue.</p></div>
            <button type="button" class="ghost" onclick="go('tasks')">Open tasks</button>
          </article>
        </div>
        <aside class="hs-side">
          <h2>Your day at a glance</h2>
          <p class="hello">${esc(when)}</p>
          <div class="hs-metric">${meetings.length}<span>Meetings</span></div>
          <div class="hs-metric">${dueToday.length}<span>Tasks due today</span></div>
          <div class="hs-metric">${openDeals.length}<span>Open deals</span></div>
        </aside>
      </div>`;
  };
})();

(function () {
  const extra = document.createElement('style');
  extra.textContent = `
    .hs-kicker { font-size: 13px; color: #516f90 !important; display: flex; align-items: center; gap: 8px; margin: 0 0 8px; }
    .hs-lead { font-family: Georgia, "Times New Roman", serif; font-size: clamp(32px, 4vw, 46px); font-weight: 500; letter-spacing: -0.03em; line-height: 1.15; margin: 0 0 16px; color: #2d3e50 !important; }
    .hs-point { display: flex; gap: 10px; align-items: flex-start; margin: 10px 0; color: #33475b; }
    .hs-split { display: grid; grid-template-columns: minmax(0, 1.2fr) 300px; gap: 20px; align-items: start; }
    .hs-stack { display: grid; gap: 10px; }
    .hs-mini { background: #fff; border: 1px solid #e5e8eb; border-radius: 12px; padding: 12px 14px; box-shadow: 0 8px 24px rgba(45,62,80,0.06); }
    .hs-mini b { display: block; margin-bottom: 4px; }
    .hs-agents { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 16px 0; }
    .hs-agent { border: 1px solid #e5e8eb; border-radius: 14px; padding: 14px; background: #fff; }
    .hs-agent .num { font-size: 28px; font-weight: 600; letter-spacing: -0.03em; }
    .hs-agent p { color: #516f90 !important; min-height: 40px; }
    .hs-tabs { display: flex; gap: 18px; border-bottom: 1px solid #e5e8eb; margin: 8px 0 16px; }
    .hs-tabs button { background: transparent !important; color: #516f90 !important; border-radius: 0 !important; padding: 10px 0 !important; box-shadow: none !important; }
    .hs-tabs button.on { color: #2d3e50 !important; box-shadow: inset 0 -2px 0 #2d3e50 !important; }
    .hs-board { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 16px; }
    .hs-day { border: 1px solid #e5e8eb; border-radius: 12px; overflow: hidden; }
    .hs-slot { display: grid; grid-template-columns: 72px 1fr; min-height: 42px; border-top: 1px solid #eef2f6; font-size: 13px; }
    .hs-slot span { color: #7c98b6 !important; padding: 8px; }
    .hs-slot div { padding: 8px; }
    .hs-chip { display: inline-block; background: #e5f8fb; border-radius: 6px; padding: 2px 6px; }
    @media (max-width: 980px) { .hs-split, .hs-board, .hs-agents { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(extra);

  const navBefore = paintNav;
  paintNav = function () {
    navBefore();
    const scroll = document.querySelector('#nav .navscroll');
    if (!scroll || scroll.querySelector('[data-page="sales"]')) return;
    const sales = navItem('sales', 'Sales workspace', svg('<path d="M4 7h16v12H4z"/><path d="M8 7V5h8v2"/>'));
    const marker = scroll.querySelector('.nav-section-header');
    if (marker) marker.insertAdjacentHTML('beforebegin', sales);
    else scroll.insertAdjacentHTML('beforeend', sales);
    document.querySelectorAll('#nav button').forEach((el) => el.classList.toggle('on', el.dataset.page === page));
  };

  let salesTab = 'summary';
  function dueDay(row) { return String(row.dueAt || '').slice(0, 10); }
  function planned(row) { return row.status === 'PLANNED'; }

  function drawSales() {
    const today = new Date().toISOString().slice(0, 10);
    const tasks = (bag.activities || []).filter((row) => row.type === 'TASK' || row.type === 'CALL' || row.type === 'MEETING');
    const meetings = tasks.filter((row) => row.type === 'MEETING' && planned(row) && (!dueDay(row) || dueDay(row) === today));
    const dueToday = tasks.filter((row) => planned(row) && dueDay(row) === today);
    const companies = bag.companies || [];
    const deals = (bag.deals || []).filter((row) => !String(stageOf(row)).startsWith('CLOSED'));
    const tabs = [['summary','Summary'],['companies','Companies'],['deals','Deals'],['tasks','Tasks'],['schedule','Schedule'],['dashboard','Dashboard']];
    const tabBar = `<div class="hs-tabs">${tabs.map(([id, label]) => `<button type="button" class="${salesTab === id ? 'on' : ''}" onclick="salesTab='${id}';draw()">${label}</button>`).join('')}</div>`;
    let main = '';
    if (salesTab === 'companies') {
      main = companies.map((row) => `<article class="hs-card"><div><b>${esc(row.name)}</b><p>${esc(row.industry || row.city || 'No industry yet')}</p></div><button type="button" class="ghost" onclick="openRecord('company','${row.id}')">Open</button></article>`).join('') || '<p class="hello">No company yet.</p>';
    } else if (salesTab === 'deals') {
      main = deals.map((row) => `<article class="hs-card"><div><b>${esc(row.name)}</b><p>${money(row.amount)} · ${esc(row.stage || '')}</p></div><button type="button" class="ghost" onclick="openRecord('deal','${row.id}')">Open</button></article>`).join('') || '<p class="hello">No open deal.</p>';
    } else if (salesTab === 'tasks') {
      main = dueToday.map((row) => `<article class="hs-card"><div><b>${esc(row.subject)}</b><p>${esc(row.type)} · due today</p></div><button type="button" class="ghost" onclick="go('tasks')">Open tasks</button></article>`).join('') || '<p class="hello">Nothing is due today.</p><button type="button" onclick="go(\'tasks\',\'task\')">Create a task</button>';
    } else if (salesTab === 'dashboard') {
      const won = (bag.deals || []).filter((row) => stageOf(row) === 'CLOSED_WON');
      const revenue = won.reduce((sum, row) => sum + Number(row.amount || 0), 0);
      main = `<div class="hs-agents"><article class="hs-agent"><div class="num">${money(revenue)}</div><p>Won, this workspace</p></article><article class="hs-agent"><div class="num">${deals.length}</div><p>Open deals</p></article><article class="hs-agent"><div class="num">${(bag.contacts || []).length}</div><p>Contacts</p></article></div><button type="button" class="ghost" onclick="go('dashboard')">Open reporting</button>`;
    } else if (salesTab === 'schedule') {
      main = '<p class="hello">Meetings dated today sit on the clock. A task with only a date is listed under the clock.</p>';
    } else {
      main = `<article class="hs-card"><div><b>Tasks</b><p>Keep the list that is actually due, not a sample.</p></div><button type="button" class="ghost" onclick="salesTab='tasks';draw()">Open</button></article>
        <article class="hs-card"><div><b>Outreach</b><p>${(bag.contacts || []).length} contacts. ${companies.length} companies.</p></div><button type="button" class="ghost" onclick="go('contacts')">Open contacts</button></article>`;
    }
    const hours = [];
    for (let hour = 8; hour <= 18; hour++) {
      const label = (hour % 12 || 12) + (hour < 12 ? ':00 AM' : ':00 PM');
      const hit = meetings.filter((row) => {
        const match = String(row.dueAt || '').match(/T(\d{2})/);
        return match && Number(match[1]) === hour;
      });
      hours.push(`<div class="hs-slot"><span>${label}</span><div>${hit.map((row) => `<span class="hs-chip">${esc(row.subject)}</span>`).join(' ') || ''}</div></div>`);
    }
    const untimed = meetings.filter((row) => !/T\d{2}/.test(String(row.dueAt || ''))).map((row) => `<div class="hs-chip">${esc(row.subject)}</div>`).join(' ');
    document.getElementById('view').innerHTML = `<div class="board-head"><h1 style="margin:0">Sales <span class="meta" style="font-weight:500">| ${esc(company)}</span></h1></div>${tabBar}<div class="hs-board"><div>${main}</div><aside class="hs-day"><div style="padding:12px 14px"><b>Today</b><div class="meta">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>${untimed ? '<div style="margin-top:8px">' + untimed + '</div>' : ''}</div>${hours.join('')}</aside></div>`;
  }

  drawAgent = function () {
    const hot = (bag.leads || []).filter((row) => row.rating === 'HOT');
    const today = new Date().toISOString().slice(0, 10);
    const tasks = (bag.activities || []).filter((row) => (row.type === 'TASK' || row.type === 'CALL') && row.status === 'PLANNED' && dueDay(row) && dueDay(row) <= today);
    const open = (bag.deals || []).filter((row) => !String(stageOf(row)).startsWith('CLOSED'));
    const worth = open.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    document.getElementById('view').innerHTML = `
      <p class="hs-kicker">Agent Hub</p>
      <h1 class="hs-lead">The agents that read this workspace.</h1>
      <p class="hello">Each number is a record you already have. Asking a question uses the model only when its key is on the server, and it is told not to invent a figure.</p>
      <div class="hs-agents">
        <article class="hs-agent"><div class="num">${tasks.length}</div><b>Follow-up</b><p>Tasks and calls due today or earlier.</p><button type="button" onclick="go('tasks')">Open the queue</button></article>
        <article class="hs-agent"><div class="num">${hot.length}</div><b>Lead rating</b><p>Leads you marked hot. This is your rating, not a guessed score.</p><button type="button" class="ghost" onclick="go('leads')">Open leads</button></article>
        <article class="hs-agent"><div class="num">${money(worth)}</div><b>Pipeline</b><p>${open.length} open deals, in naira.</p><button type="button" class="ghost" onclick="go('deals')">Open deals</button></article>
      </div>
      <div class="card"><h2>Ask this workspace</h2><label>Question<textarea id="ask" style="height:80px" placeholder="Which deals are still open?"></textarea></label><button type="button" onclick="askAgent()">Ask</button><p id="answer" class="hello"></p></div>`;
  };

  const rawMarketing = drawMarketing;
  drawMarketing = async function () {
    if (mktTab !== 'studio') return rawMarketing();
    const rows = await api('/crm/api/campaigns');
    const list = Array.isArray(rows) ? rows : [];
    const forms = (bag.objects || []).filter((row) => row.kind === 'form');
    document.getElementById('view').innerHTML = `
      <div class="hs-split">
        <div>
          <p class="hs-kicker">Marketing Studio</p>
          <h1 class="hs-lead">Campaigns, forms, and the spend you record. Nothing here is a sample.</h1>
          <div class="hs-point"><span>→</span><div><b>Send one email.</b> It goes to contacts who have an address, through Gmail, Outlook, or the mail key. If none of those is connected, it does not pretend to send.</div></div>
          <div class="hs-point"><span>→</span><div><b>A form becomes a lead.</b> The public page is the one you save. A visitor’s answers land in Leads.</div></div>
          <p><button type="button" onclick="mktTab='emails';drawMarketing()">Write an email</button> <button type="button" class="ghost" onclick="mktTab='forms';drawMarketing()">Make a form</button> <button type="button" class="ghost" onclick="mktTab='ads';drawMarketing()">Record ad spend</button></p>
        </div>
        <div class="hs-stack">
          <article class="hs-mini"><b>Campaigns</b><div class="meta">${list.length} saved · ${list.reduce((sum, row) => sum + Number(row.sent || 0), 0)} sent</div></article>
          <article class="hs-mini"><b>Forms</b><div class="meta">${forms.length} public form${forms.length === 1 ? '' : 's'}</div></article>
          <article class="hs-mini"><b>Latest</b><div class="meta">${list[0] ? esc(list[0].name) + ' · ' + esc(list[0].status || '') : 'No campaign yet'}</div></article>
        </div>
      </div>`;
  };

  const route = draw;
  draw = function () {
    if (page === 'sales') return drawSales();
    return route();
  };
  const openGo = go;
  go = function (id, form) {
    if (id === 'marketing') mktTab = 'studio';
    return openGo(id, form);
  };
  Object.defineProperty(window, 'salesTab', {
    get() { return salesTab; },
    set(value) { salesTab = value; },
  });
})();

(function () {
  const shell = document.createElement('style');
  shell.textContent = `
    .app, .app.rail { display: block !important; height: 100vh !important; overflow: hidden !important; background: #f5f8fa !important; }
    #nav {
      position: fixed !important; top: 0 !important; left: 0 !important; bottom: 0 !important;
      width: 56px !important; min-width: 56px !important; max-width: 56px !important;
      background: #0d1117 !important; border-right: 1px solid rgba(255,255,255,0.06) !important;
      z-index: 50 !important; display: flex !important; flex-direction: column !important;
      align-items: center !important; padding: 14px 0 8px !important; overflow: hidden !important;
    }
    #nav .brand { padding: 0 !important; margin: 0 0 10px !important; justify-content: center !important; width: 56px !important; }
    #nav .brand div, #nav .navlabel, #nav .nav-section-header, #nav .fold, #nav .chev, #nav #setupCard,
    #nav button span:not(.ico) { display: none !important; }
    #nav .logo {
      width: 28px !important; height: 28px !important; border-radius: 8px !important;
      background: #0d9488 !important; color: #fff !important; font-size: 13px !important; font-weight: 800 !important;
      display: grid !important; place-items: center !important;
    }
    #nav .navscroll {
      flex: 1 !important; width: 56px !important; overflow: auto !important; align-items: center !important;
      gap: 0 !important; padding: 0 !important; scrollbar-width: none !important;
    }
    #nav .navscroll::-webkit-scrollbar { display: none; }
    #nav .navscroll button, #nav #moreBtn {
      width: 44px !important; height: 44px !important; min-height: 44px !important; padding: 0 !important;
      margin: 0 auto !important; display: flex !important; align-items: center !important; justify-content: center !important;
      background: transparent !important; box-shadow: none !important; border: 0 !important; border-radius: 8px !important;
      position: relative !important; color: #64748b !important;
    }
    #nav .ico, #nav [data-page] .ico, #nav #moreBtn .ico {
      width: 36px !important; height: 36px !important; border-radius: 8px !important;
      background: transparent !important; color: #64748b !important;
      display: grid !important; place-items: center !important;
    }
    #nav .ico svg { width: 20px !important; height: 20px !important; }
    #nav [data-page]:hover .ico, #nav #moreBtn:hover .ico { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
    #nav [data-page].on .ico, #nav #moreBtn.on .ico { background: #0d9488 !important; color: #fff !important; }
    #nav [data-tooltip]:hover::after {
      content: attr(data-tooltip);
      position: absolute; left: 50px; top: 50%; transform: translateY(-50%);
      background: #1a2332; color: #fff; font-size: 12px; font-weight: 600;
      padding: 6px 8px; border-radius: 6px; white-space: nowrap; z-index: 80;
      pointer-events: none; opacity: 0; animation: shelltip .01s linear .3s forwards;
      box-shadow: 0 8px 24px rgba(0,0,0,.4);
    }
    @keyframes shelltip { to { opacity: 1; } }
    #nav .navfoot { width: 56px !important; padding: 6px 0 4px !important; display: flex !important; flex-direction: column !important; align-items: center !important; border-top: 1px solid rgba(255,255,255,0.06); }
    #nav .rail-me {
      width: 32px; height: 32px; border-radius: 999px; border: 0; background: #0d9488; color: #fff;
      font-weight: 700; font-size: 12px; cursor: pointer;
    }
    #railMe {
      position: fixed; left: 64px; bottom: 12px; width: 200px; background: #1a2332;
      border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 6px;
      box-shadow: 0 20px 60px rgba(0,0,0,.6); z-index: 70; display: none;
    }
    #railMe button { width: 100%; text-align: left; background: transparent; color: #e7edf5; border-radius: 8px; }
    #railMe button:hover { background: rgba(255,255,255,0.06); }
    .app > header {
      position: fixed !important; top: 0 !important; left: 56px !important; right: 0 !important; height: 56px !important;
      background: rgba(13,17,23,0.85) !important; backdrop-filter: blur(12px) !important;
      border-bottom: 1px solid rgba(255,255,255,0.07) !important; z-index: 40 !important;
      display: flex !important; align-items: center !important; gap: 8px !important; padding: 0 12px !important;
    }
    .mobile-pill {
      flex: none; display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 14px;
      border-radius: 999px; background: rgba(13,148,136,0.15); border: 1px solid rgba(13,148,136,0.35);
      color: #0d9488; font-size: 13px; font-weight: 600; cursor: pointer;
    }
    .app > header .search { margin: 0 auto !important; width: min(480px, 46vw) !important; flex: none !important; position: relative !important; }
    .app > header .search input {
      width: 100% !important; height: 36px !important; background: rgba(255,255,255,0.05) !important;
      border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 8px !important; color: #fff !important;
      padding: 0 52px 0 34px !important;
    }
    .app > header .search input::placeholder { color: #64748b !important; }
    .app > header .search input:focus { border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,0.25) !important; outline: none !important; }
    .app > header .search::before {
      content: ""; position: absolute; left: 12px; top: 10px; width: 14px; height: 14px;
      border: 1.6px solid #64748b; border-radius: 999px; pointer-events: none;
    }
    .app > header .search::after {
      content: ""; position: absolute; left: 23px; top: 21px; width: 6px; height: 1.6px; background: #64748b;
      transform: rotate(45deg); pointer-events: none;
    }
    .app > header .shortcut { background: rgba(255,255,255,0.08) !important; color: #94a3b8 !important; border-radius: 4px !important; font-size: 11px !important; }
    .app > header .tools { display: flex !important; align-items: center !important; gap: 4px !important; }
    .app > header .iconbtn { width: 36px !important; height: 36px !important; color: #cbd5e1 !important; background: transparent !important; border-radius: 8px !important; }
    .app > header .iconbtn:hover { background: rgba(255,255,255,0.06) !important; }
    .app > header .iconbtn[title="Ask the records"]:hover { background: rgba(168,85,247,0.12) !important; color: #d8b4fe !important; }
    .status-dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; background: #22c55e; }
    .status-dot.busy { background: #ef4444; }
    .status-dot.away { background: #f59e0b; }
    #statusMenu, #shellHits {
      position: absolute; top: 46px; right: 0; background: #1a2332; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 6px; z-index: 70; min-width: 160px; box-shadow: 0 16px 40px rgba(0,0,0,.45);
    }
    #shellHits { left: 0; right: auto; width: 100%; max-height: 360px; overflow: auto; }
    #shellHits b.grp { display: block; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: #64748b; padding: 8px 10px 2px; }
    #shellHits button, #statusMenu button { width: 100%; text-align: left; background: transparent; color: #e7edf5; border-radius: 8px; }
    #shellHits button:hover, #statusMenu button:hover { background: rgba(255,255,255,0.06); }
    #shellHits .sub { color: #94a3b8; font-size: 12px; }
    .work { margin: 56px 0 0 56px !important; height: calc(100vh - 56px) !important; overflow: auto !important; background: #f5f8fa !important; display: block !important; }
    #bellList.shell-drawer {
      position: fixed !important; top: 56px !important; right: 0 !important; bottom: 0 !important; left: auto !important;
      width: 380px !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important;
      background: #1a2332 !important; color: #e7edf5 !important; border-left: 1px solid rgba(255,255,255,0.08) !important;
      box-shadow: 0 20px 60px rgba(0,0,0,.6) !important; z-index: 65 !important; overflow: auto !important; padding: 0 !important;
    }
    .nd-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px 8px; }
    .nd-head b { font-size: 18px; color: #fff; }
    .nd-head button { background: transparent !important; color: #0d9488 !important; padding: 0 !important; }
    .nd-tabs { display: flex; gap: 6px; padding: 0 16px 10px; flex-wrap: wrap; }
    .nd-tabs button { background: transparent !important; color: #94a3b8 !important; border-radius: 999px !important; padding: 4px 10px !important; }
    .nd-tabs button.on { background: rgba(13,148,136,0.18) !important; color: #5eead4 !important; }
    .shell-drawer .note { display: grid !important; grid-template-columns: 28px 1fr auto; gap: 10px; width: 100% !important; text-align: left !important;
      background: transparent !important; color: #e7edf5 !important; border-radius: 0 !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; padding: 14px 20px !important; }
    .shell-drawer .note:hover { background: rgba(255,255,255,0.04) !important; }
    .shell-drawer .note.unread { box-shadow: inset 2px 0 0 #0d9488; background: rgba(255,255,255,0.03) !important; }
    .shell-drawer .note b { color: #fff !important; font-size: 14px; }
    .shell-drawer .note .meta { color: #94a3b8 !important; font-size: 13px; }
    .shell-drawer .when { color: #64748b; font-size: 12px; white-space: nowrap; }
    .ndot { width: 16px; height: 16px; border-radius: 999px; margin-top: 2px; }
    .ndot.contact { background: #0d9488; } .ndot.deal { background: #f59e0b; } .ndot.task { background: #ef4444; } .ndot.system { background: #3b82f6; }
    #phoneBox { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 80; display: none; place-items: center; }
    #phoneBox.on { display: grid; }
    #phoneBox .card { width: min(420px, calc(100% - 32px)); background: #1a2332; color: #e7edf5; border-radius: 16px; padding: 20px; }
    #phoneBox h2 { margin: 0 0 8px; color: #fff; }
    #phoneBox code { display: block; background: #0d1117; padding: 10px 12px; border-radius: 8px; margin: 12px 0; word-break: break-all; }
  `;
  document.head.appendChild(shell);

  const icon = (d) => svg(d);
  const priorNav = paintNav;
  paintNav = function () {
    priorNav();
    const mark = (document.getElementById('whoMark') || {}).textContent || 'A';
    document.getElementById('nav').innerHTML = `<div class="brand"><span class="logo">A</span></div>
      <div class="navscroll">
        ${navItem('home', 'Home', icon('<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>'))}
        ${navItem('contacts', 'Contacts', icon('<path d="M4 7h16M4 12h16M4 17h10"/>'))}
        ${navItem('companies', 'Companies', icon('<path d="M4 21V5h9v16M13 9h7v12"/><path d="M7 9h2M7 13h2M16 13h2"/>'))}
        ${navItem('deals', 'Deals', icon('<path d="M3 8h18v10H3z"/><path d="M3 12h18M8 8V6h8v2"/>'))}
        ${navItem('leads', 'Leads', icon('<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>'))}
        ${navItem('teams', 'Teams', icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'))}
        ${navItem('tasks', 'Tasks', icon('<path d="M9 11l2 2 4-4"/><rect x="4" y="4" width="16" height="16" rx="2"/>'))}
        ${navItem('calendar', 'Calendar', icon('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>'))}
        ${navItem('dashboard', 'Reports', icon('<path d="M4 19V5M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>'))}
        ${navItem('sequences', 'Sequences', icon('<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>'))}
        ${navItem('sales', 'Sales workspace', icon('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>'))}
        ${navItem('agent', 'Agent hub', icon('<path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/>'))}
        <button type="button" id="moreBtn" data-tooltip="More" title="More" onclick="toggleLauncher()"><span class="ico">${icon('<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>')}</span></button>
      </div>
      <div class="navfoot"><button type="button" class="rail-me" id="railMeBtn" title="Account">${esc(mark)}</button><div id="setupCard" hidden></div></div>`;
    document.querySelectorAll('#nav button').forEach((el) => el.classList.toggle('on', el.dataset.page === page));
    const meBtn = document.getElementById('railMeBtn');
    if (meBtn) meBtn.onclick = toggleRailMe;
  };

  function toggleRailMe() {
    const box = document.getElementById('railMe');
    box.style.display = box.style.display === 'block' ? 'none' : 'block';
  }
  window.toggleRailMe = toggleRailMe;
  const rail = document.createElement('div');
  rail.id = 'railMe';
  rail.innerHTML = '<button type="button" onclick="go(\'users\');toggleRailMe()">My profile</button><button type="button" onclick="go(\'settings\');toggleRailMe()">Settings</button><button type="button" onclick="logout()">Sign out</button>';
  document.body.appendChild(rail);

  const header = document.querySelector('.app > header');
  if (header && !document.getElementById('mobilePill')) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.id = 'mobilePill';
    pill.className = 'mobile-pill';
    pill.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg> Mobile app';
    pill.onclick = () => document.getElementById('phoneBox').classList.add('on');
    header.insertBefore(pill, header.firstChild);
    const tools = header.querySelector('.tools');
    const status = document.createElement('button');
    status.type = 'button';
    status.className = 'iconbtn';
    status.id = 'statusBtn';
    status.title = 'Status';
    status.innerHTML = '<span class="status-dot" id="statusDot"></span>';
    status.onclick = (event) => {
      event.stopPropagation();
      const menu = document.getElementById('statusMenu');
      menu.hidden = !menu.hidden;
    };
    if (tools) tools.appendChild(status);
    const menu = document.createElement('div');
    menu.id = 'statusMenu';
    menu.hidden = true;
    menu.innerHTML = '<button type="button" onclick="setPresence(\'available\')">Available</button><button type="button" onclick="setPresence(\'busy\')">Busy</button><button type="button" onclick="setPresence(\'away\')">Away</button>';
    header.appendChild(menu);
    const hits = document.createElement('div');
    hits.id = 'shellHits';
    hits.hidden = true;
    header.querySelector('.search').appendChild(hits);
  }
  const phone = document.createElement('div');
  phone.id = 'phoneBox';
  phone.innerHTML = '<div class="card"><h2>Open Afri CRM on your phone</h2><p class="hello">This is the same workspace. In the phone browser, use Add to Home Screen. There is no separate store app.</p><code id="phoneUrl"></code><button type="button" onclick="navigator.clipboard.writeText(document.getElementById(\'phoneUrl\').textContent).then(()=>toast(\'Copied\'))">Copy the address</button> <button type="button" class="ghost" onclick="document.getElementById(\'phoneBox\').classList.remove(\'on\')">Close</button></div>';
  phone.addEventListener('click', (event) => { if (event.target.id === 'phoneBox') phone.classList.remove('on'); });
  document.body.appendChild(phone);
  const urlEl = () => { const el = document.getElementById('phoneUrl'); if (el) el.textContent = location.origin + '/crm'; };
  urlEl();

  window.setPresence = function (value) {
    localStorage.setItem('crm-status', value);
    const dot = document.getElementById('statusDot');
    if (dot) dot.className = 'status-dot' + (value === 'available' ? '' : ' ' + value);
    const menu = document.getElementById('statusMenu');
    if (menu) menu.hidden = true;
  };
  setPresence(localStorage.getItem('crm-status') || 'available');

  const q = document.getElementById('q');
  if (q) q.addEventListener('input', () => {
    const box = document.getElementById('shellHits');
    if (!box) return;
    const query = q.value.trim().toLowerCase();
    if (!query) { box.hidden = true; box.innerHTML = ''; return; }
    const block = (title, rows) => rows.length ? `<b class="grp">${title}</b>${rows.join('')}` : '';
    const contacts = (bag.contacts || []).filter((row) => (person(row) + ' ' + (row.email || '')).toLowerCase().includes(query)).slice(0, 4)
      .map((row) => `<button type="button" onclick="document.getElementById('shellHits').hidden=true;openRecord('contact','${row.id}')"><b>${esc(person(row))}</b><div class="sub">${esc(row.email || 'Contact')}</div></button>`);
    const companies = (bag.companies || []).filter((row) => (row.name || '').toLowerCase().includes(query)).slice(0, 4)
      .map((row) => `<button type="button" onclick="document.getElementById('shellHits').hidden=true;openRecord('company','${row.id}')"><b>${esc(row.name)}</b><div class="sub">Company</div></button>`);
    const deals = (bag.deals || []).filter((row) => (row.name || '').toLowerCase().includes(query)).slice(0, 4)
      .map((row) => `<button type="button" onclick="document.getElementById('shellHits').hidden=true;openRecord('deal','${row.id}')"><b>${esc(row.name)}</b><div class="sub">${money(row.amount)}</div></button>`);
    const tasks = (bag.activities || []).filter((row) => (row.type === 'TASK' || row.type === 'CALL') && (row.subject || '').toLowerCase().includes(query)).slice(0, 4)
      .map((row) => `<button type="button" onclick="document.getElementById('shellHits').hidden=true;go('tasks')"><b>${esc(row.subject)}</b><div class="sub">${esc(row.type)}</div></button>`);
    const html = block('Contacts', contacts) + block('Companies', companies) + block('Deals', deals) + block('Tasks', tasks);
    box.innerHTML = html || '<div class="sub" style="padding:10px">No record matches.</div>';
    box.hidden = false;
  });

  document.getElementById('bellList').classList.add('shell-drawer');
  let noteFilter = 'all';
  function ago(value) {
    const t = new Date(value || '').getTime();
    if (!t) return '';
    const min = Math.round((Date.now() - t) / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return min + 'm ago';
    const hr = Math.round(min / 60);
    if (hr < 24) return hr + 'h ago';
    return Math.round(hr / 24) + 'd ago';
  }
  loadBell = async function () {
    const data = await api('/crm/api/notifications');
    if (!data || data.error) return;
    setBell(data.unread || 0);
    const items = (data.items || []).filter((row) => {
      const type = row.recordType || '';
      if (noteFilter === 'tasks') return type === 'task';
      if (noteFilter === 'deals') return type === 'deal';
      if (noteFilter === 'mentions') return /mention|@/i.test((row.title || '') + ' ' + (row.body || ''));
      if (noteFilter === 'system') return !['task', 'deal', 'contact', 'lead'].includes(type);
      return true;
    });
    const tab = (id, label) => `<button type="button" class="${noteFilter === id ? 'on' : ''}" onclick="noteFilter='${id}';loadBell()">${label}</button>`;
    const tone = (row) => row.recordType === 'deal' ? 'deal' : row.recordType === 'contact' || row.recordType === 'lead' ? 'contact' : row.recordType === 'task' ? 'task' : 'system';
    document.getElementById('bellList').innerHTML = `<div class="nd-head"><b>Notifications</b><button type="button" onclick="readNotes()">Mark all read</button></div><div class="nd-tabs">${tab('all','All')}${tab('mentions','Mentions')}${tab('tasks','Tasks')}${tab('deals','Deals')}${tab('system','System')}</div>` +
      (items.map((row) => `<button type="button" class="note ${row.readAt ? '' : 'unread'}" onclick="openNote('${row.id}','${esc(row.recordType || '')}','${esc(row.recordId || '')}')"><span class="ndot ${tone(row)}"></span><span><b>${esc(row.title)}</b><div class="meta">${esc(row.body || '')}</div></span><span class="when">${ago(row.createdAt)}</span></button>`).join('') || '<div class="alertempty"><b>Nothing in this filter</b></div>');
  };
  Object.defineProperty(window, 'noteFilter', { get() { return noteFilter; }, set(v) { noteFilter = v; } });
  readNotes = async function () {
    const data = await api('/crm/api/notifications/read', { method: 'POST', body: JSON.stringify({ all: true }) });
    if (data && data.unread != null) setBell(data.unread);
    loadBell();
  };
})();

(function () {
  const css = document.createElement('style');
  css.textContent = `
    #view:has(.dash) { background: #0d1117 !important; border: 0 !important; padding: 0 0 24px !important; color: #fff !important; }
    .dash { color: #fff; }
    .dash-hero {
      position: relative; min-height: 220px; padding: 32px 32px 96px; overflow: hidden;
      background:
        radial-gradient(1.2px 1.2px at 8% 22%, #fff, transparent 60%),
        radial-gradient(1px 1px at 18% 70%, #fff, transparent 60%),
        radial-gradient(1.4px 1.4px at 28% 30%, #fff, transparent 60%),
        radial-gradient(1px 1px at 42% 78%, #fff, transparent 60%),
        radial-gradient(1.2px 1.2px at 55% 18%, #fff, transparent 60%),
        radial-gradient(1px 1px at 66% 62%, #fff, transparent 60%),
        radial-gradient(1.5px 1.5px at 78% 28%, #fff, transparent 60%),
        radial-gradient(1px 1px at 88% 74%, #fff, transparent 60%),
        radial-gradient(1.2px 1.2px at 94% 40%, #fff, transparent 60%),
        radial-gradient(ellipse at 25% 40%, rgba(88, 28, 135, 0.55), transparent 55%),
        radial-gradient(ellipse at 72% 55%, rgba(13, 148, 136, 0.28), transparent 50%),
        linear-gradient(180deg, rgba(13,17,23,0.35), rgba(13,17,23,0.82)),
        #070b16;
    }
    .dash-top { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .dash-today { margin: 0; font-family: "Space Grotesk", Inter, sans-serif !important; font-size: 40px !important; font-weight: 700 !important; color: #fff !important; letter-spacing: -0.03em; }
    .dash-sub { margin: 6px 0 0; font-size: 15px !important; color: rgba(255,255,255,0.75) !important; }
    .dash-links { display: flex; gap: 18px; padding-top: 8px; }
    #view .dash button.dash-link { background: transparent !important; color: #fff !important; border: 0 !important; border-radius: 0 !important; padding: 0 !important; font-size: 14px !important; font-weight: 500 !important; box-shadow: none !important; }
    #view .dash button.dash-link:hover { color: #5eead4 !important; }
    .dash-kpis { display: grid; grid-template-columns: 1fr 1.45fr 1fr 1fr; gap: 12px; margin: -72px 28px 0; position: relative; z-index: 2; }
    .dash-kpi { background: rgba(15,25,42,0.85); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px 24px; min-width: 0; }
    .dash-num { font-family: "Space Grotesk", Inter, sans-serif; font-size: 48px; font-weight: 700; color: #fff !important; line-height: 1; letter-spacing: -0.03em; }
    .dash-num.wide { font-size: 32px; }
    .dash-num.gold { color: #f59e0b !important; }
    .dash-label { margin-top: 8px; font-size: 11px; letter-spacing: 0.1em; color: #64748b !important; }
    .dash-grid { display: grid; grid-template-columns: 1.15fr 1.15fr 0.95fr; gap: 16px; padding: 24px 28px 0; align-items: start; }
    .dash-panel { background: #1a2332; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 20px; overflow: hidden; }
    .dash-ph { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .dash-ph span { font-size: 11px; letter-spacing: 0.1em; color: #94a3b8 !important; text-transform: uppercase; }
    .dash-switch { width: 36px; height: 20px; border-radius: 999px; border: 0; background: #334155; position: relative; cursor: pointer; padding: 0; }
    .dash-switch.on { background: #0d9488; }
    .dash-switch i { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 999px; background: #fff; transition: left .15s ease; }
    .dash-switch.on i { left: 18px; }
    #view .dash button.dash-switch { background: #334155 !important; border-radius: 999px !important; width: 36px !important; height: 20px !important; min-height: 20px !important; padding: 0 !important; }
    #view .dash button.dash-switch.on { background: #0d9488 !important; }
    .dash-row { display: flex; justify-content: space-between; gap: 12px; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; background: transparent; width: 100%; text-align: left; border-left: 0; border-right: 0; border-top: 0; }
    #view .dash button.dash-row { background: transparent !important; color: #fff !important; border-radius: 0 !important; }
    .dash-row:hover { background: rgba(255,255,255,0.03) !important; }
    .dash-name { font-size: 15px; font-weight: 600; color: #fff !important; }
    .dash-meta, .dash-time { font-size: 13px; color: #64748b !important; }
    .dash-right { text-align: right; }
    .dash-time { display: flex; align-items: center; gap: 8px; }
    .dash-tl { background: #1a2332; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0 0 12px; }
    .dash-tl h2 { margin: 0; padding: 20px; font-family: "Space Grotesk", Inter, sans-serif; font-size: 18px !important; font-weight: 700 !important; color: #fff !important; }
    .dash-card { margin: 0 12px 10px; padding: 16px; border-radius: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: #94a3b8 !important; font-size: 14px; cursor: pointer; text-align: left; width: calc(100% - 24px); }
    #view .dash button.dash-card { background: rgba(255,255,255,0.05) !important; color: #94a3b8 !important; border-radius: 8px !important; }
    .dash-card:hover { border-color: #0d9488 !important; background: rgba(13,148,136,0.08) !important; }
    .dash-empty { padding: 16px 20px; color: #64748b !important; font-size: 13px; }
    @media (max-width: 1100px) { .dash-kpis, .dash-grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 720px) { .dash-top, .dash-kpis, .dash-grid { display: block; } .dash-kpi, .dash-panel { margin-bottom: 12px; } }
  `;
  document.head.appendChild(css);

  function rel(value) {
    const then = new Date(value || '');
    if (Number.isNaN(then.getTime())) return '';
    const days = Math.round((Date.now() - then.getTime()) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    return days + ' days ago';
  }
  function dueWord(row) {
    const day = String(row.dueAt || '').slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    if (!day) return 'No date';
    if (day < today) return 'Overdue';
    if (day === today) return 'Due today';
    const diff = Math.round((new Date(day + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
    if (diff === 1) return 'Due tomorrow';
    return 'Due in ' + diff + ' days';
  }
  function chip(row) {
    if (row.priority === 'HIGH') return 'Urgent';
    if (row.type === 'MEETING') return 'Meeting';
    if (row.type === 'CALL') return 'Call';
    if (row.type === 'EMAIL') return 'Email';
    return 'Task';
  }
  function panels() {
    try { return Object.assign({ contacts: 1, accounts: 1, deals: 1, tasks: 1 }, JSON.parse(localStorage.getItem('crm-home-panels') || '{}')); }
    catch (e) { return { contacts: 1, accounts: 1, deals: 1, tasks: 1 }; }
  }
  window.toggleHomePanel = function (key) {
    const state = panels();
    state[key] = state[key] ? 0 : 1;
    localStorage.setItem('crm-home-panels', JSON.stringify(state));
    drawHome();
  };
  window.homeDemo = function () {
    toast('This home shows the records in the workspace. Sample names are not added.');
  };

  drawHome = async function () {
    if (!homePack) {
      const [brain, day, guide] = await Promise.all([api('/crm/api/brain'), api('/crm/api/day'), api('/crm/api/guide')]);
      homePack = { brain: brain || {}, day: day || {}, guide: guide || null };
    }
    const today = new Date().toISOString().slice(0, 10);
    const dayOf = (row) => String(row.dueAt || '').slice(0, 10);
    const openDeals = (bag.deals || []).filter((row) => !String(stageOf(row)).startsWith('CLOSED'));
    const pipeline = openDeals.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const due = (bag.activities || []).filter((row) => (row.type === 'TASK' || row.type === 'CALL' || row.type === 'MEETING') && row.status === 'PLANNED' && dayOf(row) === today);
    const hot = (bag.leads || []).filter((row) => row.rating === 'HOT');
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const when = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const n = (count, one, many) => count + ' ' + (count === 1 ? one : many);
    const show = panels();
    const sw = (key) => `<button type="button" class="dash-switch ${show[key] ? 'on' : ''}" onclick="toggleHomePanel('${key}')" aria-label="Show or hide"><i></i></button>`;
    const empty = '<div class="dash-empty">None yet.</div>';
    const contacts = (bag.contacts || []).slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 4);
    const accounts = (bag.companies || []).slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 4);
    const deals = openDeals.slice().sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''))).slice(0, 4);
    const tasks = (bag.activities || []).filter((row) => row.type === 'TASK' || row.type === 'CALL' || row.type === 'MEETING' || row.type === 'EMAIL')
      .slice().sort((a, b) => String(a.dueAt || a.createdAt || '').localeCompare(String(b.dueAt || b.createdAt || ''))).slice(0, 4);
    const story = (bag.activities || []).slice().sort((a, b) => String(b.createdAt || b.dueAt || '').localeCompare(String(a.createdAt || a.dueAt || ''))).slice(0, 6);
    const row = (click, name, meta, right) => `<button type="button" class="dash-row" onclick="${click}"><span><b class="dash-name">${esc(name)}</b><div class="dash-meta">${esc(meta || '')}</div></span><span class="dash-right dash-time">${right}</span></button>`;
    const contactRows = contacts.map((rowx) => row(`openRecord('contact','${rowx.id}')`, person(rowx), rowx.email || rowx.phone || '', esc(rel(rowx.createdAt)))).join('') || empty;
    const accountRows = accounts.map((rowx) => row(`openRecord('company','${rowx.id}')`, rowx.name, rowx.industry || rowx.city || '', esc(rel(rowx.createdAt)))).join('') || empty;
    const dealRows = deals.map((rowx) => row(`openRecord('deal','${rowx.id}')`, rowx.name, money(rowx.amount), esc(rel(rowx.createdAt)))).join('') || empty;
    const taskRows = tasks.map((rowx) => row(`go('tasks')`, rowx.subject || 'Task', dueWord(rowx), esc(chip(rowx)))).join('') || empty;
    const cards = story.map((rowx) => {
      const kind = rowx.relatedType && rowx.relatedId && ['contact', 'company', 'deal', 'lead'].includes(rowx.relatedType)
        ? `openRecord('${rowx.relatedType}','${rowx.relatedId}')` : `go('tasks')`;
      return `<button type="button" class="dash-card" onclick="${kind}">${esc(rowx.subject || rowx.type || 'Activity')}</button>`;
    }).join('') || '<div class="dash-empty">No activity yet.</div>';
    const panel = (key, label, body) => `<section class="dash-panel"><header class="dash-ph"><span>${label}</span>${sw(key)}</header>${show[key] ? body : ''}</section>`;
    document.getElementById('view').innerHTML = `<div class="dash">
      <section class="dash-hero">
        <div class="dash-top">
          <div><h1 class="dash-today">Today</h1><p class="dash-sub">${hello} · ${esc(when)} · ${n(openDeals.length, 'open deal', 'open deals')} · ${n(due.length, 'task due', 'tasks due')}</p></div>
          <div class="dash-links"><button type="button" class="dash-link" onclick="go('guide')">↗ Start guide</button><button type="button" class="dash-link" onclick="homeDemo()">◈ Demo data</button><button type="button" class="dash-link" onclick="homePack=null;drawHome()">↻ Refresh</button></div>
        </div>
      </section>
      <div class="dash-kpis">
        <article class="dash-kpi"><div class="dash-num">${openDeals.length}</div><div class="dash-label">OPEN DEALS</div></article>
        <article class="dash-kpi"><div class="dash-num wide">${money(pipeline)}</div><div class="dash-label">PIPELINE</div></article>
        <article class="dash-kpi"><div class="dash-num">${due.length}</div><div class="dash-label">TASKS DUE</div></article>
        <article class="dash-kpi"><div class="dash-num gold">${hot.length}</div><div class="dash-label">HOT LEADS</div></article>
      </div>
      <div class="dash-grid">
        <div>${panel('contacts', 'Latest contacts', contactRows)}${panel('deals', 'Latest deals', dealRows)}</div>
        <div>${panel('accounts', 'Latest accounts', accountRows)}${panel('tasks', 'Latest tasks', taskRows)}</div>
        <aside class="dash-tl"><h2>Activity timeline</h2>${cards}</aside>
      </div>
    </div>`;
  };
})();

(function () {
  const css = document.createElement('style');
  css.textContent = `
    #view .cx h1, #view .cr h1 { font-family: "Space Grotesk", Inter, sans-serif !important; color: #0f172a !important; }
    .cx-head, .cr-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 14px; }
    #view .cx h1 { font-size: 24px !important; margin: 0 !important; }
    .cx-bar, .cx-views { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 10px; }
    .cx-left, .cx-right, .cx-views { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .cx-search { width: 280px; max-width: 100%; height: 36px; border: 1px solid #e5e8eb; border-radius: 8px; padding: 0 12px; }
    #view .cx button.cx-tool, #view .cr button.cx-tool { background: #fff !important; color: #33475b !important; border: 1px solid #e5e8eb !important; border-radius: 8px !important; }
    #view .cx button.cx-go { background: #0d9488 !important; color: #fff !important; border-radius: 8px !important; }
    .cx-badge { background: #0d9488; color: #fff; border-radius: 999px; font-size: 11px; padding: 0 6px; margin-left: 4px; }
    .cx-views button { background: transparent !important; color: #516f90 !important; border-radius: 0 !important; padding: 8px 2px !important; box-shadow: none !important; }
    .cx-views button.on { color: #0f172a !important; box-shadow: inset 0 -2px 0 #0d9488 !important; }
    .cx-table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e5e8eb; border-radius: 12px; overflow: hidden; }
    .cx-table th { text-align: left; font-size: 11px; letter-spacing: .08em; color: #64748b; padding: 10px 12px; border-bottom: 1px solid #e5e8eb; }
    .cx-table td { padding: 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    .cx-table tr.cx-row:hover { background: #f8fafc; }
    .cx-who { display: flex; gap: 10px; align-items: center; }
    .cx-av { width: 32px; height: 32px; border-radius: 999px; display: grid; place-items: center; color: #fff; font-size: 12px; font-weight: 700; flex: none; }
    .cx-av.lg { width: 60px; height: 60px; font-size: 20px; background: #0d9488 !important; }
    .cx-name { font-weight: 700; font-size: 14px; color: #0f172a; }
    .cx-mail, .cx-muted { font-size: 13px; color: #64748b; }
    .cx-link { color: #0d9488; background: none; border: 0; padding: 0; cursor: pointer; font-weight: 600; }
    .cx-score { display: inline-block; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
    .cx-score.hot { background: #fee2e2; color: #b91c1c; }
    .cx-score.mid { background: #fef3c7; color: #b45309; }
    .cx-score.low { background: #f1f5f9; color: #475569; }
    .cx-status { display: inline-block; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 650; }
    .cx-status.active { background: #ccfbf1; color: #0f766e; }
    .cx-status.won { background: #dcfce7; color: #15803d; }
    .cx-status.cold, .cx-status.lost { background: #f1f5f9; color: #64748b; }
    .cx-status.lost { text-decoration: line-through; }
    .cx-more { opacity: 0; }
    .cx-row:hover .cx-more { opacity: 1; }
    .cx-menu { position: relative; }
    .cx-pop { position: absolute; right: 0; top: 28px; background: #fff; border: 1px solid #e5e8eb; border-radius: 8px; box-shadow: 0 8px 24px rgba(15,23,42,.12); z-index: 5; min-width: 140px; }
    .cx-pop button { display: block; width: 100%; text-align: left; background: #fff !important; color: #0f172a !important; }
    .cx-board { display: flex; gap: 10px; overflow: auto; padding-bottom: 8px; }
    .cx-col { min-width: 220px; background: #f8fafc; border: 1px solid #e5e8eb; border-radius: 12px; padding: 8px; }
    .cx-col b { display: block; font-size: 12px; letter-spacing: .06em; color: #64748b; margin-bottom: 8px; }
    .cx-card { background: #fff; border: 1px solid #e5e8eb; border-radius: 10px; padding: 10px; margin-bottom: 8px; cursor: pointer; text-align: left; width: 100%; }
    #view .cx button.cx-card { background: #fff !important; color: #0f172a !important; }
    .cx-panel { background: #fff; border: 1px solid #e5e8eb; border-radius: 12px; padding: 12px; margin-top: 8px; }
    .cr { display: grid; grid-template-columns: 280px minmax(0,1fr) 320px; gap: 14px; align-items: start; }
    .cr-side, .cr-main { background: #fff; border: 1px solid #e5e8eb; border-radius: 12px; padding: 16px; }
    .cr-prop { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .cr-prop b { color: #0f172a; }
    #view .cr button.cx-tool { background: #fff !important; color: #33475b !important; border: 1px solid #e5e8eb !important; }
    .cr-feed { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .cr-feed button.on { box-shadow: inset 0 -2px 0 #0d9488 !important; }
    .cr-entry { border-left: 3px solid #cbd5e1; background: #f8fafc; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
    .cr-entry.note { border-color: #f59e0b; background: #fffbeb; }
    .cr-entry.email { border-color: #3b82f6; }
    .cr-entry.call, .cr-entry.whatsapp { border-color: #22c55e; }
    .cr-entry.meeting { border-color: #a855f7; }
    .cr-entry.deal { border-color: #0d9488; }
    .cr-entry.task { border-color: #94a3b8; }
    .cr-entry.task.done { border-color: #22c55e; }
    .cr-entry.file { border-color: #f97316; }
    .cr-assoc { border: 1px solid #e5e8eb; border-radius: 10px; padding: 10px; margin-bottom: 8px; }
    @media (max-width: 1100px) { .cr { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(css);

  let cxMode = 'list';
  let cxSaved = 'all';
  let cxSort = 'name';
  let cxQuery = '';
  let cxShowFilters = false;
  let cxShowSort = false;
  let cxShowCols = false;
  let cxMenu = '';
  const cxCols = { company: 1, value: 1, score: 1, activity: 1, owner: 1, status: 1 };
  let cxExtra = [];
  try { cxExtra = JSON.parse(localStorage.getItem('crm-contact-views') || '[]'); } catch (e) { cxExtra = []; }

  function contactScore(row) {
    const weights = { email: 15, phone: 10, touch: 18, referral: 10, stale: 20 };
    const touch = !!(bag.activities || []).some((item) => item.relatedId === row.id);
    const parts = [['On the record', 8]];
    let score = 8;
    if (row.email) { score += weights.email; parts.push(['Email on the record', weights.email]); }
    if (row.phone || row.mobile) { score += weights.phone; parts.push(['Phone on the record', weights.phone]); }
    if (touch) { score += weights.touch; parts.push(['An activity is logged', weights.touch]); }
    if (/refer|partner/i.test(row.source || '')) { score += weights.referral; parts.push(['Source looks like a referral', weights.referral]); }
    const age = Date.now() - new Date(row.createdAt || Date.now()).getTime();
    if (!touch && age > 14 * 86400000) { score -= weights.stale; parts.push(['No activity for 14 days', -weights.stale]); }
    return { score: Math.max(0, Math.min(100, score)), parts };
  }
  function dealWorth(id) {
    return (bag.deals || []).filter((row) => row.contactId === id && !String(stageOf(row)).startsWith('CLOSED_LOST'))
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);
  }
  function statusOf(row) {
    const deals = (bag.deals || []).filter((item) => item.contactId === row.id);
    if (row.status === 'CUSTOMER' || deals.some((item) => stageOf(item) === 'CLOSED_WON')) return ['Won', 'won'];
    if (deals.length && deals.every((item) => stageOf(item) === 'CLOSED_LOST')) return ['Lost', 'lost'];
    if (row.status === 'INACTIVE') return ['Cold', 'cold'];
    return ['Active', 'active'];
  }
  function scorePill(score) {
    const tone = score > 80 ? 'hot' : score >= 50 ? 'mid' : 'low';
    return `<span class="cx-score ${tone}">${score}</span>`;
  }
  window.contactScoreParts = contactScore;

  window.setCx = function (key, value) {
    if (key === 'mode') cxMode = value;
    if (key === 'saved') cxSaved = value;
    if (key === 'sort') { cxSort = value; cxShowSort = false; }
    if (key === 'filters') cxShowFilters = !cxShowFilters;
    if (key === 'sortbox') cxShowSort = !cxShowSort;
    if (key === 'cols') cxShowCols = !cxShowCols;
    if (key === 'col') cxCols[value] = cxCols[value] ? 0 : 1;
    if (key === 'menu') cxMenu = cxMenu === value ? '' : value;
    if (key === 'query') {
      cxQuery = value;
      const box = document.querySelector('#view .cx-search');
      window.__cxCaret = box ? box.selectionStart : String(value).length;
    }
    drawContacts();
    if (key === 'query') {
      const box = document.querySelector('#view .cx-search');
      if (box) { box.focus(); const n = Math.min(window.__cxCaret || 0, box.value.length); box.setSelectionRange(n, n); }
    }
  };
  window.addContactView = function () {
    const name = window.prompt('Name this view. It keeps contacts whose name or email contains the word.');
    if (!name) return;
    cxExtra.push(name.trim());
    localStorage.setItem('crm-contact-views', JSON.stringify(cxExtra));
    cxSaved = 'word:' + name.trim();
    drawContacts();
  };

  const priorContacts = drawContacts;
  drawContacts = function () {
    const showForm = openForm === 'contact';
    if (showForm) openForm = '';
    const mine = me.sub || me.id;
    let rows = (bag.contacts || []).slice();
    if (cxSaved === 'mine') rows = rows.filter((row) => row.ownerId === mine);
    if (cxSaved === 'hot') rows = rows.filter((row) => contactScore(row).score > 80);
    if (cxSaved === 'quiet') rows = rows.filter((row) => { const t = lastTouch(row.id); return !t || (Date.now() - new Date(t).getTime()) > 30 * 86400000; });
    if (cxSaved.indexOf('word:') === 0) {
      const word = cxSaved.slice(5).toLowerCase();
      rows = rows.filter((row) => (person(row) + ' ' + (row.email || '')).toLowerCase().includes(word));
    }
    const q = (cxQuery || '').trim();
    const hay = (row) => [person(row), row.email, row.phone, row.mobile, row.title, row.city, row.source, companyName(row.companyId), ownerName(row.ownerId)].join(' ');
    rows = rows.filter((row) => smartMatch((document.getElementById('q') || {}).value || '', hay(row)) && smartMatch(q, hay(row)));
    if (contactOwner) rows = rows.filter((row) => row.ownerId === contactOwner);
    if (contactStatus) rows = rows.filter((row) => (row.status || 'ACTIVE') === contactStatus);
    if (contactFrom) rows = rows.filter((row) => String(row.createdAt || '').slice(0, 10) >= contactFrom);
    rows.sort((a, b) => {
      if (q) return smartScore(q, hay(b)) - smartScore(q, hay(a));
      if (cxSort === 'new') return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      if (cxSort === 'touch') return String(lastTouch(b.id)).localeCompare(String(lastTouch(a.id)));
      if (cxSort === 'value') return dealWorth(b.id) - dealWorth(a.id);
      if (cxSort === 'score') return contactScore(b).score - contactScore(a).score;
      return person(a).localeCompare(person(b));
    });
    const filtersOn = [contactOwner, contactStatus, contactFrom].filter(Boolean).length;
    const views = [['all', 'All contacts'], ['mine', 'My contacts'], ['hot', 'Hot leads'], ['quiet', 'No activity 30d+']].concat(cxExtra.map((name) => ['word:' + name, name]));
    const owners = (bag.people || []).map((row) => `<option value="${row.id}" ${contactOwner === row.id ? 'selected' : ''}>${esc(row.fullName || row.email)}</option>`).join('');
    let body = '';
    if (cxMode === 'board') {
      const stages = (bag.stages && bag.stages.length ? bag.stages.map((row) => [row.code, row.name]) : STAGES.map((row) => [row[0], row[1]])).concat([['NONE', 'No deal']]);
      const col = (code) => rows.filter((row) => {
        const open = (bag.deals || []).filter((deal) => deal.contactId === row.id && !String(stageOf(deal)).startsWith('CLOSED'));
        const won = (bag.deals || []).some((deal) => deal.contactId === row.id && stageOf(deal) === 'CLOSED_WON');
        const lost = (bag.deals || []).some((deal) => deal.contactId === row.id && stageOf(deal) === 'CLOSED_LOST');
        if (code === 'CLOSED_WON') return won && !open.length;
        if (code === 'CLOSED_LOST') return lost && !open.length && !won;
        if (code === 'NONE') return !open.length && !won && !lost;
        return open.some((deal) => stageOf(deal) === code);
      });
      body = `<div class="cx-board">${stages.map(([code, name]) => `<div class="cx-col"><b>${esc(name)} · ${col(code).length}</b>${col(code).map((row) => `<button type="button" class="cx-card" onclick="openRecord('contact','${row.id}')"><b>${esc(person(row))}</b><div class="cx-muted">${esc(companyName(row.companyId) || 'No company')}</div><div>${scorePill(contactScore(row).score)} <span class="cx-muted">${esc(relativeTime(lastTouch(row.id)) || 'No activity')}</span></div><div class="cx-muted">${esc(ownerName(row.ownerId) || 'Unassigned')}</div></button>`).join('') || '<div class="cx-muted">None</div>'}</div>`).join('')}</div>`;
    } else if (cxMode === 'map') {
      const groups = {};
      rows.forEach((row) => { const key = row.city || row.country || 'No city'; (groups[key] = groups[key] || []).push(row); });
      body = `<p class="cx-muted">Grouped by city. There is no map pin until an address has coordinates.</p>` + Object.keys(groups).sort().map((city) => `<section class="cx-panel"><b>${esc(city)}</b>${groups[city].map((row) => `<div class="cr-prop"><button type="button" class="cx-link" onclick="openRecord('contact','${row.id}')">${esc(person(row))}</button><span class="cx-muted">${esc(row.email || '')}</span></div>`).join('')}</section>`).join('');
    } else if (cxMode === 'calendar') {
      const now = new Date();
      const y = now.getFullYear(); const m = now.getMonth();
      const days = new Date(y, m + 1, 0).getDate();
      const cells = [];
      for (let day = 1; day <= days; day++) {
        const key = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const born = rows.filter((row) => String(row.createdAt || '').slice(0, 10) === key);
        cells.push(`<div class="cx-card"><b>${day}</b>${born.map((row) => `<div><button type="button" class="cx-link" onclick="openRecord('contact','${row.id}')">${esc(person(row))}</button></div>`).join('') || '<div class="cx-muted">—</div>'}</div>`);
      }
      body = `<p class="cx-muted">Contacts created in ${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}.</p><div class="cx-board" style="flex-wrap:wrap">${cells.join('')}</div>`;
    } else {
      const th = (key, label) => cxCols[key] ? `<th>${label}</th>` : '';
      const td = (key, html) => cxCols[key] ? `<td>${html}</td>` : '';
      const lines = rows.map((row) => {
        const scored = contactScore(row);
        const [label, tone] = statusOf(row);
        const owner = ownerName(row.ownerId);
        return `<tr class="cx-row"><td><input type="checkbox" onclick="event.stopPropagation()"></td><td><div class="cx-who" style="cursor:pointer" onclick="openRecord('contact','${row.id}')"><span class="cx-av" style="background:${avatarGradient(person(row))}">${esc(initials(person(row)))}</span><span><b class="cx-name">${esc(person(row))}</b><div class="cx-mail">${esc(row.email || 'No email')}</div></span></div></td>${td('company', row.companyId ? `<button type="button" class="cx-link" onclick="openRecord('company','${row.companyId}')">${esc(companyName(row.companyId))}</button>` : '<span class="cx-muted">—</span>')}${td('value', money(dealWorth(row.id)))}${td('score', scorePill(scored.score))}${td('activity', esc(relativeTime(lastTouch(row.id)) || 'No activity'))}${td('owner', `<span class="cx-av" style="width:22px;height:22px;font-size:10px;background:${avatarGradient(owner || '?')}">${esc(initials(owner || '?'))}</span> ${esc(owner || 'Unassigned')}`)}${td('status', `<span class="cx-status ${tone}">${label}</span>`)}<td class="cx-menu"><button type="button" class="cx-tool cx-more" onclick="event.stopPropagation();setCx('menu','${row.id}')">⋮</button>${cxMenu === row.id ? `<div class="cx-pop"><button type="button" onclick="openRecord('contact','${row.id}')">Open</button><button type="button" onclick="go('tasks','task')">Create task</button></div>` : ''}</td></tr>`;
      }).join('');
      body = `<table class="cx-table"><tr><th></th><th>Contact</th>${th('company','Company')}${th('value','Deal value')}${th('score','Lead score')}${th('activity','Last activity')}${th('owner','Owner')}${th('status','Status')}<th></th></tr>${lines || '<tr><td colspan="9"><div class="cx-muted" style="padding:16px">No contact in this view.</div></td></tr>'}</table>`;
    }
    const form = `<div class="drawer dealbox" id="form" ${showForm ? '' : 'hidden'} onclick="if(event.target.id==='form')this.hidden=true"><aside><div class="sheethead"><h2>Create contact</h2><button type="button" class="ghost" onclick="document.getElementById('form').hidden=true">Close</button></div><div class="dealform"><label>First name<input id="cFirst"></label><label>Last name<input id="cLast"></label><label>Title<input id="cTitle"></label><label>Email<input id="cEmail"></label><label>Phone<input id="cPhone"></label><label>City<input id="cCity"></label><label>Company<select id="cCompany"><option value="">None</option>${(bag.companies||[]).map((row)=>`<option value="${row.id}">${esc(row.name)}</option>`).join('')}</select></label><label>Source<input id="cSource"></label><label>Status<select id="cStatus"><option>ACTIVE</option><option>CUSTOMER</option><option>INACTIVE</option></select></label><label>How they like to be reached<select id="cMethod"><option>Call</option><option>WhatsApp</option><option>Email</option></select></label><label>Owner<select id="cOwner"><option value="">Me</option>${ownerOptions()}</select></label></div><div class="dealactions"><button type="button" onclick="saveContact()">Create</button></div></aside></div>`;
    document.getElementById('view').innerHTML = `<div class="cx">
      <div class="cx-head"><h1>Contacts</h1><div><button type="button" class="cx-tool" onclick="go('import')">Import</button> <button type="button" class="cx-go" onclick="document.getElementById('form').hidden=false">+ Create contact</button></div></div>
      <div class="cx-bar"><div class="cx-left"><input class="cx-search" placeholder="Search contacts..." value="${esc(cxQuery)}" oninput="setCx('query', this.value)"><button type="button" class="cx-tool" onclick="setCx('filters')">Filters${filtersOn ? `<span class="cx-badge">${filtersOn}</span>` : ''}</button><button type="button" class="cx-tool" onclick="setCx('sortbox')">Sort</button></div><div class="cx-right"><button type="button" class="cx-tool ${cxMode==='list'?'on':''}" onclick="setCx('mode','list')">List</button><button type="button" class="cx-tool" onclick="setCx('mode','board')">Board</button><button type="button" class="cx-tool" onclick="setCx('mode','map')">Map</button><button type="button" class="cx-tool" onclick="setCx('mode','calendar')">Calendar</button><button type="button" class="cx-tool" onclick="setCx('cols')">Columns</button></div></div>
      ${cxShowFilters ? `<div class="cx-panel"><label>Owner<select onchange="contactOwner=this.value;drawContacts()"><option value="">Anyone</option>${owners}</select></label> <label>Status<select onchange="contactStatus=this.value;drawContacts()"><option value="">Any</option><option ${contactStatus==='ACTIVE'?'selected':''}>ACTIVE</option><option ${contactStatus==='CUSTOMER'?'selected':''}>CUSTOMER</option><option ${contactStatus==='INACTIVE'?'selected':''}>INACTIVE</option></select></label> <label>Created from<input type="date" value="${esc(contactFrom)}" onchange="contactFrom=this.value;drawContacts()"></label> <button type="button" class="cx-tool" onclick="contactOwner='';contactStatus='';contactFrom='';drawContacts()">Clear</button></div>` : ''}
      ${cxShowSort ? `<div class="cx-panel"><button type="button" class="cx-tool" onclick="setCx('sort','name')">Name</button><button type="button" class="cx-tool" onclick="setCx('sort','new')">Newest</button><button type="button" class="cx-tool" onclick="setCx('sort','touch')">Last activity</button><button type="button" class="cx-tool" onclick="setCx('sort','value')">Deal value</button><button type="button" class="cx-tool" onclick="setCx('sort','score')">Lead score</button></div>` : ''}
      ${cxShowCols ? `<div class="cx-panel">${['company','value','score','activity','owner','status'].map((key) => `<label style="margin-right:10px"><input type="checkbox" ${cxCols[key]?'checked':''} onchange="setCx('col','${key}')"> ${key}</label>`).join('')}</div>` : ''}
      <div class="cx-views">${views.map(([id, label]) => `<button type="button" class="cx-tab ${cxSaved===id?'on':''}" onclick="setCx('saved','${id.replace(/'/g, '')}')">${esc(label)}</button>`).join('')}<button type="button" class="cx-tab" onclick="addContactView()">+ Add view</button></div>
      ${body}<div class="cx-muted" style="margin-top:8px">${rows.length} contact${rows.length===1?'':'s'}</div>${form}</div>`;
  };

  let crFilter = 'all';
  window.setCrFilter = function (value) { crFilter = value; drawRecord(); };
  window.copyProp = function (text) { navigator.clipboard.writeText(text || '').then(() => toast('Copied')).catch(() => toast('Could not copy')); };
  window.logOnContact = async function (type) {
    if (!focus) return;
    if (type === 'whatsapp') {
      const rec = (bag.contacts || []).find((row) => row.id === focus.id) || {};
      const phone = String(rec.phone || rec.mobile || '').replace(/[^\d]/g, '');
      if (!phone) return toast('No phone on this contact');
      window.open('https://wa.me/' + phone, '_blank', 'noopener');
      return;
    }
    const subject = window.prompt(type === 'note' ? 'Note' : 'Subject');
    if (!subject) return;
    if (type === 'note') {
      const result = await api('/crm/api/notes', { method: 'POST', body: JSON.stringify({ body: subject, relatedType: 'contact', relatedId: focus.id }) });
      if (!result || result.error) return toast((result && result.error) || 'Could not save');
      toast('Note saved'); return drawRecord();
    }
    const result = await api('/crm/api/activities', { method: 'POST', body: JSON.stringify({ type: type.toUpperCase(), subject, status: type === 'task' || type === 'meeting' ? 'PLANNED' : 'DONE', relatedType: 'contact', relatedId: focus.id }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not save');
    toast('Saved'); refresh();
  };

  const priorRecord = drawRecord;
  drawRecord = async function () {
    if (!focus || focus.type !== 'contact') return priorRecord();
    const data = await api('/crm/api/record/contact/' + focus.id);
    if (!data || data.error) { toast((data && data.error) || 'Could not open it'); return go('contacts'); }
    const rec = data.record;
    const scored = contactScore(rec);
    const name = person(rec);
    const company = (bag.companies || []).find((row) => row.id === rec.companyId);
    const deals = data.deals || [];
    const tasks = (data.activities || []).filter((row) => row.status === 'PLANNED');
    const bits = []
      .concat((data.notes || []).map((row) => ({ kind: 'note', at: row.createdAt, title: 'Note', detail: row.body })))
      .concat((data.activities || []).map((row) => ({ kind: String(row.type || 'task').toLowerCase(), at: row.createdAt || row.dueAt, title: row.subject || row.type, detail: row.notes || (row.status === 'PLANNED' ? 'Open' : 'Done'), done: row.status !== 'PLANNED' })))
      .concat(deals.map((row) => ({ kind: 'deal', at: row.createdAt, title: row.name, detail: money(row.amount) + ' · ' + (row.stage || '') })))
      .concat((data.history || []).map((row) => ({ kind: 'task', at: row.createdAt, title: row.action, detail: row.detail || '' })));
    bits.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const shown = bits.filter((row) => crFilter === 'all' || row.kind === crFilter || (crFilter === 'file' && row.kind === 'file'));
    const phone = rec.phone || rec.mobile || '';
    const wa = String(phone).replace(/[^\d]/g, '');
    const filters = ['all','note','email','call','meeting','whatsapp','task'].map((id) => `<button type="button" class="cx-tool ${crFilter===id?'on':''}" onclick="setCrFilter('${id}')">${id === 'all' ? 'All activity' : id[0].toUpperCase()+id.slice(1)}</button>`).join('');
    const entries = shown.map((row) => `<article class="cr-entry ${row.kind} ${row.done ? 'done' : ''}"><b>${esc(row.title || row.kind)}</b><div class="cx-muted">${esc(row.detail || '')}</div><div class="cx-muted">${esc(relativeTime(row.at) || '')}</div></article>`).join('') || '<div class="cx-muted">Nothing in this filter.</div>';
    const dealCards = deals.map((row) => `<button type="button" class="cr-assoc" style="width:100%;text-align:left" onclick="openRecord('deal','${row.id}')"><b>${esc(row.name)}</b><div class="cx-muted">${esc(row.stage || '')} · ${money(row.amount)}${row.closeDate ? ' · ' + esc(String(row.closeDate).slice(0,10)) : ''}</div></button>`).join('') || '<div class="cx-muted">No deal yet.</div>';
    const taskRows = tasks.map((row) => `<div class="cr-prop"><span>${esc(row.subject)}</span><span class="cx-muted">${esc(String(row.dueAt || '').slice(0,10) || 'No date')}</span></div>`).join('') || '<div class="cx-muted">No open task.</div>';
    document.getElementById('view').innerHTML = `<div class="cr-head"><div class="cx-muted">Contacts › ${esc(name)}</div><button type="button" class="cx-go" onclick="saveProfile()">Save</button></div>
      <div class="cr">
        <aside class="cr-side">
          <div class="cx-who"><span class="cx-av lg">${esc(initials(name))}</span><div><h1 style="font-size:22px;margin:0">${esc(name)}</h1><div class="cx-muted">${esc(rec.title || '')}${rec.title && company ? ' · ' : ''}${esc(company ? company.name : '')}</div><div style="margin-top:6px">${scorePill(data.score != null ? data.score : scored.score)} <span class="cx-muted">Lead score</span></div></div></div>
          <h2 style="font-size:13px;margin:16px 0 6px">Properties</h2>
          <div class="cr-prop"><span>Email</span><span>${esc(rec.email || '—')} ${rec.email ? `<button type="button" class="cx-tool" onclick="copyProp('${esc(rec.email)}')">Copy</button>` : ''}</span></div>
          <div class="cr-prop"><span>Phone</span><span>${esc(phone || '—')} ${phone ? `<button type="button" class="cx-tool" onclick="copyProp('${esc(phone)}')">Copy</button> <a href="tel:${esc(phone)}">Call</a>` : ''} ${wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : ''}</span></div>
          <div class="cr-prop"><span>Company</span><span>${company ? `<button type="button" class="cx-link" onclick="openRecord('company','${company.id}')">${esc(company.name)}</button>` : '—'}</span></div>
          <div class="cr-prop"><span>Source</span><b>${esc(rec.source || '—')}</b></div>
          <div class="cr-prop"><span>Created</span><b>${esc(String(rec.createdAt || '').slice(0,10) || '—')}</b></div>
          <div class="cr-prop"><span>Last activity</span><b>${esc(relativeTime(lastTouch(rec.id)) || 'None')}</b></div>
          <label>Lifecycle<select data-key="status"><option ${rec.status==='ACTIVE'?'selected':''}>ACTIVE</option><option ${rec.status==='CUSTOMER'?'selected':''}>CUSTOMER</option><option ${rec.status==='INACTIVE'?'selected':''}>INACTIVE</option></select></label>
          <label>Owner<select data-key="ownerId"><option value="">Unassigned</option>${(bag.people||[]).map((row)=>`<option value="${row.id}" ${row.id===rec.ownerId?'selected':''}>${esc(row.fullName||row.email)}</option>`).join('')}</select></label>
          <label>Company<select data-key="companyId"><option value="">None</option>${(bag.companies||[]).map((row)=>`<option value="${row.id}" ${row.id===rec.companyId?'selected':''}>${esc(row.name)}</option>`).join('')}</select></label>
          ${fieldBox('firstName','First name', rec.firstName)}${fieldBox('lastName','Last name', rec.lastName)}${fieldBox('title','Title', rec.title)}${fieldBox('email','Email', rec.email)}${fieldBox('phone','Phone', rec.phone)}${fieldBox('mobile','Mobile', rec.mobile)}${fieldBox('source','Source', rec.source)}${fieldBox('method','How they like to be reached', rec.method)}${fieldBox('city','City', rec.city)}${fieldBox('description','About', rec.description)}
          <h2 style="font-size:13px;margin:16px 0 6px">Why this score</h2>
          ${scored.parts.map(([label, pts]) => `<div class="cr-prop"><span>${esc(label)}</span><b>${pts > 0 ? '+' : ''}${pts}</b></div>`).join('')}
          <div class="cx-muted">The number on the pill is the same rule the record uses. It is not a guessed marketing score.</div>
        </aside>
        <section class="cr-main">
          <div class="cr-feed">${filters}<button type="button" class="cx-go" onclick="document.getElementById('crAdd').hidden=!document.getElementById('crAdd').hidden">+ Add activity</button></div>
          <div id="crAdd" hidden class="cx-panel"><button type="button" class="cx-tool" onclick="logOnContact('note')">Add note</button> <button type="button" class="cx-tool" onclick="logOnContact('call')">Log call</button> <button type="button" class="cx-tool" onclick="logOnContact('email')">Log email</button> <button type="button" class="cx-tool" onclick="logOnContact('meeting')">Schedule meeting</button> <button type="button" class="cx-tool" onclick="logOnContact('task')">Create task</button> <button type="button" class="cx-tool" onclick="logOnContact('whatsapp')">Open WhatsApp</button></div>
          ${entries}
          <label>Note<textarea id="noteBody" style="height:70px"></textarea></label><button type="button" class="cx-go" onclick="saveRecordNote()">Save note</button>
        </section>
        <aside class="cr-side">
          <h2 style="font-size:14px">Associated deals</h2>${dealCards}<button type="button" class="cx-tool" onclick="go('deals','deal')">+ Create deal</button>
          <h2 style="font-size:14px;margin-top:16px">Associated company</h2>${company ? `<div class="cr-assoc"><b>${esc(company.name)}</b><div class="cx-muted">${esc(company.industry || '')}</div><div class="cx-muted">${esc(company.website || '')}</div><div class="cx-muted">${esc(company.phone || '')}</div></div>` : '<div class="cx-muted">No company. Choose one under Properties and save.</div>'}
          <h2 style="font-size:14px;margin-top:16px">Open tasks (${tasks.length})</h2>${taskRows}<button type="button" class="cx-tool" onclick="go('tasks','task')">+ Create task</button>
        </aside>
      </div>`;
  };
})();

(function () {
  const fix = document.createElement('style');
  fix.textContent = `
    body, #app, .app, .work, #view {
      background-image: none !important;
    }
    body { background: #e7edf2 !important; }
    .work, #view { background: #f4f6f8 !important; }
    #view { background: #fff !important; }
    #view .cx {
      background: #fff !important;
      border: 1px solid #e5e8eb;
      border-radius: 12px;
      padding: 16px 16px 8px;
    }
    #view .cx .cx-head { display: flex !important; justify-content: space-between !important; align-items: center !important; margin: 0 0 12px !important; }
    #view .cx .cx-bar { display: flex !important; justify-content: flex-start !important; align-items: center !important; gap: 8px !important; flex-wrap: nowrap !important; margin: 0 0 4px !important; }
    #view .cx .cx-left, #view .cx .cx-right { display: flex !important; align-items: center !important; gap: 8px !important; flex-wrap: nowrap !important; }
    #view .cx .cx-right { margin-left: auto !important; }
    #view .cx .cx-views { display: flex !important; justify-content: flex-start !important; align-items: flex-end !important; gap: 2px !important; flex-wrap: nowrap !important; overflow: auto; border-bottom: 1px solid #e5e8eb; margin: 8px -16px 12px !important; padding: 0 8px !important; }
    #view .cx .cx-left button.cx-tool,
    #view .cx .cx-right button.cx-tool,
    #view .cx .cx-head button.cx-tool,
    #view .cx .cx-panel button.cx-tool {
      background: #fff !important; color: #334155 !important; border: 1px solid #d5dde6 !important;
      border-radius: 8px !important; height: 34px !important; min-height: 34px !important; padding: 0 12px !important;
      font-size: 13px !important; font-weight: 600 !important; box-shadow: none !important;
    }
    #view .cx .cx-right button.cx-tool.on { background: #0f172a !important; color: #fff !important; border-color: #0f172a !important; }
    #view .cx .cx-head button.cx-go, #view .cx button.cx-go {
      background: #0d9488 !important; color: #fff !important; border: 0 !important; border-radius: 8px !important;
      height: 36px !important; min-height: 36px !important; padding: 0 14px !important; font-weight: 650 !important; box-shadow: none !important;
    }
    #view .cx .cx-views button.cx-tab {
      background: transparent !important; color: #64748b !important; border: 0 !important; border-radius: 0 !important;
      height: auto !important; min-height: 0 !important; padding: 10px 12px !important; font-size: 14px !important; font-weight: 600 !important; box-shadow: none !important;
    }
    #view .cx .cx-views button.cx-tab.on { color: #0f172a !important; background: transparent !important; box-shadow: inset 0 -2px 0 #0d9488 !important; }
    #view .cx .cx-search { height: 34px !important; background: #fff !important; border: 1px solid #d5dde6 !important; border-radius: 8px !important; color: #0f172a !important; }
  `;
  document.head.appendChild(fix);
})();

(function () {
  const css = document.createElement('style');
  css.textContent = `
    #view .cx .cr button.cx-tool, #view .cx aside button.cx-tool, #view .cx .cr-feed button.cx-tool {
      background: #fff !important; color: #334155 !important; border: 1px solid #d5dde6 !important;
      border-radius: 8px !important; height: 32px !important; min-height: 32px !important; padding: 0 10px !important;
      font-size: 13px !important; font-weight: 600 !important; box-shadow: none !important;
    }
    #view .cx .cr-feed button.cx-tool.on { color: #0f172a !important; box-shadow: inset 0 -2px 0 #0d9488 !important; background: transparent !important; border: 0 !important; border-radius: 0 !important; }
    #view .cx .cr button.cx-go, #view .cx aside button.cx-go {
      background: #0d9488 !important; color: #fff !important; border: 0 !important; border-radius: 8px !important;
      height: 34px !important; padding: 0 12px !important; box-shadow: none !important;
    }
  `;
  document.head.appendChild(css);

  let coMode = 'list';
  let coSaved = 'all';
  let coSort = 'name';
  let coQuery = '';
  let coOwner = '';
  let coType = '';
  let coShowFilters = false;
  let coShowSort = false;
  let coShowCols = false;
  let coMenu = '';
  const coCols = { industry: 1, contacts: 1, deals: 1, revenue: 1, activity: 1, owner: 1 };
  let coExtra = [];
  try { coExtra = JSON.parse(localStorage.getItem('crm-company-views') || '[]'); } catch (e) { coExtra = []; }

  function peopleOf(id) { return (bag.contacts || []).filter((row) => row.companyId === id); }
  function openDealsOf(id) { return (bag.deals || []).filter((row) => row.companyId === id && !String(stageOf(row)).startsWith('CLOSED')); }
  function revenueOf(id) { return (bag.deals || []).filter((row) => row.companyId === id && stageOf(row) === 'CLOSED_WON').reduce((sum, row) => sum + Number(row.amount || 0), 0); }
  function touchOf(id) {
    const ids = peopleOf(id).map((row) => row.id).concat(id);
    return (bag.activities || []).filter((row) => ids.includes(row.relatedId)).map((row) => row.createdAt || row.dueAt || '').sort().pop() || '';
  }
  function quiet(id) {
    const t = touchOf(id);
    return !t || (Date.now() - new Date(t).getTime()) > 30 * 86400000;
  }

  window.setCo = function (key, value) {
    if (key === 'mode') coMode = value;
    if (key === 'saved') coSaved = value;
    if (key === 'sort') { coSort = value; coShowSort = false; }
    if (key === 'filters') coShowFilters = !coShowFilters;
    if (key === 'sortbox') coShowSort = !coShowSort;
    if (key === 'cols') coShowCols = !coShowCols;
    if (key === 'col') coCols[value] = coCols[value] ? 0 : 1;
    if (key === 'menu') coMenu = coMenu === value ? '' : value;
    if (key === 'query') {
      coQuery = value;
      const box = document.querySelector('#view .cx-search');
      window.__coCaret = box ? box.selectionStart : String(value).length;
    }
    drawCompanyList();
    if (key === 'query') {
      const box = document.querySelector('#view .cx-search');
      if (box) { box.focus(); const n = Math.min(window.__coCaret || 0, box.value.length); box.setSelectionRange(n, n); }
    }
  };
  window.addCompanyView = function () {
    const name = window.prompt('Name this view. It keeps companies whose name or industry contains the word.');
    if (!name) return;
    coExtra.push(name.trim());
    localStorage.setItem('crm-company-views', JSON.stringify(coExtra));
    coSaved = 'word:' + name.trim();
    drawCompanyList();
  };
  window.drawCompanyList = function () {
    const showForm = openForm === 'company';
    if (showForm) openForm = '';
    const mine = me.sub || me.id;
    let rows = (bag.companies || []).slice();
    if (coSaved === 'mine') rows = rows.filter((row) => row.ownerId === mine);
    if (coSaved === 'open') rows = rows.filter((row) => openDealsOf(row.id).length);
    if (coSaved === 'quiet') rows = rows.filter((row) => quiet(row.id));
    if (coSaved.indexOf('word:') === 0) {
      const word = coSaved.slice(5).toLowerCase();
      rows = rows.filter((row) => ((row.name || '') + ' ' + (row.industry || '')).toLowerCase().includes(word));
    }
    const q = coQuery.trim();
    const hay = (row) => [row.name, row.industry, row.city, row.phone, row.email, row.website, row.type, peopleOf(row.id).map(person).join(' ')].join(' ');
    rows = rows.filter((row) => smartMatch((document.getElementById('q') || {}).value || '', hay(row)) && smartMatch(q, hay(row)));
    if (coOwner) rows = rows.filter((row) => row.ownerId === coOwner);
    if (coType) rows = rows.filter((row) => (row.type || 'PROSPECT') === coType);
    rows.sort((a, b) => {
      if (q) return smartScore(q, hay(b)) - smartScore(q, hay(a));
      if (coSort === 'new') return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      if (coSort === 'touch') return String(touchOf(b.id)).localeCompare(String(touchOf(a.id)));
      if (coSort === 'revenue') return revenueOf(b.id) - revenueOf(a.id);
      if (coSort === 'people') return peopleOf(b.id).length - peopleOf(a.id).length;
      return (a.name || '').localeCompare(b.name || '');
    });
    const filtersOn = [coOwner, coType].filter(Boolean).length;
    const views = [['all', 'All companies'], ['mine', 'My companies'], ['open', 'Open deals'], ['quiet', 'No activity 30d+']].concat(coExtra.map((name) => ['word:' + name, name]));
    const owners = (bag.people || []).map((row) => `<option value="${row.id}" ${coOwner === row.id ? 'selected' : ''}>${esc(row.fullName || row.email)}</option>`).join('');
    let body = '';
    if (coMode === 'board') {
      const types = [['PROSPECT', 'Prospect'], ['CUSTOMER', 'Customer'], ['PARTNER', 'Partner']];
      body = `<div class="cx-board">${types.map(([code, label]) => {
        const list = rows.filter((row) => (row.type || 'PROSPECT') === code);
        return `<div class="cx-col"><b>${label} · ${list.length}</b>${list.map((row) => `<button type="button" class="cx-card" onclick="openRecord('company','${row.id}')"><b>${esc(row.name)}</b><div class="cx-muted">${esc(row.industry || 'No industry')}</div><div class="cx-muted">${peopleOf(row.id).length} contacts · ${openDealsOf(row.id).length} open</div><div class="cx-muted">${money(revenueOf(row.id))} won</div></button>`).join('') || '<div class="cx-muted">None</div>'}</div>`;
      }).join('')}</div>`;
    } else if (coMode === 'map') {
      const groups = {};
      rows.forEach((row) => { const key = row.city || row.country || 'No city'; (groups[key] = groups[key] || []).push(row); });
      body = `<p class="cx-muted">Grouped by city. There is no map pin until an address has coordinates.</p>` + Object.keys(groups).sort().map((city) => `<section class="cx-panel"><b>${esc(city)}</b>${groups[city].map((row) => `<div class="cr-prop"><button type="button" class="cx-link" onclick="openRecord('company','${row.id}')">${esc(row.name)}</button><span class="cx-muted">${esc(row.industry || '')}</span></div>`).join('')}</section>`).join('');
    } else if (coMode === 'calendar') {
      const now = new Date();
      const y = now.getFullYear(); const m = now.getMonth();
      const days = new Date(y, m + 1, 0).getDate();
      const cells = [];
      for (let day = 1; day <= days; day++) {
        const key = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const born = rows.filter((row) => String(row.createdAt || '').slice(0, 10) === key);
        cells.push(`<div class="cx-card"><b>${day}</b>${born.map((row) => `<div><button type="button" class="cx-link" onclick="openRecord('company','${row.id}')">${esc(row.name)}</button></div>`).join('') || '<div class="cx-muted">—</div>'}</div>`);
      }
      body = `<p class="cx-muted">Companies created in ${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}.</p><div class="cx-board" style="flex-wrap:wrap">${cells.join('')}</div>`;
    } else {
      const th = (key, label) => coCols[key] ? `<th>${label}</th>` : '';
      const td = (key, html) => coCols[key] ? `<td>${html}</td>` : '';
      const lines = rows.map((row) => {
        const owner = ownerName(row.ownerId);
        const n = peopleOf(row.id).length;
        const open = openDealsOf(row.id).length;
        return `<tr class="cx-row"><td><input type="checkbox" onclick="event.stopPropagation()"></td><td><div class="cx-who" style="cursor:pointer" onclick="openRecord('company','${row.id}')"><span class="cx-av" style="background:${avatarGradient(row.name)}">${esc(initials(row.name))}</span><span><b class="cx-name">${esc(row.name)}</b><div class="cx-mail">${esc(row.city || row.website || '')}</div></span></div></td>${td('industry', esc(row.industry || '—'))}${td('contacts', String(n))}${td('deals', String(open))}${td('revenue', money(revenueOf(row.id)))}${td('activity', esc(relativeTime(touchOf(row.id)) || 'No activity'))}${td('owner', `<span class="cx-av" style="width:22px;height:22px;font-size:10px;background:${avatarGradient(owner || '?')}">${esc(initials(owner || '?'))}</span> ${esc(owner || 'Unassigned')}`)}<td class="cx-menu"><button type="button" class="cx-tool cx-more" onclick="event.stopPropagation();setCo('menu','${row.id}')">⋮</button>${coMenu === row.id ? `<div class="cx-pop"><button type="button" onclick="openRecord('company','${row.id}')">Open</button><button type="button" onclick="go('deals','deal')">Create deal</button></div>` : ''}</td></tr>`;
      }).join('');
      body = `<table class="cx-table"><tr><th></th><th>Company</th>${th('industry','Industry')}${th('contacts','Contacts')}${th('deals','Open deals')}${th('revenue','Total revenue')}${th('activity','Last activity')}${th('owner','Owner')}<th></th></tr>${lines || '<tr><td colspan="9"><div class="cx-muted" style="padding:16px">No company in this view.</div></td></tr>'}</table>`;
    }
    const form = `<div class="drawer dealbox" id="form" ${showForm ? '' : 'hidden'} onclick="if(event.target.id==='form')this.hidden=true"><aside><div class="sheethead"><h2>Create company</h2><button type="button" class="ghost" onclick="document.getElementById('form').hidden=true">Close</button></div><div class="dealform"><label>Name<input id="coName"></label><label>Industry<input id="coIndustry"></label><label>Type<select id="coType"><option>PROSPECT</option><option>CUSTOMER</option><option>PARTNER</option></select></label><label>Phone<input id="coPhone"></label><label>Email<input id="coEmail"></label><label>Website<input id="coWeb"></label><label>City<input id="coCity"></label><label>Country<input id="coCountry" value="Nigeria"></label><label>Source<input id="coSource"></label><label>What they buy<textarea id="coAbout" rows="3"></textarea></label><label>Owner<select id="coOwner"><option value="">Me</option>${ownerOptions()}</select></label></div><div class="dealactions"><button type="button" onclick="saveCompany()">Create</button></div></aside></div>`;
    document.getElementById('view').innerHTML = `<div class="cx">
      <div class="cx-head"><h1>Companies</h1><div><button type="button" class="cx-go" onclick="document.getElementById('form').hidden=false">+ Create company</button></div></div>
      <div class="cx-bar"><div class="cx-left"><input class="cx-search" placeholder="Search companies..." value="${esc(coQuery)}" oninput="setCo('query', this.value)"><button type="button" class="cx-tool" onclick="setCo('filters')">Filters${filtersOn ? `<span class="cx-badge">${filtersOn}</span>` : ''}</button><button type="button" class="cx-tool" onclick="setCo('sortbox')">Sort</button></div><div class="cx-right"><button type="button" class="cx-tool ${coMode==='list'?'on':''}" onclick="setCo('mode','list')">List</button><button type="button" class="cx-tool ${coMode==='board'?'on':''}" onclick="setCo('mode','board')">Board</button><button type="button" class="cx-tool ${coMode==='map'?'on':''}" onclick="setCo('mode','map')">Map</button><button type="button" class="cx-tool ${coMode==='calendar'?'on':''}" onclick="setCo('mode','calendar')">Calendar</button><button type="button" class="cx-tool" onclick="setCo('cols')">Columns</button></div></div>
      ${coShowFilters ? `<div class="cx-panel"><label>Owner<select onchange="coOwner=this.value;drawCompanyList()"><option value="">Anyone</option>${owners}</select></label> <label>Type<select onchange="coType=this.value;drawCompanyList()"><option value="">Any</option><option ${coType==='PROSPECT'?'selected':''} value="PROSPECT">Prospect</option><option ${coType==='CUSTOMER'?'selected':''} value="CUSTOMER">Customer</option><option ${coType==='PARTNER'?'selected':''} value="PARTNER">Partner</option></select></label> <button type="button" class="cx-tool" onclick="coOwner='';coType='';drawCompanyList()">Clear</button></div>` : ''}
      ${coShowSort ? `<div class="cx-panel"><button type="button" class="cx-tool" onclick="setCo('sort','name')">Name</button><button type="button" class="cx-tool" onclick="setCo('sort','people')">Contacts</button><button type="button" class="cx-tool" onclick="setCo('sort','revenue')">Revenue</button><button type="button" class="cx-tool" onclick="setCo('sort','touch')">Last activity</button><button type="button" class="cx-tool" onclick="setCo('sort','new')">Newest</button></div>` : ''}
      ${coShowCols ? `<div class="cx-panel">${['industry','contacts','deals','revenue','activity','owner'].map((key) => `<label style="margin-right:10px"><input type="checkbox" ${coCols[key]?'checked':''} onchange="setCo('col','${key}')"> ${key}</label>`).join('')}</div>` : ''}
      <div class="cx-views">${views.map(([id, label]) => `<button type="button" class="cx-tab ${coSaved===id?'on':''}" onclick="setCo('saved','${String(id).replace(/'/g, '')}')">${esc(label)}</button>`).join('')}<button type="button" class="cx-tab" onclick="addCompanyView()">+ Add view</button></div>
      ${body}<div class="cx-muted" style="margin-top:8px">${rows.length} compan${rows.length===1?'y':'ies'}</div>${form}</div>`;
  };

  const priorPeople = drawPeople;
  drawPeople = function (kind) {
    if (kind === 'companies') return drawCompanyList();
    return priorPeople(kind);
  };

  let coFilter = 'all';
  window.setCoFilter = function (value) { coFilter = value; drawRecord(); };
  window.logOnCompany = async function (type) {
    if (!focus) return;
    const subject = window.prompt(type === 'note' ? 'Note' : 'Subject');
    if (!subject) return;
    if (type === 'note') {
      const result = await api('/crm/api/notes', { method: 'POST', body: JSON.stringify({ body: subject, relatedType: 'company', relatedId: focus.id }) });
      if (!result || result.error) return toast((result && result.error) || 'Could not save');
      toast('Note saved'); return drawRecord();
    }
    const result = await api('/crm/api/activities', { method: 'POST', body: JSON.stringify({ type: type.toUpperCase(), subject, status: type === 'task' || type === 'meeting' ? 'PLANNED' : 'DONE', relatedType: 'company', relatedId: focus.id }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not save');
    toast('Saved'); refresh();
  };

  const priorCompanyRecord = drawRecord;
  drawRecord = async function () {
    if (!focus || focus.type !== 'company') return priorCompanyRecord();
    const data = await api('/crm/api/record/company/' + focus.id);
    if (!data || data.error) { toast((data && data.error) || 'Could not open it'); return go('companies'); }
    const rec = data.record;
    const people = data.contacts || [];
    const deals = data.deals || [];
    const open = deals.filter((row) => !String(stageOf(row)).startsWith('CLOSED'));
    const won = deals.filter((row) => stageOf(row) === 'CLOSED_WON').reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const files = (bag.objects || []).filter((row) => row.kind === 'document' && (row.companyId === rec.id || (metaOf(row).companyId === rec.id)));
    const bits = []
      .concat((data.notes || []).map((row) => ({ kind: 'note', at: row.createdAt, title: 'Note', detail: row.body })))
      .concat((data.activities || []).map((row) => ({ kind: String(row.type || 'task').toLowerCase(), at: row.createdAt || row.dueAt, title: row.subject || row.type, detail: row.notes || (row.status === 'PLANNED' ? 'Open' : 'Done'), done: row.status !== 'PLANNED' })))
      .concat(deals.map((row) => ({ kind: 'deal', at: row.createdAt, title: row.name, detail: money(row.amount) + ' · ' + (row.stage || '') })))
      .concat((data.history || []).map((row) => ({ kind: 'task', at: row.createdAt, title: row.action, detail: row.detail || '' })));
    bits.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const shown = bits.filter((row) => coFilter === 'all' || row.kind === coFilter);
    const filters = ['all','note','email','call','meeting','task','deal'].map((id) => `<button type="button" class="cx-tool ${coFilter===id?'on':''}" onclick="setCoFilter('${id}')">${id === 'all' ? 'All activity' : id[0].toUpperCase()+id.slice(1)}</button>`).join('');
    const entries = shown.map((row) => `<article class="cr-entry ${row.kind} ${row.done ? 'done' : ''}"><b>${esc(row.title || row.kind)}</b><div class="cx-muted">${esc(row.detail || '')}</div><div class="cx-muted">${esc(relativeTime(row.at) || '')}</div></article>`).join('') || '<div class="cx-muted">Nothing in this filter.</div>';
    const contactList = people.map((row) => `<button type="button" class="cx-link" onclick="openRecord('contact','${row.id}')">${esc(person(row))}</button>`).join('<br>') || '<div class="cx-muted">No contact at this company yet.</div>';
    const dealCards = deals.map((row) => `<button type="button" class="cr-assoc" style="width:100%;text-align:left" onclick="openRecord('deal','${row.id}')"><b>${esc(row.name)}</b><div class="cx-muted">${esc(row.stage || '')} · ${money(row.amount)}${row.closeDate ? ' · ' + esc(String(row.closeDate).slice(0,10)) : ''}</div></button>`).join('') || '<div class="cx-muted">No deal yet.</div>';
    const fileList = files.map((row) => `<div class="cr-prop"><b>${esc(row.name)}</b></div>`).join('') || '<div class="cx-muted">No file is stored on this company.</div>';
    document.getElementById('view').innerHTML = `<div class="cx"><div class="cx-head"><div class="cx-muted">Companies › ${esc(rec.name)}</div><button type="button" class="cx-go" onclick="saveProfile()">Save</button></div>
      <div class="cr">
        <aside class="cr-side">
          <div class="cx-who"><span class="cx-av lg" style="background:#0d9488">${esc(initials(rec.name))}</span><div><h1 style="font-size:22px;margin:0">${esc(rec.name)}</h1><div class="cx-muted">${esc(rec.industry || 'No industry')} · ${esc(rec.type || 'PROSPECT')}</div><div class="cx-muted">${people.length} contacts · ${open.length} open · ${money(won)} won</div></div></div>
          <h2 style="font-size:13px;margin:16px 0 6px">Properties</h2>
          ${fieldBox('name','Name', rec.name)}${fieldBox('industry','Industry', rec.industry)}${fieldBox('type','Type', rec.type)}${fieldBox('website','Website', rec.website)}${fieldBox('email','Email', rec.email)}${fieldBox('phone','Phone', rec.phone)}${fieldBox('city','City', rec.city)}${fieldBox('country','Country', rec.country)}${fieldBox('source','Source', rec.source)}${fieldBox('description','About', rec.description)}
          <label>Owner<select data-key="ownerId"><option value="">Unassigned</option>${(bag.people||[]).map((row)=>`<option value="${row.id}" ${row.id===rec.ownerId?'selected':''}>${esc(row.fullName||row.email)}</option>`).join('')}</select></label>
          <h2 style="font-size:13px;margin:16px 0 6px">Contacts</h2>
          ${contactList}
        </aside>
        <section class="cr-main">
          <div class="cr-feed">${filters}<button type="button" class="cx-go" onclick="document.getElementById('coAdd').hidden=!document.getElementById('coAdd').hidden">+ Add activity</button></div>
          <div id="coAdd" hidden class="cx-panel"><button type="button" class="cx-tool" onclick="logOnCompany('note')">Add note</button> <button type="button" class="cx-tool" onclick="logOnCompany('call')">Log call</button> <button type="button" class="cx-tool" onclick="logOnCompany('email')">Log email</button> <button type="button" class="cx-tool" onclick="logOnCompany('meeting')">Schedule meeting</button> <button type="button" class="cx-tool" onclick="logOnCompany('task')">Create task</button></div>
          ${entries}
          <label>Note<textarea id="noteBody" style="height:70px"></textarea></label><button type="button" class="cx-go" onclick="saveRecordNote()">Save note</button>
        </section>
        <aside class="cr-side">
          <h2 style="font-size:14px">Deals</h2>${dealCards}<button type="button" class="cx-tool" onclick="go('deals','deal')">+ Create deal</button>
          <h2 style="font-size:14px;margin-top:16px">Attachments</h2>${fileList}
        </aside>
      </div></div>`;
  };
})();

window.crmLookup = async function (q) {
  const query = String(q || '').trim();
  if (!query) return [];
  const local = [];
  const push = (kind, id, title, detail, blob) => {
    const score = smartScore(query, blob);
    if (score) local.push({ kind, id, title: title || 'Untitled', detail: detail || '', score });
  };
  (bag.contacts || []).forEach((row) => push('contact', row.id, person(row), [row.email, companyName(row.companyId)].filter(Boolean).join(' · '), [person(row), row.email, row.phone, row.mobile, row.title, row.city, companyName(row.companyId)].join(' ')));
  (bag.companies || []).forEach((row) => push('company', row.id, row.name, [row.industry, row.city].filter(Boolean).join(' · '), [row.name, row.industry, row.city, row.country, row.phone, row.email, row.website].join(' ')));
  (bag.deals || []).forEach((row) => push('deal', row.id, row.name, [row.stage, companyName(row.companyId)].filter(Boolean).join(' · '), [row.name, row.stage, row.nextStep, companyName(row.companyId), contactName(row.contactId)].join(' ')));
  (bag.leads || []).forEach((row) => push('lead', row.id, person(row), row.companyName || row.email || '', [person(row), row.companyName, row.email, row.phone, row.source, row.city].join(' ')));
  (bag.products || []).forEach((row) => push('product', row.id, row.name, row.code || '', [row.name, row.code, row.description].join(' ')));
  (bag.activities || []).forEach((row) => push('task', row.id, row.subject, row.type || '', [row.subject, row.notes, row.type].join(' ')));
  local.sort((a, b) => b.score - a.score || String(a.title).localeCompare(String(b.title)));
  const seen = new Set(local.map((row) => row.kind + ':' + row.id));
  try {
    const data = await api('/crm/api/search?q=' + encodeURIComponent(query));
    ((data && data.hits) || []).forEach((row) => {
      const key = row.kind + ':' + row.id;
      if (!seen.has(key)) { seen.add(key); local.push(row); }
    });
  } catch (e) {}
  return local.slice(0, 20);
};
window.openSearchHit = function (kind, id) {
  const box = document.getElementById('searchhits');
  if (box) box.style.display = 'none';
  if (window.closeCommandPalette) window.closeCommandPalette();
  if (kind === 'task' || kind === 'activity') return go('tasks');
  if (kind === 'product') return go('products');
  if (kind === 'contact' || kind === 'company' || kind === 'deal' || kind === 'lead') return openRecord(kind, id);
  go('home');
};

(function () {
  const css = document.createElement('style');
  css.textContent = `
    #view .cx.dl .dl-board { display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; padding: 4px 2px 16px; }
    #view .cx.dl .dl-col { flex: 0 0 270px; background: #f8fafc; border: 1px solid #e5e8eb; border-radius: 12px; padding: 10px; min-height: 180px; }
    #view .cx.dl .dl-col.drop-target { outline: 2px solid #0d9488; }
    #view .cx.dl .dl-col h3 { margin: 0; font-size: 13px; font-weight: 700; color: #64748b; letter-spacing: .02em; }
    #view .cx.dl .dl-count { display: inline-flex; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: #0d9488; color: #fff; font-size: 11px; align-items: center; justify-content: center; margin-left: 6px; }
    #view .cx.dl .dl-sum { font-weight: 700; color: #0f172a; margin: 4px 0 8px; }
    #view .cx.dl .dl-card { background: #1a2332; color: #fff; border: 1px solid rgba(255,255,255,.08); border-left: 3px solid var(--stage, #0d9488); border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; cursor: pointer; position: relative; }
    #view .cx.dl .dl-card:hover { transform: translateY(-2px); }
    #view .cx.dl .dl-card.dragging { opacity: .45; }
    #view .cx.dl .dl-card.won { background: #123028; }
    #view .cx.dl .dl-card.lost { opacity: .72; background: #2a1717; }
    #view .cx.dl .dl-card b { display: block; font-size: 14px; font-weight: 650; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    #view .cx.dl .dl-card .co { color: #5eead4; background: transparent !important; border: 0 !important; padding: 0 !important; height: auto !important; font-size: 13px !important; }
    #view .cx.dl .dl-card .who, #view .cx.dl .dl-card .when { color: #94a3b8; font-size: 13px; }
    #view .cx.dl .dl-card .when.late { color: #fca5a5; }
    #view .cx.dl .dl-card .amt { color: #fbbf24; font-weight: 700; font-size: 15px; margin-top: 6px; }
    #view .cx.dl .dl-card .foot { display: flex; align-items: center; gap: 6px; margin-top: 8px; color: #94a3b8; font-size: 12px; }
    #view .cx.dl .dl-card .pct { margin-left: auto; background: rgba(255,255,255,.08); border-radius: 999px; padding: 2px 6px; }
    #view .cx.dl .dl-menu { position: absolute; right: 8px; top: 8px; }
    #view .cx.dl .dl-menu .cx-pop { right: 0; top: 28px; }
    #view .cx.dl .dl-menu .cx-pop button.cx-tool { background: #fff !important; color: #0f172a !important; border: 0 !important; border-radius: 0 !important; width: 100%; text-align: left; height: auto !important; }
    #view .cx.dl button.dl-add { background: transparent !important; color: #0d9488 !important; border: 0 !important; padding: 6px 0 !important; height: auto !important; font-size: 13px !important; }
    #view .cx.dl .dl-steps { display: flex; gap: 4px; overflow: auto; margin: 8px 0 14px; }
    #view .cx.dl button.dl-step { flex: 1; min-width: 88px; background: #f1f5f9 !important; color: #64748b !important; border: 0 !important; border-radius: 8px !important; height: 36px !important; font-size: 12px !important; }
    #view .cx.dl button.dl-step.done { background: #ccfbf1 !important; color: #0f766e !important; }
    #view .cx.dl button.dl-step.on { background: #0d9488 !important; color: #fff !important; }
    #view .cx.dl .dl-bars { display: grid; gap: 10px; margin: 12px 0; }
    #view .cx.dl .dl-bar { display: grid; grid-template-columns: 110px 1fr 90px; gap: 8px; align-items: center; font-size: 13px; }
    #view .cx.dl .dl-track { display: flex; height: 14px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
    #view .cx.dl .dl-track span { display: block; height: 100%; }
    #view .cx.dl .dl-pie { width: 140px; height: 140px; border-radius: 50%; margin: 8px 0; }
    #view .cx.dl .dl-quote { background: #fff; color: #0f172a; border: 1px solid #e5e8eb; border-radius: 12px; padding: 20px; margin-top: 12px; }
  `;
  document.head.appendChild(css);

  let dlMode = 'board';
  let dlQuery = '';
  let dlOwner = '';
  let dlCloseFrom = '';
  let dlCloseTo = '';
  let dlMin = '';
  let dlMax = '';
  let dlStage = '';
  let dlMenu = '';

  function dealStages() {
    const rows = (typeof stageList === 'function' ? stageList() : STAGES).slice();
    if (!rows.some((row) => row[0] === 'CLOSED_LOST')) rows.push(['CLOSED_LOST', 'Closed lost', '#ef4444', 0]);
    return rows;
  }
  function chanceOf(row, stageChance) {
    const n = Number(row.probability);
    return Number.isFinite(n) ? n : Number(stageChance || 0);
  }
  function lastAct(id) {
    return (bag.activities || []).filter((row) => row.relatedId === id).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))[0] || null;
  }
  function dealHay(row) {
    return [row.name, row.stage, row.nextStep, row.source, companyName(row.companyId), contactName(row.contactId), ownerName(row.ownerId)].join(' ');
  }

  window.setDl = function (key, value) {
    if (key === 'mode') dlMode = value;
    if (key === 'stage') dlStage = value;
    if (key === 'menu') dlMenu = dlMenu === value ? '' : value;
    if (key === 'query') {
      dlQuery = value;
      const box = document.querySelector('#view .cx-search');
      window.__dlCaret = box ? box.selectionStart : String(value).length;
    }
    drawDealBoard();
    if (key === 'query') {
      const box = document.querySelector('#view .cx-search');
      if (box) { box.focus(); const n = Math.min(window.__dlCaret || 0, box.value.length); box.setSelectionRange(n, n); }
    }
  };
  window.dropDeal = async function (id, stage) {
    const chance = (dealStages().find((row) => row[0] === stage) || [,,,0])[3];
    const body = { stage, probability: stage === 'CLOSED_LOST' ? 0 : chance };
    if (stage === 'CLOSED_LOST') {
      const why = window.prompt('Why was it lost?');
      if (!why) return;
      body.lostReason = why;
    }
    const result = await api('/crm/api/deals/' + id, { method: 'PATCH', body: JSON.stringify(body) });
    if (!result || result.error) return toast((result && result.error) || 'Could not move it');
    toast('Stage updated');
    refresh();
  };
  window.dropDealFrom = function (event, stage) {
    event.preventDefault();
    event.currentTarget.classList.remove('drop-target');
    const id = event.dataTransfer.getData('text/plain');
    if (id) dropDeal(id, stage);
  };
  window.quoteThisDeal = async function () {
    const rec = window.__dealRec;
    if (!rec) return;
    const amount = Number(rec.amount || 0);
    if (!amount) return toast('Put an amount on the deal before a quote');
    const result = await api('/crm/api/quotes', { method: 'POST', body: JSON.stringify({ companyId: rec.companyId || '', contactId: rec.contactId || '', dealId: rec.id, lines: [{ description: rec.name, quantity: 1, unitPrice: amount }] }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not create the quote');
    toast('Quote ' + (result.number || '') + ' created');
    const sheet = document.getElementById('dlQuote');
    if (!sheet) return;
    const tax = Number(result.tax || 0);
    const total = Number(result.total || 0);
    sheet.hidden = false;
    sheet.innerHTML = `<h2 style="margin:0 0 8px">${esc(result.number || 'Quote')}</h2><p class="cx-muted">${esc(companyName(rec.companyId) || 'No company')} · ${esc(rec.name)}</p><div class="cr-prop"><b>${esc(rec.name)}</b><span>${money(amount)}</span></div><div class="cr-prop"><span>VAT 7.5%</span><span>${money(tax)}</span></div><div class="cr-prop"><b>Total</b><b>${money(total)}</b></div><p class="cx-muted">Use the browser print dialog to save this as a PDF. Afri CRM does not email the file.</p><button type="button" class="cx-go" onclick="window.print()">Print / save PDF</button>`;
  };

  window.drawDealBoard = function () {
    const showForm = openForm === 'deal';
    const prefill = dealPrefill;
    if (showForm) openForm = '';
    dealPrefill = '';
    const q = dlQuery.trim();
    const headerQ = (document.getElementById('q') || {}).value || '';
    let rows = (bag.deals || []).filter((row) => smartMatch(headerQ, dealHay(row)) && smartMatch(q, dealHay(row)));
    if (dlOwner) rows = rows.filter((row) => row.ownerId === dlOwner);
    if (dlStage) rows = rows.filter((row) => stageOf(row) === dlStage);
    if (dlMin !== '') rows = rows.filter((row) => Number(row.amount || 0) >= Number(dlMin));
    if (dlMax !== '') rows = rows.filter((row) => Number(row.amount || 0) <= Number(dlMax));
    if (dlCloseFrom) rows = rows.filter((row) => row.closeDate && String(row.closeDate).slice(0, 10) >= dlCloseFrom);
    if (dlCloseTo) rows = rows.filter((row) => row.closeDate && String(row.closeDate).slice(0, 10) <= dlCloseTo);
    const stages = dealStages();
    const today = new Date().toISOString().slice(0, 10);
    const owners = (bag.people || []).map((row) => `<option value="${row.id}" ${dlOwner === row.id ? 'selected' : ''}>${esc(row.fullName || row.email)}</option>`).join('');
    let body = '';
    if (dlMode === 'list') {
      const lines = rows.map((row) => {
        const stage = stages.find((item) => item[0] === stageOf(row)) || [stageOf(row), stageOf(row), '#64748b', 0];
        const act = lastAct(row.id);
        const close = row.closeDate ? String(row.closeDate).slice(0, 10) : '';
        return `<tr class="cx-row"><td><b class="cx-name" style="cursor:pointer" onclick="openRecord('deal','${row.id}')">${esc(row.name)}</b></td><td>${row.contactId ? `<button type="button" class="cx-link" onclick="openRecord('contact','${row.contactId}')">${esc(contactName(row.contactId))}</button>` : '—'}</td><td>${row.companyId ? `<button type="button" class="cx-link" onclick="openRecord('company','${row.companyId}')">${esc(companyName(row.companyId))}</button>` : '—'}</td><td>${esc(stage[1])}</td><td>${money(row.amount)}</td><td class="${close && close < today ? 'cx-muted' : ''}" style="${close && close < today ? 'color:#b91c1c' : ''}">${esc(close || '—')}</td><td>${chanceOf(row, stage[3])}%</td><td>${esc(ownerName(row.ownerId) || 'Unassigned')}</td><td>${esc(act ? (act.type || 'Note') + ' · ' + (relativeTime(act.createdAt) || '') : 'No activity')}</td></tr>`;
      }).join('');
      body = `<table class="cx-table"><tr><th>Deal</th><th>Contact</th><th>Company</th><th>Stage</th><th>Value</th><th>Close date</th><th>Probability</th><th>Owner</th><th>Last activity</th></tr>${lines || '<tr><td colspan="9"><div class="cx-muted" style="padding:16px">No deal in this view.</div></td></tr>'}</table>`;
    } else if (dlMode === 'forecast') {
      const won = rows.filter((row) => stageOf(row) === 'CLOSED_WON');
      const open = rows.filter((row) => !String(stageOf(row)).startsWith('CLOSED'));
      const risk = open.filter((row) => (row.closeDate && String(row.closeDate).slice(0, 10) < today) || (typeof stalled === 'function' && stalled(row)));
      const riskIds = new Set(risk.map((row) => row.id));
      const expectedRows = open.filter((row) => !riskIds.has(row.id));
      const sum = (list, weighted) => list.reduce((total, row) => total + Number(row.amount || 0) * (weighted ? chanceOf(row, 0) / 100 : 1), 0);
      const wonN = sum(won, false);
      const expN = sum(expectedRows, true);
      const riskN = sum(risk, false);
      const pieTotal = wonN + expN + riskN || 1;
      const months = {};
      rows.forEach((row) => {
        const key = String(row.closeDate || '').slice(0, 7) || 'No close date';
        months[key] = months[key] || [];
        months[key].push(row);
      });
      const keys = Object.keys(months).sort();
      const max = Math.max(1, ...keys.map((key) => months[key].reduce((total, row) => total + Number(row.amount || 0), 0)));
      const bars = keys.map((key) => {
        const list = months[key];
        const w = list.filter((row) => stageOf(row) === 'CLOSED_WON').reduce((total, row) => total + Number(row.amount || 0), 0);
        const e = list.filter((row) => !String(stageOf(row)).startsWith('CLOSED') && !riskIds.has(row.id)).reduce((total, row) => total + Number(row.amount || 0) * chanceOf(row, 0) / 100, 0);
        const p = list.filter((row) => !String(stageOf(row)).startsWith('CLOSED')).reduce((total, row) => total + Number(row.amount || 0), 0);
        return `<div class="dl-bar"><b>${esc(key)}</b><div class="dl-track"><span style="width:${(w / max) * 100}%;background:#22c55e"></span><span style="width:${(e / max) * 100}%;background:#0d9488"></span><span style="width:${(Math.max(p - e, 0) / max) * 100}%;background:#f59e0b"></span></div><span>${money(p || w)}</span></div>`;
      }).join('') || '<div class="cx-muted">No deal has a close month yet.</div>';
      const table = keys.map((key) => months[key].map((row) => `<tr><td>${esc(key)}</td><td>${esc(row.name)}</td><td>${money(row.amount)}</td><td>${esc(stageOf(row))}</td></tr>`).join('')).join('');
      body = `<div class="cx-panel" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap"><div class="dl-pie" style="background:conic-gradient(#22c55e 0 ${(wonN / pieTotal) * 100}%, #0d9488 ${(wonN / pieTotal) * 100}% ${((wonN + expN) / pieTotal) * 100}%, #f59e0b ${((wonN + expN) / pieTotal) * 100}% 100%)"></div><div><div><b style="color:#22c55e">Won</b> ${money(wonN)}</div><div><b style="color:#0d9488">Expected</b> ${money(expN)} · open deals that are not late, times their chance</div><div><b style="color:#f59e0b">At risk</b> ${money(riskN)} · overdue or quiet for 14 days</div></div></div><div class="dl-bars">${bars}</div><p class="cx-muted">Each month: green is won, teal is the expected part of open deals, gold is the rest of the pipeline.</p><table class="cx-table"><tr><th>Month</th><th>Deal</th><th>Value</th><th>Stage</th></tr>${table || '<tr><td colspan="4"><div class="cx-muted" style="padding:12px">No deal in this view.</div></td></tr>'}</table>`;
    } else {
      body = `<div class="dl-board">${stages.map(([code, label, color, chance]) => {
        const list = rows.filter((row) => stageOf(row) === code);
        const total = list.reduce((sum, row) => sum + Number(row.amount || 0), 0);
        const cards = list.map((row) => {
          const close = row.closeDate ? String(row.closeDate).slice(0, 10) : '';
          const act = lastAct(row.id);
          const owner = ownerName(row.ownerId);
          const cls = code === 'CLOSED_WON' ? 'won' : code === 'CLOSED_LOST' ? 'lost' : '';
          return `<article class="dl-card ${cls}" style="--stage:${color}" draggable="true" ondragstart="handleDealDragStart(event,'${row.id}')" ondragend="handleDealDragEnd(event)" onclick="openRecord('deal','${row.id}')"><div class="dl-menu"><button type="button" class="cx-tool" onclick="event.stopPropagation();setDl('menu','${row.id}')">⋮</button>${dlMenu === row.id ? `<div class="cx-pop"><button type="button" class="cx-tool" onclick="event.stopPropagation();openRecord('deal','${row.id}')">Open</button><button type="button" class="cx-tool" onclick="event.stopPropagation();dropDeal('${row.id}','CLOSED_WON')">Mark won</button><button type="button" class="cx-tool" onclick="event.stopPropagation();dropDeal('${row.id}','CLOSED_LOST')">Mark lost</button></div>` : ''}</div><b>${esc(row.name)}</b>${row.companyId ? `<div><button type="button" class="co" onclick="event.stopPropagation();openRecord('company','${row.companyId}')">${esc(companyName(row.companyId))}</button></div>` : '<div class="who">No company</div>'}<div class="who">${esc(contactName(row.contactId) || 'No contact')}</div><div class="amt">${money(row.amount)}</div><div class="when ${close && close < today ? 'late' : ''}">${close ? 'Closes ' + esc(close) : 'No close date'}</div><div class="foot"><span class="cx-av" style="width:24px;height:24px;font-size:10px;background:${avatarGradient(owner || '?')}">${esc(initials(owner || '?'))}</span><span>${esc(act ? act.type : 'No activity')}</span><span class="pct">${chanceOf(row, chance)}%</span></div></article>`;
        }).join('') || '<div class="cx-muted">No deal in this stage.</div>';
        return `<section class="dl-col" ondragover="handleColDragOver(event)" ondragleave="handleColDragLeave(event)" ondrop="dropDealFrom(event,'${code}')"><h3>${esc(label)} <span class="dl-count">${list.length}</span></h3><div class="dl-sum">${money(total)}</div>${cards}<button type="button" class="dl-add" onclick="dealPrefill='${code}';openForm='deal';drawDealBoard()">+ Add deal</button></section>`;
      }).join('')}</div>`;
    }
    const form = `<div class="drawer dealbox" id="dealForm" ${showForm ? '' : 'hidden'} onclick="if(event.target.id==='dealForm')this.hidden=true"><aside><div class="sheethead"><h2>Create deal</h2><button type="button" class="ghost" onclick="document.getElementById('dealForm').hidden=true">Close</button></div><div class="dealform"><label>Deal name<input id="dName"></label><label>Pipeline<select id="dPipe"><option>Sales pipeline</option></select></label><label>Deal stage<select id="dStage">${stages.map(([id, label]) => `<option value="${id}" ${id === prefill ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select></label><label>Amount<input id="dAmount" inputmode="decimal" placeholder="0"></label><label>Close date<input id="dClose" type="date"></label><label>Contact<select id="dContact"><option value="">None</option>${(bag.contacts||[]).map((row)=>`<option value="${row.id}">${esc(person(row))}</option>`).join('')}</select></label><label>Company<select id="dCompany"><option value="">None</option>${(bag.companies||[]).map((row)=>`<option value="${row.id}">${esc(row.name)}</option>`).join('')}</select></label><label>Owner<select id="dOwner"><option value="">Me</option>${ownerOptions()}</select></label><label>Next step<input id="dNext"></label></div><div class="dealactions"><button type="button" onclick="saveDeal(false)">Create</button><button type="button" class="ghost" onclick="saveDeal(true)">Create and add another</button></div></aside></div>`;
    document.getElementById('view').innerHTML = `<div class="cx dl">
      <div class="cx-head"><div><h1>Deals</h1><div class="cx-muted">Sales pipeline · stage names come from this workspace</div></div><div><button type="button" class="cx-tool" onclick="go('import')">Import</button> <button type="button" class="cx-go" onclick="document.getElementById('dealForm').hidden=false">+ Create deal</button></div></div>
      <div class="cx-bar"><div class="cx-left"><input class="cx-search" placeholder="Search deals..." value="${esc(q)}" oninput="setDl('query', this.value)"><select onchange="dlOwner=this.value;drawDealBoard()"><option value="">Owner</option>${owners}</select><input type="date" value="${dlCloseFrom}" title="Close from" onchange="dlCloseFrom=this.value;drawDealBoard()"><input type="date" value="${dlCloseTo}" title="Close to" onchange="dlCloseTo=this.value;drawDealBoard()"><input type="number" placeholder="Min" value="${esc(dlMin)}" style="width:90px" onchange="dlMin=this.value;drawDealBoard()"><input type="number" placeholder="Max" value="${esc(dlMax)}" style="width:90px" onchange="dlMax=this.value;drawDealBoard()"><select onchange="setDl('stage', this.value)"><option value="">Stage</option>${stages.map(([id, label]) => `<option value="${id}" ${dlStage===id?'selected':''}>${esc(label)}</option>`).join('')}</select></div><div class="cx-right"><button type="button" class="cx-tool ${dlMode==='board'?'on':''}" onclick="setDl('mode','board')">Board</button><button type="button" class="cx-tool ${dlMode==='list'?'on':''}" onclick="setDl('mode','list')">List</button><button type="button" class="cx-tool ${dlMode==='forecast'?'on':''}" onclick="setDl('mode','forecast')">Forecast</button></div></div>
      ${body}<div class="cx-muted" style="margin-top:8px">${rows.length} deal${rows.length===1?'':'s'}</div>${form}</div>`;
  };

  drawDeals = function () { drawDealBoard(); };

  let dlFilter = 'all';
  window.setDlFilter = function (value) { dlFilter = value; drawRecord(); };
  window.logOnDeal = async function (type) {
    if (!focus) return;
    const subject = window.prompt(type === 'note' ? 'Note' : 'Subject');
    if (!subject) return;
    if (type === 'note') {
      const result = await api('/crm/api/notes', { method: 'POST', body: JSON.stringify({ body: subject, relatedType: 'deal', relatedId: focus.id }) });
      if (!result || result.error) return toast((result && result.error) || 'Could not save');
      toast('Note saved'); return drawRecord();
    }
    const result = await api('/crm/api/activities', { method: 'POST', body: JSON.stringify({ type: type.toUpperCase(), subject, status: 'DONE', relatedType: 'deal', relatedId: focus.id }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not save');
    toast('Saved'); refresh();
  };

  const priorDealRecord = drawRecord;
  drawRecord = async function () {
    if (!focus || focus.type !== 'deal') return priorDealRecord();
    const data = await api('/crm/api/record/deal/' + focus.id);
    if (!data || data.error) { toast((data && data.error) || 'Could not open it'); return go('deals'); }
    const rec = data.record;
    window.__dealRec = rec;
    const stages = dealStages();
    const here = stages.findIndex((row) => row[0] === stageOf(rec));
    const steps = stages.map((row, index) => `<button type="button" class="dl-step ${index < here ? 'done' : ''} ${index === here ? 'on' : ''}" onclick="dropDeal('${rec.id}','${row[0]}')">${esc(row[1])}</button>`).join('');
    const bits = []
      .concat((data.notes || []).map((row) => ({ kind: 'note', at: row.createdAt, title: 'Note', detail: row.body })))
      .concat((data.activities || []).map((row) => ({ kind: String(row.type || 'task').toLowerCase(), at: row.createdAt || row.dueAt, title: row.subject || row.type, detail: row.notes || '' })))
      .concat((data.history || []).map((row) => ({ kind: 'task', at: row.createdAt, title: row.action, detail: row.detail || '' })));
    bits.sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const shown = bits.filter((row) => dlFilter === 'all' || row.kind === dlFilter);
    const filters = ['all','note','call','email','meeting','task'].map((id) => `<button type="button" class="cx-tool ${dlFilter===id?'on':''}" onclick="setDlFilter('${id}')">${id === 'all' ? 'All activity' : id[0].toUpperCase()+id.slice(1)}</button>`).join('');
    const entries = shown.map((row) => `<article class="cr-entry ${row.kind}"><b>${esc(row.title || row.kind)}</b><div class="cx-muted">${esc(row.detail || '')}</div><div class="cx-muted">${esc(relativeTime(row.at) || '')}</div></article>`).join('') || '<div class="cx-muted">Nothing on this deal yet.</div>';
    const quotes = (bag.quotes || []).filter((row) => row.dealId === rec.id);
    const quoteList = quotes.map((row) => `<div class="cr-prop"><b>${esc(row.number || 'Quote')}</b><span>${esc(row.status || '')} · ${money(row.total)}</span></div>`).join('') || '<div class="cx-muted">No quote on this deal.</div>';
    const files = (bag.objects || []).filter((row) => row.kind === 'document' && (row.dealId === rec.id));
    const fileList = files.map((row) => `<div class="cr-prop"><b>${esc(row.name)}</b></div>`).join('') || '<div class="cx-muted">No file is stored on this deal.</div>';
    document.getElementById('view').innerHTML = `<div class="cx dl"><div class="cx-head"><div><div class="cx-muted">Deals</div><h1 style="margin:0">${esc(rec.name)}</h1><div class="cx-muted">${money(rec.amount)} · ${chanceOf(rec, 0)}%${rec.closeDate ? ' · closes ' + esc(String(rec.closeDate).slice(0,10)) : ''}</div></div><button type="button" class="cx-go" onclick="saveProfile()">Save</button></div>
      <div class="dl-steps">${steps}</div>
      <div class="cr">
        <aside class="cr-side"><h2 style="font-size:13px">Properties</h2>
          ${fieldBox('name','Name', rec.name)}${fieldBox('amount','Amount', rec.amount)}${fieldBox('stage','Stage', rec.stage)}${fieldBox('closeDate','Close date', rec.closeDate)}${fieldBox('probability','Chance', rec.probability)}${fieldBox('nextStep','Next step', rec.nextStep)}${fieldBox('source','Source', rec.source)}${fieldBox('lostReason','Lost reason', rec.lostReason)}${fieldBox('description','About', rec.description)}
          <label>Owner<select data-key="ownerId"><option value="">Unassigned</option>${(bag.people||[]).map((row)=>`<option value="${row.id}" ${row.id===rec.ownerId?'selected':''}>${esc(row.fullName||row.email)}</option>`).join('')}</select></label>
          <label>Contact<select data-key="contactId"><option value="">None</option>${(bag.contacts||[]).map((row)=>`<option value="${row.id}" ${row.id===rec.contactId?'selected':''}>${esc(person(row))}</option>`).join('')}</select></label>
          <label>Company<select data-key="companyId"><option value="">None</option>${(bag.companies||[]).map((row)=>`<option value="${row.id}" ${row.id===rec.companyId?'selected':''}>${esc(row.name)}</option>`).join('')}</select></label>
        </aside>
        <section class="cr-main">
          <div class="cr-feed">${filters}<button type="button" class="cx-go" onclick="document.getElementById('dlAdd').hidden=!document.getElementById('dlAdd').hidden">+ Add activity</button></div>
          <div id="dlAdd" hidden class="cx-panel"><button type="button" class="cx-tool" onclick="logOnDeal('note')">Add note</button> <button type="button" class="cx-tool" onclick="logOnDeal('call')">Log call</button> <button type="button" class="cx-tool" onclick="logOnDeal('email')">Log email</button> <button type="button" class="cx-tool" onclick="logOnDeal('meeting')">Log meeting</button></div>
          ${entries}
        </section>
        <aside class="cr-side">
          <h2 style="font-size:14px">People</h2>
          ${rec.contactId ? `<button type="button" class="cx-link" onclick="openRecord('contact','${rec.contactId}')">${esc(contactName(rec.contactId))}</button>` : '<div class="cx-muted">No contact</div>'}
          <h2 style="font-size:14px">Company</h2>
          ${rec.companyId ? `<button type="button" class="cx-link" onclick="openRecord('company','${rec.companyId}')">${esc(companyName(rec.companyId))}</button>` : '<div class="cx-muted">No company</div>'}
          <h2 style="font-size:14px">Quotes</h2>${quoteList}
          <button type="button" class="cx-go" onclick="quoteThisDeal()">Create quote</button>
          <div id="dlQuote" hidden class="dl-quote"></div>
          <h2 style="font-size:14px;margin-top:16px">Documents</h2>${fileList}
        </aside>
      </div></div>`;
  };
})();

(function () {
  const css = document.createElement('style');
  css.textContent = `
    #view .cx.ld .ld-split { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; align-items: start; }
    #view .cx.ld .ld-split.solo { grid-template-columns: 1fr; }
    #view .cx.ld .ld-panel { background: #fff; border: 1px solid #e5e8eb; border-radius: 12px; padding: 16px; position: sticky; top: 12px; }
    #view .cx.ld .ld-num { font-family: "Space Grotesk", Inter, sans-serif; font-size: 42px; font-weight: 700; margin: 0; }
    #view .cx.ld .ld-pill { display: inline-flex; align-items: center; gap: 4px; border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
    #view .cx.ld .ld-pill.hot { background: #fee2e2; color: #b91c1c; }
    #view .cx.ld .ld-pill.warm { background: #fef3c7; color: #b45309; }
    #view .cx.ld .ld-pill.qual { background: #dbeafe; color: #1d4ed8; }
    #view .cx.ld .ld-pill.cold { background: #f1f5f9; color: #64748b; }
    @media (max-width: 960px) { #view .cx.ld .ld-split { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(css);

  const SOURCES = ['Website Form', 'WhatsApp', 'Email Campaign', 'Referral', 'Cold Call', 'LinkedIn', 'Event'];
  let ldQuery = '';
  let ldOwner = '';
  let ldStatus = '';
  let ldSource = '';
  let ldSaved = 'open';
  let ldPick = '';
  let ldPanel = false;
  let ldMenu = '';
  let ldScore = null;
  let ldPack = null;
  let ldPackAt = 0;
  let ldFetching = false;
  function forgetScores() { ldPack = null; ldPackAt = 0; ldScore = null; }
  function loadScores() {
    if (ldFetching || (ldPack && Date.now() - ldPackAt < 12000)) return;
    ldFetching = true;
    api('/crm/api/lead-scores').then((data) => {
      ldPack = data && Array.isArray(data.rows) ? data : { rows: [], decided: 0 };
      ldPackAt = Date.now();
      ldFetching = false;
      if (page === 'leads') drawLeadTable();
    }).catch(() => { ldFetching = false; });
  }
  function scored(row) { return ((ldPack && ldPack.rows) || []).find((item) => item.id === row.id) || null; }
  function scoreNum(row) { const hit = scored(row); return hit ? hit.score : leadPoints(row); }

  function sourceMark(value) {
    const s = String(value || '').toLowerCase();
    if (/web|form|site/.test(s)) return 'Web';
    if (/whatsapp|wa\b/.test(s)) return 'WhatsApp';
    if (/mail|campaign/.test(s)) return 'Email';
    if (/refer|partner/.test(s)) return 'Referral';
    if (/cold|call/.test(s)) return 'Call';
    if (/linkedin/.test(s)) return 'LinkedIn';
    if (/event|fair|expo/.test(s)) return 'Event';
    return '';
  }
  function leadPoints(row) {
    const activities = (bag.activities || []).filter((item) => item.relatedId === row.id || (row.contactId && item.relatedId === row.contactId));
    let score = 50;
    const touches = activities.length;
    if (touches >= 5) score += 15;
    else if (touches >= 3) score += 10;
    else if (touches >= 1) score += 6;
    if (activities.filter((item) => String(item.status).startsWith('DONE') || String(item.status).startsWith('COMPLETED')).length >= 2) score += 8;
    if (activities.some((item) => item.status === 'PLANNED')) score += 4;
    if (row.email) score += 8;
    if (row.phone || row.mobile) score += 6;
    if (row.companyName) score += 4;
    const last = activities.map((item) => new Date(item.createdAt || 0).getTime()).sort((a, b) => b - a)[0];
    if (last) {
      const days = Math.floor((Date.now() - last) / 86400000);
      if (days <= 3) score += 8;
      else if (days <= 7) score += 4;
      else if (days > 90) score -= 18;
      else if (days > 30) score -= 8;
    }
    if (row.rating === 'HOT') score += 15;
    else if (row.rating === 'WARM') score += 7;
    else if (row.rating === 'COLD') score -= 8;
    const src = String(row.source || '').toLowerCase();
    if (/refer|partner|existing|repeat|word-of-mouth/.test(src)) score += 12;
    else if (/whatsapp|wa\b/.test(src)) score += (row.phone || row.mobile) ? 8 : -4;
    else if (/web|form|site/.test(src)) score += row.email ? 8 : -4;
    else if (/cold|ads|purchased|bought/.test(src)) score -= 5;
    const deal = (bag.deals || []).find((item) => item.leadId === row.id);
    if (deal) {
      if (Number(deal.amount || 0) >= 1000000) score += 10;
      else if (Number(deal.amount || 0) >= 100000) score += 6;
      if (/proposal|negotiation/i.test(deal.stage || '')) score += 8;
    }
    const age = Math.floor((Date.now() - new Date(row.createdAt || Date.now()).getTime()) / 86400000);
    if (!touches && age > 14) score -= 12;
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  function pill(score) {
    const band = score >= 90 ? ['hot', 'HOT'] : score >= 70 ? ['warm', 'WARM'] : score >= 50 ? ['qual', 'QUALIFIED'] : ['cold', 'COLD'];
    return `<span class="ld-pill ${band[0]}">${score} ${band[1]}</span>`;
  }
  function leadHay(row) {
    return [person(row), row.email, row.phone, row.mobile, row.companyName, row.source, row.city].join(' ');
  }

  window.setLd = function (key, value) {
    if (key === 'saved') ldSaved = value;
    if (key === 'menu') ldMenu = ldMenu === value ? '' : value;
    if (key === 'pick') { ldPick = value; ldPanel = true; ldScore = null; }
    if (key === 'panel') {
      ldPanel = !ldPanel;
      if (ldPanel && !ldPick) {
        const first = (bag.leads || []).find((row) => row.status !== 'CONVERTED' && row.status !== 'DEAD') || (bag.leads || [])[0];
        ldPick = first ? first.id : '';
        ldScore = null;
      }
    }
    if (key === 'query') {
      ldQuery = value;
      const box = document.querySelector('#view .cx-search');
      window.__ldCaret = box ? box.selectionStart : String(value).length;
    }
    drawLeadTable();
    if (key === 'query') {
      const box = document.querySelector('#view .cx-search');
      if (box) { box.focus(); const n = Math.min(window.__ldCaret || 0, box.value.length); box.setSelectionRange(n, n); }
    }
  };
  window.saveLeadField = async function (id, key, value) {
    const result = await api('/crm/api/leads/' + id, { method: 'PATCH', body: JSON.stringify({ [key]: value }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not save');
    forgetScores();
    refresh();
  };
  window.markLeadDead = async function (id) {
    const deadReason = window.prompt('Why is this lead dead?');
    if (!deadReason) return;
    const result = await api('/crm/api/leads/' + id, { method: 'PATCH', body: JSON.stringify({ status: 'DEAD', deadReason }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not update it');
    toast('Marked dead');
    forgetScores();
    refresh();
  };

  window.drawLeadTable = async function () {
    loadScores();
    const showForm = openForm === 'lead';
    if (showForm) openForm = '';
    const mine = me.sub || me.id;
    const q = ldQuery.trim();
    const headerQ = (document.getElementById('q') || {}).value || '';
    let rows = (bag.leads || []).filter((row) => smartMatch(headerQ, leadHay(row)) && smartMatch(q, leadHay(row)));
    if (ldSaved === 'mine') rows = rows.filter((row) => row.ownerId === mine);
    if (ldSaved === 'hot') rows = rows.filter((row) => scoreNum(row) >= 70);
    if (ldSaved === 'open') rows = rows.filter((row) => row.status !== 'CONVERTED' && row.status !== 'DEAD');
    if (ldOwner) rows = rows.filter((row) => row.ownerId === ldOwner);
    if (ldStatus) rows = rows.filter((row) => (row.status || 'NEW') === ldStatus);
    if (ldSource) rows = rows.filter((row) => sourceMark(row.source) === ldSource || row.source === ldSource);
    rows.sort((a, b) => q ? scoreNum(b) - scoreNum(a) : String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    const owners = (bag.people || []).map((row) => `<option value="${row.id}" ${ldOwner === row.id ? 'selected' : ''}>${esc(row.fullName || row.email)}</option>`).join('');
    const lines = rows.map((row) => {
      const score = scoreNum(row);
      const mark = sourceMark(row.source);
      const done = row.status === 'CONVERTED' || row.status === 'DEAD';
      return `<tr class="cx-row"><td><div class="cx-who" style="cursor:pointer" onclick="openRecord('lead','${row.id}')"><span class="cx-av" style="background:${avatarGradient(person(row))}">${esc(initials(person(row)))}</span><span><b class="cx-name">${esc(person(row))}</b><div class="cx-mail">${esc(row.companyName || row.status || '')}</div></span></div></td><td>${esc(row.email || '—')}</td><td>${esc(row.phone || row.mobile || '—')}</td><td>${mark ? `<span class="ld-pill cold">${esc(mark)}</span> ` : ''}${esc(row.source || '—')}</td><td><button type="button" class="cx-tool" onclick="setLd('pick','${row.id}')">${pill(score)}</button></td><td>${esc(ownerName(row.ownerId) || 'Unassigned')}</td><td>${esc(relativeTime(row.createdAt) || String(row.createdAt || '').slice(0, 10))}</td><td>${done ? esc(row.status) : `<button type="button" class="cx-go" onclick="convert('${row.id}')">Convert</button>`}</td><td class="cx-menu"><button type="button" class="cx-tool" onclick="setLd('menu','${row.id}')">⋮</button>${ldMenu === row.id ? `<div class="cx-pop"><button type="button" class="cx-tool" onclick="openRecord('lead','${row.id}')">Open</button><button type="button" class="cx-tool" onclick="setLd('pick','${row.id}')">Score</button>${done ? '' : `<button type="button" class="cx-tool" onclick="markLeadDead('${row.id}')">Mark dead</button>`}</div>` : ''}</td></tr>`;
    }).join('');
    const picked = (bag.leads || []).find((row) => row.id === ldPick);
    let panel = '';
    if (ldPanel && !picked) panel = '<aside class="ld-panel"><h2 style="margin:0;font-size:16px">Score</h2><p class="cx-muted">Add a lead, then open its score.</p></aside>';
    if (ldPanel && picked) {
      const official = scored(picked);
      const shown = official ? official.score : scoreNum(picked);
      const reasons = official ? (official.points || []).map((line) => `<li>${esc(line.label)} <b>${line.points > 0 ? '+' : ''}${line.points}</b></li>`).join('') : '<li>Scoring this workspace…</li>';
      const concerns = '';
      const sourceOptions = SOURCES.map((name) => `<option ${picked.source === name ? 'selected' : ''}>${name}</option>`).join('');
      const custom = picked.source && !SOURCES.includes(picked.source) ? `<option selected>${esc(picked.source)}</option>` : '';
      panel = `<aside class="ld-panel"><div class="cx-head"><h2 style="margin:0;font-size:16px">Score</h2><button type="button" class="cx-tool" onclick="setLd('panel')">Close</button></div><p class="ld-num">${shown}</p>${pill(shown)}<p class="cx-muted">${esc(person(picked))}${picked.companyName ? ' · ' + esc(picked.companyName) : ''}</p>${official ? `<p>${esc(official.nextAction || '')}</p><p class="cx-muted">Confidence ${official.confidence || 0}. ${official.sourceDecided ? 'This source has ' + official.sourceDecided + ' decided lead' + (official.sourceDecided === 1 ? '' : 's') + ' here, win rate ' + official.sourceRate + '%.' : 'No decided lead for this source yet.'}</p>` : ''}<h3 style="font-size:13px">How it adds up</h3><ul>${reasons || '<li>No signal yet.</li>'}</ul>${concerns ? `<h3 style="font-size:13px">Concerns</h3><ul>${concerns}</ul>` : ''}<p class="cx-muted">The number is a sum, not a guess. It starts at 22, then adds email, phone, company, recency, and the rating. The source term learns: with no wins or losses it uses a prior (referral 45%, WhatsApp 28%, website 22%, cold call 10%). Each converted or dead lead in this workspace moves that source.</p><label>Rating<select onchange="saveLeadField('${picked.id}','rating',this.value)"><option ${picked.rating==='HOT'?'selected':''}>HOT</option><option ${picked.rating==='WARM'?'selected':''}>WARM</option><option ${picked.rating==='COLD'?'selected':''}>COLD</option></select></label><label>Source<select onchange="saveLeadField('${picked.id}','source',this.value)">${custom}${sourceOptions}</select></label></aside>`;
    }
    const views = [['open', 'Open leads'], ['all', 'All leads'], ['mine', 'My leads'], ['hot', 'Hot']];
    const form = `<div class="drawer dealbox" id="leadForm" ${showForm ? '' : 'hidden'} onclick="if(event.target.id==='leadForm')this.hidden=true"><aside><div class="sheethead"><h2>Create lead</h2><button type="button" class="ghost" onclick="document.getElementById('leadForm').hidden=true">Close</button></div><div class="dealform"><label>First name<input id="lFirst"></label><label>Last name<input id="lLast"></label><label>Company<input id="lCompany"></label><label>Phone<input id="lPhone"></label><label>Email<input id="lEmail"></label><label>Source<select id="lSource">${SOURCES.map((name) => `<option>${name}</option>`).join('')}</select></label><label>Rating<select id="lRating"><option>WARM</option><option>HOT</option><option>COLD</option></select></label><label>Owner<select id="lOwner"><option value="">Me</option>${ownerOptions()}</select></label></div><div class="dealactions"><button type="button" onclick="saveLead()">Save lead</button></div></aside></div>`;
    document.getElementById('view').innerHTML = `<div class="cx ld">
      <div class="cx-head"><div><h1>Leads</h1><div class="cx-muted">Unqualified prospects. Convert turns one into a contact, a deal, and a follow-up.</div></div><div><button type="button" class="cx-tool" onclick="setLd('panel')">Scoring</button> <button type="button" class="cx-go" onclick="document.getElementById('leadForm').hidden=false">+ Create lead</button></div></div>
      <div class="cx-bar"><div class="cx-left"><input class="cx-search" placeholder="Search leads..." value="${esc(q)}" oninput="setLd('query', this.value)"><select onchange="ldOwner=this.value;drawLeadTable()"><option value="">Owner</option>${owners}</select><select onchange="ldStatus=this.value;drawLeadTable()"><option value="">Status</option>${['NEW','WORKING','QUALIFIED','CONVERTED','DEAD'].map((name) => `<option ${ldStatus===name?'selected':''}>${name}</option>`).join('')}</select><select onchange="ldSource=this.value;drawLeadTable()"><option value="">Source</option>${SOURCES.map((name) => `<option ${ldSource===name?'selected':''}>${name}</option>`).join('')}</select></div></div>
      <div class="cx-views">${views.map(([id, label]) => `<button type="button" class="cx-tab ${ldSaved===id?'on':''}" onclick="setLd('saved','${id}')">${label}</button>`).join('')}</div>
      <div class="ld-split ${panel ? '' : 'solo'}"><div><table class="cx-table"><tr><th>Lead</th><th>Email</th><th>Phone</th><th>Source</th><th>Score</th><th>Owner</th><th>Created</th><th></th><th></th></tr>${lines || '<tr><td colspan="9"><div class="cx-muted" style="padding:16px">No lead in this view.</div></td></tr>'}</table><div class="cx-muted" style="margin-top:8px">${rows.length} lead${rows.length===1?'':'s'}</div></div>${panel}</div>${form}</div>`;
  };

  drawLeads = function () { drawLeadTable(); };
  if (typeof convert === 'function' && !convert.__scored) {
    const prevConvert = convert;
    convert = async function (id) { forgetScores(); return prevConvert(id); };
    convert.__scored = true;
  }
  if (typeof saveLead === 'function' && !saveLead.__scored) {
    const prevSave = saveLead;
    saveLead = async function () { forgetScores(); return prevSave(); };
    saveLead.__scored = true;
  }
})();

(function () {
  const css = document.createElement('style');
  css.textContent = `
    #view .cx.tk .tk-banner { display: flex; justify-content: space-between; gap: 12px; align-items: center; background: rgba(59,130,246,.1); border-left: 3px solid #3b82f6; border-radius: 8px; padding: 12px 14px; margin-bottom: 12px; }
    #view .cx.tk .tk-pills { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
    #view .cx.tk .tk-pill { background: #f1f5f9; border-radius: 999px; padding: 4px 10px; font-size: 12px; }
    #view .cx.tk .st { border-radius: 999px; padding: 2px 8px; font-size: 12px; font-weight: 700; }
    #view .cx.tk .st.open { background: #f1f5f9; color: #475569; }
    #view .cx.tk .st.run { background: #dbeafe; color: #1d4ed8; }
    #view .cx.tk .st.done { background: #dcfce7; color: #15803d; }
    #view .cx.tk .st.late { background: #fee2e2; color: #b91c1c; }
    #view .cx.tk .pri.urgent { color: #b91c1c; font-weight: 700; }
    #view .cx.tk .pri.high { color: #b45309; font-weight: 700; }
    #view .cx.tk .tk-foot { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e8eb; }
    #view .cx.tk .tk-start { position: relative; }
    #view .cx.tk .tk-tip { display: none; position: absolute; right: 0; top: 38px; width: 240px; background: #0f172a; color: #fff; border-radius: 8px; padding: 10px 12px; font-size: 12px; z-index: 5; }
    #view .cx.tk .tk-start:hover .tk-tip, #view .cx.tk .tk-start:focus-within .tk-tip { display: block; }
  `;
  document.head.appendChild(css);

  const TYPES = [['TASK', 'To-do'], ['CALL', 'Call'], ['EMAIL', 'Email'], ['MEETING', 'Meeting'], ['WHATSAPP', 'WhatsApp']];
  let tkMode = 'list';
  let tkQuery = '';
  let tkMine = false;
  let tkOwner = '';
  let tkType = '';
  let tkStatus = '';
  let tkDue = '';
  let tkSort = 'due';
  let tkSaved = 'all';
  let tkMenu = '';
  let tkCols = true;
  let tkExtra = [];
  const tkShow = { type: 1, contact: 1, due: 1, status: 1, priority: 1, owner: 1 };
  try { tkExtra = JSON.parse(localStorage.getItem('crm-task-views') || '[]'); } catch (e) { tkExtra = []; }

  function dueOf(row) { return String(row.dueAt || '').slice(0, 10); }
  function isDone(row) { return row.status === 'HELD' || row.status === 'DONE' || row.status === 'COMPLETED'; }
  function isOpen(row) { return !isDone(row); }
  function stateOf(row) {
    if (isDone(row)) return ['done', 'Done'];
    const due = dueOf(row);
    const today = new Date().toISOString().slice(0, 10);
    if (due && due < today) return ['late', 'Overdue'];
    if (row.status === 'IN_PROGRESS') return ['run', 'In progress'];
    return ['open', 'Open'];
  }
  function typeLabel(type) { return (TYPES.find((row) => row[0] === type) || [type, type || 'To-do'])[1]; }
  function priClass(value) { return value === 'URGENT' ? 'urgent' : value === 'HIGH' ? 'high' : ''; }
  function priLabel(value) { return value === 'URGENT' ? 'Urgent' : value === 'HIGH' ? 'High' : value === 'LOW' ? 'Low' : 'Normal'; }
  function taskWho(row) {
    if (row.relatedType === 'company') { const name = companyName(row.relatedId); return name ? { type: 'company', id: row.relatedId, name } : null; }
    const name = relatedName(row);
    return name ? { type: row.relatedType, id: row.relatedId, name } : null;
  }
  function taskHay(row) {
    const who = taskWho(row);
    return [row.subject, row.notes, row.type, who && who.name, ownerName(row.ownerId)].join(' ');
  }

  window.setTk = function (key, value) {
    if (key === 'mode') tkMode = value;
    if (key === 'saved') tkSaved = value;
    if (key === 'menu') tkMenu = tkMenu === value ? '' : value;
    if (key === 'cols') tkCols = !tkCols;
    if (key === 'col') tkShow[value] = tkShow[value] ? 0 : 1;
    if (key === 'mine') tkMine = !tkMine;
    if (key === 'query') {
      tkQuery = value;
      const box = document.querySelector('#view .cx-search');
      window.__tkCaret = box ? box.selectionStart : String(value).length;
    }
    drawTaskBoard();
    if (key === 'query') {
      const box = document.querySelector('#view .cx-search');
      if (box) { box.focus(); const n = Math.min(window.__tkCaret || 0, box.value.length); box.setSelectionRange(n, n); }
    }
  };
  window.addTaskView = function () {
    const name = window.prompt('Name this view. It keeps tasks whose subject contains the word.');
    if (!name) return;
    tkExtra.push(name.trim());
    localStorage.setItem('crm-task-views', JSON.stringify(tkExtra));
    tkSaved = 'word:' + name.trim();
    drawTaskBoard();
  };
  window.setTaskStatus = async function (id, status) {
    const result = await api('/crm/api/activities/' + id, { method: 'PATCH', body: JSON.stringify({ status }) });
    if (!result || result.error) return toast((result && result.error) || 'Could not update it');
    refresh();
  };
  window.dropTask = function (event, status) {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    if (id) setTaskStatus(id, status);
  };

  window.drawTaskBoard = function () {
    const showForm = openForm === 'task';
    if (showForm) openForm = '';
    const today = new Date().toISOString().slice(0, 10);
    const mine = me.sub || me.id;
    const q = tkQuery.trim();
    const headerQ = (document.getElementById('q') || {}).value || '';
    const pool = (bag.activities || []).filter((row) => TYPES.some((item) => item[0] === row.type));
    let rows = pool.filter((row) => smartMatch(headerQ, taskHay(row)) && smartMatch(q, taskHay(row)));
    if (tkSaved === 'today') rows = rows.filter((row) => isOpen(row) && dueOf(row) === today);
    if (tkSaved === 'overdue') rows = rows.filter((row) => isOpen(row) && dueOf(row) && dueOf(row) < today);
    if (tkSaved === 'upcoming') rows = rows.filter((row) => isOpen(row) && dueOf(row) > today);
    if (tkSaved.indexOf('word:') === 0) {
      const word = tkSaved.slice(5).toLowerCase();
      rows = rows.filter((row) => String(row.subject || '').toLowerCase().includes(word));
    }
    if (tkMine) rows = rows.filter((row) => row.ownerId === mine);
    if (tkOwner) rows = rows.filter((row) => row.ownerId === tkOwner);
    if (tkType) rows = rows.filter((row) => row.type === tkType);
    if (tkStatus === 'open') rows = rows.filter((row) => stateOf(row)[0] === 'open');
    if (tkStatus === 'run') rows = rows.filter((row) => row.status === 'IN_PROGRESS');
    if (tkStatus === 'done') rows = rows.filter((row) => isDone(row));
    if (tkStatus === 'late') rows = rows.filter((row) => stateOf(row)[0] === 'late');
    if (tkDue) rows = rows.filter((row) => dueOf(row) && dueOf(row) <= tkDue);
    rows.sort((a, b) => tkSort === 'name' ? String(a.subject || '').localeCompare(String(b.subject || '')) : tkSort === 'priority' ? priLabel(a.priority).localeCompare(priLabel(b.priority)) : dueOf(a).localeCompare(dueOf(b)));
    const counts = {
      today: pool.filter((row) => isOpen(row) && dueOf(row) === today).length,
      overdue: pool.filter((row) => isOpen(row) && dueOf(row) && dueOf(row) < today).length,
    };
    const owners = (bag.people || []).map((row) => `<option value="${row.id}" ${tkOwner === row.id ? 'selected' : ''}>${esc(row.fullName || row.email)}</option>`).join('');
    const filtersOn = [tkMine, tkOwner, tkType, tkStatus, tkDue].filter(Boolean).length;
    const pills = [
      tkMine ? '<span class="tk-pill">Assigned to: me <button type="button" class="cx-tool" onclick="setTk(\'mine\')">×</button></span>' : '',
      tkType ? `<span class="tk-pill">${esc(typeLabel(tkType))} <button type="button" class="cx-tool" onclick="tkType='';drawTaskBoard()">×</button></span>` : '',
      tkStatus ? `<span class="tk-pill">${esc(tkStatus)} <button type="button" class="cx-tool" onclick="tkStatus='';drawTaskBoard()">×</button></span>` : '',
      tkDue ? `<span class="tk-pill">Due by ${esc(tkDue)} <button type="button" class="cx-tool" onclick="tkDue='';drawTaskBoard()">×</button></span>` : '',
    ].filter(Boolean).join('');
    let body = '';
    if (tkMode === 'board') {
      const cols = [['open', 'Open', 'PLANNED'], ['run', 'In progress', 'IN_PROGRESS'], ['late', 'Overdue', ''], ['done', 'Done', 'HELD']];
      body = `<div class="dl-board">${cols.map(([id, label, status]) => {
        const list = rows.filter((row) => stateOf(row)[0] === id);
        const cards = list.map((row) => `<article class="cx-card" draggable="${status ? 'true' : 'false'}" ondragstart="event.dataTransfer.setData('text/plain','${row.id}')" onclick="openTask('${row.relatedType || ''}','${row.relatedId || ''}')"><b>${esc(row.subject)}</b><div class="cx-muted">${esc(typeLabel(row.type))} · ${esc(dueOf(row) || 'No date')}</div><span class="st ${stateOf(row)[0]}">${stateOf(row)[1]}</span></article>`).join('') || '<div class="cx-muted">None</div>';
        const drop = status ? `ondragover="event.preventDefault()" ondrop="dropTask(event,'${status}')"` : '';
        return `<div class="cx-col" ${drop}><b>${label} · ${list.length}</b>${cards}</div>`;
      }).join('')}</div>`;
    } else {
      const th = (key, label) => tkShow[key] ? `<th>${label}</th>` : '';
      const td = (key, html) => tkShow[key] ? `<td>${html}</td>` : '';
      const lines = rows.map((row) => {
        const who = taskWho(row);
        const st = stateOf(row);
        const late = st[0] === 'late';
        return `<tr class="cx-row"><td><input type="checkbox" data-pick="task" value="${row.id}"></td><td><b class="cx-name" style="cursor:pointer" onclick="openTask('${row.relatedType || ''}','${row.relatedId || ''}')">${esc(row.subject)}</b></td>${td('type', esc(typeLabel(row.type)))}${td('contact', who ? `<button type="button" class="cx-link" onclick="openRecord('${who.type}','${who.id}')">${esc(who.name)}</button>` : '—')}${td('due', `<span class="${late ? 'st late' : ''}">${esc(dueOf(row) || '—')}</span>`)}${td('status', `<span class="st ${st[0]}">${st[1]}</span>`)}${td('priority', `<span class="pri ${priClass(row.priority)}">${esc(priLabel(row.priority))}</span>`)}${td('owner', esc(ownerName(row.ownerId) || 'Unassigned'))}<td class="cx-menu"><button type="button" class="cx-tool" onclick="setTk('menu','${row.id}')">⋮</button>${tkMenu === row.id ? `<div class="cx-pop"><button type="button" class="cx-tool" onclick="setTaskStatus('${row.id}','IN_PROGRESS')">In progress</button><button type="button" class="cx-tool" onclick="setTaskStatus('${row.id}','HELD')">Done</button><button type="button" class="cx-tool" onclick="snooze('${row.id}')">Due tomorrow</button></div>` : ''}</td></tr>`;
      }).join('');
      body = `<table class="cx-table"><tr><th></th><th>Task</th>${th('type','Type')}${th('contact','Contact')}${th('due','Due date')}${th('status','Status')}${th('priority','Priority')}${th('owner','Owner')}<th></th></tr>${lines || '<tr><td colspan="8"><div class="cx-muted" style="padding:16px">No task in this view.</div></td></tr>'}</table>`;
    }
    const views = [['all', 'All tasks'], ['today', 'Due today (' + counts.today + ')'], ['overdue', 'Overdue (' + counts.overdue + ')'], ['upcoming', 'Upcoming']].concat(tkExtra.map((name) => ['word:' + name, name]));
    const banner = calBanner ? `<div class="tk-banner"><div>Want these tasks next to a calendar you already use? Connect Google Calendar under Integrations. Afri reads the next events. It does not write these tasks onto that calendar.</div><button type="button" class="cx-tool" onclick="hideCal()">×</button></div>` : '';
    const form = `<div class="drawer dealbox" id="taskForm" ${showForm ? '' : 'hidden'} onclick="if(event.target.id==='taskForm')this.hidden=true"><aside><div class="sheethead"><h2>Add task</h2><button type="button" class="ghost" onclick="document.getElementById('taskForm').hidden=true">Close</button></div><div class="dealform"><label>Subject<input id="tSubject"></label><label>Type<select id="tType">${TYPES.map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select></label><label>Due<input id="tDue" type="date"></label><label>Priority<select id="tPriority"><option value="URGENT">Urgent</option><option value="HIGH">High</option><option value="NORMAL" selected>Normal</option><option value="LOW">Low</option></select></label><label>Assigned to<select id="tOwner"><option value="">Me</option>${ownerOptions()}</select></label><label>Contact<select id="tWho"><option value="">None</option>${(bag.contacts||[]).map((row)=>`<option value="${row.id}">${esc(person(row))}</option>`).join('')}</select></label><label>Deal<select id="tDeal"><option value="">None</option>${(bag.deals||[]).map((row)=>`<option value="${row.id}">${esc(row.name)}</option>`).join('')}</select></label></div><div class="dealactions"><button type="button" onclick="saveTask()">Create</button></div></aside></div>`;
    document.getElementById('view').innerHTML = `<div class="cx tk">${banner}
      <div class="cx-head"><h1>Tasks</h1><button type="button" class="cx-go" onclick="document.getElementById('taskForm').hidden=false">+ Add task</button></div>
      <div class="cx-views">${views.map(([id, label]) => `<button type="button" class="cx-tab ${tkSaved===id?'on':''}" onclick="setTk('saved','${id}')">${esc(label)}</button>`).join('')}<button type="button" class="cx-tab" onclick="addTaskView()">+ view</button></div>
      <div class="cx-bar"><div class="cx-left"><input class="cx-search" placeholder="Search tasks  /" value="${esc(q)}" oninput="setTk('query', this.value)"><button type="button" class="cx-tool" onclick="setTk('mine')">Assigned to me${tkMine ? ' · on' : ''}</button><select onchange="tkOwner=this.value;drawTaskBoard()"><option value="">Owner</option>${owners}</select><select onchange="tkType=this.value;drawTaskBoard()"><option value="">Type</option>${TYPES.map(([id, label]) => `<option value="${id}" ${tkType===id?'selected':''}>${label}</option>`).join('')}</select><select onchange="tkStatus=this.value;drawTaskBoard()"><option value="">Status</option><option value="open" ${tkStatus==='open'?'selected':''}>Open</option><option value="run" ${tkStatus==='run'?'selected':''}>In progress</option><option value="late" ${tkStatus==='late'?'selected':''}>Overdue</option><option value="done" ${tkStatus==='done'?'selected':''}>Done</option></select><input type="date" value="${tkDue}" title="Due on or before" onchange="tkDue=this.value;drawTaskBoard()"></div><div class="cx-right"><select onchange="tkSort=this.value;drawTaskBoard()"><option value="due" ${tkSort==='due'?'selected':''}>Sort by due date</option><option value="name" ${tkSort==='name'?'selected':''}>Sort by name</option><option value="priority" ${tkSort==='priority'?'selected':''}>Sort by priority</option></select><button type="button" class="cx-tool ${tkMode==='board'?'on':''}" onclick="setTk('mode','board')">Board</button><button type="button" class="cx-tool ${tkMode==='list'?'on':''}" onclick="setTk('mode','list')">List</button><span class="tk-start"><button type="button" class="cx-tool" onclick="go('player')">Start tasks</button><span class="tk-tip">Start all tasks walks overdue and due-today work, one at a time. Done and Tomorrow are saved on the task.</span></span><button type="button" class="cx-tool" onclick="setTk('cols')">Columns${filtersOn ? '' : ''}</button></div></div>
      ${tkCols ? '' : `<div class="cx-panel">${Object.keys(tkShow).map((key) => `<label style="margin-right:10px"><input type="checkbox" ${tkShow[key]?'checked':''} onchange="setTk('col','${key}')"> ${key}</label>`).join('')}</div>`}
      ${pills ? `<div class="tk-pills">${pills}</div>` : ''}
      ${body}
      <div class="tk-foot"><span>${rows.length} task${rows.length===1?'':'s'}</span><span><button type="button" class="cx-tool" onclick="refresh()">Refresh</button> <button type="button" class="cx-tool" onclick="exportTasks()">Export</button></span></div>
      ${form}</div>`;
  };
  drawTasks = function () { drawTaskBoard(); };
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || page !== 'tasks' || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target && event.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    event.preventDefault();
    const box = document.querySelector('#view .cx-search');
    if (box) box.focus();
  });
})();

(function () {
  const css = document.createElement('style');
  css.textContent = `
    #view .calx { display: grid; grid-template-columns: 240px minmax(0, 1fr); gap: 16px; align-items: start; }
    #view .cal-side, #view .cal-card { background: #fff; border: 1px solid #e5e8eb; border-radius: 12px; padding: 12px; }
    #view .cal-mini { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
    #view .cal-mini button, #view .cal-mini span { height: 26px; border: 0; background: transparent; border-radius: 6px; font-size: 12px; }
    #view .cal-mini button.on { background: #0d9488; color: #fff; }
    #view .cal-mini button.has { box-shadow: inset 0 -2px 0 #0d9488; }
    #view .cal-src { display: flex; justify-content: space-between; gap: 8px; padding: 8px 0; border-top: 1px solid #eef2f6; font-size: 13px; }
    #view .cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
    #view .cal-cell { min-height: 92px; text-align: left; background: #fff; border: 1px solid #e5e8eb; border-radius: 8px; padding: 6px; }
    #view .cal-cell.today { border-color: #0d9488; }
    #view .cal-cell.on { outline: 2px solid #0d9488; }
    #view .ev { display: block; width: 100%; text-align: left; border: 0; border-radius: 999px; padding: 2px 8px; margin-top: 4px; font-size: 11px; cursor: pointer; }
    #view .ev.meet { background: #dbeafe; color: #1d4ed8; }
    #view .ev.call { background: #dcfce7; color: #15803d; }
    #view .ev.task { background: #fef3c7; color: #b45309; }
    #view .ev.seq { background: #f3e8ff; color: #7e22ce; }
    #view .ev.late { background: #fee2e2; color: #b91c1c; }
    #view .ev.gcal { background: #e0f2fe; color: #0369a1; }
    #view .cal-week { display: grid; grid-template-columns: 52px repeat(7, minmax(0, 1fr)); }
    #view .cal-week div, #view .cal-dayrow { border-top: 1px solid #eef2f6; min-height: 36px; padding: 2px; font-size: 11px; }
    #view .cal-head { font-size: 12px; font-weight: 700; color: #64748b; padding: 6px; }
    @media (max-width: 900px) { #view .calx { grid-template-columns: 1fr; } }
  `;
  document.head.appendChild(css);

  let calView = 'month';
  let calNew = false;
  let calOpen = '';
  let calKey = '';
  let calBusy = '';
  let calExt = { events: [], sources: [] };

  function pad(n) { return String(n).padStart(2, '0'); }
  function keyOf(date) { return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()); }
  function parseKey(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
  function addDays(date, n) { return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n); }
  function weekStart(date) { return addDays(date, -((date.getDay() + 6) % 7)); }
  function todayKey() { return new Date().toISOString().slice(0, 10); }
  function localItems() { return (bag.activities || []).filter((row) => row.dueAt); }
  function isSeq(row) { return /Opened by the flow/i.test(row.notes || ''); }
  function openTask(row) { return row.status === 'PLANNED' || row.status === 'IN_PROGRESS'; }
  function kindOf(row) {
    const due = String(row.dueAt).slice(0, 10);
    if (openTask(row) && due && due < todayKey()) return ['late', 'Overdue'];
    if (isSeq(row)) return ['seq', 'Sequence'];
    if (row.type === 'MEETING') return ['meet', 'Meeting'];
    if (row.type === 'CALL') return ['call', 'Call'];
    return ['task', 'Task'];
  }
  function onDay(key) {
    const own = localItems().filter((row) => String(row.dueAt).slice(0, 10) === key).map((row) => ({ id: row.id, title: row.subject, when: row.dueAt, kind: kindOf(row), row }));
    const ext = (calExt.events || []).filter((row) => String(row.when || '').slice(0, 10) === key).map((row, index) => ({ id: 'ext-' + key + '-' + index, title: row.title || 'Busy', when: row.when, kind: ['gcal', row.source === 'outlook' ? 'Outlook' : 'Google'], row: null }));
    return own.concat(ext);
  }
  function range() {
    if (calView === 'week') { const a = weekStart(calCursor); return [a, addDays(a, 6)]; }
    if (calView === 'day') { const a = new Date(calCursor.getFullYear(), calCursor.getMonth(), calCursor.getDate()); return [a, a]; }
    const a = new Date(calCursor.getFullYear(), calCursor.getMonth(), 1);
    return [a, new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 0)];
  }
  function wantRange() {
    const [a, b] = range();
    const key = keyOf(a) + ':' + keyOf(b);
    if (calKey === key || calBusy === key) return;
    calBusy = key;
    api('/crm/api/day?from=' + keyOf(a) + '&to=' + keyOf(b)).then((data) => {
      calBusy = '';
      calKey = key;
      calExt = data || { events: [], sources: [] };
      if (page === 'calendar') drawCalPage();
    }).catch(() => { calBusy = ''; });
  }
  function title() {
    if (calView === 'day') return calCursor.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (calView === 'week') { const a = weekStart(calCursor); const b = addDays(a, 6); return a.getDate() + '–' + b.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
    return calCursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
  function pill(item) { return `<button type="button" class="ev ${item.kind[0]}" onclick="openCalEvent('${item.id}', event)">${esc(item.title)}</button>`; }

  window.setCalView = function (view) { calView = view; calOpen = ''; drawCalPage(); };
  window.moveCal = function (step) {
    if (calView === 'month' || calView === 'agenda') calCursor = new Date(calCursor.getFullYear(), calCursor.getMonth() + step, 1);
    else if (calView === 'week') calCursor = addDays(calCursor, step * 7);
    else calCursor = addDays(calCursor, step);
    calOpen = '';
    drawCalPage();
  };
  window.todayCal = function () { calCursor = new Date(); calPick = todayKey(); calOpen = ''; drawCalPage(); };
  window.pickCalDay = function (key) {
    calPick = key;
    calNew = true;
    calOpen = '';
    const date = parseKey(key);
    if (calView !== 'month' && calView !== 'agenda') calCursor = date;
    drawCalPage();
  };
  window.openCalEvent = function (id, event) {
    if (event) event.stopPropagation();
    calOpen = id;
    calNew = false;
    drawCalPage();
  };
  shiftMonth = function (step) { moveCal(step); };

  window.drawCalPage = function () {
    wantRange();
    const today = todayKey();
    const [from, to] = range();
    const monthStart = new Date(calCursor.getFullYear(), calCursor.getMonth(), 1);
    const miniPad = (monthStart.getDay() + 6) % 7;
    const miniCount = new Date(calCursor.getFullYear(), calCursor.getMonth() + 1, 0).getDate();
    const mini = Array(miniPad).fill('').concat(Array.from({ length: miniCount }, (_, i) => i + 1));
    const miniHtml = ['M','T','W','T','F','S','S'].map((n) => `<span class="cal-head">${n}</span>`).join('') + mini.map((day) => {
      if (!day) return '<span></span>';
      const key = keyOf(new Date(calCursor.getFullYear(), calCursor.getMonth(), day));
      const has = onDay(key).length ? ' has' : '';
      return `<button type="button" class="${calPick === key ? 'on' : ''}${has}" onclick="pickCalDay('${key}')">${day}</button>`;
    }).join('');
    const sources = (calExt.sources || [{ id: 'afri', name: 'Afri CRM', on: true, live: true }, { id: 'google', name: 'Google Calendar', on: false }, { id: 'outlook', name: 'Outlook', on: false }]);
    const srcHtml = sources.map((row) => `<div class="cal-src"><span>${esc(row.name)}${row.email ? '<div class="cx-muted">' + esc(row.email) + '</div>' : ''}</span><b>${row.on ? (row.live ? 'Connected' : 'Not answering') : 'Not connected'}</b></div>`).join('');
    let grid = '';
    if (calView === 'month') {
      const padN = (monthStart.getDay() + 6) % 7;
      const cells = Array(padN).fill('').concat(Array.from({ length: miniCount }, (_, i) => i + 1));
      while (cells.length % 7) cells.push('');
      grid = `<div class="cal-grid">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((n) => `<div class="cal-head">${n}</div>`).join('')}${cells.map((day) => {
        if (!day) return '<div></div>';
        const key = keyOf(new Date(calCursor.getFullYear(), calCursor.getMonth(), day));
        const list = onDay(key);
        return `<button type="button" class="cal-cell ${key === today ? 'today' : ''} ${calPick === key ? 'on' : ''}" onclick="pickCalDay('${key}')"><b>${day}</b>${list.slice(0, 3).map(pill).join('')}${list.length > 3 ? `<div class="cx-muted">+${list.length - 3}</div>` : ''}</button>`;
      }).join('')}</div>`;
    } else if (calView === 'agenda') {
      const days = [];
      for (let d = new Date(from); d <= to; d = addDays(d, 1)) days.push(keyOf(d));
      grid = days.map((key) => {
        const list = onDay(key);
        if (!list.length) return '';
        return `<div class="cal-card" style="margin-bottom:8px"><b>${esc(key)}</b>${list.map((item) => `<div>${pill(item)} <span class="cx-muted">${esc(item.kind[1])}</span></div>`).join('')}</div>`;
      }).join('') || '<div class="cal-card">Nothing scheduled in this month.</div>';
    } else {
      const days = calView === 'day' ? [keyOf(new Date(calCursor.getFullYear(), calCursor.getMonth(), calCursor.getDate()))] : Array.from({ length: 7 }, (_, i) => keyOf(addDays(weekStart(calCursor), i)));
      const hours = Array.from({ length: 11 }, (_, i) => i + 8);
      const head = `<div class="cal-head"></div>` + days.map((key) => `<div class="cal-head">${esc(key.slice(8))} ${esc(parseKey(key).toLocaleDateString('en-GB', { weekday: 'short' }))}</div>`).join('');
      const all = `<div class="cal-head">All day</div>` + days.map((key) => `<div>${onDay(key).filter((item) => !String(item.when).includes('T')).map(pill).join('')}</div>`).join('');
      const rows = hours.map((hour) => `<div class="cal-head">${hour}:00</div>` + days.map((key) => {
        const list = onDay(key).filter((item) => { const m = String(item.when).match(/T(\d{2})/); return m && Number(m[1]) === hour; });
        return `<div>${list.map(pill).join('')}</div>`;
      }).join('')).join('');
      grid = `<div class="cal-week">${head}${all}${rows}</div>`;
    }
    const picked = [];
    const walk = (date) => onDay(keyOf(date)).forEach((item) => picked.push(item));
    for (let d = new Date(from); d <= to; d = addDays(d, 1)) walk(d);
    const open = picked.find((item) => item.id === calOpen);
    let panel = '';
    if (open) {
      const who = open.row ? relatedName(open.row) : '';
      panel = `<div class="cal-card" style="margin-bottom:12px"><div class="cx-head"><div><b>${esc(open.title)}</b><div class="cx-muted">${esc(open.kind[1])} · ${esc(String(open.when || '').replace('T', ' ').slice(0, 16))}</div></div><button type="button" class="cx-tool" onclick="calOpen='';drawCalPage()">Close</button></div>${who ? `<button type="button" class="cx-link" onclick="openRecord('${open.row.relatedType}','${open.row.relatedId}')">${esc(who)}</button>` : ''}${open.row ? '' : '<p class="cx-muted">This came from the connected calendar. Afri does not change it here.</p>'}</div>`;
    } else if (calNew && calPick) {
      panel = `<div class="cal-card" style="margin-bottom:12px"><div class="cx-head"><b>New event · ${esc(calPick)}</b><button type="button" class="cx-tool" onclick="calNew=false;drawCalPage()">Close</button></div><label>What<input id="calWhat"></label><label>Kind<select id="calKind"><option value="MEETING">Meeting</option><option value="CALL">Call</option><option value="TASK">Task</option></select></label><label>Contact<select id="calWho"><option value="">None</option>${(bag.contacts || []).map((row) => `<option value="${row.id}">${esc(person(row))}</option>`).join('')}</select></label><button type="button" class="cx-go" onclick="saveCal()">Put it on this day</button></div>`;
    }
    const views = [['month', 'Month'], ['week', 'Week'], ['day', 'Day'], ['agenda', 'Agenda']];
    document.getElementById('view').innerHTML = `<div class="calx">
      <aside class="cal-side"><div class="cx-head"><b>${esc(calCursor.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }))}</b></div><div class="cal-mini">${miniHtml}</div><h2 style="font-size:13px;margin:16px 0 4px">My calendars</h2>${srcHtml}<p class="cx-muted">Afri CRM is this workspace. Google or Outlook shows here only after it is connected under Integrations. There is no separate team calendar.</p></aside>
      <div><div class="cx-head"><h1 style="margin:0">${esc(title())}</h1><div><button type="button" class="cx-tool" onclick="moveCal(-1)">‹</button> <button type="button" class="cx-tool" onclick="todayCal()">Today</button> <button type="button" class="cx-tool" onclick="moveCal(1)">›</button> ${views.map(([id, label]) => `<button type="button" class="cx-tool ${calView===id?'on':''}" onclick="setCalView('${id}')">${label}</button>`).join(' ')}</div></div>${panel}${grid}</div>
    </div>`;
  };
  drawCalendar = function () { drawCalPage(); };
})();
