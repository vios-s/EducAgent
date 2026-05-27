// Shared UI components for EducAgent Study Mode

const { useState, useEffect, useRef, useMemo } = React;

// ---------- text formatting ----------
// Renders inline markdown-ish: **bold**, ___italic-emph___, `code`, $math$
function FormattedText({ text }) {
  // tokenize
  const parts = [];
  let i = 0;
  const push = (node) => parts.push(node);
  const re = /(\*\*[^*]+\*\*|___[^_]+___|\*[^*\n]+\*|`[^`]+`|\$[^$\n]+\$)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) push(<strong key={parts.length}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('___')) push(<em key={parts.length} className="emph">{tok.slice(3, -3)}</em>);
    else if (tok.startsWith('`')) push(<code key={parts.length} className="ic">{formatMathish(tok.slice(1, -1))}</code>);
    else if (tok.startsWith('$')) push(<code key={parts.length} className="ic">{formatMathish(tok.slice(1, -1))}</code>);
    else if (tok.startsWith('*')) push(<em key={parts.length}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) push(text.slice(last));
  return <>{parts}</>;
}

function formatMathish(text) {
  return String(text || '')
    .replace(/\\rightarrow/g, '->')
    .replace(/\\to/g, '->')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\_/g, '_');
}

// ---------- Logo ----------
function Logo({ size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: 'var(--surface)',
      boxShadow: '0 4px 12px rgba(232,93,44,0.18)',
      border: '1px solid var(--line-soft)',
      position: 'relative', overflow: 'hidden',
    }}>
      <img src="assets/educagent-logo.png" alt="" style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}/>
    </div>
  );
}

// ---------- Sidebar ----------
const NAV_ITEMS = [
  { id: 'home',    label: 'Home',           icon: 'Home',     section: 'workspace' },
  { id: 'study',   label: 'Study Mode',     icon: 'Brain',    section: 'learn',   badge: 'Now' },
  { id: 'graph',   label: 'Knowledge Map',  icon: 'Graph',    section: 'learn' },
  { id: 'agile',   label: 'Agile Mode',     icon: 'Sparkle',  section: 'learn' },
  { id: 'library', label: 'My Library',     icon: 'Book',     section: 'workspace' },
  { id: 'settings',label: 'Settings',       icon: 'Settings', section: 'bottom' },
];

function Sidebar({ active, onSelect, collapsed, onToggle, onMobileClose, mobile, showStreak = true }) {
  const w = mobile ? 280 : collapsed ? 76 : 248;
  return (
    <aside
      style={{
        width: w,
        flexShrink: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: mobile ? 'fixed' : 'sticky', top: 0, left: 0,
        zIndex: 40, transition: 'width .22s ease',
        boxShadow: mobile ? '0 20px 60px rgba(42,31,20,0.18)' : 'none',
      }}
    >
      {/* Brand row */}
      <div style={{ padding: collapsed && !mobile ? '20px 16px' : '20px 18px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <Logo size={36}/>
          {(!collapsed || mobile) && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', lineHeight: 1 }}>EducAgent</div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Learn causally</div>
            </div>
          )}
        </div>
        {mobile && (
          <button onClick={onMobileClose} aria-label="Close menu" style={{ padding: 6, borderRadius: 10, color: 'var(--ink-soft)' }}><Icon.Close/></button>
        )}
      </div>

      {/* Search */}
      {(!collapsed || mobile) && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--bg-soft)', borderRadius: 12, color: 'var(--ink-soft)' }}>
            <Icon.Search size={16}/>
            <span style={{ fontSize: 14 }}>Search lessons…</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, padding: '2px 6px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--surface)' }}>⌘K</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '4px 12px 12px', overflowY: 'auto' }}>
        {(!collapsed || mobile) && <NavLabel>Workspace</NavLabel>}
        {NAV_ITEMS.filter(n => n.section === 'workspace').map(n =>
          <NavItem key={n.id} item={n} active={active === n.id} collapsed={collapsed && !mobile} onClick={() => onSelect(n.id)}/>
        )}

        {(!collapsed || mobile) && <NavLabel style={{ marginTop: 16 }}>Learn &amp; Explore</NavLabel>}
        {NAV_ITEMS.filter(n => n.section === 'learn').map(n =>
          <NavItem key={n.id} item={n} active={active === n.id} collapsed={collapsed && !mobile} onClick={() => onSelect(n.id)}/>
        )}

        {/* Streak card */}
        {(!collapsed || mobile) && showStreak && (
          <div style={{
            marginTop: 18,
            padding: 14,
            background: 'linear-gradient(135deg, var(--sun-soft), var(--primary-soft))',
            borderRadius: 16,
            border: '1px solid var(--line-soft)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>
              <Icon.Flame size={16} style={{ color: 'var(--primary)' }}/> 3-day streak
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 10, borderRadius: 4,
                  background: i < 3 ? 'var(--primary)' : 'rgba(0,0,0,0.06)',
                }}/>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.45 }}>
              Finish today's lesson to keep it going.
            </div>
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div style={{ padding: 12, borderTop: '1px solid var(--line-soft)' }}>
        {NAV_ITEMS.filter(n => n.section === 'bottom').map(n =>
          <NavItem key={n.id} item={n} active={active === n.id} collapsed={collapsed && !mobile} onClick={() => onSelect(n.id)}/>
        )}
        {!mobile && (
          <button onClick={onToggle} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12, color: 'var(--ink-mute)', fontSize: 13,
          }}>
            {collapsed ? <Icon.ChevR size={16}/> : <><Icon.ChevL size={16}/> Collapse</>}
          </button>
        )}
      </div>
    </aside>
  );
}

function NavLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase',
      letterSpacing: '0.08em', fontWeight: 600, padding: '6px 12px 4px',
      ...style,
    }}>{children}</div>
  );
}

function NavItem({ item, active, collapsed, onClick }) {
  const IconC = Icon[item.icon];
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: collapsed ? '10px' : '10px 12px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 12,
        background: active ? 'var(--primary-soft)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--ink-soft)',
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        marginBottom: 2,
        position: 'relative',
        transition: 'background .15s ease, color .15s ease',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-soft)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <IconC size={18} strokeWidth={active ? 2.4 : 2}/>
      {!collapsed && (
        <>
          <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
          {item.badge && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 999,
              background: active ? 'var(--primary)' : 'var(--sun)',
              color: '#fff', fontWeight: 700, letterSpacing: '0.04em',
            }}>{item.badge}</span>
          )}
        </>
      )}
      {collapsed && item.badge && (
        <span style={{
          position: 'absolute', top: 4, right: 4,
          width: 8, height: 8, borderRadius: '50%', background: 'var(--sun)',
        }}/>
      )}
    </button>
  );
}

// ---------- Top bar ----------
function TopBar({ course, selectedLearner, onPickLearner, audienceOptions = [], onGoHome, loading }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(255,248,238,0.85)',
      backdropFilter: 'saturate(160%) blur(10px)',
      WebkitBackdropFilter: 'saturate(160%) blur(10px)',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      <div className="topbar-inner" style={{
        width: '100%',
        maxWidth: 1120,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px clamp(16px, 4vw, 28px)',
      }}>
        <button className="topbar-brand" onClick={onGoHome} style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minWidth: 0,
          textAlign: 'left',
        }} aria-label="Go to homepage">
          <Logo size={34}/>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: 1.1 }}>
              EducAgent
            </div>
          </div>
        </button>
        <div style={{ flex: 1 }}/>
        <div className="audience-segment" role="tablist" aria-label="Choose learning path">
          {audienceOptions.map((option) => {
            const active = option.id === selectedLearner;
            return (
              <button
                key={option.id}
                className={`audience-segment-button${active ? ' is-active' : ''}`}
                role="tab"
                aria-selected={active}
                disabled={loading && !active}
                onClick={() => onPickLearner(option.id)}
                title={option.description}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

function Breadcrumb({ crumbs }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-mute)', fontSize: 13, minWidth: 0, overflow: 'hidden' }}>
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          <span style={{
            color: i === crumbs.length - 1 ? 'var(--ink)' : 'var(--ink-mute)',
            fontWeight: i === crumbs.length - 1 ? 600 : 500,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{c}</span>
          {i < crumbs.length - 1 && <Icon.ChevR size={12}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

function Avatar({ name }) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent), var(--plum))',
        display: 'grid', placeItems: 'center',
        color: '#fff', fontWeight: 700, fontSize: 13,
        border: '2px solid var(--surface)', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}>{initial}</div>
    </div>
  );
}

Object.assign(window, { Sidebar, TopBar, Logo, FormattedText });
