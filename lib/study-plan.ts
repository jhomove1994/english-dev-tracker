import { ALL_STUDY_WEEKS, STUDY_PHASES, type StudyPhase, type StudyWeek } from '@/lib/data/study-plan'

export const LESSON_CHECKS_STORAGE_KEY = 'study_plan_lesson_checks'
export const WEEK_CHECKPOINTS_STORAGE_KEY = 'study_plan_week_checkpoints'
export const DAY_CHECKS_STORAGE_KEY = 'study_plan_day_checks'
export const DAY_WRITING_STORAGE_KEY = 'study_plan_day_writing'
export const DAY_AI_FEEDBACK_STORAGE_KEY = 'study_plan_day_ai_feedback'

const STUDY_AI_VALIDATION_MODE = {
  WRITING: 'writing',
  SPEAKING: 'speaking',
} as const

type StudyAiValidationMode = (typeof STUDY_AI_VALIDATION_MODE)[keyof typeof STUDY_AI_VALIDATION_MODE]

export interface StudyDayPlan {
  day: number
  title: string
  focus: string
  minutes: string
  agenda: string[]
  deliverable: string
  successCheck: string
}

export interface StudySupportVocabulary {
  term: string
  meaning: string
  whyItMatters: string
}

export interface StudyGrammarPoint {
  id: string
  title: string
  pattern: string
  whenToUse: string
  example: string
  commonError: string
}

export interface StudyDayPrerequisite {
  vocabulary: StudySupportVocabulary[]
  grammar: StudyGrammarPoint[]
  warmUp: string[]
}

export interface StudyDaySectionSupport {
  simpleExplanation: string[]
  spanishHint: string
  keyVocabulary: StudySupportVocabulary[]
  grammarCoach: StudyGrammarPoint[]
  checkQuestion: string
}

export interface StudyDaySection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
  support: StudyDaySectionSupport
}

export interface StudyDayActivitySupport {
  steps: string[]
  sentenceStarters: string[]
  canDoCheck: string
}

export interface StudyDayWritingActivity {
  id: string
  title: string
  instructions: string
  placeholder: string
  support: StudyDayActivitySupport
}

export interface StudyDayReference {
  id: string
  title: string
  channel: string
  url: string
  whyToday: string
}

export interface StudyGlossaryTerm {
  id: string
  term: string
  definition: string
  classMeaning: string
  useItWhen: string
  contrast: string
  miniPractice: string
  example: string
  flashcardBack: string
}

export interface StudyYouTubeVideo {
  title: string
  channel: string
  url: string
  whyThisVideo: string
}

export interface StudyAiToolRecommendation {
  id: string
  name: string
  url: string
  bestFor: string
  whyItHelps: string
}

export interface StudyAiSavedField {
  id: string
  label: string
  placeholder: string
  helper: string
}

export interface StudyAiPrompt {
  id: string
  label: string
  intro: string
  instructions: string[]
  template: string
}

export interface StudyAiValidationTrack {
  mode: StudyAiValidationMode
  title: string
  objective: string
  toolRecommendations: StudyAiToolRecommendation[]
  workflow: string[]
  rubric: string[]
  prompt: StudyAiPrompt
  savedFields: StudyAiSavedField[]
}

export interface StudyAiValidation {
  intro: string
  honestyNote: string
  writing: StudyAiValidationTrack
  speaking: StudyAiValidationTrack
}

export interface StudyDayClass {
  id: string
  slug: string
  day: number
  title: string
  objective: string
  minutes: string
  focus: string
  sections: StudyDaySection[]
  writtenActivities: StudyDayWritingActivity[]
  checks: string[]
  references: StudyDayReference[]
  youtubeVideo: StudyYouTubeVideo
  glossary: StudyGlossaryTerm[]
  prerequisites: StudyDayPrerequisite
  supportModeIntro: string
  aiValidation: StudyAiValidation
}

type StudyDaySectionSeed = Omit<StudyDaySection, 'id' | 'support'>

type StudyDayWritingActivitySeed = Omit<StudyDayWritingActivity, 'support'>

type StudyDayClassSeed = Omit<
  StudyDayClass,
  'aiValidation' | 'prerequisites' | 'supportModeIntro' | 'sections' | 'writtenActivities'
> & {
  sections: StudyDaySectionSeed[]
  writtenActivities: StudyDayWritingActivitySeed[]
}

function getWeekDayId(week: StudyWeek, day: number) {
  return `${week.id}-day-${day}`
}

function fillSupportBlank(frame: string) {
  return frame.replace(/___/g, 'your example')
}

function buildSupportVocabulary(glossary: StudyGlossaryTerm[], count: number): StudySupportVocabulary[] {
  return glossary.slice(0, count).map((item) => ({
    term: item.term,
    meaning: item.definition,
    whyItMatters: item.classMeaning,
  }))
}

function buildGrammarPoints(week: StudyWeek, day: number): StudyGrammarPoint[] {
  const lesson1 = week.lessons[0]
  const lesson3 = week.lessons[2]
  const speakingFrame = fillSupportBlank(lesson1?.sentenceFrames[0] ?? 'I am a your example developer.')
  const interviewFrame = fillSupportBlank(lesson3?.sentenceFrames[0] ?? 'In that project, I worked on your example.')

  const grammarByDay: Record<number, StudyGrammarPoint[]> = {
    1: [
      {
        id: `${week.id}-day-1-grammar-1`,
        title: 'Subject + be',
        pattern: 'I am / You are / He is',
        whenToUse: 'Use this when you introduce yourself, your role, or your current situation.',
        example: speakingFrame,
        commonError: 'Do not say “I developer” or “I is”. Keep the verb be.',
      },
      {
        id: `${week.id}-day-1-grammar-2`,
        title: 'Present simple for routines',
        pattern: 'I work with / I build / I use',
        whenToUse: 'Use present simple for your regular stack, habits, and normal responsibilities.',
        example: 'I work with React and TypeScript.',
        commonError: 'Do not force progressive forms for every sentence like “I am work with React”.',
      },
      {
        id: `${week.id}-day-1-grammar-3`,
        title: 'Because for a simple reason',
        pattern: '... because ...',
        whenToUse: 'Use because to explain why you enjoy a task or why something matters.',
        example: 'I enjoy frontend work because I like improving usability.',
        commonError: 'After because, say a full reason instead of stopping too early.',
      },
    ],
    2: [
      {
        id: `${week.id}-day-2-grammar-1`,
        title: 'Past simple for stories',
        pattern: 'I worked / I fixed / I improved',
        whenToUse: 'Use past simple to explain what happened in a finished project or interview story.',
        example: interviewFrame,
        commonError: 'Do not mix present and past randomly inside the same short story.',
      },
      {
        id: `${week.id}-day-2-grammar-2`,
        title: 'Result sentence',
        pattern: 'As a result, ...',
        whenToUse: 'Use a result sentence to show impact after the action.',
        example: 'As a result, the team released faster.',
        commonError: 'Do not end the story without an outcome.',
      },
      {
        id: `${week.id}-day-2-grammar-3`,
        title: 'Linking ideas with and / but / so',
        pattern: '... and ... / ... but ... / ... so ...',
        whenToUse: 'Use short connectors to keep your answer organized without sounding too advanced.',
        example: 'The bug was small, but it blocked the deploy, so I fixed it first.',
        commonError: 'Do not write many disconnected short sentences if one connector makes the flow clearer.',
      },
    ],
    3: [
      {
        id: `${week.id}-day-3-grammar-1`,
        title: 'Question words for comprehension',
        pattern: 'What / Why / How',
        whenToUse: 'Use these words to check whether you understood the source and to build your own notes.',
        example: 'What is the main idea? Why does it matter? How can I reuse it?',
        commonError: 'Do not take notes only as nouns; build one short question and one short answer.',
      },
      {
        id: `${week.id}-day-3-grammar-2`,
        title: 'There is / there are',
        pattern: 'There is / There are',
        whenToUse: 'Use this to describe what exists inside a source, article, system, or example.',
        example: 'There are three key phrases in this video.',
        commonError: 'Match singular with there is and plural with there are.',
      },
      {
        id: `${week.id}-day-3-grammar-3`,
        title: 'Short note structure',
        pattern: 'Main idea + phrase + application',
        whenToUse: 'Use this mini structure to avoid notes that feel random.',
        example: 'Main idea: clear delivery. Phrase: reduce risk. Application: I can use this in standups.',
        commonError: 'Do not copy whole paragraphs when a short structure is enough.',
      },
    ],
    4: [
      {
        id: `${week.id}-day-4-grammar-1`,
        title: 'Comparing versions',
        pattern: 'This version is clearer / shorter / more precise',
        whenToUse: 'Use comparatives when you explain why the second version improved.',
        example: 'The second version is shorter and more precise.',
        commonError: 'Do not say only “better”; say what is better.',
      },
      {
        id: `${week.id}-day-4-grammar-2`,
        title: 'One problem at a time',
        pattern: 'The main issue is ...',
        whenToUse: 'Use this sentence to diagnose one weakness before rewriting.',
        example: 'The main issue is vague vocabulary.',
        commonError: 'Do not say everything is wrong when one main problem is enough to start.',
      },
      {
        id: `${week.id}-day-4-grammar-3`,
        title: 'Exact nouns',
        pattern: 'endpoint / payload / bug / deploy / branch',
        whenToUse: 'Use exact nouns to replace vague words like thing or stuff.',
        example: 'The payload was incomplete, so the endpoint returned an error.',
        commonError: 'Do not hide technical meaning behind generic nouns.',
      },
    ],
    5: [
      {
        id: `${week.id}-day-5-grammar-1`,
        title: 'Present perfect for progress',
        pattern: 'I have improved / I have learned',
        whenToUse: 'Use present perfect when you talk about progress up to now.',
        example: 'I have improved my self-introduction this week.',
        commonError: 'Do not use past simple if the focus is your progress until today.',
      },
      {
        id: `${week.id}-day-5-grammar-2`,
        title: 'Still / already / not yet',
        pattern: 'I still need / I already can / I am not ready yet',
        whenToUse: 'Use these words in honest self-assessment and next-step planning.',
        example: 'I already can explain my stack, but I still need more vocabulary.',
        commonError: 'Do not make the reflection too extreme; these markers help you be more exact.',
      },
      {
        id: `${week.id}-day-5-grammar-3`,
        title: 'Next-week plan',
        pattern: 'Next week I will ...',
        whenToUse: 'Use a short future sentence to define the next action.',
        example: 'Next week I will review the same phrases before recording again.',
        commonError: 'Do not end the week without one concrete next action.',
      },
    ],
  }

  return grammarByDay[day] ?? grammarByDay[1]
}

