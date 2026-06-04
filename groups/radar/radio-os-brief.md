---
title: "Product Brief: radioos"
status: "complete"
created: "2026-04-25"
updated: "2026-04-25"
inputs:
  - _bmad-output/brainstorming/brainstorming-session-2026-04-07-0900.md
  - _bmad-output/brainstorming/miro-import-modules.csv
  - _bmad-output/brainstorming/miro-import-ideas.csv
  - _bmad-output/brainstorming/miro-import-design-principles.csv
---

# Product Brief: Radio OS

## Executive Summary

Radio OS is a white-label, modular SaaS platform that lets radio stations and individual shows monetize their listeners through engagement instead of ad inventory. Stations buy the modules they need — premium memberships, live participation, gifting, content vault, streaks, community, commerce, CRM/advertiser intelligence — and configure them under one brandable design system. Across all of it, a listener has a single unified identity, so a fan signs up once and can engage and pay both the station and any show inside it.

The opportunity is structural and timed. Broadcast ad revenue is in long-term decline while the creator economy has proven listeners will pay for direct relationships with the personalities they love. No incumbent radio-tech vendor (Triton, Jacapps, Futuri) ships a memberships-and-gifting-and-CRM bundle, and horizontal creator stacks (Patreon, Substack) aren't built for live linear broadcasters with multiple shows under one brand. Radio OS is the first vertical, broadcast-native engagement platform — and it ships as a product of Syndicast, the music-distribution marketplace that already connects ~2,600 radios to artists and labels. That existing distribution, trust, and commercial relationship is the moat: Radio OS isn't a cold-call vendor, it's an extension of an infrastructure radios already pay attention to.

The first 12 months target 10 paying radios. The 36-month target is ~600 radios (≈20% of the Syndicast network), an addressable listener base of ~600M, and ~12M paid users converting at 2% — implying ~€60M of monthly listener spend and roughly €72M ARR from rev-share alone, on top of base SaaS.

## The Problem

Radio's most valuable asset — live, synchronized attention from millions of listeners — is monetized only through advertising, and advertising is structurally shrinking. Stations are told by their own trade press to diversify, but they have no platform to do it with. Their app vendors sell streaming and push notifications. Their ad-tech vendors sell more spots. Patreon-style tools assume a solo creator, not a portfolio of shows under a shared brand with shared listeners.

The cost of the status quo is twofold. Stations watch listener relationships flow to platforms (Spotify, Patreon, podcasts) that capture the revenue and own the data. And hosts — who already build the parasocial bond that drives the medium — are stuck with calls, texts, and an inbox, "remembering 15 regulars instead of 500." MENA flagships like Nile Radio (≈49M listeners) run utility-grade apps with no monetization layer at all. The audience is paying somebody — just not the radio.

## The Solution

Radio OS gives every radio three brandable interfaces and ten modules, configured per station and per show:

1. **Listener experience** — audio-first companion across phone, web, CarPlay/Android Auto, smart speakers. Async messaging, premium membership, streaks, virtual gifts during live shows, content vault, polls, community.
2. **Host live dashboard** — single screen during the show. Member context auto-surfaced, ranked message queue with priority signals, congregation counter, on-air conversion playbook.
3. **Station / show admin** — modular pricing, white-label configuration, design-system theming, CRM and advertiser intelligence built on listener behavior.

The architectural spine is the **Host-Listener-Community Triangle**: the host recognizes members on air, the community witnesses and validates, and the listener's identity accumulates across all three edges so leaving feels like abandoning part of oneself. Three design choices make this work:

- **Async send / audio receive** — listeners type messages on a screen, the host reads them on air. This solves the "80% of listeners are hands-busy" problem and keeps the host's voice as the participation surface.
- **Conversion happens on air, not in the app** — every premium interaction the host performs becomes a live conversion ad heard by every free listener. The show is the marketing funnel; CAC trends to zero.
- **The silent majority is the real TAM** — ~70% of listeners will never type a message, but their streaks and seasonal progress accrue passively just by listening. Most engagement platforms only convert the loud 5%; Radio OS is engineered to convert the quiet bulk at 2x the rate of active members. This is the structural reason the 2% paid-conversion target is achievable at radio scale, not creator scale.

