'use client'

import { useState } from 'react'
import { useSpeech } from '@/lib/hooks/useSpeech'
import { Volume2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface TemplateSection {
  label: string
  text: string
  explanation: string
}

interface Template {
  id: string
  title: string
  category: string
  subject: string
  sections: TemplateSection[]
}

const TEMPLATES: Template[] = [
  {
    id: 'tpl_clarify',
    title: 'Asking for Clarification',
    category: 'Slack / Email',
    subject: 'Quick question about [topic]',
    sections: [
      { label: 'Opening', text: "Hi [Name], hope you're doing well.", explanation: "Friendly but professional opener — use 'Hi' in async messages, not 'Dear'." },
      { label: 'Context', text: "I was going through [ticket/document/meeting notes] and had a question about [specific point].", explanation: "Be specific so the reader doesn't have to guess what you're referring to." },
      { label: 'The question', text: "Could you help me understand [X]? Specifically, I'm not sure whether we should [option A] or [option B].", explanation: "Giving options makes it easier for the other person to answer quickly." },
      { label: 'Closing', text: "Thanks in advance! Let me know if you need more context.", explanation: "Show you're open to follow-up — this reduces back-and-forth." },
    ],
  },
  {
    id: 'tpl_bug_report',
    title: 'Reporting a Bug to a Client',
    category: 'Email',
    subject: 'Issue identified in [feature] — update',
    sections: [
      { label: 'Opening', text: "Hi [Name], I wanted to give you a heads-up about an issue we identified in [feature/module].", explanation: "Be proactive — informing clients before they notice builds trust." },
      { label: 'What happened', text: "Users may experience [describe the symptom] when [trigger condition]. This appears to affect [scope — e.g., a small percentage of users].", explanation: "Describe impact without technical jargon. Focus on what the user sees, not the internal error." },
      { label: 'What we are doing', text: "Our team is actively investigating and we expect to have a fix deployed by [date/time]. In the meantime, [workaround if any].", explanation: "'Actively investigating' and a concrete ETA show ownership. Always offer a workaround if possible." },
      { label: 'Closing', text: "We apologize for the inconvenience and will keep you posted on our progress. Please don't hesitate to reach out with any questions.", explanation: "Acknowledge the impact, but don't over-apologize. Stay professional and action-oriented." },
    ],
  },
  {
    id: 'tpl_pr_request',
    title: 'Requesting a Code Review',
    category: 'Slack / PR',
    subject: 'PR ready for review — [feature name]',
    sections: [
      { label: 'The PR', text: "Hey [Name], I just opened a PR for [feature/bugfix]. Here's the link: [URL].", explanation: "Always include the link directly — don't make reviewers search for it." },
      { label: 'What it does', text: "This PR [briefly describes the change — e.g., adds pagination to the users list and improves query performance].", explanation: "A one-sentence summary helps reviewers understand scope before they open the diff." },
      { label: 'What to focus on', text: "I'd especially appreciate feedback on [specific area — e.g., the approach I used for error handling / the SQL query optimization].", explanation: "Guiding reviewers to specific areas speeds up the review and gets you more useful feedback." },
      { label: 'Timing', text: "No rush, but ideally by end of day [date] so we can merge before the release.", explanation: "Be transparent about deadlines without being demanding." },
    ],
  },
  {
    id: 'tpl_decline_meeting',
    title: 'Declining a Meeting Politely',
    category: 'Email / Calendar',
    subject: 'Re: [Meeting title]',
    sections: [
      { label: 'Opening', text: "Thanks for the invite!", explanation: "'Thanks for the invite' is always a good way to open — it's polite without being overly formal." },
      { label: 'Decline with reason', text: "Unfortunately I won't be able to join [meeting name] on [date] as I have a conflicting commitment.", explanation: "You don't need to over-explain. A brief reason is enough — you're not asking for permission." },
      { label: 'Stay in the loop', text: "Could you share the notes or recording afterwards so I can stay aligned?", explanation: "Asking for notes shows you care about the outcome, even if you can't attend." },
      { label: 'Optional: Offer async', text: "I'm happy to share my thoughts async beforehand if that would help.", explanation: "Offering something in return makes the decline feel collaborative, not dismissive." },
    ],
  },
  {
    id: 'tpl_status_update',
    title: 'Project Status Update',
    category: 'Email / Slack',
    subject: 'Status update — [Project/Feature name]',
    sections: [
      { label: 'Summary line', text: "Quick status update on [feature/project]: things are on track.", explanation: "Lead with the headline. Busy people read the first line and move on — make it count." },
      { label: 'What is done', text: "✅ Completed: [list key completed items briefly].", explanation: "Use checkmarks or bullets for scannability. Keep it brief." },
      { label: 'What is next', text: "🔜 In progress: [what is currently being worked on and by whom].", explanation: "Mention who owns what to show accountability." },
      { label: 'Blockers or risks', text: "⚠️ One thing to flag: [risk or blocker]. We're working on [mitigation].", explanation: "Proactively flagging risks builds trust. Never hide problems — surface them early." },
      { label: 'Closing', text: "Let me know if you have any questions or need me to prioritize differently.", explanation: "Inviting input shows you're open to feedback and flexible." },
    ],
  },
]

const CATEGORIES = Array.from(new Set(TEMPLATES.map(t => t.category)))

// Approximate ms per character for TTS duration estimation (used to clear speaking state)
const TTS_MS_PER_CHAR = 65
const TTS_MIN_MS = 2000

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedId, setExpandedId] = useState<string | null>(TEMPLATES[0].id)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [speakingText, setSpeakingText] = useState<string | null>(null)
  const { speak, stop, isSupported: ttsSupported } = useSpeech()

  const filtered = selectedCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory)

  const getFullText = (t: Template) =>
    t.sections.map(s => s.text).join('\n\n')

  const copyTemplate = async (t: Template) => {
    await navigator.clipboard.writeText(getFullText(t))
    setCopiedId(t.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSpeak = (text: string) => {
    if (speakingText === text) { stop(); setSpeakingText(null); return }
    setSpeakingText(text)
    speak(text)
    const ms = Math.max(TTS_MIN_MS, text.length * TTS_MS_PER_CHAR)
    setTimeout(() => setSpeakingText(null), ms)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Email & Slack Templates</h2>
        <p className="text-sm text-gray-400 mt-1">Professional templates for common work situations. Each section explains why it's written that way.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-green-500 text-black' : 'bg-[#1f1f1f] text-gray-400 hover:bg-[#2a2a2a]'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(template => (
          <div key={template.id} className="bg-[#111111] border border-[#1f1f1f] rounded-xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#161616] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-400 border border-[#2a2a2a]">{template.category}</span>
                <span className="text-white font-semibold">{template.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {expandedId === template.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {expandedId === template.id && (
              <div className="px-5 pb-5 space-y-4 border-t border-[#1f1f1f] pt-4">
                {/* Subject line */}
                <div className="text-xs text-gray-500">
                  <span className="text-gray-400 font-medium">Subject: </span>{template.subject}
                </div>

                {/* Sections */}
                <div className="space-y-3">
                  {template.sections.map((section, i) => (
                    <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-400 font-medium uppercase tracking-wide">{section.label}</span>
                        {ttsSupported && (
                          <button
                            onClick={() => handleSpeak(section.text)}
                            className={`w-7 h-7 flex items-center justify-center rounded-full border transition-colors ${speakingText === section.text ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#333] text-gray-500 hover:text-white'}`}
                          >
                            <Volume2 size={12} />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-white">{section.text}</p>
                      <p className="text-xs text-gray-500 italic border-l-2 border-[#2a2a2a] pl-2">{section.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Copy button */}
                <button
                  onClick={() => copyTemplate(template)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${copiedId === template.id ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-[#2a2a2a] text-gray-400 hover:border-[#333] hover:text-white'}`}
                >
                  {copiedId === template.id ? <><Check size={14} /> Copied to clipboard</> : <><Copy size={14} /> Copy full template</>}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
