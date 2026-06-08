import { C } from "@/portal/tokens";

export const EXEC_SUMMARY = {
  headline: "The operating system for independent live music.",
  intro: "Music Habitat is an integrated platform of bid-based booking, fan economy, real-time discovery, and artist infrastructure — purpose-built for the 300,000+ artists and 10,000+ venues operating in the segment that legacy systems were never designed to serve.",
  problem: {
    title: "A market built around its top 5%.",
    items: [
      ["Booking is broken.", "Independent venues and emerging artists negotiate through email threads, phone calls, and personal favors. No transparency, no data, no compatibility matching. The booking infrastructure that exists at the top tier has never been built for the bottom of the market."],
      ["Ticketing is fragmented.", "An artist touring 20 venues encounters 20 ticketing platforms. Different credentials at each stop. No single place to track sales, settlement, or revenue splits in real time."],
      ["Fan economics are extractive.", "Streaming royalties don't pay rent. Artists need direct fan relationships, recurring revenue, and ownership stakes in the work they create — none of which today's dominant platforms support."],
    ],
  },
  platform: {
    title: "Five services, one operating system.",
    services: [
      ["StageBid™", "Bid-based booking marketplace. Venues post budgets, artists bid, AI-powered compatibility matching surfaces the highest-probability pairings."],
      ["Book Private*", "The monster.com for the arts. Public booking marketplace connecting independent artists with private clients, corporate events, weddings, brand activations, and premium engagements — the largest untapped revenue stream in independent music."],
      ["Live Pulse™*", "Real-time culture discovery. A \"tonight in [city]\" engine surfacing live music, nearby events, and culture-adjacent venues by proximity — the discovery layer of the platform."],
      ["Go Live", "Built-in livestreaming and fan economy. Artists broadcast ticketed and free performances directly to fans, with integrated tipping, premium access tiers, and exclusive digital content windows."],
      ["Digital EPK + Venue Cards", "Artist infrastructure. Standardized digital electronic press kits, Venue Card compatibility matching across booking, merch, and technical specs, and a secure credential vault for up to ten major ticketing platforms."],
    ],
    note: "* Services with large-scale potential beyond core platform operations.",
  },
  market: [
    ["TAM", "$121.5B", "Global live music industry, projected to exceed $150B by 2030 (Statista, PwC).", "#00C9DD"],
    ["SAM", "$12.0B", "North American independent & emerging-artist segment, 100–5,000 capacity venues.", "#7CCB6E"],
    ["SOM", "$500M", "5-year revenue target across 50K+ artists, 10K+ venues, 1M+ fans.", "#EDB901"],
  ],
  businessModel: {
    title: "Multi-stream by design.",
    streams: [
      ["StageBid Transaction Fees", "Booking marketplace commission on artist-venue transactions."],
      ["Artist & Venue Subscriptions", "SaaS tiers across StageBid, EPK, and Rolodex; recurring monthly base."],
      ["Artist Commerce (Merch + Go Live)", "10% take on artist merch and Go Live livestream tipping."],
      ["Ad Network & Live Pulse* Inventory", "CPM and flat-rate venue, brand, and culture-partner placements."],
    ],
  },
  gtm: {
    title: "New Orleans first.",
    phases: [
      ["Launch", "New Orleans, 2026. Year-round touring, dense venue ecosystem."],
      ["Phase 1", "90-day venue beta. Free onboarding; subscription conversion at graduation."],
      ["Phase 2", "Ambassador-led artist activation. Bottom-up onboarding replaces paid CAC."],
      ["Phase 3", "Regional expansion. Nashville, Austin, Atlanta — replication ready."],
      ["Phase 4", "National scale. Top 25 metros, then secondary markets."],
    ],
  },
  trajectory: {
    title: "Three-year projection.",
    revenue: [["Year 1", 2], ["Year 2", 12], ["Year 3", 35]],
    metrics: [
      ["Artists", "20K", "75K", "200K"],
      ["Venues", "250", "1.5K", "4.5K"],
      ["Active Fans", "35K", "150K", "500K"],
      ["Headcount", "10", "22", "50"],
    ],
    note: "Bottom-up build anchored on the New Orleans launch market: 250 venues, 20,000 artists, 35,000 active fans at Y1, scaling 6× to 1,500 venues in Y2 and 4,500 venues at national scale in Y3. Detailed model on request.",
  },
  proceeds: {
    title: "$250K seed allocation.",
    items: [
      ["Engineering / AI / Platform Build", 30, C.teal],
      ["New Orleans Launch & Activation", 30, C.amber],
      ["Operations & Legal", 25, "#6B8AB0"],
      ["Marketing & Brand", 10, "#C97FB0"],
      ["Working Capital Reserve", 5, C.textFaint],
    ],
    note: "Reflects planned seed round following Friends & Family. Allocation under active CEO review; Series A targeted H1 2027.",
  },
  // BACKEND HOOK: replace the LinkedIn URLs below with each leader's real profile URL.
  leadership: [
    ["Brandon Beard", "Chairman · Founder · CEO", "brandon.jpg", "https://www.linkedin.com/in/brandon-beard"],
    ["Bruce White", "Chief Technology Officer", "bruce.jpg", "https://www.linkedin.com/in/bruce-white"],
    ["Jessica Kaun", "Chief Vibe Officer", "jessica.jpg", "https://www.linkedin.com/in/jessica-kaun"],
    ["Michael Garvin", "Chief Artistry Officer", "garvin.jpg", "https://michaelgarvinmusic.com", "website"],
  ],
  disclaimer: "CONFIDENTIAL — F&F ROUND. Provided exclusively to prospective investors with whom Music Habitat, Inc. has a pre-existing, substantive relationship, in reliance on Rule 506(b) of Regulation D under the Securities Act of 1933, as amended. Not for redistribution. PRIVATE OFFERING. Securities described are offered solely through the separate Friends & Family Offering Package and supporting agreements. FORWARD-LOOKING. Market sizing, financial projections, product roadmap, and competitive positioning are forward-looking and subject to material uncertainty. Contact: brandon@musichabitat.com",
};

