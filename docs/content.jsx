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
      { id: 's4', label: 'See the Structure', icon: 'Lightbulb' },
      { id: 's5', label: 'Check Yourself', icon: 'Target' },
    ],
    blocks: [
      { kind: 'objectives', title: 'Learning goals', items: [
        "Explain why a score gap between two groups does not, on its own, prove that the program caused the difference.",
        "Name the hidden factor that can inflate or deflate the gap we see in the data.",
        "Describe what it would mean to truly ___change the system___ to find out whether tutoring works.",
      ]},
      { kind: 'section', id: 's1', eyebrow: 'Section 1', title: 'The Tutoring Puzzle' },
      { kind: 'p', text: "A school report lands on the table with a bold headline: ___students who received tutoring scored higher on the end-of-term test___. Sounds like proof that tutoring works, right?" },
      { kind: 'p', text: "Not so fast. Before we celebrate, we need to ask one question: ___were the two groups already different before tutoring ever started?___ That single question is the heart of causal thinking." },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_00.png', caption: "A school noticeboard shows a score gap between tutored and not-tutored students. The question is what is behind that gap.", alt: 'A school noticeboard with a bar chart where the tutored bar is taller than the not tutored bar'},

      { kind: 'section', id: 's2', eyebrow: 'Section 2', title: 'Before We Dive In' },
      { kind: 'p', text: "Most of us have heard a headline like this and nodded along: ___the tutored group scored higher, so tutoring must have helped___. It feels logical. If $A$ comes before $B$, and $B$ looks better, $A$ must be the reason." },
      { kind: 'p', text: "But here is the catch: the students who received tutoring may have already been different from those who did not — before a single tutoring session happened. In some schools, extra support is directed toward students who are struggling. In others, tutoring is optional or private, and motivated or already high-attaining students may be more likely to sign up. Either way, the two groups are not identical twins waiting to be compared." },
      { kind: 'callout', tone: 'sun', icon: 'Lightbulb', title: 'Key idea',
        text: "When the groups start out different, the gap we see in the final scores is a ___mixture___ — part tutoring effect, part pre-existing difference. Treating the whole gap as proof of tutoring is the misconception we are here to untangle." },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_01.png', caption: "The score gap may include both a tutoring effect and a pre-existing difference between the groups.", alt: 'A bar chart with a translucent layer showing that part of the gap may come from students already being different before tutoring'},

      { kind: 'section', id: 's3', eyebrow: 'Section 3', title: 'Two Roads to a Higher Score' },
      { kind: 'p', text: "Our story has three characters." },
      { kind: 'cards', items: [
        { tag: 'Z', label: 'Prior Achievement', desc: 'What a student already knew before tutoring began.', color: 'sun' },
        { tag: 'T', label: 'Tutoring Assignment', desc: 'Whether that student ended up receiving tutoring.', color: 'primary' },
        { tag: 'Y', label: 'Test Score', desc: 'The later score we want to understand.', color: 'accent' },
      ]},
      { kind: 'p', text: "Here is the key move: ___Prior Achievement does not just affect the final test score directly___ — it also influences who gets tutoring in the first place. That gives us two roads from PriorAchievement to TestScore." },
      { kind: 'roads', roads: [
        { label: 'The direct road', desc: 'A student who already knew a lot walks into the test with an advantage, tutoring or not.', tone: 'sun', note: 'This is the pre-existing difference we need to account for.' },
        { label: 'The tutoring road', desc: 'Prior achievement shapes whether a student is assigned tutoring, and tutoring then shapes the score.', tone: 'primary', hopeful: true, note: 'This is the effect we want to isolate.' },
      ]},
      { kind: 'p', text: "When we simply compare the tutored group to the non-tutored group, we are measuring the combined effect of ___both roads at once___. The raw gap in the bar chart blends them together." },
      { kind: 'p', text: "To isolate what tutoring itself does, we need to balance prior achievement across the two groups on average — or, better still, change the assignment rule ourselves so that prior achievement no longer decides who gets tutoring." },

      { kind: 'section', id: 's4', eyebrow: 'Section 4', title: 'See the Structure' },
      { kind: 'p', text: "The diagram below maps the three characters and their connections. PriorAchievement sits at the top of both paths. It is the hidden driver that touches both sides of the comparison." },
      { kind: 'graph' },
      { kind: 'p', text: "The bar chart the school published lives in the ___observational world___. Both roads are open. The gap between the bars is real, but it carries the fingerprints of prior achievement as well as tutoring." },
      { kind: 'callout', tone: 'accent', icon: 'Sparkle', title: 'So what would actually settle it?',
        text: "That second idea is simple: change the rule ourselves. If students are assigned tutoring by a coin flip, prior achievement no longer decides who gets tutoring, so the hidden road into assignment is broken." },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_02.png', caption: "Left: observational world, where groups may already differ. Right: intervention world, where assignment is independent of prior achievement.", alt: 'Three causal cards with an observational panel and an intervention panel where the link into tutoring assignment is crossed out'},

      { kind: 'section', id: 's5', eyebrow: 'Section 5', title: 'Check Your Understanding' },
      { kind: 'quiz', questions: [
        { q: "The school report shows that tutored students scored 12 points higher on average. What is the most accurate conclusion?",
          options: [
            "Tutoring caused exactly 12 extra points.",
            "The 12-point gap may include a pre-existing difference between the groups, not just a tutoring effect.",
            "The school should immediately stop tutoring because the data is unreliable.",
            "Prior achievement has no effect on test scores.",
          ],
          answer: 1,
          why: "The raw gap blends the tutoring effect with any pre-existing difference between the groups. We cannot read off a pure tutoring effect from the bar chart alone.",
        },
        { q: "In our three-variable story, PriorAchievement influences both TutoringAssignment and TestScore. What do we call a variable that does this — sitting upstream of both the treatment and the outcome?",
          options: [
            "A hidden driver that feeds into both sides of the comparison.",
            "The outcome variable.",
            "The treatment variable.",
            "A variable that only matters after the test.",
          ],
          answer: 0,
          why: "A variable that sits upstream of both the treatment and the outcome is the hidden driver — it shapes who gets treated and also directly affects the outcome, mixing two influences into the comparison.",
        },
        { q: "A researcher decides to assign tutoring by a random lottery, so that prior achievement no longer determines who gets tutoring. What does this change?",
          options: [
            "It makes the test scores disappear from the data.",
            "It removes the direct effect of tutoring on test scores.",
            "It breaks the link between prior achievement and tutoring assignment, so the score gap can more cleanly reflect tutoring's effect.",
            "It proves that prior achievement was never important.",
          ],
          answer: 2,
          why: "Random assignment breaks the road from PriorAchievement to TutoringAssignment. With that link cut, the groups are no longer sorted by prior achievement before tutoring starts, so the score gap can more cleanly reflect what tutoring itself does.",
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
      { id: 'r3', label: 'Changing the Rule', icon: 'Lightbulb' },
      { id: 'r4', label: 'See It Disappear', icon: 'Graph' },
      { id: 'r5', label: 'Check Yourself', icon: 'Target' },
    ],
    blocks: [
      { kind: 'objectives', title: 'Learning goals', items: [
        "Explain what it means to ___change the assignment rule___ for who gets tutoring.",
        "Describe why flipping a coin to assign tutoring gives a cleaner picture than just watching who happened to get it.",
        "Identify which link in the diagram disappears when we intervene on tutoring assignment.",
      ]},
      { kind: 'section', id: 'r1', eyebrow: 'Section 1', title: 'Changing the Rule' },
      { kind: 'p', text: "Imagine a school report lands on your desk. Students who got tutoring scored higher. Great news — but wait. Were those students already different before tutoring started? If so, the score gap might be telling us partly about ___prior knowledge___, not tutoring alone." },
      { kind: 'p', text: "In the last lesson we saw how PriorAchievement quietly shapes both who gets tutoring and how students score. This lesson is about a simple but powerful move: ___what if we take that decision out of the school's hands entirely and flip a coin instead?___" },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_03.png', caption: 'Left: who happened to get tutoring. Right: who we decided to assign by coin flip.', alt: 'A school administrator reviewing student files beside a coin flip assignment list'},

      { kind: 'section', id: 'r2', eyebrow: 'Section 2', title: 'A Common Mix-Up' },
      { kind: 'callout', tone: 'err', icon: 'X', title: 'Common mistake',
        text: "___'If I just look at students who received tutoring, isn't that the same as studying what tutoring does?'___" },
      { kind: 'p', text: "It feels that way — but it is not. When you filter to students who received tutoring, you are looking at a group that may already differ from everyone else. Some schools direct extra support toward students who are struggling; other settings see motivated or already high-attaining students opt in. Either way, the group you end up studying is shaped by something other than tutoring itself." },
      { kind: 'callout', tone: 'accent', icon: 'Check', title: 'What works instead',
        text: "Assigning tutoring ___by design___ — say, by coin flip — is different. You are creating the groups yourself, on your own terms, so that prior achievement no longer determines who ends up where." },

      { kind: 'section', id: 'r3', eyebrow: 'Section 3', title: "What 'Changing the Rule' Actually Means" },
      { kind: 'p', text: "Picture the original situation. The school uses student records to decide who gets tutoring. That means PriorAchievement is quietly steering TutoringAssignment. Students with certain backgrounds are more or less likely to be assigned — and that background ___also___ affects TestScore." },
      { kind: 'p', text: "Now picture a researcher stepping in and saying: ___'We are going to flip a coin for every student. Heads gets tutoring, tails does not.'___ The school's old rule — the one that connected prior achievement to tutoring assignment — is gone. It has been replaced." },
      { kind: 'p', text: "This replacement is what researchers call an ___intervention___: not just observing who got tutoring, but actively deciding who gets it regardless of background." },
      { kind: 'codebox', label: 'Plain-language rule', code: 'Replace the school rule with a coin flip.' },
      { kind: 'p', text: "After that change, the coin is the only thing determining T. Prior achievement still affects test scores directly — that link stays — but it no longer has any say in who gets tutoring. The score gap we measure now is a much cleaner picture of what tutoring itself does." },
      { kind: 'callout', tone: 'sun', icon: 'Lightbulb', title: 'Only one link changes',
        text: "PriorAchievement still influences TestScore. TutoringAssignment still influences TestScore. What disappears is the link from PriorAchievement to TutoringAssignment." },

      { kind: 'section', id: 'r4', eyebrow: 'Section 4', title: 'See the Arrow Disappear' },
      { kind: 'graph', intervention: true },
      { kind: 'figure', src: 'data/learner_0/passive_courses/interventions/imgs/img_04.png', caption: "Before: the school decides. After: the coin flip decides. Only the road into tutoring assignment is cut.", alt: 'Two panels showing the causal graph before and after a coin flip intervention'},

      { kind: 'section', id: 'r5', eyebrow: 'Section 5', title: 'Check Your Understanding' },
      { kind: 'quiz', questions: [
        { q: "A researcher uses a coin flip to decide which students get tutoring. What does this change compared to letting the school assign tutoring as usual?",
          options: [
            "It removes the link between TutoringAssignment and TestScore.",
            "It removes the link between PriorAchievement and TutoringAssignment.",
            "It removes the link between PriorAchievement and TestScore.",
            "It removes all three links at once.",
          ],
          answer: 1,
          why: "The coin flip replaces the school's rule, so prior achievement no longer determines who gets tutoring. That is the one link that disappears. The other two links stay intact.",
        },
        { q: "After the coin-flip intervention, a student who seemed likely to be selected under the old school rule is assigned to the non-tutoring group. Is that possible?",
          options: [
            "Yes — the coin decides, so any student can end up in either group.",
            "No — the original school rule still decides every assignment.",
            "No — prior achievement still controls tutoring assignment.",
            "Only if the school approves the coin result.",
          ],
          answer: 0,
          why: "Once the coin decides, prior achievement has no say in the assignment. Any student can land in either group.",
        },
        { q: "Which of the following best describes changing the tutoring assignment rule to a coin flip?",
          options: [
            "We observe which students chose to attend tutoring on their own.",
            "We filter the data to students who happened to receive tutoring.",
            "We replace the old assignment rule with our own rule — a coin flip — regardless of student background.",
            "We remove the effect of tutoring from the test scores after the fact.",
          ],
          answer: 2,
          why: "The key move is changing the rule ourselves. We are not filtering or adjusting after the fact; we are replacing the original assignment mechanism with our own.",
        },
      ]},
    ],
  },
];

const HEALTHCARE_GRAPH = {
  title: 'Clinic reminder causal map',
  hint: 'Healthcare attendance example',
  interventionPrompt: 'Show coin-flip reminder assignment',
  interventionClosedLabel: 'Coin-flip assignment shown - engagement no longer picks reminders',
  nodes: {
    Z: {
      label: 'Patient\nEngagement',
      tag: 'Z',
      color: 'var(--plum)',
      bg: 'var(--plum-soft)',
    },
    T: {
      label: 'Received\nReminder',
      tag: 'T',
      color: 'var(--primary)',
      bg: 'var(--primary-soft)',
    },
    Y: {
      label: 'Attended\nAppointment',
      tag: 'Y',
      color: 'var(--accent)',
      bg: 'var(--accent-soft)',
    },
  },
  legend: [
    { color: 'var(--plum)', label: 'Hidden upstream factor' },
    { color: 'var(--primary)', label: 'Reminder assignment' },
    { color: 'var(--accent)', label: 'Attendance outcome' },
  ],
};

const HEALTHCARE_VARIABLE_CARDS = [
  {
    tag: 'Z',
    label: 'Patient Engagement',
    desc: 'How engaged, digitally connected, and life-stable a patient already is before any reminder is sent.',
    color: 'plum',
  },
  {
    tag: 'T',
    label: 'Received Reminder',
    desc: "Whether the clinic's system actually sends a text reminder about the appointment.",
    color: 'primary',
  },
  {
    tag: 'Y',
    label: 'Attended Appointment',
    desc: 'Whether the patient walks through the clinic door for that appointment.',
    color: 'accent',
  },
];

const HEALTHCARE_ROADS = [
  {
    label: 'The engagement road',
    desc: 'A patient with a stable routine, a working phone, and a habit of keeping appointments is more likely to show up anyway.',
    tone: 'sun',
    note: 'This is the pre-existing difference that can quietly inflate the attendance gap.',
  },
  {
    label: 'The reminder road',
    desc: 'Patient engagement can shape whether a reminder is received, and the reminder may then shape attendance.',
    tone: 'primary',
    hopeful: true,
    note: 'This is the reminder effect we want to isolate without the hidden driver tilting the comparison.',
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
    audioManifestPath: 'assets/audio/learner_0/interventions/manifest.json',
    lessons: LEARNER0_LESSONS,
  },
  learner_1: {
    learnerId: 'learner_1',
    label: 'Computer science',
    profile: 'CS-ML-BEG',
    courseTitle: 'Directed Acyclic Graph (DAG)',
    courseKicker: 'CS / ML beginner shell',
    jsonPath: 'data/learner_1/passive_courses/directed-acyclic-graph-dag/content.json',
    imageBase: 'data/learner_1/passive_courses/directed-acyclic-graph-dag/imgs',
    nodeEmojis: ['↗', '⇄', '○', '⛔'],
    lessons: null,
  },
  learner_8: {
    learnerId: 'learner_8',
    label: 'Healthcare',
    profile: 'CHAI-HEALTH',
    courseTitle: 'Clinic reminder puzzle',
    courseKicker: 'Healthcare bridge',
    jsonPath: 'data/learner_8/interventions/content.json',
    imageBase: 'data/learner_8/interventions/imgs',
    chapterPrefix: 'Healthcare',
    sectionPrefix: 'Clinic',
    nodeEmojis: ['🏥', '🎲'],
    nodeColors: ['plum', 'accent'],
    graph: HEALTHCARE_GRAPH,
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
  const nodeEmojis = config.nodeEmojis || ['↗', '⇄', '○', '⛔'];
  const nodeColors = config.nodeColors || ['accent', 'sun', 'plum', 'accent'];
  const chapterPrefix = config.chapterPrefix || 'DAG';
  const sectionPrefix = config.sectionPrefix || 'DAG';

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
        eyebrow: `${sectionPrefix} ${nodeIndex + 1}.${sectionIndex + 1}`,
        title: section.section,
      });
      const ctx = {
        nodeTitle: node.node_title,
        sectionTitle: section.section,
        imageLookup,
        stripObjectives: sectionIndex === 0,
        graph: config.graph,
        config,
      };
      blocks.push(...(
        config.learnerId === 'learner_8'
          ? healthcareSectionContentToBlocks(section.content || '', ctx)
          : sectionContentToBlocks(section.content || '', ctx)
      ));
    });

    return {
      id: lessonId,
      chapter: `${chapterPrefix} ${nodeIndex + 1}`,
      title: node.node_title,
      minutes: estimateMinutes(node),
      emoji: nodeEmojis[nodeIndex] || 'DAG',
      color: nodeColors[nodeIndex] || 'accent',
      teaserImage: teaserForLesson(lessonId, imageLookup, nodeIndex),
      blurb: outline.summary || data.anchor_case?.scenario || 'A generated learning shell.',
      sections,
      blocks,
    };
  });
}