A signature mechanic exemplifying the model is **Member Testimony Spotlight** — the highest-rated single concept in the brainstorm — where members share short audio testimonies during the show, the community sends micro-tips that compound on screen, and the host reads the totals on air. One feature simultaneously drives conversion (emotional proof for free listeners), retention (the member's identity is woven into the show), revenue (micro-tips and rev-share), and PR (charity-style totals are press-ready).

Ten **design principles (R1–R10)** govern feature decisions, derived by inverting common failure modes — for example: "premium is higher priority, never guarantee" (so hosts retain creative control), "rights-by-design" (premium archive is talk content, not music replay), "identity-as-moderation" (persistent identity + status tiers replace traditional moderation), and "between-show valley must not go to zero" (small groups, agenda-setting, lore prevent ghost-town apps).

## What Makes This Different

- **Syndicast as a three-sided network, not just a channel.** Syndicast already runs a two-sided marketplace connecting ~2,600 radios to artists and labels, with active commercial flow (campaign fees, paid music distribution). Radio OS adds the third side — listeners — and turns that two-sided network into a compounding three-sided one: each new radio strengthens artist-side intelligence (which songs trigger streak spikes, which talk segments drive cheers), each artist activation gives radios a new direct-to-superfan moment, and each new listener grows both. Patreon cannot replicate the radio-side distribution; Triton cannot pivot from advertiser-side to listener-side overnight; horizontal creator stacks have no marketplace at all. Radio OS sells into a relationship, not into a cold inbox.
- **Vertical broadcast-native vs. horizontal creator stack.** Multi-show portfolio under shared listener identity, station CRM, advertiser intel, live-radio mechanics (queued on-air messaging, congregation counter, host live dashboard). Patreon and Substack are creator-singular and on-demand.
- **Whitespace inside the radio-tech stack.** Triton/Jacapps/Futuri ship ad-tech and app shells. None ship the memberships + gifting + CRM bundle. Triton's own 2026 thesis is "identity-powered" — but on the advertiser side. The listener-side identity layer is uncontested.
- **Bottom-up host-led adoption + top-down GM signing.** The host gets superpowers first ("remember 500 regulars, not 15") and pulls the GM in. The contract is signed by the station; the love starts with the host.
- **Built from a sharpened design manifesto.** R1–R10 were derived by inverting failure modes — the differentiation is operationalized, not aspirational.
- **Re-rating the unit economics of a radio station.** Radio OS quietly converts "audience" (a falling CPM ad asset) into "membership" (a recurring ARPU asset). For the station GM and CFO, that is not a SaaS purchase — it is a re-rating of the show's economic unit.
- **Community Economics, with the host as community lead.** The deeper thesis underneath the Triangle is that Radio OS makes a radio show feel like a community — the host leads it, members give it identity, and the show becomes the moment that community gathers. People don't churn from communities they belong to; they churn from products they subscribe to. Radio OS is engineered for the first.
- **Listener identity is station-bound, not host-portable.** When a host moves stations, the audience graph stays with the station. This strengthens the station's appetite to invest, anchors the contract, and keeps the moat on the buyer side — even though the bottom-up love starts with the host.

## Who This Serves

**Buyers (B2B):**
- **Station GM / Programme Director** — wants modular pricing, brandable look-and-feel, advertiser intelligence, low integration cost, fast time-to-revenue.
- **Show host (in larger stations: also a buyer)** — can buy directly for their show under the station's umbrella.

**End users (B2C, served via the station's brand):**
- **The host on-air** — single live dashboard, member context auto-surfaced, ranked queue, on-air conversion cues. Effortless one-screen UX.
- **The engaged listener / superfan** — wants recognition, status, and a way to participate beyond a phone-in. Pays for priority queue, premium content vault, virtual gifts, season pass.
- **The "silent majority" listener** (~70%) — will never type a message, but accumulates streaks and seasonal progress just by listening; converts to passive premium at 2x rate.

**Format ICPs (initial wedge):** personality-led morning shows, talk/debate radio, sports radio, youth music brands.

## Success Criteria

**Prototype (next 4–8 weeks):** Three or four demoable interfaces (listener, host live, station admin, optionally show admin), powered by mock-but-adaptive configuration, on a brandable design system. Goal: Syndicast and partner radios can see exactly what the system would do at scale, configure modules in front of the radio, and re-skin the look-and-feel live in a meeting.

**12-month commercial:** 10 paying radios live; at least one lighthouse with strong member retention (>60% 30-day) and observed on-air conversion behavior.

**36-month commercial (target / scenario, not forecast):** ~600 radios (≈20% of the Syndicast network), avg 1–2M listeners per station → ~600M addressable listener base. 2% paid conversion → ~12M paid users. €5 average monthly spend → ~€60M monthly listener GMV → ~€6M monthly rev-share at 10% commission (~€72M ARR), on top of base SaaS. The model is heavily sensitive to **conversion rate, blended ARPU across regions, and station rev-share negotiation** — base/bull/bear ranges and per-region ARPU weighting are tracked separately as a working financial model.

## Scope (MVP — "Radio OS Live Club")

**In for v0.1 (intentionally minimal, demoable single-show wedge):**
- Listener identity (registration, profile)
- One premium membership tier
- Live message queue (async send, host reads on air)
- Premium priority flag on the queue
- Congregation counter (live audience scale signal)
- Three brandable interfaces with mock-adaptive configuration
- **Producer-mode as the launch default for the host live dashboard** — operated by the producer/board op for the first 4 weeks of any deployment, with the host seeing only a curated 3-message strip. Host-direct mode is the destination; producer-mode de-risks the on-air cognitive load until the host opts in.

**Explicitly out for v0.1:**
- Live commerce / merch / virtual gifting payments
- Content Vault publishing pipeline
- CRM & Advertiser Intelligence module
- Full Streaks & Status engine and Seasonal Engine
- Music-replay archive (rights-by-design: never)
- Cross-platform identity rollout to CarPlay / smart speaker (deferred)

## Roadmap Thinking (post-prototype)

- **Tier 1, M1–M2 — Prove the Triangle.** Async queue + audio read, listener profiles visible to host, premium priority queue, congregation counter, passive-listening = participation.
- **Tier 2, M2–M4 — Retention.** Streaks with loss aversion, on-air premium playbook, earned status tiers, host-pick push notifications, blurred reveal, members-set-agenda.
- **Tier 3, M4–M8 — Revenue.** Super Messages (£1–£3), micro-tips/cheers (£0.50–£2), seasonal pass (£5–£10), **Member Testimony Spotlight with community micro-tips** (highest-rated single idea in the brainstorm), sub gifting, listener challenges.
- **Tier 4, M8–M14 — Moat.** Listener characters & roles, show lore, small groups, member-curated playlists, prediction championship, unified cross-platform identity, member-intelligence network.

## Geographic Sequencing & Customer Advisory Board

**Sequence.** UK first (Syndicast HQ) → broader EU → US as soon as feasible. The first 10 paid radios are explicitly anchored in UK + 1–2 EU markets where Syndicast has commercial muscle and a shared regulatory regime. **Nile Radio is repositioned as a Phase-2 marquee (M9–M14)** — kept in the CAB and the narrative for category definition in MENA, but not relied on for the year-1 commercial lighthouse, where Arabic RTL, FX controls, MENA payment rails, and lower ARPU would overwhelm a 2-developer team.

**CAB structure.** Recruitment runs through Syndicast's existing **"Inside the Radio"** blog series, which is already inviting stations into the conversation. The CAB is a designed, time-boxed commitment — not an unpaid focus group: ~6 founding stations, 90-day initial term, monthly working session, founding-member pricing locked for 24 months, named "lighthouse" rights. Full CAB charter is held in the working detail pack alongside this brief.

**Standard founding-station agreement.** A base 12-month founding-station contract template (SaaS base + rev-share + co-marketing rights + founding-pricing-for-life clause + host-take split) anchors the first 10 deals. The template is **modular by design** — module mix, pricing, and rev-share splits are configurable per radio inside a defined envelope, so the standard form prevents bespoke renegotiation without forcing one-size pricing.

## Compliance & Regulatory (must-design-for, not afterthoughts)

- **EU GDPR Reg 2025/2518** (in force Jan 2026) tightens cross-border CRM enforcement → consent, DPA, and data-residency tooling shipped from day one.
- **EU AI Act + GDPR convergence** → documented training-data provenance for any AI-driven listener segmentation in the CRM module.
- **Cross-border listener payments + virtual gifting** → PSD2/PSD3 in EU, VAT-on-digital-services, KYC, age-verification on tipping; MENA adds FX controls and content-licensing nuances. Payments architecture and entity structure are non-trivial.

## Team & Funding

Co-founded by Laszlo with a partner developer and the Syndicast team as co-founding partners. Bootstrapped. The founding team brings the marketplace channel (Syndicast), product/design leadership (Laszlo), and technical execution (paired developer) — a small team built to ship the prototype fast and validate with real radios before committing platform-scale capital.

**Syndicast partnership formalised before prototype demo.** Because the moat thesis depends on Syndicast as channel and as the third-side network, the GTM and equity relationship is contractually locked in advance — multi-year exclusive go-to-market rights inside the Syndicast network plus a named co-founding stake — rather than handled as a downstream conversation. This converts "Syndicast as single point of failure" from an unacknowledged risk into a structurally integrated co-founder relationship.

## Key Assumptions & Open Questions

The brief is honest about being pre-validation. The load-bearing assumptions to test against the first lighthouse stations and CAB:

- **Listener conversion rate** — 2% blended paid conversion across radio audiences (vs. <0.5% Patreon benchmark for many creators). Tested by passive-streak conversion in the first 90 days.
- **Blended ARPU across regions** — €5/month average across UK/EU/MENA/US. MENA ARPU realistically lower; weighting depends on geographic mix and pace.
- **Station appetite for SaaS + 10% rev-share** — radios historically resist sharing audience monetization. First-pilot pricing must hold without setting permanent precedents.
- **Host-led adoption survives the live show** — host time-on-screen during a live broadcast is precious. Producer-mode and on-air playbook coaching mitigate; ultimately tested in the lighthouse.
- **Listener cold-start** — premium queue, congregation counter, gifting need a critical mass on day one. Pre-launch enrollment via station-side audience tools is the gating activity.
- **Syndicast channel exclusivity and longevity** — formalising the GTM relationship into a durable contract is a precondition for the moat thesis.
- **Compliance scoping** — UK-first payments and CRM for v0.1 keeps EU GDPR Reg 2025/2518, AI Act provenance, MENA FX/licensing, and US PSD-equivalents from collapsing into the same release. Each new market is a roadmap-gating constraint.

## Vision

In 3 years, Radio OS is the default white-label engagement OS for global radio: the stack a station picks when it decides its listeners are a community to invest in, not an audience to advertise at. Combined with Syndicast's music marketplace, it becomes the operating layer that links artists, radios, hosts, and listeners into one commercial ecosystem — and captures a meaningful share of the creator-economy spillover that broadcasters have so far been locked out of.

The category Radio OS opens — community economics for live audio, with a host as community lead — is intentionally radio-first, but the same architecture has clear adjacent upside in other live-audio communities (talk-led podcast networks, sports talk franchises, college and community broadcasters). These are deliberately out of scope for the first three years; they become the second act once the radio category is owned.
