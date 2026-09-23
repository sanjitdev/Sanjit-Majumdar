# The Pattern Library

## Five Engineering Patterns I Reach For

This portfolio isn't organized around jobs. It's organized around *patterns* — the small number of moves I keep making across different projects, in different stacks, for different clients. Jobs are one-off; patterns travel.

The metaphor is a chess opening book. Each opening has a name, a board position it applies to, a sequence of moves in order, and a set of prepared responses when the opponent plays counter-lines. A recruiter scanning this sees engineering judgment — the meta-skill a Tech Lead exercises *across* projects, not the surface of any one of them.

What follows are the five I reach for most. Each one is grounded in real work at Brain Station 23 PLC, real numbers from the CV, and real situations I've stood in. They're written in the format: *when this applies → the moves → counter-lines → annotation*.

---

## Pattern 1 — The Canonical Model Pattern

*How to integrate many transactional platforms through one canonical system — without writing N unmaintainable adapters.*

### When this applies

You're connecting N external systems (e-commerce platforms, ERPs, payment gateways, CRMs) where each speaks its own dialect, and there's exactly one source of truth inside your boundary. The naive path is to write N×(N−1) adapters. That dies in eighteen months.

### The five moves

**1. Define the canonical model first, in language the business already uses.** Don't pick platform field names. Pick the nouns and verbs from the client's operation — *Order*, *LineItem*, *InventoryLevel*, *Settlement*. The platform's odd vocabulary becomes a translation problem at the edge, not the core. If your model needs three meetings to explain, it's wrong.

**2. Build the canonical store before you build the first adapter.** A single SQL Server schema (or equivalent) owns the model. Every other system reads and writes through it. This is the move that makes the system maintainable: when a new platform joins, you write one inbound mapper and one outbound mapper, never an N×N mesh.

**3. Make every adapter dumb, observable, and reversible.** Adapters translate; they don't decide. A failed adapter run logs the exact payload, retries with backoff, and on hard failure writes to a dead-letter table a human can replay. Reversibility means: any adapter change is rollback-safe inside one deploy.

**4. Version the model explicitly.** Bump a version column whenever the canonical shape changes. Old platform payloads keep flowing through the old mapping path until they're caught up. New platforms land on the new shape. This is how you avoid the "big-bang migration" trap.

**5. Treat platform-specific quirks as a quarantine, not the architecture.** Shopify's inventory model is different from nopCommerce's; that's real, and it's why the adapter exists. Don't let platform quirks leak into the core model under the excuse of "feature parity." Feature parity lives at the translation layer; the canonical model stays clean.

### Counter-lines

- **Two more platforms are joining in three months and the deadline can't move.** *Response:* Add them through adapters, not by reshaping the canonical model. The model is a contract — every new platform pays the adapter tax so the core doesn't bend. If the deadline *cannot* accommodate the adapter work, the model isn't the thing to compromise.
- **A platform team wants to write directly to our database "to skip the adapter."** *Response:* Hard no. Direct writes skip the dead-letter, the audit trail, and the version translator — the three things that let you sleep at night. Refuse the shortcut, build the adapter, charge the time.
- **Two systems disagree on the meaning of "Order" — both are authoritative in their domain.** *Response:* The canonical model resolves the disagreement. Pick one definition. Map the other in. Document the asymmetry. The whole point of the pattern is that *we* own the meaning of "Order," not the platforms.
- **Leadership asks why we can't just sync database-to-database.** *Response:* Because then every schema change in every platform becomes our outage. Adapters with dead-letter queues are the price of decoupled evolution. Show them the incident it would cause.

### Annotation

This is the pattern that lets one team sustain many platform integrations without drowning. At Brain Station 23, I've applied it across 5+ e-commerce platforms — nopCommerce, Shopify, and others — with a shared canonical store underneath. The custom nopCommerce plugins and the Shopify plugin for product image and inventory management both plug into the same model, not into each other. That's why ten-plus plugins and a Shopify integration coexist without becoming a hairball. The pattern works because the adapters are cheap to add and the core stays honest.

---

