export const NAV_LINKS = [
  { label: "Products", href: "#products" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Industries", href: "#industries" },
  { label: "Pricing", href: "#pricing" },
]

export const HERO = {
  badge: "AI Infrastructure for Local Business",
  headline: "Intelligent tools built\nfor the businesses\nthat keep communities running.",
  subheadline:
    "Neuvetra builds AI-powered products that handle the operational work — so local service businesses can focus on what they do best.",
  primaryCTA: "Explore our products",
  secondaryCTA: "See how it works",
  trust: "Trusted by service businesses · No credit card required · Setup in minutes",
}

export const PRODUCTS = [
  {
    name: "Neuvetra Front Desk",
    tag: "Available now",
    available: true,
    color: "indigo",
    icon: "🎙️",
    description:
      "Your AI receptionist. Answers every call 24/7, handles FAQs, books appointments, and sends SMS alerts — so you never miss a customer.",
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Neuvetra Scheduler",
    tag: "Coming soon",
    available: false,
    color: "violet",
    icon: "📅",
    description:
      "Intelligent appointment scheduling that syncs with your calendar, sends reminders, and reduces no-shows automatically.",
    cta: "Join waitlist",
    href: "#",
  },
  {
    name: "Neuvetra Insights",
    tag: "Coming soon",
    available: false,
    color: "emerald",
    icon: "📊",
    description:
      "Call analytics and business intelligence. Understand what your customers are asking, when they call, and what drives bookings.",
    cta: "Join waitlist",
    href: "#",
  },
  {
    name: "Neuvetra Engage",
    tag: "Coming soon",
    available: false,
    color: "amber",
    icon: "💬",
    description:
      "Automated SMS follow-ups, appointment reminders, and re-engagement campaigns — all personalized by AI.",
    cta: "Join waitlist",
    href: "#",
  },
]

export const FRONT_DESK_FEATURES = [
  {
    icon: "📞",
    title: "Never misses a call",
    description:
      "Picks up instantly, every time. No hold music, no voicemail, no missed revenue while you're with a customer.",
  },
  {
    icon: "🧠",
    title: "Knows your business",
    description:
      "Train it on your FAQs, hours, services, and pricing. It answers exactly like a knowledgeable member of your team.",
  },
  {
    icon: "📆",
    title: "Books appointments",
    description:
      "Callers can schedule, reschedule, or cancel — fully automated and synced to your calendar in real time.",
  },
  {
    icon: "🌐",
    title: "Any language",
    description:
      "Responds in the caller's preferred language automatically. Reach every customer, no extra setup required.",
  },
  {
    icon: "📋",
    title: "Full call logs",
    description:
      "Transcripts and plain-English summaries for every conversation, searchable from your dashboard.",
  },
  {
    icon: "🔔",
    title: "Instant alerts",
    description:
      "Urgent calls trigger an immediate SMS to your phone with a summary and a link to call back.",
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
    title: "Tell us about your business",
    description: "Business name, type, and we provision you a real local phone number instantly.",
  },
  {
    step: "03",
    title: "Set up call forwarding",
    description: "Forward missed calls from your existing number to your new Neuvetra Front Desk number.",
  },
  {
    step: "04",
    title: "Go live",
    description: "Your AI receptionist is active. Every call answered, every question handled, around the clock.",
  },
]

export const STATS = [
  { value: "< 1s", label: "Average answer time" },
  { value: "24/7", label: "Always available" },
  { value: "80%", label: "Calls handled without staff" },
]

export const WHY_NEUVETRA = [
  {
    title: "Built for the real world",
    description:
      "Not a generic chatbot. Every Neuvetra product is purpose-built for the specific workflows of local service businesses.",
  },
  {
    title: "Enterprise AI, small business price",
    description:
      "We use the same AI models powering Fortune 500 companies — delivered at a price point that works for a 5-person team.",
  },
  {
    title: "You stay in control",
    description:
      "Set the rules, train the AI on your knowledge, and review every interaction from your dashboard. The AI works for you.",
  },
  {
    title: "Grows with your business",
    description:
      "Start with Front Desk. Add Scheduler, Insights, and Engage as your business scales. One platform, one subscription.",
  },
]

export const INDUSTRIES = [
  { label: "Medical & Healthcare", icon: "🏥" },
  { label: "Dental", icon: "🦷" },
  { label: "MedSpa & Wellness", icon: "✨" },
  { label: "Salon & Beauty", icon: "💇" },
  { label: "Home Services", icon: "🔧" },
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
      name: "Neuvetra Front Desk",
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
      "We used to miss 20–30% of calls during peak hours. Now every call gets answered and I can see exactly what patients are asking about. New patient bookings are up noticeably.",
    name: "Dr. Sarah M.",
    business: "Family Dental Practice",
    stars: 5,
  },
  {
    quote:
      "I run a small crew — I can't have someone sitting by the phone all day. Neuvetra Front Desk handles it while we're on jobs. Customers get a real answer, not voicemail.",
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
  headline: "Start with Neuvetra Front Desk today.",
  subheadline:
    "Your AI receptionist is ready in minutes. No contracts, no hardware, no hiring.",
  primaryCTA: "Get started free",
  secondaryCTA: "Talk to us",
}

export const PRICING_TIERS = [
  {
    name: "Starter",
    description: "For solo operators just getting started.",
    monthlyPrice: 49,
    minutes: 150,
    overageRate: "0.25",
    popular: false,
    features: [
      "150 minutes/month (~75 calls)",
      "1 local phone number",
      "Call transcripts & summaries",
      "SMS alerts for urgent calls",
      "Dashboard access",
      "Email support",
    ],
  },
  {
    name: "Growth",
    description: "For active businesses with steady call volume.",
    monthlyPrice: 99,
    minutes: 400,
    overageRate: "0.20",
    popular: true,
    features: [
      "400 minutes/month (~200 calls)",
      "1 local phone number",
      "Call transcripts & summaries",
      "SMS alerts for urgent calls",
      "Dashboard access",
      "Priority email support",
      "Custom AI knowledge base",
    ],
  },
  {
    name: "Pro",
    description: "For high-volume or multi-location businesses.",
    monthlyPrice: 199,
    minutes: 1000,
    overageRate: "0.18",
    popular: false,
    features: [
      "1,000 minutes/month (~500 calls)",
      "Up to 3 phone numbers / locations",
      "Call transcripts & summaries",
      "SMS alerts for urgent calls",
      "Dashboard access",
      "Priority support",
      "Custom AI knowledge base",
      "Early access to Insights & Scheduler",
      "Dedicated onboarding call",
    ],
  },
]

export const FOOTER = {
  tagline: "AI-powered products for the businesses that keep communities running.",
  columns: [
    {
      heading: "Products",
      links: [
        { label: "Neuvetra Front Desk", href: "/signup" },
        { label: "Neuvetra Scheduler", href: "#" },
        { label: "Neuvetra Insights", href: "#" },
        { label: "Neuvetra Engage", href: "#" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About Neuvetra", href: "#" },
        { label: "Pricing", href: "#pricing" },
        { label: "Contact", href: "#" },
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
