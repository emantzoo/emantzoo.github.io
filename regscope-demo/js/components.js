/* ═══════════════════════════════════════════════════════════════════
   RegScope — Shared UI Components
   Panel, Row, Tags, Badge, Briefing, Search Items, Analysis Blocks
   ═══════════════════════════════════════════════════════════════════ */

const Components = (() => {

  /**
   * Result panel wrapper.
   * @param {string} title  – Panel title (e.g. "INTERPRETATION")
   * @param {string} num    – Stage number (e.g. "01")
   * @param {string} accent – Accent colour hex
   * @param {string} bodyHTML – Inner HTML content
   */
  function panel(title, num, accent, bodyHTML) {
    return `
      <div class="result-panel">
        <div class="result-panel__header">
          <span class="result-panel__num" style="color:${accent}">${num}</span>
          <span class="result-panel__title">${title}</span>
          <div class="result-panel__line" style="background:${accent}"></div>
        </div>
        <div class="result-panel__body">${bodyHTML}</div>
      </div>`;
  }

  /** Label–value row. */
  function row(label, valueHTML) {
    return `
      <div class="row">
        <div class="row__label">${label}</div>
        <div class="row__value">${valueHTML}</div>
      </div>`;
  }

  /** Tag list from array of strings. */
  function tags(items) {
    return `<div class="tags">${items.map(t => `<span class="tag">${t}</span>`).join("")}</div>`;
  }

  /** Coloured badge. */
  function badge(text, colorClass) {
    return `<span class="badge badge--${colorClass}">${text}</span>`;
  }

  /** Relevance badge (HIGH → green, MEDIUM → orange). */
  function relevanceBadge(level) {
    const cls = level === "HIGH" ? "high" : "medium";
    return badge(level, cls);
  }

  /** Stakeholder impact badge — colour based on keywords. */
  function impactBadge(impact) {
    let bg;
    if (/BURDEN|DOUBLE|SQUEEZED/.test(impact))      bg = "var(--red)";
    else if (/WEAK|LATE|CHALLENGE|COMING/.test(impact)) bg = "var(--orange)";
    else                                                 bg = "var(--cyan)";
    return `<span class="badge" style="background:${bg};color:var(--bg)">${impact}</span>`;
  }

  /** Briefing block with gold left border + serif font. */
  function briefing(text) {
    const paragraphs = text.split("\n\n").map((p, i) =>
      `<p${i > 0 ? ' style="margin-top:16px"' : ""}>${p}</p>`
    ).join("");
    return `<div class="briefing">${paragraphs}</div>`;
  }

  /** Search result item with optional actions (library badge / analyse button). */
  function searchItem(doc, actionsHTML = "") {
    return `
      <div class="search-item">
        <div class="search-item__top">
          <span class="search-item__title">${doc.title}</span>
          ${relevanceBadge(doc.relevance)}
        </div>
        <div class="search-item__reason">${doc.reason}</div>
        ${actionsHTML ? `<div class="search-item__actions">${actionsHTML}</div>` : ""}
      </div>`;
  }

  /** Analysis block (interactions, gaps). */
  function analysisBlock(titleText, detail, titleColor) {
    return `
      <div class="analysis-block">
        <div class="analysis-block__title" style="color:${titleColor}">${titleText}</div>
        <div class="analysis-block__text">${detail}</div>
      </div>`;
  }

  /** Stakeholder block with impact badge. */
  function stakeholderBlock(s) {
    return `
      <div class="analysis-block">
        <div class="stakeholder__top">
          <span class="stakeholder__name">${s.group}</span>
          ${impactBadge(s.impact)}
        </div>
        <div class="analysis-block__text">${s.detail}</div>
      </div>`;
  }

  /** Obligation list. */
  function obligations(items) {
    return `<div style="display:flex;flex-direction:column;gap:4px">
      ${items.map(o => `<div class="obligation"><span class="obligation__dash">--</span>${o}</div>`).join("")}
    </div>`;
  }

  /** Decode regulation block. */
  function decodeReg(reg, isLast) {
    return `
      <div>
        <div class="decode-reg__title">${reg.regulation}</div>
        ${row("WHO", tags(reg.who))}
        ${row("WHAT", reg.what)}
        ${row("OBLIGATIONS", obligations(reg.keyObligations))}
        ${!isLast ? '<div class="decode-reg__divider"></div>' : ""}
      </div>`;
  }

  return {
    panel, row, tags, badge, relevanceBadge, impactBadge,
    briefing, searchItem, analysisBlock, stakeholderBlock,
    obligations, decodeReg
  };

})();