## Pattern 2 — The Syncfusion Data-Grid Performance Pattern

*How to ship a complex data-heavy Angular UI at 10K+ users without the grid becoming the bottleneck.*

### When this applies

You're building an enterprise Angular UI with a third-party data grid (Syncfusion, AG Grid, Kendo, DevExtreme) pulling large datasets, complex filtering, virtualization, inline editing, and grouping — and the grid has become the page's slowest frame. The default config will not save you.

### The five moves

**1. Establish a perf baseline before touching the grid.** Record LCP, TTI, and per-frame render times on the slowest realistic dataset *before* any optimization. Without a baseline, "I made it faster" is a story, not a result. The 35%/25% numbers in my CV exist because the baseline was measured first.

**2. Push the grid to server-side everything — paging, sorting, filtering, grouping.** Client-side mode is a demo mode. At 10K+ users and non-trivial data volumes, every operation that can happen on SQL Server *should* happen on SQL Server, with the grid receiving only the current viewport. Add covering indexes for the common query shapes before you optimize anything else.

**3. Virtualize rows and columns; freeze the headers and the action column.** The grid only renders what's on screen. Frozen columns prevent horizontal scroll-induced reflow. Frozen headers prevent the "where am I?" disorientation that makes users scroll back to the top. These three settings together usually pay for the rest of the work.

**4. Debounce user input, batch state updates, and isolate the grid in its own OnPush change-detection boundary.** The grid re-rendering on every keystroke is the single most common cause of "the grid feels laggy." Inputs debounce at 150–250ms; state updates batch; the grid component runs OnPush so it only redraws when its inputs change. Memory drops, jank drops, users stop complaining.

**5. Profile with real devices and throttled networks, not just Chrome on a dev machine.** The Norwegian client's users were on mid-range hardware and varying network conditions. Real-device profiling in DevTools' throttling mode catches what local development won't — that's where the second 10% of perf wins live.

### Counter-lines

- **"The grid handles 10K rows fine out of the box — why are we rewriting this?"** *Response:* Because out-of-the-box, it's loading 10K rows into the DOM and re-rendering on every change-detection cycle. The grid handles the *count*; it doesn't handle the *cost*. Show them the flame chart.
- **"Can we add five more columns of inline editing?"** *Response:* Yes, with a cost. Each editable column adds change-detection work proportional to row count. We can add them, but we should add them inside the OnPush boundary, debounce the input, and accept that some columns belong in a side panel rather than the grid.
- **"The client wants Excel-style copy-paste and column reorder."** *Response:* Both are fine; both have costs. Enable paste with explicit batch mode so we don't trigger N API calls per paste. Reorder is cheap — that's a free win.
- **"The perf budget says we have to hit LCP under 2.5s on a 4G phone in Oslo."** *Response:* Then we ship the first 30 rows eager-loaded and virtualize the rest, plus we cache the first page in a service worker. The grid itself isn't the bottleneck; the *initial payload* is.

### Annotation

This pattern is why the Norwegian client app supports 10,000+ active users with complex, data-heavy Syncfusion interfaces without the UI buckling. The combination of server-side operations, virtualization, OnPush change detection, and measured baselines produced the 35% response-time gain and 25% memory reduction reported on the CV. The pattern works because every move is concrete and verifiable: a profiler before, a profiler after, and a delta that survives scrutiny.

---

## Pattern 3 — The nopCommerce Plugin Pattern

*How to extend a third-party commerce platform without forking it.*

### When this applies

You're customizing a third-party commerce platform (nopCommerce, Shopify, Magento, WooCommerce) for a client's workflow, and the customization keeps growing. The temptation is to fork the core. The reality is that every fork is a debt you pay forever.

### The five moves

**1. Read the platform's extension API thoroughly before designing the plugin shape.** nopCommerce has a specific plugin contract — dependency injection lifetimes, route registration, event subscription patterns, view component conventions. Designing against the actual contract, not a guess, is the move that determines whether the plugin upgrades cleanly.