export const REFERRERS = [
  { id: "brandon", name: "Brandon Beard",  role: "Founder · CEO",                     img: "brandon.jpg" },
  { id: "michael", name: "Michael Matthews", role: "Board Member",                    img: "michael.jpg" },
  { id: "bruce",   name: "Bruce White",     role: "Chief Technology Officer",          img: "bruce.jpg" },
  { id: "kim",     name: "Kim Russell",     role: "Director of Market Development",    img: "kim.jpg" },
  { id: "jessica", name: "Jessica Kaun",    role: "Chief Vibe Officer",                img: "jessica.jpg" },
  { id: "garvin",  name: "Michael Garvin",  role: "Chief Artistry Officer",            img: "garvin.jpg" },
  { id: "sess45",  name: "Sess45",          role: "Artist Relations & Cultural Partnerships", img: "sess45.jpg" },
  { id: "ben",     name: "Ben Herrera",     role: "Board Member",                      img: "ben.jpg" },
  { id: "brian",   name: "Brian Smith",     role: "Strategic Advisor & Board Member",  img: "brian.jpg" },
  { id: "shelly",  name: "Shelly Clark",    role: "Strategic Advisor",                 img: "shelly.jpg" },
];

export const DOC_CENTER = {
  company: [
    { id: "execsum",     name: "Executive Summary", action: "download" },
    { id: "deck",        name: "Pitch Deck", action: "view" },
    { id: "bizplan",     name: "Business Plan", action: "view" },
    { id: "model",       name: "Financial Model", action: "view" },
    { id: "team",        name: "Leadership Team", action: "view" },
    { id: "services",    name: "Services", action: "view" },
    { id: "prototype",   name: "Prototype View", action: "view" },
  ],
  investor: [
    { id: "termsheet_i", name: "Term Sheet", action: "download" },
    { id: "proceeds",    name: "Use of Proceeds", action: "download" },
    { id: "safe",        name: "SAFE Agreement", action: "download" },
    { id: "warrant",     name: "Warrant Agreement", action: "download" },
    { id: "operating",   name: "Operating Agreement", action: "download" },
    { id: "subscription",name: "Subscription Agreement & Questionnaire", action: "download" },
  ],
};

