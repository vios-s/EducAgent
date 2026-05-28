// Main app — Study Mode redesign

const { useState: useS, useEffect: useE, useMemo: useM, useRef: useR } = React;

// ============ Block renderers ============

const AUDIO_QUEUE_GAP_MS = 700;

function makeAudioId(lessonId, blockIndex, part) {
  return `${lessonId}--b${String(blockIndex).padStart(2, '0')}--${part}`;
}

function getAudioEntry(manifest, lessonId, blockIndex, part) {
  return manifest?.segments?.[makeAudioId(lessonId, blockIndex, part)] || null;
}

function audioTargetProps(entry) {
  return entry?.id ? { 'data-audio-segment': entry.id, tabIndex: -1 } : {};
}

function escapeAudioSelector(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function scrollToAudioEntry(entry) {
  if (!entry?.id) return;
  window.requestAnimationFrame(() => {
    const selector = `[data-audio-segment="${escapeAudioSelector(entry.id)}"], [data-audio-id="${escapeAudioSelector(entry.id)}"]`;
    const target = document.querySelector(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (typeof target.focus === 'function') target.focus({ preventScroll: true });
  });
}

function useAudioPlayer() {
  const audioRef = useR(null);
  const queueRef = useR([]);
  const queueIndexRef = useR(-1);
  const continuousRef = useR(false);
  const nextTimerRef = useR(null);
  const [playingId, setPlayingId] = useS(null);
  const [continuous, setContinuous] = useS(false);

  const clearNextTimer = () => {
    if (nextTimerRef.current) {
      window.clearTimeout(nextTimerRef.current);
      nextTimerRef.current = null;
    }
  };

  const stop = () => {
    clearNextTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }
    continuousRef.current = false;
    queueRef.current = [];
    queueIndexRef.current = -1;
    setPlayingId(null);
    setContinuous(false);
  };

  const finish = () => {
    clearNextTimer();
    continuousRef.current = false;
    queueRef.current = [];
    queueIndexRef.current = -1;
    setPlayingId(null);
    setContinuous(false);
  };

  const playEntry = (entry, options = {}) => {
    if (!entry?.audioSrc) return;
    clearNextTimer();
    const isContinuous = Boolean(options.continuous);
    if (Array.isArray(options.queue)) queueRef.current = options.queue.filter(item => item?.audioSrc);
    if (Number.isInteger(options.index)) queueIndexRef.current = options.index;
    continuousRef.current = isContinuous;
    setContinuous(isContinuous);

    let audio = audioRef.current;
    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;
    }
    audio.pause();
    audio.onended = () => {
      if (continuousRef.current) {
        const nextIndex = queueIndexRef.current + 1;
        const next = queueRef.current[nextIndex];
        if (next) {
          setPlayingId(null);
          nextTimerRef.current = window.setTimeout(() => {
            nextTimerRef.current = null;
            if (!continuousRef.current) return;
            playEntry(next, { continuous: true, index: nextIndex, scroll: true });
          }, AUDIO_QUEUE_GAP_MS);
          return;
        }
      }
      finish();
    };
    audio.onerror = finish;
    audio.src = entry.audioSrc;
    setPlayingId(entry.id);
    if (options.scroll) scrollToAudioEntry(entry);
    audio.play().catch(finish);
  };

  const toggle = (entry) => {
    if (playingId === entry?.id && audioRef.current) {
      stop();
      return;
    }
    queueRef.current = [];
    queueIndexRef.current = -1;
    continuousRef.current = false;
    playEntry(entry, { continuous: false });
  };

  const startQueue = (entries, startId) => {
    const queue = (entries || []).filter(entry => entry?.audioSrc);
    if (!queue.length) return;
    const startIndex = Math.max(0, startId ? queue.findIndex(entry => entry.id === startId) : 0);
    playEntry(queue[startIndex], { continuous: true, queue, index: startIndex, scroll: true });
  };

  const toggleQueue = (entries) => {
    if (continuous && audioRef.current) stop();
    else startQueue(entries);
  };

  useE(() => () => stop(), []);

  return { playingId, continuous, toggle, startQueue, toggleQueue, stop };
}

function AudioButton({ entry, player, queue, label = 'Listen to this paragraph', size = 30, style }) {
  if (!entry || !player) return null;
  const active = player.playingId === entry.id;
  const IconC = active ? Icon.Pause : Icon.Volume;
  const handleClick = () => {
    if (active) {
      player.stop();
      return;
    }
    if (queue?.length) player.startQueue(queue, entry.id);
    else player.toggle(entry);
  };
  return (
    <button
      type="button"
      title={active ? 'Pause audio' : label}
      aria-label={active ? 'Pause audio' : label}
      data-audio-id={entry.id}
      onClick={handleClick}
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
        background: active ? 'var(--primary)' : 'rgba(255,255,255,0.86)',
        color: active ? '#fff' : 'var(--primary)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        boxShadow: active ? '0 8px 18px rgba(232,93,44,0.22)' : 'var(--shadow-sm)',
        transition: 'transform .14s ease, background .14s ease, color .14s ease',
        ...style,
      }}
    >
      <IconC size={Math.max(14, size - 14)}/>
    </button>
  );
}

function Paragraph({ text, audioEntry, audioPlayer, audioQueue }) {
  if (audioEntry) {
    return (
      <div {...audioTargetProps(audioEntry)} style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        margin: '0 0 18px',
        maxWidth: 'calc(64ch + 42px)',
      }}>
        <p style={{
          fontSize: 'var(--reading-size, 17px)',
          lineHeight: 1.72,
          color: 'var(--ink)',
          margin: 0,
          maxWidth: '64ch',
          flex: 1,
          minWidth: 0,
        }}>
          <FormattedText text={text}/>
        </p>
        <AudioButton entry={audioEntry} player={audioPlayer} queue={audioQueue} style={{ marginTop: 3 }}/>
      </div>
    );
  }

  return (
    <p style={{
      fontSize: 'var(--reading-size, 17px)',
      lineHeight: 1.72,
      color: 'var(--ink)',
      margin: '0 0 18px',
      maxWidth: '64ch',
    }}>
      <FormattedText text={text}/>
    </p>
  );
}

function ObjectivesBlock({ title, items, audioItems = [], audioPlayer, audioQueue }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 22px',
      marginBottom: 28,
      boxShadow: 'var(--shadow-sm)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 6,
        background: 'linear-gradient(180deg, var(--sun), var(--primary))',
      }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'var(--sun-soft)', color: 'var(--primary)',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}><Icon.Target size={18}/></div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{title}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1.25 }}>After this mini-lesson, you will be able to…</div>
        </div>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <li key={i} {...audioTargetProps(audioItems[i])} style={{ display: 'flex', gap: 10, fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-soft)', alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, marginTop: 7,
              width: 6, height: 6, borderRadius: 999,
              background: 'var(--primary)',
            }}/>
            <span style={{ flex: 1, minWidth: 0 }}><FormattedText text={item}/></span>
            <AudioButton entry={audioItems[i]} player={audioPlayer} queue={audioQueue} label="Listen to this learning goal" size={28}/>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeading({ id, eyebrow, title }) {
  return (
    <div id={id} style={{ scrollMarginTop: 100, marginTop: 48, marginBottom: 18 }}>
      <div style={{
        fontSize: 12, color: 'var(--primary)', textTransform: 'uppercase',
        letterSpacing: '0.10em', fontWeight: 700, marginBottom: 6,
      }}>{eyebrow}</div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 3.4vw, 38px)',
        fontWeight: 700, letterSpacing: '-0.02em',
        lineHeight: 1.1, margin: 0, color: 'var(--ink)',
      }}>{title}</h2>
    </div>
  );
}

function Figure({ src, caption, alt, audioEntry, audioPlayer, audioQueue }) {
  return (
    <figure {...audioTargetProps(audioEntry)} style={{
      margin: '28px 0',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      background: 'var(--bg-soft)',
      border: '1px solid var(--line-soft)',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ position: 'relative' }}>
        <img src={src} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }}/>
      </div>
      {caption && (
        <figcaption style={{
          padding: '14px 20px',
          fontSize: 14, color: 'var(--ink-soft)',
          background: 'var(--surface)',
          borderTop: '1px solid var(--line-soft)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <Icon.Sparkle size={14} style={{ color: 'var(--primary)', marginTop: 3, flexShrink: 0 }}/>
          <span style={{ flex: 1, minWidth: 0 }}>{caption}</span>
          <AudioButton entry={audioEntry} player={audioPlayer} queue={audioQueue} label="Listen to this image caption" size={28}/>
        </figcaption>
      )}
    </figure>
  );
}

function CalloutBlock({ tone, icon, title, text, audioEntry, audioPlayer, audioQueue }) {
  const toneMap = {
    sun:     { bg: 'var(--sun-soft)',    bar: 'var(--sun)',     ic: 'var(--primary)' },
    accent:  { bg: 'var(--accent-soft)', bar: 'var(--accent)',  ic: 'var(--accent)' },
    primary: { bg: 'var(--primary-soft)',bar: 'var(--primary)', ic: 'var(--primary)' },
    err:     { bg: 'var(--err-soft)',    bar: 'var(--err)',     ic: 'var(--err)' },
  };
  const t = toneMap[tone] || toneMap.sun;
  const IconC = Icon[icon] || Icon.Lightbulb;
  return (
    <div {...audioTargetProps(audioEntry)} style={{
      background: t.bg, borderRadius: 'var(--radius)',
      padding: '18px 20px', margin: '8px 0 22px',
      display: 'flex', gap: 14, alignItems: 'flex-start',
      borderLeft: `4px solid ${t.bar}`,
      maxWidth: '64ch',
    }}>
      <div style={{
        flexShrink: 0,
        width: 36, height: 36, borderRadius: 12,
        background: '#fff', color: t.ic,
        display: 'grid', placeItems: 'center',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}>
        <IconC size={20}/>
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ fontSize: 15.5, color: 'var(--ink-soft)', lineHeight: 1.6, flex: 1, minWidth: 0 }}>
            <FormattedText text={text}/>
          </div>
          <AudioButton entry={audioEntry} player={audioPlayer} queue={audioQueue} label="Listen to this note" size={28}/>
        </div>
      </div>
    </div>
  );
}

function VariableCards({ items, audioEntries = [], audioPlayer, audioQueue }) {
  const colorMap = {
    sun:     { bg: 'var(--sun-soft)',     ink: 'var(--primary)', dot: 'var(--sun)' },
    plum:    { bg: 'var(--plum-soft)',    ink: 'var(--plum)',    dot: 'var(--plum)' },
    primary: { bg: 'var(--primary-soft)', ink: 'var(--primary)', dot: 'var(--primary)' },
    accent:  { bg: 'var(--accent-soft)',  ink: 'var(--accent)',  dot: 'var(--accent)' },
  };
  return (
    <div style={{
      display: 'grid', gap: 14, margin: '8px 0 22px',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    }}>
      {items.map((it, i) => {
        const c = colorMap[it.color] || colorMap.primary;
        return (
          <div key={i} {...audioTargetProps(audioEntries[i])} style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            padding: 18,
            position: 'relative', overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <AudioButton
              entry={audioEntries[i]}
              player={audioPlayer}
              queue={audioQueue}
              label={`Listen to ${it.label}`}
              size={28}
              style={{ position: 'absolute', top: 14, right: 14, zIndex: 1 }}
            />
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: c.bg, color: c.ink,
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 22, display: 'grid', placeItems: 'center',
              marginBottom: 10,
              letterSpacing: '-0.02em',
            }}>{it.tag}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16.5, letterSpacing: '-0.01em' }}>{it.label}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.5 }}>{it.desc}</div>
            <div style={{
              position: 'absolute', right: -16, bottom: -16,
              width: 70, height: 70, borderRadius: '50%',
              background: c.bg, opacity: 0.6,
            }}/>
          </div>
        );
      })}
    </div>
  );
}