function buildPrerequisites(week: StudyWeek, day: number, glossary: StudyGlossaryTerm[]): StudyDayPrerequisite {
  const grammar = buildGrammarPoints(week, day)
  const vocabulary = buildSupportVocabulary(glossary, 6)

  return {
    vocabulary,
    grammar,
    warmUp: [
      `Read these 3 words aloud: ${vocabulary.slice(0, 3).map((item) => item.term).join(', ')}.`,
      `Study one grammar frame first: ${grammar[0]?.pattern ?? 'I am / I work / I use'}.`,
      'Write one short sentence only, then expand to three sentences after you feel more secure.',
    ],
  }
}

function buildSectionSupport(
  dayClassId: string,
  section: StudyDaySectionSeed,
  sectionIndex: number,
  glossary: StudyGlossaryTerm[],
  grammar: StudyGrammarPoint[]
): StudyDaySection {
  const simpleExplanationByTitle = [
    {
      match: ['Teacher explanation'],
      simple: [
        'Do not try to understand every detail at once. Focus on one main idea and one useful sentence.',
        'Your goal here is to understand the topic enough to reuse a short version in your own English.',
      ],
      spanishHint: 'Idea simple: entiende la idea principal primero, no todos los detalles.',
      question: 'What is the one main idea of this section in your own easy English?',
    },
    {
      match: ['Guided model', 'Model and correction logic', 'What stronger work looks like'],
      simple: [
        'Copy the model first. Change only one part at a time.',
        'A model is a bridge: first imitate, then personalize.',
      ],
      spanishHint: 'Usa el ejemplo como puente: primero copia la estructura, luego cambia detalles.',
      question: 'Which sentence from the model can you reuse today with your own information?',
    },
    {
      match: ['Listening classroom', 'During the resource', 'Before you open the resource', 'After the resource'],
      simple: [
        'Listen or read for the main message, not for every unknown word.',
        'Pause and say one short summary with your own words before continuing.',
      ],
      spanishHint: 'No necesitas entender todo; busca la idea principal y una frase util.',
      question: 'Can you say the main message in one short sentence?',
    },
    {
      match: ['Mistakes to avoid', 'Why correction matters', 'How to revise intelligently'],
      simple: [
        'This section tells you what usually goes wrong and how to fix one thing first.',
        'Choose one problem only. Fixing one problem well is better than touching everything badly.',
      ],
      spanishHint: 'Corrige una cosa a la vez para no bloquearte.',
      question: 'What is the biggest problem you need to fix first?',
    },
    {
      match: ['What assessment means', 'How to close the week', 'Reflection'],
      simple: [
        'You do not need perfect English. You need honest proof that you can do the task.',
        'Use simple grammar, but make your answer real and clear.',
      ],
      spanishHint: 'La meta no es perfeccion; la meta es probar que puedes hacerlo con claridad.',
      question: 'What evidence shows that you really completed this class?',
    },
  ]

  const matched =
    simpleExplanationByTitle.find((entry) => entry.match.some((text) => section.title.includes(text))) ??
    {
      simple: [
        'Read this section slowly and stop after each short idea.',
        'If a sentence feels too hard, keep only the main message and one example.',
      ],
      spanishHint: 'Lee lento y rescata idea principal + ejemplo.',
      question: 'What is the most useful idea from this section?',
    }

  return {
    id: `${dayClassId}-section-${sectionIndex + 1}`,
    title: section.title,
    paragraphs: section.paragraphs,
    bullets: section.bullets,
    support: {
      simpleExplanation: matched.simple,
      spanishHint: matched.spanishHint,
      keyVocabulary: buildSupportVocabulary(
        glossary.slice(sectionIndex * 2, sectionIndex * 2 + 3).length > 0
          ? glossary.slice(sectionIndex * 2, sectionIndex * 2 + 3)
          : glossary.slice(0, 3),
        3
      ),
      grammarCoach: grammar.slice(sectionIndex % grammar.length, (sectionIndex % grammar.length) + 2).length > 0
        ? grammar.slice(sectionIndex % grammar.length, (sectionIndex % grammar.length) + 2)
        : grammar,
      checkQuestion: matched.question,
    },
  }
}

function buildActivitySupport(
  activity: StudyDayWritingActivitySeed,
  sentenceStarters: string[]
): StudyDayWritingActivity {
  return {
    ...activity,
    support: {
      steps: [
        'Step 1: write only one short sentence using one frame or one starter.',
        'Step 2: expand that idea into three connected sentences.',
        'Step 3: add one technical detail, example, or result.',
        'Step 4: only then write the full answer.',
      ],
      sentenceStarters,
      canDoCheck: 'If the full answer feels hard, stop at three clear sentences first. That still counts as real progress.',
    },
  }
}

function buildSupportModeIntro(day: number) {
  const intros: Record<number, string> = {
    1: 'Support mode for today: understand the idea, collect a few words, and build one correct sentence before trying a full answer.',
    2: 'Support mode for today: choose one real story, use simple past where needed, and keep your message short and structured.',
    3: 'Support mode for today: study the resource slowly, pause often, and convert input into one short summary or note.',
    4: 'Support mode for today: diagnose one weakness only, then make the second version visibly clearer.',
    5: 'Support mode for today: reflect honestly with simple English. Clarity matters more than complexity.',
  }

  return intros[day] ?? intros[1]
}

function buildAiToolRecommendations(mode: StudyAiValidationMode): StudyAiToolRecommendation[] {
  return [
    {
      id: `${mode}-chatgpt`,
      name: 'ChatGPT',
      url: 'https://chatgpt.com',
      bestFor:
        mode === STUDY_AI_VALIDATION_MODE.WRITING
          ? 'Fast correction of grammar, clarity, and rewritten examples.'
          : 'Fast analysis of a transcript plus speaking feedback.',
      whyItHelps: 'Easy copy/paste workflow for short tasks and quick teacher-style comments.',
    },
    {
      id: `${mode}-gemini`,
      name: 'Gemini',
      url: 'https://gemini.google.com',
      bestFor:
        mode === STUDY_AI_VALIDATION_MODE.WRITING
          ? 'Comparing two versions and checking whether the second one improved.'
          : 'Evaluating spoken answers with rubric-style feedback and follow-up drills.',
      whyItHelps: 'Usually generous on the free tier and good for structured feedback requests.',
    },
    {
      id: `${mode}-claude`,
      name: 'Claude',
      url: 'https://claude.ai',
      bestFor:
        mode === STUDY_AI_VALIDATION_MODE.WRITING
          ? 'Detailed explanations of why a sentence sounds vague, translated, or unnatural.'
          : 'Detailed coaching on clarity, organization, and natural phrasing in transcripts.',
      whyItHelps: 'Strong at nuanced explanations, which is useful when you want to understand the correction.',
    },
  ]
}

