/* ═══════════════════════════════════════════════════════════════════
   RegScope Demo — Pipeline A: Analyse (demo only, no backend)
   ═══════════════════════════════════════════════════════════════════ */

const AnalysePipeline = (() => {

  const STAGES = ["DECODE", "EXTRACT", "DEEP DIVE", "BRIEFING"];

  let log = null;
  let selectedId = null;
  let isRunning = false;

  function init() { renderInputArea(); }

  function renderInputArea() {
    const area = document.getElementById("analyse-input-area");
    area.innerHTML = `
      <p class="input-label">SELECT A REGULATION TO ANALYSE</p>
      <div class="question-cards" id="analyse-cards"></div>
      <div id="analyse-deploy-wrap"></div>`;
    loadDemoCards();
  }

  const DEMO_REGS = [
    { id: "cfp", title: "Common Fisheries Policy (Reg. 1380/2013)", domain: "FISHERIES & MARINE", classification: "EU REGULATION" },
    { id: "green_deal", title: "European Green Deal (COM(2019) 640)", domain: "CLIMATE & ENVIRONMENT", classification: "EU COMMUNICATION" },
    { id: "ai_act", title: "EU AI Act (Reg. 2024/1689)", domain: "DIGITAL & TECHNOLOGY", classification: "EU REGULATION" }
  ];

  function loadDemoCards() {
    const container = document.getElementById("analyse-cards");
    container.innerHTML = DEMO_REGS.map(r => `
      <button class="question-card" data-id="${r.id}">
        <span class="question-card__domain">${r.domain}</span>
        <span class="question-card__text">${r.title}</span>
        <span style="font-size:8px;color:var(--text-ghost);letter-spacing:0.15em;margin-top:2px">${r.classification}</span>
      </button>
    `).join("");
    container.querySelectorAll(".question-card").forEach(card => {
      card.addEventListener("click", () => { if (!isRunning) selectCard(card.dataset.id); });
    });
  }

  function selectCard(id) {
    selectedId = id;
    document.querySelectorAll("#analyse-cards .question-card").forEach(c => {
      c.classList.toggle("question-card--selected", c.dataset.id === id);
    });
    const wrap = document.getElementById("analyse-deploy-wrap");
    wrap.innerHTML = `<button class="deploy-btn" id="analyse-deploy-btn">DEPLOY AGENT</button>`;
    document.getElementById("analyse-deploy-btn").addEventListener("click", () => runDemo(id));
    resetWorkspace();
  }

  function resetWorkspace() {
    document.getElementById("analyse-workspace").style.display = "none";
    document.getElementById("analyse-empty").style.display = "block";
    document.getElementById("analyse-results").innerHTML = "";
    if (log) log.clear();
  }

  async function runDemo(regId) {
    isRunning = true;
    disableCards(true);
    hideDeployBtn();

    document.getElementById("analyse-workspace").style.display = "flex";
    document.getElementById("analyse-empty").style.display = "none";

    const logPanel = document.getElementById("analyse-log-panel");
    log = AgentLog.create(logPanel, STAGES);
    log.start();

    const resultsEl = document.getElementById("analyse-results");
    resultsEl.innerHTML = "";

    const demo = DEMO_DATA.analyse.find(d => d.id === regId);
    const data = demo.preloaded;

    // ── INIT ──
    log.addEntry("REGSCOPE AGENT INITIALISED", "system");
    await AgentLog.sleep(300);
    log.addEntry(`Regulation: ${demo.title}`, "query");
    await AgentLog.sleep(500);

    // ── Stage 1: DECODE ──
    log.setStage(0);
    log.addEntry("\u2500\u2500 STAGE 1: DECODE \u2500\u2500", "stage");
    log.addEntry("Reading regulatory text...", "thinking");
    await AgentLog.delay(600, 400);
    log.addEntry("Extracting entities and scope...", "thinking");
    await AgentLog.delay(500, 300);
    log.addEntry("Decode complete.", "success");
    resultsEl.innerHTML += renderDecode(data.decode);
    await AgentLog.sleep(400);

    // ── Stage 2: EXTRACT ──
    log.setStage(1);
    log.addEntry("\u2500\u2500 STAGE 2: EXTRACT \u2500\u2500", "stage");
    log.addEntry("Building compliance timeline...", "thinking");
    await AgentLog.delay(600, 400);
    log.addEntry(`Identified ${data.timeline.length} timeline events`, "info");
    await AgentLog.delay(300, 200);
    log.addEntry("Timeline extraction complete.", "success");
    resultsEl.innerHTML += renderTimeline(data.timeline);
    await AgentLog.sleep(400);

    // ── Stage 3: DEEP DIVE ──
    log.setStage(2);
    log.addEntry("\u2500\u2500 STAGE 3: DEEP DIVE \u2500\u2500", "stage");

    log.addEntry("Scanning for vague language...", "thinking");
    await AgentLog.delay(500, 300);
    log.addEntry(`Found ${(data.deepDive.ambiguities || []).length} ambiguities`, "info");
    resultsEl.innerHTML += renderAmbiguities(data.deepDive.ambiguities);
    await AgentLog.delay(300, 200);

    log.addEntry("Checking for contradictions...", "thinking");
    await AgentLog.delay(400, 200);
    log.addEntry(`Found ${(data.deepDive.contradictions || []).length} contradictions`, "info");
    resultsEl.innerHTML += renderContradictions(data.deepDive.contradictions);
    await AgentLog.delay(300, 200);

    log.addEntry("Mapping stakeholder impacts...", "thinking");
    await AgentLog.delay(400, 200);
    resultsEl.innerHTML += renderStakeholders(data.deepDive.stakeholderImpacts);
    await AgentLog.delay(300, 200);

    log.addEntry("Tracing cross-references...", "thinking");
    await AgentLog.delay(400, 200);
    resultsEl.innerHTML += renderCrossRefs(data.deepDive.crossReferences);
    await AgentLog.delay(300, 200);

    log.addEntry("Comparing new vs inherited...", "thinking");
    await AgentLog.delay(400, 200);
    resultsEl.innerHTML += renderNovelty(data.deepDive.newVsInherited);
    await AgentLog.delay(300, 200);

    log.addEntry("Deep-dive analysis complete.", "success");
    await AgentLog.sleep(400);

    // ── Stage 4: BRIEFING ──
    log.setStage(3);
    log.addEntry("\u2500\u2500 STAGE 4: BRIEFING \u2500\u2500", "stage");
    log.addEntry("Composing executive briefing...", "thinking");
    await AgentLog.delay(600, 400);
    log.addEntry("ANALYSIS COMPLETE", "system");
    resultsEl.innerHTML += renderBriefing(data.briefing);

    log.stop();
    isRunning = false;
    disableCards(false);
  }

  // ── Renderers ─────────────────────────────────────────────────

  function renderDecode(d) {
    return Components.panel("DECODE", "01", "#5AC8FA",
      Components.row("WHO", Components.tags(d.who || [])) +
      Components.row("WHAT", d.what || "") +
      Components.row("SCOPE", d.scope || "") +
      (d.keyDefinitions || []).map(kd =>
        Components.row(kd.term.toUpperCase(), kd.definition)
      ).join("")
    );
  }

  function renderTimeline(events) {
    const rows = (events || []).map(e => {
      const typeClass = e.type === "milestone" ? "green" : e.type === "deadline" ? "orange" : "red";
      return `
        <div class="timeline-row">
          <div class="timeline-row__dot timeline-row__dot--${typeClass}"></div>
          <div class="timeline-row__date">${e.date}</div>
          <div class="timeline-row__event">${e.event}</div>
          ${Components.badge(e.type.toUpperCase(), typeClass)}
        </div>`;
    }).join("");
    return Components.panel("COMPLIANCE TIMELINE", "02", "#34C759",
      `<div class="timeline">${rows}</div>`
    );
  }

  function renderAmbiguities(items) {
    const cards = (items || []).map(a => `
      <div class="analysis-block">
        <div style="font-size:11px;font-weight:700;color:var(--orange);margin-bottom:4px">${a.provision}</div>
        <div class="analysis-block__text">${a.issue}</div>
        <div style="font-size:10px;color:var(--text-ghost);margin-top:4px"><strong>Impact:</strong> ${a.impact || ""}</div>
      </div>`).join("");
    return Components.panel("VAGUE LANGUAGE", "3a", "#FF9500", cards);
  }

  function renderContradictions(items) {
    const cards = (items || []).map(c => `
      <div class="analysis-block">
        <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:4px">${c.provisions || ""}</div>
        <div class="analysis-block__text">${c.issue}</div>
      </div>`).join("");
    return Components.panel("CONTRADICTIONS", "3b", "#FF3B30", cards);
  }

  function renderStakeholders(items) {
    const cards = (items || []).map(s => `
      <div class="analysis-block">
        <div class="stakeholder__top">
          <span style="font-size:12px;font-weight:700;color:var(--text)">${s.stakeholder}</span>
          ${s.impact ? Components.badge(s.impact, s.impact === "HIGH" ? "high" : s.impact === "MEDIUM" ? "medium" : "low") : ""}
        </div>
        <div class="analysis-block__text">${s.effects || s.effect || ""}</div>
      </div>`).join("");
    return Components.panel("STAKEHOLDER IMPACTS", "3c", "#AF52DE", cards);
  }

  function renderCrossRefs(items) {
    const cards = (items || []).map(r => `
      <div class="analysis-block">
        <div style="font-size:11px;font-weight:700;color:var(--cyan);margin-bottom:4px">${r.reference}</div>
        <div class="analysis-block__text">${r.relationship || r.relevance || ""}</div>
      </div>`).join("");
    return Components.panel("CROSS-REFERENCES", "3d", "#5AC8FA", cards);
  }

  function renderNovelty(items) {
    const cards = (items || []).map(n => `
      <div class="analysis-block">
        <div class="stakeholder__top">
          <span style="font-size:11px;font-weight:700;color:var(--text)">${n.provision}</span>
          ${Components.badge(n.status, n.status === "NEW" ? "green" : "medium")}
        </div>
        <div class="analysis-block__text">${n.detail || n.explanation || ""}</div>
      </div>`).join("");
    return Components.panel("NEW vs INHERITED", "3e", "#34C759", cards);
  }

  function renderBriefing(text) {
    return Components.panel("EXECUTIVE BRIEFING", "04", "#FFD60A", Components.briefing(text));
  }

  // ── UI helpers ────────────────────────────────────────────────

  function disableCards(disabled) {
    document.querySelectorAll("#analyse-cards .question-card").forEach(c => {
      c.classList.toggle("question-card--disabled", disabled);
    });
  }

  function hideDeployBtn() {
    const wrap = document.getElementById("analyse-deploy-wrap");
    if (wrap) wrap.innerHTML = "";
  }

  return { init, renderInputArea, resetWorkspace };

})();