**2. Keep the plugin single-purpose and named after the workflow it serves.** One plugin = one workflow ("SettlementExport," "InventorySync," "InvoiceBranding"). Multi-purpose plugins become untestable and unmaintainable. The plugin name should read like a noun phrase a non-developer could find in a feature list.

**3. Push all business logic into injected services, not into controllers or view components.** The plugin's controllers stay thin; the service layer holds the rules. This is what makes the plugin testable in isolation and replaceable when the workflow changes. It's also what lets the same plugin survive a platform upgrade.

**4. Subscribe to platform events; don't poll, don't scrape.** nopCommerce publishes events on order placed, payment captured, inventory changed. Subscribe to them. The plugin reacts, not initiates. This keeps the plugin out of the critical path and makes it idempotent under retry.

**5. Ship the plugin with a settings UI and a sandbox-mode flag.** The settings UI is the plugin's contract with the operator. The sandbox-mode flag is the contract with the test team — every action logs but doesn't fire, so QA can verify behavior without side effects.

### Counter-lines

- **"The client wants this feature in the core platform instead."** *Response:* Sure — if they own the core. We don't. The plugin keeps the upgrade path open; core modifications close it. The cost of the upgrade-path loss will arrive eighteen months later when the security patch can't apply.
- **"Can we just edit the platform source — it's faster?"** *Response:* Faster today, slower forever. The edit survives one upgrade and then blocks every subsequent one. The plugin is the same effort today and pays back on upgrade day one.
- **"The plugin needs to read data the public API doesn't expose."** *Response:* Then we use the platform's internal services via DI, not direct DB access. The DB access path breaks on schema change; the service path is the supported contract.
- **"The plugin's settings page is too technical for the client."** *Response:* Build a friendly wrapper. The settings *engine* stays technical; the settings *UI* stays human. We split them in the architecture from the start.

### Annotation

Ten-plus custom nopCommerce plugins delivered at Brain Station 23, plus the Shopify plugin for product image and inventory workflows. None of them required a fork. None of them broke a platform upgrade. The pattern works because the plugin contract is honored from move one, and because the same shape applies whether the platform is nopCommerce, Shopify, or whatever comes next.

---

## Pattern 4 — The Ship-Faster Pushback Pattern

*How to delay a release for quality without becoming the bottleneck.*

### When this applies

A PM, a stakeholder, or a sales conversation is pushing to ship before the engineering team is confident. The argument is usually framed as a binary: ship now, or miss the window. The real answer is neither — and the pattern is how to land that answer without becoming the person who always says no.

### The five moves

**1. Lead with data, never with opinion.** Pull the test report, the coverage number, the open-bug count, the last-release incident rate. Put it on one screen. The argument is now about numbers, not about you versus them. This is the move that determines whether the conversation is technical or political.

**2. Name the cost of shipping weak explicitly.** "Shipping this means a 40%-higher incident probability over the next quarter." Stakeholders accept risk when the risk is named; they fight you when the risk is hidden. Make it visible.

**3. Propose the smallest delay that resolves the gap.** Not "we need more time." A specific number of days tied to a specific test pass. Four days to reach coverage. Three days to clear the regression queue. Concrete delays get concrete responses.

**4. Frame the delay as customer protection, not engineering preference.** "We cannot ship a weak and faulty product" is a customer-first statement, not an internal one. It moves the conversation from "engineers are slow" to "engineers are protecting the customer." That's a frame PMs and stakeholders can defend upward.

**5. Track the outcome and surface it later.** If the delay reduced incidents, that fact goes into the next release retrospective, the next quarterly review, the next hire conversation. Pushback without follow-up looks like obstruction. Pushback *with* follow-up becomes the team's standard.

### Counter-lines

- **"The client is threatening to walk if we don't ship Friday."** *Response:* Then we show them the same data we'd show our PM — coverage, open defects, the cost of the last rushed release. Walking is a threat; churn from a faulty release is a fact. The conversation has to use the same evidence regardless of audience.
- **"Engineering always says 'we need more time.'"** *Response:* Engineering always says "we need *this* time, for *this* reason, with *this* expected outcome." The pattern isn't "delay"; it's "delays with receipts." If we can't produce receipts, the delay is wrong.
- **"We've already committed to the date publicly."** *Response:* Then we either accelerate scope-cut (remove features, not tests) or we accept the public commitment costs more than the date. The conversation is about trade-offs, not willpower.
- **"The team is just burned out and looking for excuses."** *Response:* Burnout is real, but it's diagnosed by velocity trends, not by this one release. If the velocity is fine, the data wins. If the velocity is dropping, the fix isn't "ship faster" — it's recovery. Different conversation.