function buildWritingPrompt(week: StudyWeek, dayClass: StudyDayClassSeed) {
  const activityList = dayClass.writtenActivities
    .map((activity, index) => `${index + 1}. ${activity.title} — ${activity.instructions}`)
    .join('\n')
  const checks = dayClass.checks.map((check, index) => `${index + 1}. ${check}`).join('\n')
  const references = dayClass.references
    .map((reference) => `- ${reference.title} (${reference.channel}) ${reference.url}`)
    .join('\n')

  return [
    'Act as an English academy teacher for software engineers. Be strict, practical, and supportive.',
    `Course week: ${week.title}`,
    `Class: ${dayClass.title}`,
    `Class objective: ${dayClass.objective}`,
    `Class focus: ${dayClass.focus}`,
    '',
    'Writing tasks from the class:',
    activityList,
    '',
    'Completion checks for the class:',
    checks,
    '',
    'Referenced material:',
    references,
    '',
    'Evaluate my writing using this exact output structure:',
    '1. Overall verdict (2-3 sentences).',
    '2. Grammar corrections (bullet list with original -> improved).',
    '3. Vocabulary/technical precision improvements.',
    '4. Natural phrasing improvements.',
    '5. One rewritten version that keeps my level realistic, not overly advanced.',
    '6. Top 3 mistakes I must avoid next time.',
    '7. One short homework drill for immediate repetition.',
    '',
    'Important rules:',
    '- Diagnose before praising too much.',
    '- Do not rewrite everything in a much more advanced level than mine.',
    '- Keep examples connected to software engineering communication.',
    '- If my answer is vague, say exactly which line is vague and how to make it more concrete.',
    '',
    'Here is my writing:',
  ].join('\n')
}

function buildSpeakingPrompt(week: StudyWeek, dayClass: StudyDayClassSeed) {
  const checks = dayClass.checks.map((check, index) => `${index + 1}. ${check}`).join('\n')
  const speakingTasks = dayClass.writtenActivities
    .map((activity, index) => `${index + 1}. ${activity.title} — transform this into a spoken answer.`)
    .join('\n')

  return [
    'Act as an English speaking coach for a software engineer.',
    `Course week: ${week.title}`,
    `Class: ${dayClass.title}`,
    `Class objective: ${dayClass.objective}`,
    `Class focus: ${dayClass.focus}`,
    '',
    'Speaking tasks for this class:',
    speakingTasks,
    '',
    'Completion checks for the class:',
    checks,
    '',
    'I will paste a transcript from my spoken answer. Evaluate it using this structure:',
    '1. Overall speaking verdict.',
    '2. Fluency and organization feedback.',
    '3. Grammar issues that affected clarity.',
    '4. Vocabulary and technical communication feedback.',
    '5. Pronunciation risks you can infer from the transcript (for example likely word stress or missing endings). Be honest about what cannot be proven from text alone.',
    '6. A better spoken version that still sounds like a learner, not like a native script.',
    '7. One 60-second retry challenge.',
    '',
    'Important rules:',
    '- If the transcript sounds translated, explain why.',
    '- If the answer lacks structure, give me a simple speaking structure to follow.',
    '- If something cannot be judged from transcript alone, state that explicitly instead of inventing certainty.',
    '- Keep the coaching relevant for interviews, meetings, and technical explanations.',
    '',
    'Here is my transcript:',
  ].join('\n')
}

function buildAiValidation(dayClass: StudyDayClassSeed, week: StudyWeek): StudyAiValidation {
  return {
    intro:
      'Use this section after you write or speak. The app teaches and stores your work, and this block gives you a practical way to validate it for free with an external AI teacher.',
    honestyNote:
      'Use AI as a coach, not as a shortcut. First produce your own answer inside the class, then ask for diagnosis, then rewrite or record a stronger second version.',
    writing: {
      mode: STUDY_AI_VALIDATION_MODE.WRITING,
      title: 'Writing validation with free AI',
      objective: 'Check grammar, clarity, and technical precision before you write your second version.',
      toolRecommendations: buildAiToolRecommendations(STUDY_AI_VALIDATION_MODE.WRITING),
      workflow: [
        'Write your first answer in the class textareas before opening any external tool.',
        'Copy one writing task or both tasks into a free AI tool and ask for diagnosis first.',
        'Paste the most useful feedback below so your corrections stay attached to this class.',
        'Write a second version in the class using only the 2-3 most important corrections.',
      ],
      rubric: [
        'Grammar that changes meaning or makes the sentence feel broken.',
        'Clarity and logical order from start to finish.',
        'Technical precision: concrete nouns, correct actions, clear outcomes.',
        'Natural phrasing for software engineering communication.',
        ...dayClass.checks,
      ],
      prompt: {
        id: `${dayClass.id}-writing-prompt`,
        label: 'Copy writing evaluation prompt',
        intro: 'Paste this prompt into ChatGPT, Gemini, or Claude together with your class answer.',
        instructions: [
          'Copy the prompt.',
          'Paste your class answer underneath the last line.',
          'Save the most useful feedback in the fields below.',
        ],
        template: buildWritingPrompt(week, dayClass),
      },
      savedFields: [
        {
          id: `${dayClass.id}-writing-feedback`,
          label: 'Paste the AI writing feedback',
          placeholder: 'Paste here the feedback you received about grammar, clarity, and vocabulary...',
          helper: 'Keep the raw teacher-style feedback here so you can compare it with your second version.',
        },
        {
          id: `${dayClass.id}-writing-fixes`,
          label: 'Top writing fixes to apply',
          placeholder: 'Example: 1) replace vague nouns, 2) make the result explicit, 3) simplify long sentences...',
          helper: 'Reduce the feedback to the 2-3 changes that matter most right now.',
        },
        {
          id: `${dayClass.id}-writing-revision`,
          label: 'Second-version plan',
          placeholder: 'Write what you will change in your next draft before you rewrite it...',
          helper: 'This turns AI feedback into an action plan instead of passive reading.',
        },
      ],
    },
    speaking: {
      mode: STUDY_AI_VALIDATION_MODE.SPEAKING,
      title: 'Speaking validation with free AI',
      objective: 'Turn one class answer into a spoken response, get feedback from a transcript, and record a stronger retry.',
      toolRecommendations: buildAiToolRecommendations(STUDY_AI_VALIDATION_MODE.SPEAKING),
      workflow: [
        'Choose one task from this class and answer it aloud for 60-90 seconds.',
        'Use your phone recorder, a voice typing tool, or voice mode in a free AI app to get a transcript.',
        'Paste the transcript into a free AI tool with the prompt below and ask for speaking feedback.',
        'Save the transcript, feedback, and your retry target here before recording again.',
      ],
      rubric: [
        'Organization: beginning, middle, and ending are easy to follow.',
        'Fluency: the idea moves forward without collapsing into isolated phrases.',
        'Grammar and tense control under speaking pressure.',
        'Vocabulary that sounds useful in interviews or IT communication.',
        ...dayClass.checks,
      ],
      prompt: {
        id: `${dayClass.id}-speaking-prompt`,
        label: 'Copy speaking evaluation prompt',
        intro: 'Use this after you record yourself and obtain a transcript of the answer.',
        instructions: [
          'Record a spoken answer.',
          'Paste the transcript after the prompt.',
          'Save the feedback and your retry goal below.',
        ],
        template: buildSpeakingPrompt(week, dayClass),
      },
      savedFields: [
        {
          id: `${dayClass.id}-speaking-transcript`,
          label: 'Paste your speaking transcript',
          placeholder: 'Paste here the transcript of your spoken answer...',
          helper: 'A transcript lets you analyze speaking even when the app cannot hear your audio directly.',
        },
        {
          id: `${dayClass.id}-speaking-feedback`,
          label: 'Paste the AI speaking feedback',
          placeholder: 'Paste here the fluency, grammar, clarity, and vocabulary feedback...',
          helper: 'Keep the feedback tied to the class so you can see recurring speaking problems over time.',
        },
        {
          id: `${dayClass.id}-speaking-retry`,
          label: 'Retry target for your next recording',
          placeholder: 'Example: speak slower, add a clearer result sentence, reduce filler words...',
          helper: 'Use one focused target for the second attempt instead of trying to fix everything at once.',
        },
      ],
    },
  }
}

export function isWeekComplete(
  week: StudyWeek,
  completedLessons: string[],
  completedCheckpoints: string[],
  completedDayChecks: string[]
) {
  const lessonsDone = week.lessons.every((lesson) => completedLessons.includes(lesson.id))
  const checkpointsDone = week.checkpoints.every((checkpoint) => completedCheckpoints.includes(checkpoint.id))
  const daysDone = buildWeekDayClasses(week).every((dayClass) => completedDayChecks.includes(dayClass.id))
  return lessonsDone && checkpointsDone && daysDone
}

export function isWeekUnlocked(
  weekIndex: number,
  completedLessons: string[],
  completedCheckpoints: string[],
  completedDayChecks: string[]
) {
  if (weekIndex === 0) return true
  return isWeekComplete(ALL_STUDY_WEEKS[weekIndex - 1], completedLessons, completedCheckpoints, completedDayChecks)
}

export function isPhaseUnlocked(
  phaseIndex: number,
  completedLessons: string[],
  completedCheckpoints: string[],
  completedDayChecks: string[]
) {
  if (phaseIndex === 0) return true
  const previousPhase = STUDY_PHASES[phaseIndex - 1]
  return previousPhase.weeks.every((week) => isWeekComplete(week, completedLessons, completedCheckpoints, completedDayChecks))
}

