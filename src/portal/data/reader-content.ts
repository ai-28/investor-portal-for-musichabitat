export const READER_CONTENT = {
  // ---- Stock Purchase & Transfer Agreement (PRIVATE · 506(c) priced round) ---
  stockpurchase: {
    kicker: "Private Offering · Closing Instrument",
    title: "Stock Purchase & Transfer Agreement",
    intro: "The Private Offering instrument. Accredited investors purchase priced Class B Preferred stock directly under Rule 506(c) of Regulation D — not a SAFE. Summarized for in-portal reading; the executed agreement governs.",
    sections: [
      { h: "Securities Purchased", body: "Class B Preferred stock at a stated price per share, purchased directly from the Company. There is no valuation cap, discount, or conversion mechanic — the price reflects the Company's current stated valuation at the time of purchase." },
      { h: "Key Terms", list: [
        ["Security", "Class B Preferred (priced)"],
        ["Exemption", "Rule 506(c) of Regulation D"],
        ["Accreditation", "Verified by the Company before acceptance"],
        ["Minimum investment", "$2,500"],
        ["Warrant", "None — warrant coverage is a Friends & Family term only"],
        ["Governing agreements", "Operating Agreement and Stockholders' Agreement"],
      ]},
      { h: "506(c) Verification", body: "Because this offering relies on Rule 506(c), the Company must take reasonable steps to verify each investor's accredited status — typically a third-party letter from a CPA, attorney, or registered broker-dealer, or documentary review. Self-certification alone is insufficient. Verification is completed before the Company accepts a subscription." },
      { h: "Transfer Restrictions", body: "The shares are restricted securities with no public market. Resale is limited and subject to the Stockholders' Agreement, applicable securities laws, and Company approval. Investors should be prepared to hold indefinitely." },
      { h: "Process", body: "Review the documents with your advisors, complete the Subscription Agreement and Investor Questionnaire, sign the Stock Purchase & Transfer Agreement and Stockholders' Agreement, complete accreditation verification, and fund by wire or ACH. Class B shares are issued and your certificate delivered upon close." },
    ],
    note: "Summarized for in-portal reading. The executed Stock Purchase & Transfer Agreement and its exhibits are the governing documents. Not legal, tax, or investment advice — consult your own advisors. Contact: brandon@musichabitat.com",
  },

  // ---- Pitch Deck (condensed to portal-readable sections) -------------------
  deck: {
    kicker: "Investor Deck",
    title: "Pitch Deck",
    intro: "The operating system for independent live music. Built for the 300,000+ artists and 10,000+ venues that legacy infrastructure was never designed to serve.",
    sections: [
      { h: "The Mission", body: "To fight the bottlenecks, pain points, inefficiencies, and subjectivity that have defined live-music infrastructure for the independent artist for far too long." },
      { h: "The Problem", list: [
        ["Booking is broken.", "Independent venues and emerging artists negotiate through email threads, phone calls, and personal favors — no transparency, no data, no compatibility matching."],
        ["Ticketing is fragmented.", "An artist touring 20 venues encounters 20 ticketing platforms, different credentials at each stop, no single place to track sales, settlement, or revenue splits."],
        ["Fan economics are extractive.", "Streaming royalties don't pay rent. Artists need direct fan relationships, recurring revenue, and ownership stakes — none of which today's dominant platforms support."],
      ]},
      { h: "The Solution — Five Services", list: [
        ["StageBid™", "Bid-based booking marketplace. Venues post budgets, artists bid, AI surfaces the highest-probability pairings."],
        ["Book Private", "The monster.com for the arts — public marketplace connecting artists to private clients and premium engagements."],
        ["Live Pulse™", "Real-time 'tonight in [city]' discovery engine for fans and venues."],
        ["Go Live", "Built-in livestreaming with integrated tipping, premium tiers, and exclusive content windows."],
        ["Digital EPK + Venue Cards", "Standardized press kits, compatibility matching, and a secure ticketing credential vault."],
      ]},
      { h: "Market Opportunity", list: [
        ["TAM · $121.5B", "Global live music industry, projected to exceed $150B by 2030."],
        ["SAM · $12.0B", "North American independent segment, 100–5,000 capacity venues."],
        ["SOM · $500M", "5-year revenue target across 50K+ artists, 10K+ venues, 1M+ fans."],
      ]},
      { h: "Go-to-Market", body: "New Orleans first — a city defined by live-music density and year-round touring. 90-day venue beta → ambassador-led bottom-up artist growth → regional (Nashville, Austin, Atlanta) → national." },
    ],
    // NOTE: financial-trajectory slide intentionally omitted here to avoid
    // duplicating numbers that must come from the canonical Financial Model.
    note: "Condensed for in-portal reading. Full deck available on request; financial detail lives in the Financial Model.",
  },

  // ---- Services -------------------------------------------------------------
  services: {
    kicker: "What We Build",
    title: "Services",
    intro: "Five services, one operating system — designed bottom-up for the segment legacy systems were never built to serve.",
    sections: [
      { h: "StageBid™ — Booking Marketplace", body: "Bid-based venue–artist matching. Venues post budgets, artists bid, and AI-powered compatibility matching surfaces the highest-probability pairings across booking rates, riders, and payment terms." },
      { h: "Book Private — Public Gig Marketplace", body: "The monster.com for the arts. Connects independent artists with private clients, corporate events, weddings, and brand activations — the largest untapped revenue stream in independent music." },
      { h: "Live Pulse™ — Real-Time Discovery", body: "A geo-targeted 'tonight in [city]' engine surfacing live music, nearby events, and culture-adjacent venues by proximity — the discovery layer of the platform." },
      { h: "Go Live — Livestreaming + Fan Economy", body: "Built-in livestream broadcasting with integrated tipping, premium access tiers, and exclusive digital content windows for artists to monetize their fanbase directly." },
      { h: "Digital EPK + Venue Cards — Artist Infrastructure", body: "Standardized digital electronic press kits, Venue Card compatibility matching across booking/merch/technical specs, and a secure credential vault for up to ten major ticketing platforms." },
    ],
    note: "* Book Private and Live Pulse carry large-scale potential beyond core platform operations.",
  },

  // ---- Leadership Team (full 11-person roster; photo avatars via Avatar) -----
  team: {
    kicker: "The People at the Table",
    title: "Leadership Team",
    intro: "Executive operators plus board members and advisors.",
    roster: [
      ["Brandon Beard", "Founder · Chairman · CEO", "brandon.jpg"],
      ["Bruce White", "Chief Technology Officer", "bruce.jpg"],
      ["Jessica Kaun", "Chief Vibe Officer", "jessica.jpg"],
      ["Michael Garvin", "Chief Artistry Officer", "garvin.jpg"],
      ["Kim Russell", "Director of Market Development", "kim.jpg"],
      ["Rafid Fau", "UX/UI Design Lead", "rafid.jpg"],
      ["Sess45", "Artist Relations & Cultural Partnerships", "sess45.jpg"],
      ["Michael Matthews", "Board Member", "michael.jpg"],
      ["Ben Herrera", "Board Member", "ben.jpg"],
      ["Brian Smith", "Strategic Advisor & Board Member", "brian.jpg"],
      ["Shelly Clark", "Strategic Advisor", "shelly.jpg"],
    ],
    note: "The full Music Habitat roster — executives, board, and advisors.",
  },

  // ---- Business Plan --------------------------------------------------------
  // CANONICAL per founder: Business Plan figures govern ($2.0M Y1 / 250 venues /
  // $600K net / 3-year curve to $35M). TAM presented as $121.5B (Exec Summary)
  // where shown standalone; the Plan's own market section retains its $35B US
  // framing intentionally.
  bizplan: {
    kicker: "Business Plan",
    title: "Business Plan",
    intro: "StageBid™ — the AI-powered operating system for the live music industry. Headquartered in Kalispell, Montana with Louisiana roots; launching in New Orleans, September 2026.",
    sections: [
      { h: "The Mission", body: "To give independent artists the infrastructure, tools, and education they have always deserved — and to return 90 cents of every dollar generated back to the artists who earn it. Not as a business strategy. As a value system." },
      { h: "The Problem — Independent Music Is Broken", list: [
        ["The Artist Problem", "Independent artists have no professional infrastructure — booking through cold DMs, payments through handshakes, contracts they were never taught to read."],
        ["The Venue Problem", "Venues have no direct line to their own patrons. The fan relationship belongs to Meta and Google, not the venue."],
        ["The Fan Problem", "Fans can't discover what's happening in their own cities. Discovery dies at the city limits."],
        ["The Education Gap", "Nobody teaches artists the business of music. The industry profits from artists who don't know what they don't know."],
      ]},
      { h: "The Solution — One Platform", body: "StageBid™ is the AI-powered operating system that replaces every fragmented tool independent artists and venues use today: booking, ticketing, payments, fan engagement, education, and — the key differentiator — a direct Patron Communication Suite that gives venues ownership of their own fan relationship." },
      { h: "Four User Groups, One Ecosystem", list: [
        ["Artists · 12 services", "Venue bidding marketplace, Digital EPK, AI matching, master calendar, wallet, Book Private, Go Live, Ticketing API Routing™, merch, reviews."],
        ["Venues · 9 services", "Venue Card™, artist discovery, booking management, profitability dashboard, AI venue assistant, and the Patron Communication Suite differentiator."],
        ["Fans · 7 services", "Live discovery, ticket wallet, Go Live access, artist support/tipping, VIP access, fan badges, community trust."],
        ["Public Marketplace", "The monster.com for the arts — anyone can book verified local artists for weddings, corporate events, and private occasions."],
      ]},
      { h: "Pricing — Simple Tiers, One Take Rate", list: [
        ["Venue Subscription", "$200 / month — full platform, including the Patron Communication Suite."],
        ["Artist Tiers", "Free · $4.99 · $9.99 · $19.99 / month."],
        ["Fan Access", "Free — discovery, ticket wallet, following, VIP upgrades."],
        ["Platform Take Rate", "10% on all transactions: bookings, tickets, private gigs, merch, Go Live, ad network."],
      ]},
      { h: "Go-to-Market — The Habitat Sessions", body: "A live weekly show premiering May 7, 2026 (StreamYard, YouTube, Facebook Live) that builds community, venue relationships, and artist partnerships for four months before the platform opens in New Orleans, September 2026." },
      { h: "Competitive Moats", body: "No existing platform connects all four sides. Moats include the Patron Communication Suite (venues never leave after two years of patron data), a 50,000+ venue national listing database (no cold-start problem), proprietary Ticketing API Routing™, compounding data network effects, The Habitat Sessions media arm, freemium artist supply, and the 90% artist-commitment value statement.",
    },
    ],
    // Financial table rendered via the `financials` block below the sections.
    financials: {
      heading: "3-Year Financial Projection",
      cols: ["", "Year 1", "Year 2", "Year 3"],
      rows: [
        ["Gross Revenue", "$2.0M", "$12.0M", "$35.0M"],
        ["Total Expenses", "($1.4M)", "($7.3M)", "($15.6M)"],
        ["Net Income", "$600K", "$4.7M", "$19.5M"],
        ["Venues", "250", "1,500", "4,500"],
        ["Artists", "20K", "75K", "200K"],
        ["Active Fans", "35K", "150K", "500K"],
      ],
    },
    ask: {
      heading: "The Ask — $250K Seed Round",
      items: [
        ["R&D · Platform + AI", "$75,000", "30%"],
        ["Launch · New Orleans", "$75,000", "30%"],
        ["Operations", "$100,000", "40%"],
      ],
    },
    note: "Confidential. Year 1 anchored entirely in the New Orleans launch market. Market framed as $35B US live music within the Plan; global TAM of $121.5B presented in the Executive Summary.",
  },

  // ---- Financial Model (built from the CANONICAL Business-Plan table) -------
  // Founder directive: Business Plan governs. This reader presents the Business
  // Plan's 3-year build, NOT the separate "Canonical Financial Model" PDF
  // (which shows a conflicting $1.1M/150 five-year curve and should be
  // re-titled, updated, or withheld before distribution — see chat note).
  model: {
    kicker: "Financial Model",
    title: "Financial Model",
    intro: "Lean to launch, built to scale. Year 1 is anchored entirely in New Orleans — 250 venues, 20,000 artists, 35,000 active fans — $2.0M gross and $600K net on disciplined operations, scaling 6× in Year 2 and to national scale in Year 3.",
    sections: [
      { h: "Year 1 Revenue — Eight Streams", list: [
        ["Venue Subscriptions ($200/mo)", "$600,000"],
        ["Artist Subscriptions (blended)", "$300,000"],
        ["Ticketing · 10% take", "$300,000"],
        ["Venue Bookings · 10% take", "$300,000"],
        ["Public Marketplace · 10% take", "$280,000"],
        ["Merchandise · 10% take", "$60,000"],
        ["Go Live / Livestream · 10%", "$80,000"],
        ["Ad Network (CPM + flat)", "$80,000"],
      ]},
    ],
    financials: {
      heading: "3-Year Projection",
      cols: ["", "Year 1", "Year 2", "Year 3"],
      rows: [
        ["Gross Revenue", "$2.0M", "$12.0M", "$35.0M"],
        ["Total Expenses", "($1.4M)", "($7.3M)", "($15.6M)"],
        ["Net Income", "$600K", "$4.7M", "$19.5M"],
        ["Headcount", "10", "22", "50"],
      ],
    },
    note: "Confidential. Gross-revenue model with expense assumptions producing $600K net in Year 1. Figures reconciled to the Business Plan per founder directive.",
  },

  // ---- Use of Proceeds ($250K seed; canonical = Business Plan allocation) ----
  proceeds: {
    kicker: "Use of Proceeds",
    title: "Use of Proceeds",
    intro: "$250,000 seed round to complete platform development, execute the New Orleans launch, and fund 12 months of operations to proven traction before a Series A raise.",
    sections: [],
    ask: {
      heading: "$250K Allocation",
      items: [
        ["R&D · Platform + AI", "$75,000", "30%"],
        ["Launch · New Orleans", "$75,000", "30%"],
        ["Operations", "$100,000", "40%"],
      ],
    },
    note: "Confidential. Allocation per the Business Plan. (Note: the F&F Executive Summary shows an alternative 30/30/25/10/5 split — reconcile before distribution.)",
  },


  // ===========================================================================
  // CLOSING DOCUMENTS — rendered faithfully from the executed instruments.
  // Aggregate Circle 35 round target = $250,000 across all documents (founder-confirmed).
  // Full instrument text is reproduced verbatim. The aggregate round target of
  // $250,000 is stated consistently across all instruments.
  // Instrument structure: BOTH a SAFE track and a priced track exist under one
  // 506(b) umbrella (founder-confirmed); split details pending for Page 10.
  // ===========================================================================

  // ---- Offering Package (master overview) -----------------------------------
  offering: {
    kicker: "F&F Round · Master Overview",
    title: "Offering Package",
    intro: "The Circle 35 — Music Habitat's Friends & Family round. A first-look invitation for those closest to the founder, on terms aligned with the founder's own.",
    sections: [
      { h: "Letter from the Founder", body: "Before there's a Series A, before there's a venue map, before there's a public launch in New Orleans — there's this. A small round, reserved for the people who knew about Music Habitat before there was a Music Habitat. The terms are designed so that if the founder does well, you do well — in economic lockstep: same dilution, same exit math, same pari passu rights. It is also speculative: no public market, no guaranteed exit, and a real chance of total loss. Invest only what you can lose without changing your year." },
      { h: "The Opportunity", body: "Music Habitat is the parent company behind a connected family of live-music products: StageBid™ (bid-based booking marketplace), the StageBid Ticketing API Rolodex, Go Live (livestreaming), Fan Layer, and the digital EPK / Venue Card / Musician profile architecture. Pre-launch, with New Orleans go-live targeted for 2026 and a Series A target of H1 2027." },
      { h: "Terms of the Offering", list: [
        ["Security", "SAFE converting into Class B Preferred upon a Qualified Financing (≥ $500,000), and a direct priced Class B track."],
        ["Valuation Cap", "$10,000,000 pre-money · 10,000,000 declared shares · $1.00 per share at the cap."],
        ["Discount", "5% (convert at 95% of the next round's per-share price)."],
        ["Investment Limits", "$500 minimum · $25,000 maximum per investor."],
        ["Warrant Coverage", "3× the SAFE conversion shares at 95% of FMV, exercisable within 9 months of grant."],
        ["Class B Rights", "Pari passu with Class A on all economic events; 1:1 voting (vs. Class A 15:1); tag-along, drag-along, ROFR, preemptive, and information rights."],
      ]},
      { h: "The Circle 35 — Recognition Only", list: [
        ["Tier 1 · Inner Circle ($500–$2,500)", "Founder thank-you, named acknowledgment, exclusive Circle 35 badge artwork."],
        ["Tier 2 · Charter Backers ($2,500–$10,000)", "All Tier 1 + annual Charter Backer event invite + early product access."],
        ["Tier 3 · First Believers ($10,000–$25,000)", "All Tier 2 + non-binding Investor Advisory Committee seat + founder Q&A + custom plaque."],
      ]},
      { h: "Risk Factors", body: "Investment is speculative and involves a high degree of risk; you should not invest unless you can afford to lose the entire amount. Risks include startup failure, no public market/illiquidity, 100% dilution of Class B, conversion contingency (SAFE converts only on a ≥ $500K financing that may never occur), warrant expiration at 9 months, Class A 15:1 founder control, regulatory exposure (ticketing antitrust attention), and competition from better-resourced platforms. Projections are forward-looking and may differ materially." },
      { h: "Eligibility & Subscription", body: "Offered under Rule 506(b) of Regulation D — no general solicitation, personal-relationship basis only. Accredited investors may subscribe directly; a limited number of sophisticated non-accredited investors with a pre-existing relationship may participate. Process: review the package and execution docs, complete the Subscription Agreement and Investor Questionnaire, deliver via the investor portal, fund by ACH/wire/certified check, and receive the executed SAFE and Warrant upon acceptance. The Company may reject any subscription at its discretion." },
    ],
    note: "CONFIDENTIAL & PROPRIETARY — NOT FOR DISTRIBUTION. Aggregate round target $250,000; governing law Montana, AAA arbitration in Montana or Louisiana.",
  },

  // ---- SAFE Agreement -------------------------------------------------------
  safe: {
    kicker: "Financing Instrument",
    title: "SAFE Agreement",
    intro: "Simple Agreement for Future Equity — the Circle 35 round. Capped at $10,000,000 pre-money; convertible into Class B Preferred Shares, in lockstep with the founder.",
    sections: [
      { h: "Key Terms", list: [
        ["SAFE Amount", "$500 minimum · $25,000 maximum per investor."],
        ["Valuation Cap", "$10,000,000 pre-money (10,000,000 shares declared → $1.00/share at the cap)."],
        ["Discount", "5% — convert at 95% of the Qualified Financing price."],
        ["Conversion Price", "The lower of the Discount Price or the Valuation Cap Price."],
        ["No Interest / No Maturity", "The SAFE bears no interest and does not expire by date; repayment only per the change-of-control and dissolution provisions."],
      ]},
      { h: "Conversion Mechanics", body: "On the close of a Qualified Financing (≥ $500,000 in new equity, excluding F&F SAFEs), the SAFE automatically converts into Class B Preferred equal to the SAFE Amount divided by the Conversion Price; shares issue within 10 business days. Example: $5,000 in, 10M shares at $1.00, next round at $1.50 → cap price $1.00 governs → 5,000 Class B shares." },
      { h: "Change of Control / Dissolution (pre-conversion)", body: "On a change of control before conversion, the investor elects within 10 business days either a cash payment equal to the SAFE Amount or Class B shares at the cap price (defaulting to cash). On a dissolution, the investor receives the SAFE Amount senior to common but subordinate to creditors, pro-rata if assets are insufficient." },
      { h: "Class B Share Rights (on conversion)", list: [
        ["Voting", "1:1 per share, voting with Class A as a single class."],
        ["Economics", "Pari passu with Class A — economic lockstep with the founder."],
        ["Information Rights", "Quarterly financials within 45 days; annual within 90 days."],
        ["Preemptive / Tag-Along / Drag-Along", "Pro-rata preemptive rights; tag-along on Class A sales; drag-along on board-approved change of control."],
        ["Dilution", "100% dilutable in future financings, option pools, and warrant exercises."],
        ["Recognition", "Circle 35 Badge and perks — non-economic recognition only."],
      ]},
      { h: "Most-Favored-Nation", body: "If the Company issues a more favorable F&F/seed SAFE before conversion, it notifies the investor within 5 business days; the investor has 15 days to elect the better terms. MFN does not apply to Qualified Financing investors." },
      { h: "The Warrant (granted separately)", body: "Simultaneously, the Company issues a Warrant to purchase up to 3× the conversion shares at 95% of FMV, exercisable within 9 months of grant. Important: the Warrant can expire before a Qualified Financing closes — if so, it expires before conversion occurs." },
    ],
    note: "CONFIDENTIAL. Governing law Montana; AAA binding arbitration in Montana or Louisiana; jury-trial and court-access waiver. No stockholder rights prior to conversion. Executed via DocuSign / Adobe Sign.",
  },

  // ---- Warrant Agreement ----------------------------------------------------
  warrant: {
    kicker: "Financing Instrument",
    title: "Warrant Agreement",
    intro: "The Circle 35 Warrant — three times the position, on the founder's timeline. Exercisable into Class B Preferred at 95% of Fair Market Value within nine months.",
    sections: [
      { h: "Grant & Coverage", list: [
        ["Coverage", "Up to 3× the Purchased Share Equivalent (the Class B shares issuable on SAFE conversion)."],
        ["Class", "Exercisable solely into Class B Preferred — never into Class A founder/super-voting shares."],
        ["Independence", "A separate contractual security, independent of the SAFE."],
      ]},
      { h: "Exercise Price", body: "95% of Fair Market Value of the Class B shares on the exercise date. FMV is determined in good faith by the Board using commercially reasonable methods; the Company's determination is conclusive absent manifest error." },
      { h: "Exercise", body: "Exercisable in whole or in part any time before expiration, by written notice plus payment (or a cashless exercise election). The Company issues shares within 15 business days of valid exercise." },
      { h: "Expiration — Nine Months", body: "Expires automatically at 5:00 p.m. Mountain Time nine months after the Grant Date. Time is of the essence; no obligation to extend, renew, or reissue. The Warrant may expire before a Qualified Financing or SAFE conversion — the holder expressly assumes that timing risk." },
      { h: "Adjustments & Transfer", body: "Shares adjust proportionately for splits, recapitalizations, and similar events to preserve economic value. The Warrant is non-transferable without Company consent, except permitted transfers to trusts, estate vehicles, or immediate family." },
      { h: "Limitation of Rights", body: "Confers no board, management, or voting rights unless and until Warrant Shares are issued." },
    ],
    note: "CONFIDENTIAL. Governing law Montana; AAA binding arbitration in Montana or Louisiana; jury-trial and court-access waiver. Holder acknowledges the Warrant may expire unexercised and become worthless.",
  },

  // ---- Subscription Agreement + Investor Questionnaire ----------------------
  subscription: {
    kicker: "Financing Instrument",
    title: "Subscription Agreement & Questionnaire",
    intro: "Friends & Family subscription with Investor Questionnaire, conducted under Rule 506(b) of Regulation D. Your subscription, the Company's acceptance.",
    sections: [
      { h: "The Subscription", body: "The Subscriber irrevocably subscribes for a SAFE in the Subscription Amount, converting into Class B Preferred per the SAFE. Payment by ACH, wire, or certified check via the investor portal; the Company is not obligated to accept until funds clear. The Company may accept or reject any subscription." },
      { h: "Subscriber Representations", list: [
        ["Investment Intent", "Acquiring for own account, not for resale or distribution."],
        ["Risk of Loss", "Able to bear complete loss of the Subscription Amount."],
        ["Illiquidity", "No public market; the investment may be illiquid indefinitely."],
        ["Review & Advice", "Has read and understood all offering documents and risk factors, and had the chance to consult independent legal, financial, and tax advisors."],
        ["Accuracy", "All Investor Questionnaire information is true and complete."],
      ]},
      { h: "Transfer Restrictions & Indemnification", body: "The SAFE and underlying shares are unregistered; transfer requires registration or an exemption, and a restrictive legend applies. The Subscriber indemnifies the Company and its directors, officers, and agents against loss arising from any breach of the Subscriber's representations." },
      { h: "Investor Questionnaire", list: [
        ["Part A · Subscriber Information", "Legal name, DOB, address, contact, subscription amount, relationship to founders."],
        ["Part B · Accredited Status", "Net worth > $1M (ex-residence); income > $200K (or $300K joint); $5M-asset entity; or explicit NOT-accredited election."],
        ["Part C · Risk Acknowledgments", "Speculative/illiquid/total-loss; no interest or maturity; conversion needs a ≥ $500K financing that may never occur; warrant expires at 9 months; arbitration consent."],
        ["Part D · Certification", "Subscriber certifies all information is true, accurate, and complete."],
      ]},
    ],
    note: "CONFIDENTIAL. Governing law Montana; AAA binding arbitration in Montana or Louisiana; jury-trial and court-access waiver. Offering closes upon acceptance of at least the round minimum.",
  },

  // ---- Stockholders' Agreement ----------------------------------------------
  stockholders: {
    kicker: "Governance Instrument",
    title: "Stockholders' Agreement",
    intro: "Governs voting, transfer, ROFR, tag-along, drag-along, and information rights for all shareholders of record. Reference cap $10M / 10M shares / $1.00.",
    sections: [
      { h: "Voting Agreement", body: "Shareholders vote to constitute the Board per the Operating Agreement, and — so long as Brandon Beard holds Class A — to elect him as a director. Protective provisions require shareholders to vote against amendments that would impair Class B rights, create senior shares, or break Class B/Class A pari passu economics." },
      { h: "Transfer Restrictions", list: [
        ["General", "No transfer except in compliance with the agreement; violating transfers are void."],
        ["ROFR — Company", "On any proposed transfer, the Company has 15 days to buy all offered shares."],
        ["ROFR — Stockholders", "If the Company declines, other stockholders get 15 more days to buy pro-rata."],
        ["Tag-Along", "If a Class A holder sells and ROFR isn't exercised, Class B may include shares pro-rata on the same terms."],
        ["Drag-Along", "On a majority-approved change of control, all stockholders must vote in favor and tender on the same terms."],
        ["Permitted Transfers", "Revocable-trust, will/intestate, board-approved Class B transfers, and qualified-financing/approved-change-of-control transfers are exempt."],
      ]},
      { h: "Information & Co-Sale Rights", body: "Class B holders receive annual audited financials if available plus unaudited quarterly reports, may designate one non-voting Board observer on 30 days' notice, and get prompt notice of material events. A co-sale right lets Class B participate pro-rata in certain change-of-control sales on 20 days' notice." },
      { h: "Joinder & Termination", body: "Any new share recipient (including on SAFE conversion or warrant exercise) must execute a Joinder. The agreement terminates on an underwritten IPO, a change of control acquiring all shares, dissolution, or unanimous written agreement." },
    ],
    note: "CONFIDENTIAL & PROPRIETARY — NOT FOR DISTRIBUTION. Governing law Montana; AAA binding arbitration in Montana or Louisiana; jury-trial and court-access waiver. Amendments need Class A consent plus a Class B majority.",
  },

  // ---- Operating Agreement --------------------------------------------------
  operating: {
    kicker: "Governance Instrument",
    title: "Operating Agreement",
    intro: "The internal governance document of Music Habitat, Inc., a Montana corporation under the Montana Business Corporation Act. Governs shareholders, directors, and officers.",
    sections: [
      { h: "Formation & Purpose", body: "A Montana corporation with perpetual existence and a Dec 31 fiscal year. Trade names include StageBid™ and the StageBid Ticketing API Rolodex. Purpose: develop, operate, and monetize an AI-powered live-music SaaS ecosystem connecting fans, independent artists, and venues." },
      { h: "Three-Class Capital Structure", list: [
        ["Class A — Founders", "Brandon Beard only · 15 votes/share · non-transferable except by succession/unanimous consent · auto-converts to Class B on change of control."],
        ["Class B — Preferred", "F&F / preferred investors · 1 vote/share · pari passu with Class A economics · preemptive, tag-along, drag-along rights · 100% dilutable."],
        ["Class C — Common", "Employees / option pool · no vote · subordinate economics · the employee-equity vehicle."],
      ]},
      { h: "Pari Passu / Economic Lockstep", body: "Class B remains pari passu with Class A on all economic entitlements — dividends, liquidation, change-of-control proceeds, and preemptive rights — participating proportionally, on the same terms and at the same time, without preference or subordination between the two classes. This can't be modified without a Class B majority's written consent." },
      { h: "Board & Officers", body: "Initially one director (Brandon Beard). Directors are elected by Class A + Class B voting together; Brandon Beard can't be removed while any Class A is outstanding without his consent. Committees may include an Investor Advisory Committee with one non-binding Tier 3 Circle 35 seat. The CEO has general authority to run the business subject to Board direction." },
      { h: "Protective Provisions", body: "Class B-majority consent is required to modify the pari passu obligation, adversely change Class B rights, issue Class A to anyone but Brandon Beard, or approve a change of control giving Class B materially different per-share consideration. Founder provisions protect Brandon Beard's board seat, CEO role (removable only for Cause), and compensation floor while he holds Class A." },
      { h: "Financial Matters & Dissolution", body: "The Company keeps books, a cap table maintained on the Company cap-table platform, and segregated bank accounts. Distributions to Class A and Class B are pro-rata and pari passu; Class C is subordinate. On dissolution, assets pay creditors first, then Class A and Class B pari passu, then Class C." },
    ],
    note: "CONFIDENTIAL & PROPRIETARY — NOT FOR DISTRIBUTION. Cap table maintained on the Company cap-table platform. F&F investors hold warrants for up to 3× their SAFE conversion shares at 95% FMV within 9 months. Electronic signatures (DocuSign / Adobe Sign) are binding.",
  },
};

// All reader docs now have content. Stub map retained (empty) for any future id.
