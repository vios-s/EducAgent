// Lesson content — structured for friendly rendering rather than raw markdown.
// Each lesson is a list of "blocks" with a type.

const LEARNER0_LESSONS = [
  {
    id: 'tutoring-puzzle',
    chapter: 'Chapter 1',
    title: 'The Tutoring Puzzle',
    minutes: 6,
    emoji: '🔎',
    color: 'sun',
    teaserImage: 'assets/teaser-tutoring-puzzle.png',
    blurb: "Why a higher score doesn't always mean tutoring worked.",
    sections: [
      { id: 's1', label: 'The Puzzle', icon: 'Question' },
      { id: 's2', label: 'Before We Dive In', icon: 'Compass' },
      { id: 's3', label: 'Two Roads to a Score', icon: 'Map' },
      { id: 's4', label: 'The Hidden Driver', icon: 'Lightbulb' },
      { id: 's5', label: 'Check Yourself', icon: 'Target' },
    ],
    blocks: [
      { kind: 'objectives', title: 'Learning goals', items: [
        "Spot the difference between *noticing a pattern* and *proving a cause*.",
        "Explain why students who get tutoring might already be different from those who don't.",
        "Describe what it would take to truly test whether tutoring itself raises scores.",
      ]},
      { kind: 'section', id: 's1', eyebrow: 'Section 1', title: 'The Tutoring Puzzle' },
      { kind: 'p', text: "A school report lands on the principal's desk. Students who attended tutoring sessions scored noticeably higher on the end-of-term test. The headline practically writes itself: ___Tutoring works!___" },
      { kind: 'p', text: "But wait — does it? Before we celebrate, let's look a little closer at where that score gap might actually be coming from." },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_00.png', caption: "A bright noticeboard shows a bar chart: tutored students scored higher. A magnifying glass asks: but why?" , alt: 'Two bar chart with No Tutoring (short) and Tutoring (tall), magnifying glass over the gap'},

      { kind: 'section', id: 's2', eyebrow: 'Section 2', title: 'Before We Dive In' },
      { kind: 'p', text: "Most of us share the same gut reaction: ___the tutoring caused the higher scores___. It feels obvious — tutored students did better, so tutoring must be the reason." },
      { kind: 'p', text: "This instinct has a blind spot. It assumes the two groups — tutored and not tutored — were identical before tutoring started. In real schools, that is rarely true. Some students sign up because they are already motivated. Others are picked because a teacher spotted early promise. Either way, the groups were different from day one." },
      { kind: 'callout', tone: 'sun', icon: 'Lightbulb', title: 'Key idea',
        text: "When we compare final scores, we are not just measuring what tutoring added — we are also measuring everything those students brought with them before a single session began." },

      { kind: 'section', id: 's3', eyebrow: 'Section 3', title: 'Two Roads to a Higher Score' },
      { kind: 'p', text: "Three things matter in this story:" },
      { kind: 'cards', items: [
        { tag: 'Z', label: 'Prior Achievement', desc: 'What a student already knew before tutoring started.', color: 'sun' },
        { tag: 'T', label: 'Tutoring Assignment', desc: 'Whether the student received tutoring.', color: 'primary' },
        { tag: 'Y', label: 'Test Score', desc: 'The score we want to understand.', color: 'accent' },
      ]},
      { kind: 'p', text: "Here is the key insight: ___Prior Achievement influences both of the other two variables.___ Students with stronger prior achievement are more likely to be assigned to tutoring — and more likely to score well, tutoring or not." },
      { kind: 'roads', roads: [
        { label: 'The tutoring road', desc: 'Tutoring → better test score.', tone: 'primary', hopeful: true },
        { label: 'The hidden road', desc: 'A strong start → picked for tutoring AND → higher score anyway.', tone: 'sun', hopeful: false },
      ]},
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_01.png', caption: "Two roads to the same trophy. Only one is really about tutoring.", alt: 'Two parallel roads ending at the same trophy'},

      { kind: 'section', id: 's4', eyebrow: 'Section 4', title: 'Seeing the Hidden Driver' },
      { kind: 'p', text: "Here is the causal map for our story. The arrows show which variable influences which." },
      { kind: 'graph' },
      { kind: 'p', text: "Notice that ___Prior Achievement___ has arrows pointing to ___both___ TutoringAssignment and TestScore. That makes it a hidden driver — it quietly shapes both sides of the comparison. Causal scientists call this a ___confounder___." },
      { kind: 'callout', tone: 'accent', icon: 'Sparkle', title: 'So what would actually settle it?',
        text: "Imagine a different study: instead of letting prior achievement decide who gets tutoring, we change the rule ourselves — randomly assigning students. In causal language: `do(TutoringAssignment)`. The hidden road closes. Any score gap we see now can only have come through tutoring." },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_02.png', caption: "Before and after: cutting the hidden arrow with random assignment.", alt: 'Two panels comparing the original graph with the do-intervention graph'},

      { kind: 'section', id: 's5', eyebrow: 'Section 5', title: 'Check Your Understanding' },
      { kind: 'quiz', questions: [
        { q: "The school report shows tutored students scored higher. What is the ___safest___ conclusion to draw?",
          options: [
            "Tutoring definitely caused the higher scores.",
            "There is a pattern, but prior achievement might explain part of the gap.",
            "Prior achievement is the only reason for the gap.",
            "The test was too easy for the tutored group.",
          ],
          answer: 1,
          why: "The report shows a pattern, but because students with higher prior achievement were more likely to receive tutoring, the gap could partly reflect what they brought in — not only what tutoring added.",
        },
        { q: "PriorAchievement points to both TutoringAssignment and TestScore. What does this make it?",
          options: [
            "A hidden driver that influences both sides of the comparison.",
            "An outcome we are trying to explain.",
            "A variable that tutoring controls.",
            "An irrelevant background detail.",
          ],
          answer: 0,
          why: "When one variable points to both the treatment and the outcome, it can secretly drive the comparison. That is exactly what a confounder does.",
        },
        { q: "A researcher randomly assigns students to tutoring, ignoring prior achievement. What changes in the causal map?",
          options: [
            "The arrow from TutoringAssignment to TestScore disappears.",
            "The arrow from PriorAchievement to TestScore disappears.",
            "The arrow from PriorAchievement to TutoringAssignment disappears.",
            "A new arrow from TestScore back to TutoringAssignment appears.",
          ],
          answer: 2,
          why: "Random assignment replaces the old mechanism — prior achievement no longer decides who gets tutoring, so the arrow into TutoringAssignment is cut.",
        },
      ]},
    ],
  },
  {
    id: 'changing-the-rule',
    chapter: 'Chapter 2',
    title: 'Changing the Rule',
    minutes: 7,
    emoji: '🎲',
    color: 'accent',
    teaserImage: 'assets/teaser-changing-the-rule.png',
    blurb: "What happens when a coin flip decides — not a teacher's pick.",
    sections: [
      { id: 'r1', label: 'The Coin Flip', icon: 'Sparkle' },
      { id: 'r2', label: 'A Common Mix-Up', icon: 'Compass' },
      { id: 'r3', label: "What 'do()' Means", icon: 'Lightbulb' },
      { id: 'r4', label: 'See It Disappear', icon: 'Graph' },
      { id: 'r5', label: 'Check Yourself', icon: 'Target' },
    ],
    blocks: [
      { kind: 'objectives', title: 'Learning goals', items: [
        "Explain what it means to ___change the assignment rule___ for who gets tutoring.",
        "Describe how a coin-flip assignment cuts the link from PriorAchievement to TutoringAssignment.",
        "Say why the score difference we see ___after___ changing the rule is a cleaner measure of tutoring's own effect.",
      ]},
      { kind: 'section', id: 'r1', eyebrow: 'Section 1', title: 'Changing the Rule' },
      { kind: 'p', text: "Imagine a school that has always let high-achieving students sign up for tutoring first. When you look at the report later, tutored students scored higher — but were they already ahead?" },
      { kind: 'p', text: "This lesson is about one powerful move: instead of ___observing___ who ended up in tutoring, we ___decide___ who gets it, using something like a coin flip. That single change rewrites the story." },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_03.png', caption: 'Left: students choose. Right: the coin chooses.', alt: 'Two scenes — self-selection on left, coin flip on right'},

      { kind: 'section', id: 'r2', eyebrow: 'Section 2', title: 'A Common Mix-Up' },
      { kind: 'callout', tone: 'err', icon: 'X', title: 'Common mistake',
        text: "___'If I just look only at students who happened to get tutoring, I can see what tutoring does.'___ It feels logical — you are focusing on the tutored group, after all." },
      { kind: 'p', text: "But those students did not end up in tutoring by chance. Prior achievement influenced who was assigned. Filtering your view to that group does not remove the influence — it just hides it from sight." },
      { kind: 'callout', tone: 'accent', icon: 'Check', title: 'What works instead',
        text: "We step in and ___replace___ how tutoring gets assigned. Prior achievement no longer has any say." },

      { kind: 'section', id: 'r3', eyebrow: 'Section 3', title: "What 'Changing the Rule' Actually Means" },
      { kind: 'p', text: "Originally, the rule was: ___'Students with higher prior achievement are more likely to get a spot.'___ That rule is the arrow from Z to T." },
      { kind: 'p', text: "When we flip a coin for every student, we replace that rule entirely. The coin does not know anything about prior achievement. So the arrow from Z to T is gone. Researchers call this a ___hard intervention___: one assignment mechanism is swapped out, and the old inputs lose their grip." },
      { kind: 'codebox', label: 'Shorthand', code: 'do(TutoringAssignment := coin flip)' },
      { kind: 'p', text: "Now compare two groups: those whose coin landed on tutoring vs. those whose coin landed on no tutoring. Because the coin ignored prior achievement, both groups are, on average, equally mixed in ability. What remains is tutoring's own effect — clean and direct." },

      { kind: 'section', id: 'r4', eyebrow: 'Section 4', title: 'See the Arrow Disappear' },
      { kind: 'graph' },

      { kind: 'section', id: 'r5', eyebrow: 'Section 5', title: 'Check Your Understanding' },
      { kind: 'quiz', questions: [
        { q: "When we assign tutoring by coin flip, what happens to the arrow from PriorAchievement to TutoringAssignment?",
          options: [
            "It gets stronger because more students are involved.",
            "It is cut — prior achievement no longer determines who gets tutoring.",
            "It reverses direction, so tutoring now affects prior achievement.",
            "Nothing changes; the arrow stays exactly as it was.",
          ],
          answer: 1,
          why: "Changing the rule to a coin flip replaces the old mechanism. Prior achievement no longer has any path into TutoringAssignment.",
        },
        { q: "After the coin-flip assignment, we compare average TestScore in the two groups. What does a difference most likely reflect now?",
          options: [
            "The effect of tutoring itself, because prior achievement is no longer steering who got it.",
            "High-achieving students still signing up on their own.",
            "A mistake in the coin flip.",
            "The direct effect of prior achievement on test scores.",
          ],
          answer: 0,
          why: "Both groups are comparably mixed in ability on average. A score difference now points to tutoring as the cause.",
        },
        { q: "A friend says: 'I can get the same clean answer by just looking only at the low-achieving students who happened to attend tutoring.' What's the problem?",
          options: [
            "There are not enough low-achieving students to study.",
            "Low-achieving students never attend tutoring.",
            "Filtering to students who happened to attend tutoring still reflects the original assignment rule.",
            "It would work perfectly — filtering and coin-flip assignment give identical results.",
          ],
          answer: 2,
          why: "Filtering does not remove the original rule — those students were still selected partly because of prior achievement. Only replacing the rule itself breaks that link.",
        },
      ]},
    ],
  },
];