function RoadsBlock({ roads, audioEntries = [], audioPlayer, audioQueue }) {
  return (
    <div style={{ display: 'grid', gap: 12, margin: '8px 0 22px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      {roads.map((r, i) => {
        const tone = r.tone === 'sun' ? { bg: 'var(--sun-soft)', stripe: 'var(--sun)', ic: 'var(--primary)' }
                                       : { bg: 'var(--primary-soft)', stripe: 'var(--primary)', ic: 'var(--primary)' };
        return (
          <div key={i} {...audioTargetProps(audioEntries[i]?.main)} style={{
            position: 'relative',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 18,
            padding: '20px 22px 20px 56px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <AudioButton
              entry={audioEntries[i]?.main}
              player={audioPlayer}
              queue={audioQueue}
              label={`Listen to ${r.label}`}
              size={28}
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
            />
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 8,
              background: tone.stripe,
            }}/>
            <div style={{
              position: 'absolute', left: 16, top: 18,
              width: 30, height: 30, borderRadius: 10,
              background: tone.bg, color: tone.ic,
              display: 'grid', placeItems: 'center',
            }}>
              {r.hopeful ? <Icon.Trophy size={18}/> : <Icon.Question size={18}/>}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{i+1}. {r.label}</div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55, paddingRight: audioEntries[i]?.main ? 32 : 0 }}>{r.desc}</div>
            <div {...audioTargetProps(audioEntries[i]?.note)} style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-mute)', fontStyle: 'italic', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                {r.note || (r.hopeful ? '✨ This is what we hope is true.' : '⚠ This is the hidden alternative.')}
              </span>
              <AudioButton entry={audioEntries[i]?.note} player={audioPlayer} queue={audioQueue} label="Listen to this note" size={26}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CodeBox({ label, code }) {
  return (
    <div style={{
      background: 'var(--ink)',
      borderRadius: 14,
      padding: '14px 18px',
      margin: '16px 0 22px',
      maxWidth: '64ch',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        fontSize: 11, color: 'var(--sun)',
        textTransform: 'uppercase', letterSpacing: '0.1em',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>{label}</div>
      <div style={{
        flex: 1,
        color: '#fff', fontFamily: 'var(--font-mono)',
        fontSize: 15.5, fontWeight: 500,
      }}>{code}</div>
    </div>
  );
}

function MarkdownBlock({ text }) {
  const parts = useM(() => parseMarkdownBlocks(text), [text]);
  return (
    <div style={{ maxWidth: '72ch', margin: '0 0 18px' }}>
      {parts.map((part, i) => renderMarkdownPart(part, i))}
    </div>
  );
}

function renderMarkdownPart(part, key) {
  if (part.type === 'heading') {
    const Tag = part.level === 3 ? 'h3' : 'h4';
    return (
      <Tag key={key} style={{
        fontFamily: 'var(--font-display)',
        fontSize: part.level === 3 ? 24 : 19,
        lineHeight: 1.2,
        margin: '24px 0 10px',
      }}>
        <FormattedText text={cleanInline(part.text)}/>
      </Tag>
    );
  }
  if (part.type === 'quote') {
    return <CalloutBlock key={key} tone="accent" icon="Lightbulb" title="Key note" text={cleanInline(part.text)}/>;
  }
  if (part.type === 'p') {
    const highlight = parseHighlightParagraph(part.text);
    if (highlight) {
      return (
        <CalloutBlock
          key={key}
          tone={highlight.tone}
          icon={highlight.icon}
          title={highlight.title}
          text={cleanInline(highlight.text)}
        />
      );
    }
  }
  if (part.type === 'ul' || part.type === 'ol' || part.type === 'alpha') {
    const concepts = parseConceptItems(part.items);
    if (concepts.length >= 2 && concepts.length === part.items.length) {
      return <MarkdownConceptCards key={key} items={concepts}/>;
    }
    const ordered = part.type === 'ol';
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Tag key={key} style={{
        margin: '0 0 18px',
        paddingLeft: ordered ? 24 : 20,
        color: 'var(--ink-soft)',
        fontSize: 'var(--reading-size, 17px)',
        lineHeight: 1.7,
      }}>
        {part.items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 8 }}>
            <FormattedText text={cleanInline(item)}/>
          </li>
        ))}
      </Tag>
    );
  }
  if (part.type === 'table') {
    return (
      <div key={key} style={{ overflowX: 'auto', margin: '16px 0 22px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          fontSize: 14,
        }}>
          <thead>
            <tr>
              {part.header.map((cell, i) => (
                <th key={i} style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  background: 'var(--bg-soft)',
                  borderBottom: '1px solid var(--line)',
                  color: 'var(--ink)',
                }}><FormattedText text={cleanInline(cell)}/></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {part.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 12px',
                    borderBottom: ri === part.rows.length - 1 ? 'none' : '1px solid var(--line-soft)',
                    color: 'var(--ink-soft)',
                    verticalAlign: 'top',
                  }}><FormattedText text={cleanInline(cell)}/></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (part.type === 'details') {
    return (
      <details key={key} style={{
        margin: '16px 0 22px',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
      }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--primary)' }}>
          {part.summary}
        </summary>
        <div style={{ paddingTop: 12 }}>
          <MarkdownBlock text={part.text}/>
        </div>
      </details>
    );
  }
  if (part.type === 'caption') {
    return (
      <p key={key} style={{ margin: '8px 0 20px', fontSize: 14, color: 'var(--ink-mute)', fontStyle: 'italic' }}>
        <FormattedText text={cleanInline(part.text)}/>
      </p>
    );
  }
  return <Paragraph key={key} text={cleanInline(part.text)}/>;
}

function parseHighlightParagraph(text) {
  const value = String(text || '').trim();
  const keyIdea = value.match(/^Here is the key idea:\s*(.+)$/i);
  if (keyIdea) {
    return {
      tone: 'accent',
      icon: 'Lightbulb',
      title: 'Key idea',
      text: keyIdea[1],
    };
  }

  const boldOnly = value.match(/^\*\*(.+?)\*\*$/);
  if (boldOnly) {
    return {
      tone: /only|safest|what would|what changes/i.test(boldOnly[1]) ? 'primary' : 'sun',
      icon: /only|trap|misconception/i.test(boldOnly[1]) ? 'Question' : 'Lightbulb',
      title: /only|trap|misconception/i.test(boldOnly[1]) ? 'Common trap' : 'Pause point',
      text: boldOnly[1],
    };
  }

  return null;
}

function parseConceptItems(items) {
  return items.map((item) => {
    const match = String(item || '').trim().match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (!match) return null;
    return {
      label: match[1],
      text: match[2],
    };
  }).filter(Boolean);
}

function MarkdownConceptCards({ items }) {
  const colors = [
    { bg: 'var(--plum-soft)', ink: 'var(--plum)' },
    { bg: 'var(--primary-soft)', ink: 'var(--primary)' },
    { bg: 'var(--accent-soft)', ink: 'var(--accent)' },
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
      gap: 12,
      margin: '10px 0 24px',
      maxWidth: '72ch',
    }}>
      {items.map((item, index) => {
        const c = colors[index % colors.length];
        return (
          <div key={item.label} style={{
            border: '1px solid var(--line)',
            borderRadius: 8,
            background: 'var(--surface)',
            boxShadow: 'var(--shadow-sm)',
            padding: 16,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              background: c.bg,
              color: c.ink,
              marginBottom: 10,
            }}>
              <Icon.Graph size={17}/>
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 15.5,
              lineHeight: 1.2,
              marginBottom: 6,
            }}>
              <FormattedText text={cleanInline(item.label)}/>
            </div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 13.5, lineHeight: 1.55 }}>
              <FormattedText text={cleanInline(item.text)}/>
            </div>
            <div style={{
              position: 'absolute',
              right: -20,
              bottom: -22,
              width: 70,
              height: 70,
              borderRadius: '50%',
              background: c.bg,
              opacity: 0.48,
            }}/>
          </div>
        );
      })}
    </div>
  );
}

function parseMarkdownBlocks(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  const isSpecial = (line) => {
    const t = line.trim();
    return !t || /^#{2,4}\s+/.test(t) || /^>\s?/.test(t) || /^\|.*\|$/.test(t) ||
      /^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line) || /^\s*[A-D]\.\s+/.test(line) ||
      /^<details>/i.test(t) || /^<em>.*<\/em>$/i.test(t);
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) { i += 1; continue; }

    if (/^<details>/i.test(trimmed)) {
      const details = [];
      let summary = 'Show answers';
      i += 1;
      while (i < lines.length && !/^<\/details>/i.test(lines[i].trim())) {
        const sum = lines[i].trim().match(/^<summary>(.*?)<\/summary>$/i);
        if (sum) summary = sum[1];
        else details.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      blocks.push({ type: 'details', summary, text: details.join('\n').trim() });
      continue;
    }

    const heading = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }

    if (/^<em>.*<\/em>$/i.test(trimmed)) {
      blocks.push({ type: 'caption', text: trimmed.replace(/^<em>|<\/em>$/gi, '') });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(trimmed)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ type: 'quote', text: quote.join(' ') });
      continue;
    }

    if (/^\|.*\|$/.test(trimmed)) {
      const rows = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) {
        const row = lines[i].trim().split('|').slice(1, -1).map((c) => c.trim());
        if (!row.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(row);
        i += 1;
      }
      if (rows.length) blocks.push({ type: 'table', header: rows[0], rows: rows.slice(1) });
      continue;
    }

    const listMatch = trimmed.match(/^([-*]|\d+\.|[A-D]\.)\s+(.+)$/);
    if (listMatch) {
      const type = /^\d/.test(listMatch[1]) ? 'ol' : /^[A-D]/.test(listMatch[1]) ? 'alpha' : 'ul';
      const items = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^([-*]|\d+\.|[A-D]\.)\s+(.+)$/);
        if (!m) break;
        const mType = /^\d/.test(m[1]) ? 'ol' : /^[A-D]/.test(m[1]) ? 'alpha' : 'ul';
        if (mType !== type) break;
        items.push(m[2]);
        i += 1;
      }
      blocks.push({ type, items });
      continue;
    }

    const paragraph = [trimmed];
    i += 1;
    while (i < lines.length && !isSpecial(lines[i])) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'p', text: paragraph.join(' ') });
  }

  return blocks;
}