function buildImageLookup(imageRefs, imageBase) {
  const lookup = { byKey: {}, sequential: [] };
  imageRefs.forEach((ref, index) => {
    const src = `${imageBase}/img_${String(index).padStart(2, '0')}.png`;
    const caption = visibleImageCaption(ref);
    const item = {
      src,
      alt: imageAltText(ref),
      caption,
    };
    lookup.byKey[`${ref.node_title}::${ref.section}`] = item;
    lookup.sequential.push(item);
  });
  return lookup;
}

function visibleImageCaption(ref) {
  const description = String(ref?.description || '').trim();
  if (!description) return '';
  if (/^(Layout|Style|Scene|Prompt)\s*:/i.test(description)) return '';
  return description;
}

function imageAltText(ref) {
  const description = String(ref?.description || '').trim();
  if (description && !/^(Layout|Style|Scene|Prompt)\s*:/i.test(description)) return description;
  return ref?.section ? `Illustration for ${ref.section}` : 'Course illustration';
}

function imageBlockForSection(ctx) {
  const image = ctx.imageLookup.byKey[`${ctx.nodeTitle}::${ctx.sectionTitle}`];
  return image ? { kind: 'figure', ...image } : null;
}

function pushSectionImage(blocks, ctx) {
  const image = imageBlockForSection(ctx);
  if (image) blocks.push(image);
  return blocks;
}