export function getPhaseProgress(
  phase: StudyPhase,
  completedLessons: string[],
  completedCheckpoints: string[],
  completedDayChecks: string[]
) {
  const totalItems = phase.weeks.reduce(
    (total, week) => total + week.lessons.length + week.checkpoints.length + buildWeekDayClasses(week).length,
    0
  )
  const completedItems = phase.weeks.reduce((total, week) => {
    const doneLessons = week.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length
    const doneCheckpoints = week.checkpoints.filter((checkpoint) => completedCheckpoints.includes(checkpoint.id)).length
    const doneDays = buildWeekDayClasses(week).filter((dayClass) => completedDayChecks.includes(dayClass.id)).length
    return total + doneLessons + doneCheckpoints + doneDays
  }, 0)

  return {
    totalItems,
    completedItems,
    percent: totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100),
  }
}

export function buildWeekDailyPlan(week: StudyWeek): StudyDayPlan[] {
  const [lesson1, lesson2, lesson3, lesson4] = week.lessons
  const resource = week.resources[0]

  return [
    {
      day: 1,
      title: 'Class foundation day',
      focus: `${lesson1?.title ?? 'Main lesson'} + ${lesson2?.title ?? 'support lesson'}`,
      minutes: '60-75 min',
      agenda: [
        `Read the mini-lesson and teaching points for ${lesson1?.title ?? 'the first lesson'}.`,
        `Practice the sentence frames and guided example from ${lesson1?.skill ?? 'speaking'}.`,
        `Work through the listening/secondary lesson and write down reusable language.`,
      ],
      deliverable: `${lesson1?.output ?? 'Complete the first lesson output'} + first notes from ${lesson2?.title ?? 'the second lesson'}.`,
      successCheck: `You can explain the core idea of both lessons without reading the screen.`,
    },
    {
      day: 2,
      title: 'Applied production day',
      focus: `${lesson3?.title ?? 'Interview lesson'} + ${lesson4?.title ?? 'IT communication lesson'}`,
      minutes: '60-75 min',
      agenda: [
        `Study the theory, common mistakes, and micro-drills for ${lesson3?.title ?? 'the third lesson'}.`,
        `Build one real example using the sentence frames from ${lesson3?.skill ?? 'interview'}.`,
        `Write or speak the output for ${lesson4?.title ?? 'the fourth lesson'} using exact technical wording.`,
      ],
      deliverable: `${lesson3?.output ?? 'Interview output'} and ${lesson4?.output ?? 'technical communication output'}.`,
      successCheck: `Your examples sound connected to real work, not only to the template.`,
    },
    {
      day: 3,
      title: 'Resource lab',
      focus: resource?.title ?? 'Weekly resource',
      minutes: '45-60 min',
      agenda: [
        `Open the weekly resource and study why it helps before consuming it fast.`,
        `Take notes on key phrases, then answer the comprehension prompts aloud.`,
        `Do the vocabulary-in-context work and connect each phrase to your own developer life.`,
      ],
      deliverable: `A study note with key phrases and oral answers for the quiz prompts.`,
      successCheck: `You can summarize the resource, answer the quiz, and reuse at least 3 key phrases naturally.`,
    },
    {
      day: 4,
      title: 'Performance and correction day',
      focus: 'Guided repetition, recording, and correction',
      minutes: '45-60 min',
      agenda: [
        `Redo the 4 lesson outputs with a timer: speak, listen/retell, interview, and IT communication.`,
        `Compare your work against the pass criteria of each lesson.`,
        `Fix one weak area only: clarity, structure, vocabulary precision, or confidence.`,
      ],
      deliverable: `A corrected second version of the week's main outputs.`,
      successCheck: `At least one weak area improved clearly between version one and version two.`,
    },
    {
      day: 5,
      title: 'Assessment and unlock day',
      focus: 'Lesson evidence + weekly checkpoints',
      minutes: '30-45 min',
      agenda: [
        `Review the evidence requested in all 4 lesson checks.`,
        `Mark lesson checks only after meeting the pass criteria honestly.`,
        `Complete the weekly checkpoints and decide whether the next week should unlock.`,
      ],
      deliverable: `Completed lesson checks and weekly checkpoints for this week.`,
      successCheck: `You can complete the whole week without depending on a written script.`,
    },
  ]
}

function buildDayReference(week: StudyWeek, whyToday: string): StudyDayReference {
  const resource = week.resources[0]

  return {
    id: resource?.id ?? `${week.id}-reference`,
    title: resource?.title ?? 'Weekly resource',
    channel: resource?.channel ?? 'Course material',
    url: resource?.url ?? '#',
    whyToday,
  }
}

function buildYouTubeRecommendation(week: StudyWeek, day: number): StudyYouTubeVideo {
  const searchMap: Record<number, StudyYouTubeVideo> = {
    1: {
      title: `YouTube practice: developer introduction and confident speaking`,
      channel: 'YouTube',
      url: 'https://www.youtube.com/results?search_query=developer+introduction+english+speaking+software+engineer',
      whyThisVideo: `Use a YouTube example today to hear how developers introduce themselves and to compare your own delivery with a real spoken model tied to this week's case.`,
    },
    2: {
      title: `YouTube practice: interview answers and professional technical communication`,
      channel: 'YouTube',
      url: 'https://www.youtube.com/results?search_query=software+engineer+interview+answer+english+communication',
      whyThisVideo: `Today you need a model for answering and explaining, not only for understanding. Search-based YouTube practice helps you find live examples close to this week's scenario.`,
    },
    3: {
      title: `YouTube practice: explain the concept or workflow behind the weekly resource`,
      channel: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${week.title} english explanation software developer`)}`,
      whyThisVideo: `Use this video search to find a second explanation of the same topic. Hearing it twice from different voices helps comprehension and vocabulary retention.`,
    },
    4: {
      title: `YouTube practice: revision and correction examples`,
      channel: 'YouTube',
      url: 'https://www.youtube.com/results?search_query=english+speaking+correction+software+developer',
      whyThisVideo: `Use correction-focused YouTube examples today so you can compare weak vs strong versions before rewriting your own work.`,
    },
    5: {
      title: `YouTube practice: assessment and final performance`,
      channel: 'YouTube',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${week.goal} mock practice english`)}`,
      whyThisVideo: `Use a final practice video before assessment so your last performance feels closer to a real communication situation, not only to an exercise.`,
    },
  }

  return searchMap[day]
}

type GlossaryTermInput = Omit<StudyGlossaryTerm, 'flashcardBack'> & {
  flashcardHint: string
}

function glossaryTerm(input: GlossaryTermInput): StudyGlossaryTerm {
  return {
    ...input,
    flashcardBack: `${input.definition} Use it when: ${input.useItWhen} ${input.flashcardHint}`,
  }
}