function cleanInline(text) {
  return String(text || '')
    .replace(/<br\/?>/g, ' ')
    .replace(/<\/?strong>/g, '**')
    .replace(/<\/?em>/g, '*')
    .replace(/\$([^$]+)\$/g, '`$1`')
    .replace(/\u000dightarrow/g, '->')
    .replace(/\u0009o/g, '->')
    .replace(/\\rightarrow/g, '->')
    .replace(/\\to/g, '->')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\_/g, '_');
}

function svgLabelLines(label) {
  return String(label || '')
    .split('\n')
    .flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) return [];
      if (trimmed.length <= 14 || !trimmed.includes(' ')) return [trimmed];
      const words = trimmed.split(/\s+/);
      const lines = [];
      let current = '';
      words.forEach((word) => {
        const next = current ? `${current} ${word}` : word;
        if (next.length > 14 && current) {
          lines.push(current);
          current = word;
        } else {
          current = next;
        }
      });
      if (current) lines.push(current);
      return lines;
    });
}

function fittedSvgFontSize(lines, maxSize, minSize, boxWidth) {
  const longest = Math.max(1, ...lines.map((line) => line.length));
  const fitted = boxWidth / (longest * 0.58);
  return Math.max(minSize, Math.min(maxSize, fitted));
}

function SvgNodeText({
  tag,
  label,
  tagFill,
  tagSize = 21,
  tagY = -12,
  labelY = 8,
  labelBoxWidth = 70,
  labelMaxSize = 9.4,
  labelMinSize = 7.6,
  labelWeight = 700,
}) {
  const lines = svgLabelLines(label);
  const labelSize = fittedSvgFontSize(lines, labelMaxSize, labelMinSize, labelBoxWidth);
  const lineGap = Math.max(labelSize + 2.2, 9.4);
  const firstLineY = labelY - Math.max(0, lines.length - 2) * (lineGap / 2);

  return (
    <>
      <text textAnchor="middle" y={tagY} fontFamily="var(--font-display)" fontWeight="900" fontSize={tagSize} fill={tagFill}>
        {tag}
      </text>
      <text textAnchor="middle" y={firstLineY} fontFamily="var(--font-body)" fontSize={labelSize} fill="var(--ink)" fontWeight={labelWeight}>
        {lines.map((line, i) => (
          <tspan key={i} x="0" dy={i === 0 ? 0 : lineGap}>{line}</tspan>
        ))}
      </text>
    </>
  );
}

// Causal graph visualization (replaces mermaid)
function CausalGraph({ intervention = false, graph = null }) {
  // SVG topology: Z --> T, Z --> Y, T --> Y. Scenario labels can change.
  const baseNodes = {
    Z: { x: 80,  y: 90,  label: 'Prior\nAchievement', tag: 'Z', color: 'var(--sun)', bg: 'var(--sun-soft)' },
    T: { x: 280, y: 50,  label: 'Tutoring',           tag: 'T', color: 'var(--primary)', bg: 'var(--primary-soft)' },
    Y: { x: 280, y: 170, label: 'Test Score',         tag: 'Y', color: 'var(--accent)', bg: 'var(--accent-soft)' },
  };
  const nodes = Object.fromEntries(
    Object.entries(baseNodes).map(([key, node]) => [key, { ...node, ...(graph?.nodes?.[key] || {}) }])
  );
  const legendItems = graph?.legend || [
    { color: 'var(--sun)', label: 'Hidden influence' },
    { color: 'var(--primary)', label: 'What we want to measure' },
    { color: 'var(--accent)', label: 'Outcome' },
  ];
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: 24,
      margin: '8px 0 22px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: 'var(--plum-soft)', color: 'var(--plum)',
          display: 'grid', placeItems: 'center',
        }}><Icon.Graph size={16}/></div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{graph?.title || 'The causal map'}</div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-mute)' }}>{graph?.hint || 'Arrows show influence'}</div>
      </div>

      <svg viewBox="0 0 380 220" style={{ width: '100%', height: 'auto', maxHeight: 280 }}>
        <defs>
          <marker id="arr-sun" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--sun)"/>
          </marker>
          <marker id="arr-primary" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--primary)"/>
          </marker>
          <marker id="arr-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/>
          </marker>
        </defs>

        {/* Arrow Z -> T */}
        <line x1="135" y1="78" x2="225" y2="55" stroke="var(--sun)" strokeWidth="3" markerEnd="url(#arr-sun)"
          strokeDasharray={intervention ? "6 6" : "0"} opacity={intervention ? 0.35 : 1}/>
        {/* Arrow Z -> Y */}
        <line x1="135" y1="102" x2="225" y2="165" stroke="var(--sun)" strokeWidth="3" markerEnd="url(#arr-sun)"/>
        {/* Arrow T -> Y */}
        <line x1="280" y1="80" x2="280" y2="135" stroke="var(--primary)" strokeWidth="3" markerEnd="url(#arr-primary)"/>

        {/* X mark when intervened */}
        {intervention && (
          <g transform="translate(180, 60)">
            <circle r="14" fill="#fff" stroke="var(--err)" strokeWidth="2.5"/>
            <path d="M-6,-6 L6,6 M6,-6 L-6,6" stroke="var(--err)" strokeWidth="3" strokeLinecap="round"/>
          </g>
        )}

        {/* Nodes */}
        {Object.entries(nodes).map(([k, n]) => (
          <g key={k} transform={`translate(${n.x}, ${n.y})`}>
            <circle r="43" fill={n.bg} stroke={n.color} strokeWidth="2.5"/>
            <SvgNodeText
              tag={n.tag}
              label={n.label}
              tagFill={n.color}
              tagSize={21}
              tagY={-12}
              labelY={9}
              labelBoxWidth={70}
              labelMaxSize={9.4}
              labelMinSize={7.4}
            />
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--ink-soft)' }}>
        {legendItems.map((item) => (
          <Legend key={item.label} color={item.color} label={item.label}/>
        ))}
      </div>
    </div>
  );
}
function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 14, height: 3, background: color, borderRadius: 2 }}/>
      <span>{label}</span>
    </div>
  );
}

// Graph block — toggles between observational and interventional.
function GraphBlock({ initialIntervention = false, graph = null }) {
  const [interv, setInterv] = useS(Boolean(initialIntervention));
  if (graph?.disableIntervention) {
    return <CausalGraph graph={graph}/>;
  }
  const interventionPrompt = graph?.interventionPrompt || 'Show coin-flip tutoring assignment';
  const interventionClosedLabel = graph?.interventionClosedLabel || 'Coin-flip assignment shown - hidden road closed';
  return (
    <div>
      <CausalGraph intervention={interv} graph={graph}/>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
        margin: '-8px 0 22px',
      }}>
        <button onClick={() => setInterv(v => !v)} style={{
          padding: '10px 16px', borderRadius: 999, fontWeight: 600, fontSize: 13.5,
          background: interv ? 'var(--accent)' : 'var(--surface)',
          color: interv ? '#fff' : 'var(--ink)',
          border: `1.5px solid ${interv ? 'var(--accent)' : 'var(--line)'}`,
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: interv ? '0 4px 12px rgba(43,166,140,0.25)' : 'none',
          transition: 'all .15s',
        }}>
          <Icon.Sparkle size={14}/>
          {interv ? interventionClosedLabel : interventionPrompt}
        </button>
      </div>
    </div>
  );
}

