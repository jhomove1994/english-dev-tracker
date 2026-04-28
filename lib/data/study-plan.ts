export type StudySkill = 'speaking' | 'listening' | 'interview' | 'it_communication'

export interface LessonCheck {
  evidence: string
  passCriteria: string[]
  reflectionPrompt: string
}

export interface GuidedExample {
  scenario: string
  model: string[]
  whyItWorks: string
}

export interface SkillLesson {
  id: string
  skill: StudySkill
  title: string
  objective: string
  teachingPoints: string[]
  miniLesson: string[]
  commonMistakes: string[]
  sentenceFrames: string[]
  guidedExample: GuidedExample
  microDrills: string[]
  classFlow: string[]
  supportTools: string[]
  activities: string[]
  output: string
  check: LessonCheck
}

export interface ResourceQuiz {
  comprehension: string[]
  speaking: string[]
  vocabulary: Array<{
    phrase: string
    practice: string
  }>
}

export interface StudyResource {
  id: string
  title: string
  channel: string
  url: string
  studyObjective: string
  whyItHelps: string
  practiceWhileUsing: string[]
  keyPhrases: string[]
  quiz: ResourceQuiz
}

export interface StudyCheckpoint {
  id: string
  title: string
  requirement: string
}

export interface StudyWeek {
  id: string
  week: number
  title: string
  level: string
  goal: string
  lessons: SkillLesson[]
  resources: StudyResource[]
  checkpoints: StudyCheckpoint[]
}

export interface StudyPhase {
  id: number
  slug: string
  title: string
  levelFrom: string
  levelTo: string
  period: string
  summary: string
  unlockRule: string
  weeks: StudyWeek[]
}

const SKILL_FLOW: Record<StudySkill, string[]> = {
  speaking: [
    'Model first: read the example aloud once and mark the pauses.',
    'Build your own version with the sentence frames before speaking freely.',
    'Record one timed attempt, listen back, and improve one weak section.',
  ],
  listening: [
    'Listen once for the global idea and once for the exact wording.',
    'Write down useful phrases, not full transcripts.',
    'Retell the message in simpler English to prove you understood it.',
  ],
  interview: [
    'Choose one real story before you start speaking.',
    'Use a structure on purpose instead of improvising everything.',
    'End with impact, lesson, or next step so the answer feels complete.',
  ],
  it_communication: [
    'Name the tool, action, and expected outcome precisely.',
    'Organize the explanation so another person could follow it step by step.',
    'Rewrite or repeat the message until it is short, clear, and scannable.',
  ],
}

const SKILL_TOOLS: Record<StudySkill, string[]> = {
  speaking: [
    'Use a timer so you learn to stop on time.',
    'Underline stress words instead of trying to control every word.',
    'Keep one simple version and one stronger version of the same answer.',
  ],
  listening: [
    'Pause after each important segment and paraphrase it.',
    'Track only phrases you will reuse in your own work.',
    'Shadow one short section instead of replaying the entire resource.',
  ],
  interview: [
    'Write bullet points, never a full script.',
    'Prepare one short and one longer version of the answer.',
    'Attach every answer to a real project, bug, or decision you lived through.',
  ],
  it_communication: [
    'Prefer exact nouns like branch, endpoint, payload, blocker, and rollback.',
    'Use headings or bullets when the message has more than one idea.',
    'Always include what changed, why it matters, and what happens next.',
  ],
}

const SKILL_MISTAKES: Record<StudySkill, string[]> = {
  speaking: [
    'Trying to translate the whole sentence before opening your mouth.',
    'Speaking too fast because silence feels uncomfortable.',
    'Using generic words like thing, stuff, or nice instead of exact examples.',
  ],
  listening: [
    'Trying to understand every word instead of following the main message.',
    'Replaying a resource too many times without retelling it yourself.',
    'Taking notes that are too long to reuse later.',
  ],
  interview: [
    'Giving context for too long and reaching the main point too late.',
    'Using a script that sounds memorized instead of prepared.',
    'Ending the answer without a result, learning, or clear takeaway.',
  ],
  it_communication: [
    'Explaining actions without naming the exact tool, artifact, or outcome.',
    'Writing long paragraphs when bullets would be clearer.',
    'Reporting a blocker without saying the next action or owner.',
  ],
}

const SKILL_SAMPLE_VALUES: Record<StudySkill, string[]> = {
  speaking: ['frontend', 'React and TypeScript', 'an internal dashboard', 'support operations'],
  listening: ['clear', 'the idea about delivery risk', 'pace and emphasis'],
  interview: ['QA automation', 'full-stack work', 'platform reliability', 'faster release cycles'],
  it_communication: ['the repository', 'dependencies', 'the development server', 'the browser console'],
}

function fillFrame(frame: string, values: string[]) {
  let index = 0
  return frame.replace(/___/g, () => values[index++] ?? values[values.length - 1] ?? 'your example')
}

function buildMiniLesson(input: Omit<SkillLesson, 'classFlow' | 'supportTools' | 'miniLesson' | 'commonMistakes' | 'guidedExample' | 'microDrills'>) {
  return [
    `Core idea: ${input.objective}`,
    `Teacher explanation: ${input.teachingPoints[0]}`,
    `What good performance sounds like: ${input.teachingPoints[input.teachingPoints.length - 1]}`,
  ]
}

function buildGuidedExample(input: Omit<SkillLesson, 'classFlow' | 'supportTools' | 'miniLesson' | 'commonMistakes' | 'guidedExample' | 'microDrills'>): GuidedExample {
  return {
    scenario: `Use this model when you practise "${input.title}".`,
    model: input.sentenceFrames.slice(0, 3).map((frame) => fillFrame(frame, SKILL_SAMPLE_VALUES[input.skill])),
    whyItWorks: 'The model stays short, uses exact nouns, and follows a clear logical order, so you can imitate it before improvising your own version.',
  }
}

function buildMicroDrills() {
  return [
    `Say the first sentence frame three times with three different real examples from your work.`,
    `Retell the same idea in simpler English without looking at the frame.`,
    `End with one extra sentence that connects the lesson to a real project, task, or conversation you had recently.`,
  ]
}

function lesson(
  input: Omit<SkillLesson, 'classFlow' | 'supportTools' | 'miniLesson' | 'commonMistakes' | 'guidedExample' | 'microDrills'>
): SkillLesson {
  return {
    ...input,
    miniLesson: buildMiniLesson(input),
    commonMistakes: SKILL_MISTAKES[input.skill],
    guidedExample: buildGuidedExample(input),
    microDrills: buildMicroDrills(),
    classFlow: SKILL_FLOW[input.skill],
    supportTools: SKILL_TOOLS[input.skill],
  }
}

export const STUDY_SKILL_LABELS: Record<StudySkill, string> = {
  speaking: 'Speaking',
  listening: 'Listening',
  interview: 'Interview',
  it_communication: 'IT Communication',
}

