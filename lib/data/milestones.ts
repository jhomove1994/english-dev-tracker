export interface Milestone {
  id: string
  description: string
  phase: number
}

export interface Phase {
  id: number
  title: string
  period: string
  levelFrom: string
  levelTo: string
  description: string
  milestones: Milestone[]
  motivationalMessage: string
}

export const PHASES: Phase[] = [
  {
    id: 1,
    title: 'Phase 1: Core Foundation',
    period: 'Months 1–2',
    levelFrom: 'A2',
    levelTo: 'B1',
    description: 'Build core vocabulary, basic speaking fluency, and confidence for daily dev conversations.',
    motivationalMessage: 'Every expert was once a beginner. Start speaking today, even imperfectly!',
    milestones: [
      { id: 'phase1_m1', description: 'Describe your current stack in 2 minutes without long pauses', phase: 1 },
      { id: 'phase1_m2', description: 'Tell a story about a bug you solved recently', phase: 1 },
      { id: 'phase1_m3', description: 'Have 100 IT phrases in Anki with 80%+ retention', phase: 1 },
    ],
  },
  {
    id: 2,
    title: 'Phase 2: Technical Fluency',
    period: 'Months 3–5',
    levelFrom: 'B1',
    levelTo: 'B2',
    description: 'Achieve technical fluency for standups, code reviews, and explaining architecture.',
    motivationalMessage: 'You can now hold basic conversations. Push through to technical fluency!',
    milestones: [
      { id: 'phase2_m1', description: 'Do a complete 3-min standup without thinking in Spanish', phase: 2 },
      { id: 'phase2_m2', description: 'Explain the architecture of your current project', phase: 2 },
      { id: 'phase2_m3', description: 'Complete at least 20 italki sessions', phase: 2 },
    ],
  },
  {
    id: 3,
    title: 'Phase 3: Interview Ready',
    period: 'Months 6–8',
    levelFrom: 'B2',
    levelTo: 'B2+',
    description: 'Prepare for technical and behavioral interviews with polished answers and confidence.',
    motivationalMessage: "You're at B2 now. Time to get interview-ready and land that dream job!",
    milestones: [
      { id: 'phase3_m1', description: 'Have a polished 2-min "Tell me about yourself" ready', phase: 3 },
      { id: 'phase3_m2', description: 'Have 10 STAR answers ready to verbalize', phase: 3 },
      { id: 'phase3_m3', description: 'Complete at least 8 full mock interviews', phase: 3 },
      { id: 'phase3_m4', description: "Explain an app's architecture in 5 minutes", phase: 3 },
    ],
  },
  {
    id: 4,
    title: 'Phase 4: Maintenance & Polish',
    period: 'Month 9+',
    levelFrom: 'B2',
    levelTo: 'C1',
    description: 'Maintain and polish your English through daily engagement with the dev community.',
    motivationalMessage: 'Near-native level. Keep the momentum — consistency is everything now!',
    milestones: [
      { id: 'phase4_m1', description: 'Participate daily in English dev communities', phase: 4 },
      { id: 'phase4_m2', description: 'Watch 1 full tech conference per week', phase: 4 },
      { id: 'phase4_m3', description: 'Comment on OSS PRs/issues in English 3x/week', phase: 4 },
    ],
  },
]