function HiringDagGraph({ variant = 'base' }) {
  const cycle = variant === 'cycle';
  const nodes = {
    Z: { x: 110, y: 90, tag: 'Z', label: 'University\nPrestige', color: 'var(--sun)', bg: 'var(--sun-soft)' },
    X: { x: 300, y: 90, tag: 'X', label: 'Technical\nSkill', color: 'var(--primary)', bg: 'var(--primary-soft)' },
    M: { x: 300, y: 230, tag: 'M', label: 'Project\nPortfolio', color: 'var(--plum)', bg: 'var(--plum-soft)' },
    Y: { x: 500, y: 160, tag: 'Y', label: 'Hiring\nRecommendation', color: 'var(--accent)', bg: 'var(--accent-soft)' },
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)',
      padding: 22,
      margin: '10px 0 24px',
      boxShadow: 'var(--shadow-sm)',
      maxWidth: 820,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: 'var(--accent-soft)', color: 'var(--accent)',
          display: 'grid', placeItems: 'center',
        }}><Icon.Graph size={16}/></div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
          Hiring-pipeline DAG
        </div>
        {cycle && (
          <div style={{
            marginLeft: 'auto',
            fontSize: 12,
            color: 'var(--err)',
            fontWeight: 700,
          }}>counterexample edge shown</div>
        )}
      </div>

      <svg viewBox="0 0 620 320" style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <marker id="arr-hiring" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-soft)"/>
          </marker>
          <marker id="arr-hiring-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--err)"/>
          </marker>
        </defs>

        <line x1="160" y1="90" x2="248" y2="90" stroke="var(--ink-soft)" strokeWidth="3" markerEnd="url(#arr-hiring)"/>
        <line x1="150" y1="118" x2="455" y2="160" stroke="var(--sun)" strokeWidth="3" markerEnd="url(#arr-hiring)"/>
        <line x1="300" y1="140" x2="300" y2="178" stroke="var(--primary)" strokeWidth="3" markerEnd="url(#arr-hiring)"/>
        <line x1="350" y1="105" x2="455" y2="145" stroke="var(--primary)" strokeWidth="3" markerEnd="url(#arr-hiring)"/>
        <line x1="350" y1="220" x2="455" y2="175" stroke="var(--plum)" strokeWidth="3" markerEnd="url(#arr-hiring)"/>

        {cycle && (
          <path
            d="M500 112 C480 10, 318 5, 300 42"
            fill="none"
            stroke="var(--err)"
            strokeWidth="3"
            strokeDasharray="7 7"
            markerEnd="url(#arr-hiring-red)"
          />
        )}

        {Object.entries(nodes).map(([key, n]) => (
          <g key={key} transform={`translate(${n.x}, ${n.y})`}>
            <rect x="-52" y="-44" width="104" height="88" rx="16" fill={n.bg} stroke={n.color} strokeWidth="2.5"/>
            <SvgNodeText
              tag={n.tag}
              label={n.label}
              tagFill={n.color}
              tagSize={22}
              tagY={-11}
              labelY={11}
              labelBoxWidth={88}
              labelMaxSize={10.5}
              labelMinSize={8}
              labelWeight={600}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ============ Lesson view ============

function getLessonAudioEntries(lesson, manifest) {
  const entries = [];
  const add = (blockIndex, part) => {
    const entry = getAudioEntry(manifest, lesson.id, blockIndex, part);
    if (entry?.audioSrc) entries.push(entry);
  };

  lesson.blocks.forEach((block, blockIndex) => {
    if (block.kind === 'objectives') {
      block.items.forEach((_, itemIndex) => add(blockIndex, `objective-${itemIndex}`));
    } else if (block.kind === 'p') {
      add(blockIndex, 'p');
    } else if (block.kind === 'figure' && block.caption) {
      add(blockIndex, 'caption');
    } else if (block.kind === 'callout') {
      add(blockIndex, 'callout');
    } else if (block.kind === 'cards') {
      block.items.forEach((_, itemIndex) => add(blockIndex, `card-${itemIndex}`));
    } else if (block.kind === 'roads') {
      block.roads.forEach((road, roadIndex) => {
        add(blockIndex, `road-${roadIndex}`);
        if (road.note) add(blockIndex, `road-${roadIndex}-note`);
      });
    }
  });

  return entries;
}

function LessonAudioGuide({ entries, player }) {
  if (!entries.length || !player) return null;
  const active = player.continuous;
  const IconC = active ? Icon.Pause : Icon.Volume;
  return (
    <div className="lesson-audio-guide">
      <button
        type="button"
        className="lesson-audio-guide-button"
        onClick={() => player.toggleQueue(entries)}
        title="Plays this lesson in order and follows the current paragraph."
        aria-label={active ? 'Stop lesson audio' : 'Play lesson audio'}
      >
        <IconC size={17}/>
        {active ? 'Stop lesson audio' : 'Play lesson audio'}
      </button>
      <span className="lesson-audio-guide-meta">{entries.length} short clips</span>
    </div>
  );
}

function LessonView({ lesson, course, lessonIndex, totalLessons, onPrev, onNext, hasPrev, hasNext, audioManifest, audioPlayer }) {
  const audioFor = (blockIndex, part) => getAudioEntry(audioManifest, lesson.id, blockIndex, part);
  const lessonAudioEntries = useM(() => getLessonAudioEntries(lesson, audioManifest), [lesson, audioManifest]);
  return (
    <article style={{ padding: '0 0 80px' }}>
      <LessonHero lesson={lesson} course={course} lessonIndex={lessonIndex} totalLessons={totalLessons}/>
      <div style={{ padding: 'clamp(28px, 4vw, 44px) clamp(20px, 5vw, 56px) 0' }}>
        <LessonAudioGuide entries={lessonAudioEntries} player={audioPlayer}/>
        {lesson.blocks.map((b, i) => {
          switch (b.kind) {
            case 'objectives': return (
              <ObjectivesBlock
                key={i}
                title={b.title}
                items={b.items}
                audioItems={b.items.map((_, itemIndex) => audioFor(i, `objective-${itemIndex}`))}
                audioPlayer={audioPlayer}
                audioQueue={lessonAudioEntries}
              />
            );
            case 'section':    return <SectionHeading key={i} id={b.id} eyebrow={b.eyebrow} title={b.title}/>;
            case 'p':          return <Paragraph key={i} text={b.text} audioEntry={audioFor(i, 'p')} audioPlayer={audioPlayer} audioQueue={lessonAudioEntries}/>;
            case 'figure':     return <Figure key={i} src={b.src} caption={b.caption} alt={b.alt} audioEntry={audioFor(i, 'caption')} audioPlayer={audioPlayer} audioQueue={lessonAudioEntries}/>;
            case 'callout':    return <CalloutBlock key={i} {...b} audioEntry={audioFor(i, 'callout')} audioPlayer={audioPlayer} audioQueue={lessonAudioEntries}/>;
            case 'cards':      return (
              <VariableCards
                key={i}
                items={b.items}
                audioEntries={b.items.map((_, itemIndex) => audioFor(i, `card-${itemIndex}`))}
                audioPlayer={audioPlayer}
                audioQueue={lessonAudioEntries}
              />
            );
            case 'roads':      return (
              <RoadsBlock
                key={i}
                roads={b.roads}
                audioEntries={b.roads.map((_, roadIndex) => ({
                  main: audioFor(i, `road-${roadIndex}`),
                  note: audioFor(i, `road-${roadIndex}-note`),
                }))}
                audioPlayer={audioPlayer}
                audioQueue={lessonAudioEntries}
              />
            );
            case 'codebox':    return <CodeBox key={i} label={b.label} code={b.code}/>;
            case 'graph':      return <GraphBlock key={i} initialIntervention={b.intervention} graph={b.graph}/>;
            case 'hiring-graph': return <HiringDagGraph key={i} variant={b.variant}/>;
            case 'markdown':   return <MarkdownBlock key={i} text={b.text}/>;
            case 'quiz':       return <div key={i} style={{ margin: '24px 0' }}><InteractiveQuiz key={`${lesson.id}-${i}`} questions={b.questions}/></div>;
            default: return null;
          }
        })}

        <LessonFooterNav onPrev={onPrev} onNext={onNext} hasPrev={hasPrev} hasNext={hasNext}/>
      </div>
    </article>
  );
}

function LessonHero({ lesson, course, lessonIndex, totalLessons }) {
  const colorMap = {
    sun:     { bg: 'linear-gradient(135deg, var(--sun-soft) 0%, var(--primary-soft) 100%)', tag: 'var(--primary)' },
    accent:  { bg: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--bg-soft) 100%)', tag: 'var(--accent)' },
    plum:    { bg: 'linear-gradient(135deg, var(--plum-soft) 0%, var(--bg-soft) 100%)', tag: 'var(--plum)' },
  };
  const c = colorMap[lesson.color] || colorMap.sun;
  const progress = totalLessons ? `${Math.round(((lessonIndex + 1) / totalLessons) * 100)}%` : '0%';
  return (
    <div className="lesson-hero" style={{
      position: 'relative',
      padding: 'clamp(28px, 5vw, 56px) clamp(20px, 5vw, 56px) clamp(24px, 4vw, 40px)',
      background: c.bg,
      overflow: 'hidden',
      borderBottom: '1px solid var(--line-soft)',
    }}>
      {lesson.teaserImage && (
        <>
          <img className="lesson-hero-bg-art" src={lesson.teaserImage} alt=""/>
          <div className="lesson-hero-wash" aria-hidden="true"/>
        </>
      )}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Chip>{course?.label || 'learner'}</Chip>
          <Chip>{`Lesson ${lessonIndex + 1}`}</Chip>
          <Chip muted><Icon.Sparkle size={12}/> {lesson.minutes} min read</Chip>
          <Chip muted>{course?.courseTitle || 'Course'}</Chip>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap' }}>
          <div style={{
            fontSize: 'clamp(40px, 5vw, 56px)', lineHeight: 1,
            background: 'var(--surface)', borderRadius: 18,
            padding: '8px 16px', boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--line-soft)',
          }}>{lesson.emoji}</div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 5.4vw, 56px)',
              fontWeight: 700, letterSpacing: '-0.025em',
              lineHeight: 1.05, margin: '0 0 12px', color: 'var(--ink)',
            }}>{lesson.title}</h1>
            <p style={{ fontSize: 'clamp(16px, 1.6vw, 19px)', lineHeight: 1.5, color: 'var(--ink-soft)', margin: 0, maxWidth: '52ch' }}>
              {lesson.blurb}
            </p>
          </div>
        </div>

        {/* Progress strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220, height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.6)', overflow: 'hidden', maxWidth: 480 }}>
            <div style={{ width: progress, height: '100%', background: c.tag, borderRadius: 999, transition: 'width .3s' }}/>
          </div>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontWeight: 600 }}>{lessonIndex + 1} of {totalLessons} lessons</span>
        </div>
      </div>
    </div>
  );
}

function Chip({ children, muted }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 999,
      background: muted ? 'rgba(255,255,255,0.65)' : 'var(--primary)',
      color: muted ? 'var(--ink-soft)' : '#fff',
      fontSize: 12.5, fontWeight: 600,
      letterSpacing: '0.01em',
      border: muted ? '1px solid rgba(0,0,0,0.06)' : 'none',
    }}>{children}</span>
  );
}

function LessonFooterNav({ onPrev, onNext, hasPrev, hasNext }) {
  return (
    <div style={{
      marginTop: 56,
      paddingTop: 22,
      borderTop: '1px solid var(--line)',
      display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
    }}>
      <button onClick={onPrev} disabled={!hasPrev} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 14px', borderRadius: 10,
        background: hasPrev ? 'var(--surface)' : 'transparent',
        border: hasPrev ? '1px solid var(--line)' : 'none',
        opacity: hasPrev ? 1 : 0.4, cursor: hasPrev ? 'pointer' : 'default',
        fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)',
      }}>
        <Icon.ArrowL size={16}/> Previous
      </button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
        Lesson navigation
      </div>
      <button onClick={onNext} disabled={!hasNext} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '13px 18px', borderRadius: 10,
        background: hasNext ? 'var(--primary)' : 'var(--line)',
        color: hasNext ? '#fff' : 'var(--ink-mute)',
        cursor: hasNext ? 'pointer' : 'default',
        fontSize: 15, fontWeight: 700,
        boxShadow: hasNext ? '0 6px 16px rgba(232,93,44,0.30)' : 'none',
      }}>
        {hasNext ? 'Next lesson' : 'You\'re all caught up'}
        {hasNext && <Icon.ArrowR size={16}/>}
      </button>
    </div>
  );
}

// ============ Right rail: chapter navigation ============

function ChapterRail({ lessons, currentId, onPick, currentSections, activeSection, onSectionClick, showHelpCard = true }) {
  return (
    <aside style={{
      width: 280, flexShrink: 0,
      padding: '24px 16px 24px 0',
      position: 'sticky', top: 64, alignSelf: 'flex-start',
      maxHeight: 'calc(100vh - 64px)',
      overflowY: 'auto',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 18,
        padding: 16,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 10 }}>
          On this page
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentSections.map((s) => {
            const IconC = Icon[s.icon] || Icon.Compass;
            const active = activeSection === s.id;
            return (
              <li key={s.id}>
                <button onClick={() => onSectionClick(s.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 10,
                  background: active ? 'var(--primary-soft)' : 'transparent',
                  color: active ? 'var(--primary)' : 'var(--ink-soft)',
                  fontSize: 13.5, fontWeight: active ? 600 : 500,
                  textAlign: 'left', transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-soft)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <IconC size={15}/>
                  <span style={{ flex: 1 }}>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Chapters list */}
      <div style={{
        marginTop: 14,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 18,
        padding: 12,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, margin: '4px 6px 8px' }}>
          In this module
        </div>
        {lessons.map((l, i) => {
          const active = l.id === currentId;
          return (
            <button key={l.id} onClick={() => onPick(l.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 10px', borderRadius: 12,
              background: active ? 'var(--bg-soft)' : 'transparent',
              textAlign: 'left',
              marginBottom: 2,
              border: active ? '1px solid var(--line)' : '1px solid transparent',
              transition: 'all .15s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-soft)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: active ? 'var(--primary)' : 'var(--bg-soft)',
                color: active ? '#fff' : 'var(--ink-soft)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
                flexShrink: 0,
              }}>{i+1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: active ? 700 : 600, color: 'var(--ink)' }}>{l.title}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>{l.minutes} min · {l.sections.length} parts</div>
              </div>
            </button>
          );
        })}
        <div style={{ borderTop: '1px solid var(--line-soft)', marginTop: 6, paddingTop: 8, paddingLeft: 10, paddingRight: 10, paddingBottom: 4 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>+ 12 more lessons</div>
        </div>
      </div>

      {/* Help card */}
      {showHelpCard && (<div style={{
        marginTop: 14,
        background: 'var(--ink)', color: '#fff',
        borderRadius: 18, padding: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -20, bottom: -20,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(245,183,61,0.18)',
        }}/>
        <Icon.Sparkle size={18} style={{ color: 'var(--sun)' }}/>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, marginTop: 8, lineHeight: 1.3 }}>
          Stuck on something?
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, lineHeight: 1.5 }}>
          Ask the tutor anything — in plain English.
        </div>
        <button style={{
          marginTop: 12, padding: '9px 14px', borderRadius: 10,
          background: 'var(--sun)', color: 'var(--ink)',
          fontSize: 13, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>Open chat <Icon.ArrowR size={14}/></button>
      </div>)}
    </aside>
  );
}