// All 13 Q&A — DRAFTED. Founder to red-line.
export const QA = {
  Company: [
    { q: "What is Music Habitat?",
      a: "Music Habitat is the company behind StageBid™ — an AI-powered operating system for the live-music industry. It connects four sides of the ecosystem — independent artists, venues, fans, and private clients — on one verified, data-driven platform that handles discovery, booking, ticketing, payments, and reputation. Music Habitat launches in New Orleans and scales across the Gulf South before going national." },
    { q: "What problems are we solving?",
      a: "Live-music booking today runs on cold emails, spreadsheets, and middlemen who take a cut without adding trust. Artists struggle to find the right stage and get paid cleanly; venues waste hours sourcing talent and forecasting profit; fans can't easily discover what's happening near them right now; and private clients have no trusted way to book verified talent. StageBid replaces that friction with structured booking, escrow-protected payments, AI matching, and a verified reputation layer for everyone." },
    { q: "Why now?",
      a: "Three forces converge. Live music has rebounded to record demand while the tools running it remain a decade behind. AI is finally good enough to do real matching, profitability forecasting, and booking assistance at scale. And independent artists now drive the majority of cultural discovery, yet they're the least served by existing platforms. Music Habitat is built for this moment — AI-native, artist-first, and starting in a city whose identity *is* live music." },
    { q: "What part of the global music industry are we in (TAM · SAM · SOM)?",
      a: "We operate in live music. The three market layers:\n\n• TAM — $121.5B. Total Addressable Market: the entire global live-music industry.\n\n• SAM — $12.0B. Serviceable Available Market: the North American independent and emerging-artist segment (100–5,000-capacity venues) we're built to serve.\n\n• SOM — $500M. Serviceable Obtainable Market: our realistic 5-year capture across 50K+ artists, 10K+ venues, and 1M+ fans.\n\nFull methodology is in the Financial Model in your Document Center." },
  ],
  Investment: [
    { q: "What is my deal?",
      a: "As a Circle 35 Friends & Family investor you purchase via a SAFE that converts to Class B Preferred shares, priced off a $10,000,000 pre-money valuation. You invest between $500 and $25,000. You also receive 3× warrant coverage at 95% of fair market value, exercisable for nine months — and the Guardian designation as one of only 35 founding investors. Full terms are in the Term Sheet; this summary is not the binding agreement." },
    { q: "What is a SAFE Agreement?",
      a: "A SAFE — Simple Agreement for Future Equity — is an instrument that lets you invest now and receive equity later, when a defined trigger occurs (typically a priced financing round). You're not lending money and you're not buying shares on day one; you're securing the right to shares on agreed terms. For the Circle 35, your SAFE converts into Class B Preferred shares. SAFEs are a widely used early-stage instrument because they're faster and simpler than a full priced round." },
    { q: "What is a Stock Warrant?",
      a: "A warrant is the right — but not the obligation — to buy additional shares in the future at a set price within a set window. It rewards early backers: if the company grows, your warrant lets you buy more equity at a price fixed near today's value rather than the higher future price." },
    { q: "What does the stock warrant cover?",
      a: "Your warrant provides 3× coverage on your purchased shares, exercisable at 95% of fair market value, for nine months from the grant date. In plain terms: for every share you acquire, you have the right to buy up to three more at a 5% discount to FMV during that nine-month window." },
    { q: "What are the classes of stock & the differences in each?",
      a: "Music Habitat has three share classes within 10,000,000 declared shares. Class A (Founder): super-voting at 15 votes per share, held by the founder. Class B (Preferred): one vote per share, the class you receive — and pari passu with Class A on economic entitlements. Class C (Common): no voting rights, reserved for things like an employee pool. As a Circle 35 investor you hold Class B Preferred." },
    { q: "What are my stockholder's rights?",
      a: "As a Class B Preferred holder you receive: information rights (unaudited quarterly financials within 45 days, annual within 90 days); preemptive rights to participate pro-rata in future equity raises so you can protect your ownership; and tag-along, drag-along, and right-of-first-refusal protections governed by the Stockholders' Agreement. You also vote at one vote per share. The Stockholders' and Operating Agreements are the controlling documents." },
    { q: "What does pari passu mean?",
      a: "Pari passu is Latin for \"on equal footing.\" Here it means your Class B Preferred shares rank equally with the founder's Class A shares on economic entitlements — distributions and proceeds are shared proportionally, with neither class taking economic priority over the other. (Class A keeps super-voting control, but not economic priority.)" },
    { q: "What will my investment dollars be spent on?",
      a: "Proceeds are deployed across four departments: AI · Tech R&D (the largest share — building the platform and AI engine), UX/UI · Product Design, Marketing · Launch (the New Orleans go-to-market and Habitat Sessions), and Operations · Legal. The full tiered deployment plan — showing exactly what each raise level from $35K to $250K unlocks — is the Use of Proceeds document in your Document Center." },
    { q: "What is a 506(b) Regulation D offering, in layman's terms?",
      a: "Regulation D, Rule 506(b) is the SEC exemption that lets a private company raise money without registering a public offering — provided it doesn't advertise or publicly solicit, and sells only to people with a pre-existing, substantive relationship to the company (and to a limited number of non-accredited investors). That's exactly why the Circle 35 is invite-only and gated behind a referral: it's a private Friends & Family round, not a public solicitation." },
  ],
};