export const STUDY_PHASES: StudyPhase[] = [
  {
    id: 1,
    slug: 'phase-1',
    title: 'Phase 1: Foundation in Public',
    levelFrom: 'A2',
    levelTo: 'B1',
    period: 'Weeks 1-3',
    summary: 'Build confidence for introducing yourself, giving simple updates, and talking about your everyday dev workflow in English.',
    unlockRule: 'Complete the 4 lesson checks and the weekly checkpoints to unlock the next week.',
    weeks: [
      {
        id: 'phase-1-week-1',
        week: 1,
        title: 'Introduce yourself as a developer',
        level: 'A2 -> B1',
        goal: 'Speak about your role, stack, and current project without translating line by line from Spanish.',
        lessons: [
          lesson({
            id: 'p1w1-speaking',
            skill: 'speaking',
            title: 'Build your developer introduction',
            objective: 'Create a short self-introduction you can use in meetings, networking, and first interviews.',
            teachingPoints: [
              'A strong intro answers three things fast: who you are, what you work on, and what you are improving now.',
              'You sound more natural when you group ideas by meaning instead of sentence by sentence translation.',
              'Your closing line should point forward: what kind of work or challenge you want next.',
            ],
            sentenceFrames: [
              'I am a ___ developer working mainly with ___.',
              'Right now I am building ___ for ___.',
              'The part I enjoy most is ___ because ___.',
            ],
            activities: [
              'Write a 4-line intro using the frames.',
              'Record two versions: one calm and slow, one interview style.',
              'Replace weak words like nice, thing, stuff with exact technical nouns.',
            ],
            output: 'A 60-90 second self-introduction.',
            check: {
              evidence: 'Record one final version without reading a full script.',
              passCriteria: [
                'You mention role, stack, and current project.',
                'You speak for at least 60 seconds without long pauses.',
                'You use at least 3 exact technical nouns.',
              ],
              reflectionPrompt: 'Which sentence still sounds translated and how will you simplify it?',
            },
          }),
          lesson({
            id: 'p1w1-listening',
            skill: 'listening',
            title: 'Notice how confident speakers sound',
            objective: 'Hear pace, emphasis, and vocal control in clear English speech.',
            teachingPoints: [
              'Listening is not only about meaning; it also teaches rhythm and confidence.',
              'Good speakers slow down on key ideas and sound more deliberate, not more complicated.',
              'If you can repeat one short segment with similar rhythm, you already learned something usable.',
            ],
            sentenceFrames: [
              'The speaker sounds credible because ___.',
              'The line I want to copy is ___ because ___.',
              'I need to improve my ___ when I speak.',
            ],
            activities: [
              'Listen once for meaning and once for delivery.',
              'Choose one 20-second segment and shadow it three times.',
              'Write down 5 phrases that sound professional and calm.',
            ],
            output: 'A shadowing clip plus 5 reusable phrases.',
            check: {
              evidence: 'Upload or re-record one 20-second shadowing attempt.',
              passCriteria: [
                'You can explain what the speaker does well.',
                'You repeat one segment with a similar rhythm.',
                'You capture at least 5 phrases you want to reuse.',
              ],
              reflectionPrompt: 'Which part is harder for you: understanding the idea or copying the delivery?',
            },
          }),
          lesson({
            id: 'p1w1-interview',
            skill: 'interview',
            title: 'First answer to "Tell me about yourself"',
            objective: 'Turn your introduction into an interview opener with relevance and direction.',
            teachingPoints: [
              'Interviewers do not want your biography; they want a relevant summary.',
              'The strongest opening answer follows past, present, and future.',
              'One measurable result makes the answer sound more credible immediately.',
            ],
            sentenceFrames: [
              'I started in ___, and that led me to ___.',
              'At the moment, I am focused on ___.',
              'The next step I want is ___ because ___.',
            ],
            activities: [
              'Choose one past experience that really explains your transition into development.',
              'Add one current project and one next-step goal.',
              'Practice the answer in 90 seconds.',
            ],
            output: 'A first interview-ready opener.',
            check: {
              evidence: 'Say the answer once without notes and once with a timer.',
              passCriteria: [
                'The answer follows past, present, future.',
                'It includes one real result or example.',
                'It stays under 2 minutes.',
              ],
              reflectionPrompt: 'What detail can you remove because it is interesting but not relevant?',
            },
          }),
          lesson({
            id: 'p1w1-it',
            skill: 'it_communication',
            title: 'Talk about your setup with exact words',
            objective: 'Describe your local workflow using precise technical vocabulary.',
            teachingPoints: [
              'Exact nouns reduce confusion and make even simple English sound professional.',
              'A workflow explanation should follow a real order: get the code, install, run, debug.',
              'You do not need advanced grammar when the logic is clear and the nouns are right.',
            ],
            sentenceFrames: [
              'First I clone ___ and install ___.',
              'Then I run ___ to start ___.',
              'If something fails, I usually check ___ first.',
            ],
            activities: [
              'Describe how you start one real project on your machine.',
              'Name the terminal, repo, dependencies, server, and browser tools.',
              'Rewrite your explanation until another developer could follow it.',
            ],
            output: 'A clean local setup explanation.',
            check: {
              evidence: 'Write or record one step-by-step setup explanation.',
              passCriteria: [
                'The explanation has a clear order.',
                'You use at least 8 exact tool words.',
                'Another person could follow the process.',
              ],
              reflectionPrompt: 'Which generic word should you replace with an exact technical term?',
            },
          }),
        ],
        resources: [
          {
            id: 'p1w1-resource',
            title: 'How to speak so that people want to listen',
            channel: 'TED',
            url: 'https://www.ted.com/talks/julian_treasure_how_to_speak_so_that_people_want_to_listen',
            studyObjective: 'Use voice, pace, and clarity to sound more credible before you worry about sounding advanced.',
            whyItHelps: 'It gives you practical speaking habits that improve standups, intros, and interviews immediately.',
            practiceWhileUsing: [
              'Pause after each principle and explain it with your own work example.',
              'Copy one short section with the same pauses and emphasis.',
              'Note which vocal habit hurts your English most right now.',
            ],
            keyPhrases: ['speak with empathy', 'stand on your truth', 'the speaking toolbox', 'people want to listen'],
            quiz: {
              comprehension: [
                'Which speaking habits make people stop listening?',
                'How can empathy change a technical conversation?',
              ],
              speaking: [
                'Explain one speaking habit you need to improve in meetings.',
                'Give your intro again with slower, clearer pacing.',
              ],
              vocabulary: [
                { phrase: 'speak with empathy', practice: 'Use it about talking to a frustrated teammate.' },
                { phrase: 'vocal habit', practice: 'Describe one vocal habit you want to fix.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p1w1-checkpoint-1', title: 'Intro delivered', requirement: 'Deliver your developer intro in one take.' },
          { id: 'p1w1-checkpoint-2', title: 'Tool vocabulary used', requirement: 'Explain your setup using exact tool names and a clear sequence.' },
        ],
      },
      {
        id: 'phase-1-week-2',
        week: 2,
        title: 'Daily updates and blockers',
        level: 'A2 -> B1',
        goal: 'Report yesterday, today, and blockers with a structure that sounds natural in a standup.',
        lessons: [
          lesson({
            id: 'p1w2-speaking',
            skill: 'speaking',
            title: 'Build a standup answer',
            objective: 'Give a short update that sounds organized instead of improvised.',
            teachingPoints: [
              'A useful standup is short, ordered, and specific.',
              'You sound clearer when each part begins with a time marker: yesterday, today, blocker.',
              'Blockers are not excuses; they are useful information plus the next action.',
            ],
            sentenceFrames: [
              'Yesterday I finished ___ and started ___.',
              'Today I am focusing on ___.',
              'I am blocked by ___, so I need ___.',
            ],
            activities: [
              'Write one real standup for your current work.',
              'Practice a version with blockers and a version without blockers.',
              'Time yourself and keep it under 90 seconds.',
            ],
            output: 'A reusable standup script.',
            check: {
              evidence: 'Record one complete standup update.',
              passCriteria: [
                'You cover yesterday, today, and blockers.',
                'The update stays under 90 seconds.',
                'At least one sentence includes an exact task or deliverable.',
              ],
              reflectionPrompt: 'Where do you still hesitate: the timeline, the task name, or the blocker sentence?',
            },
          }),
          lesson({
            id: 'p1w2-listening',
            skill: 'listening',
            title: 'Catch blockers and ownership language',
            objective: 'Understand how agile teams mention risk, delay, and next action.',
            teachingPoints: [
              'The most important information in a standup is often the blocker or dependency.',
              'Ownership language sounds direct: I need, I am waiting for, I will follow up.',
              'Listening for verbs helps you track progress faster than listening word by word.',
            ],
            sentenceFrames: [
              'The blocker is not ___, it is ___.',
              'The teammate is waiting for ___.',
              'The next action is ___.',
            ],
            activities: [
              'Listen for all verbs related to progress or delay.',
              'Write 5 phrases that signal ownership.',
              'Retell the blocker in simpler English.',
            ],
            output: 'A blocker phrase list.',
            check: {
              evidence: 'Summarize one blocker update in your own words.',
              passCriteria: [
                'You identify the blocker clearly.',
                'You identify who owns the next action.',
                'You reuse at least 3 blocker phrases.',
              ],
              reflectionPrompt: 'What signal helps you most: verbs, time markers, or explicit ownership?',
            },
          }),
          lesson({
            id: 'p1w2-interview',
            skill: 'interview',
            title: 'Talk about what you worked on this week',
            objective: 'Answer simple interview questions about current work with structure and confidence.',
            teachingPoints: [
              'Even simple work updates sound stronger when they show context, action, and purpose.',
              'Interviewers want to hear how you think, not just the ticket name.',
              'A good weekly update includes one challenge or decision, not only a list of tasks.',
            ],
            sentenceFrames: [
              'This week I worked mainly on ___.',
              'The challenge was ___, so I decided to ___.',
              'The result was ___ / the next step is ___.',
            ],
            activities: [
              'Pick one recent task and explain it as context, challenge, result.',
              'Practice with a frontend or backend example.',
              'Cut any sentence that sounds like an issue title without explanation.',
            ],
            output: 'A short weekly work answer.',
            check: {
              evidence: 'Give one 60-second answer about your week.',
              passCriteria: [
                'You explain one real task.',
                'You mention one challenge or decision.',
                'The answer ends with a result or next step.',
              ],
              reflectionPrompt: 'What part of the task needs more explanation for a non-teammate listener?',
            },
          }),
          lesson({
            id: 'p1w2-it',
            skill: 'it_communication',
            title: 'Write clear async status updates',
            objective: 'Turn spoken status into a short written update other people can scan quickly.',
            teachingPoints: [
              'Async updates should be even shorter than spoken updates because readers scan first.',
              'Bullets work well when each line covers one outcome.',
              'A strong written blocker line includes both the problem and the requested next action.',
            ],
            sentenceFrames: [
              'Done: ___.',
              'In progress: ___.',
              'Blocked by ___; next action: ___.',
            ],
            activities: [
              'Write one async update based on your standup.',
              'Use headings or bullets instead of one paragraph.',
              'Remove anything that does not change team decisions.',
            ],
            output: 'A clean async status post.',
            check: {
              evidence: 'Write one status update with three sections.',
              passCriteria: [
                'The message is easy to scan.',
                'Every line contains useful information.',
                'The blocker line asks for or names the next action.',
              ],
              reflectionPrompt: 'Which line could be shorter without losing meaning?',
            },
          }),
        ],
        resources: [
          {
            id: 'p1w2-resource',
            title: 'Standups',
            channel: 'Atlassian Agile Coach',
            url: 'https://www.atlassian.com/agile/scrum/standups',
            studyObjective: 'Learn the purpose and language of a useful daily standup.',
            whyItHelps: 'It gives you realistic meeting vocabulary for progress, blockers, and alignment.',
            practiceWhileUsing: [
              'Summarize each section as if you were teaching a new teammate.',
              'Turn the article into your personal standup checklist.',
              'Say one real blocker update after every major section.',
            ],
            keyPhrases: ['daily check in', 'share progress', 'maintain alignment', 'manage blockers'],
            quiz: {
              comprehension: [
                'What is the real purpose of a standup?',
                'Why should standups not become planning meetings?',
              ],
              speaking: [
                'Give your own standup using the article structure.',
                'Explain one standup mistake your team should avoid.',
              ],
              vocabulary: [
                { phrase: 'maintain alignment', practice: 'Use it about cross-functional teams.' },
                { phrase: 'quick issue resolution', practice: 'Use it when describing healthy teamwork.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p1w2-checkpoint-1', title: 'Standup done', requirement: 'Deliver a complete yesterday/today/blockers update.' },
          { id: 'p1w2-checkpoint-2', title: 'Async update done', requirement: 'Write the same update in a scannable async format.' },
        ],
      },
      {
        id: 'phase-1-week-3',
        week: 3,
        title: 'Describe bugs, fixes, and debugging flow',
        level: 'B1',
        goal: 'Explain what broke, how you investigated it, and what you changed.',
        lessons: [
          lesson({
            id: 'p1w3-speaking',
            skill: 'speaking',
            title: 'Tell the story of a bug',
            objective: 'Describe a bug with sequence and clarity instead of random details.',
            teachingPoints: [
              'A debugging story works best as problem, investigation, fix.',
              'Exact evidence sounds stronger than vague frustration.',
              'The best final sentence says what changed after the fix.',
            ],
            sentenceFrames: [
              'We noticed that ___ was failing.',
              'First I checked ___, then I looked at ___.',
              'The root cause was ___, so I changed ___.',
            ],
            activities: [
              'Choose one recent bug you really solved.',
              'Limit yourself to three stages: problem, investigation, fix.',
              'Practice the story for 90 seconds.',
            ],
            output: 'A 90-second debugging story.',
            check: {
              evidence: 'Record one bug explanation from memory.',
              passCriteria: [
                'You explain the problem clearly.',
                'You mention at least 2 investigation steps.',
                'You name the root cause or fix precisely.',
              ],
              reflectionPrompt: 'Which investigation step needs clearer technical wording?',
            },
          }),
          lesson({
            id: 'p1w3-listening',
            skill: 'listening',
            title: 'Listen for cause and effect',
            objective: 'Catch language that explains why something failed and what happened next.',
            teachingPoints: [
              'Technical English often moves through cause-and-effect markers.',
              'Words like because, which meant, and as a result help you follow logic fast.',
              'If you can retell the chain simply, you understood the explanation.',
            ],
            sentenceFrames: [
              'The issue happened because ___.',
              'That caused ___ to ___.',
              'As a result, ___.',
            ],
            activities: [
              'Mark all cause-and-effect phrases in the resource.',
              'Retell one explanation in simpler English.',
              'Create a mini list of cause connectors you want to use.',
            ],
            output: 'A cause-and-effect phrase bank.',
            check: {
              evidence: 'Explain one technical failure using three cause connectors.',
              passCriteria: [
                'You identify the cause clearly.',
                'You describe one effect or impact.',
                'You reuse at least 3 connectors accurately.',
              ],
              reflectionPrompt: 'Which connector feels most natural for you and which one still feels forced?',
            },
          }),
          lesson({
            id: 'p1w3-interview',
            skill: 'interview',
            title: 'Turn a bug into an interview story',
            objective: 'Answer questions like "Tell me about a challenging bug you solved".',
            teachingPoints: [
              'A bug story is stronger when it shows method, not only the final fix.',
              'Interviewers care about how you reasoned, communicated, and verified.',
              'The result should include impact: stability, time saved, or user benefit.',
            ],
            sentenceFrames: [
              'One bug that challenged me was ___.',
              'To isolate the issue, I ___.',
              'After the fix, ___.',
            ],
            activities: [
              'Take the bug story from the speaking lesson and make it more interview-friendly.',
              'Add one sentence about verification.',
              'Practice a concise 2-minute version.',
            ],
            output: 'A polished challenge story.',
            check: {
              evidence: 'Deliver one 2-minute answer about a bug you solved.',
              passCriteria: [
                'The story shows your debugging process.',
                'It includes verification or learning.',
                'It ends with a real outcome.',
              ],
              reflectionPrompt: 'Does your story sound like a process story or just a lucky fix story?',
            },
          }),
          lesson({
            id: 'p1w3-it',
            skill: 'it_communication',
            title: 'Write a bug update teammates can use',
            objective: 'Write clear notes for bug reports or fix summaries.',
            teachingPoints: [
              'A useful bug note separates reproduction, expected behavior, and actual behavior.',
              'A fix summary should mention what changed, where, and why.',
              'Precise writing saves time for reviewers and QA.',
            ],
            sentenceFrames: [
              'Steps to reproduce: ___.',
              'Expected behavior: ___.',
              'Fix summary: I changed ___ so that ___.',
            ],
            activities: [
              'Write a bug note and a separate fix summary.',
              'Use numbered steps for reproduction.',
              'Check that the note could be tested by another person.',
            ],
            output: 'A reproducible bug note and fix summary.',
            check: {
              evidence: 'Write one bug note with reproduction plus fix summary.',
              passCriteria: [
                'The note includes expected and actual behavior.',
                'The fix summary says what changed and why.',
                'Another person could retest the issue from your note.',
              ],
              reflectionPrompt: 'What part of your note still depends on hidden context only you know?',
            },
          }),
        ],
        resources: [
          {
            id: 'p1w3-resource',
            title: 'What are browser developer tools?',
            channel: 'MDN Web Docs',
            url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Tools_and_setup/What_are_browser_developer_tools',
            studyObjective: 'Learn the words you need to describe frontend debugging clearly.',
            whyItHelps: 'It gives you concrete debugging vocabulary you can reuse in team conversations and interviews.',
            practiceWhileUsing: [
              'Open devtools while reading and name each panel aloud.',
              'Explain one bug using console, network, and inspect vocabulary.',
              'Retell the setup as if you were helping a teammate.',
            ],
            keyPhrases: ['open the devtools', 'inspect an element', 'network panel', 'console error'],
            quiz: {
              comprehension: [
                'What are three ways to open devtools?',
                'Which panels help when debugging frontend issues?',
              ],
              speaking: [
                'Explain how you would debug a CSS or API issue with devtools.',
                'Describe your normal debugging order.',
              ],
              vocabulary: [
                { phrase: 'inspect an element', practice: 'Use it about a CSS problem.' },
                { phrase: 'console error', practice: 'Use it in a blocker update.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p1w3-checkpoint-1', title: 'Bug story ready', requirement: 'Explain one real bug with problem, investigation, and fix.' },
          { id: 'p1w3-checkpoint-2', title: 'Bug note ready', requirement: 'Write a bug note another teammate could retest.' },
        ],
      },
    ],
  },
  {
    id: 2,
    slug: 'phase-2',
    title: 'Phase 2: Technical Fluency',
    levelFrom: 'B1',
    levelTo: 'B2',
    period: 'Weeks 4-6',
    summary: 'Move from survival English to practical engineering English for planning, reviews, APIs, and architecture explanations.',
    unlockRule: 'Finish every lesson check in the phase sequence; each complete week unlocks the next one.',
    weeks: [
      {
        id: 'phase-2-week-4',
        week: 4,
        title: 'Clarify requirements and scope',
        level: 'B1 -> B2',
        goal: 'Ask better questions and turn vague tasks into clear work items.',
        lessons: [
          lesson({
            id: 'p2w4-speaking',
            skill: 'speaking',
            title: 'Ask clarification questions confidently',
            objective: 'Use direct, useful questions when requirements are still blurry.',
            teachingPoints: [
              'Good clarification sounds collaborative, not insecure.',
              'Most useful questions are about scope, dependency, and acceptance criteria.',
              'If you ask what success looks like, you reduce rework later.',
            ],
            sentenceFrames: [
              'Just to confirm, do we need to ___ or only ___?',
              'What should happen when ___?',
              'How will we know this is done?',
            ],
            activities: [
              'Take one vague feature and write 5 clarification questions.',
              'Practice a role-play where a PM gives incomplete requirements.',
              'Ask one follow-up question after each answer.',
            ],
            output: 'A set of requirement clarification questions.',
            check: {
              evidence: 'Speak through one clarification round using a real feature.',
              passCriteria: [
                'You ask at least 5 useful questions.',
                'The questions cover scope and done criteria.',
                'Your tone sounds collaborative, not apologetic.',
              ],
              reflectionPrompt: 'Which type of clarification question do you avoid most often?',
            },
          }),
          lesson({
            id: 'p2w4-listening',
            skill: 'listening',
            title: 'Detect ambiguity in planning talk',
            objective: 'Hear missing details before they become implementation problems.',
            teachingPoints: [
              'Ambiguity often hides behind broad words like support, improve, or handle.',
              'Listening for missing ownership is as important as listening for missing detail.',
              'You improve faster when you can say exactly what is still unclear.',
            ],
            sentenceFrames: [
              'We still do not know ___.',
              'The owner of ___ is not clear yet.',
              'The edge case I am missing is ___.',
            ],
            activities: [
              'Listen to planning language and mark vague nouns.',
              'Write down what is missing after each explanation.',
              'Restate the requirement in concrete English.',
            ],
            output: 'An ambiguity checklist.',
            check: {
              evidence: 'Explain one vague requirement and name what is missing.',
              passCriteria: [
                'You identify at least 3 missing details.',
                'You mention ownership or dependency once.',
                'Your restatement is more concrete than the original.',
              ],
              reflectionPrompt: 'Do you notice ambiguity faster in written or spoken requirements?',
            },
          }),
          lesson({
            id: 'p2w4-interview',
            skill: 'interview',
            title: 'Explain how you break down work',
            objective: 'Answer questions about planning, prioritization, and preventing rework.',
            teachingPoints: [
              'A good planning answer shows how you think before you code.',
              'Strong candidates explain how they reduce uncertainty, not only how they write tasks.',
              'Examples are better when they show a vague problem becoming a clear plan.',
            ],
            sentenceFrames: [
              'When the requirement is vague, I start by ___.',
              'Then I break it into ___ so the team can ___.',
              'That helped us avoid ___.',
            ],
            activities: [
              'Build one story about preventing rework through better clarification.',
              'Use a real bug, migration, or feature.',
              'Practice a short and a longer version.',
            ],
            output: 'A planning/process interview story.',
            check: {
              evidence: 'Answer one planning question in 90-120 seconds.',
              passCriteria: [
                'You describe your process clearly.',
                'You use a real example.',
                'You explain the impact of better planning.',
              ],
              reflectionPrompt: 'What part of your planning process is still too abstract when you explain it?',
            },
          }),
          lesson({
            id: 'p2w4-it',
            skill: 'it_communication',
            title: 'Write a well-scoped issue',
            objective: 'Turn a vague idea into a written issue with context, scope, and done criteria.',
            teachingPoints: [
              'A useful issue explains the problem before the solution.',
              'Scope and non-goals protect the team from accidental expansion.',
              'Acceptance criteria make review and QA easier later.',
            ],
            sentenceFrames: [
              'Context: ___.',
              'Scope: this includes ___ but not ___.',
              'Done means ___.',
            ],
            activities: [
              'Write one issue from a real feature or bug.',
              'Add a non-goals section.',
              'Convert one vague sentence into measurable acceptance criteria.',
            ],
            output: 'A well-scoped issue description.',
            check: {
              evidence: 'Submit one issue with context, scope, and done criteria.',
              passCriteria: [
                'The problem is clear before implementation details.',
                'The scope says what is out.',
                'The acceptance criteria are testable.',
              ],
              reflectionPrompt: 'What sentence in your issue is still open to interpretation?',
            },
          }),
        ],
        resources: [
          {
            id: 'p2w4-resource',
            title: 'About issues',
            channel: 'GitHub Docs',
            url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/about-issues',
            studyObjective: 'Learn the collaboration language of planning, tracking, and breaking work down.',
            whyItHelps: 'It gives you exact issue vocabulary you can reuse in backlog grooming and written planning.',
            practiceWhileUsing: [
              'Turn one backlog item into an issue in English.',
              'Explain when a task should become sub-issues.',
              'Underline all words related to tracking and planning.',
            ],
            keyPhrases: ['track work', 'break down larger pieces of work', 'plan and discuss', 'sub-issues'],
            quiz: {
              comprehension: [
                'What kinds of work can issues track?',
                'Why are sub-issues useful?',
              ],
              speaking: [
                'Explain how you would open an issue for a bug or feature.',
                'Describe a feature that should be split into smaller tasks.',
              ],
              vocabulary: [
                { phrase: 'track work', practice: 'Use it in a sentence about sprint planning.' },
                { phrase: 'sub-issue', practice: 'Use it about implementation steps.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p2w4-checkpoint-1', title: 'Clarification round done', requirement: 'Ask and answer a full clarification sequence for one vague feature.' },
          { id: 'p2w4-checkpoint-2', title: 'Issue written', requirement: 'Write one issue with scope, non-goals, and acceptance criteria.' },
        ],
      },
      {
        id: 'phase-2-week-5',
        week: 5,
        title: 'Pull requests and review language',
        level: 'B1 -> B2',
        goal: 'Explain your changes and reply to review feedback without sounding defensive or vague.',
        lessons: [
          lesson({
            id: 'p2w5-speaking',
            skill: 'speaking',
            title: 'Walk through a PR out loud',
            objective: 'Present the context, change, and risk of your code clearly.',
            teachingPoints: [
              'A PR walkthrough should start with the problem, not the file names.',
              'Reviewers need your reasoning, not a full line-by-line replay.',
              'Mentioning risk or limitation makes you sound mature, not weak.',
            ],
            sentenceFrames: [
              'This PR solves ___ by ___.',
              'The main change is ___ in ___.',
              'The main risk / limitation is ___.',
            ],
            activities: [
              'Choose one recent change and explain it in 90 seconds.',
              'Add one trade-off sentence.',
              'Practice a version for a reviewer and one for a manager.',
            ],
            output: 'A spoken PR walkthrough.',
            check: {
              evidence: 'Record one PR walkthrough.',
              passCriteria: [
                'You explain the problem and change clearly.',
                'You mention risk or limitation.',
                'The walkthrough stays focused and under 2 minutes.',
              ],
              reflectionPrompt: 'Which part of your explanation sounds too tied to code details and not enough to intent?',
            },
          }),
          lesson({
            id: 'p2w5-listening',
            skill: 'listening',
            title: 'Hear the intent behind review comments',
            objective: 'Identify when feedback is about correctness, style, risk, or clarity.',
            teachingPoints: [
              'Not every review comment has the same weight.',
              'Understanding intent helps you answer calmly and faster.',
              'The strongest listeners separate suggestion, request, and blocker.',
            ],
            sentenceFrames: [
              'This comment is mainly about ___.',
              'The reviewer is worried that ___.',
              'A good reply would be ___.',
            ],
            activities: [
              'Label sample comments by intent.',
              'Read one comment aloud and draft a useful reply.',
              'Compare a defensive reply with a collaborative one.',
            ],
            output: 'A review-intent cheat sheet.',
            check: {
              evidence: 'Classify 5 review comments and answer 2 of them.',
              passCriteria: [
                'You distinguish suggestion from required change.',
                'Your replies stay calm and specific.',
                'You mention the reviewer concern clearly.',
              ],
              reflectionPrompt: 'Which kind of review comment triggers the most emotional reaction for you?',
            },
          }),
          lesson({
            id: 'p2w5-interview',
            skill: 'interview',
            title: 'Talk about a review disagreement',
            objective: 'Answer collaboration questions with a concrete code-review example.',
            teachingPoints: [
              'Strong disagreement stories show judgment, not ego.',
              'A useful answer explains what was at stake and how you aligned.',
              'The best ending mentions what you learned about collaboration.',
            ],
            sentenceFrames: [
              'A reviewer and I disagreed about ___.',
              'My reasoning was ___, but I also understood ___.',
              'We resolved it by ___.',
            ],
            activities: [
              'Choose one real disagreement or strong review discussion.',
              'Focus on reasoning and outcome, not emotion.',
              'Practice a 2-minute answer.',
            ],
            output: 'A code-review conflict story.',
            check: {
              evidence: 'Answer one collaboration question using a review example.',
              passCriteria: [
                'The story explains both sides clearly.',
                'The resolution sounds professional.',
                'You mention one learning or process improvement.',
              ],
              reflectionPrompt: 'Does your story show maturity or only that you were right?',
            },
          }),
          lesson({
            id: 'p2w5-it',
            skill: 'it_communication',
            title: 'Write high-signal PR descriptions and replies',
            objective: 'Make your written review communication easier to scan and easier to trust.',
            teachingPoints: [
              'Context-first PR descriptions help reviewers faster than long change lists.',
              'A good reply either agrees, clarifies, or proposes an alternative.',
              'Shorter replies sound stronger when they still answer the reviewer concern.',
            ],
            sentenceFrames: [
              'Context: ___.',
              'This change updates ___ to ___.',
              'Good catch — I changed ___ / I kept it because ___.',
            ],
            activities: [
              'Rewrite one old PR description.',
              'Write 2 agreement replies and 2 clarification replies.',
              'Remove filler phrases like maybe, kind of, just.',
            ],
            output: 'A PR description template and reply bank.',
            check: {
              evidence: 'Write one PR description plus 4 review replies.',
              passCriteria: [
                'The PR description has context and change summary.',
                'The replies are short but complete.',
                'Each reply clearly states the action taken or reasoning.',
              ],
              reflectionPrompt: 'Which reply is still too defensive or too vague?',
            },
          }),
        ],
        resources: [
          {
            id: 'p2w5-resource',
            title: 'Collaborating with pull requests',
            channel: 'GitHub Docs',
            url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests',
            studyObjective: 'Internalize the workflow and vocabulary of proposing, reviewing, and merging changes.',
            whyItHelps: 'It gives you the exact terms and actions used in PR conversations.',
            practiceWhileUsing: [
              'Retell the PR flow using your own repository as the example.',
              'Build a glossary of reviewer actions and statuses.',
              'Answer one imaginary review comment after each section.',
            ],
            keyPhrases: ['propose and review changes', 'request changes', 'approve a pull request', 'merge the branch'],
            quiz: {
              comprehension: [
                'How do pull requests support discussion before merge?',
                'What review actions can a teammate take?',
              ],
              speaking: [
                'Explain your normal PR workflow from first commit to merge.',
                'Describe how you respond when a reviewer requests changes.',
              ],
              vocabulary: [
                { phrase: 'request changes', practice: 'Use it in a code review example.' },
                { phrase: 'approve a pull request', practice: 'Use it about team process.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p2w5-checkpoint-1', title: 'PR walkthrough ready', requirement: 'Explain one recent PR with context, change, and risk.' },
          { id: 'p2w5-checkpoint-2', title: 'Review replies ready', requirement: 'Write calm, specific answers to review feedback.' },
        ],
      },
      {
        id: 'phase-2-week-6',
        week: 6,
        title: 'APIs, requests, and debugging logic',
        level: 'B2',
        goal: 'Explain client-server behavior, request flow, and failure points clearly.',
        lessons: [
          lesson({
            id: 'p2w6-speaking',
            skill: 'speaking',
            title: 'Explain a request lifecycle',
            objective: 'Walk through one real request from user action to server response.',
            teachingPoints: [
              'Technical explanations are easier to follow when they stay chronological.',
              'Client, server, and response should stay clearly separated in your language.',
              'One good explanation includes happy path and failure path.',
            ],
            sentenceFrames: [
              'When the user clicks ___, the client ___.',
              'The request goes to ___, which ___.',
              'If it fails, we usually see ___ in ___.',
            ],
            activities: [
              'Choose one real endpoint from your app.',
              'Explain both success flow and error flow.',
              'Mention where you would inspect the problem first.',
            ],
            output: 'A 2-minute request-flow explanation.',
            check: {
              evidence: 'Explain one real request flow out loud.',
              passCriteria: [
                'The explanation is chronological.',
                'You distinguish client and server actions.',
                'You mention one failure point and how to inspect it.',
              ],
              reflectionPrompt: 'Which part of the flow is still too vague: trigger, backend action, or response handling?',
            },
          }),
          lesson({
            id: 'p2w6-listening',
            skill: 'listening',
            title: 'Follow cause-and-effect in technical explanations',
            objective: 'Catch how engineers explain latency, failure, and system behavior.',
            teachingPoints: [
              'Technical listening improves when you track relationships, not isolated terms.',
              'Cause markers and contrast markers make architecture talk easier to follow.',
              'If you can retell the chain simply, the complexity no longer controls you.',
            ],
            sentenceFrames: [
              'The problem starts when ___.',
              'That means ___ cannot ___.',
              'To confirm it, we would check ___.',
            ],
            activities: [
              'Mark cause and contrast words in the resource.',
              'Retell one process in simpler English.',
              'Create a list of 5 useful process verbs.',
            ],
            output: 'A process-language mini glossary.',
            check: {
              evidence: 'Retell one HTTP explanation without reading.',
              passCriteria: [
                'You capture the sequence correctly.',
                'You mention at least one cause and one effect.',
                'You use process verbs accurately.',
              ],
              reflectionPrompt: 'Which technical verb do you still avoid because it feels uncertain?',
            },
          }),
          lesson({
            id: 'p2w6-interview',
            skill: 'interview',
            title: 'Answer API and performance questions',
            objective: 'Structure technical interview answers about requests, latency, and debugging.',
            teachingPoints: [
              'A good technical answer explains what happens before saying how to optimize it.',
              'Interviewers often check whether you understand the system path, not only the final fix.',
              'Naming the first debugging step makes your answer practical and credible.',
            ],
            sentenceFrames: [
              'First I would confirm ___.',
              'Then I would inspect ___ because ___.',
              'If the bottleneck is ___, I would ___.',
            ],
            activities: [
              'Practice one answer about a slow endpoint.',
              'Practice one answer about a failed browser request.',
              'End both answers with how you verify the result.',
            ],
            output: 'Two structured technical answers.',
            check: {
              evidence: 'Answer one API or performance question in 2 minutes.',
              passCriteria: [
                'You start with diagnosis, not guessing.',
                'You mention at least one inspection point.',
                'You include verification or follow-up.',
              ],
              reflectionPrompt: 'Do you sound like you are debugging methodically or just listing random ideas?',
            },
          }),
          lesson({
            id: 'p2w6-it',
            skill: 'it_communication',
            title: 'Write a precise technical bug update',
            objective: 'Write updates about request failures or backend issues clearly and factually.',
            teachingPoints: [
              'A strong bug update distinguishes observation from assumption.',
              'Readers should know what failed, where, and what was verified.',
              'Factual language sounds stronger than emotional language in production contexts.',
            ],
            sentenceFrames: [
              'Observed behavior: ___.',
              'Confirmed so far: ___.',
              'Next verification step: ___.',
            ],
            activities: [
              'Write one update about a request failure.',
              'Separate confirmed facts from hypotheses.',
              'Add one next verification step.',
            ],
            output: 'A production-safe bug update.',
            check: {
              evidence: 'Write one factual technical update.',
              passCriteria: [
                'Facts and assumptions are separate.',
                'The reader knows where the failure appears.',
                'There is one concrete next verification step.',
              ],
              reflectionPrompt: 'What sentence in your update is still opinion instead of evidence?',
            },
          }),
        ],
        resources: [
          {
            id: 'p2w6-resource',
            title: 'An overview of HTTP',
            channel: 'MDN Web Docs',
            url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
            studyObjective: 'Build the vocabulary behind request-response explanations.',
            whyItHelps: 'It gives you a clear map of clients, servers, requests, responses, and proxies.',
            practiceWhileUsing: [
              'Draw the request path and explain it aloud.',
              'Translate one section into simpler English.',
              'Connect each concept to a real bug or endpoint in your app.',
            ],
            keyPhrases: ['client-server protocol', 'the request', 'the response', 'intermediary proxies'],
            quiz: {
              comprehension: [
                'Why is HTTP described as a client-server protocol?',
                'What role can proxies play?',
              ],
              speaking: [
                'Explain what happens when a browser loads one page in your app.',
                'Describe a bug where understanding the request lifecycle helps.',
              ],
              vocabulary: [
                { phrase: 'client-server protocol', practice: 'Use it to explain a web request.' },
                { phrase: 'response handling', practice: 'Use it in a sentence about your frontend.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p2w6-checkpoint-1', title: 'Request flow ready', requirement: 'Explain one real request end-to-end.' },
          { id: 'p2w6-checkpoint-2', title: 'Technical update ready', requirement: 'Write one factual bug update with next verification step.' },
        ],
      },
    ],
  },
  {
    id: 3,
    slug: 'phase-3',
    title: 'Phase 3: Interview Ready',
    levelFrom: 'B2',
    levelTo: 'B2+',
    period: 'Weeks 7-9',
    summary: 'Package real engineering work into answers that sound structured, calm, and credible in interviews.',
    unlockRule: 'Complete each week in order; every lesson needs its own evidence before the next week opens.',
    weeks: [
      {
        id: 'phase-3-week-7',
        week: 7,
        title: 'Own your story in interviews',
        level: 'B2',
        goal: 'Deliver a strong Tell me about yourself answer linked to your technical direction.',
        lessons: [
          lesson({
            id: 'p3w7-speaking',
            skill: 'speaking',
            title: 'Control the flow of your story',
            objective: 'Speak with structure and direction instead of listing random experience.',
            teachingPoints: [
              'Your story needs one clear thread: how your experience leads to your next step.',
              'Past, present, future keeps the answer easy to follow.',
              'A shorter answer sounds stronger when every sentence supports fit.',
            ],
            sentenceFrames: [
              'I started by ___.',
              'Right now I am focused on ___.',
              'What I want next is ___ because ___.',
            ],
            activities: [
              'Write one line for past, present, future.',
              'Add one measurable result to the present section.',
              'Practice a 2-minute version and a 60-second version.',
            ],
            output: 'Two versions of your intro answer.',
            check: {
              evidence: 'Deliver one short and one standard intro answer.',
              passCriteria: [
                'Both versions sound relevant to the target role.',
                'The answer follows past, present, future.',
                'You include one real proof of fit.',
              ],
              reflectionPrompt: 'Which sentence proves your fit best and which sentence is only filler?',
            },
          }),
          lesson({
            id: 'p3w7-listening',
            skill: 'listening',
            title: 'Hear what the first question really asks',
            objective: 'Understand why interviewers start broad and how to answer strategically.',
            teachingPoints: [
              'The opening question tests relevance, confidence, and communication.',
              'Interviewers want a curated answer, not your whole history.',
              'Listening for role clues helps you adapt the same core story.',
            ],
            sentenceFrames: [
              'The interviewer wants to know ___.',
              'The most relevant part of my background is ___.',
              'For this role, I should emphasize ___.',
            ],
            activities: [
              'Listen to the resource and note every clue about relevance.',
              'Say which part of your background matters most for three different roles.',
              'Cut one detail that is interesting but not useful.',
            ],
            output: 'A role-adaptation note for your intro.',
            check: {
              evidence: 'Explain how you would adapt your intro for two different roles.',
              passCriteria: [
                'You identify what the interviewer wants.',
                'You change emphasis, not your whole identity.',
                'Your adaptation stays relevant and realistic.',
              ],
              reflectionPrompt: 'Which role is hardest for you to tailor your story to and why?',
            },
          }),
          lesson({
            id: 'p3w7-interview',
            skill: 'interview',
            title: 'Deliver your reusable opening answer',
            objective: 'Create a polished opener for screening calls and live interviews.',
            teachingPoints: [
              'Your first answer sets the tone for the rest of the interview.',
              'A polished opener should sound practiced but not memorized.',
              'The strongest last line creates curiosity about your experience.',
            ],
            sentenceFrames: [
              'A project that shaped me was ___.',
              'That experience pushed me toward ___.',
              'That is why this role is interesting to me.',
            ],
            activities: [
              'Create one company-neutral answer and one role-specific version.',
              'Practice with natural pauses, not a rush.',
              'Finish with a line that connects your background to the role.',
            ],
            output: 'A reusable interview opener.',
            check: {
              evidence: 'Say the answer live without reading.',
              passCriteria: [
                'The answer feels intentional and relevant.',
                'You do not ramble or over-explain your history.',
                'The last line connects clearly to the role.',
              ],
              reflectionPrompt: 'Which part sounds too memorized and needs a more natural wording?',
            },
          }),
          lesson({
            id: 'p3w7-it',
            skill: 'it_communication',
            title: 'Translate project history into proof of fit',
            objective: 'Choose the right projects, tools, and outcomes for the role in front of you.',
            teachingPoints: [
              'Not all past experience deserves equal space in an interview.',
              'Relevance beats completeness when you explain your history.',
              'Project summaries should highlight ownership, challenge, and impact.',
            ],
            sentenceFrames: [
              'The most relevant project for this role is ___.',
              'In that project, I was responsible for ___.',
              'The impact was ___ / I learned ___.',
            ],
            activities: [
              'Choose 3 projects and write a one-line relevance note for each.',
              'Prepare different emphases for frontend, backend, and full-stack roles.',
              'Cut tool names that do not help your case.',
            ],
            output: 'A role-specific project relevance sheet.',
            check: {
              evidence: 'Map 3 projects to 3 role types.',
              passCriteria: [
                'Each project is matched to a clear role angle.',
                'Ownership is visible in the wording.',
                'The impact line is concrete, not generic.',
              ],
              reflectionPrompt: 'Which project is strong technically but still hard for you to explain clearly?',
            },
          }),
        ],
        resources: [
          {
            id: 'p3w7-resource',
            title: 'Tell Me About Yourself Interview Question and Answers',
            channel: 'The Muse',
            url: 'https://www.themuse.com/advice/tell-me-about-yourself-interview-question-answer-examples',
            studyObjective: 'Shape your introduction so it sounds relevant and memorable from the first minute.',
            whyItHelps: 'It reframes the question as a strategic opener instead of a life story.',
            practiceWhileUsing: [
              'Update your own answer after each main tip.',
              'Check whether every sentence supports your candidacy.',
              'Practice the answer standing up like a real interview.',
            ],
            keyPhrases: ['set the stage', 'common opening prompt', 'use it to your advantage', 'prepare in advance'],
            quiz: {
              comprehension: [
                'Why do interviewers often ask this question first?',
                'What makes a strong answer strategic instead of biographical?',
              ],
              speaking: [
                'Deliver your current answer in under 2 minutes.',
                'Explain which sentence proves your fit best.',
              ],
              vocabulary: [
                { phrase: 'set the stage', practice: 'Use it about the first interview question.' },
                { phrase: 'opening prompt', practice: 'Use it to describe how interviews begin.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p3w7-checkpoint-1', title: 'Core intro ready', requirement: 'Deliver a 2-minute intro with past, present, and future.' },
          { id: 'p3w7-checkpoint-2', title: 'Role variants ready', requirement: 'Prepare tailored versions for different role angles.' },
        ],
      },
      {
        id: 'phase-3-week-8',
        week: 8,
        title: 'Behavioral answers with STAR',
        level: 'B2',
        goal: 'Answer Tell me about a time questions with structure, clarity, and real impact.',
        lessons: [
          lesson({
            id: 'p3w8-speaking',
            skill: 'speaking',
            title: 'Control the length of your stories',
            objective: 'Keep behavioral answers structured under time pressure.',
            teachingPoints: [
              'A strong story feels complete because the structure is visible.',
              'Most people overuse Situation and under-explain Action.',
              'A shorter answer is often stronger if the Result is clear.',
            ],
            sentenceFrames: [
              'The situation was ___.',
              'My specific responsibility was ___.',
              'I took action by ___, and the result was ___.',
            ],
            activities: [
              'Build one 90-second story and one 2-minute version.',
              'Cut any context that does not support the main decision.',
              'Practice saying the Result with confidence, not as an afterthought.',
            ],
            output: 'Two timed STAR answers.',
            check: {
              evidence: 'Deliver one story in 90 seconds and again in 2 minutes.',
              passCriteria: [
                'The structure is easy to hear.',
                'Your action is clear and personal.',
                'The result is concrete.',
              ],
              reflectionPrompt: 'Which section grows too long when you speak under pressure?',
            },
          }),
          lesson({
            id: 'p3w8-listening',
            skill: 'listening',
            title: 'Recognize the competency behind the question',
            objective: 'Hear whether the interviewer is testing conflict, learning, leadership, or ownership.',
            teachingPoints: [
              'Behavioral questions often change wording but keep the same competency.',
              'If you hear the competency fast, you can choose a better story faster.',
              'The best preparation is story selection, not only story memorization.',
            ],
            sentenceFrames: [
              'This question is really about ___.',
              'The best story for this competency is ___.',
              'The key evidence I need is ___.',
            ],
            activities: [
              'Group sample questions by competency.',
              'Choose the best story for each group.',
              'Paraphrase the question before answering.',
            ],
            output: 'A competency-to-story map.',
            check: {
              evidence: 'Match 6 questions to competencies and stories.',
              passCriteria: [
                'You identify the competency correctly.',
                'You select a relevant story fast.',
                'You can justify why the story fits.',
              ],
              reflectionPrompt: 'Which competency still has no strong story in your bank?',
            },
          }),
          lesson({
            id: 'p3w8-interview',
            skill: 'interview',
            title: 'Build your STAR story bank',
            objective: 'Prepare stories for failure, conflict, ownership, and fast learning.',
            teachingPoints: [
              'A reusable story bank reduces panic during interviews.',
              'Different stories can still share the same structure.',
              'Your result line should show more than task completion; it should show impact.',
            ],
            sentenceFrames: [
              'A good example for ___ is when I ___.',
              'The hardest part was ___, so I ___.',
              'The outcome was ___, and I learned ___.',
            ],
            activities: [
              'Prepare 4 stories for 4 competencies.',
              'Write only bullet points, not scripts.',
              'Check that each story contains one measurable or visible outcome.',
            ],
            output: 'A 4-story behavioral bank.',
            check: {
              evidence: 'Present your 4-story bank in bullet form.',
              passCriteria: [
                'Each competency has one usable story.',
                'Every story has a clear Action and Result.',
                'At least 2 stories include measurable outcomes.',
              ],
              reflectionPrompt: 'Which story is technically strong but emotionally flat or hard to remember?',
            },
          }),
          lesson({
            id: 'p3w8-it',
            skill: 'it_communication',
            title: 'Show ownership without overselling',
            objective: 'Describe your contribution accurately in team stories.',
            teachingPoints: [
              'Ownership language is strongest when it is precise and honest.',
              'Use I for your action and we for team outcome when appropriate.',
              'Action verbs communicate seniority better than adjectives.',
            ],
            sentenceFrames: [
              'My responsibility was to ___.',
              'I coordinated / implemented / debugged ___.',
              'As a team, we achieved ___.',
            ],
            activities: [
              'Rewrite one weak story using stronger action verbs.',
              'Check whether you overuse we or I.',
              'Add one line that clarifies your contribution inside the team.',
            ],
            output: 'A clearer ownership version of one STAR story.',
            check: {
              evidence: 'Rewrite and say one story with clear ownership language.',
              passCriteria: [
                'Your action is visible and honest.',
                'You use strong verbs instead of vague effort words.',
                'The team outcome stays clear too.',
              ],
              reflectionPrompt: 'Where do you still hide behind the team because the sentence feels risky?',
            },
          }),
        ],
        resources: [
          {
            id: 'p3w8-resource',
            title: 'How To Use the STAR Interview Response Technique',
            channel: 'Indeed Career Guide',
            url: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique',
            studyObjective: 'Build concise answers for behavioral and situational interview questions.',
            whyItHelps: 'It gives you a simple frame that reduces rambling and makes technical stories more convincing.',
            practiceWhileUsing: [
              'Turn one messy real story into four labeled STAR sections.',
              'Pause after each section and say your own example.',
              'Check whether the Result proves impact, not only completion.',
            ],
            keyPhrases: ['behavioral interview questions', 'situation, task, action, and result', 'clear and concise responses', 'real-life examples'],
            quiz: {
              comprehension: [
                'What does each letter in STAR stand for?',
                'Why does the framework help with behavioral questions?',
              ],
              speaking: [
                'Answer one behavioral question using STAR from memory.',
                'Explain which part of STAR is hardest for you.',
              ],
              vocabulary: [
                { phrase: 'real-life example', practice: 'Use it to introduce a bug-fixing story.' },
                { phrase: 'behavioral question', practice: 'Explain how it differs from a technical one.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p3w8-checkpoint-1', title: 'STAR bank ready', requirement: 'Prepare 4 strong behavioral stories.' },
          { id: 'p3w8-checkpoint-2', title: 'Timed answers ready', requirement: 'Deliver both short and standard STAR answers.' },
        ],
      },
      {
        id: 'phase-3-week-9',
        week: 9,
        title: 'System design and architecture talk',
        level: 'B2+',
        goal: 'Explain systems, trade-offs, and scaling decisions with structure and calm.',
        lessons: [
          lesson({
            id: 'p3w9-speaking',
            skill: 'speaking',
            title: 'Explain architecture top-down',
            objective: 'Start with the big picture before you go into components and trade-offs.',
            teachingPoints: [
              'Top-down explanations are easier to follow than jumping into components immediately.',
              'Requirements and assumptions create the frame for the rest of the answer.',
              'Every major component should connect back to a system need.',
            ],
            sentenceFrames: [
              'At a high level, the system needs to ___.',
              'The main components would be ___.',
              'I would choose ___ because ___.',
            ],
            activities: [
              'Explain one simple system using users, traffic, and data.',
              'Add one trade-off after every big decision.',
              'Practice a 4-minute answer.',
            ],
            output: 'A top-down system explanation.',
            check: {
              evidence: 'Deliver one 4-minute architecture walkthrough.',
              passCriteria: [
                'You start with high-level needs.',
                'Components are connected logically.',
                'You mention at least 2 trade-offs.',
              ],
              reflectionPrompt: 'Where do you still jump into detail before setting the frame?',
            },
          }),
          lesson({
            id: 'p3w9-listening',
            skill: 'listening',
            title: 'Follow scaling and trade-off language',
            objective: 'Track discussions about latency, reliability, cost, and complexity.',
            teachingPoints: [
              'System design language often compares trade-offs, not perfect solutions.',
              'If you label the concern, the vocabulary becomes easier to remember.',
              'Listening improves when you group terms by cost, speed, scale, or reliability.',
            ],
            sentenceFrames: [
              'This decision improves ___ but adds ___.',
              'The main bottleneck could be ___.',
              'The trade-off here is ___ versus ___.',
            ],
            activities: [
              'Underline all trade-off terms in the resource.',
              'Restate one design section in simpler English.',
              'Create a glossary grouped by concern.',
            ],
            output: 'A trade-off vocabulary map.',
            check: {
              evidence: 'Explain one system decision as a trade-off.',
              passCriteria: [
                'You name both sides of the trade-off.',
                'You identify one possible bottleneck.',
                'Your explanation uses design vocabulary accurately.',
              ],
              reflectionPrompt: 'Which design concern do you understand least when listening: cost, reliability, or latency?',
            },
          }),
          lesson({
            id: 'p3w9-interview',
            skill: 'interview',
            title: 'Answer a system design prompt with structure',
            objective: 'Use requirements, assumptions, architecture, bottlenecks, and trade-offs as a repeatable flow.',
            teachingPoints: [
              'A structured approach matters more than a perfect final system in many interviews.',
              'Saying assumptions early shows control and collaboration.',
              'Observability and iteration make the answer feel realistic.',
            ],
            sentenceFrames: [
              'Before designing, I would clarify ___.',
              'I am assuming ___ for now.',
              'The main bottleneck / risk would be ___.',
            ],
            activities: [
              'Practice one prompt such as chat, search, or notifications.',
              'Speak assumptions before drawing architecture.',
              'End with monitoring or next iteration.',
            ],
            output: 'A reusable design-answer flow.',
            check: {
              evidence: 'Answer one mock design prompt.',
              passCriteria: [
                'You clarify requirements first.',
                'You state assumptions explicitly.',
                'You mention bottlenecks and trade-offs.',
              ],
              reflectionPrompt: 'What step do you skip when you get nervous: clarifying, structuring, or evaluating trade-offs?',
            },
          }),
          lesson({
            id: 'p3w9-it',
            skill: 'it_communication',
            title: 'Explain architecture to non-specialists',
            objective: 'Translate complex systems into language a PM, recruiter, or founder can follow.',
            teachingPoints: [
              'Clear communication changes with audience, not with the quality of your thinking.',
              'Non-specialists need purpose, flow, and risk more than internal implementation details.',
              'Analogies help only if they clarify instead of oversimplifying badly.',
            ],
            sentenceFrames: [
              'In simple terms, this system ___.',
              'The reason we need ___ is ___.',
              'The main risk is ___, so we monitor ___.',
            ],
            activities: [
              'Take your technical explanation and rewrite it for a non-engineer.',
              'Remove jargon stacking.',
              'Keep one sentence about purpose, one about flow, one about risk.',
            ],
            output: 'A simplified architecture summary.',
            check: {
              evidence: 'Retell one architecture for a non-technical audience.',
              passCriteria: [
                'The purpose is clear quickly.',
                'The flow is understandable without deep jargon.',
                'You still mention one real risk or trade-off.',
              ],
              reflectionPrompt: 'Which technical term do you still rely on too much instead of explaining it?',
            },
          }),
        ],
        resources: [
          {
            id: 'p3w9-resource',
            title: 'System Design Primer',
            channel: 'GitHub',
            url: 'https://github.com/donnemartin/system-design-primer',
            studyObjective: 'Build the vocabulary and structure needed to discuss system design clearly.',
            whyItHelps: 'It organizes design concepts into reusable patterns for architecture interviews.',
            practiceWhileUsing: [
              'Choose one topic and explain it aloud after reading.',
              'Summarize one section in plain English.',
              'Create flashcards for bottleneck, throughput, latency, cache, and replica.',
            ],
            keyPhrases: ['system design', 'scalability', 'trade-offs', 'bottlenecks'],
            quiz: {
              comprehension: [
                'Why are trade-offs central in system design?',
                'What bottlenecks should you mention when explaining a design?',
              ],
              speaking: [
                'Explain a simple architecture for a notification system.',
                'Describe one trade-off between simplicity and scalability.',
              ],
              vocabulary: [
                { phrase: 'bottleneck', practice: 'Use it while discussing database scale.' },
                { phrase: 'throughput', practice: 'Use it when describing system capacity.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p3w9-checkpoint-1', title: 'Design answer ready', requirement: 'Answer one mock system design question with structure.' },
          { id: 'p3w9-checkpoint-2', title: 'Simple explanation ready', requirement: 'Retell the same design for a non-technical audience.' },
        ],
      },
    ],
  },
  {
    id: 4,
    slug: 'phase-4',
    title: 'Phase 4: B2 to C1 Polish',
    levelFrom: 'B2+',
    levelTo: 'C1',
    period: 'Weeks 10-12',
    summary: 'Polish incident communication, facilitation, mentoring, and public-facing communication.',
    unlockRule: 'Weeks unlock one by one; finishing the last week means the full course is complete.',
    weeks: [
      {
        id: 'phase-4-week-10',
        week: 10,
        title: 'Incident communication and calm escalation',
        level: 'B2+ -> C1',
        goal: 'Give clear incident updates under pressure without losing precision or tone.',
        lessons: [
          lesson({
            id: 'p4w10-speaking',
            skill: 'speaking',
            title: 'Give calm incident updates',
            objective: 'State impact, scope, action, and next update clearly during a production issue.',
            teachingPoints: [
              'Incident communication must reduce confusion, not share every thought.',
              'Known facts, current mitigation, and next update are the core of a good status message.',
              'Calm tone matters because panic spreads faster than information.',
            ],
            sentenceFrames: [
              'We are currently seeing ___ affecting ___.',
              'So far we have confirmed ___.',
              'Our next update will be after we verify ___.',
            ],
            activities: [
              'Practice a 60-second incident update.',
              'Separate known facts from open investigation.',
              'Repeat the same update with a calmer pace.',
            ],
            output: 'A reusable incident update pattern.',
            check: {
              evidence: 'Deliver one spoken incident update.',
              passCriteria: [
                'Impact is clear.',
                'Facts and unknowns are separate.',
                'You mention the next update or next action.',
              ],
              reflectionPrompt: 'Which sentence gets too emotional or uncertain when the pressure rises?',
            },
          }),
          lesson({
            id: 'p4w10-listening',
            skill: 'listening',
            title: 'Separate facts, guesses, and actions',
            objective: 'Hear what is confirmed and what is still under investigation in an incident discussion.',
            teachingPoints: [
              'High-pressure conversations mix evidence and speculation very easily.',
              'Listening for certainty markers improves your own updates too.',
              'Action items matter as much as diagnoses during incidents.',
            ],
            sentenceFrames: [
              'This is confirmed: ___.',
              'This is still a hypothesis: ___.',
              'The next action is ___ by ___.',
            ],
            activities: [
              'Label each incident statement as fact, guess, or action.',
              'Repeat the key facts in your own words.',
              'Write down ownership language.',
            ],
            output: 'A fact-vs-hypothesis checklist.',
            check: {
              evidence: 'Classify one incident summary into facts, guesses, and actions.',
              passCriteria: [
                'You separate evidence from assumptions.',
                'You identify ownership for at least one action.',
                'Your restatement stays clear and calm.',
              ],
              reflectionPrompt: 'What kind of sentence do you confuse most often: fact, hypothesis, or action item?',
            },
          }),
          lesson({
            id: 'p4w10-interview',
            skill: 'interview',
            title: 'Tell an outage response story',
            objective: 'Use one incident example to show ownership, prioritization, and communication maturity.',
            teachingPoints: [
              'Incident stories show seniority when they include communication, not only technical fix.',
              'A strong answer explains what changed after the incident too.',
              'The best stories show judgment under pressure.',
            ],
            sentenceFrames: [
              'A production incident I handled involved ___.',
              'My first priority was ___.',
              'After we stabilized the issue, we ___.',
            ],
            activities: [
              'Choose one real outage or major production issue.',
              'Add one communication action and one technical action.',
              'End with a process improvement.',
            ],
            output: 'A senior-style incident story.',
            check: {
              evidence: 'Answer one incident interview question.',
              passCriteria: [
                'You explain the communication side of the response.',
                'You show prioritization under pressure.',
                'You mention a post-incident improvement.',
              ],
              reflectionPrompt: 'Does your story sound like a firefight only, or does it show leadership too?',
            },
          }),
          lesson({
            id: 'p4w10-it',
            skill: 'it_communication',
            title: 'Write status notes that reduce confusion',
            objective: 'Write incident updates that are factual, brief, and useful for stakeholders.',
            teachingPoints: [
              'Readers under pressure need structured facts, not long paragraphs.',
              'A timestamp or update marker matters in incident writing.',
              'Useful incident notes never hide uncertainty; they label it.',
            ],
            sentenceFrames: [
              'Impact: ___.',
              'Current mitigation: ___.',
              'Open question: ___.',
            ],
            activities: [
              'Write one short incident update for engineers.',
              'Write one simplified version for stakeholders.',
              'Keep both versions factual and short.',
            ],
            output: 'Two audience-specific incident updates.',
            check: {
              evidence: 'Write one engineering update and one stakeholder update.',
              passCriteria: [
                'Both versions stay factual.',
                'The audience difference is visible.',
                'Uncertainty is labeled clearly.',
              ],
              reflectionPrompt: 'What information belongs in the engineering version but not in the stakeholder version?',
            },
          }),
        ],
        resources: [
          {
            id: 'p4w10-resource',
            title: 'Managing Incidents',
            channel: 'Google SRE Book',
            url: 'https://sre.google/sre-book/managing-incidents/',
            studyObjective: 'Learn the language of structured incident handling and response.',
            whyItHelps: 'It shows how communication keeps incident response organized and effective.',
            practiceWhileUsing: [
              'Summarize each section as facts, risks, and actions.',
              'Say one incident update after every major paragraph.',
              'Compare unmanaged and well-managed response.',
            ],
            keyPhrases: ['incident management', 'restore normal business operations', 'well-managed approach', 'response to potential incidents'],
            quiz: {
              comprehension: [
                'Why is principled incident management important before a crisis?',
                'How does a well-managed incident differ from an unmanaged one?',
              ],
              speaking: [
                'Give a 60-second incident update using facts and next steps.',
                'Describe one lesson your team should learn after an outage.',
              ],
              vocabulary: [
                { phrase: 'restore normal operations', practice: 'Use it about incident goals.' },
                { phrase: 'well-managed approach', practice: 'Use it about outage response.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p4w10-checkpoint-1', title: 'Incident update ready', requirement: 'Deliver one calm incident status update.' },
          { id: 'p4w10-checkpoint-2', title: 'Written status ready', requirement: 'Write one concise incident note for the right audience.' },
        ],
      },
      {
        id: 'phase-4-week-11',
        week: 11,
        title: 'Retrospectives and process improvement',
        level: 'C1-',
        goal: 'Lead improvement conversations with clear facilitation language and balanced tone.',
        lessons: [
          lesson({
            id: 'p4w11-speaking',
            skill: 'speaking',
            title: 'Facilitate a retrospective',
            objective: 'Open, guide, and close a retrospective with clear language.',
            teachingPoints: [
              'A facilitator should guide the structure without dominating the discussion.',
              'Good retro language moves from observation to action.',
              'Balanced tone matters when the topic is sensitive or frustrating.',
            ],
            sentenceFrames: [
              'Today I want us to focus on ___.',
              'What helped us most this sprint was ___.',
              'One change we should try next sprint is ___.',
            ],
            activities: [
              'Prepare one opener, three prompts, and one closing summary.',
              'Practice moving from problem to action.',
              'Use neutral language for mistakes.',
            ],
            output: 'A short retro facilitation script.',
            check: {
              evidence: 'Lead a mock 60-second retro opening and closing.',
              passCriteria: [
                'The goal of the retro is clear.',
                'Your prompts invite reflection.',
                'The close points toward action.',
              ],
              reflectionPrompt: 'Do you sound like a facilitator or like someone defending a position?',
            },
          }),
          lesson({
            id: 'p4w11-listening',
            skill: 'listening',
            title: 'Hear process problems behind emotional language',
            objective: 'Translate frustration into categories such as scope, tooling, communication, or workflow.',
            teachingPoints: [
              'Retro feedback often arrives emotionally but points to an operational issue.',
              'Strong listeners hear the pattern behind the complaint.',
              'Paraphrasing in neutral language helps teams move toward action.',
            ],
            sentenceFrames: [
              'The underlying issue seems to be ___.',
              'What I hear is that ___.',
              'A clearer way to say this is ___.',
            ],
            activities: [
              'Classify 5 complaints by category.',
              'Paraphrase each one in neutral language.',
              'Match each issue to a possible experiment.',
            ],
            output: 'A complaint-to-action translation sheet.',
            check: {
              evidence: 'Rewrite 5 complaints as neutral process observations.',
              passCriteria: [
                'The new wording stays respectful.',
                'The real process problem is visible.',
                'At least one next action is suggested.',
              ],
              reflectionPrompt: 'Which type of complaint is hardest for you to paraphrase neutrally?',
            },
          }),
          lesson({
            id: 'p4w11-interview',
            skill: 'interview',
            title: 'Talk about process improvement',
            objective: 'Answer leadership questions with an example of improving team workflow.',
            teachingPoints: [
              'Improvement stories show maturity when they include diagnosis, influence, and follow-through.',
              'The best example solves a recurring pain point, not a one-off annoyance.',
              'Results can be measured in clarity, speed, defects, or team alignment.',
            ],
            sentenceFrames: [
              'A process issue we had was ___.',
              'I suggested / introduced ___.',
              'That improved ___ by ___.',
            ],
            activities: [
              'Choose one process improvement you influenced.',
              'Mention how you gained alignment.',
              'Add one measurable or visible effect.',
            ],
            output: 'A process-improvement leadership story.',
            check: {
              evidence: 'Answer one leadership/process question.',
              passCriteria: [
                'You explain the original pain point clearly.',
                'You mention your influence or action.',
                'You describe the effect on team work.',
              ],
              reflectionPrompt: 'Does your story show initiative or only that you participated?',
            },
          }),
          lesson({
            id: 'p4w11-it',
            skill: 'it_communication',
            title: 'Write retro notes with action and owner',
            objective: 'Turn retro discussion into trackable action items.',
            teachingPoints: [
              'A retro without owners and follow-up becomes a venting session.',
              'Action items should be small enough to test in the next sprint.',
              'Written retro notes should preserve clarity, not every sentence spoken.',
            ],
            sentenceFrames: [
              'Observation: ___.',
              'Experiment for next sprint: ___.',
              'Owner / follow-up: ___.',
            ],
            activities: [
              'Write three retro action items.',
              'Make each action item testable.',
              'Add owner and follow-up timing.',
            ],
            output: 'A trackable retro action sheet.',
            check: {
              evidence: 'Write 3 retro actions with owner and follow-up.',
              passCriteria: [
                'Each action is specific.',
                'Every action has an owner.',
                'The action is small enough to test soon.',
              ],
              reflectionPrompt: 'Which action item still sounds like a wish instead of an experiment?',
            },
          }),
        ],
        resources: [
          {
            id: 'p4w11-resource',
            title: 'Sprint Retrospectives',
            channel: 'Atlassian Team Playbook',
            url: 'https://www.atlassian.com/team-playbook/plays/retrospective',
            studyObjective: 'Learn the language of reflecting, aligning, and improving as a team.',
            whyItHelps: 'It gives you facilitation vocabulary useful for retros and leadership interviews.',
            practiceWhileUsing: [
              'Write three retro questions for your current team.',
              'Summarize one sprint in what went well, what hurt, and what to change.',
              'Say each action item aloud using owner plus follow-up language.',
            ],
            keyPhrases: ['sprint retrospective', 'make improvements for future sprints', 'quality results', 'fewer obstacles'],
            quiz: {
              comprehension: [
                'Why are retrospectives essential after a sprint?',
                'How do retrospectives help reduce future obstacles?',
              ],
              speaking: [
                'Facilitate a 60-second retro opening.',
                'Explain one process improvement your team needs now.',
              ],
              vocabulary: [
                { phrase: 'future sprints', practice: 'Use it while discussing process improvement.' },
                { phrase: 'action item', practice: 'Use it about retro follow-up.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p4w11-checkpoint-1', title: 'Retro facilitation ready', requirement: 'Lead a mock retro opener and closing.' },
          { id: 'p4w11-checkpoint-2', title: 'Action sheet ready', requirement: 'Write retro actions with owners and follow-up.' },
        ],
      },
      {
        id: 'phase-4-week-12',
        week: 12,
        title: 'Community voice and mentoring clarity',
        level: 'C1',
        goal: 'Communicate with clarity in mentoring, public discussions, and high-trust conversations.',
        lessons: [
          lesson({
            id: 'p4w12-speaking',
            skill: 'speaking',
            title: 'Sound clear and human in advanced conversations',
            objective: 'Use brevity, curiosity, and clarity in mentoring and leadership talk.',
            teachingPoints: [
              'At higher levels, conversation quality matters more than grammar complexity.',
              'Curiosity keeps advanced conversations open and collaborative.',
              'Shorter sentences often sound more confident in high-trust contexts.',
            ],
            sentenceFrames: [
              'What I would suggest first is ___.',
              'Before deciding, I would ask ___.',
              'The main thing to keep in mind is ___.',
            ],
            activities: [
              'Practice one mentoring answer and one disagreement answer.',
              'Use pauses instead of extra filler words.',
              'End with one question that keeps the conversation open.',
            ],
            output: 'A mentoring and leadership conversation pattern.',
            check: {
              evidence: 'Give one mentoring-style answer and one influence-style answer.',
              passCriteria: [
                'Your tone sounds calm and respectful.',
                'The answer is concise.',
                'You keep the conversation open with a thoughtful question or next step.',
              ],
              reflectionPrompt: 'Where do you add too much extra explanation instead of trusting a clear short answer?',
            },
          }),
          lesson({
            id: 'p4w12-listening',
            skill: 'listening',
            title: 'Listen for intent, not only content',
            objective: 'Recognize whether someone needs advice, validation, challenge, or a decision.',
            teachingPoints: [
              'Advanced listening means hearing what the speaker wants from you.',
              'Reflective listening improves trust in mentoring and leadership conversations.',
              'If you answer the wrong need, even strong English sounds off.',
            ],
            sentenceFrames: [
              'What this person needs most is ___.',
              'Before answering, I would reflect back ___.',
              'A useful response would focus on ___.',
            ],
            activities: [
              'Listen to one conversation and name the speaker need.',
              'Practice reflective listening before offering advice.',
              'Compare a rushed answer with a more supportive one.',
            ],
            output: 'A high-trust listening checklist.',
            check: {
              evidence: 'Analyze one conversation by speaker need and response strategy.',
              passCriteria: [
                'You identify the likely need correctly.',
                'You propose a response that matches that need.',
                'You use reflective listening language once.',
              ],
              reflectionPrompt: 'Which need do you tend to miss: advice, reassurance, or challenge?',
            },
          }),
          lesson({
            id: 'p4w12-interview',
            skill: 'interview',
            title: 'Answer senior communication questions',
            objective: 'Prepare stories about mentoring, influence, and cross-team communication.',
            teachingPoints: [
              'Senior communication stories should show judgment and audience awareness.',
              'Mentoring stories are stronger when they show how the other person improved.',
              'Influence stories should show clarity, not authority alone.',
            ],
            sentenceFrames: [
              'A time I helped another engineer was ___.',
              'To influence the decision, I ___.',
              'The result was better alignment / clarity / delivery because ___.',
            ],
            activities: [
              'Prepare one mentoring story and one influence story.',
              'Highlight the communication pattern you used.',
              'Practice linking the story to team impact.',
            ],
            output: 'Two senior communication stories.',
            check: {
              evidence: 'Answer one mentoring question and one influence question.',
              passCriteria: [
                'The story shows audience awareness.',
                'The communication action is clear.',
                'The result affects team quality or alignment.',
              ],
              reflectionPrompt: 'Do your stories show influence through clarity or only through authority?',
            },
          }),
          lesson({
            id: 'p4w12-it',
            skill: 'it_communication',
            title: 'Write for communities and cross-functional audiences',
            objective: 'Adapt tone for public discussions, docs, and leadership summaries.',
            teachingPoints: [
              'Public-facing communication needs extra clarity because the reader has less context.',
              'Welcoming tone matters when you answer in communities or mentor others.',
              'Executive summaries need purpose, risk, and next step more than deep implementation detail.',
            ],
            sentenceFrames: [
              'In short, the update is ___.',
              'For anyone new to this topic, ___.',
              'The key decision / next step is ___.',
            ],
            activities: [
              'Write one community reply and one 3-line leadership summary.',
              'Remove jargon from the community version.',
              'Check that both texts match the audience.',
            ],
            output: 'A community answer and an executive-style summary.',
            check: {
              evidence: 'Write two versions of the same message for different audiences.',
              passCriteria: [
                'The audience difference is obvious.',
                'The community version sounds welcoming.',
                'The leadership version is concise and decision-oriented.',
              ],
              reflectionPrompt: 'Which audience is harder for you: public beginner-friendly or executive concise?',
            },
          }),
        ],
        resources: [
          {
            id: 'p4w12-resource',
            title: '10 ways to have a better conversation',
            channel: 'TED',
            url: 'https://www.ted.com/talks/celeste_headlee_10_ways_to_have_a_better_conversation',
            studyObjective: 'Refine conversation habits so advanced English sounds more human and engaging.',
            whyItHelps: 'At higher levels, the gap is often conversation quality, not grammar.',
            practiceWhileUsing: [
              'Pause after each rule and connect it to engineering conversations.',
              'Use two rules in your next mock interview or mentoring answer.',
              'Retell the talk as advice for a junior developer.',
            ],
            keyPhrases: ['better conversation', 'honesty, brevity, clarity', 'listen to people', 'be prepared to be amazed'],
            quiz: {
              comprehension: [
                'Which conversation habits are essential in the talk?',
                'Why is listening central to better communication?',
              ],
              speaking: [
                'Explain which rule would improve your team communication most.',
                'Give a short mentoring answer using brevity and clarity.',
              ],
              vocabulary: [
                { phrase: 'brevity', practice: 'Use it in a sentence about technical updates.' },
                { phrase: 'conversation habit', practice: 'Describe one habit you want to improve.' },
              ],
            },
          },
        ],
        checkpoints: [
          { id: 'p4w12-checkpoint-1', title: 'Mentoring answer ready', requirement: 'Give one concise mentoring answer with calm tone and clarity.' },
          { id: 'p4w12-checkpoint-2', title: 'Audience adaptation ready', requirement: 'Write the same idea for a community reader and a leadership reader.' },
        ],
      },
    ],
  },
]

export function getPhaseBySlug(slug: string) {
  return STUDY_PHASES.find((phase) => phase.slug === slug)
}

export const ALL_STUDY_WEEKS = STUDY_PHASES.flatMap((phase) =>
  phase.weeks.map((week) => ({
    ...week,
    phaseId: phase.id,
    phaseSlug: phase.slug,
    phaseTitle: phase.title,
    phaseSummary: phase.summary,
  }))
)