// ============ Ask tutor floating bar ============
function AskTutorBar() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 20, right: 20, zIndex: 30,
    }}>
      <button style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '14px 18px', borderRadius: 999,
        background: 'var(--ink)', color: '#fff',
        boxShadow: '0 14px 32px rgba(42,31,20,0.30)',
        fontWeight: 600, fontSize: 14,
      }}>
        <Icon.Sparkle size={18} style={{ color: 'var(--sun)' }}/>
        Ask the tutor
      </button>
    </div>
  );
}

// ============ Placeholder views for non-Study tabs ============

const PLACEHOLDERS = {
  home:     { icon: 'Home',     title: 'Welcome back',          blurb: "Pick up where you left off — or explore something new.", cta: 'Continue The Tutoring Puzzle' },
  graph:    { icon: 'Graph',    title: 'Your knowledge map',    blurb: "See how concepts connect. Tap any node to dive into a lesson.", cta: 'Back to today\'s lesson' },
  agile:    { icon: 'Sparkle',  title: 'Agile Mode',            blurb: "Multi-agent reasoning — let a team of tutors work through a question with you.", cta: 'Back to Study Mode' },
  library:  { icon: 'Book',     title: 'Your library',          blurb: "Saved lessons, bookmarks, and notes — coming together in one place.", cta: 'Back to Study Mode' },
  settings: { icon: 'Settings', title: 'Settings',              blurb: "Account, language, and learning preferences.", cta: 'Back to Study Mode' },
};

function PlaceholderView({ name, onGoStudy }) {
  const p = PLACEHOLDERS[name] || PLACEHOLDERS.home;
  const IconC = Icon[p.icon];
  return (
    <div style={{ padding: '64px clamp(20px, 5vw, 56px) 80px', maxWidth: 920 }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--sun-soft), var(--primary-soft) 60%, var(--accent-soft))',
        borderRadius: 'var(--radius-xl)',
        padding: 'clamp(28px, 4vw, 48px)',
        position: 'relative', overflow: 'hidden',
        border: '1px solid var(--line-soft)',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
        }}/>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'var(--surface)', color: 'var(--primary)',
            display: 'grid', placeItems: 'center', marginBottom: 18,
            boxShadow: 'var(--shadow)',
          }}>
            <IconC size={28} strokeWidth={2.2}/>
          </div>
          <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>EducAgent</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(34px, 5vw, 48px)', lineHeight: 1.08,
            fontWeight: 700, letterSpacing: '-0.025em',
            margin: '0 0 14px',
          }}>{p.title}</h1>
          <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.5, maxWidth: '48ch', margin: 0 }}>{p.blurb}</p>
          <button onClick={onGoStudy} style={{
            marginTop: 24,
            padding: '14px 22px', borderRadius: 14,
            background: 'var(--ink)', color: '#fff',
            fontWeight: 700, fontSize: 15,
            display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 8px 20px rgba(42,31,20,0.18)',
          }}>
            <Icon.Brain size={16}/> {p.cta} <Icon.ArrowR size={16}/>
          </button>
        </div>
      </div>

      {name === 'home' && (
        <div style={{ marginTop: 28, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {LESSONS.map((l, i) => (
            <button key={l.id} onClick={onGoStudy} style={{
              textAlign: 'left',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 18, padding: 20,
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{l.emoji}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>{l.chapter}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em', marginTop: 4 }}>{l.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 6, lineHeight: 1.5 }}>{l.blurb}</div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--ink-mute)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.Sparkle size={12}/> {l.minutes} min · {l.sections.length} parts
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ Booth Mode ============

const AUDIENCE_OPTIONS = [
  {
    id: 'learner_0',
    label: 'Everyone',
    description: 'Public-friendly tutoring example',
  },
  {
    id: 'learner_1',
    label: 'Computer science',
    description: 'DAG example for ML and computing audiences',
  },
  {
    id: 'learner_8',
    label: 'Healthcare',
    description: 'Healthcare reminder example for CHAI audiences',
  },
];

const BOOTH_URL = 'https://vios-s.github.io/EducAgent/#booth';
const FEEDBACK_URL = 'https://forms.office.com/e/e6KucWWD8X';
const FEEDBACK_DISPLAY_URL = 'forms.office.com/e/e6KucWWD8X';

const BOOTH_SCENARIOS = {
  learner_0: {
    label: 'Everyone',
    kicker: 'Tutoring puzzle',
    prompt: 'Tutored students scored higher. What should we wonder first?',
    options: [
      'Tutoring definitely caused the whole score gap.',
      'The tutored students may already have differed before tutoring began.',
      'The scores are useless because school data is never informative.',
    ],
    answer: 1,
    hiddenTitle: 'Hidden cause: prior achievement',
    hiddenText: 'Prior achievement can influence both who receives tutoring and the later test score. The raw score gap may mix this hidden path with any tutoring effect.',
    graph: {
      title: 'Tutoring causal map',
      hiddenLabel: 'Prior achievement',
      nodes: {
        Z: { label: 'Prior\nAchievement', tag: 'Z', color: 'var(--sun)', bg: 'var(--sun-soft)' },
        T: { label: 'Tutoring', tag: 'T', color: 'var(--primary)', bg: 'var(--primary-soft)' },
        Y: { label: 'Test\nScore', tag: 'Y', color: 'var(--accent)', bg: 'var(--accent-soft)' },
      },
    },
  },
  learner_1: {
    label: 'Computer science',
    kicker: 'Causal graph teaser',
    prompt: 'A hiring model recommends applicants with stronger skill signals. What hidden path should the graph make visible?',
    options: [
      'Skill signals alone explain every recommendation.',
      'Directed arrows only mean two variables are correlated.',
      'University prestige may shape both skill signals and the recommendation.',
    ],
    answer: 2,
    hiddenTitle: 'Hidden path: background signal into both sides',
    hiddenText: 'A DAG forces us to say whether UniversityPrestige sits upstream of both TechnicalSkill and HiringRecommendation. That matters before we claim what the model causally depends on.',
    graph: {
      title: 'Hiring DAG teaser',
      hiddenLabel: 'University prestige',
      nodes: {
        Z: { label: 'University\nPrestige', tag: 'Z', color: 'var(--plum)', bg: 'var(--plum-soft)' },
        T: { label: 'Technical\nSkill', tag: 'X', color: 'var(--primary)', bg: 'var(--primary-soft)' },
        Y: { label: 'Hiring\nRecommendation', tag: 'Y', color: 'var(--accent)', bg: 'var(--accent-soft)' },
      },
    },
  },
  learner_8: {
    label: 'Healthcare',
    kicker: 'CHAI bridge',
    prompt: 'Text reminders linked to higher attendance. What else might explain it?',
    options: [
      'Patients getting reminders may already be more engaged or easier to reach.',
      'The reminder must have caused the attendance gap.',
      'Observational healthcare data is never useful.',
    ],
    answer: 0,
    hiddenTitle: 'Hidden cause: patient engagement',
    hiddenText: 'Engaged, digitally connected, life-stable patients may be more likely to receive reminders and more likely to attend anyway. This is causal reasoning, not medical advice.',
    graph: {
      title: 'Clinic reminder map',
      hiddenLabel: 'Patient engagement',
      nodes: {
        Z: { label: 'Patient\nEngagement', tag: 'Z', color: 'var(--plum)', bg: 'var(--plum-soft)' },
        T: { label: 'Received\nReminder', tag: 'T', color: 'var(--primary)', bg: 'var(--primary-soft)' },
        Y: { label: 'Attended\nAppointment', tag: 'Y', color: 'var(--accent)', bg: 'var(--accent-soft)' },
      },
    },
  },
};

function BoothPage({ selectedLearner, onPickLearner, onStart, onGoHome }) {
  const scenario = BOOTH_SCENARIOS[selectedLearner] || BOOTH_SCENARIOS.learner_0;
  const [pick, setPick] = useS(null);
  const [revealed, setRevealed] = useS(false);

  useE(() => {
    setPick(null);
    setRevealed(false);
  }, [selectedLearner]);

  return (
    <section id="booth" style={{
      scrollMarginTop: 76,
      height: 'calc(100vh - 64px)',
      minHeight: 620,
      padding: 'clamp(10px, 1.6vw, 20px)',
      background: 'linear-gradient(180deg, var(--bg-soft) 0%, var(--surface) 100%)',
      display: 'grid',
      placeItems: 'center',
      boxSizing: 'border-box',
    }}>
      <div className="booth-shell-card" style={{
        width: '100%',
        height: 'calc(100vh - 84px)',
        minHeight: 0,
        border: '1px solid var(--line)',
        borderRadius: 8,
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--bg-soft) 100%)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'clamp(12px, 1.5vw, 18px)',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr) auto',
        gap: 12,
        overflow: 'hidden',
      }}>
        <div className="booth-header" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 0.42fr)',
          gap: 14,
          alignItems: 'end',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
              <button onClick={onGoHome} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 11px',
                borderRadius: 10,
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,0.84)',
                color: 'var(--ink-soft)',
                fontWeight: 800,
                fontSize: 13,
              }}>
                <Icon.ArrowL size={14}/> Homepage
              </button>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 999,
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                fontWeight: 900,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                <Icon.Target size={14}/> Booth Mode
              </div>
              <div style={{ color: 'var(--ink-mute)', fontSize: 13, fontWeight: 700 }}>
                Stand-up challenge in about 90 seconds
              </div>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 3.2vw, 46px)',
              lineHeight: 0.98,
              letterSpacing: '0',
              margin: 0,
              maxWidth: 1020,
            }}>
              Can you spot the hidden cause?
            </h1>
          </div>
          <div className="booth-header-tabs">
            <BoothAudienceTabs selectedLearner={selectedLearner} onPickLearner={onPickLearner} compact/>
          </div>
        </div>

        <div className="booth-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(440px, 1.04fr) minmax(420px, 0.96fr)',
          gap: 12,
          alignItems: 'stretch',
          minHeight: 0,
        }}>
          <div className="booth-challenge-panel" style={{
            minHeight: 0,
            border: '1px solid var(--line)',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.88)',
            boxShadow: 'var(--shadow-sm)',
            padding: 'clamp(14px, 1.6vw, 18px)',
            display: 'grid',
            gridTemplateRows: 'minmax(0, 1fr) auto',
            gap: 12,
            overflow: 'hidden',
          }}>
            <BoothQuiz scenario={scenario} pick={pick} onPick={setPick} revealed={revealed}/>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => setRevealed(true)} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                minHeight: 40,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'var(--primary)',
                color: '#fff',
                fontWeight: 900,
                fontSize: 15,
                boxShadow: '0 12px 24px rgba(232,93,44,0.24)',
              }}>
                <Icon.Sparkle size={17}/> Reveal the hidden path
              </button>
              {revealed && (
                <button onClick={() => onStart(selectedLearner)} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                  minHeight: 40,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'var(--ink)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: 15,
                }}>
                  <Icon.Play size={16}/> Continue lesson
                </button>
              )}
            </div>
          </div>

          <div style={{ minHeight: 0 }}>
            <BoothCausalGraph scenario={scenario} revealed={revealed}/>
          </div>
        </div>

        <div className="booth-bottom-rail" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(310px, 0.42fr)',
          gap: 12,
          alignItems: 'stretch',
          minHeight: 104,
        }}>
          <BoothInsightPanel scenario={scenario} pick={pick} revealed={revealed}/>
          <BoothQrPanel/>
        </div>
      </div>
    </section>
  );
}

