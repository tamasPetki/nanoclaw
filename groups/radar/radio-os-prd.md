---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
status: complete
completedAt: 2026-04-27
visionWorkingSet:
  externalTagline: 'The first member economy built for live radio.'
  edits:
    - id: 1
      title: 'Syndicast as channel-cost advantage + (g) multi-sided switching costs'
      origin: first-principles
    - id: 2
      title: 'Silent-majority economics as load-bearing hypothesis (not differentiator); twin-case planning'
      origin: first-principles + pre-mortem
    - id: 3
      title: 'Time-compounding defensibility — four (now five) replication-resistant layers'
      origin: red-team
    - id: 4
      title: 'Load-bearing thing = host-direct adoption > producer-mode within deployment; instrumented, not contractual'
      origin: pre-mortem + round table
    - id: 5
      title: 'Brief-confidentiality flag (PRD/brief is leakable IP)'
      origin: red-team
    - id: 6
      title: 'Host-portability mechanism — 4-side spec (listener tenure-aware opt-in / host 12mo founding contract / station retains base graph + CRM / GDPR-compliant multi-tenant identity)'
      origin: round table
    - id: 7
      title: 'Premium-priority code-enforced teeth (paying ≠ guaranteed read) — premium-attributable reads cap, host override, editorial-integrity monitoring'
      origin: round table
    - id: 8
      title: 'Twin-track ARR planning — bull case 2% / conservative case 0.8%; both must pencil'
      origin: shark tank
    - id: 9
      title: 'Rev-share floor (e.g., 5%) + walk-criterion; concessions sunsetted with explicit ratchet'
      origin: shark tank
    - id: 10
      title: 'Listener-side positive pull — tier-locked benefits, station-portfolio identity, testimony archive, founding-200 credit'
      origin: shark tank
    - id: 11
      title: 'Tri-narrative vision framing — host-first product / station-first commercial / industry-press B2B brand'
      origin: tree of thoughts
    - id: 12
      title: 'White-label-by-design as load-bearing strategic primitive (h); structurally moats vs. consumer-brand competitors'
      origin: user direct input
    - id: 13
      title: 'Brand-leakage discipline — Radio OS name never reaches a listener; P0 bug class'
      origin: user direct input
  carriedCommitments:
    - section: 'step-08 scoping'
      items:
        - 'What stays with station on host migration (Sandra/round table β)'
        - 'Triton bundling defense — ad-revenue lift via CRM module framing (Jonas/shark tank)'
        - 'Multi-tenant identity namespace v0.1 cut + bridged cross-station portability'
        - 'Unbranded parent app + station-themed in-app spaces'
    - section: 'step-09 functional'
      items:
        - 'Multi-tenant theming engine as P0 architecture'
        - 'Per-station configuration as product surface (theming, copy, module-renaming, format-pack composition)'
    - section: 'step-10 nonfunctional'
      items:
        - 'Multi-tenant identity architecture for host migration (GDPR-compliant; no cross-tenancy leakage)'
        - 'Per-station custom domains + SSL automation'
        - 'PWA capability matrix (push, install, audio session, offline, performance budget)'
        - 'Compliance NFRs — GDPR Reg 2025/2518, PSD2/PSD3, Apple 4.2.6, EU AI Act, rights-by-design music-licensing boundary, cross-border VAT/FX'
    - section: 'step-11 polish'
      items:
        - 'Brand-leakage discipline as P0 bug class (governance)'
    - section: 'step-12 completion'
      items:
        - 'Year-5 expansion thesis — talk-podcast networks, sports-talk franchises, college/community broadcasters (David/shark tank); optional appendix'
        - 'Tri-narrative success criteria — each narrative gets its own load-bearing thing'
classification:
  projectType: saas_b2b
  domain: media-broadcasting
  domainNote: 'Custom domain — not in BMM standard taxonomy. Payments/compliance handled as NFRs, not as fintech domain reframing.'
  complexity: high
  projectContext: greenfield
  listenerMobileUX: 'P0 first-class concern. Delivery via PWA in v0.1 (Apple 4.2.6 forces white-label off native); quality bar must be native-mobile-class. Native apps deferred to year 2.'
  carriedComplianceConcerns:
    - 'GDPR + EU Reg 2025/2518'
    - 'PSD2/PSD3 + KYC + age-verification'
    - 'EU AI Act + GDPR convergence (AI-driven CRM segmentation)'
    - 'Apple 4.2.6 white-label policy'
    - 'Rights-by-design music-licensing boundary (premium = rights-free talk only; no music replay)'
    - 'Cross-border VAT and FX (MENA expansion)'
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-radioos.md
  - _bmad-output/planning-artifacts/product-brief-radioos-distillate.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/brainstorming/brainstorming-session-2026-04-07-0900.md
  - _bmad-output/brainstorming/diagrams.md
  - _bmad-output/brainstorming/miro-import-design-principles.csv
  - _bmad-output/brainstorming/miro-import-ideas.csv
  - _bmad-output/brainstorming/miro-import-modules.csv
documentCounts:
  briefs: 2
  research: 0
  brainstorming: 5
  projectDocs: 0
  ux: 1
workflowType: 'prd'
projectType: 'greenfield'
project_name: 'radioos'
---

# Product Requirements Document - radioos

**Author:** Laszlo
**Date:** 2026-04-26

## Executive Summary

### Vision

Radio OS is a multi-tenant, white-label SaaS that lets radio stations and individual shows convert live, synchronized parasocial attention into direct listener-funded revenue — community economics for live audio, with the host as community lead, the station as buyer, and the listener as long-tenure member. External tagline: **"The first member economy built for live radio"** (member economy — recurring memberships + gifting + tipping + community + commerce, where listeners directly fund creators they value, as opposed to ad-supported audiences).

Listeners never see the Radio OS name. Every listener-facing surface — domain, logo, typography, color, copy, module names, payment branding, member identity — is the station's. Radio OS exists as a brand only in B2B contexts: procurement, contracts, press, partners, prospective stations. This is the structural position consumer-brand competitors (Patreon, Spotify) cannot replicate without abandoning the brand asset that funds their business model.

**Why now.** The 24-month window is open: broadcast ad revenue declining, EU compliance bar (GDPR Reg 2025/2518, PSD2/PSD3, EU AI Act) raising table-stakes, Syndicast distribution available, well-funded competitor's full-replication clock starting on PRD leak.

The product speaks three deliberate narratives to three audiences without letting the wrong frame reach the wrong room:

- **Host-first product narrative** — built around the **bottom-up + top-down dual loop** (host falls in love with the platform → host pulls GM into the contract), with host-direct mode as the destination — "remember 500 regulars instead of 15"
- **Station-first commercial narrative** — CPM-to-ARPU re-rating, modular SaaS + rev-share envelope, contract-grade compliance
- **Industry/press B2B brand narrative** — voice leads with listener experience; audience is industry press, partners, investors, prospective stations; never end-listeners

### Design Principles

11 principles govern every product decision. Derived from inverting common failure modes in radio + adjacent creator-economy platforms; deviating requires explicit justification. The first 10 are the brainstorming-derived product manifesto; the 11th is the substrate's primary value proposition.

1. **Audio-first / app-optional** — Most listening is hands-busy (cars, work, gym). The host's voice is the participation surface; the screen is the input. PWA is the visual layer; broadcast is the primary surface.
2. **On-air conversion** — The show IS the marketing funnel. Every premium interaction the host performs is a live conversion ad heard by every listener. "Premium member Lisa just requested this song" — every free listener realizes THEY could be Lisa.
3. **Identity-as-moderation** — Persistent identity, streaks, reputation, and status tiers replace traditional moderation. New members get limited actions; AI pre-filters; host sees only a clean ranked queue.
4. **Host editorial sovereignty** — Hosts retain creative and editorial control of their show on air. The platform never overrides host judgment. Contractually enshrined; system enforcement supports rather than constrains.
5. **Adult-voice tone** — Status framing (Gold Member, Founding Member, Your Contribution) rather than gamification (XP, Level Up, Battle Pass). Airlines, not Fortnite. Target tone is 42-year-old commuters, not teenagers.
6. **Rights-by-design** — Premium archive is rights-free talk content (aftershows, member stories, debates). Music replay is permanently out of substrate scope. Audio fingerprinting enforces the boundary at persistence time.
7. **Silent-majority economics** — ~70% of listeners will never type. Streaks and seasonal progress accrue passively. Premium converts at 2x for active members but the bulk of paid users come from the quiet.
8. **Premium-as-priority-not-guarantee** — Paying never buys a guaranteed read; it buys a higher chance and priority. Hosts retain the right to skip. Substrate-enforced via per-show premium-priority sub-policies.
9. **Between-show community continuity** — The valley between shows must not go to zero. Small groups, agenda-setting for tomorrow, community news, lore prevent the ghost-town-app pattern.
10. **Bottom-up + top-down dual loop** — The host falls in love first ("remember 500 regulars, not 15") and pulls the GM in. The GM signs the contract; the host is the true customer. Both loops must fire for deployment to mature.
11. **Configurability over opinion** — Radio OS substrate provides configurable mechanisms; stations and shows decide policy. Where the PRD surfaces a default, the default is a starting point, not a constraint. Per-station/per-show configurability is the substrate's primary product surface. **All configurability is substrate-level from v0.1** (data model, API parameterization, defaults, validation envelopes, audit trail). Admin UI surfaces ship incrementally based on demand — but the substrate is policy-aware on day one to avoid retrofit migration costs that would break tenant trust and SLA.

### Non-configurable invariants

The "configurability over opinion" principle is bounded — these substrate invariants are non-negotiable and cannot be configured away by stations:

- **Brand-leakage zero P0** — Radio OS name never reaches a listener. Substrate-enforced. No station opt-out.
- **Premium-as-priority-not-guarantee** — paying never guarantees a read. Substrate-enforced even if a station tries to set 100% premium-read cap; envelope hard-stops at the configured maximum.
- **Rights-by-design** — no music replay in premium archive. Substrate-enforced via audio fingerprinting (Tier 4). No station override.
- **Cross-tenancy isolation** — zero data leakage as P0 invariant. Substrate-enforced. No station can disable.
- **Founding-cohort price-lock** — once committed, substrate-enforced. PD cannot override prior cohort commitments. Configurability applies to *future* cohorts, not retroactively.
- **MFA admin baseline** — non-negotiable for GM and IT Lead admin tier; PD/Producer optional per station, but GM and IT Lead always enforced.
- **Adult-voice opinionated default** — the platform's tone is opinionated (status framing, not gamification language). Stations may override copy strings but the brief warns this is an editorial-quality decision Radio OS resists.

These invariants protect substrate quality from station-level erosion. Configurability is bounded by them.

### Target users (multi-sided)

