export interface MeetingPhrase {
  id: string
  phrase: string
  context: string
  example: string
  category: string
}

export const MEETING_PHRASE_CATEGORY = {
  STANDUP: 'Daily Standup',
  CODE_REVIEW: 'Code Review',
  SPRINT: 'Sprint Planning',
  RETRO: 'Retrospective',
  ONE_ON_ONE: '1-on-1s',
  CLIENT: 'Client Calls',
} as const

type PhraseTuple = readonly [phrase: string, context: string, example: string]

function buildPhrases(prefix: string, category: string, entries: readonly PhraseTuple[]): MeetingPhrase[] {
  return entries.map(([phrase, context, example], i) => ({
    id: `${prefix}_${i + 1}`,
    phrase,
    context,
    example,
    category,
  }))
}

const standupPhrases: readonly PhraseTuple[] = [
  ["Yesterday I worked on...", "Report what you completed", "Yesterday I worked on the user authentication refactor."],
  ["Today I'm planning to...", "State your plan for the day", "Today I'm planning to finish the API integration tests."],
  ["I'm blocked by...", "Mention a blocker", "I'm blocked by a dependency on the backend team's endpoint."],
  ["There are no blockers on my side.", "Confirm no blockers", "Everything looks good. There are no blockers on my side."],
  ["I'll need some help with...", "Ask for support", "I'll need some help with the database schema design."],
  ["I should have this done by end of day.", "Set a time expectation", "The PR is almost ready. I should have this done by end of day."],
  ["I opened a PR for review.", "Announce a pull request", "I opened a PR for review — it's linked in the ticket."],
  ["I'm still investigating the issue.", "Explain ongoing work", "I'm still investigating the issue with the login flow."],
]

const codeReviewPhrases: readonly PhraseTuple[] = [
  ["Can you take a look at my PR?", "Request a review", "I pushed the changes. Can you take a look at my PR when you have a moment?"],
  ["I left some comments inline.", "Explain review feedback", "I left some comments inline — mostly minor suggestions."],
  ["LGTM — looks good to me.", "Approve a PR", "Everything looks clean. LGTM — looks good to me!"],
  ["I have a question about this approach.", "Ask about design decisions", "I have a question about this approach — why did we choose REST over GraphQL here?"],
  ["This might cause a performance issue.", "Flag a concern", "This might cause a performance issue if the list grows large."],
  ["Could we extract this into a helper function?", "Suggest a refactor", "Could we extract this into a helper function to keep things DRY?"],
  ["I think this edge case isn't handled.", "Point out missing coverage", "I think this edge case isn't handled — what happens when the response is empty?"],
  ["Nice catch! I'll fix it.", "Accept feedback gracefully", "Nice catch! I'll fix it before merging."],
]

const sprintPhrases: readonly PhraseTuple[] = [
  ["Can we add this to the backlog?", "Defer non-urgent work", "That's a good idea but not urgent. Can we add this to the backlog?"],
  ["I'd estimate this takes about 3 story points.", "Give an estimate", "I'd estimate this takes about 3 story points based on the complexity."],
  ["What's the acceptance criteria for this ticket?", "Clarify requirements", "Before I start, what's the acceptance criteria for this ticket?"],
  ["This depends on the design being finalized.", "Flag a dependency", "This depends on the design being finalized — we might need to wait."],
  ["Let's time-box this discussion.", "Keep meeting on track", "We're spending a lot of time here. Let's time-box this discussion to 5 minutes."],
  ["I can take this one.", "Volunteer for a task", "That ticket looks straightforward. I can take this one."],
  ["Can we split this into smaller tasks?", "Break down work", "This ticket is quite large. Can we split this into smaller tasks?"],
  ["What's our definition of done for this sprint?", "Clarify sprint goals", "Before we start — what's our definition of done for this sprint?"],
]

const retroPhrases: readonly PhraseTuple[] = [
  ["What went well this sprint was...", "Share a positive", "What went well this sprint was the close collaboration between frontend and backend."],
  ["One thing we could improve is...", "Share a suggestion", "One thing we could improve is our PR review turnaround time."],
  ["I felt frustrated when...", "Share honest feedback", "I felt frustrated when requirements changed mid-sprint without notice."],
  ["I appreciated the support from...", "Acknowledge teammates", "I appreciated the support from the team during the incident last week."],
  ["An action item I propose is...", "Suggest a concrete action", "An action item I propose is to set up a weekly sync with the design team."],
  ["Let's keep doing...", "Reinforce good practices", "Let's keep doing the daily standup — it really helps alignment."],
  ["We should stop doing...", "Identify bad patterns", "We should stop doing last-minute deployments on Fridays."],
]

const oneOnOnePhrases: readonly PhraseTuple[] = [
  ["I wanted to get your feedback on...", "Request input from manager", "I wanted to get your feedback on how I handled the client situation last week."],
  ["I'm interested in growing in the area of...", "Express career goals", "I'm interested in growing in the area of system design."],
  ["I'm finding it challenging to...", "Share a struggle", "I'm finding it challenging to balance feature work with tech debt."],
  ["Can you help me prioritize?", "Ask for guidance", "I have several competing tasks. Can you help me prioritize?"],
  ["What are your expectations for me this quarter?", "Align on goals", "I'd like to know — what are your expectations for me this quarter?"],
  ["I feel like I could contribute more to...", "Show initiative", "I feel like I could contribute more to the architecture decisions."],
  ["I'd love more opportunities to...", "Express a desire to grow", "I'd love more opportunities to lead technical discussions with the team."],
]

const clientPhrases: readonly PhraseTuple[] = [
  ["Just to make sure we're aligned...", "Confirm shared understanding", "Just to make sure we're aligned — the delivery is expected by Friday, correct?"],
  ["Could you clarify what you mean by...?", "Ask for clarification professionally", "Could you clarify what you mean by 'performance issues'? Is this about load time or data accuracy?"],
  ["We'll have that ready by...", "Set a delivery expectation", "We'll have that ready by end of week for your review."],
  ["I'd like to flag a risk here.", "Proactively raise a concern", "I'd like to flag a risk here — this change might impact the existing integration."],
  ["Can we schedule a follow-up call?", "Move discussion forward", "This is a great point. Can we schedule a follow-up call to dive deeper?"],
  ["We're on track.", "Provide a status update", "Good news — we're on track and the feature will be ready as planned."],
  ["We ran into an unexpected issue, but we have a plan.", "Communicate a delay professionally", "We ran into an unexpected issue, but we have a plan and it shouldn't affect the timeline significantly."],
]

export const MEETING_PHRASES: MeetingPhrase[] = [
  ...buildPhrases('su', MEETING_PHRASE_CATEGORY.STANDUP, standupPhrases),
  ...buildPhrases('cr', MEETING_PHRASE_CATEGORY.CODE_REVIEW, codeReviewPhrases),
  ...buildPhrases('sp', MEETING_PHRASE_CATEGORY.SPRINT, sprintPhrases),
  ...buildPhrases('rt', MEETING_PHRASE_CATEGORY.RETRO, retroPhrases),
  ...buildPhrases('oo', MEETING_PHRASE_CATEGORY.ONE_ON_ONE, oneOnOnePhrases),
  ...buildPhrases('cl', MEETING_PHRASE_CATEGORY.CLIENT, clientPhrases),
]

export const MEETING_PHRASE_CATEGORIES = Object.values(MEETING_PHRASE_CATEGORY)