function BoothAudienceTabs({ selectedLearner, onPickLearner, compact = false }) {
  return (
    <div style={{ marginBottom: compact ? 0 : 12 }}>
      {!compact && (
        <div style={{
          fontSize: 12,
          color: 'var(--ink-mute)',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}>
          Pick the path
        </div>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 6,
        padding: 4,
        borderRadius: 12,
        border: '1px solid var(--line)',
        background: 'var(--bg-soft)',
      }}>
        {AUDIENCE_OPTIONS.map((option) => {
          const active = option.id === selectedLearner;
          return (
            <button key={option.id} onClick={() => onPickLearner(option.id)} style={{
              minHeight: 42,
              borderRadius: 8,
              padding: '8px 10px',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? '#fff' : 'var(--ink-soft)',
              fontWeight: 900,
              fontSize: 13,
            }}>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BoothQuiz({ scenario, pick, onPick, revealed }) {
  return (
    <div style={{ minHeight: 0, overflow: 'auto', paddingRight: 2 }}>
      <div style={{
        color: 'var(--primary)',
        fontSize: 12,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 8,
      }}>
        {scenario.kicker}
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 1.9vw, 26px)',
        lineHeight: 1.06,
        margin: '0 0 10px',
      }}>
        {scenario.prompt}
      </h2>
      {scenario.note && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 9px',
          borderRadius: 8,
          background: 'var(--plum-soft)',
          color: 'var(--plum)',
          fontSize: 12.5,
          fontWeight: 800,
          marginBottom: 14,
        }}>
          <Icon.Heart size={14}/> {scenario.note}
        </div>
      )}
      <div style={{ display: 'grid', gap: 11 }}>
        {scenario.options.map((option, index) => {
          const selected = pick === index;
          const correct = index === scenario.answer;
          const showCorrect = revealed && correct;
          const showWrong = revealed && selected && !correct;
          return (
            <button key={option} onClick={() => onPick(index)} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              minHeight: 58,
              padding: '12px 14px',
              borderRadius: 8,
              border: `1.5px solid ${showCorrect ? 'var(--accent)' : showWrong ? 'var(--err)' : selected ? 'var(--primary)' : 'var(--line)'}`,
              background: showCorrect ? 'var(--accent-soft)' : showWrong ? 'var(--err-soft)' : selected ? 'var(--primary-soft)' : 'var(--surface)',
              textAlign: 'left',
              fontSize: 'clamp(16px, 1.35vw, 18px)',
              lineHeight: 1.34,
              color: 'var(--ink)',
              fontWeight: selected || showCorrect ? 700 : 500,
            }}>
              <span style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                background: showCorrect ? 'var(--accent)' : showWrong ? 'var(--err)' : selected ? 'var(--primary)' : 'var(--bg-soft)',
                color: showCorrect || showWrong || selected ? '#fff' : 'var(--ink-soft)',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: 15,
              }}>
                {showCorrect ? <Icon.Check size={18} strokeWidth={3}/> : showWrong ? <Icon.X size={18} strokeWidth={3}/> : String.fromCharCode(65 + index)}
              </span>
              <span style={{ flex: 1, paddingTop: 4 }}>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BoothCausalGraph({ scenario, revealed }) {
  const graph = scenario.graph;
  const z = graph.nodes.Z;
  const t = graph.nodes.T;
  const y = graph.nodes.Y;
  const hiddenOpacity = revealed ? 1 : 0.28;
  const hiddenStroke = revealed ? z.color : 'var(--ink-mute)';

  const renderNode = (node, x, yPos, hidden) => (
    <g transform={`translate(${x}, ${yPos})`} opacity={hidden ? hiddenOpacity : 1}>
      <circle r="47" fill={hidden && !revealed ? 'var(--bg-soft)' : node.bg} stroke={hidden ? hiddenStroke : node.color} strokeWidth="2.7"/>
      <SvgNodeText
        tag={hidden && !revealed ? '?' : node.tag}
        label={hidden && !revealed ? 'Hidden\nCause?' : node.label}
        tagFill={hidden ? hiddenStroke : node.color}
        tagSize={24}
        tagY={-13}
        labelY={10}
        labelBoxWidth={78}
        labelMaxSize={10.2}
        labelMinSize={8}
      />
    </g>
  );

  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 8,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, var(--accent-soft) 100%)',
      boxShadow: 'var(--shadow)',
      padding: 'clamp(16px, 2vw, 24px)',
      minHeight: 0,
      height: '100%',
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateRows: 'auto minmax(0, 1fr) auto',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 4 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
        }}>
          <Icon.Graph size={18}/>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, lineHeight: 1.1 }}>{graph.title}</div>
          <div style={{ color: 'var(--ink-mute)', fontSize: 12.5, fontWeight: 700 }}>
            {revealed ? `Hidden path: ${graph.hiddenLabel}` : 'Observed pattern first'}
          </div>
        </div>
      </div>
      <svg viewBox="0 0 430 260" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', minHeight: 0, display: 'block' }}>
        <defs>
          <marker id="booth-arr-main" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--primary)"/>
          </marker>
          <marker id="booth-arr-hidden" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={hiddenStroke}/>
          </marker>
        </defs>
        <line x1="254" y1="98" x2="300" y2="124" stroke="var(--primary)" strokeWidth="4" markerEnd="url(#booth-arr-main)"/>
        <line x1="131" y1="111" x2="157" y2="97" stroke={hiddenStroke} strokeWidth="4" strokeDasharray={revealed ? 'none' : '7 7'} opacity={hiddenOpacity} markerEnd="url(#booth-arr-hidden)"/>
        <line x1="137" y1="139" x2="293" y2="147" stroke={hiddenStroke} strokeWidth="4" strokeDasharray={revealed ? 'none' : '7 7'} opacity={hiddenOpacity} markerEnd="url(#booth-arr-hidden)"/>
        {renderNode(z, 82, 136, true)}
        {renderNode(t, 206, 72, false)}
        {renderNode(y, 348, 150, false)}
      </svg>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', color: 'var(--ink-soft)', fontSize: 12.5, fontWeight: 700, paddingTop: 4 }}>
        <Legend color={hiddenStroke} label={revealed ? 'Hidden path revealed' : 'Hidden path covered'}/>
        <Legend color="var(--primary)" label="Observed link"/>
      </div>
    </div>
  );
}

function BoothInsightPanel({ scenario, pick, revealed }) {
  const correct = pick === scenario.answer;
  const waiting = !revealed;
  return (
    <div aria-live="polite" style={{
      border: '1px solid var(--line)',
      borderRadius: 8,
      background: waiting ? 'var(--surface)' : correct ? 'var(--accent-soft)' : 'var(--sun-soft)',
      boxShadow: 'var(--shadow-sm)',
      padding: 'clamp(14px, 1.6vw, 18px)',
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      gap: 14,
      alignItems: 'center',
      borderLeft: `6px solid ${waiting ? 'var(--primary)' : correct ? 'var(--accent)' : 'var(--sun)'}`,
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        display: 'grid',
        placeItems: 'center',
        background: '#fff',
        color: waiting ? 'var(--primary)' : correct ? 'var(--accent)' : 'var(--primary)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        {waiting ? <Icon.Question size={22}/> : correct ? <Icon.Check size={23} strokeWidth={3}/> : <Icon.Lightbulb size={23}/>}
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(18px, 2vw, 23px)',
          lineHeight: 1.05,
          marginBottom: 5,
        }}>
          {waiting ? 'Pick an answer, then reveal the hidden path.' : scenario.hiddenTitle}
        </div>
        <div style={{ color: 'var(--ink-soft)', fontSize: 'clamp(13.5px, 1.25vw, 15.5px)', lineHeight: 1.45, maxWidth: 920 }}>
          {waiting
            ? 'The graph starts with the visible pattern. Reveal adds the upstream cause that can explain why the groups differed before the intervention.'
            : scenario.hiddenText}
        </div>
      </div>
    </div>
  );
}

function BoothQrPanel() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      gap: 12,
      alignItems: 'center',
      border: '1px solid var(--line)',
      borderRadius: 8,
      background: 'var(--ink)',
      color: '#fff',
      padding: 10,
      boxShadow: 'var(--shadow)',
      minHeight: 110,
    }}>
      <div style={{
        width: 86,
        height: 86,
        padding: 8,
        borderRadius: 8,
        background: '#fff',
      }}>
        <img src="assets/qr-booth.png" alt="QR code for the EducAgent booth challenge" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}/>
      </div>
      <div>
        <div style={{ color: 'var(--sun)', fontSize: 11.5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          Take it with you
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(14.5px, 1.28vw, 18px)', lineHeight: 1.08, fontWeight: 900, marginBottom: 5 }}>
          Scan this and try the 3-minute challenge on your phone.
        </div>
        <a href={BOOTH_URL} style={{ color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'underline', textUnderlineOffset: 3 }}>
          EducAgent/#booth
        </a>
      </div>
    </div>
  );
}

