/* ═══════════════════════════════════════════════════════════════════
   RegScope Demo — Pipeline C: Search (demo only, no backend)
   ═══════════════════════════════════════════════════════════════════ */

const SearchPipeline = (() => {

  const STAGES = ["INTERPRET", "SEARCH", "FETCH", "DECODE", "DEEP DIVE", "BRIEFING"];

  let log = null;
  let selectedId = null;
  let isRunning = false;

  function init() { renderInputArea(); }

  function renderInputArea() {
    const area = document.getElementById("search-input-area");
    area.innerHTML = `
      <p class="input-label">ASK A POLICY QUESTION</p>
      <div class="question-cards" id="search-cards"></div>
      <div id="search-deploy-wrap"></div>`;
    loadDemoCards();
  }

  const DEMO_QUESTIONS = [
    { id: "bycatch", question: "What are the EU obligations for reducing bycatch in Mediterranean fisheries?", domain: "FISHERIES & MARINE" },
    { id: "ai_hiring", question: "Can EU employers legally use AI to screen job applicants?", domain: "DIGITAL & EMPLOYMENT" },
    { id: "green_transition", question: "How does the EU plan to ensure the green transition doesn\u2019t increase energy poverty?", domain: "CLIMATE & SOCIAL POLICY" }
  ];

  function loadDemoCards() {
    const container = document.getElementById("search-cards");
    container.innerHTML = DEMO_QUESTIONS.map(q => `
      <button class="question-card" data-id="${q.id}">
        <span class="question-card__domain">${q.domain}</span>
        <span class="question-card__text">${q.question}</span>
      </button>
    `).join("");
    container.querySelectorAll(".question-card").forEach(card => {
      card.addEventListener("click", () => { if (!isRunning) selectCard(card.dataset.id); });
    });
  }

  function selectCard(id) {
    selectedId = id;
    document.querySelectorAll("#search-cards .question-card").forEach(c => {
      c.classList.toggle("question-card--selected", c.dataset.id === id);
    });
    const wrap = document.getElementById("search-deploy-wrap");
    wrap.innerHTML = `<button class="deploy-btn" id="search-deploy-btn">DEPLOY AGENT</button>`;
    document.getElementById("search-deploy-btn").addEventListener("click", () => runDemo(id));
    resetWorkspace();
  }

  function resetWorkspace() {
    document.getElementById("search-workspace").style.display = "none";
    document.getElementById("search-empty").style.display = "block";
    document.getElementById("search-results").innerHTML = "";
    if (log) log.clear();
  }

  async function runDemo(qId) {
    isRunning = true;
    disableCards(true);
    hideDeployBtn();

    document.getElementById("search-workspace").style.display = "flex";
    document.getElementById("search-empty").style.display = "none";

    const logPanel = document.getElementById("search-log-panel");
    log = AgentLog.create(logPanel, STAGES);
    log.start();

    const resultsEl = document.getElementById("search-results");
    resultsEl.innerHTML = "";

    const demo = DEMO_DATA.search.find(d => d.id === qId);
    const data = demo.preloaded;
    const question = demo.question;

    // ── INIT ──
    log.addEntry("REGSCOPE AGENT INITIALISED", "system");
    await AgentLog.sleep(300);
    log.addEntry(`Query: "${question}"`, "query");
    await AgentLog.sleep(500);

    // ── Stage 0: INTERPRET ──
    log.setStage(0);
    log.addEntry("\u2500\u2500 STAGE 1: INTERPRET \u2500\u2500", "stage");
    log.addEntry("Parsing question intent...", "thinking");
    await AgentLog.delay(500, 300);
    log.addEntry(`Domain: ${data.interpret.domain}`, "info");
    await AgentLog.delay(300, 200);
    log.addEntry(`Key concepts: ${data.interpret.keyConcepts.join(", ")}`, "info");
    await AgentLog.delay(300, 200);
    log.addEntry("Interpretation complete.", "success");
    resultsEl.innerHTML += renderInterpret(data.interpret);
    await AgentLog.sleep(400);

    // ── Stage 1: SEARCH ──
    log.setStage(1);
    log.addEntry("\u2500\u2500 STAGE 2: SEARCH \u2500\u2500", "stage");
    log.addEntry("Searching EU regulatory corpus...", "thinking");
    await AgentLog.delay(600, 400);
    log.addEntry(`Found ${data.search.length} relevant instruments`, "info");
    await AgentLog.delay(300, 200);
    data.search.forEach(r => {
      log.addEntry(`  \u2022 ${r.title.substring(0, 60)}...`, "info");
    });
    await AgentLog.delay(400, 200);
    log.addEntry("Regulatory search complete.", "success");
    resultsEl.innerHTML += renderSearch(data.search);
    await AgentLog.sleep(400);

    // ── Stage 2: FETCH ──
    log.setStage(2);
    log.addEntry("\u2500\u2500 STAGE 3: FETCH \u2500\u2500", "stage");
    log.addEntry("Retrieving regulation texts from EUR-Lex...", "thinking");
    for (const r of data.search.slice(0, 5)) {
      await AgentLog.delay(400, 300);
      log.addEntry(`  Fetched: ${r.title.substring(0, 50)}...`, "info");
    }
    await AgentLog.delay(300, 200);
    log.addEntry("All texts retrieved.", "success");
    await AgentLog.sleep(400);

    // ── Stage 3: DECODE ──
    log.setStage(3);
    log.addEntry("\u2500\u2500 STAGE 4: DECODE \u2500\u2500", "stage");
    log.addEntry("Analysing each regulation...", "thinking");
    await AgentLog.delay(800, 500);
    data.decode.forEach(r => {
      log.addEntry(`  Decoded: ${r.regulation}`, "info");
    });
    await AgentLog.delay(400, 200);
    log.addEntry("Regulation analysis complete.", "success");
    resultsEl.innerHTML += renderDecode(data.decode);
    await AgentLog.sleep(400);

    // ── Stage 4: DEEP DIVE ──
    log.setStage(4);
    log.addEntry("\u2500\u2500 STAGE 5: DEEP DIVE \u2500\u2500", "stage");
    log.addEntry("Cross-referencing regulations...", "thinking");
    await AgentLog.delay(600, 400);
    log.addEntry("Mapping regulatory interactions...", "thinking");
    await AgentLog.delay(400, 200);
    log.addEntry("Identifying coverage gaps...", "thinking");
    await AgentLog.delay(400, 200);
    log.addEntry("Building stakeholder map...", "thinking");
    await AgentLog.delay(300, 200);
    log.addEntry("Deep-dive analysis complete.", "success");
    resultsEl.innerHTML += renderInteractions(data.deepDive.interactions);
    resultsEl.innerHTML += renderGaps(data.deepDive.gaps);
    resultsEl.innerHTML += renderStakeholders(data.deepDive.stakeholders);
    await AgentLog.sleep(400);

    // ── Stage 5: BRIEFING ──
    log.setStage(5);
    log.addEntry("\u2500\u2500 STAGE 6: BRIEFING \u2500\u2500", "stage");
    log.addEntry("Composing executive briefing...", "thinking");
    await AgentLog.delay(600, 400);
    log.addEntry("SEARCH COMPLETE", "system");
    resultsEl.innerHTML += renderBriefing(data.briefing);

    log.stop();
    isRunning = false;
    disableCards(false);
  }

  // ── Renderers ─────────────────────────────────────────────────

  function renderInterpret(d) {
    return Components.panel("INTERPRETATION", "01", "#5AC8FA",
      Components.row("DOMAIN", d.domain) +
      Components.row("KEY CONCEPTS", Components.tags(d.keyConcepts)) +
      Components.row("STRATEGY", d.searchStrategy)
    );
  }

  function renderSearch(docs) {
    const list = docs.map(d => `
      <div class="search-item" style="padding:10px 0;border-bottom:1px solid var(--border-dim)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div>
            <div style="font-size:11px;font-weight:700;color:var(--text);line-height:1.5">${d.title}</div>
            ${d.celex ? `<div style="font-size:9px;color:var(--text-ghost);margin-top:2px">CELEX: ${d.celex}</div>` : ""}
          </div>
          ${d.relevance ? Components.badge(d.relevance, d.relevance === "HIGH" ? "high" : d.relevance === "MEDIUM" ? "medium" : "low") : ""}
        </div>
        <div style="font-size:10px;color:var(--text-dim);line-height:1.6;margin-top:4px">${d.snippet || d.reason || ""}</div>
      </div>
    `).join("");
    return Components.panel("REGULATORY SEARCH", "02", "#34C759", list);
  }

  function renderDecode(regs) {
    const cards = regs.map(r => {
      const body = Components.row("REGULATION", r.regulation || r.title) +
        (r.celex ? Components.row("CELEX", r.celex) : "") +
        Components.row("WHO", Components.tags(r.who || [])) +
        Components.row("WHAT", r.what || "") +
        Components.row("KEY OBLIGATIONS", (r.keyObligations || []).map(o => `<div style="margin:3px 0;font-size:10px;color:var(--text-muted)">\u2022 ${o}</div>`).join(""));
      return `<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border-dim)">${body}</div>`;
    }).join("");
    return Components.panel("REGULATORY DECODE", "03", "#AF52DE", cards);
  }

  function renderInteractions(items) {
    const cards = (items || []).map(i => `
      <div class="analysis-block">
        <div class="stakeholder__top"><span style="font-size:12px;font-weight:700;color:var(--text)">${i.title || i.type || ""}</span></div>
        <div class="analysis-block__text">${i.detail || i.description || ""}</div>
      </div>`).join("");
    return Components.panel("REGULATORY INTERACTIONS", "04a", "#FF9500", cards);
  }

  function renderGaps(items) {
    const cards = (items || []).map(g => `
      <div class="analysis-block">
        <div class="stakeholder__top"><span style="font-size:12px;font-weight:700;color:var(--red)">${g.title || g.area || ""}</span></div>
        <div class="analysis-block__text">${g.detail || g.description || ""}</div>
      </div>`).join("");
    return Components.panel("COVERAGE GAPS", "04b", "#FF3B30", cards);
  }

  function renderStakeholders(items) {
    const cards = (items || []).map(s => `
      <div class="analysis-block">
        <div class="stakeholder__top">
          <span style="font-size:12px;font-weight:700;color:var(--text)">${s.name || s.stakeholder || ""}</span>
          ${s.impact ? Components.badge(s.impact, s.impact === "HIGH" ? "high" : s.impact === "MEDIUM" ? "medium" : "low") : ""}
        </div>
        <div class="analysis-block__text">${s.detail || s.description || ""}</div>
      </div>`).join("");
    return Components.panel("STAKEHOLDER MAP", "04c", "#5AC8FA", cards);
  }

  function renderBriefing(text) {
    return Components.panel("EXECUTIVE BRIEFING", "05", "#FFD60A", Components.briefing(text));
  }

  // ── UI helpers ────────────────────────────────────────────────

  function disableCards(disabled) {
    document.querySelectorAll("#search-cards .question-card").forEach(c => {
      c.classList.toggle("question-card--disabled", disabled);
    });
  }

  function hideDeployBtn() {
    const wrap = document.getElementById("search-deploy-wrap");
    if (wrap) wrap.innerHTML = "";
  }

  return { init, renderInputArea, resetWorkspace };

})();
