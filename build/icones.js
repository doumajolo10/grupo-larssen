// Ícones desenhados (traço 2px, 24x24) usados no site.
const I = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
module.exports = {
  seta: I('<path d="M4 12h15M13 6l6 6-6 6"/>'),
  setaB: I('<path d="M6 9l6 6 6-6"/>'),
  menu: I('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  romaneio: I('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
  mais: I('<path d="M12 5v14M5 12h14"/>'),
  check: I('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  tel: I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>'),
  email: I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  pino: I('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  busca: I('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>'),
  insta: I('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6" fill="currentColor"/>'),
  face: I('<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>'),
  zap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.2A9.7 9.7 0 0 0 3.7 16.9L2.3 21.7l4.9-1.3A9.7 9.7 0 1 0 12 2.2zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 19.9zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11 11 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2l-.5-.4z"/></svg>',
  caminhao: '<svg viewBox="0 0 30 46" aria-hidden="true"><rect x="5" y="2" width="20" height="13" rx="3" fill="#b8231b"/><rect x="7" y="4" width="16" height="5" rx="1.5" fill="#26343d"/><rect x="4" y="16" width="22" height="28" rx="2" fill="#d6a56a"/><path d="M4 23h22M4 30h22M4 37h22" stroke="#9c7a4a" stroke-width="1.5"/></svg>',
  caminhaoLado: '<svg viewBox="0 0 76 36" aria-hidden="true"><rect x="2" y="8" width="50" height="18" rx="2" fill="#d6a56a"/><path d="M14 8v18M26 8v18M38 8v18" stroke="#9c7a4a" stroke-width="1.5"/><path d="M54 10h10l8 8v8H54z" fill="#b8231b"/><path d="M58 13h5l4 5h-9z" fill="#26343d"/><rect x="0" y="25" width="74" height="4" rx="1" fill="#2a2a2a"/><circle cx="12" cy="30" r="4.5" fill="#2a2a2a"/><circle cx="24" cy="30" r="4.5" fill="#2a2a2a"/><circle cx="62" cy="30" r="4.5" fill="#2a2a2a"/><circle cx="12" cy="30" r="1.6" fill="#888"/><circle cx="24" cy="30" r="1.6" fill="#888"/><circle cx="62" cy="30" r="1.6" fill="#888"/></svg>',
};
