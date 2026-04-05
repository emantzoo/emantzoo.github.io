/* ═══════════════════════════════════════════════════════════════════
   RegScope Demo — App Logic (static demo, no backend)
   ═══════════════════════════════════════════════════════════════════ */

const App = (() => {

  let currentTab = "analyse";

  function getMode() { return "demo"; }
  function getTab()  { return currentTab; }

  function init() {
    setupTabs();
    SearchPipeline.init();
    AnalysePipeline.init();
    ComparePipeline.init();
  }

  function setupTabs() {
    document.querySelectorAll(".tabs__btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (tab === currentTab) return;
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".tabs__btn").forEach(b => {
      b.classList.toggle("tabs__btn--active", b.dataset.tab === tab);
    });
    document.querySelectorAll(".pipeline").forEach(p => { p.style.display = "none"; });
    document.getElementById(`pipeline-${tab}`).style.display = "block";

    if (tab === "analyse") AnalysePipeline.init();
    else if (tab === "compare") ComparePipeline.init();
    else if (tab === "search") SearchPipeline.init();
  }

  return { init, getMode, getTab, switchTab };

})();

document.addEventListener("DOMContentLoaded", App.init);
