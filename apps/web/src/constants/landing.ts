export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
]

export const HERO = {
  badge: "AI Receptionist for Small Business",
  headline: "Your business never stops.\nNeither does your front desk.",
  subheadline:
    "Front Desk answers every call 24/7, handles FAQs, and books appointments — so you can focus on the work that actually grows your business.",
  primaryCTA: "Get started free",
  secondaryCTA: "See how it works",
  trust: "No credit card required · Setup in under 10 minutes · Cancel anytime",
}

export const STATS = [
  { value: "< 1s", label: "Average answer time" },
  { value: "24/7", label: "Always available, zero sick days" },
  { value: "80%", label: "Of calls handled without staff" },
]

export const FEATURES = [
  {
    color: "indigo",
    title: "Never miss a call",
    description:
      "Picks up instantly, every time. No hold music, no voicemail, no missed revenue while you're with a customer.",
  },
  {
    color: "orange",
    title: "Knows your business",
    description:
      "Train it on your FAQs, hours, services, and pricing. It answers exactly like a knowledgeable member of your team.",
  },
  {
    color: "emerald",
    title: "Books appointments",
    description:
      "Callers can schedule, reschedule, or cancel over the phone — fully automated, synced to your calendar.",
  },
  {
    color: "violet",
    title: "Works in any language",
    description:
      "Responds in the caller's preferred language automatically. Reach every customer, no extra setup required.",
  },
  {
    color: "amber",
    title: "Every call logged",
    description:
      "Full transcripts and plain-English summaries for every conversation, searchable from your dashboard.",
  },
  {
    color: "rose",
    title: "Your number, your brand",
    description:
      "Keep your existing number or get a fresh local one. Sounds like your business — not a generic call center.",
  },
]

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create your account",
    description: "Enter your mobile number and verify with a one-time code. Takes 30 seconds.",
  },
  {
    step: "02",
    title: "Describe your business",
    description: "Tell us your business name, type, and preferred area code. That's all we need to start.",
  },
  {
    step: "03",
    title: "Get your AI number",
    description: "We instantly provision a real local phone number. No paperwork, no waiting.",
  },
  {
    step: "04",
    title: "Go live",
    description: "Your AI receptionist is active. Every call answered, every question handled, around the clock.",
  },
  {
    step: "05",
    title: "Stay in the loop",
    description: "Review transcripts and summaries from your dashboard. Know exactly what your callers need.",
  },
]

export const INDUSTRIES = [
  { label: "Medical & Healthcare", icon: "🏥" },
  { label: "Dental", icon: "🦷" },
  { label: "MedSpa & Wellness", icon: "✨" },
  { label: "Salon & Beauty", icon: "💇" },
  { label: "Plumbing & Trades", icon: "🔧" },
  { label: "Legal", icon: "⚖️" },
  { label: "Real Estate", icon: "🏡" },
  { label: "And many more", icon: "+" },
]

export const COMPARISON = {
  features: [
    "Available 24/7",
    "Monthly cost",
    "Setup time",
    "Knows your business",
    "Call transcripts",
  ],
  columns: [
    {
      name: "Front Desk AI",
      highlight: true,
      values: ["Always", "From $49/mo", "< 10 minutes", "Fully trained by you", "Every call"],
    },
    {
      name: "Hire a receptionist",
      highlight: false,
      values: ["Business hours only", "$3,000+/mo", "Weeks to hire & train", "Takes time to learn", "None"],
    },
    {
      name: "Answering service",
      highlight: false,
      values: ["Partial coverage", "$300–$600/mo", "2–3 days", "Generic scripts only", "Rarely"],
    },
  ],
}

export const TESTIMONIALS = [
  {
    quote:
      "We used to miss 20–30% of calls during peak hours. Now every call gets answered and I can actually see what patients are asking about. New patient bookings are up noticeably.",
    name: "Dr. Sarah M.",
    business: "Family Dental Practice",
    stars: 5,
  },
  {
    quote:
      "I run a small crew — I can't have someone sitting by the phone all day. Front Desk handles it while we're on jobs. Customers get a real answer, not voicemail. Game changer.",
    name: "Marcus T.",
    business: "T&R Plumbing",
    stars: 5,
  },
  {
    quote:
      "Setup took maybe 10 minutes. The AI knows our services, our pricing, our hours. Clients honestly can't tell it's not a person. Worth every penny.",
    name: "Elena V.",
    business: "Lumina MedSpa",
    stars: 5,
  },
]

export const CTA_BANNER = {
  headline: "Ready to put your front desk on autopilot?",
  subheadline: "Join small businesses that never miss a call.",
  primaryCTA: "Start for free",
  secondaryCTA: "Talk to us",
}

export const FOOTER = {
  tagline: "AI-powered voice reception for the businesses that keep communities running.",
  columns: [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      heading: "Account",
      links: [
        { label: "Sign up", href: "/signup" },
        { label: "Sign in", href: "/login" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} Neuvetra / Birgani Enterprises Inc. All rights reserved.`,
}