const COURSE_CONFIGS = {
  learner_0: {
    learnerId: 'learner_0',
    label: 'For everyone',
    profile: 'PUBLIC-BEG',
    courseTitle: 'Interventions',
    courseKicker: 'Public beginner lesson',
    jsonPath: 'data/learner_0/passive_courses/interventions/content.json',
    imageBase: 'data/learner_0/passive_courses/interventions/imgs',
    lessons: LEARNER0_LESSONS,
  },
  learner_1: {
    learnerId: 'learner_1',
    label: 'CS student',
    profile: 'CS-ML-BEG',
    courseTitle: 'Directed Acyclic Graph (DAG)',
    courseKicker: 'CS / ML beginner shell',
    jsonPath: 'data/learner_1/passive_courses/directed-acyclic-graph-dag/content.json',
    imageBase: 'data/learner_1/passive_courses/directed-acyclic-graph-dag/imgs',
    lessons: null,
  },
};

const LESSONS = LEARNER0_LESSONS;

async function loadLearnerCourse(learnerId) {
  const config = COURSE_CONFIGS[learnerId] || COURSE_CONFIGS.learner_0;
  if (config.lessons) {
    return { config, lessons: config.lessons };
  }

  const res = await fetch(config.jsonPath, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load ${config.jsonPath}`);
  const data = await res.json();
  return { config, lessons: transformDagContent(data, config) };
}

function transformDagContent(data, config) {
  const outlineByTitle = Object.fromEntries((data.outline || []).map((o) => [o.title, o]));
  const imageLookup = buildImageLookup(data.image_refs || [], config.imageBase);
  const nodeEmojis = ['↗', '⇄', '○', ':='];
  const nodeColors = ['accent', 'sun', 'plum', 'accent'];

  return (data.nodes || []).map((node, nodeIndex) => {
    const outline = outlineByTitle[node.node_title] || {};
    const lessonId = slugify(node.node_title || `dag-${nodeIndex + 1}`);
    const sections = (node.sections || []).map((section, sectionIndex) => ({
      id: `${lessonId}-${sectionIndex + 1}`,
      label: section.section,
      icon: sectionIcon(section.section),
    }));

    const blocks = [];
    const objectives = extractObjectives(node.sections?.[0]?.content || '');
    if (objectives.length) {
      blocks.push({ kind: 'objectives', title: 'Learning goals', items: objectives });
    }

    (node.sections || []).forEach((section, sectionIndex) => {
      blocks.push({
        kind: 'section',
        id: sections[sectionIndex].id,
        eyebrow: `DAG ${nodeIndex + 1}.${sectionIndex + 1}`,
        title: section.section,
      });
      blocks.push(...sectionContentToBlocks(section.content || '', {
        nodeTitle: node.node_title,
        sectionTitle: section.section,
        imageLookup,
        stripObjectives: sectionIndex === 0,
      }));
    });

    return {
      id: lessonId,
      chapter: `DAG ${nodeIndex + 1}`,
      title: node.node_title,
      minutes: estimateMinutes(node),
      emoji: nodeEmojis[nodeIndex] || 'DAG',
      color: nodeColors[nodeIndex] || 'accent',
      teaserImage: teaserForLesson(lessonId, imageLookup, nodeIndex),
      blurb: outline.summary || data.anchor_case?.scenario || 'A generated DAG learning shell.',
      sections,
      blocks,
    };
  });
}

function buildImageLookup(imageRefs, imageBase) {
  const lookup = { byKey: {}, sequential: [] };
  imageRefs.forEach((ref, index) => {
    const src = `${imageBase}/img_${String(index).padStart(2, '0')}.png`;
    const item = {
      src,
      alt: ref.description || ref.section || 'Course image',
      caption: ref.description || ref.section || '',
    };
    lookup.byKey[`${ref.node_title}::${ref.section}`] = item;
    lookup.sequential.push(item);
  });
  return lookup;
}

function sectionContentToBlocks(content, ctx) {
  let text = ctx.stripObjectives ? stripLeadingObjectiveQuote(content) : content;
  if (/check your understanding/i.test(ctx.sectionTitle)) {
    const questions = parseQuizQuestions(text);
    if (questions.length) return [{ kind: 'quiz', questions }];
  }

  const blocks = [];
  const markerRe = /\[(?:CONTEXT_IMAGE|PEDAGOGICAL_IMAGE):[^\]]+\]/g;
  let last = 0;
  let marker;

  while ((marker = markerRe.exec(text)) !== null) {
    pushMarkdownAndGraphs(blocks, text.slice(last, marker.index));
    const image = ctx.imageLookup.byKey[`${ctx.nodeTitle}::${ctx.sectionTitle}`] || ctx.imageLookup.sequential[0];
    if (image) blocks.push({ kind: 'figure', ...image });
    last = marker.index + marker[0].length;
  }
  pushMarkdownAndGraphs(blocks, text.slice(last));
  return blocks;
}

function teaserForLesson(lessonId, imageLookup, index) {
  const generated = {
    'nodes-edges-and-causal-direction': 'assets/teaser-nodes-edges-and-causal-direction.png',
    'parents-children-and-directed-paths': 'assets/teaser-parents-children-and-directed-paths.png',
    'acyclicity-and-why-causal-graphs-cannot-loop': 'assets/teaser-acyclicity-and-why-causal-graphs-cannot-loop.png',
  };
  return generated[lessonId] || imageLookup.sequential[index]?.src || imageLookup.sequential[0]?.src || null;
}

function parseQuizQuestions(content) {
  const [questionText, detailsText = ''] = content.split(/<details>/i);
  const answers = parseAnswerDetails(detailsText);
  const lines = questionText.split(/\r?\n/);
  const questionStarts = [];

  lines.forEach((line, index) => {
    if (/^\s*\d+\.\s+/.test(line)) questionStarts.push(index);
  });

  return questionStarts.map((start, qi) => {
    const end = questionStarts[qi + 1] ?? lines.length;
    const chunk = lines.slice(start, end).join('\n').trim();
    return parseQuizChunk(chunk, answers[qi] || {});
  }).filter(Boolean);
}

function parseQuizChunk(chunk, answerInfo) {
  const optionRe = /^\s*([A-D])\.\s+(.+)$/gm;
  const options = [];
  let match;
  while ((match = optionRe.exec(chunk)) !== null) {
    options.push({ letter: match[1], text: match[2].trim() });
  }
  if (!options.length) return null;

  const firstOption = chunk.search(/^\s*[A-D]\.\s+/m);
  const rawQuestion = firstOption >= 0 ? chunk.slice(0, firstOption).trim() : chunk.trim();
  const question = rawQuestion
    .replace(/^\s*\d+\.\s*/, '')
    .replace(/^\*\*[^*]+?\.\*\*\s*/, '')
    .trim();
  const answerLetter = answerInfo.letter || 'A';
  const answerIndex = Math.max(0, options.findIndex((o) => o.letter === answerLetter));

  return {
    q: question,
    options: options.map((o) => o.text),
    answer: answerIndex,
    why: answerInfo.why || 'Review the explanation above and try tracing the arrows again.',
  };
}

function parseAnswerDetails(detailsText) {
  const answers = [];
  const re = /\*\*Answer\s+\d+:\s*([A-D])\.?\*\*\s*([\s\S]*?)(?=\n\s*\*\*Answer\s+\d+:|<\/details>|$)/gi;
  let match;
  while ((match = re.exec(detailsText)) !== null) {
    answers.push({
      letter: match[1].toUpperCase(),
      why: match[2].replace(/\n+/g, ' ').trim(),
    });
  }
  return answers;
}

function pushMarkdownAndGraphs(blocks, rawText) {
  const text = rawText.trim();
  if (!text) return;

  const mermaidRe = /```mermaid\s*([\s\S]*?)```/g;
  let last = 0;
  let match;
  while ((match = mermaidRe.exec(text)) !== null) {
    const before = text.slice(last, match.index).trim();
    if (before) blocks.push({ kind: 'markdown', text: before });
    blocks.push({
      kind: 'hiring-graph',
      variant: /FORBIDDEN|Y2|same-snapshot/i.test(match[1]) ? 'cycle' : 'base',
    });
    last = match.index + match[0].length;
  }

  const rest = text.slice(last).trim();
  if (rest) blocks.push({ kind: 'markdown', text: rest });
}

function extractObjectives(content) {
  const lines = content.split(/\r?\n/);
  const objectives = [];
  for (const line of lines) {
    const cleaned = line.replace(/^>\s?/, '').trim();
    const objective = cleaned.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (line.startsWith('>') && objective) objectives.push(objective[1]);
    if (!line.startsWith('>') && objectives.length) break;
  }
  return objectives;
}

function stripLeadingObjectiveQuote(content) {
  const lines = content.split(/\r?\n/);
  let i = 0;
  while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) i += 1;
  return lines.slice(i).join('\n').trim();
}

function estimateMinutes(node) {
  const words = (node.sections || [])
    .map((s) => s.content || '')
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(5, Math.min(12, Math.round(words / 180)));
}

function sectionIcon(title) {
  if (/check|understanding/i.test(title)) return 'Target';
  if (/graph|dag|pipeline/i.test(title)) return 'Graph';
  if (/why|dive/i.test(title)) return 'Compass';
  return 'Book';
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'lesson';
}

Object.assign(window, { COURSE_CONFIGS, LEARNER0_LESSONS, LESSONS, loadLearnerCourse });
