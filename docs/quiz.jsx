// Interactive quiz component
const { useState: useStateQ } = React;

function InteractiveQuiz({ questions }) {
  const [picks, setPicks] = useStateQ({});
  const [revealed, setRevealed] = useStateQ({});
  const [current, setCurrent] = useStateQ(0);

  const allAnswered = questions.every((_, i) => revealed[i]);
  const correctCount = questions.filter((q, i) => revealed[i] && picks[i] === q.answer).length;

  const pick = (qi, oi) => {
    if (revealed[qi]) return;
    setPicks(p => ({ ...p, [qi]: oi }));
  };
  const submit = (qi) => {
    if (picks[qi] === undefined) return;
    setRevealed(r => ({ ...r, [qi]: true }));
  };
  const next = () => setCurrent(c => Math.min(c + 1, questions.length - 1));
  const prev = () => setCurrent(c => Math.max(c - 1, 0));
  const reset = () => { setPicks({}); setRevealed({}); setCurrent(0); };

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      border: '2px solid var(--accent-soft)',
      boxShadow: 'var(--shadow)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--surface) 82%)',
        borderBottom: '1px solid var(--accent-soft)',
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: 14,
          background: 'var(--accent)', color: '#fff',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 12px rgba(43,166,140,0.22)',
        }}>
          <Icon.Target size={22}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>Check your understanding</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Question {current + 1} <span style={{ color: 'var(--ink-mute)', fontWeight: 600 }}>of {questions.length}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {questions.map((_, i) => {
            const r = revealed[i];
            const correct = r && picks[i] === questions[i].answer;
            const bg = r ? (correct ? 'var(--ok)' : 'var(--err)') : (i === current ? 'var(--accent)' : 'var(--line)');
            return (
              <button key={i} aria-label={`Go to question ${i+1}`} onClick={() => setCurrent(i)} style={{
                width: 24, height: 8, borderRadius: 6, background: bg,
                opacity: i === current ? 1 : 0.7, transition: 'all .15s',
              }}/>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '24px 28px 8px' }}>
        <QuizQuestion
          q={questions[current]}
          qi={current}
          pick={picks[current]}
          revealed={!!revealed[current]}
          onPick={(oi) => pick(current, oi)}
        />
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        borderTop: '1px solid var(--line-soft)',
        background: 'var(--surface)',
      }}>
        <button onClick={prev} disabled={current === 0} style={{
          padding: '10px 14px', borderRadius: 12, fontWeight: 600, fontSize: 14,
          background: 'transparent', color: current === 0 ? 'var(--ink-mute)' : 'var(--ink-soft)',
          opacity: current === 0 ? 0.5 : 1, cursor: current === 0 ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon.ChevL size={16}/> Previous
        </button>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-mute)', textAlign: 'center' }}>
          {allAnswered ? (
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
              {correctCount} / {questions.length} correct {correctCount === questions.length ? '🎉' : '— review and try again'}
            </span>
          ) : revealed[current] ? (
            picks[current] === questions[current].answer ? '✓ Nice — keep going.' : 'Read the explanation, then move on.'
          ) : (
            'Pick an answer to check it.'
          )}
        </div>
        {!revealed[current] ? (
          <button onClick={() => submit(current)} disabled={picks[current] === undefined} style={{
            padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            background: picks[current] === undefined ? 'var(--line)' : 'var(--primary)',
            color: picks[current] === undefined ? 'var(--ink-mute)' : '#fff',
            cursor: picks[current] === undefined ? 'default' : 'pointer',
            boxShadow: picks[current] !== undefined ? '0 4px 12px rgba(232,93,44,0.25)' : 'none',
            transition: 'all .15s',
          }}>Check answer</button>
        ) : current < questions.length - 1 ? (
          <button onClick={next} style={{
            padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            background: 'var(--ink)', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>Next <Icon.ChevR size={16}/></button>
        ) : (
          <button onClick={reset} style={{
            padding: '10px 18px', borderRadius: 12, fontWeight: 700, fontSize: 14,
            background: 'var(--accent)', color: '#fff',
          }}>Try again</button>
        )}
      </div>
    </div>
  );
}

function QuizQuestion({ q, qi, pick, revealed, onPick }) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em',
        lineHeight: 1.35, marginBottom: 20,
        color: 'var(--ink)',
      }}>
        <FormattedText text={q.q}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map((opt, oi) => {
          const isPicked = pick === oi;
          const isAnswer = oi === q.answer;
          let state = 'default';
          if (revealed) {
            if (isAnswer) state = 'correct';
            else if (isPicked) state = 'wrong';
            else state = 'muted';
          } else if (isPicked) state = 'picked';

          const styles = {
            default: { bg: 'var(--surface)', border: 'var(--line)', ink: 'var(--ink)' },
            picked:  { bg: 'var(--primary-soft)', border: 'var(--primary)', ink: 'var(--ink)' },
            correct: { bg: 'var(--accent-soft)', border: 'var(--ok)', ink: 'var(--ink)' },
            wrong:   { bg: 'var(--err-soft)', border: 'var(--err)', ink: 'var(--ink)' },
            muted:   { bg: 'var(--surface)', border: 'var(--line)', ink: 'var(--ink-mute)' },
          }[state];

          return (
            <button key={oi} onClick={() => onPick(oi)} disabled={revealed} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '14px 16px',
              borderRadius: 14,
              background: styles.bg,
              border: `1.5px solid ${styles.border}`,
              textAlign: 'left',
              color: styles.ink,
              fontSize: 15.5, lineHeight: 1.5,
              cursor: revealed ? 'default' : 'pointer',
              transition: 'all .15s ease',
              fontWeight: state === 'picked' || state === 'correct' || state === 'wrong' ? 500 : 400,
              boxShadow: state === 'picked' ? '0 4px 10px rgba(232,93,44,0.12)' : 'none',
            }}
            onMouseEnter={e => { if (!revealed && !isPicked) { e.currentTarget.style.borderColor = 'var(--ink-mute)'; e.currentTarget.style.background = 'var(--bg-soft)'; } }}
            onMouseLeave={e => { if (!revealed && !isPicked) { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'var(--surface)'; } }}
            >
              <span style={{
                flexShrink: 0,
                width: 28, height: 28, borderRadius: 8,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                background: state === 'correct' ? 'var(--ok)' :
                            state === 'wrong'   ? 'var(--err)' :
                            state === 'picked'  ? 'var(--primary)' : 'var(--bg-soft)',
                color: state === 'correct' || state === 'wrong' || state === 'picked' ? '#fff' : 'var(--ink-soft)',
                border: state === 'default' || state === 'muted' ? '1px solid var(--line)' : 'none',
                transition: 'all .15s',
              }}>
                {state === 'correct' ? <Icon.Check size={16} strokeWidth={3}/> :
                 state === 'wrong' ? <Icon.X size={16} strokeWidth={3}/> :
                 String.fromCharCode(65 + oi)}
              </span>
              <span style={{ flex: 1, paddingTop: 3 }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div style={{
          marginTop: 18,
          padding: '14px 16px 14px 18px',
          borderRadius: 14,
          background: pick === q.answer ? 'var(--accent-soft)' : 'var(--sun-soft)',
          borderLeft: `4px solid ${pick === q.answer ? 'var(--ok)' : 'var(--sun)'}`,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <div style={{
            flexShrink: 0,
            width: 32, height: 32, borderRadius: 10,
            background: pick === q.answer ? 'var(--ok)' : 'var(--sun)',
            color: '#fff',
            display: 'grid', placeItems: 'center',
          }}>
            {pick === q.answer ? <Icon.Check size={18} strokeWidth={3}/> : <Icon.Lightbulb size={18}/>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 4 }}>
              {pick === q.answer ? 'You got it.' : 'Not quite — here\'s why:'}
            </div>
            <div style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>
              <FormattedText text={q.why}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { InteractiveQuiz });