function healthcareSectionContentToBlocks(content, ctx) {
  if (/check your understanding/i.test(ctx.sectionTitle)) {
    const questions = parseQuizQuestions(content);
    if (questions.length) return [{ kind: 'quiz', questions }];
  }

  const key = `${ctx.nodeTitle}::${ctx.sectionTitle}`;
  if (key === 'The Reminder Puzzle::The Reminder Puzzle') {
    return pushSectionImage([
      { kind: 'p', text: "You get a text from your clinic: ___'Don't forget your appointment tomorrow!'___ Later, the clinic notices that patients who received a text were much more likely to show up." },
      { kind: 'p', text: "Should the clinic celebrate? Did the text reminder ___cause___ better attendance? This lesson starts with that puzzle." },
    ], ctx);
  }

  if (key === 'The Reminder Puzzle::Before We Dive In') {
    return [
      { kind: 'p', text: "Most of us have a natural instinct: if two things happen together, one probably caused the other. Reminded patients show up more, so reminders must work. It feels obvious." },
      { kind: 'callout', tone: 'err', icon: 'Question', title: 'Common trap',
        text: "The patients who received a reminder and the patients who did not may have already been different ___before___ any text was sent." },
      { kind: 'p', text: "Some patients have a stable routine, a charged phone, and a registered mobile number on file. Others are harder to reach, maybe because they move frequently, work unpredictable hours, or have an old number on record." },
      { kind: 'callout', tone: 'sun', icon: 'Lightbulb', title: 'What the gap may hide',
        text: "The attendance gap might be real, but the reminder might deserve less credit than it first appears." },
    ];
  }

  if (key === 'The Reminder Puzzle::Meet the Hidden Driver') {
    return pushSectionImage([
      { kind: 'p', text: 'Our story has three characters.' },
      { kind: 'cards', items: HEALTHCARE_VARIABLE_CARDS },
      { kind: 'callout', tone: 'accent', icon: 'Lightbulb', title: 'Key idea',
        text: "Patient Engagement quietly influences both Received Reminder and Attended Appointment at the same time." },
      { kind: 'roads', roads: HEALTHCARE_ROADS },
      { kind: 'p', text: "That hidden driver is called a ___confounder___. It can make the reminder look more powerful than it really is, because the reminded group may already contain more patients who were likely to attend." },
    ], ctx);
  }

  if (key === 'The Reminder Puzzle::Seeing the Structure') {
    return pushSectionImage([
      { kind: 'p', text: "The diagram below maps the three characters and their connections. Patient Engagement sits upstream of both the reminder and attendance." },
      { kind: 'graph', graph: ctx.graph },
      { kind: 'p', text: "The clinic's record system lives in the ___observational world___. All roads are open, so the attendance gap carries both the possible reminder effect and the fingerprints of engagement." },
      { kind: 'callout', tone: 'accent', icon: 'Sparkle', title: 'So what would actually settle it?',
        text: "We would need to change the reminder rule ourselves: send texts to a randomly chosen mix of patients, regardless of engagement level." },
    ], ctx);
  }

  if (key === 'Changing the Rule::Changing the Rule') {
    return pushSectionImage([
      { kind: 'p', text: "In the last stop we saw the puzzle: patients who got a text reminder attended more often, but highly engaged patients were already more likely to both receive a reminder ___and___ show up." },
      { kind: 'p', text: "This stop asks a simple question: what if the clinic took over the decision of who gets a reminder, ignoring engagement entirely?" },
    ], ctx);
  }

  if (key === 'Changing the Rule::Before We Dive In') {
    return [
      { kind: 'callout', tone: 'err', icon: 'X', title: 'Common mistake',
        text: "___'If I look only at patients who received a reminder, I can see what the reminder does.'___" },
      { kind: 'p', text: "The group who received reminders was not chosen at random. In many clinics, reminders reach patients who already have a valid mobile number on file, stable schedules, and a habit of engaging with healthcare." },
      { kind: 'callout', tone: 'accent', icon: 'Check', title: 'What works instead',
        text: "Filtering to patients who happened to receive a reminder is different from deliberately handing reminders out by design. The second approach takes control away from Patient Engagement." },
    ];
  }

  if (key === "Changing the Rule::What 'Changing the Rule' Actually Means") {
    return [
      { kind: 'p', text: "Normally, the clinic's reminder system follows an unwritten rule: patients who are more engaged, digitally connected, and life-stable are more likely to end up receiving a reminder." },
      { kind: 'p', text: "Now imagine the clinic replaces that rule. A coordinator flips a coin for each eligible patient. Heads: you get the reminder. Tails: you do not." },
      { kind: 'p', text: "Engagement still affects whether someone attends. What changes is that engagement no longer decides who gets the reminder. The coin does." },
      { kind: 'codebox', label: 'Plain-language rule', code: 'Replace clinic targeting with a coin flip.' },
      { kind: 'p', text: "The two groups produced by the coin flip are now mixed: high-engagement and low-engagement patients can appear in both the reminder and no-reminder groups." },
      { kind: 'callout', tone: 'sun', icon: 'Lightbulb', title: 'Only one link changes',
        text: "Patient Engagement still influences attendance. Received Reminder may still influence attendance. What disappears is the link from Patient Engagement to Received Reminder." },
    ];
  }

  if (key === 'Changing the Rule::See the Arrow Disappear') {
    return pushSectionImage([
      { kind: 'p', text: "Here is the causal picture after the clinic flips a coin. The road from Patient Engagement into Received Reminder is the one that disappears." },
      { kind: 'graph', graph: ctx.graph, intervention: true },
      { kind: 'callout', tone: 'accent', icon: 'Sparkle', title: 'What changes about what we can learn?',
        text: "With that link severed, the two reminder groups are no longer systematically different in engagement levels. The attendance difference can more cleanly reflect the reminder's own contribution." },
    ], ctx);
  }

  return sectionContentToBlocks(content, ctx);
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
    pushMarkdownAndGraphs(blocks, text.slice(last, marker.index), ctx);
    const image = ctx.imageLookup.byKey[`${ctx.nodeTitle}::${ctx.sectionTitle}`] || ctx.imageLookup.sequential[0];
    if (image) blocks.push({ kind: 'figure', ...image });
    last = marker.index + marker[0].length;
  }
  pushMarkdownAndGraphs(blocks, text.slice(last), ctx);
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
    if (/^\s*(?:\d+\.\s+|\*\*(?:Question|Q)\s*\d+\.?\*\*)/i.test(line)) questionStarts.push(index);
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
    .replace(/^\s*---\s*/, '')
    .replace(/^\s*\*\*(?:Question|Q)\s*\d+\.?\*\*\s*/i, '')
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
  const re = /\*\*Answer\s+\d+:\s*([A-D])\.?\*\*\s*([\s\S]*?)(?=\n\s*\*\*Answer\s+\d+[\s:(]|<\/details>|$)/gi;
  let match;
  while ((match = re.exec(detailsText)) !== null) {
    answers.push({
      letter: match[1].toUpperCase(),
      why: cleanGeneratedQuizExplanation(match[2].replace(/\n+/g, ' ').trim()),
    });
  }
  return answers;
}