function buildGlossary(week: StudyWeek, day: number): StudyGlossaryTerm[] {
  const [lesson1, lesson2, lesson3, lesson4] = week.lessons
  const map: Record<number, StudyGlossaryTerm[]> = {
    1: [
      glossaryTerm({
        id: `${week.id}-glossary-day1-sentence-frame`,
        term: 'sentence frame',
        definition: 'A reusable sentence pattern that helps you produce correct English faster because you only change the key details.',
        classMeaning: `In this class, sentence frames are your training wheels for ${lesson1.title}. They give you structure first so you can focus on meaning instead of inventing the whole sentence from zero.`,
        useItWhen: 'use you want to answer quickly but still sound ordered and correct.',
        contrast: 'Do not confuse a sentence frame with a full script. A frame is flexible; a script is something you repeat word for word.',
        miniPractice: 'Take one frame from today and fill it with two examples from your current job.',
        example: `Example from this week: "${lesson1.sentenceFrames[0]}"`,
        flashcardHint: 'Piensa: patron reutilizable de oracion, no guion fijo.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day1-controlled-practice`,
        term: 'controlled practice',
        definition: 'Practice where the structure is guided first, so you focus on accuracy before speaking freely.',
        classMeaning: 'Here it means you are not expected to improvise everything yet. First you copy the logic, then you personalise it.',
        useItWhen: 'use you are building a new communication pattern and still need support.',
        contrast: 'Do not confuse controlled practice with passive study. You still produce language; you just do it with guidance.',
        miniPractice: 'Write one short answer following the model exactly, then rewrite it with your own details.',
        example: 'Today you first copy the model, then replace the details with your own experience.',
        flashcardHint: 'Piensa: practica guiada antes de hablar libremente.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day1-shadowing`,
        term: 'shadowing',
        definition: 'A speaking technique where you repeat a speaker immediately to copy rhythm, stress, and pronunciation.',
        classMeaning: `In this class, shadowing is not just repetition. It is your way of borrowing confidence, pace, and intonation from a stronger model during ${lesson2.title}.`,
        useItWhen: 'use you want to sound more natural and less translated.',
        contrast: 'Do not confuse shadowing with memorizing meaning only. The focus is how it sounds, not only what it means.',
        miniPractice: 'Repeat one 15-second part of the resource three times and notice where the speaker slows down.',
        example: `It fits especially well with "${lesson2.title}".`,
        flashcardHint: 'Piensa: copiar ritmo, entonacion y claridad.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day1-exact-noun`,
        term: 'exact noun',
        definition: 'A precise word like branch, endpoint, payload, or blocker that makes your English sound more professional.',
        classMeaning: 'For this academy, exact nouns are one of the fastest ways to sound more technical even if your grammar is still simple.',
        useItWhen: 'use you describe tools, bugs, tasks, architecture, or decisions.',
        contrast: 'Do not confuse an exact noun with a more advanced word. It matters because it is precise, not because it is complex.',
        miniPractice: 'Replace three vague words from your notes with exact technical nouns.',
        example: 'Say endpoint instead of thing, or blocker instead of problem in general.',
        flashcardHint: 'Piensa: palabra precisa que evita ambiguedad.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day1-transition`,
        term: 'transition',
        definition: 'A linking word or phrase that moves your message from one idea to the next smoothly.',
        classMeaning: 'In this class, transitions help your introduction sound organized instead of like isolated sentences.',
        useItWhen: 'use you move from role to project, from yesterday to today, or from problem to fix.',
        contrast: 'Do not confuse a transition with filler. A transition adds structure; filler adds noise.',
        miniPractice: 'Add one transition to connect two short sentences in your introduction.',
        example: 'For example, use right now, because of that, or as a result to move between ideas.',
        flashcardHint: 'Piensa: conector que ordena ideas.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day1-emphasis`,
        term: 'emphasis',
        definition: 'The extra stress or importance you give to a word or idea when speaking.',
        classMeaning: 'Here emphasis matters because confident English often sounds clear not because of vocabulary only, but because the key idea is stressed correctly.',
        useItWhen: 'use you want your listener to notice the most important part of a sentence.',
        contrast: 'Do not confuse emphasis with speaking louder all the time. It is selective, not constant.',
        miniPractice: 'Choose one sentence and mark the two most important words you should stress.',
        example: 'In “I am currently working on the payment flow,” payment flow deserves more emphasis than the rest.',
        flashcardHint: 'Piensa: dar peso a la idea clave.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day1-retell`,
        term: 'retell',
        definition: 'To tell the same content again in a simpler or more personal way.',
        classMeaning: 'In the academy, retelling is one of the clearest proofs that input became usable output.',
        useItWhen: 'use after listening to a resource, reading a post, or hearing a teammate explain something.',
        contrast: 'Do not confuse retelling with repeating the exact original sentences. Retelling uses your own language.',
        miniPractice: 'Listen to one short segment and retell it in two simpler sentences.',
        example: 'After the resource, you retell the main idea in your own English.',
        flashcardHint: 'Piensa: volver a contar con tus propias palabras.',
      }),
    ],
    2: [
      glossaryTerm({
        id: `${week.id}-glossary-day2-relevance`,
        term: 'relevance',
        definition: 'The quality of including only the information that helps the listener understand why your answer matters.',
        classMeaning: `In ${lesson3.title}, relevance means selecting the detail that supports your answer instead of dumping your whole history.`,
        useItWhen: 'use you answer interviews, explain a project, or summarize a task for someone who needs the important part fast.',
        contrast: 'Do not confuse relevance with shortness. A longer answer can still be relevant if every sentence helps the listener.',
        miniPractice: 'Take one long answer and cut one sentence that is interesting but not useful.',
        example: `In "${lesson3.title}", relevance means choosing the right story, not every story.`,
        flashcardHint: 'Piensa: incluir solo lo que de verdad ayuda a la respuesta.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day2-ownership`,
        term: 'ownership',
        definition: 'The part of the work that you personally led, decided, or executed.',
        classMeaning: 'In this class, ownership is the language that makes your contribution visible without pretending you did everything alone.',
        useItWhen: 'use you explain your role in a team project, PR, incident, or interview story.',
        contrast: 'Do not confuse ownership with taking credit for the whole result. It means being clear about your part.',
        miniPractice: 'Rewrite one team sentence and make your contribution visible using I + action verb.',
        example: 'Use clear action verbs like implemented, coordinated, debugged, or proposed.',
        flashcardHint: 'Piensa: tu responsabilidad visible dentro del trabajo en equipo.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day2-scannable`,
        term: 'scannable',
        definition: 'Easy to read quickly because the structure is short, ordered, and visually clear.',
        classMeaning: `In ${lesson4.title}, scannable writing is what lets a reviewer or teammate understand your message in one pass.`,
        useItWhen: 'use you write async updates, PR descriptions, issue notes, or any message with more than one idea.',
        contrast: 'Do not confuse scannable with oversimplified. A message can be short and still carry meaningful technical detail.',
        miniPractice: 'Turn one paragraph into bullets with headings so another person can scan it quickly.',
        example: `A strong async update from "${lesson4.title}" is scannable, not a wall of text.`,
        flashcardHint: 'Piensa: facil de revisar rapido, no bloque de texto.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day2-outcome`,
        term: 'outcome',
        definition: 'The final result, impact, or effect of your action.',
        classMeaning: 'In this academy, outcome is what stops your answer from sounding incomplete. It tells the listener why your action mattered.',
        useItWhen: 'use you finish an interview answer, bug story, PR explanation, or status update.',
        contrast: 'Do not confuse outcome with action. Action is what you did; outcome is what happened because of it.',
        miniPractice: 'Add one outcome sentence to a story that currently stops after the action.',
        example: 'A good interview answer does not stop at what you did; it includes the outcome.',
        flashcardHint: 'Piensa: resultado o impacto final, no la accion misma.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day2-stakeholder`,
        term: 'stakeholder',
        definition: 'A person or group affected by a decision, project, feature, or incident.',
        classMeaning: 'In this class, stakeholder language matters because technical communication often changes depending on who needs the information.',
        useItWhen: 'use you explain why a product manager, QA, customer, or another team needs context from you.',
        contrast: 'Do not confuse a stakeholder with only managers. Engineers, support, and users can also be stakeholders.',
        miniPractice: 'Name two stakeholders for your current task and what each one needs to know.',
        example: 'A deployment note for engineers and a deployment note for stakeholders are not the same.',
        flashcardHint: 'Piensa: persona o grupo afectado por la decision.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day2-follow-up`,
        term: 'follow-up',
        definition: 'An additional message or action that happens after the first communication.',
        classMeaning: 'In the academy, follow-up language helps you close loops instead of leaving blockers or discussions unfinished.',
        useItWhen: 'use after meetings, review comments, bug discussions, or clarification rounds.',
        contrast: 'Do not confuse follow-up with repetition. A follow-up moves the work forward.',
        miniPractice: 'Write one sentence you would send as a follow-up after a meeting decision.',
        example: 'I will follow up with the backend team after this review.',
        flashcardHint: 'Piensa: accion o mensaje posterior para cerrar el ciclo.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day2-concise`,
        term: 'concise',
        definition: 'Expressed in a short, clear way without unnecessary words.',
        classMeaning: 'In this class, concise answers feel stronger because they respect the listener’s time while keeping the signal high.',
        useItWhen: 'use when writing PR descriptions, async updates, or interview answers.',
        contrast: 'Do not confuse concise with incomplete. A concise answer still includes the important information.',
        miniPractice: 'Take one long explanation and rewrite it in half the words without losing the meaning.',
        example: 'A concise PR summary gives context, change, and risk in a few lines.',
        flashcardHint: 'Piensa: breve pero completo.',
      }),
    ],
    3: [
      glossaryTerm({
        id: `${week.id}-glossary-day3-key-phrase`,
        term: 'key phrase',
        definition: 'A useful expression from the resource that you want to reuse in your own communication.',
        classMeaning: 'In this class, a key phrase is not something you collect passively; it is something you plan to use in your own English this week.',
        useItWhen: 'use you take notes from a video, article, podcast, or talk and want language you can actually recycle.',
        contrast: 'Do not confuse a key phrase with any sentence you liked. It should be reusable, not only interesting.',
        miniPractice: 'Choose one phrase from the resource and write two new sentences with it.',
        example: `Today you extract key phrases from "${week.resources[0]?.title ?? 'the weekly resource'}".`,
        flashcardHint: 'Piensa: expresion reusable, no solo frase bonita.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day3-paraphrase`,
        term: 'paraphrase',
        definition: 'To explain the same idea using your own words instead of copying the original wording.',
        classMeaning: 'Here paraphrasing is the proof that you understood the idea deeply enough to own it.',
        useItWhen: 'use after reading or listening, especially when you want to verify comprehension.',
        contrast: 'Do not confuse paraphrasing with translating word by word. You keep the meaning, not the original structure.',
        miniPractice: 'Close the source and explain one paragraph again using simpler words.',
        example: 'If you can paraphrase the resource, you understood it deeply enough to use it.',
        flashcardHint: 'Piensa: misma idea, palabras tuyas.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day3-context`,
        term: 'context',
        definition: 'The surrounding situation that gives meaning to a word, sentence, or decision.',
        classMeaning: 'In study, context is what helps you remember and choose the right phrase later. Without context, vocabulary stays abstract.',
        useItWhen: 'use you want to explain why a phrase fits one situation but not another.',
        contrast: 'Do not confuse context with background detail only. Context is whatever changes the meaning or correct use.',
        miniPractice: 'Write one technical phrase and give it two different contexts where the meaning changes slightly.',
        example: 'A phrase becomes easier to remember when you place it in your own developer context.',
        flashcardHint: 'Piensa: entorno que cambia o aclara el significado.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day3-comprehension`,
        term: 'comprehension',
        definition: 'The ability to understand the meaning of what you read or hear, not only to recognize the words.',
        classMeaning: 'For this academy, comprehension means you can explain the source back, answer questions, and apply the idea, not just say “I understood most of it.”',
        useItWhen: 'use when checking whether a resource actually taught you something usable.',
        contrast: 'Do not confuse comprehension with recognition. Recognizing words is only the first layer.',
        miniPractice: 'Answer one quiz question from memory without looking back at the resource.',
        example: 'Real comprehension lets you answer the quiz without copying the text.',
        flashcardHint: 'Piensa: entender para explicar y usar, no solo reconocer.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day3-note-taking`,
        term: 'note-taking',
        definition: 'The act of writing short, useful notes while learning from a resource.',
        classMeaning: 'In this class, note-taking is productive only if the notes are reusable and lead to speaking or writing afterwards.',
        useItWhen: 'use during videos, talks, blog posts, or technical documentation review.',
        contrast: 'Do not confuse note-taking with transcription. Notes should be selective, not a copy of everything.',
        miniPractice: 'Write three notes from the resource that are short enough to review in one minute later.',
        example: 'Good note-taking captures key phrases, not every sentence.',
        flashcardHint: 'Piensa: tomar notas utiles y reutilizables.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day3-source`,
        term: 'source',
        definition: 'The original material you are studying, such as a video, article, post, or documentation page.',
        classMeaning: 'In this academy, source awareness matters because you should know what comes from the resource and what comes from your own interpretation.',
        useItWhen: 'use when citing, summarizing, or comparing what you learned from a resource.',
        contrast: 'Do not confuse the source with your notes. Your notes are a response to the source, not the source itself.',
        miniPractice: 'Write one sentence that clearly separates what the source says from what you think about it.',
        example: 'The source explains the concept; your job is to turn it into usable English.',
        flashcardHint: 'Piensa: material original que estas estudiando.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day3-nuance`,
        term: 'nuance',
        definition: 'A small but important difference in meaning, tone, or implication.',
        classMeaning: 'In this class, nuance matters because two phrases can look similar but fit different contexts or tones.',
        useItWhen: 'use when comparing synonyms, tone, or different ways of explaining the same idea.',
        contrast: 'Do not confuse nuance with complexity for its own sake. Nuance helps you choose the right form for the situation.',
        miniPractice: 'Choose two similar phrases from the resource and explain the difference in tone or use.',
        example: 'Issue, bug, blocker, and risk are related words, but each one has a different nuance.',
        flashcardHint: 'Piensa: diferencia pequena pero importante de significado o tono.',
      }),
    ],
    4: [
      glossaryTerm({
        id: `${week.id}-glossary-day4-pass-criteria`,
        term: 'pass criteria',
        definition: 'The concrete conditions that show you completed a task at the expected quality level.',
        classMeaning: 'In this revision class, pass criteria are your objective standard. They stop you from judging your work only by feeling.',
        useItWhen: 'use when checking whether a recording, answer, or written text is really ready.',
        contrast: 'Do not confuse pass criteria with vague motivation like “it sounds better now.” Criteria should be observable.',
        miniPractice: 'Take one task and point to the exact line or sentence that proves one criterion is met.',
        example: 'Use the pass criteria to compare your first version and your revised version.',
        flashcardHint: 'Piensa: senales observables de calidad suficiente.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day4-vague-language`,
        term: 'vague language',
        definition: 'Language that is too general to be useful, such as thing, stuff, good, bad, or some issue.',
        classMeaning: 'In this academy, vague language is one of the main reasons answers sound weaker than the student’s real knowledge.',
        useItWhen: 'use as a warning sign during revision, especially in technical communication.',
        contrast: 'Do not confuse simple English with vague English. Simple can still be precise.',
        miniPractice: 'Highlight three vague words in your draft and replace them with more exact terms.',
        example: 'Revision often means replacing vague language with technical detail.',
        flashcardHint: 'Piensa: demasiado general, no suficientemente preciso.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day4-revision`,
        term: 'revision',
        definition: 'The process of improving your first version after checking clarity, structure, and accuracy.',
        classMeaning: 'Here revision means intelligent improvement, not repeating the same attempt more times.',
        useItWhen: 'use after you compare your first version against the criteria and identify the main weakness.',
        contrast: 'Do not confuse revision with decoration. Better writing is clearer and more exact, not just longer.',
        miniPractice: 'Write one sentence about what you are revising today before you start rewriting.',
        example: 'Today is not repetition only; it is revision with intention.',
        flashcardHint: 'Piensa: mejora intencional basada en criterios.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day4-second-version`,
        term: 'second version',
        definition: 'A revised answer that shows visible improvement over your first attempt.',
        classMeaning: 'In this class, the second version is your proof that you learned from the first attempt instead of only practicing blindly.',
        useItWhen: 'use after identifying one specific weakness to improve.',
        contrast: 'Do not confuse a second version with a longer version. Visible improvement matters more than more words.',
        miniPractice: 'State one thing your second version must improve before you write it.',
        example: 'A stronger second version is clearer, not necessarily longer.',
        flashcardHint: 'Piensa: nueva version con mejora visible y concreta.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day4-diagnosis`,
        term: 'diagnosis',
        definition: 'The clear identification of what the problem is before trying to fix it.',
        classMeaning: 'In revision, diagnosis means naming the real weakness in your answer instead of only saying “it sounds bad.”',
        useItWhen: 'use before editing speaking, writing, bugs, or technical explanations.',
        contrast: 'Do not confuse diagnosis with reaction. Diagnosis is evidence-based, not emotional.',
        miniPractice: 'Write one sentence that diagnoses the main weakness in your first version.',
        example: 'The diagnosis here is vague language, not low effort.',
        flashcardHint: 'Piensa: identificar claramente el problema real antes de corregir.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day4-precision`,
        term: 'precision',
        definition: 'The quality of being exact, specific, and accurate in language.',
        classMeaning: 'In this academy, precision is what makes even simple English sound credible in technical contexts.',
        useItWhen: 'use when describing bugs, system behavior, decisions, or ownership.',
        contrast: 'Do not confuse precision with complexity. Precision can still be simple and direct.',
        miniPractice: 'Rewrite one broad sentence so the time, action, or object becomes exact.',
        example: 'The server timed out after the second request is more precise than it failed sometimes.',
        flashcardHint: 'Piensa: exactitud concreta en el lenguaje.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day4-rubric`,
        term: 'rubric',
        definition: 'A set of standards or dimensions used to evaluate work more consistently.',
        classMeaning: 'In this class, the lesson checks act like a mini rubric because they tell you what good work should include.',
        useItWhen: 'use when evaluating your own answer or someone else’s performance against clear dimensions.',
        contrast: 'Do not confuse a rubric with a single score. A rubric explains why the score exists.',
        miniPractice: 'List two dimensions you would include in a rubric for this week’s speaking output.',
        example: 'Clarity, structure, and vocabulary precision can form a simple rubric.',
        flashcardHint: 'Piensa: criterios organizados para evaluar mejor.',
      }),
    ],
    5: [
      glossaryTerm({
        id: `${week.id}-glossary-day5-evidence`,
        term: 'evidence',
        definition: 'The proof that you can actually perform the lesson, such as a recording, written answer, or spoken explanation.',
        classMeaning: 'In the academy flow, evidence protects the value of progress. It means you can do the task, not only that you saw the lesson.',
        useItWhen: 'use when deciding whether a lesson or day is honestly complete.',
        contrast: 'Do not confuse evidence with effort. Time spent matters, but proof of performance matters more here.',
        miniPractice: 'Name one concrete piece of evidence you produced for today’s class.',
        example: 'Lesson checks ask for evidence, not only for confidence.',
        flashcardHint: 'Piensa: prueba observable de desempeno real.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day5-self-assessment`,
        term: 'self-assessment',
        definition: 'An honest evaluation of what improved, what still feels weak, and what needs more practice.',
        classMeaning: 'In this class, self-assessment is how you decide your next move with honesty instead of ego or insecurity.',
        useItWhen: 'use at the end of a week, mock interview, speaking task, or revision cycle.',
        contrast: 'Do not confuse self-assessment with self-criticism. The goal is diagnosis, not punishment.',
        miniPractice: 'Write one strength, one weakness, and one next action for this week.',
        example: 'Your self-assessment should guide what you do next, not only describe your feelings.',
        flashcardHint: 'Piensa: diagnostico honesto para decidir el siguiente paso.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day5-checkpoint`,
        term: 'checkpoint',
        definition: 'A final proof task that confirms you are ready to move to the next module.',
        classMeaning: 'In this academy, checkpoints are milestone tasks that test real readiness, not just attendance.',
        useItWhen: 'use when finishing a week and proving that the core skill can be performed with enough control.',
        contrast: 'Do not confuse a checkpoint with a simple checkbox. It should represent an actual proof task.',
        miniPractice: 'Explain in one sentence why a checkpoint exists in this week.',
        example: `This week has ${week.checkpoints.length} checkpoints before the next module unlocks.`,
        flashcardHint: 'Piensa: prueba final antes de avanzar.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day5-unlock`,
        term: 'unlock',
        definition: 'To open access to the next day or next week after completing the required work.',
        classMeaning: 'Here unlock is part of the teaching design: it keeps the course progressive so each step builds on real completion.',
        useItWhen: 'use when talking about academy progression, gated modules, or readiness to continue.',
        contrast: 'Do not confuse unlock with skipping ahead. Unlock means the platform recognizes enough completed evidence.',
        miniPractice: 'Say what should be completed before the next module unlocks.',
        example: 'Progress is unlocked by real completion, not by skipping the learning process.',
        flashcardHint: 'Piensa: acceso habilitado por evidencia completada.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day5-retention`,
        term: 'retention',
        definition: 'The ability to keep knowledge or vocabulary in memory over time.',
        classMeaning: 'In this academy, retention matters because the goal is not to perform once, but to keep the language available later in real conversations.',
        useItWhen: 'use when talking about flashcards, repeated practice, or reviewing old material.',
        contrast: 'Do not confuse retention with short-term recognition. Retention means the knowledge comes back later when you need it.',
        miniPractice: 'Name one phrase from this week you still remember without looking and one you already lost.',
        example: 'Flashcards and repeated output help retention, not only recognition.',
        flashcardHint: 'Piensa: mantener el conocimiento disponible con el tiempo.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day5-consistency`,
        term: 'consistency',
        definition: 'The quality of doing something regularly and with stable quality over time.',
        classMeaning: 'In this class, consistency is what turns isolated good days into real progress across phases.',
        useItWhen: 'use when reflecting on routines, study habits, and repeated performance.',
        contrast: 'Do not confuse consistency with perfection. It means showing up and keeping the standard stable enough to improve.',
        miniPractice: 'Write one action that would make your study routine more consistent next week.',
        example: 'Daily short study with consistency beats one intense session followed by nothing.',
        flashcardHint: 'Piensa: regularidad con una calidad suficientemente estable.',
      }),
      glossaryTerm({
        id: `${week.id}-glossary-day5-milestone`,
        term: 'milestone',
        definition: 'An important progress point that shows meaningful movement toward a larger goal.',
        classMeaning: 'In this academy, a milestone is bigger than one exercise and smaller than the final goal of the phase.',
        useItWhen: 'use when talking about progress across a phase, a project, or a study journey.',
        contrast: 'Do not confuse a milestone with a random task. A milestone represents meaningful progress.',
        miniPractice: 'Explain why one checkpoint from this week could count as a milestone.',
        example: 'Finishing a week with real evidence is a milestone on the way to phase completion.',
        flashcardHint: 'Piensa: punto importante de avance real.',
      }),
    ],
  }

  return map[day]
}

