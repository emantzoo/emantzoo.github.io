/* ═══════════════════════════════════════════════════════════════════
   RegScope Demo — Pipeline B: Compare (demo only, no backend)
   ═══════════════════════════════════════════════════════════════════ */

const ComparePipeline = (() => {

  const STAGES = ["READ", "MAP", "ALIGN", "GAP ANALYSIS", "BRIEFING"];

  let log = null;
  let selectedId = null;
  let isRunning = false;

  function init() { renderInputArea(); }

  function renderInputArea() {
    const area = document.getElementById("compare-input-area");
    area.innerHTML = `
      <p class="input-label">SELECT A DOCUMENT PAIR TO COMPARE</p>
      <div class="question-cards" id="compare-cards"></div>
      <div id="compare-deploy-wrap"></div>`;
    loadDemoCards();
  }

  const DEMO_PAIRS = [
    { id: "cfp_greek", title: "CFP Landing Obligation vs Greek Transposition", doc1Label: "EU Regulation", doc2Label: "Greek National Law" }
  ];

  function loadDemoCards() {
    const container = document.getElementById("compare-cards");
    container.innerHTML = DEMO_PAIRS.map(d => `
      <button class="question-card" data-id="${d.id}" style="flex:1 1 100%">
        <span class="question-card__domain">FISHERIES & MARINE</span>
        <span class="question-card__text">${d.title}</span>
        <div style="display:flex;gap:16px;margin-top:4px">
          <span style="font-size:9px;color:var(--cyan);letter-spacing:0.1em">${d.doc1Label}</span>
          <span style="font-size:9px;color:var(--text-ghost)">vs</span>
          <span style="font-size:9px;color:var(--orange);letter-spacing:0.1em">${d.doc2Label}</span>
        </div>
      </button>
    `).join("");
    container.querySelectorAll(".question-card").forEach(card => {
      card.addEventListener("click", () => { if (!isRunning) selectCard(card.dataset.id); });
    });
  }

  function selectCard(id) {
    selectedId = id;
    document.querySelectorAll("#compare-cards .question-card").forEach(c => {
      c.classList.toggle("question-card--selected", c.dataset.id === id);
    });
    const wrap = document.getElementById("compare-deploy-wrap");
    wrap.innerHTML = `<button class="deploy-btn" id="compare-deploy-btn">DEPLOY AGENT</button>`;
    document.getElementById("compare-deploy-btn").addEventListener("click", () => runDemo(id));
    resetWorkspace();
  }

  function resetWorkspace() {
    document.getElementById("compare-workspace").style.display = "none";
    document.getElementById("compare-empty").style.display = "block";
    document.getElementById("compare-results").innerHTML = "";
    if (log) log.clear();
  }

  async function runDemo(pairId) {
    isRunning = true;
    disableCards(true);
    hideDeployBtn();

    document.getElementById("compare-workspace").style.display = "flex";
    document.getElementById("compare-empty").style.display = "none";

    const logPanel = document.getElementById("compare-log-panel");
    log = AgentLog.create(logPanel, STAGES);
    log.start();

    const resultsEl = document.getElementById("compare-results");
    resultsEl.innerHTML = "";

    const demo = DEMO_DATA.compare.find(d => d.id === pairId);
    const data = demo.preloaded;

    // ── INIT ──
    log.addEntry("REGSCOPE AGENT INITIALISED", "system");
    await AgentLog.sleep(300);
    log.addEntry("Mode: COMPARE", "query");
    await AgentLog.sleep(500);

    // ── Stage 1: READ ──
    log.setStage(0);
    log.addEntry("\u2500\u2500 STAGE 1: READ \u2500\u2500", "stage");
    log.addEntry("Reading Document 1...", "thinking");
    await AgentLog.delay(500, 300);
    log.addEntry(`Identified: ${data.read.doc1.title} (${data.read.doc1.type})`, "info");
    await AgentLog.delay(400, 200);
    log.addEntry("Reading Document 2...", "thinking");
    await AgentLog.delay(500, 300);
    log.addEntry(`Identified: ${data.read.doc2.title} (${data.read.doc2.type})`, "info");
    await AgentLog.delay(300, 200);
    log.addEntry("Document profiles complete.", "success");
    resultsEl.innerHTML += renderDocProfiles(data.read);
    await AgentLog.sleep(400);

    // ── Stage 2: MAP ──
    log.setStage(1);
    log.addEntry("\u2500\u2500 STAGE 2: MAP \u2500\u2500", "stage");
    log.addEntry("Mapping provisions between documents...", "thinking");
    await AgentLog.delay(600, 400);

    const statuses = data.mapping.map(m => m.status);
    const gaps = statuses.filter(s => s === "GAP").length;
    const aligned = statuses.filter(s => s === "ALIGNED").length;
    const additions = statuses.filter(s => s === "NATIONAL ADDITION").length;

    log.addEntry(`Found ${data.mapping.length} provision pairs`, "info");
    await AgentLog.delay(300, 200);
    log.addEntry(`${gaps} unmatched in Document 1`, "info");
    await AgentLog.delay(200, 100);
    log.addEntry(`${additions} additional in Document 2`, "info");
    await AgentLog.delay(300, 200);
    log.addEntry("Provision mapping complete.", "success");
    resultsEl.innerHTML += renderMapping(data.mapping);
    await AgentLog.sleep(400);

    // ── Stage 3: ALIGN ──
    log.setStage(2);
    log.addEntry("\u2500\u2500 STAGE 3: ALIGN \u2500\u2500", "stage");
    log.addEntry("Assessing alignment per provision...", "thinking");
    await AgentLog.delay(500, 300);
    log.addEntry(`${aligned} fully aligned`, "info");
    await AgentLog.delay(200, 100);
    const partial = statuses.filter(s => s === "PARTIAL").length;
    const goldPlated = statuses.filter(s => s === "GOLD-PLATED").length;
    log.addEntry(`${partial} partially aligned`, "info");
    await AgentLog.delay(200, 100);
    log.addEntry(`${gaps} gaps identified`, "info");
    await AgentLog.delay(200, 100);
    log.addEntry(`${goldPlated} gold-plated provisions`, "info");
    await AgentLog.delay(300, 200);
    log.addEntry("Alignment assessment complete.", "success");
    await AgentLog.sleep(400);

    // ── Stage 4: GAP ANALYSIS ──
    log.setStage(3);
    log.addEntry("\u2500\u2500 STAGE 4: GAP ANALYSIS \u2500\u2500", "stage");
    log.addEntry("Analysing transposition gaps...", "thinking");
    await AgentLog.delay(500, 300);
    log.addEntry("Checking for gold-plating...", "thinking");
    await AgentLog.delay(400, 300);
    log.addEntry("Scanning for contradictions...", "thinking");
    await AgentLog.delay(400, 200);
    log.addEntry("Gap analysis complete.", "success");
    resultsEl.innerHTML += renderGapAnalysis(data.gapAnalysis);
    await AgentLog.sleep(400);

    // ── Stage 5: BRIEFING ──
    log.setStage(4);
    log.addEntry("\u2500\u2500 STAGE 5: BRIEFING \u2500\u2500", "stage");
    log.addEntry("Generating comparison briefing...", "thinking");
    await AgentLog.delay(600, 400);
    log.addEntry("COMPARISON COMPLETE", "system");
    resultsEl.innerHTML += renderBriefing(data.briefing);

    log.stop();
    isRunning = false;
    disableCards(false);
  }

  // ── Renderers ─────────────────────────────────────────────────

  function renderDocProfiles(read) {
    function profileHTML(doc, label, color) {
      return `
        <div style="flex:1;min-width:260px">
          <div style="font-size:9px;letter-spacing:0.2em;color:${color};margin-bottom:10px;font-weight:800">${label}</div>
          ${Components.row("TITLE", doc.title)}
          ${Components.row("TYPE", doc.type)}
          ${Components.row("BASIS", doc.legalBasis)}
          ${Components.row("SCOPE", doc.scope)}
          ${Components.row("ARTICLES", String(doc.articles))}
          ${Components.row("DATE", doc.date)}
        </div>`;
    }
    return Components.panel("DOCUMENT PROFILES", "01", "#5AC8FA",
      `<div style="display:flex;gap:24px;flex-wrap:wrap">
        ${profileHTML(read.doc1, "DOCUMENT 1 (EU)", "var(--cyan)")}
        ${profileHTML(read.doc2, "DOCUMENT 2 (NATIONAL)", "var(--orange)")}
      </div>`
    );
  }

  function renderMapping(mapping) {
    const statusColors = {
      "ALIGNED": "aligned", "PARTIAL": "partial", "GAP": "gap",
      "GOLD-PLATED": "gold-plated", "DIVERGENT": "divergent", "NATIONAL ADDITION": "national"
    };
    const rows = mapping.map(m => `
      <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--border-dim);align-items:flex-start">
        <div style="flex:1;font-size:11px;color:var(--text);line-height:1.5">${m.doc1Provision || '<span style="color:var(--text-ghost)">N/A</span>'}</div>
        <div style="width:1px;background:var(--border);align-self:stretch"></div>
        <div style="flex:1;font-size:11px;color:var(--text-muted);line-height:1.5">${m.doc2Provision || '<span style="color:var(--text-ghost)">Not present</span>'}</div>
        ${Components.badge(m.status, statusColors[m.status] || "low")}
      </div>
      ${m.notes ? `<div style="font-size:10px;color:var(--text-dim);line-height:1.6;padding:4px 0 8px;border-bottom:1px solid var(--border-dim)">${m.notes}</div>` : ""}
    `).join("");
    const header = `
      <div style="display:flex;gap:12px;padding:6px 0 10px;border-bottom:1px solid var(--border);margin-bottom:4px">
        <div style="flex:1;font-size:9px;letter-spacing:0.2em;color:var(--cyan);font-weight:800">EU PROVISION</div>
        <div style="width:1px"></div>
        <div style="flex:1;font-size:9px;letter-spacing:0.2em;color:var(--orange);font-weight:800">NATIONAL PROVISION</div>
        <div style="width:68px;font-size:9px;letter-spacing:0.15em;color:var(--text-faint);font-weight:800;text-align:right">STATUS</div>
      </div>`;
    return Components.panel("PROVISION MAPPING", "02", "#AF52DE", header + rows);
  }

  function renderGapAnalysis(ga) {
    let html = "";
    if (ga.transpositionGaps && ga.transpositionGaps.length) {
      html += `<div style="margin-bottom:16px">
        <div style="font-size:10px;letter-spacing:0.2em;color:var(--red);font-weight:800;margin-bottom:10px">TRANSPOSITION GAPS</div>
        ${ga.transpositionGaps.map(g => `
          <div class="analysis-block">
            <div class="stakeholder__top">
              <span style="font-size:12px;font-weight:700;color:var(--text)">${g.provision}</span>
              ${g.severity ? Components.badge(g.severity, g.severity === "HIGH" ? "gap" : "partial") : ""}
            </div>
            <div class="analysis-block__text">${g.detail}</div>
          </div>`).join("")}
      </div>`;
    }
    if (ga.goldPlating && ga.goldPlating.length) {
      html += `<div style="margin-bottom:16px">
        <div style="font-size:10px;letter-spacing:0.2em;color:var(--cyan);font-weight:800;margin-bottom:10px">GOLD-PLATING</div>
        ${ga.goldPlating.map(g => `
          <div class="analysis-block">
            <div style="font-size:12px;font-weight:700;color:var(--cyan);margin-bottom:6px">${g.provision}</div>
            <div class="analysis-block__text">${g.detail}</div>
          </div>`).join("")}
      </div>`;
    }
    if (ga.contradictions && ga.contradictions.length) {
      html += `<div style="margin-bottom:16px">
        <div style="font-size:10px;letter-spacing:0.2em;color:var(--orange);font-weight:800;margin-bottom:10px">CONTRADICTIONS</div>
        ${ga.contradictions.map(c => `
          <div class="analysis-block">
            <div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:6px">${c.provision}</div>
            <div class="analysis-block__text">${c.detail}</div>
          </div>`).join("")}
      </div>`;
    }
    if (ga.nationalAdditions && ga.nationalAdditions.length) {
      html += `<div>
        <div style="font-size:10px;letter-spacing:0.2em;color:var(--purple);font-weight:800;margin-bottom:10px">NATIONAL ADDITIONS</div>
        ${ga.nationalAdditions.map(n => `
          <div class="analysis-block">
            <div style="font-size:12px;font-weight:700;color:var(--purple);margin-bottom:6px">${n.provision}</div>
            <div class="analysis-block__text">${n.detail}</div>
          </div>`).join("")}
      </div>`;
    }
    return Components.panel("GAP ANALYSIS", "04", "#FF3B30", html);
  }

  function renderBriefing(text) {
    return Components.panel("COMPARISON BRIEFING", "05", "#FFD60A", Components.briefing(text));
  }

  // ── UI helpers ────────────────────────────────────────────────

  function disableCards(disabled) {
    document.querySelectorAll("#compare-cards .question-card").forEach(c => {
      c.classList.toggle("question-card--disabled", disabled);
    });
  }

  function hideDeployBtn() {
    const wrap = document.getElementById("compare-deploy-wrap");
    if (wrap) wrap.innerHTML = "";
  }

  return { init, renderInputArea, resetWorkspace };

})();