// Private Offering (Accredited · 506(c)) FAQ — priced Class B, no SAFE/Warrant/Guardian.
export const QA_PRIVATE = {
  Company: [
    { q: "What is Music Habitat?",
      a: "Music Habitat is the company behind StageBid™ — an AI-powered operating system for the live-music industry. It connects independent artists, venues, fans, and private clients on one verified, data-driven platform that handles discovery, booking, ticketing, payments, and reputation. Music Habitat launches in New Orleans and scales across the Gulf South before going national." },
    { q: "What problems are we solving?",
      a: "Live-music booking today runs on cold emails, spreadsheets, and middlemen who take a cut without adding trust. Artists struggle to find the right stage and get paid cleanly; venues waste hours sourcing talent and forecasting profit; fans can't easily discover what's happening near them; and private clients have no trusted way to book verified talent. StageBid replaces that friction with structured booking, escrow-protected payments, AI matching, and a verified reputation layer." },
    { q: "What part of the global music industry are we in (TAM · SAM · SOM)?",
      a: "We operate in live music. TAM — $121.5B, the entire global live-music industry. SAM — $12.0B, the North American independent and emerging-artist segment (100–5,000-capacity venues). SOM — $500M, our realistic 5-year capture across 50K+ artists, 10K+ venues, and 1M+ fans. Full methodology is in the Financial Model in your Document Center." },
  ],
  Investment: [
    { q: "What is my deal in the Private Offering?",
      a: "You purchase Class B Preferred stock directly, at a stated price per share, under Rule 506(c) of Regulation D. The minimum is $2,500. This is a priced equity purchase made through the Stock Purchase & Transfer Agreement — not a SAFE, and with no warrant. Full terms are in the Private Term Sheet; this summary is not the binding agreement." },
    { q: "How is this different from the Circle 35 Friends & Family round?",
      a: "Three core differences. First, the exemption: the Circle 35 is a 506(b) round (invite-only, no advertising), while this is a 506(c) round (general solicitation permitted, but every investor's accredited status must be verified). Second, the instrument: the Circle 35 uses a SAFE that converts to Class B; here you buy priced Class B directly. Third, the extras: the Circle 35 includes a 3× warrant and the Guardian Badge — neither applies to the Private Offering." },
    { q: "What does it mean that I'm buying \"priced\" Class B Preferred?",
      a: "Unlike a SAFE — where the price you effectively pay is determined later, at a future financing — a priced round sets the price per share today. You know exactly how many shares your investment buys at the time you commit. There's no valuation cap, discount, or conversion event to wait for; you're a shareholder of record once the purchase closes and shares are issued." },
    { q: "What is Rule 506(c) and why do you verify my accreditation?",
      a: "Rule 506(c) is the SEC exemption that lets a company publicly solicit an offering — but only if every purchaser is an accredited investor whose status the company has taken reasonable steps to verify. Self-certification alone isn't enough under 506(c), so we confirm accreditation through a third-party letter (CPA, attorney, or broker-dealer), document review, or a verification service before accepting your subscription. It protects both you and the company's exemption." },
    { q: "What counts as an accredited investor?",
      a: "Common ways to qualify: individual income over $200,000 (or $300,000 joint) in each of the last two years with the same expected this year; net worth over $1,000,000 excluding your primary residence; certain entities with over $5,000,000 in assets or whose equity owners are all accredited; or holding a Series 7, 65, or 82 license in good standing. The Investor Questionnaire captures your basis, and we verify it." },
    { q: "What are the classes of stock and their differences?",
      a: "Music Habitat has three share classes within 10,000,000 declared shares. Class A (Founder): super-voting at 15 votes per share, held by the founder. Class B (Preferred): one vote per share — the class you purchase — and pari passu with Class A on economic entitlements. Class C (Common): no voting rights, reserved for things like an employee pool." },
    { q: "What are my stockholder's rights?",
      a: "As a Class B Preferred holder you receive information rights (unaudited quarterly financials within 45 days, annual within 90 days); preemptive rights to participate pro-rata in future raises; and tag-along, drag-along, and right-of-first-refusal protections governed by the Stockholders' Agreement. You vote at one vote per share. The Stockholders' and Operating Agreements are the controlling documents." },
    { q: "What does pari passu mean?",
      a: "Pari passu is Latin for \"on equal footing.\" Your Class B Preferred shares rank equally with the founder's Class A shares on economic entitlements — distributions and proceeds are shared proportionally, with neither class taking economic priority. (Class A keeps super-voting control, but not economic priority.)" },
    { q: "What will my investment dollars be spent on?",
      a: "Proceeds are deployed across four departments: AI · Tech R&D (the largest share), UX/UI · Product Design, Marketing · Launch (the New Orleans go-to-market), and Operations · Legal. The full tiered deployment plan is the Use of Proceeds document in your Document Center." },
  ],
};


// =============================================================================
// PAGE 1 — Portal landing: three offering tiles
// =============================================================================