export function buildWeekDayClasses(week: StudyWeek): StudyDayClass[] {
  const [lesson1, lesson2, lesson3, lesson4] = week.lessons
  const resource = week.resources[0]

  const dayClasses: StudyDayClassSeed[] = [
    {
      id: getWeekDayId(week, 1),
      slug: 'day-1',
      day: 1,
      title: 'Class 1: Guided foundation and controlled production',
      objective: `Start the week by understanding the first two skill areas deeply before producing language on your own.`,
      minutes: '60-75 min',
      focus: `${lesson1.title} + ${lesson2.title}`,
      sections: [
        {
          title: `Teacher explanation · ${lesson1.title}`,
          paragraphs: [
            `${lesson1.objective} In this class, do not rush into the final activity. First, understand the logic behind the language you are using.`,
            lesson1.miniLesson.join(' '),
            `When learners fail in this skill, it is usually because they try to sound advanced too early. Your job today is to build control first, then confidence.`,
          ],
          bullets: lesson1.teachingPoints,
        },
        {
          title: `Guided model · ${lesson1.title}`,
          paragraphs: [
            lesson1.guidedExample.scenario,
            `Read the model slowly, copy the structure, and only then replace the details with your real experience.`,
            lesson1.guidedExample.whyItWorks,
          ],
          bullets: lesson1.guidedExample.model,
        },
        {
          title: `Listening classroom · ${lesson2.title}`,
          paragraphs: [
            `${lesson2.objective} The purpose of this part is not only to understand the resource. It is to train your ear to notice how clear English sounds when ideas are ordered well.`,
            lesson2.miniLesson.join(' '),
            `After you listen, retelling in simpler English is the real test. If you can retell it, you learned it.`,
          ],
          bullets: lesson2.teachingPoints,
        },
        {
          title: 'Mistakes to avoid today',
          paragraphs: [
            `Most students in this stage lose quality because they over-translate or because they consume a resource passively and call it study.`,
            `Today, every input should end in output: repeat, retell, or write something with it.`,
          ],
          bullets: [...lesson1.commonMistakes.slice(0, 2), ...lesson2.commonMistakes.slice(0, 2)],
        },
      ],
      writtenActivities: [
        {
          id: `${week.id}-day-1-writing-1`,
          title: 'Write your controlled first version',
          instructions: `Write a short response using at least 2 sentence frames from ${lesson1.title}. Stay simple and precise.`,
          placeholder: `Write here your first controlled version for ${lesson1.title}...`,
        },
        {
          id: `${week.id}-day-1-writing-2`,
          title: 'Retell the listening lesson in simple English',
          instructions: `After using ${resource?.title ?? 'the weekly resource'}, explain the main idea in your own words and note 3 phrases you want to reuse.`,
          placeholder: 'Write here your retelling and your 3 reusable phrases...',
        },
      ],
      checks: [
        `You can explain the core idea of ${lesson1.title} without reading the page.`,
        `Your written answer uses exact nouns instead of vague words like thing or stuff.`,
        `You retold the listening content in your own English, not copied phrases only.`,
      ],
      references: [
        buildDayReference(week, `Use this today to support ${lesson2.title} and to hear how the week's language sounds in a real source.`),
      ],
      youtubeVideo: buildYouTubeRecommendation(week, 1),
      glossary: buildGlossary(week, 1),
    },
    {
      id: getWeekDayId(week, 2),
      slug: 'day-2',
      day: 2,
      title: 'Class 2: Interview thinking and IT communication',
      objective: `Turn the week's content into interview answers and written professional communication.`,
      minutes: '60-75 min',
      focus: `${lesson3.title} + ${lesson4.title}`,
      sections: [
        {
          title: `Interview lesson · ${lesson3.title}`,
          paragraphs: [
            `${lesson3.objective} The point is not to memorize a script. The point is to learn how to select the right story and structure it so another person trusts your thinking.`,
            lesson3.miniLesson.join(' '),
            `A good interview answer sounds relevant because it chooses the right detail, not because it says everything.`,
          ],
          bullets: lesson3.teachingPoints,
        },
        {
          title: `Communication lesson · ${lesson4.title}`,
          paragraphs: [
            `${lesson4.objective} This is where your English starts to sound useful in a real engineering team.`,
            lesson4.miniLesson.join(' '),
            `Exact language wins over decorative language. The reader should understand what changed, why it matters, and what should happen next.`,
          ],
          bullets: lesson4.teachingPoints,
        },
        {
          title: 'Model and correction logic',
          paragraphs: [
            `Study the example lines before you create your own version. The example is not there to be copied forever; it is there to show you how a clean answer is built.`,
            `After writing, compare your version against the common mistakes. Correction is part of the class, not something extra.`,
          ],
          bullets: [...lesson3.guidedExample.model, ...lesson4.guidedExample.model],
        },
      ],
      writtenActivities: [
        {
          id: `${week.id}-day-2-writing-1`,
          title: 'Build a real interview answer',
          instructions: `Write one answer using the logic from ${lesson3.title}. Use a real project, bug, or decision from your experience.`,
          placeholder: `Write here your interview answer for ${lesson3.title}...`,
        },
        {
          id: `${week.id}-day-2-writing-2`,
          title: 'Write a professional async message',
          instructions: `Write the written output from ${lesson4.title}. Your message should be short, exact, and scannable.`,
          placeholder: `Write here your communication task for ${lesson4.title}...`,
        },
      ],
      checks: [
        `Your interview answer includes a real example and a clear outcome.`,
        `Your written message is structured enough that another person can scan it quickly.`,
        `You corrected at least one vague sentence into a more technical sentence.`,
      ],
      references: [
        buildDayReference(week, `Use the weekly reference today to enrich your answers with vocabulary and tone from a real technical source.`),
      ],
      youtubeVideo: buildYouTubeRecommendation(week, 2),
      glossary: buildGlossary(week, 2),
    },
    {
      id: getWeekDayId(week, 3),
      slug: 'day-3',
      day: 3,
      title: 'Class 3: Resource seminar and academic note-taking',
      objective: 'Study the weekly reference as a guided class, not as passive consumption.',
      minutes: '45-60 min',
      focus: resource?.title ?? 'Weekly resource',
      sections: [
        {
          title: 'Before you open the resource',
          paragraphs: [
            `Your goal today is not simply to watch or read ${resource?.title ?? 'the weekly resource'}. Your goal is to extract language, ideas, and examples you can use in your own English.`,
            `Good academic study starts before the resource begins: know what you are looking for and why it matters for the week's communication goal.`,
          ],
          bullets: [
            `Study objective: ${resource?.studyObjective ?? 'Use the resource as guided input.'}`,
            `Why it helps: ${resource?.whyItHelps ?? 'It connects the lesson to a real source.'}`,
          ],
        },
        {
          title: 'During the resource',
          paragraphs: [
            `Pause strategically. Every pause should produce something: a phrase, a summary, a comparison, or a spoken answer.`,
            `If you only highlight or only keep watching, the class stays superficial. The real learning happens when you turn input into output immediately.`,
          ],
          bullets: resource?.practiceWhileUsing ?? [],
        },
        {
          title: 'After the resource',
          paragraphs: [
            `Close the tab or video for a moment and explain what you learned without looking. This is the moment where comprehension becomes usable English.`,
            `Then answer the quiz prompts aloud and in writing. The goal is to move from recognition to production.`,
          ],
          bullets: resource?.keyPhrases ?? [],
        },
      ],
      writtenActivities: [
        {
          id: `${week.id}-day-3-writing-1`,
          title: 'Academic study notes',
          instructions: `Write a short study note with: main idea, 3 key phrases, and 1 thing you can apply this week.`,
          placeholder: 'Write here your study note...',
        },
        {
          id: `${week.id}-day-3-writing-2`,
          title: 'Written quiz response',
          instructions: `Choose one comprehension question and one speaking prompt from the resource quiz. Answer both in writing before saying them aloud.`,
          placeholder: 'Write here your quiz answers...',
        },
      ],
      checks: [
        `You can summarize the resource without looking at it.`,
        `You extracted and reused at least 3 key phrases in your own examples.`,
        `You answered quiz prompts in your own words, not copied lines.`,
      ],
      references: [
        buildDayReference(week, 'This is the main seminar resource for today. Study it as a class text or class video, not as background consumption.'),
      ],
      youtubeVideo: buildYouTubeRecommendation(week, 3),
      glossary: buildGlossary(week, 3),
    },
    {
      id: getWeekDayId(week, 4),
      slug: 'day-4',
      day: 4,
      title: 'Class 4: Correction lab and second version',
      objective: 'Improve the week by correcting weak language, not by repeating the same mistakes more times.',
      minutes: '45-60 min',
      focus: 'Revision, correction, and stronger second versions',
      sections: [
        {
          title: 'Why correction matters',
          paragraphs: [
            `Many learners think repetition alone creates improvement. In reality, repetition without correction only makes weak patterns more automatic.`,
            `Today is your correction lab. Compare your first versions with the pass criteria of the lessons and find the exact place where quality drops.`,
          ],
          bullets: [
            'Look for vague nouns.',
            'Look for missing structure.',
            'Look for lines that sound translated.',
            'Look for answers that end without impact or conclusion.',
          ],
        },
        {
          title: 'How to revise intelligently',
          paragraphs: [
            `Revise one problem at a time. If you try to fix everything at once, your attention becomes weak.`,
            `Choose the most important weakness first: clarity, structure, confidence, technical precision, or relevance.`,
            `Then produce a second version that is visibly better in that specific area.`,
          ],
        },
        {
          title: 'What stronger work looks like',
          paragraphs: [
            `A stronger version is not necessarily longer. It is clearer, more precise, and easier for another person to follow.`,
            `If your second version only adds more words, you probably improved quantity, not quality.`,
          ],
          bullets: [
            'Shorter but clearer is an improvement.',
            'More exact vocabulary is an improvement.',
            'Better logical order is an improvement.',
          ],
        },
      ],
      writtenActivities: [
        {
          id: `${week.id}-day-4-writing-1`,
          title: 'Correction journal',
          instructions: 'Write what was weak in your first versions and which one issue you are correcting today.',
          placeholder: 'Write here your correction journal...',
        },
        {
          id: `${week.id}-day-4-writing-2`,
          title: 'Second version',
          instructions: 'Rewrite one of your earlier tasks so the improvement is obvious.',
          placeholder: 'Write here your second version...',
        },
      ],
      checks: [
        'You identified one concrete weakness instead of saying everything was bad.',
        'Your second version is visibly stronger than your first version.',
        'You can explain what changed and why it improved the answer.',
      ],
      references: [
        buildDayReference(week, 'Return to the weekly reference if you need a model for tone, vocabulary, or structure during revision.'),
      ],
      youtubeVideo: buildYouTubeRecommendation(week, 4),
      glossary: buildGlossary(week, 4),
    },
    {
      id: getWeekDayId(week, 5),
      slug: 'day-5',
      day: 5,
      title: 'Class 5: Assessment, reflection, and unlock',
      objective: 'Finish the week with honest assessment, final performance, and evidence strong enough to unlock the next step.',
      minutes: '30-45 min',
      focus: 'Assessment and weekly closure',
      sections: [
        {
          title: 'What assessment means this week',
          paragraphs: [
            `Assessment is not about perfection. It is about proving that you can perform the main task of the week without heavy dependence on notes.`,
            `Today you review the evidence required by the lessons and compare your final version against the weekly goal.`,
          ],
        },
        {
          title: 'How to close the week like an academy student',
          paragraphs: [
            `A real academy closes a class cycle with evidence, reflection, and next steps. Do the same here.`,
            `Mark checks only when the performance is real. Honest checking protects the value of the next week.`,
          ],
          bullets: week.checkpoints.map((checkpoint) => checkpoint.requirement),
        },
        {
          title: 'Reflection for real progress',
          paragraphs: [
            `Ask yourself what improved, what still feels fragile, and what you need to carry into the next week.`,
            `This reflection matters because your next module should build on something real, not on auto-completed progress.`,
          ],
        },
      ],
      writtenActivities: [
        {
          id: `${week.id}-day-5-writing-1`,
          title: 'Weekly self-assessment',
          instructions: 'Write what improved this week, what still feels weak, and which lesson was most useful.',
          placeholder: 'Write here your weekly self-assessment...',
        },
        {
          id: `${week.id}-day-5-writing-2`,
          title: 'Readiness note for next week',
          instructions: 'Write one short note explaining why you are or are not ready to unlock the next week.',
          placeholder: 'Write here your readiness note...',
        },
      ],
      checks: [
        'You reviewed the lesson evidence honestly.',
        'You completed the written reflection and can explain your progress.',
        'You are ready to mark the weekly checkpoints without depending on a script.',
      ],
      references: [
        buildDayReference(week, 'Use the weekly reference one last time if you want to verify key phrases before final assessment.'),
      ],
      youtubeVideo: buildYouTubeRecommendation(week, 5),
      glossary: buildGlossary(week, 5),
    },
  ]

  return dayClasses.map((dayClass) => {
    const glossary = dayClass.glossary
    const prerequisites = buildPrerequisites(week, dayClass.day, glossary)
    const sentenceStarters = week.lessons
      .flatMap((lesson) => lesson.sentenceFrames.slice(0, 2))
      .map((frame) => fillSupportBlank(frame))
      .slice(0, 4)

    const enrichedDayClass: StudyDayClass = {
      ...dayClass,
      sections: dayClass.sections.map((section, index) =>
        buildSectionSupport(dayClass.id, section, index, glossary, prerequisites.grammar)
      ),
      writtenActivities: dayClass.writtenActivities.map((activity) => buildActivitySupport(activity, sentenceStarters)),
      prerequisites,
      supportModeIntro: buildSupportModeIntro(dayClass.day),
      aiValidation: buildAiValidation(dayClass, week),
    }

    return enrichedDayClass
  })
}

export function getDayClass(week: StudyWeek, daySlug: string) {
  return buildWeekDayClasses(week).find((dayClass) => dayClass.slug === daySlug)
}

export function isDayUnlocked(week: StudyWeek, dayIndex: number, completedDayChecks: string[]) {
  if (dayIndex === 0) return true
  const previousDay = buildWeekDayClasses(week)[dayIndex - 1]
  return completedDayChecks.includes(previousDay.id)
}