### Annotation

This is the most consequential pattern in the library because it's the one that determines whether the other four even get practiced. At Brain Station 23, when test coverage dropped below 60% mid-release, I pulled the report, walked the PM through it, and argued for a four-day delay. The exact line, in my own words:

> *"I showed him the data, told him this doesn't look optimal enough to be shipped — it needs to pass all tests to be able to be shipped. We cannot ship a weak and faulty product."*

Production incident rate fell 40% over the next quarter. The pattern works because it converts a friction moment into a standards moment — and it leaves a trail of evidence that earns the next pushback.

---

## Pattern 5 — The Friday Architecture Review Pattern

*How to own technical decision-making across a 7-person team without becoming a bottleneck, the gatekeeper, or the bottleneck again.*

### When this applies

You're leading a team that's grown past the point where every decision can pass through you. If you review every PR, you're a bottleneck. If you delegate everything, you lose the thread. The pattern is how to stay the architect without becoming the single point of failure.

### The five moves

**1. Block a fixed weekly slot for architecture review — Friday afternoon, end of week.** Predictability is the move. The team knows when decisions land; you know when to prepare. Friday works because the week has produced the decisions; Monday would be too early.

**2. Bring three artifacts to the review, not zero and not twenty.** The week's PRs that touched shared code, the week's design proposals, and a one-paragraph state-of-the-system note. Three artifacts is the amount you can defend in 60 minutes.

**3. Decide in the room; document the decision in the room.** A decision that isn't written down is a decision that didn't happen. The review produces a one-line ADR (Architecture Decision Record) for every call: *what* was decided, *why*, and *what changes if we're wrong*. ADRs go into the repo; the team can re-read them Monday.

**4. Delegate the reversible; own the irreversible.** Reverts are cheap; rewrites are not. Junior engineers ship reversible decisions under senior review. You own the migrations, the contract changes, the security boundaries. The split is explicit, not implicit.

**5. Mentor in the review, not before it.** Don't pre-coach every PR. Let juniors bring their work, give the feedback live (or async the day before), and use the Friday slot to walk through patterns — not to gate individual changes. Mentoring in the review scales; mentoring one-on-one before every PR doesn't.

### Counter-lines

- **"Can we move the architecture review to Tuesday?"** *Response:* Friday works because the week has accumulated. Tuesday is too close to the last review; the team will re-litigate last week. Pick a day and keep it.
- **"The team is blocked waiting for your review."** *Response:* Then the queue is the signal. Either the team needs more delegation authority, or the review needs to be async for the reversible calls. The bottleneck is information, not me.
- **"Shouldn't the seniors own architecture too?"** *Response:* Yes — they're owners of the patterns, not just the calls. The Friday review is where we calibrate those patterns together. The seniors don't wait for me; they bring proposals to the room.
- **"This is just a status meeting with extra steps."** *Response:* Status meetings are status; architecture reviews produce decisions written to disk. If we're leaving the room without ADRs, we're doing the wrong meeting. Cancel and restart.

### Annotation

This pattern is how "led a 7-member cross-functional team (4 engineers + 3 QA), managing delivery through Azure Boards and enforcing high code quality via reviews and mentoring" actually worked day-to-day at Brain Station 23. The pattern works because it converts leadership from a gate into a cadence — the team knows when the decisions land, the decisions are written down, and the reversible work moves without waiting on the leader.

---

## Closing

The case studies on this site will cite which patterns they exercise. The Lab tools will cite which patterns they extend. This library is the *meta-skill* — it's what a Tech Lead does *across* projects, not just within them. Read it once, and you'll see the same five moves showing up in different shapes everywhere on the rest of the site.
