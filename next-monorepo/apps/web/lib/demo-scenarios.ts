export type GatedAssets = {
  calendarUrl?: string
  email?: string
  phone?: string
  address?: string
  githubUrl?: string
  websiteUrl?: string
}

export type DemoScenario = {
  id: string
  title: string
  summary: string
  goal: string
  criteria: string[]
  qualifierQuestion: string
  successMessage: string
  gatedAssets: GatedAssets
}

export const GITHUB_REPO_URL = "https://github.com/raldblox/eigentic-profile"

export const demoScenarios: DemoScenario[] = [
  {
    id: "autonomous-agents",
    title: "Autonomous Agent Builders",
    summary: "Only show the repo and demo access to builders shipping agentic systems.",
    goal: "Qualify people building autonomous agents or agent workflows.",
    criteria: [
      "They are actively building an autonomous agent or workflow.",
      "They can name the use case, model, or deployment environment.",
      "They want the repo or demo because they plan to use it.",
    ],
    qualifierQuestion:
      "What autonomous agent are you building, and where would this profile fit in your stack?",
    successMessage:
      "You qualify. I can share the repo and the next step for the demo.",
    gatedAssets: {
      githubUrl: GITHUB_REPO_URL,
      calendarUrl: "https://cal.com/raldblox/eigentic-demo",
    },
  },
  {
    id: "founder-demo",
    title: "Founders Booking Demos",
    summary: "Route only serious founders to the calendar link and private demo.",
    goal: "Book time only with founders who have a real product and a clear next step.",
    criteria: [
      "They are the founder or operator making the buying decision.",
      "They have a product, team, or pipeline already in motion.",
      "They want a live demo or direct setup help.",
    ],
    qualifierQuestion:
      "Are you the founder or decision maker, and what product or team are you trying to qualify?",
    successMessage:
      "Thanks. You look like a fit, and I can unlock the booking link now.",
    gatedAssets: {
      calendarUrl: "https://cal.com/raldblox/founder-demo",
      email: "founders@eigentic.profile",
    },
  },
  {
    id: "sales-leads",
    title: "Qualified Sales Leads",
    summary: "Gate phone numbers, email, and address until the visitor proves buying intent.",
    goal: "Collect enough signal to route serious leads to a human.",
    criteria: [
      "They have a real project or budget.",
      "They can explain timeline and use case.",
      "They are ready for a follow-up from sales.",
    ],
    qualifierQuestion:
      "What are you buying, and what timeline are you working against?",
    successMessage:
      "You qualify. I can hand off the contact details and schedule the follow-up.",
    gatedAssets: {
      email: "sales@eigentic.profile",
      phone: "+1 (555) 014-2026",
      address: "San Francisco, CA",
    },
  },
  {
    id: "private-advisory",
    title: "Private Advisory Access",
    summary: "Reserve private office details for serious operators and partners.",
    goal: "Reveal office, direct email, and calendar only when the visitor is a credible partner.",
    criteria: [
      "They explain the partnership or advisory opportunity clearly.",
      "They have a relevant background or company.",
      "They are asking for a concrete next step.",
    ],
    qualifierQuestion:
      "What partnership or advisory conversation are you trying to start, and why now?",
    successMessage:
      "That sounds credible. I can share the private contact and office details.",
    gatedAssets: {
      email: "partners@eigentic.profile",
      address: "41 Market Street, San Francisco, CA",
      calendarUrl: "https://cal.com/raldblox/private-advisory",
    },
  },
  {
    id: "recruiting",
    title: "Recruiting and Hiring",
    summary: "Only reveal hiring contacts to candidates or recruiters with a real match.",
    goal: "Filter candidates and recruiters before sharing hiring details.",
    criteria: [
      "They are a candidate or recruiter with a relevant background.",
      "They know which role they are discussing.",
      "They can explain why they are a fit.",
    ],
    qualifierQuestion:
      "Which role are you applying or recruiting for, and what makes you a fit?",
    successMessage:
      "You look relevant. I can open the hiring contact and schedule next steps.",
    gatedAssets: {
      email: "jobs@eigentic.profile",
      phone: "+1 (555) 014-4080",
      githubUrl: GITHUB_REPO_URL,
    },
  },
]

export function getDemoScenario(id: string): DemoScenario {
  return demoScenarios.find((scenario) => scenario.id === id) ?? demoScenarios[0]!
}
