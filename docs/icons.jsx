// Lucide-style icons, hand-tuned. Single stroke, rounded.
const I = ({ children, size = 20, strokeWidth = 2, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0, ...style }}
  >
    {children}
  </svg>
);

const Icon = {
  Home:    (p) => <I {...p}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></I>,
  Book:    (p) => <I {...p}><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 1 2-2h12"/></I>,
  Graph:   (p) => <I {...p}><circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M7.5 7.5 10.7 16.2"/><path d="M16.5 7.5 13.3 16.2"/><path d="M8 6h8"/></I>,
  Brain:   (p) => <I {...p}><path d="M9.5 3A2.5 2.5 0 0 0 7 5.5v.1A3 3 0 0 0 4 8.5v0a3 3 0 0 0 .5 1.66A3 3 0 0 0 4 13v0a3 3 0 0 0 2.5 2.96V17a2.5 2.5 0 0 0 5 0V5.5A2.5 2.5 0 0 0 9.5 3z"/><path d="M14.5 3A2.5 2.5 0 0 1 17 5.5v.1A3 3 0 0 1 20 8.5v0a3 3 0 0 1-.5 1.66A3 3 0 0 1 20 13v0a3 3 0 0 1-2.5 2.96V17a2.5 2.5 0 0 1-5 0V5.5A2.5 2.5 0 0 1 14.5 3z"/></I>,
  Calc:    (p) => <I {...p}><rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7h8"/><path d="M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></I>,
  Sparkle: (p) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></I>,
  Settings:(p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></I>,
  Menu:    (p) => <I {...p}><path d="M4 6h16M4 12h16M4 18h16"/></I>,
  Close:   (p) => <I {...p}><path d="M6 6l12 12M18 6 6 18"/></I>,
  ChevR:   (p) => <I {...p}><path d="m9 6 6 6-6 6"/></I>,
  ChevL:   (p) => <I {...p}><path d="m15 6-6 6 6 6"/></I>,
  ChevD:   (p) => <I {...p}><path d="m6 9 6 6 6-6"/></I>,
  Check:   (p) => <I {...p}><path d="M5 12.5 10 17 19 8"/></I>,
  X:       (p) => <I {...p}><path d="M6 6l12 12M18 6 6 18"/></I>,
  Lightbulb:(p)=> <I {...p}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1v.2h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></I>,
  Target:  (p) => <I {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></I>,
  Compass: (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" stroke="none"/></I>,
  Globe:   (p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></I>,
  Play:    (p) => <I {...p}><path d="M7 5v14l12-7z" fill="currentColor" stroke="none"/></I>,
  Pause:   (p) => <I {...p}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></I>,
  Volume:  (p) => <I {...p}><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 8a4 4 0 0 1 0 8"/></I>,
  Map:     (p) => <I {...p}><path d="M3 6 9 4l6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16M15 6v16"/></I>,
  Star:    (p) => <I {...p}><path d="m12 3 2.6 5.6 6 .8-4.4 4.3 1.1 6L12 17l-5.3 2.7 1.1-6L3.4 9.4l6-.8z"/></I>,
  Flame:   (p) => <I {...p}><path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .3-2 .8-2.7C9.2 6.4 9 5 9 5s-2 2-2 5a5 5 0 0 0 10 0c0-5-5-8-5-8z"/></I>,
  Trophy:  (p) => <I {...p}><path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H5a2 2 0 0 0 2 4M16 6h3a2 2 0 0 1-2 4"/><path d="M9 17h6l-1-3h-4z"/><path d="M7 21h10"/></I>,
  ArrowR:  (p) => <I {...p}><path d="M5 12h14M13 5l7 7-7 7"/></I>,
  ArrowL:  (p) => <I {...p}><path d="M19 12H5M11 5l-7 7 7 7"/></I>,
  Search:  (p) => <I {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></I>,
  Switch:  (p) => <I {...p}><path d="M7 7h9a3 3 0 0 1 3 3v1"/><path d="m16 4 3 3-3 3"/><path d="M17 17H8a3 3 0 0 1-3-3v-1"/><path d="m8 20-3-3 3-3"/></I>,
  Heart:   (p) => <I {...p}><path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/></I>,
  Notebook:(p) => <I {...p}><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 3v18M11 7h5M11 11h5M11 15h3"/></I>,
  Question:(p) => <I {...p}><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><path d="M12 17h.01"/></I>,
  Logout:  (p) => <I {...p}><path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l-5-5 5-5M15 12H5"/></I>,
  Mic:     (p) => <I {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></I>,
};

Object.assign(window, { Icon });