function FeedbackSection() {
  const items = ['Role or background', 'Causality familiarity', 'Where it got stuck', 'Follow-up permission'];
  return (
    <section id="feedback" style={{
      scrollMarginTop: 76,
      padding: '52px clamp(20px, 5vw, 64px) 64px',
      background: 'linear-gradient(180deg, var(--bg-soft), var(--surface))',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 24,
        alignItems: 'start',
      }} className="feedback-grid">
        <div>
          <HomeSectionHeader
            eyebrow="30-second feedback"
            title="Tell us what landed."
            text="The booth form asks who you are, whether the causal idea made sense, where the explanation got stuck, and whether follow-up is welcome."
          />
          <div style={{
            marginTop: 22,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12,
            maxWidth: 720,
          }}>
            {items.map((item) => (
              <div key={item} style={{
                border: '1px solid var(--line)',
                borderRadius: 8,
                background: 'var(--surface)',
                padding: 14,
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                color: 'var(--ink-soft)',
                fontWeight: 800,
                fontSize: 13.5,
              }}>
                <Icon.Check size={15} style={{ color: 'var(--accent)' }}/>
                {item}
              </div>
            ))}
          </div>
          <a href={FEEDBACK_URL} target="_blank" rel="noreferrer" style={{
            marginTop: 22,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            padding: '13px 16px',
            borderRadius: 10,
            background: 'var(--primary)',
            color: '#fff',
            fontWeight: 900,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            Open Microsoft Forms <Icon.ArrowR size={16}/>
          </a>
        </div>
        <div style={{
          width: 210,
          border: '1px solid var(--line)',
          borderRadius: 8,
          background: 'var(--surface)',
          padding: 14,
          boxShadow: 'var(--shadow)',
        }}>
          <img src="assets/qr-feedback.png" alt="QR code for EducAgent feedback" style={{ width: '100%', height: 'auto', display: 'block' }}/>
          <div style={{ marginTop: 10, fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 19, lineHeight: 1.1 }}>
            Feedback QR
          </div>
          <a href={FEEDBACK_URL} target="_blank" rel="noreferrer" style={{
            display: 'inline-block',
            marginTop: 6,
            color: 'var(--primary)',
            fontSize: 12.5,
            fontWeight: 800,
            overflowWrap: 'anywhere',
          }}>
            {FEEDBACK_DISPLAY_URL}
          </a>
        </div>
      </div>
    </section>
  );
}

function PageBackBar({ onGoHome }) {
  return (
    <div style={{
      padding: '18px clamp(20px, 5vw, 64px)',
      borderBottom: '1px solid var(--line-soft)',
      background: 'var(--surface)',
    }}>
      <button onClick={onGoHome} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 12px',
        borderRadius: 10,
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        color: 'var(--ink-soft)',
        fontWeight: 800,
        fontSize: 13,
      }}>
        <Icon.ArrowL size={14}/> Homepage
      </button>
    </div>
  );
}

function FeedbackPage({ onGoHome }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'var(--surface)' }}>
      <PageBackBar onGoHome={onGoHome}/>
      <FeedbackSection/>
    </div>
  );
}

// ============ Public homepage ============

function HomePage({ currentCourse, selectedLearner, onStart, onPickLearner, onOpenBooth }) {
  const featureItems = [
    {
      icon: 'Book',
      title: 'Start with a story',
      text: 'Every lesson starts with a pattern people already recognize, then turns it into a causal question.',
    },
    {
      icon: 'Target',
      title: 'Moving at your pace',
      text: 'The agent remembers where you got stuck and can step back to the missing idea instead of pushing ahead blindly.',
    },
    {
      icon: 'Graph',
      title: 'See the hidden path',
      badge: 'coming soon',
      text: 'A concept graph tracks prerequisites and dependencies, so the tutor can backtrack to the idea that unlocks the current lesson.',
    },
    {
      icon: 'Sparkle',
      title: 'Learn with a team',
      badge: 'coming soon',
      text: 'A tutor explains, a student-simulator makes common mistakes, and a critic helps you spot what changed in your thinking.',
    },
  ];

  return (
    <div>
      <section className="home-hero" style={{
        position: 'relative',
        minHeight: 'min(640px, calc(100vh - 112px))',
        overflow: 'hidden',
        borderBottom: '1px solid var(--line-soft)',
        backgroundImage: 'linear-gradient(90deg, rgba(255,248,238,1) 0%, rgba(255,248,238,0.98) 34%, rgba(255,248,238,0.82) 50%, rgba(255,248,238,0.24) 72%, rgba(255,248,238,0.06) 100%), url("assets/homepage-hero.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(52px, 8vw, 92px) clamp(20px, 5vw, 64px)',
      }}>
        <div className="home-hero-content" style={{ maxWidth: 530, position: 'relative' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 12px',
            borderRadius: 999,
            background: 'rgba(255,255,255,0.76)',
            border: '1px solid rgba(239,226,203,0.9)',
            color: 'var(--primary)',
            fontWeight: 800,
            fontSize: 13,
            marginBottom: 18,
          }}>
            <Icon.Sparkle size={15}/>
            Everyone can learn causality
          </div>
          <h1 className="home-title" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(54px, 8.4vw, 96px)',
            lineHeight: 0.92,
            letterSpacing: '0',
            margin: 0,
            color: 'var(--ink)',
          }}>EducAgent</h1>
          <p className="home-copy" style={{
            margin: '22px 0 0',
            maxWidth: '38ch',
            fontSize: 'clamp(18px, 2vw, 23px)',
            lineHeight: 1.48,
            color: 'var(--ink-soft)',
            fontWeight: 500,
          }}>
            Learn causality with no barrier. A friendly agent tutor turns causal thinking into small stories, visual maps, and checks anyone can follow.
          </p>
          <div className="home-actions" style={{ display: 'flex', gap: 12, flexWrap: 'nowrap', alignItems: 'center', marginTop: 30 }}>
            <button className="home-primary-cta" onClick={() => onStart(selectedLearner)} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              padding: '14px 18px',
              borderRadius: 12,
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 800,
              fontSize: 15,
              boxShadow: '0 12px 26px rgba(232,93,44,0.26)',
              whiteSpace: 'nowrap',
            }}>
              <Icon.Play size={17}/>
              Start learning
            </button>
            <button className="home-secondary-cta" onClick={onOpenBooth} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              padding: '13px 17px',
              borderRadius: 12,
              background: 'var(--ink)',
              color: '#fff',
              border: '1px solid var(--ink)',
              fontWeight: 800,
              fontSize: 15,
              whiteSpace: 'nowrap',
            }}>
              <Icon.Target size={17}/>
              Booth mode
            </button>
            <a className="home-secondary-cta" href="#how-it-works" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              padding: '13px 17px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.74)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              textDecoration: 'none',
              fontWeight: 800,
              fontSize: 15,
              whiteSpace: 'nowrap',
            }}>
              <Icon.Compass size={17}/>
              See how it works
            </a>
          </div>
        </div>
        <div className="home-mobile-art" aria-hidden="true">
          <img src="assets/homepage-hero.png" alt=""/>
        </div>
      </section>

      <section style={{
        padding: '28px clamp(20px, 5vw, 64px) 8px',
        background: 'var(--surface)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 10,
        }}>
          {['Agents fit your background', 'Built from trusted causal concepts', 'Engaging and motivating for learning', 'Check your learning in real-time'].map((item, i) => (
            <div key={item} style={{
              border: '1px solid var(--line-soft)',
              borderRadius: 8,
              padding: '12px 14px',
              background: i % 2 ? 'var(--bg-soft)' : 'var(--surface)',
              color: 'var(--ink-soft)',
              fontWeight: 700,
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Icon.Check size={16} style={{ color: 'var(--accent)' }}/>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" style={{ padding: '56px clamp(20px, 5vw, 64px) 26px' }}>
        <HomeSectionHeader
          eyebrow="Why it feels easier"
          title="A tutor that meets you before the jargon."
          text="EducAgent is designed for people who want to learn causality to feel usable: no matter who you are, agents can adapt."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginTop: 24,
        }}>
          {featureItems.map((item) => {
            const IconC = Icon[item.icon];
            return (
              <div key={item.title} style={{
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: 18,
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 12,
                }}>
                  <IconC size={20}/>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  lineHeight: 1.18,
                  margin: '0 0 8px',
                }}>
                  {item.title}
                  {item.badge && (
                    <span style={{
                      marginLeft: 8,
                      display: 'inline-flex',
                      verticalAlign: 'middle',
                      padding: '3px 7px',
                      borderRadius: 999,
                      background: 'var(--sun-soft)',
                      color: 'var(--primary)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.01em',
                    }}>{item.badge}</span>
                  )}
                </h3>
                <p style={{ margin: 0, color: 'var(--ink-soft)', fontSize: 14.5, lineHeight: 1.55 }}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{
        padding: '34px clamp(20px, 5vw, 64px) 44px',
        background: 'linear-gradient(180deg, var(--surface), var(--bg-soft))',
      }}>
        <HomeSectionHeader
          eyebrow="Pick a path"
          title="Learn from zero, or bring a question."
          text="EducAgent is designed around two modes: Study Mode for guided learning, and Agile Mode for checking causal thinking in real tasks."
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
          marginTop: 24,
        }}>
          <LearningPathCard
            icon="Brain"
            title="Study Mode"
            label="Best first step"
            text="A structured path from everyday examples into causal maps, misconceptions, and short concept checks."
            button="Start Learning"
            active
            onClick={() => onStart(selectedLearner)}
          />
          <LearningPathCard
            icon="Compass"
            title="Agile Mode"
            label="Coming Soon"
            text="A future review flow for people who already have a causal question and want help sanity-checking the reasoning."
            button="Coming Soon"
            disabled
          />
        </div>
      </section>

      <PartnerLinksSection />
      <FeedbackHomeSection/>
    </div>
  );
}

const PARTNER_LINKS = [
  {
    name: '@VIOS Group',
    label: 'University of Edinburgh',
    role: 'Project team',
    url: 'https://vios.science/',
    logo: 'assets/vios-logo.png',
    qr: 'assets/qr-vios.png',
    tone: 'var(--accent)',
    wash: 'var(--accent-soft)',
  },
  {
    name: 'CHAI',
    label: 'Funded by CHAI',
    role: 'Funding support',
    url: 'https://www.chai.ac.uk/',
    logo: 'assets/chai-logo.png',
    qr: 'assets/qr-chai.png',
    tone: 'var(--primary)',
    wash: 'var(--primary-soft)',
  },
];

function PartnerLinksSection() {
  return (
    <section style={{
      padding: '42px clamp(20px, 5vw, 64px) 64px',
      background: 'var(--surface)',
      borderTop: '1px solid var(--line-soft)',
    }}>
      <HomeSectionHeader
        eyebrow="Project links"
        title="From @VIOS Group, funded by CHAI."
        text="EducAgent is developed by @VIOS Group at the University of Edinburgh, with support from CHAI. Scan the QR codes from your phone."
      />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 14,
        marginTop: 24,
      }}>
        {PARTNER_LINKS.map((partner) => (
          <a
            key={partner.name}
            href={partner.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 18,
              alignItems: 'center',
              minHeight: 178,
              padding: 18,
              borderRadius: 8,
              border: '1px solid var(--line)',
              background: `linear-gradient(135deg, ${partner.wash}, var(--surface) 44%, var(--surface))`,
              boxShadow: 'var(--shadow-sm)',
              textDecoration: 'none',
              color: 'var(--ink)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{
                width: 88,
                height: 54,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.78)',
                border: '1px solid var(--line-soft)',
                marginBottom: 16,
                padding: 8,
              }}>
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                color: partner.tone,
                fontSize: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 8,
              }}>
                <Icon.Globe size={14}/>
                {partner.role}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                lineHeight: 1.05,
                margin: 0,
              }}>{partner.name}</h3>
              <p style={{
                margin: '8px 0 14px',
                color: 'var(--ink-soft)',
                fontSize: 14.5,
                lineHeight: 1.45,
              }}>{partner.label}</p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontWeight: 800,
                color: 'var(--ink)',
                fontSize: 14,
              }}>
                Open website <Icon.ArrowR size={14}/>
              </span>
            </div>
            <div style={{
              width: 112,
              height: 112,
              padding: 8,
              borderRadius: 8,
              background: '#fff',
              border: '1px solid var(--line-soft)',
              boxShadow: '0 10px 22px rgba(42,31,20,0.06)',
            }}>
              <img
                src={partner.qr}
                alt={`QR code for ${partner.name}`}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

