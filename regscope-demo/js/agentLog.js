/* ═══════════════════════════════════════════════════════════════════
   RegScope — Agent Log Module
   Renders the left-column terminal log with timed entries, blinking
   cursor, and stage progress indicator.
   ═══════════════════════════════════════════════════════════════════ */

const AgentLog = (() => {

  /**
   * Create an agent log instance bound to a container element.
   * @param {HTMLElement} container – The log panel wrapper
   * @param {string[]} stageLabels – e.g. ["INTERPRET","SEARCH","DECODE","DEEP DIVE","BRIEFING"]
   * @returns {object} Log controller
   */
  function create(container, stageLabels) {
    let activeStage = -1;
    let isRunning = false;

    // Build log panel HTML
    container.innerHTML = `
      <div class="log__header">AGENT LOG</div>
      <div class="log__scroll"></div>
      <div class="log__progress">
        ${stageLabels.map((label, i) => `
          <div class="progress__item" data-stage="${i}">
            <div class="progress__dot"></div>
            <span class="progress__label">${label}</span>
          </div>
        `).join("")}
      </div>`;

    const scrollEl = container.querySelector(".log__scroll");
    const progressItems = container.querySelectorAll(".progress__item");

    /** Format current time as HH:MM:SS. */
    function timestamp() {
      return new Date().toLocaleTimeString("en-GB", { hour12: false });
    }

    /** Add a single log entry. */
    function addEntry(msg, type = "info") {
      // Remove existing cursor
      const cursor = scrollEl.querySelector(".log__cursor");
      if (cursor) cursor.parentElement.remove();

      const div = document.createElement("div");
      div.className = `log__entry log__entry--${type}`;
      div.innerHTML = `<span class="log__timestamp">${timestamp()}</span>${msg}`;
      scrollEl.appendChild(div);

      // Add blinking cursor if still running
      if (isRunning) {
        const cursorDiv = document.createElement("div");
        cursorDiv.className = "log__entry";
        cursorDiv.innerHTML = '<span class="log__cursor">_</span>';
        scrollEl.appendChild(cursorDiv);
      }

      scrollEl.scrollTop = scrollEl.scrollHeight;
    }

    /** Set the active stage index (updates progress dots). */
    function setStage(index) {
      activeStage = index;
      progressItems.forEach((item, i) => {
        item.classList.remove("progress__item--active", "progress__item--done");
        if (i < index)       item.classList.add("progress__item--done");
        else if (i === index) item.classList.add("progress__item--active");
      });
    }

    /** Mark as running (shows cursor). */
    function start() {
      isRunning = true;
    }

    /** Mark as finished (removes cursor). */
    function stop() {
      isRunning = false;
      const cursor = scrollEl.querySelector(".log__cursor");
      if (cursor) cursor.parentElement.remove();
      // Mark all stages done
      progressItems.forEach(item => {
        item.classList.remove("progress__item--active");
        item.classList.add("progress__item--done");
      });
    }

    /** Clear all log entries and reset progress. */
    function clear() {
      scrollEl.innerHTML = "";
      activeStage = -1;
      isRunning = false;
      progressItems.forEach(item => {
        item.classList.remove("progress__item--active", "progress__item--done");
      });
    }

    return { addEntry, setStage, start, stop, clear };
  }

  /** Async sleep helper. */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Random delay between base and base+range. */
  function delay(base = 300, range = 300) {
    return sleep(base + Math.random() * range);
  }

  return { create, sleep, delay };

})();