- **Show host** — true product user; bottom-up love starts here (the dual loop's bottom-up side)
- **Station GM / CFO** — economic buyer; signs the contract (the dual loop's top-down side)
- **Programme Director / Content Director** — content-fit gatekeeper; relies on **host editorial sovereignty** (the host's name on it — host retains editorial control on air) and **premium-as-priority-not-guarantee** (paying buys higher chance and priority, never a guaranteed read)
- **Station IT / Engineering** — integration and compliance reviewer (multi-tenant identity, GDPR, data residency)
- **Listener** — never sees Radio OS; always sees the station's brand; identity is per-station with bridged cross-station portability for tenure-aware opt-in cohorts
- **Syndicast** — distribution partner with named co-founding equity stake and multi-year exclusive GTM rights — formalised pre-prototype, not a transactional channel relationship

### Problem

Radio's most valuable asset — millions of people listening together at the same moment to a person they trust — is monetized only through advertising, and ad revenue is structurally shrinking. Hosts already build the parasocial bond; listeners have proven they will pay people they love. **No one has built the Patreon-equivalent for live, multi-show, portfolio-identity broadcast radio.** Incumbents (Triton, Jacapps, Futuri) ship streaming + push, not memberships + gifting + live-queue + community + CRM under one white-label. Stations are told to diversify and have no platform to do it with. Hosts are stuck with calls, texts, and inboxes — remembering 15 regulars instead of 500.

### v0.1 — Radio OS Live Club

The first deployable cut, scoped intentionally to a single show.

**Five features:**

- Listener identity (registration + profile)
- One premium membership tier (multi-tier badge taxonomy — Gold, Founding, etc., per adult-voice framing (status framing rather than gamification language like "XP" or "Level Up") — is later-module scope)
- Live message queue: listeners type a message into a queue; the host reads it on air
- Premium priority flag on the queue
- Congregation counter (real-time count of how many listeners are tuned in right now, surfaced to both host and listener)

**Two operating modes:**

- **Producer-mode:** a producer or board-op operates the dashboard while the host sees only a curated 3-message strip — the default for the first ~4 weeks of any deployment, designed to protect on-air cognitive load
- **Host-direct mode:** the host operates their own ranked queue with member context — the destination posture, opt-in once the host is ready

**Three brandable interfaces** — listener (PWA), host live dashboard, station/show admin (theming + module config) — demoable and reskinnable in the meeting. UK-only payments. Listener entry points (station-branded domains, station's PWA, parent app + station-themed in-app spaces) detailed in Functional (step 9).

**Explicit out-of-scope:** live commerce, content vault publishing pipeline, CRM, full streaks/seasonal engine, music replay (rights-by-design — no music replay, ever), per-station native apps. Full v0.1 scope spelled out in Scoping (step 8).

### 36-month financial scenarios

The PRD plans against two scenarios in parallel; lighthouse instrumentation determines which is real by month 6-9:

| Scenario | Blended conversion | 36mo ARR (rev-share) | Pricing pressure |
|---|---|---|---|
| **Bull case** (silent-majority economics holds — passive listeners convert at 2x active rate) | 2% | ~€72M | Standard SaaS-base + 10% rev-share |
| **Conservative case** (silent-majority economics underperforms) | 0.8% (Patreon-tier with passive uplift) | ~€20-25M | SaaS-base scaled up; rev-share floor 5%; sunsetted concessions |

Both must pencil. Bull case is upside, not plan. The 2-developer bootstrapped team must remain solvent under the conservative case. Year-5 expansion thesis (talk-podcast networks, sports-talk franchises, college/community broadcasters, auto-OEM integration) is treated separately and scoped in step 12.

### Differentiation

**Core insight.** No one has built the Patreon-equivalent for live, multi-show, portfolio-identity broadcast radio. The wedge is medium-specific; the bundle is competitive whitespace; the moat compounds across **five 6-12mo replication-resistant layers** — Syndicast channel-cost advantage, compliance stack, signed lighthouse case studies, multi-sided switching costs from substrate convergence, and white-label substrate maturity. A well-funded competitor needs ~24 months for full replication; we use that runway to lock network effects.

**Differentiation stack:**

- **(a) Vertical broadcast-native bundle** — memberships + gifting + live-queue + community + CRM in one product, in a category whitespace
- **(b) Syndicast as channel-cost advantage** (not exclusivity moat) — saves 6-9mo and hundreds of $K per radio acquisition vs. cold-call; co-founder equity converts single-channel risk into structural alignment
- **(c) The Triangle** — unified listener identity × premium membership × live participation queue + congregation counter, at fidelity that doesn't exist in broadcast today
- **(d) Bottom-up + top-down dual loop** (host falls in love with the platform → host pulls GM into the contract) — the host is the true user, the GM is the buyer; brief-confidentiality discipline applies (PRD content is leakable IP)
- **(e) Silent-majority economics — listed here as the strategic bet, not yet a proven moat.** Model assumes the ~70% of listeners who never type still convert at 2x active rate via passive streaks/seasonal accrual (vs. <0.5% Patreon benchmark). If validated in lighthouse, this is the most defensible economic moat in the stack; if disproven (kill-criterion: <1.2% blended by month 12), conservative-case pricing absorbs the gap. Listed as part of the stack because the strategic positioning depends on testing it explicitly.
- **(f) Compliance-first as moat against small entrants** — UK-only v0.1 ships PSD2/PSD3, GDPR Reg 2025/2518, EU AI Act, Apple 4.2.6 mitigation (App Store Review Guideline 4.2.6, which rejects native apps generated from a commercialized template — the constraint that forces a PWA + unbranded parent-app pattern instead of per-station native apps in v0.1), and **rights-by-design** (premium archive is rights-free talk content only; music replay permanently out of scope) already addressed
- **(g) Multi-sided switching costs (the real moat)** — five interconnected elements coexist on a single substrate; migration is simultaneous data-fidelity loss across all of them: (1) host portability, (2) station audience graph, (3) listener identity, (4) compliance-grade payments, (5) the white-label substrate itself (per-station theming + identity namespace + per-station configured policies that accrete over time — the longer a station runs, the harder migration becomes because the configuration becomes part of the station's institutional memory)
- **(h) White-label-by-design** — listeners never see Radio OS; structurally moats vs. consumer-brand competitors who cannot whitelabel without abandoning brand equity. Per-station theming, custom domains, identity namespace, copy strings, and module-renaming are product surfaces, not configuration toggles

**Stack-to-moat-layer mapping** (the two taxonomies are complementary, not competing):

| Moat layer (replication time) | Maps to differentiators |
|---|---|
| Syndicast channel-cost advantage | (b) |
| Compliance stack | (f) |
| Signed lighthouse case studies | (a) + (c) realized in production |
| Multi-sided switching costs | (g) |
| White-label substrate maturity | (h) |

**Competitive positioning:** vs. broadcast incumbents (Triton, Jacapps, Futuri — ship streaming + push, not member-economy bundle); vs. lateral creator-economy platforms (Patreon, Substack — single-creator, async, consumer-brand-dependent); vs. global platform players (Spotify Live — consumer-brand-dependent, station identity rejection); vs. well-funded new entrant (~24-month replication clock starts on brief leak).

**Operational principles** (full treatment in functional, NFR, and governance sections):

- **Host-portability mechanism** — listener tenure-aware opt-in default; host 12-month founding contract minimum and rev-share consequences on migration; station retains base graph, advertiser CRM, and station-level operational state; multi-tenant identity satisfies GDPR data-portability without cross-tenancy leakage
- **Premium-priority code-enforced teeth** (paying ≠ guaranteed read) — premium-attributable reads per show capped (default ≤25%), host override visible per read, editorial-integrity monitoring surfaced in PD dashboard, premium-priority violations throttle premium queue surfacing
- **Listener-side positive pull** (not just host-side friction) — tier-locked benefits, station-portfolio identity (one streak across all shows on the station), member testimony archive, founding-200 originator credit
- **Rev-share floor + walk-criterion** — 10% standard with sunsetted concession path (e.g., 0% Y1 → 5% Y2 → 10% Y3+); zero-rev-share-with-no-sunset deals are walked; documented before pilot 1
- **Load-bearing thing (product narrative)** — host-direct mode achieving usefulness > producer-mode within each deployment; instrumented per station, intervention triggered on outliers, not enforced as contractual milestones
- **Brand-leakage discipline** — Radio OS name never reaches a listener; treated as P0 bug class
- **Host-as-Screen architecture** — broadcast IS the primary participation feed. Status is performed aurally (host reads name + tier badge + streak length on air), not just displayed visually. Every free listener hears what premium members get; the show itself is the most powerful conversion ad possible

### First-experience proof moments

Demoable clicks where each audience experiences the product working:

- **For the host:** first time mid-show they look at the dashboard and see 500 ranked listener identities with member context, instead of a chat scroll or a producer's index card
- **For the listener:** first time their gift, premium message (Super Message — a premium-priced listener message with priority queue placement, £1-£3 each, one free per week per member), or streak gets read on air with their name and tier badge — the parasocial relationship turns bidirectional and on-air
- **For the GM/CFO:** first quarterly board where listener-spend ARPU shows up as a P&L line that doesn't move with the ad-market cycle
- **For the PD:** first time they confirm the premium-as-priority-not-guarantee principle is in the contract and the host stays sovereign on air — the thing they were afraid of (entitled paid listeners hijacking the show) doesn't happen

### Material risks (acknowledged in ES; mitigations in body)

Three failure modes the strategy is most exposed to. Pre-mortem analysis ranks by probability:

- **Host-direct adoption stalls (~40%)** — producer-mode default never gives way; the bottom-up + top-down dual loop doesn't fire; renewal economics break before pricing matures. Mitigation: instrumented adoption rate per station; intervention on outliers; host-direct ergonomics architected as a v0.1 constraint, not a v2 feature.
- **Syndicast divergence (~25%)** — leadership change or strategic re-prioritization weakens distribution. Mitigation: equity + exclusivity formalised pre-prototype; direct-sales playbook from month 12 (defensive); first non-Syndicast radio as an explicit milestone.
- **Silent-majority conversion underperforms (~20%)** — passive listener conversion lands at <1.2%; rev-share economics don't carry the model. Mitigation: lighthouse instrumentation by month 6-9; conservative-case pricing structure pre-defined; SaaS-base scaling absorbs the gap.

## Project Classification

| Field | Value | Notes |
|---|---|---|
| **Project Type** | `saas_b2b` | Multi-tenant white-label, RBAC across station/show/host/listener, subscription tiers, integrations, compliance |
| **Domain** | `media-broadcasting` (custom) | Not in BMM standard taxonomy; payments and compliance handled as NFRs, not as fintech domain reframing |
| **Complexity** | `high` | Multi-tenant white-label, real-time live participation, multi-jurisdiction sequencing (UK → EU → MENA — Middle East / North Africa), 10 interdependent modules, payments-compliance NFR load, App Store policy, rights-by-design boundary |
| **Project Context** | `greenfield` | No existing system. Brief, UX spec, brainstorming corpus are inputs. UX spec was completed before this PRD; treated as constraint input rather than re-derived |
| **Listener mobile UX** | P0 first-class concern | PWA delivery in v0.1 (Apple 4.2.6 forces white-label off native); quality bar is native-mobile-class. Native apps deferred to year 2 without breaking white-label |

**Carried compliance concerns** (multi-jurisdiction sequencing is itself a roadmap-gating constraint):

- GDPR + EU Reg 2025/2518
- PSD2/PSD3 + KYC + age-verification
- EU AI Act + GDPR convergence (CRM AI segmentation)
- Apple 4.2.6 white-label policy
- Rights-by-design music-licensing boundary (premium = rights-free talk only; no music replay)
- Cross-border VAT and FX (MENA expansion)

## Success Criteria

### User Success

Measurable outcomes per user role, instrumented at the lighthouse and tracked per deployment.

**Show host (true product user):**

- **Host-direct adoption rate** — ≥60% of deployed shows have hosts running host-direct mode by month 6 of deployment (sets the floor for the load-bearing thing — Edit 4)
- **Reads-per-show** — above format-pack floor (Morning Show: ~10-15 reads/hour) for ≥80% of shows weekly
- **Host qualitative signal** — at least 1 host per station who would refuse to go back to operating without the platform; tracked via quarterly host interviews
- **Editorial control intact** — zero host-editorial-sovereignty violations (platform overriding host judgment) per quarter

**Listener:**

- **Premium conversion** — measured at lighthouse: bull 2% blended, conservative 0.8% blended; instrumented monthly from month 3 of each deployment
- **30-day retention** — >60% for Tier-1 deployments
- **Streaks engagement** — ≥40% of registered listeners have a streak ≥7 days within 30 days of signup (proxy for silent-majority economics validation)
- **Founding-200 retention** — ≥50% of pre-launch founding-200 members remain active at 90 days
- **Member testimony moments** — ≥1 testimony spotlight read on air per show per quarter (silent-majority economics + listener-side pull from Edit 10)

**Station GM / CFO (economic buyer):**

- **Listener-spend ARPU on P&L** — visible as a board-reported line item within 90 days of go-live
- **ARPU growth Q-on-Q** — ≥10% in months 6-12

**Programme Director / Content Director:**

- **Premium-priority violations** — zero in first 90 days; <2 per quarter ongoing (premium-priority code-enforced teeth from Edit 7)
- **Editorial-integrity ratio** — premium-attributable reads ≤25% of total reads per show

**Listener entry-point experience (PWA):**

- **Time-to-first-message** — <30 seconds from install to first queued message
- **Performance** — Lighthouse PWA score ≥90; sub-second perceived load on 4G

### Business Success

**12-month (lighthouse phase):**

- **Deployments** — 10 live deployments (paid + unpaid CAB partners)
- **Paid contracts** — 3-5 paid contracts (conservative reframe from brief's "10 paying"); bull 7-10
- **Lighthouse case studies** — 3 published case studies signed off by lighthouse stations
- **Founding-station agreements** — ≥3 stations signed under the standard founding-station template
- **Defensive direct-sales milestone** — first non-Syndicast direct-sale radio LOI signed (channel-diversification proof)
- **Lighthouse instrumentation** — conversion + retention + reads-per-show + adoption metrics operational by month 6

**36-month — twin-track:**

| Track | Bull case | Conservative case |
|---|---|---|
| Stations on platform | ~600 (~20% Syndicast network) | ~200 |
| Paid users | ~12M @ 2% blended | ~2M @ 0.8% blended |
| ARR (rev-share) | ~€72M | ~€20-25M |
| Silent-majority economics status | validated | repriced (SaaS-base scaled up; rev-share floor 5%) |

**Strategic-discipline metrics** (load-bearing for moat preservation):

- **Brief-confidentiality** — zero brief-level strategic content in public artifacts pre-public-launch
- **Brand-leakage incidents** — zero P0 incidents per quarter (Radio OS name reaching a listener)
- **Walk-criterion enforced** — zero deals signed with zero-rev-share-no-sunset clauses
- **Host portability mechanism** — operational by month 9 (v0.1 architecture must support; mechanism ships in v1.x)

**Tri-narrative load-bearing checks** (per Edit 11):

- **Product narrative success** — host-direct adoption > producer-mode rate at deployment level (covered in User Success)
- **Commercial narrative success** — first 3 lighthouse case studies converting to direct-sales pipeline; rev-share floor holds
- **Industry/press B2B narrative success** — "first member economy built for live radio" tagline appears unmodified in ≥3 unpaid press placements (Inside the Radio mentions don't count) by month 18

### Technical Success

**v0.1 functional thresholds:**

- **Live message queue latency** — <2s from listener tap to host-visible queue position
- **Producer-mode dashboard** — <500ms message-receipt-to-display latency during live show
- **Congregation counter** — accurate within 5% of true concurrent listener count, refreshed every 30s
- **Multi-tenant theming engine** — new station deployable + reskinnable in <5 minutes ("demoable in the meeting" criterion)
- **PWA install** — success rate ≥90% across iOS Safari + Android Chrome (latest two majors)

**Substrate / architecture:**

- **Multi-tenant identity namespace** — per-station isolation; bridged cross-station portability for opt-in cohorts; GDPR data-portability satisfied with zero cross-tenancy leakage
- **Brand-leakage CI gating** — automated lint blocks any commit introducing "Radio OS" string into listener-facing surfaces, strings, screens, or assets — P0 bug class (Edit 13)
- **Uptime SLA** — 99.9% during station broadcast windows (live show SLA per defined per-station window); 99.5% off-air

**Compliance milestones (gating market expansion):**

- UK PSD2 + GDPR + Apple 4.2.6 mitigation operational at v0.1 launch
- Market #2 (EU) compliance + Super Messages + gifting operational by month 6
- One new market per quarter thereafter (operational metric and roadmap-gating constraint)

### Measurable Outcomes

The two single load-bearing signals that determine success or failure:

- **The single quantitative number:** lighthouse blended conversion at month 12. Kill-criterion <1.2% triggers conservative-case pivot (SaaS-heavy pricing, rev-share floor → 5%, scale plan revised).
- **The single qualitative signal:** one host saying on air "go to gold member, like Sarah did" without prompting from a producer — proof the bottom-up + top-down dual loop has fired and on-air conversion (the show as marketing funnel) is happening organically.

## Product Scope

### MVP - Minimum Viable Product

**Radio OS Live Club v0.1** — already named in Executive Summary; restated here with full scope.

**Functional:** 5 features (listener identity / one premium tier / live message queue / premium priority flag / congregation counter), 2 modes (producer-mode default, host-direct architectural destination), 3 brandable interfaces (listener PWA / host live dashboard / station+show admin).

**Substrate:** multi-tenant theming engine; per-station custom domains + SSL automation; per-tenant identity namespace with bridged portability primitives architected (mechanism itself ships in v1.x); brand-leakage CI gating.

**Compliance:** UK-only payments, GDPR Reg 2025/2518, PSD2, Apple 4.2.6 mitigation (PWA + parent-app pattern), rights-by-design enforced (no music replay).

**Scale:** 1 lighthouse station deployed by month 4; 3 lighthouse stations deployed by month 9; 10 live deployments by month 12.

**Out of MVP scope:** live commerce, content vault publishing pipeline, full streaks/seasonal engine, music replay (rights-by-design — permanent), per-station native apps, MENA payments, advertiser intelligence, host-portable migration mechanism (architecture ready, mechanism in v1.x).

### Growth Features (Post-MVP)

**Tier 2 — Retention (months 2-4):**

- Streaks with loss aversion
- Earned status tiers (Gold, Founding, etc., per adult-voice framing — status framing rather than gamification language)
- Host-pick push notifications + blurred reveal
- Members-set-agenda for tomorrow's show
- Member Testimony Spotlight (highest-rated single concept in brainstorm)
- Origin story / lore primitives

**Tier 3 — Revenue (months 4-8):**

- Super Messages (£1-£3, one free per week per member)
- Micro-tips / cheers (£0.50-£2)
- Seasonal pass (£5-£10)
- Sub gifting + member-sponsored memberships (viral primitive)
- Listener challenges
- Listener-side positive pull mechanisms (Edit 10) operationalized: tier-locked benefits, station-portfolio identity, founding-200 originator credit
- Host portability mechanism (Edit 6) operationalized: 12mo founding-contract minimum + listener tenure-aware opt-in default + station-base-graph retention

**Tier 4 — Moat (months 8-14):**

- Listener characters & roles ("Skeptical Steve" — identity persistence as recurring on-air personality)
- Show lore + small groups
- Member-curated playlists (artist/Syndicast partnership)
- Prediction championship (sports-talk format-pack revenue stream)
- CRM & Advertiser Intelligence module (Module 10) — closes the commercial-narrative differentiator and arms the Triton pricing-defense (ad-revenue-lift framing per shark-tank Jonas)
- Cross-platform identity bridging (where compliance allows)

**Compliance & geographic expansion:**

- Market #2 (EU) by month 6
- Markets #3-#5 (additional EU + first MENA marquee, post-Apple 4.2.6 evaluation): months 9-18
- MENA Phase-2 marquee — Nile Radio (~49M listeners) demoted from Phase-1 paid-lighthouse but retained for narrative

### Vision (Future)

Year 3+ expansion thesis (carried from Executive Summary's "Why now" runway and shark-tank David's question):

- ~600 radios on Radio OS (~20% Syndicast network) at 36 months
- **Year-5 expansion thesis:** talk-podcast networks (NPR-class), sports-talk franchises, college/community broadcasters — all addressable on the same substrate via module reconfiguration
- **Auto-OEM partnerships** year 2+: CarPlay / Android Auto / Tesla / Rivian deep integration (80% of radio listening is hands-busy in cars; first-mover deep integration is both a UX moat and a distribution position)
- **Strategic partnerships:** labels/artists via Syndicast (member-curated playlists, artist AMA drops, exclusive premium-only artist messages); payments + KYC + age-verification + FX deepening (Stripe / Adyen + Onfido + Wise) turning regulatory drag into a moat smaller competitors cannot replicate; sports prediction / fantasy / regulated betting partners (halal "predictions only" product for MENA)
- **Cultural reframe:** radio reframed from "broadcast advertising" to "community economics"; hosts as community leads; stations operating listener portfolios, not ad inventories
- **Substrate ambition:** Radio OS as the platform for all live-audio member economies — not a radio-only product anymore

## User Journeys

### Journey 1 — Marcus the Host: from "remembering 15" to ranked-queue mid-show

**Persona.** Marcus Reid. 47, 12 years on UK breakfast radio, currently at GHR Manchester. ~250k weekly listeners. Has changed stations twice; lost his text/WhatsApp regulars both times. Started a Patreon in 2024 that "felt like a side hustle, not a show."

**Opening scene.** Monday morning, week 1 of GHR's Radio OS Live Club deployment. Marcus is mid-show, his producer Rachel is at the dashboard, and Marcus is reading from his usual paper script. Rachel slides him a curated 3-message strip on the screen. Two messages get read; one doesn't. Marcus likes that he can ignore one without it being rude — Rachel filters the right ones.

**Rising action (weeks 2-4).** Marcus starts noticing patterns. Rachel keeps surfacing the same listener — "Skeptical Steve" — and Marcus addresses him by name on air. Rachel shows him a "member context" panel: Steve has an 8-week streak, Founding tier, argued with Marcus three times about the same political topic. Marcus reads a Super Message live; the donor's name and tier show up. He says "thanks, Sarah from Stockport" without prompt.

**Climax (week 8).** Marcus asks Rachel: "can I just see this myself?" She switches him to host-direct mode. First show on host-direct, Marcus sees 500 ranked listener identities mid-show — names, streaks, gift histories, prior on-air moments. He stops mid-segment: *"if you want to be in this conversation properly, go to gold member, like Sarah did."* First on-air conversion line of his career, unprompted.

**Resolution.** By month 4 Marcus is operating his own queue. He tells the host interviewer he couldn't go back. Reads-per-show holds at 14/hour. The bottom-up + top-down dual loop has fired (host fell in love; that pull will reach the GM). Edit 4's load-bearing thing is satisfied at this deployment.

**Failure-recovery — when host-direct adoption stalls.** If Marcus doesn't take to host-direct mode by month 6, the load-bearing thing's instrumentation triggers a coaching escalation — Adrian/Syndicast or a contracted radio coach reviews the per-station adoption dashboard, peer-host audio clips from successful deployments are shared, format-pack reconfiguration is offered, producer-mode shadow can persist indefinitely. **No contractual stick** — this is the "instrumented, not contractual" principle from Edit 4 made operational. The 40% of hosts who don't adopt by month 6 follow the same coaching path, not a punitive path.

**Show emergency handling.** Mid-show interruption (medical emergency, technical failure, broadcast feed cut): listener-facing surface enters "show paused" state, queued messages held in escrow, premium charges automatically refunded for the affected show, congregation counter pauses. Resumption returns the queue intact.

**Capabilities revealed:**

- Producer-mode dashboard with curated message strip; host-direct mode with ranked queue + member context
- Per-message tier/streak/gift visibility
- On-air conversion playbook coaching — including peer-host audio clips for "your first attempt" support
- Reads-per-show instrumentation per station, surfaced to Sandra and Adrian/Syndicast for intervention triggers
- Smooth producer→host-direct transition flow
- Gift/Super Message recognition with name + tier
- Per-station host-direct adoption dashboard with coaching-escalation triggers
- Show emergency / off-air handling (queued messages held in escrow; auto-refund; counter pause; clean resumption)

### Journey 2 — Skeptical Steve the Active Listener: from one-off message-sender to recurring on-air character

**Persona.** Steve, 47, IT manager from Stockport. Listens to Marcus while commuting (50 min each way). Texts in maybe twice a year. Argues a lot.

**Opening scene.** Steve registers on the GHR member site after Marcus's on-air read in week 2. Free tier; brief survey; streak meter at 1 day. The page is GHR-branded — green and orange — Steve has no idea Radio OS exists.

**Rising action (weeks 1-4).** Streak grows. Steve sends a message during a live debate; doesn't get read. Tries again next day, gets read. Sends a Super Message (£2) as an experiment; gets read with his name and **Founding** badge (he was in the pre-launched founding-200 cohort). Discovers he's been quoted by Marcus three weeks running. His Founding tag shows up on the leaderboard.

**Climax (week 6).** Marcus reads a Member Testimony Spotlight on air — Steve's, recorded the prior week. Steve hears himself called a "show character" by name. He's now part of the show, not just a listener. He upgrades to premium when GHR launches the tier in month 4.

**Resolution (month 6).** Steve is a recurring on-air personality ("Skeptical Steve"). 30+ week streak, ~£15/month spend (premium + 2-3 Super Messages monthly), gifted a sub to his brother-in-law. The brief's "regular/character" archetype realized. The active-listener side of silent-majority economics is validated for this profile.

**Capabilities revealed:**

- Registration with station-branded UI (zero Radio OS leak)
- Founding-200 cohort identity + originator credit (Edit 10)
- Tiered membership; live message queue with priority flag
- Super Messages with name + tier badge + price tier
- Member Testimony Spotlight (recording + on-air playback)
- Sub-gifting; leaderboard / status tier visibility
- Premium-content moderation pipeline (AI pre-filter + producer override + tier-strike for repeat violations + ban for severe abuse)
- Payment chargeback / dispute flow (Stripe webhook handling; tier downgrades gracefully; founding badge preserved; recovery email; reactivation flow)
- Listener-side privacy / safety / takedown surface (pseudonym option; identity-revoke flow; takedown request handling for on-air audio that's already broadcast — substrate-level identity revoke even when audio cannot be retracted)

### Journey 3 — Auntie Marge the Silent Listener: passive conversion via silent-majority economics

**Persona.** Margaret, 63, retired teacher, listens to Marcus over breakfast every weekday. Has never sent a text to a radio station in her life. Doesn't see herself as someone who "engages."

**Opening scene.** Marge installs the GHR app because Marcus mentioned it ("you'll get the show notifications"). Gives her email; gets a streak meter she didn't ask for. The app is GHR-branded; she doesn't know what Radio OS is.

**Rising action (months 1-2).** Marge listens daily. Streak grows passively, just from listening. She gets a "5-day streak" notification, then a "10-day," then a "30-day Gold candidate" notification. The screen tells her she'll lose a 30-day streak if she misses two days. Loss aversion does its work. She's never typed a message. She doesn't intend to. Her streak is now 47 days and she'd be sad to lose it.

**Climax (month 2, day 60).** Marge gets a "30-day passive Gold member" upgrade screen: £4.99/month locks in her tier, gives her testimony archive access, reserves her seat at GHR's Marcus-and-listeners summer event. She converts. She has never sent a single message. Silent-majority economics fires for her.

**Resolution (month 6).** Marge attends the GHR member event in person. Meets Marcus briefly. Tells her sister she's part of "Marcus's club." Still in her 200-day streak. Pays £4.99/month. Multiplied across the silent 70%, this is the bull-case 2% blended conversion — if it holds.

**Capabilities revealed:**

- PWA install with passive-engagement instrumentation
- Streak loss-aversion notifications — with **adult-voice-aligned opt-out** (notifications don't manipulate; user can disable loss-aversion-style copy and receive neutral status updates instead)
- Passive-conversion upgrade flow
- Tier-locked benefits (Edit 10); member event RSVP + attendance management
- Testimony archive access; identity persistence across station-portfolio shows
- Station-branded push notifications
- Payment chargeback / dispute flow extends to passive listeners (Marge's son disputes; system handles gracefully without interrogating Marge)
- Streak grace period for connectivity failures (skip-day forgiveness with a defined window)

### Journey 4 — Sandra the GM: from board sceptic to founding-station signatory

**Persona.** Sandra Holloway, 52, GM of GHR Manchester + Birmingham. P&L responsibility ~£18M annual revenue. CFO mindset. Sceptical of new SaaS pitches; has been burned by three streaming-tech vendors who promised diversification and delivered ad-tech rebrands.

**Opening scene.** Sandra reads an Inside the Radio post about "the first member economy built for live radio" via a Syndicast newsletter. Mildly curious. Asks her PD Tom to take a demo call.

**Rising action (months 1-3).** Tom reports back: host UX is genuinely different; the premium-as-priority-not-guarantee principle (paying ≠ guaranteed read) is in the contract template; pricing has SaaS-base + 10% rev-share with a documented sunset. Sandra agrees to a 90-day CAB membership. Her IT lead Priya confirms compliance posture is acceptable. The standard founding-station agreement arrives — 24-month founding-pricing locked, named lighthouse rights, exclusivity-of-engagement clause.

**Climax (month 4).** Sandra signs. The walk-criterion (no zero-rev-share-with-no-sunset deals) was tested when she pushed for "year 1 rev-share waived entirely" — the response was *"yes, with a documented sunset to 5% by year 2 and 10% by year 3, with non-precedent language."* She signed because the structure pencilled, not because Radio OS conceded everything. Edit 9 (rev-share floor + walk-criterion) held in the room.

**MoR (merchant of record) open decision.** Surfaced to Sandra during contract review: who carries cross-border payments, VAT, KYC, and chargeback exposure? Radio OS-as-MoR centralizes regulatory burden and keeps stations clean of payment-rail complexity but creates Radio OS exposure on chargebacks; station-as-MoR keeps stations clean of exposure but means Radio OS depends on station-side accounting honesty for its primary revenue line. **Decision must be locked before pilot 1**; documented in the founding-station agreement annex.

**Resolution (month 7-9).** GHR is live. ARPU appears as a board-reported line item. Sandra defends it in her quarterly board meeting. Her question shifts from "is this real revenue?" to "how fast can we expand to GHR Birmingham?" Renewal at month 12 is a foregone conclusion. The top-down (station-contract) side of the dual loop has fired.

**Capabilities revealed:**

- Inside the Radio publishing surface; webinar + demo flow
- CAB charter administration
- Founding-station agreement template with concession sunset machinery
- Rev-share floor enforcement (substrate-level) + walk-criterion documentation
- Per-station + per-show admin console
- ARPU + member-count + listener-spend reporting (board-grade)
- Multi-station tenancy under one parent contract
- MoR decision documentation + per-station MoR election
- Content liability allocation in DPA/MSA (between Radio OS and station)

### Journey 5 — Rachel the Producer: from dashboard-operator to handoff steward

**Persona.** Rachel Adeyemi, 31, board-op / producer for Marcus's morning show. Already runs the studio desk, music queue, and ad breaks. New responsibility: the Radio OS dashboard during the producer-mode window.

**Opening scene.** Rachel completes a 90-minute training session before week 1. She learns: filter the queue by tier and streak; surface 3 messages at a time to the curated strip Marcus sees; never let a paid Super Message bump organic above-floor (premium-as-priority-not-guarantee enforced in code).

**Rising action (weeks 1-4).** Rachel develops a rhythm. Notices which listener archetypes Marcus responds to. Files the weekly host-facing report: reads/hour, premium-attributable read ratio, listener-character suggestions for Marcus to address by name.

**Climax (week 5).** Rachel notices Marcus reading from the curated strip without her flagging — he's eyeballing the full queue indirectly. Hands him host-direct access. Spends weeks 5-8 in "shadow" producer-mode, available if Marcus wants help, mostly idle. By week 8, hands off entirely. Returns focus to the studio desk.

**Resolution (month 3).** Rachel writes the deployment retrospective: *"host transition was smoother than expected; premium-priority enforcement caught two would-be violations in week 6 and the system flagged them for me."* The dashboard's premium-read ratio surfacing was the most useful instrument for protecting Marcus from edge cases.

**Capabilities revealed:**

- Producer-mode dashboard with queue-filter + tier/streak overlay
- Curated 3-message strip generation
- Producer training materials + 90-min onboarding curriculum
- Weekly host-facing report (reads/hour, premium ratio, archetype suggestions)
- Premium-priority violation detection + flagging
- Producer→host-direct handoff workflow; producer "shadow" / on-call mode post-handoff
- Surge mode UI for viral message volume (1000+ messages in 5min: AI pre-filter intensifies, auto-batching engages, tier-priority surface tightens, hide all non-Founding/Gold during surge as opt-in producer setting)
- Backup producer / AI auto-curation fallback (when primary producer is unavailable: AI generates curated 3-message strip with same premium-priority enforcement; flagged to Tom for editorial review)
- Live moderation API surface (producer override + flag-to-Tom escalation for content the AI pre-filter missed)
- Producer-vs-host editorial disagreement protocol (Tom as tiebreaker; host editorial sovereignty on air takes precedence in host-direct mode; in producer-mode, Tom adjudicates per-show editorial guidelines)

### Journey 6 — Priya the IT Lead: integration, compliance, and brand-leakage hunting

**Persona.** Priya Singh, 38, Head of Digital Ops at GHR. Owns SSO, GDPR posture, vendor compliance, the parent app codebase, and station IT relationships. Skeptical of multi-tenant vendors; has seen one Schrems-violation incident.

**Opening scene.** Priya joins the Radio OS technical onboarding call month 0. Asks: where does listener data live? How is identity isolated per station? What happens to GHR's data if Marcus moves to Capital? What happens when a listener exercises GDPR portability?

**Rising action — pre-deployment configuration (months 0-1).** Before GHR's listener-facing surface goes live, Priya configures the technical foundation:

- **Tenant provisioning** — GHR is created as a tenant under the Radio OS substrate; identity namespace assigned; data residency UK-only
- **SSO + email integration** — selects from available adapters (SAML 2.0, OAuth2, generic webhook); picks GHR's existing Okta SSO for staff-side admin access; generic email adapter for listener registration
- **Per-station custom domain + SSL** — `member.ghr.co.uk` provisioned; SSL automation; cookie scoping per tenant
- **Brand asset upload** — logos, fonts, color tokens; versioned, deployable, designable
- **GDPR / compliance configuration** — consent banner copy approved; data-retention policy set (default 7 years for payment records; 3 years for inactive listener identity; configurable per market); GDPR data-portability endpoint enabled; audit log routing into GHR's existing SIEM
- **Brand-leakage CI gate** — pre-built lint package added to GHR's deploy pipeline as a CI step; alerts route to Priya's incident channel
- **Multi-tenant identity bridging configuration** — pre-configured at substrate level; GHR-side tenant only sees inbound bridging requests as audit events (no direct visibility into other tenants' data); verified with a synthetic test
- **Founding-200 pre-registration flow** — listener registration form configured; email confirmation flow; founding-cohort identity badge assignment

**Rising action — operational ongoing (months 2-4).** Apple 4.2.6 contingency playbook reviewed (PWA-only fallback if parent app is removed; pre-drafted listener communication; per-station deployment continuity). SSO outage graceful degradation tested (fallback to email-magic-link auth; status page; communication flow).

**Climax (month 5).** A junior dev at GHR pushes a microcopy change that accidentally includes "Radio OS" in a user-facing payment receipt template. The brand-leakage CI catches it. Priya gets the alert. The PR is auto-blocked. Priya files a quick incident report; Radio OS's lint caught what GHR's QA missed. P0 bug class, zero-tolerance, mitigation working as designed.

**Resolution (month 9).** First listener portability request arrives — a listener moving from another station's Radio OS deployment to GHR. Priya watches the system bridge cross-station portability without leaking either tenant's data. Schrems concern satisfied. She becomes a technical reference for other CAB stations.

**Capabilities revealed:**

- Technical onboarding + integration documentation
- Multi-tenant identity namespace with cross-station bridging
- Per-station custom domain + SSL automation
- SSO + email integration adapters (SAML 2.0, OAuth2, generic webhook)
- Data residency configuration (per-station + per-market)
- Brand asset version control with deployable provenance
- Per-tenant consent banner + data-retention policy configuration
- Pre-built brand-leakage CI lint package distributable to station deploy pipelines
- Production-side runtime brand-leakage detector (beyond CI — monitors push notifications, emails, SMS, payment receipts, and listener-facing strings at runtime)
- GDPR data-portability flow with audit logging
- Cross-tenant migration audit trail
- Tenant provisioning + identity namespace + data residency choice
- Founding-cohort pre-registration flow with badge assignment
- App Store 4.2.6 contingency playbook (PWA-only fallback; pre-drafted listener communication; per-station deployment continuity)
- SSO outage graceful degradation (email-magic-link fallback; status page; communication flow)
- Brand-leakage discipline beyond CI to operational training (support staff scripts, audio/voice surfaces, email/SMS template audit)
- Technical-reference / peer-help network among CAB station IT leads
- Station vs. show vs. security admin permission tiers

### Journey 7 — The Configuration Workshop: GHR's first deployment session

**Setting.** A 2-hour facilitated session at GHR Manchester's office. Attendees: Sandra (GM), Tom (PD), Priya (IT lead), Marcus (host of the lighthouse show), and a Radio OS deployment specialist (Syndicast-supplied for the first 5 deployments — white-glove; self-serve console available from deployment 6 onward).

**Opening scene.** The deployment specialist opens a laptop, projects the admin console. The screen is empty — no GHR branding yet. *"Let's build your member experience in this meeting. By the time we finish, the listener-facing app at member.ghr.co.uk will be live with your colors, your tier names, and your modules."* Tom is sceptical.

**Rising action — the configuration choices.**

- **Format pack selection** — Sandra and Tom pick **Morning Show** from the 5 packs (Morning Show / Talk-Debate / Music / Sports / Full Station). The pack pre-loads a default module mix and tier structure.
- **Module composition** — they accept the v0.1 default of 5 modules (Identity, Premium Membership, Live Queue, Premium Priority, Congregation Counter) and explicitly defer Streaks/Seasonal/Content Vault to post-launch.
- **Tier naming** — Marcus pushes back on "Gold." They rename the single v0.1 tier to **"Inner Circle"** to match the show's editorial voice. The console accepts it; copy strings update everywhere instantly.
- **Branding** — Priya uploads GHR's logo, primary green (#1B7C3E), accent orange, and the typeface (Source Sans). The deployment specialist drags the assets in; the listener PWA preview reskins live, in front of everyone, in under 30 seconds. Sandra notes that *"this would have taken three months and £40k with our previous vendor."*
- **Domain & identity** — Priya configures `member.ghr.co.uk`; SSL provisions automatically; identity namespace assigned.
- **Premium-priority threshold** — Tom argues morning-show editorial is news-led and sets the premium-read cap to ≤15% (tighter than the ≤25% default). The console accepts a per-show override.
- **Pricing** — Sandra picks £4.99/month for the single tier. Founding-200 cohort gets locked at £3.99/month for life.
- **Producer-mode duration** — default 4 weeks for Marcus's deployment.

**Climax.** With 20 minutes left in the session, the deployment specialist hits "preview live." Marcus's phone shows the listener-facing PWA at member.ghr.co.uk. It's GHR-branded, says "Inner Circle" not "Gold," shows Marcus's morning-show theme. Marcus's first reaction: *"that's our brand. Not your brand."* The white-label promise is operationally proven in the room.

**Resolution.** They leave the session with a configured but un-launched deployment. The next 4 weeks are the founding-200 pre-registration window, an on-air playbook coaching session for Marcus, and the producer-mode training for Rachel. The deployment specialist will run two more facilitated sessions (week 2 and week 4) before handing over.

**Capabilities revealed:**

- White-glove deployment specialist role (Syndicast-supplied for deployments 1-5)
- Self-serve admin console transition gate (deployment 6+)
- Format pack selection from 5 pre-configured options (Morning Show / Talk-Debate / Music / Sports / Full Station)
- Module composition console (selectable subset from 10 modules per deployment)
- Per-show tier-naming with copy-string propagation
- Live theming preview ("reskinnable in the meeting") — sub-30s asset-to-preview latency
- Custom domain + SSL automation
- Per-show premium-priority threshold override (tighter or looser than ≤25% default)
- Per-show pricing tier configuration with founding-cohort lock
- Per-show producer-mode duration setting
- Configuration session facilitation framework (90-120min agenda, recurring follow-ups at week 2 and week 4)
- Syndicast-supplied facilitation pool
- Recorded reference session for self-serve from deployment 6+

### Journey 8 — Tom Configuring Per-Show: Morning Show vs. The Late Debate

**Persona.** Tom Asquith, PD at GHR. Owns content fit across **two shows** on the lighthouse station: Marcus's morning show, and **The Late Debate** — a 10pm-1am call-in show hosted by **Aisha Khan**, a controversial talk-format host who's been bringing in heat (and listeners) since 2023.

**Opening scene.** Three weeks after Journey 7, Tom is back in the admin console. Marcus's morning show is configured and pre-launching. Now he needs to configure The Late Debate, which is on the same GHR tenant but is a **completely different format**.

**Rising action — same station, different show.**

- **Format pack** — Tom switches from Morning Show to **Talk-Debate**. The pack pre-loads a heavier-emphasis Live Queue, looser premium-priority default, explicit content-moderation flagging.
- **Tier names** — Aisha vetoes "Inner Circle." For The Late Debate, the single tier becomes **"The Floor"**. Console accepts the override; her show's listener-facing UI updates without affecting Marcus's show on the same station.
- **Premium-priority threshold** — Tom sets The Late Debate's premium-read cap at ≤30% (looser than morning-show's ≤15%, and looser than the ≤25% global default). Reasoning: debate format thrives on heat. The system accepts the override and starts a per-show editorial-integrity dashboard so Tom can monitor whether 30% is actually working. The console flags that values outside [10%, 30%] envelope warrant explicit confirmation.
- **Module mix difference** — Tom adds the optional **Polls / Voting / Predictions** module (Module 5 from the 10) to The Late Debate. He does NOT add it to Marcus's morning show. Two shows on the same tenant now have different active module sets.
- **Pricing** — £6.99/month for The Late Debate. Different tier price than Marcus's £4.99. Per-show pricing flexibility within the same station. Founding-cohort price-lock substrate-enforced — PD cannot override prior commitments.
- **Member-Testimony cadence** — Tom configures The Late Debate to record Member Testimony every 2 weeks (vs. monthly on morning show).
- **Founding cohort** — Aisha gets her own founding-200 cohort, distinct from Marcus's. Cross-show fans can be in both via station-portfolio identity (Edit 10), but the "Founding" badge is per-show.
- **Cross-show config conflict validator** — when Tom saves, the system checks for tier-name collisions, module-conflict edges, and pricing inconsistencies that would confuse cross-show fans. Catches one issue: a duplicate copy string in the membership upgrade flow that would read identically on both shows but mean different things.

**Climax.** Tom hits "save configuration." Aisha's listener-facing UI reflects The Late Debate's branding (different accent color: deep red instead of GHR-orange via per-show accent override), different tier copy ("The Floor"), different module set (Polls visible), different premium-priority ceiling. **Same Radio OS substrate. Same GHR tenant. Two distinctly configured shows.**

**Gaming/surge scenario (month 3 of deployment).** A coordinated paid-message swarm hits The Late Debate — a Telegram group of ~120 listeners floods Aisha's queue with Super Messages on a single talking point. The premium-read ratio hits 35% by minute 30. **Pacing-projected throttle** engages at minute 22 when the projected end-of-show ratio crosses 25%, well before the actual ratio breaches 30%. **Per-listener Super Message rate limit per show** caps the swarm at ≤2 per listener (configurable). **Coordinated-group detection** flags the IP-cluster anomaly to Tom mid-show and to Sandra after the show. Sandra escalates to Adrian/Sarah at Radio OS T2 support; product team tightens the rate limit envelope and adds an opt-in stricter mode for shows that anticipate gaming.

**Resolution.** Listeners who follow both Marcus and Aisha have one identity (station-portfolio) but see show-specific branding when they're in each show's surface. A listener moving between the two shows experiences continuity in identity (streak, member status, payment) but show-specific aesthetics, copy, and feature set. The modular promise made operational at the per-show level. Premium-priority sub-policies (percentage cap + consecutive-premium rule + pacing rule) protect Aisha from gaming while keeping the show's editorial heat alive.

**Capabilities revealed:**

- Per-show format pack assignment within a single station tenant
- Per-show optional-module activation
- Per-show premium-priority threshold override independent of station default
- Per-show premium-priority sub-policies — percentage cap + consecutive-premium rule + pacing rule
- Per-show tier naming + copy-string isolation
- Per-show pricing tier within station
- Per-show accent override within station's primary brand
- Per-show Member Testimony cadence
- Per-show founding-cohort identity distinct from station-level identity
- Station-portfolio listener identity unifying cross-show membership while preserving per-show brand experience
- Station vs. show vs. security admin permission tiers
- Cross-show config conflict validator (tier-name collisions, module-conflict edges, pricing inconsistencies)
- Per-listener Super Message rate limit per show (configurable, default ≤2 per show)
- Pacing-projected throttle (engages on projected end-of-show ratio breach, not just actual percentage)
- Coordinated-group detection primitive (IP-cluster anomaly, paid-message burst pattern)
- Escalation-to-Radio-OS T2 support flow
- Founding-cohort price-lock substrate-enforced (PD cannot override prior commitments)
- Per-show editorial-integrity dashboard

### Journey 9 — Customer Support: Auntie Marge calls about her credit card

**Persona.** Same Marge from Journey 3. Now month 2 of her membership; her credit-card statement arrives showing a £4.99 charge from "GHR Member Services." Her son Mark, 31, says "you didn't sign up for any of that, Mum, that's a scam." Marge calls GHR's customer support number printed on the receipt.

**Opening scene.** Marge dials GHR's customer support. Hold music; she gets a real person, **station tier 1 support** — a GHR-side rep who handles standard listener concerns.

**Rising action.** The rep searches Marge by name + email + station-of-association. Confirms her membership. Explains: *"You signed up after Marcus's read in week 2. The receipt and the app are GHR-branded; you wouldn't see 'Radio OS' anywhere because it's our underlying platform — but everything you've experienced is GHR."* Mark is sceptical: *"How do I know this isn't a foreign company?"* The rep shows them: GHR's company-house registration, the cancellation flow (single tap), the GDPR-deletion option, and a written confirmation email.

**Climax — Steve-class refund dispute (parallel scenario).** Earlier the same day, the same rep handles a different call: **Skeptical Steve** demanding a £2 refund because Marcus didn't read his Super Message. The rep's premium-priority script: *"Paying buys higher chance and priority, never a guaranteed read. Same terms apply on every show. We hold to it — that's why the show stays good."* Offers a one-time goodwill refund as a service gesture; documents the "non-precedent" disposition in Steve's account. Steve grumbles but accepts.

**Escalation example.** A third call: **Sandra at Capital Radio** (a different station) escalates a coordinated paid-message gaming incident. Tier 1 cannot resolve; **Tier 2 escalation** to Radio OS support (Syndicast-supplied for deployments 1-5; transitions to station-only by deployment 6 alongside the configuration self-serve transition). The Tier 2 support engineer pulls the audit log, identifies the IP cluster, deploys a tighter per-listener rate limit for Capital's deployment, communicates back with documented mitigation.

**Resolution.** Marge cancels the membership at her son's insistence; her streak is preserved server-side for 30 days in case she changes her mind; her founding-200 badge is preserved in the substrate audit trail (founding identity is immutable). Mark is satisfied. Two days later Marge realizes she misses the streak notifications and re-signs up; her badge and prior streak are intact (recovery within the 30-day window).

**Capabilities revealed:**

- Support tier model: station tier 1 (handles standard listener concerns); Radio OS tier 2 (escalation; Syndicast-supplied for deployments 1-5; station-only post-deployment 6)
- Support rep identity-resolution tooling (find a listener by name + email + station-of-association)
- Support rep visibility into tier, payments, journey context
- Brand-leakage script discipline ("you wouldn't see Radio OS anywhere")
- Refund / cancellation flow with substrate-impact rules:
  - Streak preservation for 30 days post-cancellation (recovery window)
  - Founding badge preservation (immutable in audit trail)
  - GDPR-deletion option (separate from cancellation; complete data removal)
- Listener-facing premium-priority explainer (terms-of-service text + in-app explainer surface + support-script standard language)
- Premium-priority refund-dispute resolution protocol — one-time goodwill gesture; non-precedent documentation; pattern of repeated disputes triggers tier-strike
- Support-staff training on brand-leakage discipline (audio/voice surfaces; standard scripts)
- Tier 2 escalation tooling — audit log access, per-deployment configuration override, cross-deployment communication
- Listener support reactivation flow (re-signup with prior identity preserved within window)

### Journey 10 — FM Marge: Radio-only listener acquisition via SMS short-code

**Persona.** "FM Marge" — a separate composite from Journey 3's PWA-installing Marge. FM Marge, 67, retired widow, listens to Marcus on her kitchen radio. Has a basic mobile phone; doesn't install apps; wouldn't know what a PWA is. **She represents the >70% of GHR's audience who are pure broadcast listeners.** Without a substrate-side acquisition mechanism for FM Marge, the v0.1 conversion math cannot pencil — Radio OS cannot convert listeners it cannot see.

**Opening scene.** Marcus, mid-show in week 3 of GHR's launch, reads the on-air SMS playbook line: *"if you'd like to hear your name on this show, text JOIN to 12345 with your first name. We'll send you a link to register — it's free to start."* FM Marge texts JOIN, then her name, MARGARET.

**Rising action.** GHR's SMS short-code (provisioned per-station as a substrate primitive) responds within seconds: a magic-link URL to the station's PWA registration page, customised with Marge's name pre-filled. Marge taps the link out of curiosity. Her phone's browser opens the GHR-branded PWA; the page asks for her email (optional); she registers with just her name and phone number. Her streak starts at 1.

**Bridging the broadcast gap.** Marge doesn't install the PWA. She continues listening on her kitchen radio. The substrate detects her active listening via:

- **Broadcast-side telemetry** — GHR's existing streaming infrastructure (used for online listeners) feeds the streak detection for any registered phone-only listener with an active session bound to the broadcast feed via SMS check-in
- **Periodic SMS check-in** — once per day, listeners can optionally text "HERE" to keep streaks alive without app interaction; opt-in only (not coercive); adult-voice-aligned (no manipulation)

**Climax (week 6).** Marcus reads a Member Testimony Spotlight on air — Marge sent it via SMS by texting "TELL" to the short-code, then dictating a 30-second voice memo to a follow-up SMS prompt. The substrate accepts voice messages via SMS-attached audio, transcribed for moderation, played back on air. She hears her own voice on the radio. Her son calls her in shock.

**Resolution (month 3).** FM Marge upgrades to the £4.99 Inner Circle tier via SMS — she texts "GOLD" to the short-code, follows the link, completes payment with a card her son helps her enter once. She remains a broadcast-only listener; never installs a PWA; never opens the app again. Yet she is a paying member with a streak and a tier. **The 70% silent broadcast majority is now substrate-visible and substrate-monetizable.**

**Capabilities revealed:**

- Per-station SMS short-code provisioning (UK initially; per-market expansion paired with compliance gates)
- SMS-magic-link auth flow (registration via SMS-only, no PWA install required)
- Broadcast-side listener identity capture as substrate primitive
- SMS check-in primitive ("HERE" → keep streak alive without app interaction; opt-in; adult-voice-compliant)
- SMS voice-memo capture with transcription (for moderation) and on-air playback
- Broadcast-side telemetry integration (station's existing streaming infrastructure feeds streak detection)
- SMS-driven payment flow (text-to-tier upgrade with card-entry on follow-up link)
- Streak grace period for connectivity / radio-only listening (skip-day forgiveness within defined window)
- On-air SMS playbook coaching for hosts (the "text JOIN to 12345" canonical line)
- Per-show on-air QR code drives (alternative to SMS short-code; same registration outcome)
- SMS-only support path (parallel to Journey 9's phone-call path; for listeners without smartphones)
- Identity reconciliation — listeners who later install the PWA get their SMS-acquired identity continuity (badge, streak, tier preserved)

**Why this is in v0.1 and not Tier 2:** the conversion math at the heart of the bull-case (2% blended) and conservative-case (0.8% blended) requires the silent broadcast majority to be reachable. PWA-only acquisition reaches only the active-engaged segment (~30% of audience). Without the broadcast-side bridge in v0.1, the lighthouse instrumentation cannot validate silent-majority economics at the population level the bull case requires.

### Journey 11 — Lighthouse case study production: from deployment milestone to press placement

**Persona.** **Adrian Kerr** at Syndicast (or a designated Radio OS-side comms partner). Owns the case-study production workflow as part of the white-label-deployment-side facilitation responsibility (matches deployment-specialist role from Journey 7). Working with **Sandra at GHR Manchester** to produce GHR's case study at month 9.

**Opening scene.** Month 9 of GHR's deployment. Conversion at 1.6% blended (above kill-criterion, below bull). ARPU on quarterly P&L confirmed by Sandra. Three lighthouse stations are now operational (GHR + two others); GHR is the most mature. Adrian arrives at GHR's office for a case-study production session.

**Rising action.** Adrian uses the **case study template** — pre-built structure covering deployment context, configuration choices, host-direct adoption arc (Marcus's story), conversion arc (Steve + Marge), commercial outcome (Sandra's P&L line), strategic discipline (rev-share floor held). Sandra, Tom, and Marcus contribute quotes. Marcus signs off on his tagline-discipline quote: *"It was the first time I had a member economy that fit a live show. We didn't have to bend our editorial to fit a generic platform."*

**Tagline discipline enforcement.** The case study draft is submitted to a tagline-discipline review: any external artifact (case study, deck, press release, blog) referencing "the first member economy built for live radio" must use the tagline unmodified. Marcus's quote uses "member economy" naturally; the tagline appears verbatim in the case study's title slide and executive summary. Adrian flags one section where an early draft drifted to "first creator economy for radio" — corrected back to the canonical tagline.

**Climax (month 10).** Case study published as a long-form Inside the Radio piece. Sandra named "founding lighthouse station." Co-marketing rights operationalized. Three press placements within 60 days: industry trade publication (RadioToday), Syndicast network newsletter (high-warmth audience for prospective stations), and one mainstream business publication (FT or Guardian Media). The tagline appears unmodified in 2 of 3 placements; the third (FT) paraphrases — flagged for follow-up but acceptable.

**Resolution (month 12).** GHR's case study drives 9 inbound CAB applications at GHR's Inside the Radio referral page. Three convert to paid pilots within 6 months. **The industry/press B2B narrative success metric** (≥3 unpaid press placements with tagline unmodified by month 18) is on track.

**Capabilities revealed:**

- Case study production template + workflow
- Lighthouse-station press participation flow (recordings, quotes, sign-off chain)
- Tagline-discipline enforcement mechanism (review before external publication; unmodified-tagline metric tracking)
- Co-marketing rights operationalization (case study, "Inside the Radio" feature, joint PR per founding-station agreement)
- Inside the Radio publishing infrastructure with case-study format support
- Press-placement tracking instrumentation (which outlets, tagline integrity per placement, inbound CAB attribution)
- Founding-lighthouse named-recognition framework
- Inbound CAB application page tied to case-study referrals

### Journey Requirements Summary

The 11 journeys collectively reveal capability areas the PRD specifies in Functional (step 9) and NFR (step 10) sections downstream.

**Listener-facing capabilities:**

Registration with station-branded UI (zero Radio OS leak); founding-200 cohort identity + originator credit; tiered membership; live message queue with priority flag; Super Messages; Member Testimony Spotlight (recording + on-air playback); sub-gifting; leaderboard / status tier visibility; PWA install; passive-engagement instrumentation; streak loss-aversion notifications with adult-voice-aligned opt-out (no manipulative copy); passive-conversion upgrade flow; tier-locked benefits; member event RSVP; testimony archive access; identity persistence across station-portfolio shows; payment chargeback / dispute flow; listener-side privacy / safety / takedown surface; congregation counter; SMS short-code registration + auth; SMS check-in; SMS voice-memo capture; SMS-driven payment flow; on-air QR code drives; identity reconciliation across SMS/PWA acquisition paths; streak grace period for connectivity failures.

**Host-facing capabilities:**

Producer-mode dashboard with curated message strip; host-direct mode with ranked queue + member context; per-message tier/streak/gift visibility; on-air conversion playbook coaching with peer-host audio clips; reads-per-show instrumentation; smooth producer→host-direct transition; gift/Super Message recognition with name + tier; per-station host-direct adoption dashboard with coaching-escalation triggers; show emergency / off-air handling.

**Producer-facing capabilities:**

Producer-mode dashboard with queue-filter + tier/streak overlay; curated 3-message strip generation; producer training + 90-min onboarding; weekly host-facing report; premium-priority violation detection + flagging; producer→host-direct handoff workflow; producer "shadow" / on-call mode; surge mode UI; backup producer / AI auto-curation fallback; live moderation API surface; producer-vs-host editorial disagreement protocol with PD as tiebreaker; premium-content moderation pipeline (AI pre-filter + producer override + tier-strike + ban).

**PD-facing capabilities:**

Per-show format pack assignment; per-show optional-module activation; per-show premium-priority threshold override; per-show premium-priority sub-policies (percentage cap + consecutive-premium rule + pacing rule); per-show tier naming + copy-string isolation; per-show pricing tier; per-show accent override; per-show Member Testimony cadence; per-show founding-cohort identity; cross-show config conflict validator; per-show editorial-integrity dashboard.

**GM/CFO-facing capabilities:**

Inside the Radio publishing surface; webinar + demo flow; CAB charter administration; founding-station agreement template with concession sunset machinery; rev-share floor enforcement (substrate-level) + walk-criterion documentation; per-station + per-show admin console; ARPU + member-count + listener-spend reporting (board-grade); multi-station tenancy under one parent contract; MoR decision documentation + per-station MoR election; content liability allocation in DPA/MSA.

**IT/security-facing capabilities:**

Technical onboarding + integration documentation; multi-tenant identity namespace with cross-station bridging; per-station custom domain + SSL automation; SSO + email integration adapters (SAML 2.0, OAuth2, generic webhook); data residency configuration (per-station + per-market); brand asset version control with deployable provenance; per-tenant consent banner + data-retention policy configuration; pre-built brand-leakage CI lint package; production-side runtime brand-leakage detector; GDPR data-portability flow with audit logging; cross-tenant migration audit trail; tenant provisioning; founding-cohort pre-registration flow with badge assignment; App Store 4.2.6 contingency playbook; SSO outage graceful degradation; brand-leakage discipline beyond CI to operational training; technical-reference / peer-help network among CAB IT leads; station vs. show vs. security admin permission tiers.

**Configuration / deployment capabilities:**

White-glove deployment specialist role (Syndicast-supplied for deployments 1-5); self-serve admin console transition gate (deployment 6+); format pack selection (5 options); module composition console; live theming preview (sub-30s asset-to-preview latency); custom domain + SSL automation; per-show producer-mode duration setting; configuration session facilitation framework; Syndicast-supplied facilitation pool; recorded reference session for self-serve.

**Substrate-protective capabilities:**

Per-listener Super Message rate limit per show (configurable, default ≤2 per show); pacing-projected throttle; coordinated-group detection primitive; founding-cohort price-lock substrate-enforced.

**Support capabilities:**

Support tier model (station T1, Radio OS T2 escalation for deployments 1-5, transition to station-only at deployment 6); support rep identity-resolution tooling; support rep visibility into tier/payments/journey context; brand-leakage script discipline; refund / cancellation flow with substrate-impact rules (streak preservation 30 days, founding badge immutability); GDPR-deletion separate from cancellation; listener-facing premium-priority explainer (TOS + in-app + script); premium-priority refund-dispute resolution protocol; support-staff training on brand-leakage discipline; T2 escalation tooling; listener support reactivation flow.

**Comms / case-study capabilities:**

Case study production template + workflow; lighthouse-station press participation flow; tagline-discipline enforcement; co-marketing rights operationalization; Inside the Radio publishing infrastructure; press-placement tracking instrumentation; founding-lighthouse named-recognition framework; inbound CAB application page tied to case-study referrals.

**Journeys explicitly NOT mapped (deferred with rationale):**

- Advertiser / agency buyer journey — Module 10 / Tier 4 territory; too far ahead for v0.1 PRD functional requirements
- Internal Radio OS / Syndicast-side customer success operations journey — sales motion artifact, not product journey
- Tom (PD) standalone editorial-monitoring journey — content-fit gatekeeping for v0.1 covered by Journey 8 + Marcus's premium-priority enforcement + per-show editorial-integrity dashboard
- Mobile-app journey — year 2 deferral
- Finance integration / reconciliation journey — deferred to NFR / integration spec; Sandra's CFO is a v1.x persona
- Compliance / DPO incident response journey — covered by Priya's GDPR portability handling in Journey 6

## Domain-Specific Requirements

The `media-broadcasting` domain (custom, with embedded fintech-class payments NFRs) drives requirements specific to live linear broadcast contexts that don't appear in BMM's standard domain taxonomy. This section consolidates compliance/regulatory/technical/integration concerns surfaced piecemeal across earlier sections into one canonical reference.

### Compliance & Regulatory

**Data privacy & protection:**

- **GDPR + EU Reg 2025/2518** — EU's tightened cross-border CRM enforcement effective Jan 2026. Per-tenant consent banner; per-station data residency; data-portability endpoint with audit logging; per-tenant data-retention policy; right-to-be-forgotten flow separate from cancellation.
- **EU AI Act + GDPR convergence (Module 10 CRM AI segmentation)** — documented training-data provenance for any AI-driven listener segmentation; **DPIA per market before Module 10 ships** (Tier 4, months 8-14) — roadmap-gating constraint, not just a compliance checkbox; opt-out for AI-driven targeting at the listener level.
- **UK Data Protection Act 2018** + post-Brexit divergence — data flows between UK and EU jurisdictions documented in DPA/MSA.

**Payments & financial:**

- **PSD2 / PSD3 (EU)** — Strong Customer Authentication (SCA) on listener payments; PIS/AIS compliance for sub-gifting and member-sponsored memberships.
- **PCI-DSS** — payment card industry compliance via the chosen MoR provider; Radio OS substrate does not store card data in v0.1.
- **Cross-border VAT** — VAT on digital services per market handled by MoR provider (per the pluggable MoR architecture below).
- **KYC + age verification** — required on virtual gifting (Tier 3); Onfido or equivalent integration; per-market age-of-majority rules; halal-only gifting/predictions for MENA (Tier 4 partnership thesis).
- **MoR (merchant of record) — pluggable third-party adapter pattern.** Radio OS substrate is MoR-agnostic. Per-station configuration selects from a list of supported MoR providers via adapter API (analogous to Shopify's payment gateway model). Substrate normalizes payouts and rev-share calculations across providers.

  **v0.1 supported providers (UK/EU):**
  - **Paddle** — strong default for digital-services subscriptions in UK/EU; handles VAT, chargebacks, FX
  - **Lemon Squeezy** — alternative with similar coverage, simpler integration
  - **Stripe** (with Stripe Atlas / Stripe Tax) — for stations with existing Stripe relationships preferring merchant-of-record control
  - **Adyen** — for larger stations with existing enterprise payment relationships

  **Year 2+:** per-market MoR selection (different provider for MENA than for EU due to FX / Sharia-compliance differences).

  **Implications:** chargeback risk transferred to MoR provider per adapter contract; cross-border VAT handled per-jurisdiction by MoR; KYC/AML handled by MoR; rev-share applied post-MoR-payout. Per-station MoR choice locked in founding-station agreement annex; switching MoR triggers a documented re-onboarding flow but doesn't impact listener identity continuity.

**Broadcast & content:**

- **Rights-by-design music-licensing boundary** — premium archive is rights-free talk content only; music replay permanently out of scope at substrate level (not a configuration choice). Content vault module (Tier 4) enforces this at upload time.
- **Ofcom (UK)** — broadcast standards apply to on-air content; premium-priority enforcement (≤25% premium-attributable reads default per show) creates editorial-integrity audit evidence; per-show editorial-integrity dashboard (Journey 8) provides audit trail.
- **Content liability allocation** — DPA/MSA between Radio OS and station explicitly allocates liability for listener-generated content surfaced on air. Default split: **station owns editorial liability for what their host reads on air; Radio OS owns substrate liability for AI pre-filter false negatives that allowed clearly violating content through.**

**Broadcast rights & royalties (UK):**

- **PRS for Music + PPL** — the rights-by-design boundary primarily prevents exposure (no music replay). However: live broadcast audio persisted in **Member Testimony Spotlight** or **Content Vault** may incidentally include music (background, snippets). Mitigation: **audio fingerprinting on persist** (AcoustID or equivalent) — flag audio segments with >5s of music for review; reject by default unless station has confirmed PRS/PPL coverage. Rights-by-design enforcement extends from "no music replay" to "no music persistence in premium archive without station-licensed coverage."
- **Mechanical / synchronization rights** — per-show jingles, on-air branded music — covered by station's existing PRS/PPL agreements. Out of Radio OS substrate scope.
- **Performer's rights (PPL)** — talk content with guest performers — typically waived contractually by station; out of Radio OS substrate concern.

**Competition / consumer protection (UK):**

- **"Founding pricing for life" claim** — UK CMA scrutiny on perpetual claims. Mitigation: legal review per market on subscription claim language; "for life" softened to *"for the duration of your continuous membership in the founding cohort"* with explicit cessation terms; clear opt-out and price-change notice obligations.
- **Distance Selling Regulations (UK)** — 14-day cooling-off period on subscription. Mitigation: standard pre-built cooling-off flow in cancellation surface.
- **Subscription Ambush legislation (UK CRTPA + EU Modernisation Directive)** — auto-renewal disclosure requirements. Mitigation: substrate-enforced renewal notification 7 days before charge for monthly tiers; 30 days before charge for annual.
- **CMA guidance on dark patterns** — loss-aversion notifications already softened by the adult-voice principle (Marge journey opt-out: status framing rather than gamification language); avoiding manipulative language enforced via copy-string review.

**Tax-law on virtual-gifting rev-share splits:**

- **Sub-gifting and member-sponsored memberships** — VAT treatment: gifter pays the original supply (VAT on Steve's gift action). Rev-share split calculated post-VAT.
- **Host-take split tax treatment** — when station 60 / host 30 / Radio OS 10 applies, host's 30% may need to be treated as employment income (PAYE) or freelance income (self-assessment) depending on host's contractual relationship with the station. Station handles host-side tax compliance; Radio OS provides per-host payout reports for tax filing.
- **Cross-border virtual-gifting (year 2+)** — pluggable MoR provider handles cross-border VAT calculation natively. Radio OS substrate is tax-jurisdiction-agnostic.

**Accessibility (broadcast + digital, UK):**

- **Equality Act 2010 (UK)** — digital accessibility obligations apply to listener-facing surfaces (PWA, registration, payment). Mitigation: **WCAG 2.2 AA** compliance target for v0.1; automated accessibility testing in CI; manual audit before each lighthouse launch.
- **EAA (European Accessibility Act, June 2025)** — applies to digital products in EU; PWA must meet **EN 301 549** (covers WCAG 2.1 AA + cognitive accessibility) by Market #2 launch.
- **Audio description / captioning for Member Testimony Spotlight archive** — when testimonies surface outside live broadcast (archive, replay), captioning required for listeners with hearing impairment. Substrate provides automated transcription (already required for moderation per Journey 10) with manual review for accessibility quality.
- **Color-blind-friendly tier badges** — Gold/Founding/Inner Circle visual differentiation must work for color-blind users (icon + label + color, not color alone).
- **Voice control / screen reader compatibility** — PWA must work with VoiceOver (iOS), TalkBack (Android), JAWS/NVDA (desktop). Intersects with the audio-first / app-optional principle — many listeners are hands-busy and benefit from voice/reader paths.

**Platform & app store:**

- **Apple App Store Review Guideline 4.2.6** — rejects native apps generated from a commercialized template. Mitigation in v0.1: PWA-first + unbranded parent app + station-themed in-app spaces. Year-2 native re-evaluation triggered if Apple changes enforcement. Contingency playbook (Journey 6): PWA-only fallback with pre-drafted listener communication.
- **Google Play** — fewer constraints; per-station native apps possible earlier than iOS in year 2 if economics warrant.

**SMS / telecom:**

- **Per-station SMS short-code provisioning** (Journey 10) — MMA / GSMA registration per market; opt-in/opt-out flow compliance; UK PECR (Privacy and Electronic Communications Regulations); per-market expansion paired with compliance gates.

### Technical Constraints

**Multi-tenant isolation:**

- Per-tenant identity namespace with bridged cross-station portability for opt-in cohorts; **zero cross-tenancy data leakage** under any condition (Schrems-grade isolation per Journey 6).
- Per-station custom domain with SSL automation; cookie scoping per tenant; no cross-tenant cookie leakage.
- Per-tenant audit log routed to station's existing SIEM; immutable audit trail for regulatory inspections.

**Real-time performance:**

- **Live message queue latency** <2s from listener tap to host-visible queue position
- **Producer-mode dashboard latency** <500ms message-receipt-to-display during live show
- **Congregation counter accuracy** within 5% of true concurrent listener count, refreshed every 30s
- **Surge mode** — handle 1000+ messages in 5 minutes without degradation (Journey 5)

**Availability:**

- **Live show SLA** — 99.9% uptime during defined per-station broadcast windows; 99.5% off-air. SLA windows defined per-station (e.g., Marcus 06:00-10:00 GMT weekdays) so a 2-dev team can realistically support them.
- **Broadcast continuity** — show emergency / interruption handling preserves queue state and refunds premium charges automatically (Journey 1).

**Mobile UX (P0 first-class concern):**

- **PWA quality bar = native-mobile-class** — Lighthouse PWA score ≥90; sub-second perceived load on 4G; install-to-home + push (web push on Android; iOS PWA push where available); background audio playback continuity (lock-screen controls, AirPlay/Bluetooth handoff); touch-first ergonomics (one-thumb queue submission); offline-graceful (queued send, cached profile/streak state).

**Brand-leakage prevention (P0 bug class per Edit 13):**

- CI lint package distributed to station deploy pipelines
- Production-side runtime detector monitoring push notifications, emails, SMS, payment receipts, listener-facing strings
- Operational training for support staff (audio/voice surfaces; standard scripts)
- Zero P0 incidents per quarter target

### Integration Requirements

**Station-side integrations:**

- **SSO + email** adapters: SAML 2.0, OAuth2, generic webhook (Journey 6)
- **Existing streaming infrastructure** — broadcast-side telemetry feed for streak detection of phone-only / radio-only listeners (Journey 10)
- **Station's existing SIEM** — audit log routing
- **Station's existing CRM / helpdesk** — Journey 9 implies station tier 1 support has access to a Radio OS-supplied identity-resolution tool, integrated into their existing helpdesk (Zendesk-class)

**Payment & tax integrations (multi-MoR):**

- **MoR adapter pattern with payout normalization across providers** (substrate primitive) — supports Stripe, Adyen, Paddle, Lemon Squeezy in v0.1; extensible to additional providers per-market in year 2
- **Onfido or equivalent** — KYC + age verification on Tier 3 gifting features (independent of MoR provider; substrate-level)

**Telecom integrations:**

- **SMS gateway** — Twilio / MessageBird per market for SMS short-code provisioning, magic-link delivery, voice-memo capture (Journey 10)

**Audio fingerprinting (Tier 4):**

- **AcoustID or equivalent** — music-detection on premium-archive persistence to enforce the rights-by-design boundary; reject default unless station has confirmed PRS/PPL coverage

**Distribution integrations:**

- **Syndicast platform** — case study production workflow, Inside the Radio publishing surface, CAB charter administration, co-marketing rights (Journey 11)

**App stores (year 2+):**

- **Apple App Store Connect** — per-station native app submission flow if Apple 4.2.6 enforcement changes
- **Google Play Console** — per-station native app submission flow

### Risk Mitigations

Linked to material risks already surfaced in Executive Summary + journey failure modes.

**Compliance risk:**

- **GDPR cross-tenancy leakage during portability** → multi-tenant identity bridging pre-tested with synthetic data; kill-switch on bridging if anomaly detected; mandatory legal disclosure flow per incident
- **PSD3 enforcement shifts** → MoR provider absorbs SCA + chargeback handling; quarterly compliance review covers MoR adapter changes
- **App Store 4.2.6 enforcement change** → PWA-only fallback ready; pre-drafted listener communication; per-station deployment continuity unaffected
- **EU AI Act non-compliance on CRM module** → DPIA per market before Module 10 ships; documented training-data provenance; opt-out at listener level
- **PRS/PPL exposure on persisted audio** → AcoustID fingerprinting + reject-by-default + station-confirmed-coverage exception path
- **CMA "founder pricing" challenge** → softened claim language; explicit opt-out; price-change notice obligations
- **Accessibility non-compliance** → WCAG 2.2 AA enforced in CI; pre-launch manual audit; EAA compliance gate on Market #2 launch

**Content/editorial risk:**

- **Premium-priority violation via gaming/flooding** → pacing-projected throttle + per-listener Super Message rate limit per show + coordinated-group detection + T2 escalation (Journey 8)
- **Premium-content moderation false negatives** → AI pre-filter + producer override + tier-strike + ban (Journey 2); live moderation API surface (Journey 5)
- **Editorial integrity erosion** → premium-priority code-enforced teeth (Edit 7) + per-show editorial-integrity dashboard
- **Ofcom investigation** → per-show audit logs preserved; content-moderation audit trail; premium-priority historical compliance evidence

**Identity/privacy risk:**

- **Listener doxxing via on-air nickname** → pseudonym option; substrate-level identity-revoke flow; takedown request handling (substrate cannot retract already-broadcast audio but can revoke the substrate-side identity association)
- **Support staff mishandling PII** → support rep tooling has minimum-necessary-info defaults; GDPR-aligned handling training; audit trail of support-rep data access
- **Multi-tenant identity bridge anomaly** → kill-switch on bridging; mandatory disclosure; per-tenant audit

**Commercial/contract risk:**

- **MoR exposure on chargebacks** → chargeback risk transferred to MoR provider per adapter contract; rev-share applied post-MoR-payout
- **Founding-station concession sets precedent** → walk-criterion (zero-rev-share-with-no-sunset rejected); explicit non-precedent + ratchet clauses per founding agreement (Edit 9)
- **Content liability dispute** → DPA/MSA pre-allocates responsibility; default station owns editorial liability for read-on-air content; Radio OS owns substrate liability for clear pre-filter failures
- **MoR provider goes out of business / changes terms** → multiple MoR providers supported; documented migration runbook; per-station MoR switch with continuity guarantees

**Operational risk:**

- **Coordinated paid-message gaming** → per-listener rate limit + pacing-projected throttle + coordinated-group detection (Journey 8)
- **Brand-leakage through audio/voice surfaces** → support-staff training + script discipline; runtime detector for digital surfaces
- **2-dev team SLA violations** → defined live-show SLA windows per station (not 24/7); on-call rotation; backup producer / AI auto-curation fallback reduces single-producer dependency
- **Show goes off-air** → emergency handling preserves queue + refunds premium charges (Journey 1)

**Distribution/channel risk:**

- **Syndicast divergence (~25% per ES material risks)** → equity + exclusivity formalised pre-prototype; direct-sales playbook from month 12; first non-Syndicast radio as explicit milestone
- **Apple App Store removal** → PWA-only contingency; communication plan ready
- **SSO outage** → email-magic-link fallback; status page; communication flow

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. The Triangle as substrate primitive.** Unified listener identity × premium membership × live participation queue + congregation counter. Each component exists somewhere; the *combination at fidelity for live linear broadcast* doesn't. Novel because no incumbent radio-tech vendor ships any of the three at meaningful fidelity, and no horizontal creator platform has the live + multi-show + station-portfolio shape.

**2. Multi-sided switching costs from substrate convergence.** Edit 1's moat reframing is itself the innovation: host portability + station audience graph + listener identity + compliance-grade payments + white-label substrate (per-station theming + identity namespace) coexisting on a single platform. Migration off = simultaneous data-fidelity loss across all five sides. The substrate IS the moat; novel positioning for B2B media SaaS.

**3. Pacing-projected premium-priority throttle.** Editorial-integrity guardrail that engages on projected end-of-show ratio (not just actual percentage). Surfaced in Journey 8's gaming/surge scenario. Novel in live-broadcast context; closest analog is real-time bidding throttles in ad-tech but applied to editorial integrity, not spend pacing.

**4. SMS-driven broadcast-listener acquisition.** Journey 10's bridge from FM/DAB listeners into substrate identity via SMS short-code + magic-link + voice-memo capture + broadcast-side telemetry for streak detection of phone-only listeners. Existing patterns (SMS keyword campaigns, magic-link auth) are mature; the *combination* with broadcast-side telemetry is novel for the broadcast vertical. Without it, v0.1 conversion math doesn't pencil.

**5. Bottom-up + top-down dual loop as product IP.** Bottom-up host love → top-down station contract is a behavioral discovery, not a marketing line. Designing the product so the dual loop fires *without coercion* (producer-mode → host-direct transition; member context surfaced only on host opt-in; instrumented-not-contractual milestone per Edit 4) is genuinely novel for B2B media.

**6. Silent-majority economics as monetization hypothesis.** Passive listeners (~70% of audience who never type) converting at 2x active rate via passive streak/seasonal accrual. Novel because it inverts the creator-economy default (active-engagement = conversion) for the broadcast medium where most listening is passive/hands-busy. Currently a hypothesis (Edit 2 reframed as load-bearing-not-yet-moat); validation IS the innovation work.

**7. White-label-by-design as structural competitive moat.** Edit 12 explicitly. Listeners never see Radio OS; substrate is a feature surface for stations. Novel positioning for B2B media SaaS as a *structural* moat against consumer-brand competitors who cannot whitelabel without abandoning brand equity.

**8. Pluggable third-party MoR adapter pattern.** Shopify-style architecture for member-economy payments. Substrate is MoR-agnostic; per-station config selects from Paddle / Lemon Squeezy / Stripe / Adyen. Novel for member-economy SaaS — Patreon and Substack are themselves MoR for their creators; Radio OS shifts MoR to specialized third parties. Reduces regulatory burden + chargeback exposure for both Radio OS and stations.

**saas_b2b innovation signals (matching CSV-defined signals):**

- **Workflow automation** — configuration workshop (Journey 7) + white-glove → self-serve transition (deployments 1-5 → 6+) is a substantive workflow innovation. **Reskinnable in 30 seconds** is a workflow primitive that doesn't exist in radio-tech today; closest comparable is Shopify theme customization, but adapted for live-broadcast contexts with rights-by-design / premium-priority / brand-leakage constraints baked in.
- **AI agents** — AI pre-filter for premium-content moderation; AI auto-curation fallback for producer-mode when primary producer unavailable; AI-powered listener-character recognition for member-context surfacing to host. These are **subordinated AI agents** (not the product), which is the right architecture for a media substrate where host editorial sovereignty is non-negotiable.

### Market Context & Competitive Landscape

| Player | Profile | Why Radio OS isn't them |
|---|---|---|
| Patreon | ~$300M ARR, ~250k creators | Single-creator, async, consumer-brand-dependent. Cannot whitelabel without abandoning brand asset that funds business. |
| Substack | Written-content-first, async | Lateral; irrelevant to live broadcast. |
| Twitch | Live, single-creator, gaming-centric | ~1% blended conversion on hyper-engaged audience; no multi-show portfolio or station-portfolio identity. |
| Spotify Live / Open Access | Killed (Live, 2023); artist-side-only (Open Access) | Cannot replicate without consumer-brand incoherence with stations. |
| Triton Digital | ~$300M revenue, ad-tech-led | Streaming + push + ad-tech. No memberships bundle. |
| Jacapps / Futuri | Station app generators + push | White-label-ish but no member economy stack. |
| Mighty Networks | Community + membership platform | Not live; not broadcast-shaped. |
| Discord | Community + limited memberships | Not live broadcast; consumer-brand-dependent. |

**MoR providers** (pluggable substrate dependency, not competitors): Paddle, Lemon Squeezy, Stripe, Adyen — mature in 2026; substrate-level integration is the architecture, not a moat.

**Verdict on novelty:** the bundle is whitespace; the substrate's convergence is novel for broadcast media; the dual loop + silent-majority economics as designed primitives are research-grade discoveries with kill-criteria; SMS-bridge acquisition is novel for the broadcast vertical; pluggable MoR is novel for member-economy SaaS.

### Validation Approach

| # | Innovation | Validation method | Validation timing |
|---|---|---|---|
| 1 | The Triangle | Lighthouse instrumentation + per-station observation | Month 6-9 |
| 2 | Multi-sided switching costs (moat) | First simulated/actual host migration cycle | Year 2 |
| 3 | Pacing-projected premium-priority throttle | Stress-test in deployment 3 (Late Debate-class) + chaos test | Month 4-6 |
| 4 | SMS broadcast acquisition | Lighthouse data: SMS-conversion vs. PWA-only conversion comparison | Month 3-6 |
| 5 | Bottom-up + top-down dual loop firing | Producer-mode → host-direct transition rate per station + on-air conversion line emergence | Month 4-9 |
| 6 | Silent-majority economics | Lighthouse blended conversion vs. kill-criterion (1.2%) | Month 12 |
| 7 | White-label-by-design moat | Brand-leakage zero-incidents + station retention + configuration workflow time | Continuous |
| 8 | Pluggable MoR pattern | Multi-MoR deployment by month 9 (at least 2 different MoR providers in lighthouse cohort) | Month 9 |

### Risk Mitigation (innovation-specific)

- **Silent-majority economics hypothesis fails (20% probability per pre-mortem)** → twin-track planning (Edit 8) absorbs; conservative-case ARR model holds; pricing pivots SaaS-heavy
- **Bottom-up + top-down dual loop doesn't fire (40% probability per pre-mortem)** → producer-mode persists indefinitely; bottom-up love mechanism stalls; renewal economics break. Mitigation: instrumented adoption + coaching escalation + peer-host audio clips (Journey 1)
- **Multi-sided switching costs untested until year 2** → first host migration is the test. If migration too easy: no moat. If too hard: regulatory/contractual risk. Mitigation: 12-month founding contract minimum + tenure-aware listener opt-in default
- **Pacing-projected throttle behaves unexpectedly under live-show pressure** → chaos testing in deployment 3 before locking thresholds; manual override for PD; per-show editorial-integrity dashboard surfaces anomalies
- **SMS broadcast acquisition costs higher than modeled** → cost modeling per-station before lighthouse launch; per-market SMS gateway selection; opt-in-only check-in (HERE), not coercive
- **AI pre-filter false-positive rate too high** → producer override + tier-strike vs. ban graduation; AI training on station-specific corpus over time
- **Pluggable MoR adapter fragility** — different providers have different webhook semantics, payout schedules, refund flows. Mitigation: thin adapter layer; substrate normalizes downstream; one primary provider per station (no provider-mixing within a station)

## SaaS B2B Specific Requirements

### Project-Type Overview

Radio OS is a multi-tenant SaaS platform for radio stations, distributed via Syndicast as primary GTM with direct-sales as defensive milestone. Three distinct user-cohort types per tenant: station administrators (GM/CFO/PD/IT), show operators (host/producer), and listeners. The substrate is white-label-by-design — listeners never see the Radio OS brand. Modular configuration at three altitudes: station-level (theming, modules, MoR), show-level (premium-priority thresholds, tier pricing, format pack), listener-level (preferences, opt-ins). Pricing is hybrid: per-station SaaS-base + per-listener-spend rev-share, with rev-share processed through pluggable third-party MoR providers.

### Tenant Model (Multi-tenancy)

**Multi-tenancy at three levels:**

- **Station tenant** — top-level isolation boundary. Each station gets identity namespace, custom domain, brand-asset set, deployment config, audit log routing, MoR provider selection, and data residency choice.
- **Show tenant** — nested under station; per-show config (format pack, premium-priority threshold, tier pricing, accent override, optional module activation, founding cohort).
- **Listener identity** — scoped per-station with bridged cross-station portability for opt-in cohorts (Edit 6 host portability). Identity bridge is substrate-level; tenant cannot see another tenant's data, only audit events of bridging activity.

**Isolation guarantees (Schrems-grade):**

- Per-tenant database schemas via Postgres RLS (logical isolation in shared cluster for v0.1; physical isolation option for high-compliance tenants in year 2)
- Per-tenant encryption: envelope encryption + per-tenant data keys for v0.1; CMK rotation deferred to year 2 when high-compliance tenants demand it
- Cookie + session scoping per tenant; zero cross-tenant cookie leakage
- Audit log per tenant routed to tenant's existing SIEM
- **Zero cross-tenancy data leakage as P0 invariant — tested per-deploy + nightly via CI; chaos-trigger.** Concrete test apparatus:
  - Synthetic tenant pair: Tenant Alpha (UK, GHR-clone) + Tenant Beta (UK, Capital-clone) with deterministic test data
  - Negative-permission tests: every API endpoint, query, and webhook handler asserts "Alpha actor cannot read/write Beta data"
  - Bridge-leakage test: opt-in cohort migrates Alpha→Beta; verify only opt-in fields cross, not full identity graph
  - Brand-leakage walker: synthetic listener-facing-surface walker crawls every email/push/SMS/receipt/in-app string, asserts "Radio OS" never appears; runs per-deploy + nightly
  - CI gate: any failure blocks merge; alarm on any pass-after-failure

**Tenant lifecycle:**

- **Provisioning** — deployment specialist-facilitated for deployments 1-5; self-serve from deployment 6+
- **Active** — operational with per-tenant SLA (99.9% live show / 99.5% off-air)
- **Suspended** — non-payment or compliance hold; data retained, listener-facing surface paused with branded notice
- **Deactivation** — 60-day notice after minimum term; data export per founding-station agreement; archival access policy for in-flight GDPR portability requests
- **Migration** — tenant data export/import for station group consolidations (e.g., GHR Manchester + Birmingham → GHR Group as single tenant)

### RBAC Matrix (Permission Structure)

| Role | Station Admin | Show Admin | Listener Admin | Compliance/Security |
|---|---|---|---|---|
| **GM (Sandra)** | Full | Full | View | View audit |
| **PD (Tom)** | Edit per-show config | Full per-show | View per-show | None |
| **Producer (Rachel)** | None | Producer-mode dashboard only | View own-show listeners | None |
| **Host (Marcus)** | None | Host-direct queue + member context | View own-show listeners | None |
| **IT Lead (Priya)** | View | View | None | Full (audit log, DPA, brand-leakage CI, SSO config) |
| **Listener** | None | None | Own profile + GDPR portability + cancellation | None |
| **Radio OS T2 support** | View (escalation only) | View (escalation only) | Restricted view per support ticket | Restricted (incident response) |

**Substrate-level enforcement:**

- All permission checks at substrate API layer via single ABAC policy engine (Open Policy Agent or Casbin); ~12 resources × ~5 actions = ~60 policies maintained
- Audit log captures every privileged action with actor + tenant + timestamp + before/after state
- Founding-cohort price-lock substrate-enforced (PD cannot override prior commitments — Journey 8)
- Brand-leakage P0 lint enforced at deploy-pipeline level (no admin can disable)

**UX surface implementation note** (per Sally / round 2 refinement):

The RBAC matrix is the underlying authorization model. UX implementation is **3 admin surfaces + 1 listener surface (the PWA)**, role-aware:

- **Executive dashboard** (Sandra/GM) — ARPU, contract status, MoR-fee summary, deployment health, board-grade reporting
- **Config console** (Tom/PD + Priya/IT + GM) — same shell, three role-aware tabs:
  - **Editorial** (Tom's default) — format pack, premium-priority thresholds, tier names, Member Testimony cadence, founding cohorts, optional-module activation
  - **Security & Integration** (Priya's default) — SSO, brand-leakage CI, identity namespace, audit log routing, MoR provider selection, GDPR portability config
  - **Policy Configuration** (PD/GM secondary tab) — founding-cohort settings (size, lock duration, grace window), subscription gating policy, gift/sponsor rules, streak windows, Super Message limits, micro-fame categories, sonic identity rules, on-air milestone thresholds. Defaults visible; "Customize" affordance for advanced configuration outside defaults but within substrate envelopes.
- **Live operations** (Rachel/producer + Marcus/host) — producer-mode and host-direct mode are the same surface with different visibility, not two products
- **Listener PWA** — consumer surface; never sees Radio OS branding (Edit 13)
- **Radio OS T2 support** — restricted view of Config console + Live operations + audit-log access; not a separate surface

This prevents engineering RBAC matrix from driving 7 separate admin UIs (cost-prohibitive for 2-dev team).

### Subscription Tier Structure

**Two tier structures coexist:**

**Per-station SaaS pricing (B2B contract):**

- Tiered by MAU + member count + active modules
- Founding-station rate locked at 24-month founding-pricing (Edit 9)
- Sunsetted concession path (e.g., 0% rev-share Y1 → 5% Y2 → 10% Y3+)
- **Rev-share floor (5%) calculated on GROSS listener spend, not net-of-MoR-fee.** Aligns interests: station picks MoR for operational fit, not Radio OS-margin arbitrage; Radio OS revenue is independent of station's MoR choice
- Walk-criterion: zero-rev-share-no-sunset deals rejected
- MoR provider fees absorbed by station per founding agreement (negotiable per deal)
- **Commercial integrity:** Radio OS does not earn a referral fee, spiff, or kickback from MoR providers. The MoR recommendation matrix is published per-market and based on operational fit, not referral economics. Documented in founding-station agreement annex

**Per-show listener tiers (B2C member tiers):**

- v0.1: single tier per show (e.g., £4.99 "Inner Circle" or £6.99 "The Floor")
- Founding-200 cohort: locked at discounted rate "for the duration of continuous membership in the founding cohort" (CMA-aligned language)
- Tier 2-3 expansion: multi-tier badge taxonomy (Gold, Founding, etc.); seasonal pass; sub-gifting

**Cross-show pricing flexibility:**

- Same station can run different prices per show (Marcus £4.99, Aisha £6.99)
- Cross-show config conflict validator flags pricing inconsistencies on save (Journey 8)
- Listener with station-portfolio identity sees show-specific tier on each show's surface

### Workflow Automation (saas_b2b CSV signal)

**Deployment workflow primitives:**

- Configuration workshop facilitation framework — **service ops deliverable for v0.1, not engineering.** Adrian/Syndicast facilitates with Notion + checklist for deployments 1-5; productized self-serve framework deferred to v0.x roadmap (deployment 6+ readiness)
- Reskinnable in 30 seconds — sub-30s asset-to-preview latency for live theming preview (engineering surface)
- White-glove → self-serve transition gate at deployment 6
- Syndicast-supplied facilitation pool for deployments 1-5

**Operational workflow primitives:**

- Producer→host-direct handoff workflow with adoption instrumentation
- Lighthouse case study production workflow (Journey 11)
- Host coaching escalation workflow for adoption-rate outliers
- Founding-200 pre-registration drive workflow (host's last 4 weeks before launch)
- Tenant provisioning workflow with identity namespace + data residency choice
- MoR provider switch workflow (re-onboarding without listener identity disruption)

### Subordinated AI Agents (saas_b2b CSV signal)

Architecture principle: **AI is subordinated to editorial sovereignty.** AI agents are tools for hosts/producers/PDs, never the product surface visible to listeners.

**v0.1 AI surfaces:**

- AI pre-filter for listener message moderation (Journey 5) — filters obvious abuse/spam; producer override always possible
- Listener-character recognition for member-context surfacing to host (e.g., "Skeptical Steve — 80-week streak, argued with you 3 times about council tax")

**Tier 2-3 AI surfaces (post-MVP):**

- AI auto-curation fallback for producer-mode when primary producer unavailable (Journey 5)
- AI-suggested archetype tags for ranking listeners by show-fit
- Member Testimony Spotlight quality scoring

**Tier 4 AI surfaces (Module 10):**

- CRM AI segmentation for advertiser intelligence — DPIA per market before ship; opt-out at listener level; documented training-data provenance per EU AI Act

**Architectural constraints:**

- AI must never override host editorial judgment (host editorial sovereignty principle)
- AI false-positive rate on moderation must be lower than producer false-positive rate; if exceeded, AI is throttled
- All AI-driven recommendations surfaced as suggestions, not actions
- Per-tenant AI training opt-in

### Integration List (consolidated reference)

Full detail in Domain-Specific Requirements / Integration Requirements. Summary:

- **Station-side:** SSO (SAML 2.0, OAuth2, generic webhook); email; existing streaming infrastructure for broadcast-side telemetry; SIEM; CRM/helpdesk
- **Payment & tax:** MoR adapter pattern (Stripe / Adyen / Paddle / Lemon Squeezy in v0.1); Onfido or equivalent for KYC + age verification (Tier 3)
- **Telecom:** SMS gateway (Twilio / MessageBird) for SMS short-code provisioning, magic-link delivery, voice-memo capture (Journey 10)
- **Audio fingerprinting:** AcoustID or equivalent for rights-by-design enforcement on premium-archive persistence (Tier 4)
- **Distribution:** Syndicast platform integration for case study production, Inside the Radio publishing, CAB charter administration (Journey 11)
- **App stores (year 2+):** Apple App Store Connect; Google Play Console

### Compliance Requirements (consolidated reference)

Full detail in Domain-Specific Requirements / Compliance & Regulatory. Summary:

- **Data privacy:** GDPR + EU Reg 2025/2518; EU AI Act + GDPR convergence; UK DPA 2018
- **Payments:** PSD2/PSD3; PCI-DSS via MoR; cross-border VAT via MoR; KYC + age verification (Tier 3)
- **Broadcast & content:** rights-by-design (no music replay); Ofcom on-air standards; content liability allocation in DPA/MSA
- **Broadcast rights:** PRS for Music + PPL via AcoustID enforcement (Tier 4)
- **Competition / consumer protection:** UK CMA on subscription claims; Distance Selling Regulations cooling-off; subscription auto-renewal disclosure; CMA dark-patterns guidance
- **Tax-law:** virtual-gifting VAT treatment; host-take tax reporting
- **Accessibility:** Equality Act 2010 + WCAG 2.2 AA; EAA + EN 301 549 (Market #2); audio captioning; color-blind friendly tier badges; screen reader compatibility
- **Platform:** Apple App Store 4.2.6 (PWA mitigation); Google Play
- **Telecom:** SMS short-code provisioning; PECR

### Skipped Sections (per CSV)

- **CLI interface** — Not applicable. Radio OS is a multi-tenant platform with admin consoles, not a CLI tool.
- **Mobile-first architecture** — Listener mobile UX is P0 (per Project Classification), but architecture is PWA-first with year-2 native fallback. "Mobile-first" as primary architectural pattern is misframed; PWA-first with native-mobile-class quality bar is the correct framing for v0.1.

### Implementation Considerations

**Build-vs-buy decision matrix:**

| Surface | Decision | Reasoning |
|---|---|---|
| Identity (auth, multi-tenant identity store) | **BUY** (Auth0 / Clerk / Cognito) | Custom multi-tenant identity = 4-6 weeks solo. Auth0/Clerk multi-tenant = 1-2 weeks integration. Cross-station identity bridging (Edit 6) sits ABOVE the IdP — substrate manages bridging logic; IdP manages identity records |
| Payments (MoR + payment rail) | **BUY** (pluggable adapter pattern: Paddle / Stripe / Lemon Squeezy / Adyen) | Per Shopify-style MoR architectural decision |
| Real-time queue (live message queue, congregation counter, presence) | **BUILD on Pusher / Ably / Liveblocks substrate** | Don't write WebSocket infrastructure from scratch. Pusher's free tier handles v0.1 scale; switch to self-hosted at year-2+ if economics demand |
| CMS / theming engine | **BUILD** | No off-the-shelf multi-tenant white-label theming engine fits per-show config + rights-by-design enforcement + brand-leakage CI; build it |
| Audit log | **BUILD on Postgres for v0.1** | Switch to immutable log (Vector / Datadog) at year-2+ scale |
| Email transactional | **BUY** (Postmark / Resend) | Trivial; substrate sends through provider |
| SMS gateway | **BUY** (Twilio / MessageBird) | Per-market provider choice; Journey 10 short-code provisioning |
| Search / discovery | **BUY when needed** (ElasticSearch / Algolia year-2+) | Postgres full-text for v0.1 |

Identity-as-buy is the biggest call: saves 4-6 weeks of v0.1 engineering and lets the substrate's job become orchestration, not identity primitives.

**Stack-level:**

- Multi-tenant SaaS architecture with logical-isolation databases (Postgres RLS) for v0.1; physical-isolation option for high-compliance tenants in year 2
- Substrate API layer enforcing all permission checks via single ABAC policy engine (OPA or Casbin)
- Pluggable MoR adapter pattern (Shopify-style) with **idempotent payment-state reconciliation independent of webhook delivery; circuit breaker on MoR provider degradation**
- CI lint package for brand-leakage detection distributable to station-side deploy pipelines
- Production-side runtime brand-leakage detector
- **Tenant-wide disaster recovery: RPO 1 hour, RTO 4 hours for v0.1; tightened in year 2 with multi-region failover**
- **Bridge-audit-log retention: 7 years (matches GDPR data-portability audit retention); read-only after write; access scoped to compliance role only; deleted-account propagation triggers audit event in both source and destination tenants**
- Identity provider integration: Auth0 or Clerk (decision in Sprint 0); cross-station bridging logic implemented at substrate level above the IdP

**Operational:**

- 2-developer bootstrapped team, with Syndicast-supplied facilitation pool for deployments 1-5
- Live-show SLA windows defined per-station (not always-on)
- White-glove → self-serve transition operationalized at deployment 6
- T2 escalation path for incidents that exceed station-tier-1 capability
- On-call rotation model defined in NFR57: Syndicast-supplied tier-1 (deployments 1-5) → station-only tier-1 (deployment 6+); Radio OS dev rotation tier-2; escalation paths per incident class

**Performance:**

- Live message queue <2s latency; producer-mode dashboard <500ms; congregation counter ±5% accuracy at 30s refresh; surge mode for 1000+ msgs/5min
- PWA quality bar = native-mobile-class (Lighthouse PWA ≥90; sub-second 4G)

### Runtime Observability

CI testing catches regressions before deploy. Runtime observability catches what CI couldn't anticipate. Both required for P0 invariants.

**Cross-tenancy isolation (production):**

- **Query log with tenant tag** — every Postgres query logged with actor's tenant_id; alert on any query returning rows from tenant_id ≠ actor's tenant_id (impossible if RLS is correct; alert anyway because RLS bugs happen)
- **Bridge audit log streaming** — every cross-tenant bridging event into a read-only audit topic; anomaly detection on volume/frequency
- **Synthetic transaction probes** — negative-permission tests run against PROD as canary tenants every 5 minutes; any pass → page on-call

**Brand-leakage (production):**

- **Outbound payload scanner** — every email/push/SMS/receipt sent through a sidecar that scans for "Radio OS" string; quarantine + alert on hit
- **Listener-facing string change detection** — diff PR strings against prod strings nightly; alert on any new string containing "Radio OS"

**MoR payment state (production):**

- **Idempotent reconciliation job** runs hourly against MoR provider's authoritative API; reconciles substrate's view of payment state; alerts on discrepancies
- **Webhook delivery monitoring** — alert if any MoR provider's webhook stream is silent for >2× expected interval

### v0.1 Ship Cut

To maintain a 2-developer bootstrapped team's capacity through the lighthouse 1 timeline (month 4 deployment), v0.1 ships only what's load-bearing for the first lighthouse station. Multi-X items defer to v0.x with substrate primitives architected in v0.1 so v0.x adds mechanism without re-platforming.

**v0.1 — for first lighthouse station (months 0-4):**

- Substrate: tenancy + Postgres RLS + identity namespace via Auth0/Clerk; ABAC policy engine
- ONE MoR adapter (Paddle as v0.1 default for UK)
- Producer-mode dashboard (host-direct mode architecture-ready, mechanism in v0.2)
- Live message queue + premium priority + congregation counter (Pusher/Ably substrate)
- ONE format pack (Morning Show); other 4 packs deferred to v0.2-v0.3
- ONE listener tier per show
- Brand-leakage CI lint + leakage tests + runtime observability stack
- PWA listener experience (5 surfaces: register, queue submit, Super Message purchase, member dashboard, payment receipt) — single tier per show
- **SMS short-code bridge + magic-link auth + voice-memo capture (Journey 10)** — kept in v0.1 because Journey 10 establishes it as load-bearing for conversion math; lighthouse 1 must validate silent-majority economics across the silent broadcast majority
- Three brandable interfaces: listener PWA, host live dashboard, station/show admin (Executive dashboard + Config console initial cut)
- UK-only payments
- **Configuration workshop facilitation framework: NOT a v0.1 engineering deliverable.** Adrian/Syndicast facilitates with Notion + checklist for deployments 1-5; productized self-serve framework deferred to v0.x

**v0.2 (months 4-7) — for lighthouse 2-3:**

- Host-direct mode operational
- Talk-Debate format pack
- Per-show premium-priority sub-policies (pacing-projected throttle + per-listener Super Message rate limit + consecutive-premium rule)
- Cross-show config conflict validator

**v0.3 (months 7-9) — for scale-to-10:**

- Multi-MoR adapters (Lemon Squeezy + Stripe added)
- Cross-station identity bridging operationalized for first migration test
- Music + Sports + Full Station format packs
- Self-serve admin console (deployment 6+ readiness)
- Productized configuration workshop framework

**v1.0 (months 9-12):**

- Full ABAC RBAC implementation across all surfaces
- Adyen MoR adapter
- AI auto-curation fallback for producer-mode
- Tier 2 features (streaks, status tiers, push notifications, Member Testimony Spotlight, members-set-agenda)

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP approach: revenue-validation MVP**, scoped to validate the load-bearing silent-majority economics hypothesis within month 12 of first lighthouse deployment. Not a problem-solving MVP (brief validated the problem); not an experience MVP (UX is rich enough already); not a platform MVP (substrate is the moat, not the proof point). The single thing the MVP must prove is whether the conversion math pencils.

**Resource requirements:**

- 2-developer bootstrapped team (verified realistic via Sprint 0/1 mapping + scope-creep audit in step 7)
- Syndicast-supplied facilitation pool for deployments 1-5 (white-glove)
- Named commercial owner of the funnel (Adrian/Syndicast or Laszlo)
- 1 lighthouse station signed by month 4; 3 by month 9; 10 by month 12

**MVP success criteria** (from step 3 + step 7 v0.1 cut):

- 10 live deployments by month 12
- 3-5 paid contracts (conservative reframe; bull 7-10)
- Lighthouse blended conversion ≥1.2% by month 12 (kill-criterion)
- 3 published lighthouse case studies with tagline-discipline
- First non-Syndicast direct-sale radio LOI signed (defensive milestone)

### MVP Feature Set (Phase 1 / v0.1)

Already detailed in SaaS B2B Specific Requirements / v0.1 Ship Cut. Restated for completeness.

**Core user journeys supported in v0.1:**

- Marcus (host) — producer-mode → host-direct architecture-ready, mechanism in v0.2
- Skeptical Steve (active listener) — PWA acquisition, Super Message, tier upgrade
- **FM Marge (radio-only) — SMS bridge + PWA-less acquisition** (Journey 10, kept in v0.1)
- Sandra (GM) — Inside the Radio → CAB → founding-station signature → ARPU on P&L
- Rachel (producer) — 90-min training + 4-week dashboard + handoff
- Priya (IT) — pre-deployment configuration + operational ongoing
- Configuration Workshop — **Notion-facilitated, NOT productized** (Adrian/Syndicast service ops)
- Listener support (basic) — Marge-class refund/cancel via station T1 + Radio OS T2 escalation

**Must-have capabilities (v0.1 core):**

- Substrate: tenancy + Postgres RLS + identity namespace via Auth0/Clerk + ABAC policy engine
- ONE MoR adapter (Paddle, UK)
- Producer-mode dashboard
- Live message queue + premium priority + congregation counter (Pusher/Ably)
- ONE format pack (Morning Show); ONE listener tier per show
- PWA listener experience (5 surfaces); SMS short-code bridge + magic-link + voice-memo capture
- Three brandable interfaces (listener PWA, host live dashboard, station/show admin)
- UK-only payments via Paddle MoR
- Brand-leakage CI lint + leakage tests + runtime observability stack
- AI pre-filter for premium-content moderation
- Listener-character recognition for member-context surfacing

**Pre-launch operational requirements:**

- Founding-200 pre-registration drive workflow (host's last 4 weeks before launch)
- 90-min producer training curriculum
- On-air playbook coaching with peer-host audio clips ("your first attempt" support)
- Configuration workshop with Notion + checklist (Adrian/Syndicast facilitates)
- Founding-station agreement signed with annex covering: MoR provider choice, host-portability mechanism, content liability allocation, rev-share floor + walk-criterion + commercial integrity (no MoR referral fees)

### Carried Scoping Commitments — resolved here

| # | Commitment (origin) | Resolution |
|---|---|---|
| **β** | What stays with station on host migration (Sandra/round table) | **Station retains:** base graph (non-host-attributed listeners), advertiser CRM, station-level streaks/seasonal data, SaaS deployment + module configuration, audit log routing, brand asset configuration. **Host can take with explicit listener opt-in:** host-attributed cohort (listeners who joined via host's on-air read), host's queue history visible to host only, host-specific donations history. **Host does NOT take:** payment method records (substrate-bound), subscription history (station-bound for compliance), any tenant-level operational state |
| **Jonas** | Triton bundling defense via CRM ad-lift framing (shark tank) | Module 10 (CRM) ships in Tier 4 (months 8-14), post-MVP. For v0.1, defense is **rhetorical / positioning** in lighthouse case studies + sales materials: "memberships + CRM module that grows ad ARPU 30%+ via behavioral targeting" makes Triton's CPM-reduction comparison apples-to-oranges. Productized arm in v1.0+ |
| **γ** | Multi-tenant identity namespace v0.1 cut (Priya/round table) | Auth0 or Clerk multi-tenant model + substrate-level cross-station bridging logic. Bridging architected v0.1, operationalized v0.3 with first migration test. GDPR data-portability endpoint live v0.1 (per-tenant; no bridging required for portability requests within same tenant) |
| | Unbranded parent app + station-themed in-app spaces (Edit 12 + Domain Reqs) | v0.1 ships PWA-only; native parent app deferred to v1.x year-2 evaluation post-Apple 4.2.6 review |
| **D5** | Per-station broadcast-side telemetry integration scope (Winston/round 2) | Each station's existing streaming infrastructure requires custom integration for streak detection of phone-only listeners. **Scoped at ~1 week engineering per lighthouse station**, included in deployment-specialist white-glove time. Substrate provides standardized adapter interface; per-station glue is custom for v0.1 |
| **D-R2-1** | Day-by-day Sprint 0/1 checklist (Bob/round 2) | Provided in SaaS B2B Specific Requirements / v0.1 Ship Cut narrative. Detailed sprint planning lives in implementation phase (post-PRD), not within the PRD itself |

### Post-MVP Features

**Phase 2 (Growth, months 2-14) — v0.2 + v0.3 + v1.0 + Tier 2-3:**

**v0.2 (months 4-7) — for lighthouse 2-3:**

- Host-direct mode operational
- Talk-Debate format pack
- Per-show premium-priority sub-policies (pacing-projected throttle + per-listener Super Message rate limit + consecutive-premium rule)
- Cross-show config conflict validator
- Tier 2 features begin: streaks with loss aversion, earned status tiers (Gold, Founding, etc., per adult-voice framing — status framing rather than gamification language)

**v0.3 (months 7-9) — for scale-to-10:**

- Multi-MoR adapters (Lemon Squeezy + Stripe added)
- Cross-station identity bridging operationalized for first migration test
- Music + Sports + Full Station format packs
- Self-serve admin console (deployment 6+ readiness)
- Productized configuration workshop framework
- Host-pick push notifications + blurred reveal
- Members-set-agenda for tomorrow's show
- Member Testimony Spotlight (recording + on-air playback)

**v1.0 (months 9-12) — lighthouse 10 + scale:**

- Full ABAC RBAC implementation across all surfaces
- Adyen MoR adapter
- AI auto-curation fallback for producer-mode
- Origin story / lore primitives

**Tier 3 — Revenue features (months 4-8):**

- Micro-tips / cheers (£0.50-£2)
- Seasonal pass (£5-£10)
- Sub gifting + member-sponsored memberships (viral primitive)
- Listener challenges
- **Host portability mechanism operationalized** (12mo founding-contract minimum + listener tenure-aware opt-in default + station-base-graph retention per β resolution above)
- Listener-side positive pull mechanisms (tier-locked benefits, station-portfolio identity, founding-200 originator credit)

**Tier 4 — Moat features (months 8-14):**

- Listener characters & roles ("Skeptical Steve" archetype persistence)
- Show lore + small groups
- Member-curated playlists (artist/Syndicast partnership)
- Prediction championship (sports-talk format-pack revenue)
- **CRM & Advertiser Intelligence module (Module 10)** — closes commercial-narrative differentiator and arms Triton pricing-defense
- Cross-platform identity bridging (where compliance allows)
- Audio fingerprinting on premium-archive persistence (rights-by-design enforcement extension; AcoustID integration)

**Compliance & geographic expansion gates:**

- Market #2 (EU) by month 6 — PSD2/PSD3 + GDPR + EU AI Act DPIA before any Module 10 ship
- Markets #3-#5 (additional EU + first MENA marquee) months 9-18
- MENA Phase-2 marquee — Nile Radio (~49M listeners) demoted from Phase-1 paid-lighthouse but retained for narrative

**Phase 3 (Expansion, year 3+):**

- ~600 radios on Radio OS (~20% Syndicast network)
- Year-5 expansion thesis: talk-podcast networks, sports-talk franchises, college/community broadcasters — addressable on same substrate via module reconfiguration
- Auto-OEM partnerships year 2+: CarPlay / Android Auto / Tesla / Rivian deep integration
- Strategic partnerships: labels/artists via Syndicast; payments + KYC + age-verification + FX deepening; sports prediction / fantasy / regulated betting
- Cultural reframe: radio reframed from "broadcast advertising" to "community economics"
- Substrate ambition: Radio OS as platform for all live-audio member economies
- Per-station native apps year 2+ post-Apple 4.2.6 review
- Physical-isolation database option for high-compliance tenants

### Risk Mitigation Strategy

**Technical risks:**

- **Most challenging:** multi-tenant identity bridging with Schrems-grade isolation + cross-station portability. Mitigation: BUY identity (Auth0/Clerk); BUILD bridging logic at substrate level; concrete CI test apparatus + runtime observability synthetic prod probes
- **Riskiest assumption:** pacing-projected premium-priority throttle behaves correctly under live-show pressure. Mitigation: chaos test in deployment 3 before locking thresholds; manual override; per-show editorial-integrity dashboard
- **Build-vs-buy boundaries:** Identity = BUY; payments = BUY (pluggable); real-time = BUILD on Pusher/Ably; CMS/theming = BUILD; audit log = BUILD on Postgres. Identity-as-buy saves 4-6 weeks of v0.1 engineering

**Market risks:**

- **Biggest market risk:** silent-majority economics hypothesis fails (~20% probability per pre-mortem). Mitigation: twin-track planning; conservative-case ARR model holds; pricing pivots SaaS-heavy with rev-share floor 5% on gross
- **Conversion validation:** lighthouse blended conversion measured by month 6-9; kill-criterion <1.2% by month 12 triggers conservative-case pivot
- **Channel risk:** Syndicast divergence (~25% probability). Mitigation: equity + exclusivity formalised pre-prototype; direct-sales playbook from month 12; first non-Syndicast radio as defensive milestone

**Resource risks:**

- **2-dev bootstrapped team capacity** verified realistic for v0.1 cut. Configuration workshop framework explicitly removed from engineering scope (service ops)
- **Substrate-config investment** ~4-5 weeks of v0.1 capacity is dedicated to substrate configurability primitives (data model + API parameterization + defaults + envelopes + audit) and full subscription-gating substrate (all 4 modes architected and live in v0.1). This is non-negotiable architecturally — retrofitting configurability after listeners exist would require breaking migrations that erode tenant trust and SLA. As a result, some Tier 2 features that round-1 sprint planning had in v0.2 (e.g., Talk-Debate format pack, cross-show config conflict validator) may slip to v0.2 → v0.3 to honor the substrate-config-first investment
- **Bus-factor mitigation:** documented hire/partner plan unlocks each tier; hire #3 (designer/full-stack hybrid) targeted month 9-12 alongside v0.3 ship
- **Founder time allocation:** named commercial owner required (Adrian/Syndicast or Laszlo); without one, founder time fragments across product/design/sales/pilot success
- **Compliance load:** UK-only v0.1 scoping caps regulatory burden; per-quarter market expansion paired with compliance gates; EU AI Act DPIA before Module 10
- **MoR pluggable architecture risk:** different providers have different webhook semantics. Mitigation: thin adapter layer; one primary provider per station; idempotent reconciliation independent of webhook delivery

## Functional Requirements

The capability contract for Radio OS. Anything not listed here will not exist in the final product unless explicitly added. Tier tags indicate ship version: `[v0.1]` ships with first lighthouse (months 0-4); `[v0.2]` for lighthouses 2-3 (months 4-7); `[v0.3]` for scale-to-10 (months 7-9); `[v1.0]` for ongoing (months 9-12); `[Tier 2/3/4]` for post-MVP retention/revenue/moat features; `[Year 2+]` for Phase 3 expansion.

### Tenant & Identity Management

- **FR1** `[v0.1]` Deployment specialist (or self-serve admin from deployment 6+) can provision a new station tenant with identity namespace, custom domain, brand asset set, MoR provider selection, data residency choice, and audit log routing
- **FR2** `[v0.1]` IT Lead can configure SSO + email integration adapters per station tenant
- **FR3** `[v0.1]` Listener can register for a station via station-branded UI (station's domain, station's branding; never sees Radio OS name)
- **FR4** `[v0.1]` Listener can register via SMS short-code by texting JOIN to a station's per-market short-code with their first name; receives a magic-link to complete registration
- **FR5** `[v0.1]` Listener can establish a per-station identity with bridged cross-station portability via opt-in (tenure-aware default) for streak/tier persistence when a host migrates between stations
- **FR6** `[v0.1]` Listener can carry a station-portfolio identity — a single streak that accrues across every show on a station
- **FR7** `[v0.1]` Listener can exercise GDPR data-portability (export) and right-to-be-forgotten (deletion) independent of cancellation
- **FR8** `[v0.1]` System can transition a tenant through lifecycle states (provisioning → active → suspended → deactivation → migration) per defined policy
- **FR9** `[v1.0]` GM can consolidate multiple station tenants into a single parent tenant for station-group P&L
- **FR10** `[v0.1]` IT Lead can configure per-tenant consent banner + data-retention policy (configurable per-market)
- **FR11** `[v0.1]` IT Lead can manage brand asset version control with deployable provenance
- **FR12** `[v0.3]` IT Lead can provision a station tenant without a deployment specialist starting at deployment 6+, via the self-serve admin console activated by the deployment-6 transition gate

### Listener Experience

- **FR13** `[v0.1]` Listener can submit a free message to a show's live queue via PWA during broadcast windows
- **FR14** `[v0.1]` Listener can submit a voice-memo via SMS during broadcast windows; substrate transcribes for moderation and prepares for on-air playback
- **FR15** `[v0.1]` `[configurable]` Listener can purchase a Super Message at a per-show price; receives one free Super Message per week per member. *Configurable per show: free Super Message frequency, paid Super Message price tier(s), per-day Super Message limit.*
- **FR16** `[v0.1]` `[configurable]` Listener can purchase a station-tier subscription at a per-show price; founding-200 cohort members lock in a discounted rate "for the duration of continuous membership in the founding cohort." *Configurable per station: founding cohort size (default 200), founding-pricing lock duration (default 24 months), grace window on lapse (default 30 days), and open/closed cohort window.*
- **FR17** `[v0.1]` `[configurable]` Listener can accumulate a streak via passive listening (PWA detection + broadcast-side telemetry + optional SMS "HERE" check-in) with adult-voice-aligned notifications and an opt-out for loss-aversion copy. *Configurable per station: streak grace window length, daily-credit minimum listening duration, notification phrasing (loss-aversion vs. neutral status).*
- **FR18** `[v0.1]` Listener can view tier badge, streak length, congregation count, and Member Testimony Spotlight archive
- **FR19** `[v0.1]` `[configurable]` Listener can gift a subscription to another listener (recipient receives station-branded invitation). *Configurable per station: gift quantity limits, gift recipient eligibility rules, gifter anonymity options.*
- **FR20** `[v0.1]` `[configurable]` Listener can sponsor a membership for another listener (founding-cohort sponsor visibility preserved). *Configurable per station: sponsorship limits, sponsor visibility options.*
- **FR21** `[Tier 3]` Listener can send a micro-tip / cheer (£0.50-£2) to a host or show
- **FR22** `[v0.1]` Listener can exercise pseudonym option, identity-revoke flow, and takedown request for on-air audio
- **FR23** `[v0.1]` Listener can install a station's PWA to home screen and receive push notifications
- **FR24** `[v0.1]` Listener can hear their gifted Super Message, regular message, or testimony spotlight read on air with name and tier badge surfaced; testimony archive updated
- **FR25** `[v0.1]` Listener can be notified (push/email/SMS) when their content is read on air
- **FR26** `[v0.1]` Listener can purchase a tier upgrade via SMS (text "GOLD" → magic-link → card-entry on first use)
- **FR27** `[v0.1]` Listener can RSVP to a member event and receive attendance confirmation; system tracks attendance
- **FR28** `[v0.1]` Listener can scan an on-air QR code as alternative entry to SMS short-code; lands on station-branded registration with show-context pre-filled
- **FR29** `[v0.1]` Listener can experience streak grace period for connectivity/radio-only failures (skip-day forgiveness within defined window)
- **FR30** `[v0.1]` Listener can access a premium-priority explainer (in-app + Terms of Service + on-air explainer language) clarifying that paying buys higher chance and priority, never a guaranteed read
- **FR31** `[Tier 3]` Listener can purchase a seasonal pass valid for the duration of a defined season; benefits stack with monthly tier
- **FR32** `[Tier 3]` Listener can participate in show-defined challenges (PD-configured; winners surfaced on-air)
- **FR33** `[Tier 4]` Listener can join a small group / community space organized around a show
- **FR34** `[Tier 4]` Listener can curate or contribute to member-curated playlists (artist/Syndicast partnership)
- **FR35** `[Tier 4]` Listener can participate in a prediction championship (sports/format-pack-specific)
- **FR36** `[Tier 4]` Listener can carry a cross-platform identity bridge where compliance allows
- **FR-NEW-A** `[v0.1]` `[configurable]` PD/GM can configure subscription gating policy per show: **open** (any listener subscribes — default for v0.1 to support silent-majority economics validation), **streak-gated** (listener must reach defined streak threshold before subscription is offered), **vouch-gated** (listener must be sponsored by an existing member), or **hybrid** combinations. **Substrate is policy-aware from v0.1 with all four modes architected and live** (data model captures gate-relevant fields including current streak, vouch graph edges, gating-eligibility timestamps; substrate enforces the configured gate at subscription-attempt moment; audit log captures policy in effect at each subscription event). Admin UI for non-default modes ships in v0.x as actual stations request them — but the substrate doesn't change. Gating policy operates independently of founding-cohort window.
- **FR-NEW-B** `[Tier 4]` Listener can view annual identity profile (Spotify-Wrapped-style) with hours-live, messages-sent, predictions-won, streaks-held, on-air-mentions, gifts-given, and member-event-attended counts; substrate generates report at year-end on station-branded surface
- **FR-NEW-C** `[Tier 4]` `[configurable]` Listener can earn micro-fame badges across multiple categories (e.g., top predictor, longest streak, most on-air mentions, biggest gifter, oldest founding member, most testimony reads). *Configurable per show: category set, refresh cadence, public/private visibility.*
- **FR-NEW-D** `[Tier 4]` `[configurable]` Long-tenured members can become sponsors/mentors for new members with tracked relationship; sponsor receives recognition; mentee receives founding-cohort-style onboarding from day one. *Configurable per station: sponsorship eligibility (minimum tenure, status), sponsor-mentee ratio limit, sponsor visibility options.*

### Live Operations

- **FR37** `[v0.1]` Host can operate in producer-mode (curated 3-message strip; producer-managed) — default for first ~4 weeks of any deployment
- **FR38** `[v0.2]` Host can operate in host-direct mode (full ranked queue with member context per message) — opt-in once host is ready
- **FR39** `[v0.1]` Producer can filter live message queue by tier and streak; surface 3 messages at a time to the host's curated strip; access listener-character recognition for member-context surfacing
- **FR40** `[v0.1]` System can transition a host from producer-mode to host-direct mode via a defined handoff workflow with adoption rate instrumented per station
- **FR41** `[v0.1]` Host can read a Super Message on air with listener name and tier badge surfaced; system records the read for premium-priority accounting
- **FR42** `[v0.1]` Producer (or system) can detect and flag premium-priority violations during a live show; producer can override on a per-message basis; PD can review historical evidence in editorial-integrity dashboard
- **FR43** `[v0.1]` System can engage surge mode (auto-batches; tightens AI pre-filter; surfaces tier-priority) when message volume exceeds defined per-show thresholds
- **FR44** `[v0.2]` System can fall back to AI auto-curation of the producer-mode 3-message strip when primary producer is unavailable; same premium-priority enforcement; flagged to PD for editorial review
- **FR45** `[v0.1]` System can pause live queue + congregation counter + auto-refund affected premium charges on broadcast feed interruption (show emergency); resume cleanly with queue intact
- **FR46** `[v0.1]` Host and PD can be notified weekly via host-facing report (reads/hour, premium-attributable read ratio, listener-character suggestions)
- **FR47** `[Tier 2]` `[configurable]` System can deliver host-pick push notifications + blurred reveal to listeners. *Configurable per show: push frequency cap, blurred-reveal duration, pre-show vs. post-show timing.*
- **FR48** `[Tier 2]` Listener (members only) can submit / vote on next-show agenda items via members-set-agenda surface
- **FR-NEW-E** `[Tier 2]` `[configurable]` PD can configure sonic identity per show — distinctive jingle when premium request plays, sound effect when host enters members-only mode, audio signatures marking premium moments. *Configurable per show: sonic-event triggers, audio asset set, member-only-mode signature.*
- **FR-NEW-F** `[Tier 2]` `[configurable]` Host can announce listener milestones on air (streak achievements, founding-cohort recognition, contribution thresholds, anniversary moments); substrate surfaces milestone candidates in producer-mode strip and host-direct queue with appropriate context. *Configurable per show: milestone trigger thresholds, announcement frequency cap.*

### Editorial Integrity & Premium-Priority

- **FR49** `[v0.1]` PD can configure per-show premium-priority threshold (default ≤25%; configurable in [10%, 30%] envelope with explicit confirmation outside)
- **FR50** `[v0.2]` PD can configure per-show premium-priority sub-policies: percentage cap + consecutive-premium rule + pacing-projected throttle + per-listener Super Message rate limit (default ≤2 per listener per show)
- **FR51** `[v0.2]` System can throttle premium queue surfacing when pacing-projected end-of-show ratio breaches threshold; alert PD on actual ratio breach
- **FR52** `[v0.2]` System can detect coordinated-group paid-message gaming via IP-cluster anomaly + paid-message burst pattern; alert mid-show + post-show; escalate to Radio OS T2 if needed
- **FR53** `[v0.1]` PD can record and surface Member Testimony Spotlight at per-show cadence (default monthly; configurable per show)
- **FR54** `[v0.1]` AI can pre-filter listener messages for abuse/spam; producer can override; tier-strike system escalates to ban for repeat violations
- **FR55** `[v0.2]` PD can view per-show editorial-integrity dashboard with historical compliance evidence for Ofcom-grade audits

### Configuration & White-Label

- **FR56** `[v0.1]` Deployment specialist or self-serve admin can configure a new station from a format pack (Morning Show v0.1; Talk-Debate v0.2; Music/Sports/Full Station v0.3); upload brand assets; define custom domain with SSL automation
- **FR57** `[v0.1]` System can render listener-facing PWA preview reflecting all branding/copy/module changes ("reskinnable in the meeting")
- **FR58** `[v0.1]` PD can configure per-show: format pack, optional-module activation, premium-priority thresholds + sub-policies, tier names + copy strings, tier price tier, accent override within station primary brand, Member Testimony cadence, founding-cohort identity, producer-mode duration
- **FR59** `[v0.3]` System can validate cross-show config conflicts (tier-name collisions, module-conflict edges, pricing inconsistencies) at save time
- **FR60** `[v0.1]` System can enforce founding-cohort price-lock at substrate level; PD cannot override prior cohort commitments
- **FR61** `[v0.1]` System can detect Radio OS brand appearing on any listener-facing surface and treat detection as P0 bug class; substrate-enforced. Listener-facing surfaces — registration UI, PWA, push notifications, email, SMS, payment receipts, on-air name reads — carry station's brand only
- **FR62** `[v0.2]` PD can activate optional modules per show independently (e.g., Polls/Voting/Predictions for Talk-Debate but not Morning Show)

### Commercial & Payments

- **FR63** `[v0.1]` `[configurable]` GM can sign a founding-station agreement with annex covering: MoR provider choice, host-portability mechanism, content liability allocation, rev-share floor + walk-criterion + commercial integrity (no MoR referral fees from Radio OS to providers). *Configurable per station: rev-share rate within walk-criterion envelope, founding-pricing lock duration (default 24 months), exclusivity-of-engagement term, host-take split defaults.*
- **FR64** `[v0.1]` System can support pluggable third-party MoR adapters; per-station MoR choice; substrate-normalized payouts and rev-share calculations across providers
- **FR65** `[v0.1]` System can calculate rev-share on gross listener spend (not net-of-MoR-fee); revenue floor + sunsetted concession path documented in founding agreement
- **FR66** `[v0.1]` GM/CFO can view ARPU + member-count + listener-spend reporting at board-grade detail
- **FR67** `[v0.3]` GM/IT Lead can switch a station's MoR provider; system preserves listener identity continuity through the switch
- **FR68** `[v0.1]` System can handle payment chargebacks via MoR provider; tier downgrades gracefully; founding badge preserved; listener notified via station-branded recovery email
- **FR69** `[Tier 3]` System can enforce KYC + age verification (Onfido or equivalent) for Tier 3 virtual gifting features
- **FR70** `[v0.1]` System can integrate VAT calculation per jurisdiction via MoR
- **FR71** `[v0.1]` System can publish a per-market MoR recommendation matrix based on operational fit (no referral economics)
- **FR72** `[v0.1]` Host can view their host-take payout (per agreed split, e.g., station 60 / host 30 / Radio OS 10) per show, per period
- **FR73** `[v0.1]` GM can configure host-take split per show within station (defaults documented in founding-station agreement; per-host overrides supported)

### Compliance & Governance

- **FR74** `[v0.1]` System can route per-tenant audit log to station's existing SIEM with immutable audit trail
- **FR75** `[v0.1]` System can enforce per-tenant data-retention policy (configurable per-market; defaults: payment records 7y, inactive listener identity 3y)
- **FR76** `[v0.1]` System can stream cross-tenant identity bridging events into an audit log with retention-controlled access for compliance role
- **FR77** `[Tier 4]` System can detect music-bearing content in audio at persistence and reject by default unless station has confirmed PRS/PPL coverage
- **FR78** `[v0.1]` System can enforce CMA-aligned subscription claim language; auto-renewal disclosure pre-charge; cooling-off period per Distance Selling Regulations
- **FR79** `[v0.1]` System can satisfy GDPR data-portability requests with cross-tenant compatibility; deleted-account propagation triggers audit event in source and destination tenants
- **FR80** `[Tier 4]` System can document Module 10 CRM AI training-data provenance + per-market DPIA before Module 10 ship
- **FR81** `[Tier 4]` GM/PD can use CRM module to view advertiser-grade behavioral segments (with listener opt-out enforced)
- **FR82** `[v0.1]` GM can elect MoR provider per station; documented in founding-station agreement annex; election locks for the contract term unless explicit re-onboarding

### Support & Operations

- **FR83** `[v0.1]` Listener can contact station tier 1 support via available channels; rep can resolve standard cases (refund, cancellation, tier change, GDPR portability) using identity-resolution tooling with minimum-necessary-info defaults
- **FR84** `[v0.1]` Station tier 1 support can escalate to Radio OS tier 2 (Syndicast-supplied for deployments 1-5; transitions to station-only at deployment 6+)
- **FR85** `[v0.1]` Radio OS tier 2 support can pull audit log access, override per-deployment configuration, and communicate cross-deployment for incident response
- **FR86** `[v0.1]` System can support refund/cancellation flow with substrate-impact rules: streak preservation for 30 days post-cancellation; founding badge preserved as immutable; GDPR-deletion as separate explicit flow
- **FR87** `[v0.1]` Listener can re-activate a cancelled membership within the 30-day recovery window with prior identity preserved
- **FR88** `[v0.1]` Comms lead can run case study production workflow with sign-off chain; tagline-discipline enforcement; press-placement attribution to inbound CAB applications
- **FR89** `[v0.1]` System can host an Inside the Radio publishing surface (long-form articles, case studies, Syndicast network newsletter integration)
- **FR90** `[v0.1]` System can host an inbound CAB application page tied to case-study referrals (form, status tracking, conversion to paid pilot)
- **FR91** `[v0.1]` System can host a webinar + demo flow (registration, scheduling, recording archive)
- **FR92** `[v0.1]` System can administer a CAB charter (membership tracking, monthly working session scheduling, deliverable tracking, founding-lighthouse named recognition)

### Cross-cutting Capabilities

- **FR93** `[v0.1]` System can preserve listener identity across SMS, PWA, and (year 2+) native-app entry points; identity reconciliation when listener moves between channels
- **FR94** `[v0.1]` System can route producer-vs-host editorial disagreements (producer-mode and host-direct mode) to the Programme Director as tiebreaker per the editorial-disagreement protocol
- **FR95** `[v0.1]` System can verify tenant isolation invariants via continuous synthetic transaction probes against production tenants; alert on any negative-permission breach
- **FR96** `[v0.1]` System can provision per-station SMS short-code per market with carrier compliance configuration (UK PECR + per-market regulations; integrated SMS gateway adapter)
- **FR97** `[v0.1]` System can integrate with each station's existing streaming infrastructure for broadcast-side telemetry (streak detection of phone-only listeners) via standardized adapter interface; per-station glue is custom integration
- **FR98** `[Year 2+]` System can integrate with auto OEMs (CarPlay / Android Auto / Tesla / Rivian) for in-car listener experiences
- **FR99** `[v0.1]` PD/GM can configure substantially all behavioral policies per station/show within substrate-defined envelopes (rate limits, time windows, threshold percentages, eligibility rules, frequency caps, copy strings, payment thresholds, gating policies). Defaults are starting points, not constraints. Listener-level overrides bounded by station policy. (Per design principle 11: "Configurability over opinion.")

### v0.1 Cut Summary

Of the 98 FRs:

- **78 tagged `[v0.1]`** — first lighthouse capability contract (months 0-4)
- **8 tagged `[v0.2]`** — host-direct mode + premium-priority sub-policies + AI auto-curation + Talk-Debate format pack + per-show optional modules + editorial-integrity dashboard
- **3 tagged `[v0.3]`** — multi-MoR + cross-station bridging operationalized + cross-show conflict validator + self-serve admin console
- **1 tagged `[v1.0]`** — multi-station tenant consolidation
- **2 tagged `[Tier 2]`** — host-pick push + members-set-agenda
- **3 tagged `[Tier 3]`** — micro-tips + seasonal pass + listener challenges
- **5 tagged `[Tier 4]`** — small groups + member-curated playlists + prediction championship + cross-platform identity + CRM module + AcoustID rights enforcement
- **1 tagged `[Year 2+]`** — auto-OEM integrations (per-station native apps deferred per Apple 4.2.6 contingency without explicit FR)

This FR list is the **capability contract**. Anything not listed will not exist in the final product unless explicitly added.

## Non-Functional Requirements

The quality-attribute contract for Radio OS. Each NFR is testable; test-method or attestation source noted per item. Tier tags `[v0.1] / [v0.2] / ... / [Year 2+]` indicate when the threshold must be met; `[ongoing]` for continuous obligations.

### Performance

- **NFR1** `[v0.1]` Live message queue latency: <2s P95 from listener tap to host-visible queue position. *Verified by: load test in staging with k6/Artillery at synthetic 50k+ concurrent.*
- **NFR2** `[v0.1]` Producer-mode dashboard latency: <500ms P95 message-receipt-to-display during live show. *Verified by: load test + production telemetry.*
- **NFR3** `[v0.1]` Congregation counter accuracy: within 5% of true concurrent listener count; refreshed every 30s. *Verified by: synthetic listener-presence test against known counts.*
- **NFR4** `[v0.1]` Multi-tenant theming preview: <30s asset-to-listener-facing-preview latency ("reskinnable in the meeting"). *Verified by: standardized 2MB asset bundle test in staging on every theming-engine change.*
- **NFR5** `[v0.1]` Surge mode capacity: handle 1000+ messages in 5 minutes per show without queue degradation; auto-batches at threshold; tier-priority surfacing preserved. *Verified by: k6/Artillery surge load test in staging.*
- **NFR6** `[v0.1]` PWA quality: Lighthouse PWA score ≥90 across iOS Safari + Android Chrome (latest two majors); sub-second perceived load on 4G; FCP <1.8s; LCP <2.5s on 4G. *Verified by: Lighthouse CI on every release.*
- **NFR7** `[v0.1]` SMS keyword response time: <5s P95 for system to respond to JOIN/HERE/GOLD/TELL short-code keywords. *Verified by: synthetic SMS round-trip test.*
- **NFR8** `[v0.1]` SMS magic-link round-trip: <30s P95 from listener SMS submission to magic-link delivery. *Verified by: vendor (Twilio) attestation + production telemetry.*
- **NFR9** `[v0.1]` PWA install success rate: ≥90% across iOS Safari + Android Chrome. *Verified by: production analytics (install attempts vs. successes).*
- **NFR10** `[v0.1]` Time-to-first-message: <30s P50 from listener registration completion to message in queue. *Verified by: production funnel analytics.*

### Security

- **NFR11** `[v0.1]` Per-tenant data isolation via defense-in-depth: (1) row-level enforcement at the data layer, (2) tenant-scoped data-layer connection pools (each session sets tenant_id as session variable), (3) substrate API enforces tenant_id from auth context (not from request body), (4) per-query tenant-tag with mismatch alerts, (5) per-tenant audit log of every privileged action. Zero cross-tenancy data leakage as P0 invariant. *Verified by: per-deploy + nightly synthetic-tenant-pair tests in CI; chaos-trigger weekly; production query-tag mismatch monitoring.*
- **NFR12** `[v0.1]` Per-tenant encryption: envelope encryption + per-tenant data keys for v0.1; per-tenant CMK rotation deferred to year 2 for high-compliance tenants. *Verified by: vendor attestation + key rotation runbook.*
- **NFR13** `[v0.1]` Cookie + session scoping per tenant; no cross-tenant cookie leakage at runtime. *Verified by: synthetic-tenant-pair cross-domain tests in CI.*
- **NFR14** `[v0.1]` PCI-DSS compliance via MoR provider (Radio OS substrate does not store card data in v0.1). *Verified by: MoR provider attestation (Paddle / Stripe / Lemon Squeezy / Adyen).*
- **NFR15** `[v0.1]` PSD2/PSD3 Strong Customer Authentication enforced via MoR provider. *Verified by: MoR provider attestation.*
- **NFR16** `[v0.1]` GDPR Reg 2025/2518 compliance: per-tenant consent banner; data-portability endpoint; right-to-be-forgotten flow; audit log per tenant. *Verified by: legal/compliance review pre-launch + GDPR DPIA documented.*
- **NFR17** `[Tier 4]` EU AI Act compliance: documented training-data provenance + per-market DPIA before any AI-driven listener segmentation (Module 10 gate). *Verified by: DPIA artifact per market.*
- **NFR18** `[v0.1]` UK DPA 2018 + post-Brexit divergence documented in DPA/MSA. *Verified by: legal review + signed DPA template.*
- **NFR19** `[ongoing]` Brand-leakage: zero customer-reported brand-leakage incidents per quarter. (Internal detections via CI/runtime are the system working as designed, not incidents.) Multi-layered detection: CI lint at build time + runtime detector at deploy time + production payload scanner sidecar. *Verified by: incident reports (customer-reported) + production scanner alerts (internal detections, separate metric).*
- **NFR20** `[v0.1]` Audit log integrity: immutable per-tenant audit trail routed to station's existing SIEM. *Verified by: SIEM integration acceptance test + manual write-then-modify test.*
- **NFR21** `[v0.1]` Bridge-audit-log retention: 7 years (matches GDPR data-portability audit retention); read-only after write; access scoped to compliance role only. *Verified by: retention test (write event, attempt modification at +1day, +30day; verify rejected).*
- **NFR22** `[v0.1]` Cookie consent + UK PECR specifics: cookies categorized (strictly necessary / functional / analytics / marketing); granular opt-in per category; refusal-as-easy-as-acceptance (single-click reject all). *Verified by: ICO PECR self-assessment + manual review.*
- **NFR23** `[v0.1]` MFA enforced for all admin-tier access (GM, PD, IT Lead, Radio OS T2 support). *Verified by: identity provider (Auth0/Clerk) MFA configuration + access audit.*

### Scalability

- **NFR24** `[v0.1 → v1.0]` Tenant scale: ~10 stations by month 12; ~200 stations conservative-case / ~600 stations bull-case by month 36. *Verified by: production tenant count + load tests at each milestone.*
- **NFR25** `[v0.1 → v1.0]` Listener scale: ~12M paid users + ~6M unpaid (bull) or ~2M paid + ~5M unpaid (conservative) by month 36. *Verified by: production listener count + analytics.*
- **NFR26** `[v0.1]` Concurrent listener support per show: 250k weekly listeners per Marcus-class show; congregation counter accurate within 5% at this scale. *Verified by: synthetic load test at 50k concurrent (peak proxy).*
- **NFR27** `[v0.1]` Real-time substrate must sustain 50k+ concurrent connections at morning-show peak with paid-tier vendor SLA (~$500-1500/month budget envelope). Free-tier offerings insufficient at v0.1 scale. *Verified by: vendor SLA review + production capacity planning.*
- **NFR28** `[v1.0]` Multi-MoR adapter scale: 4 providers (Paddle, Stripe, Lemon Squeezy, Adyen) supported in production by v1.0; pluggable architecture supports additional providers in year 2+. *Verified by: each MoR adapter passes integration test suite.*
- **NFR29** `[v0.1 → year 2+]` Multi-region scale: UK-only v0.1; per-quarter market expansion paired with compliance gates; Phase 3 multi-region failover for high-compliance tenants. *Verified by: market-launch checklist gate.*
- **NFR30** `[v0.1]` Data layer scale: logical-isolation cluster supports up to ~100 station tenants in v0.1; physical-isolation option for high-compliance tenants in year 2. *Verified by: load test + capacity plan.*

### Accessibility

- **NFR31** `[v0.1]` WCAG 2.2 AA compliance for all listener-facing surfaces (PWA, registration, payment, in-app explainer); satisfies UK Equality Act 2010 obligations. *Verified by: axe-core in CI + manual audit before each lighthouse launch.*
- **NFR32** `[v0.2]` EAA (European Accessibility Act, June 2025): EN 301 549 compliance by Market #2 launch (covers WCAG 2.1 AA + cognitive accessibility). *Verified by: EAA conformance audit pre-Market-#2 launch.*
- **NFR33** `[v0.1]` Audio captioning: Member Testimony Spotlight archive includes automated transcription (AssemblyAI or equivalent) + manual review before public surface. *Verified by: vendor-transcript review + accessibility QA pre-publish.*
- **NFR34** `[v0.1]` Color-blind friendly tier badges: tier differentiation works via icon + label + color (not color alone). *Verified by: design review + Stark/Sim Daltonism test.*
- **NFR35** `[v0.1]` Screen reader compatibility: PWA works with VoiceOver (iOS), TalkBack (Android), JAWS/NVDA (desktop). *Verified by: manual screen-reader audit on actual devices pre-launch.*
- **NFR36** `[v0.1]` Voice-control compatibility: PWA primary actions (queue submit, tier upgrade, gift) accessible via in-app voice-to-text using browser SpeechRecognition API. (Deep iOS Siri Shortcut / Android Assistant integration deferred to year 2+.) *Verified by: manual voice-input test on iOS Safari + Android Chrome.*

### Reliability

- **NFR37** `[v0.1]` Live show SLA: 99.9% uptime during defined per-station broadcast windows (e.g., Morning Show 06:00-10:00 GMT weekdays); 99.5% off-air. *Verified by: production uptime monitoring + monthly SLA report.*
- **NFR38** `[v0.1]` Broadcast continuity: show emergency / interruption handling preserves queue state; auto-refunds premium charges for affected show; clean resumption with queue intact. *Verified by: chaos test simulating broadcast feed loss in staging.*
- **NFR39** `[v0.1]` MoR webhook resilience: idempotent reconciliation job runs hourly against MoR provider's authoritative API independent of webhook delivery; circuit breaker on MoR provider degradation; alert if webhook stream silent for >2× expected interval. *Verified by: chaos test simulating webhook stream failure in staging.*
- **NFR40** `[v0.1]` Disaster recovery: tenant-wide RPO 1 hour, RTO 4 hours via managed data layer with point-in-time recovery enabled + pre-prepared DR runbook. Tightened in year 2 with multi-region failover. *Verified by: quarterly DR drill against production-shape staging.*
- **NFR41** `[v0.1]` SSO outage degradation: graceful fallback to email-magic-link auth; status page; communication flow per tenant. *Verified by: chaos test simulating SSO provider outage.*
- **NFR42** `[v0.1]` App Store 4.2.6 contingency: PWA-only fallback playbook ready; pre-drafted listener communication; per-station deployment continuity if Apple removes parent app. *Verified by: tabletop exercise with Adrian/Syndicast pre-launch.*

### Integration

- **NFR43** `[v0.1]` SSO + email integration adapters: SAML 2.0, OAuth2, generic webhook per station tenant. *Verified by: integration test suite per adapter.*
- **NFR44** `[v0.1]` Existing streaming infrastructure adapter: per-station custom integration for broadcast-side telemetry; ~1 week engineering per lighthouse station; standardized adapter interface. *Verified by: adapter interface contract test + per-deployment acceptance test.*
- **NFR45** `[v0.1]` Helpdesk integration: support rep identity-resolution tooling integrated into station's existing helpdesk (Zendesk-class). *Verified by: integration test per helpdesk vendor.*
- **NFR46** `[v0.1]` Pluggable MoR adapters: thin adapter layer with normalized payouts and rev-share calculation across providers. *Verified by: adapter contract tests + reconciliation tests.*
- **NFR47** `[v0.1]` SMS gateway integration: Twilio / MessageBird per market for short-code provisioning, magic-link delivery, voice-memo capture. *Verified by: vendor integration tests.*
- **NFR48** `[Tier 3]` KYC/age-verification: Onfido or equivalent for Tier 3 virtual gifting features. *Verified by: vendor integration test pre-Tier-3-launch.*
- **NFR49** `[v0.1]` Tax engine: VAT calculation per jurisdiction handled by MoR provider (substrate-jurisdiction-agnostic). *Verified by: MoR provider attestation + tax-invoice review.*
- **NFR50** `[Tier 4]` Audio fingerprinting: AcoustID or equivalent for premium-archive rights-by-design enforcement. *Verified by: synthetic music-bearing audio test pre-Tier-4-launch.*
- **NFR51** `[v0.1]` Syndicast platform integration: case study production workflow + Inside the Radio publishing + CAB charter administration. *Verified by: end-to-end workflow test with Syndicast.*

### Observability

- **NFR52** `[v0.1]` Production cross-tenancy isolation observability: query log with tenant tag; alert on any query returning rows from tenant_id ≠ actor's tenant_id; bridge audit log streaming with anomaly detection on volume/frequency. *Verified by: synthetic-tenant-pair production probes + alert-on-mismatch wiring.*
- **NFR53** `[v0.1]` Production brand-leakage observability: outbound payload scanner sidecar checks every email/push/SMS/receipt for "Radio OS" string; quarantine + alert on hit; listener-facing string change detection diff against prod nightly. *Verified by: synthetic Radio-OS-string injection test in staging.*
- **NFR54** `[v0.1]` Synthetic transaction probes: continuous probe cadence (≤60s timer-based + smart sampling on every Nth production request); page on-call on any negative-permission breach. *Verified by: PagerDuty-tier alert routing test.*
- **NFR55** `[v0.1]` Test cadence for P0 invariants: per-deploy + nightly via CI for cross-tenancy isolation, brand-leakage, premium-priority enforcement; chaos-trigger weekly. *Verified by: CI run history + chaos test reports.*
- **NFR56** `[v0.2]` Per-show editorial-integrity dashboard: real-time premium-attributable read ratio + historical compliance evidence accessible to PD; Ofcom-grade audit trail. (v0.1 ships raw SQL access via audit log.) *Verified by: dashboard E2E test + Ofcom-grade audit walkthrough.*
- **NFR57** `[v0.1]` On-call rotation: T1 station-side (handles standard incidents) + T2 Radio OS-side (Syndicast-supplied for deployments 1-5; transitions to station-only at deployment 6+); escalation paths defined per incident class. *Verified by: PagerDuty configuration + tabletop exercise.*

### Compliance (cross-cutting)

- **NFR58** `[v0.1]` Cooling-off period per UK Distance Selling Regulations: 14 days from subscription start. *Verified by: subscription-flow test + regulatory review.*
- **NFR59** `[v0.1]` Subscription auto-renewal disclosure: 7 days before monthly charge / 30 days before annual charge; CMA-aligned subscription claim language ("for the duration of continuous membership in the founding cohort"; not "for life"). *Verified by: notification-flow test + CMA-language legal review.*
- **NFR60** `[v0.1]` Per-tenant data-retention policy: payment records 7 years default; inactive listener identity 3 years default; configurable per-market. *Verified by: retention configuration audit + compliance review.*
- **NFR61** `[v0.1 → year 2+]` Cross-border VAT and FX: handled per-jurisdiction by MoR provider; per-market expansion paired with compliance review. *Verified by: MoR provider tax-jurisdiction matrix + compliance review per new market.*
- **NFR62** `[Tier 4]` PRS for Music + PPL coverage: AcoustID fingerprinting on premium-archive persistence rejects music-bearing audio segments unless station has confirmed PRS/PPL coverage. *Verified by: synthetic music-bearing audio rejection test pre-Tier-4-launch.*
- **NFR63** `[v0.1]` GDPR Article 28 data processor agreements: DPA template covering Radio OS as data processor for stations + all sub-processors (MoR, SMS gateway, audio fingerprinting, KYC, AI services); signed per founding-station agreement. *Verified by: signed DPA review + sub-processor list audit per onboarding.*
- **NFR64** `[ongoing]` Quarterly vendor risk assessment: documented review of all material third parties (MoR providers, SMS gateways, KYC, audio fingerprinting, AI services); remediation tracked. *Verified by: quarterly assessment artifact + remediation log.*
- **NFR65** `[ongoing]` GDPR breach notification SLA: 72 hours to ICO; ~30 days to affected listeners; pre-prepared notification templates per breach class. *Verified by: tabletop exercise + template availability.*
- **NFR66** `[Year 2]` SOC 2 Type 1 attestation: targeted by year 2 to satisfy enterprise station requirements. *Verified by: external SOC 2 auditor attestation.*