function FeedbackHomeSection() {
  return (
    <section style={{
      padding: '34px clamp(20px, 5vw, 64px) 48px',
      background: 'var(--bg-soft)',
      borderTop: '1px solid var(--line-soft)',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 22,
        alignItems: 'center',
      }} className="home-feedback-grid">
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--primary)',
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}>
            <Icon.Target size={14}/> Booth feedback
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4.2vw, 46px)',
            lineHeight: 1,
            letterSpacing: '0',
            margin: 0,
            maxWidth: 720,
          }}>
            Help us learn what landed.
          </h2>
          <p style={{ margin: '12px 0 0', maxWidth: 680, color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.58 }}>
            A 30-second form captures role, causality familiarity, where the explanation got stuck, and whether follow-up is welcome.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '118px minmax(150px, 1fr)',
          gap: 14,
          alignItems: 'center',
          border: '1px solid var(--line)',
          borderRadius: 8,
          background: 'var(--surface)',
          padding: 14,
          boxShadow: 'var(--shadow-sm)',
        }} className="home-feedback-card">
          <div style={{
            width: 118,
            height: 118,
            padding: 8,
            borderRadius: 8,
            background: '#fff',
            border: '1px solid var(--line-soft)',
          }}>
            <img src="assets/qr-feedback.png" alt="QR code for EducAgent feedback" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}/>
          </div>
          <div>
            <a href={FEEDBACK_URL} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              minHeight: 44,
              padding: '11px 13px',
              borderRadius: 10,
              background: 'var(--primary)',
              color: '#fff',
              fontWeight: 900,
              fontSize: 14,
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}>
              Open feedback <Icon.ArrowR size={15}/>
            </a>
            <a href={FEEDBACK_URL} target="_blank" rel="noreferrer" style={{
              display: 'block',
              marginTop: 9,
              color: 'var(--ink-soft)',
              fontSize: 12.5,
              fontWeight: 800,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              overflowWrap: 'anywhere',
            }}>
              {FEEDBACK_DISPLAY_URL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeSectionHeader({ eyebrow, title, text }) {
  return (
    <div style={{ maxWidth: 980 }}>
      <div style={{
        fontSize: 12,
        color: 'var(--primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontWeight: 800,
        marginBottom: 7,
      }}>{eyebrow}</div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(30px, 4.4vw, 48px)',
        lineHeight: 1.02,
        letterSpacing: '0',
        margin: 0,
      }}>{title}</h2>
      <p style={{
        margin: '14px 0 0',
        color: 'var(--ink-soft)',
        fontSize: 17,
        lineHeight: 1.58,
      }}>{text}</p>
    </div>
  );
}

function LearningPathCard({ icon, title, label, text, button, active, disabled, onClick }) {
  const IconC = Icon[icon];
  return (
    <div style={{
      border: `1.5px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
      borderRadius: 8,
      padding: 20,
      background: disabled ? 'rgba(255,255,255,0.72)' : 'var(--surface)',
      boxShadow: active ? '0 14px 30px rgba(232,93,44,0.12)' : 'var(--shadow-sm)',
      opacity: disabled ? 0.82 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: active ? 'var(--primary)' : 'var(--accent-soft)',
          color: active ? '#fff' : 'var(--accent)',
          display: 'grid',
          placeItems: 'center',
        }}>
          <IconC size={22}/>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, margin: 0, lineHeight: 1.1 }}>{title}</h3>
        </div>
      </div>
      <p style={{ margin: '0 0 18px', color: 'var(--ink-soft)', fontSize: 15.5, lineHeight: 1.55 }}>{text}</p>
      <button onClick={onClick} disabled={disabled} style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '11px 14px',
        borderRadius: 10,
        background: disabled ? 'var(--line)' : active ? 'var(--primary)' : 'var(--ink)',
        color: disabled ? 'var(--ink-mute)' : '#fff',
        fontWeight: 800,
        fontSize: 14,
        cursor: disabled ? 'default' : 'pointer',
      }}>
        {button}
        {!disabled && <Icon.ArrowR size={15}/>}
      </button>
    </div>
  );
}

// ============ Main App ============

function viewFromHash(hash) {
  if (hash === '#booth') return 'booth';
  if (hash === '#feedback') return 'feedback';
  return 'home';
}

function MobileBackToTop({ visible, onClick }) {
  return (
    <button
      className={`mobile-back-to-top${visible ? ' is-visible' : ''}`}
      onClick={onClick}
      aria-label="Return to top"
      title="Return to top"
    >
      <span aria-hidden="true">↑</span>
      <span>Top</span>
    </button>
  );
}

function App() {
  const initialHash = window.location.hash;
  const [selectedLearner, setSelectedLearner] = useS('learner_0');
  const [view, setView] = useS(viewFromHash(initialHash));
  const audioPlayer = useAudioPlayer();
  const [audioManifest, setAudioManifest] = useS(null);
  const [showBackToTop, setShowBackToTop] = useS(false);
  const [courseState, setCourseState] = useS({
    status: 'loading',
    config: COURSE_CONFIGS.learner_0,
    lessons: [],
    error: null,
  });
  const [currentLesson, setCurrentLesson] = useS(null);

  useE(() => {
    document.documentElement.dataset.theme = '';
    document.documentElement.style.setProperty('--reading-size', '17px');
    document.documentElement.style.setProperty('--font-display', "'Bricolage Grotesque', sans-serif");
    document.documentElement.style.setProperty('--font-body', "'Lexend', sans-serif");
  }, []);

  useE(() => {
    const routeFromHash = () => {
      setView(viewFromHash(window.location.hash));
    };
    routeFromHash();
    window.addEventListener('hashchange', routeFromHash);
    return () => window.removeEventListener('hashchange', routeFromHash);
  }, []);

  useE(() => {
    let cancelled = false;
    audioPlayer.stop();
    setCourseState((state) => ({
      ...state,
      status: 'loading',
      config: COURSE_CONFIGS[selectedLearner] || COURSE_CONFIGS.learner_0,
      error: null,
    }));

    loadLearnerCourse(selectedLearner)
      .then(({ config, lessons }) => {
        if (cancelled) return;
        setCourseState({ status: 'ready', config, lessons, error: null });
        setCurrentLesson(lessons[0]?.id || null);
        window.scrollTo({ top: 0, behavior: 'auto' });
      })
      .catch((err) => {
        if (cancelled) return;
        setCourseState({
          status: 'error',
          config: COURSE_CONFIGS[selectedLearner] || COURSE_CONFIGS.learner_0,
          lessons: [],
          error: err,
        });
      });

    return () => { cancelled = true; };
  }, [selectedLearner]);

  useE(() => {
    let cancelled = false;
    const manifestPath = COURSE_CONFIGS[selectedLearner]?.audioManifestPath;
    setAudioManifest(null);
    if (!manifestPath) return () => { cancelled = true; };

    fetch(manifestPath, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((manifest) => {
        if (!cancelled) setAudioManifest(manifest);
      })
      .catch(() => {
        if (!cancelled) setAudioManifest(null);
      });

    return () => { cancelled = true; };
  }, [selectedLearner]);

  const lessons = courseState.lessons;
  const lesson = lessons.find(l => l.id === currentLesson) || lessons[0];
  const lessonIndex = Math.max(0, lessons.findIndex(l => l.id === lesson?.id));
  const setHash = (hash) => {
    if (window.history?.replaceState) window.history.replaceState(null, '', hash || window.location.pathname);
  };
  const goHome = () => {
    setHash('');
    setView('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const openPage = (hash, nextView) => {
    setHash(hash);
    setView(nextView);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  };
  const openBooth = () => openPage('#booth', 'booth');
  const startLearning = (learnerId = selectedLearner) => {
    setHash('');
    setSelectedLearner(learnerId);
    setView('lesson');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  const goToLesson = (lessonId) => {
    setCurrentLesson(lessonId);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  };

  useE(() => {
    if (!['booth', 'feedback'].includes(view)) return;
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [view]);

  useE(() => {
    if (view !== 'lesson') {
      setShowBackToTop(false);
      return;
    }
    const onScroll = () => setShowBackToTop(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopBar
        course={courseState.config}
        selectedLearner={selectedLearner}
        audienceOptions={AUDIENCE_OPTIONS}
        onPickLearner={setSelectedLearner}
        onGoHome={goHome}
        loading={courseState.status === 'loading'}
        hideAudienceSwitch={view === 'booth'}
      />

      <main style={{
        width: '100%',
        maxWidth: view === 'booth' ? 'none' : 1120,
        margin: '0 auto',
        background: 'var(--surface)',
        minHeight: 'calc(100vh - 64px)',
        boxShadow: view === 'booth' ? 'none' : '0 0 0 1px var(--line-soft)',
      }}>
        {view === 'home' && (
          <HomePage
            currentCourse={courseState.config}
            selectedLearner={selectedLearner}
            onStart={startLearning}
            onPickLearner={setSelectedLearner}
            onOpenBooth={openBooth}
          />
        )}

        {view === 'booth' && (
          <BoothPage
            selectedLearner={selectedLearner}
            onPickLearner={setSelectedLearner}
            onStart={startLearning}
            onGoHome={goHome}
          />
        )}

        {view === 'feedback' && (
          <FeedbackPage onGoHome={goHome}/>
        )}

        {view === 'lesson' && courseState.status === 'error' && (
          <div style={{ padding: '48px clamp(20px, 5vw, 56px)', color: 'var(--err)' }}>
            Could not load {courseState.config?.label}: {String(courseState.error?.message || courseState.error)}
          </div>
        )}

        {view === 'lesson' && courseState.status === 'loading' && (
          <div style={{ padding: '64px clamp(20px, 5vw, 56px)', color: 'var(--ink-soft)' }}>
            Loading {courseState.config?.label}…
          </div>
        )}

        {view === 'lesson' && courseState.status === 'ready' && lesson && (
          <LessonView
            lesson={lesson}
            course={courseState.config}
            lessonIndex={lessonIndex}
            totalLessons={lessons.length}
            onPrev={() => goToLesson(lessons[Math.max(0, lessonIndex - 1)].id)}
            onNext={() => goToLesson(lessons[Math.min(lessons.length - 1, lessonIndex + 1)].id)}
            hasPrev={lessonIndex > 0}
            hasNext={lessonIndex < lessons.length - 1}
            audioManifest={audioManifest}
            audioPlayer={audioPlayer}
          />
        )}
      </main>
      <MobileBackToTop
        visible={view === 'lesson' && showBackToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