function cleanGeneratedQuizExplanation(text) {
  return String(text || '')
    .replace(/\bOptions?\s+[A-D](?:(?:,\s*(?:and\s+)?|\s+and\s+)[A-D])+\s+/gi, 'The other choices ')
    .replace(/\bOption\s+[A-D]\s+/gi, 'That distractor ')
    .replace(/;\s+The other choices/g, '; the other choices')
    .replace(/;\s+That distractor/g, '; that distractor');
}

function pushMarkdownAndGraphs(blocks, rawText, ctx = {}) {
  const text = rawText.trim();
  if (!text) return;

  const mermaidRe = /```mermaid\s*([\s\S]*?)```/g;
  let last = 0;
  let match;
  while ((match = mermaidRe.exec(text)) !== null) {
    const before = text.slice(last, match.index).trim();
    if (before) blocks.push({ kind: 'markdown', text: before });
    if (ctx.graph) {
      blocks.push({ kind: 'graph', graph: ctx.graph });
    } else {
      blocks.push({
        kind: 'hiring-graph',
        variant: /FORBIDDEN|Y2|same-snapshot/i.test(match[1]) ? 'cycle' : 'base',
      });
    }
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
  const kept = [];
  let skippingObjectives = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^>\s*(?:\*\*)?(?:After this (?:mini[- ]?)?lesson|After this section|you(?:'ll| will) (?:understand|be able))/i.test(trimmed)) {
      skippingObjectives = true;
      continue;
    }
    if (skippingObjectives) {
      if (/^>\s?/.test(trimmed) || trimmed === '') continue;
      skippingObjectives = false;
    }
    kept.push(line);
  }

  return kept.join('\n').trim();
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
