(function () {
  const page = document.querySelector(".page");
  if (!page) return;

  const storageKey = "brandInsightSidebarCollapsed";
  const nameKey = "brandInsightSidebar";
  const transitionDuration = 320;
  const routes = {
    "监测项目列表": "index.html",
    "报告管理": "report-management.html",
    "报告模板中心": "template.html"
  };

  const style = document.createElement("style");
  style.textContent = `
    .page.collapsed .nav-link .nav-icon {
      transition: transform 320ms cubic-bezier(.22,.61,.36,1), opacity 240ms ease, filter 320ms ease;
    }
    .page.collapsed .nav-link.nav-switching .nav-icon {
      transform: scale(.82);
      opacity: .58;
      filter: saturate(.7);
    }
    .page.collapsed.nav-leaving .header,
    .page.collapsed.nav-leaving .main {
      opacity: 0;
      transform: translateY(5px);
      transition: opacity 280ms ease, transform 320ms cubic-bezier(.22,.61,.36,1);
    }
  `;
  document.head.appendChild(style);

  function readState() {
    const match = window.name.match(new RegExp(`(?:^|;)${nameKey}=(0|1)(?:;|$)`));
    if (match) return match[1];
    try {
      return localStorage.getItem(storageKey);
    } catch (_) {
      return null;
    }
  }

  function saveState(collapsed) {
    const value = collapsed ? "1" : "0";
    const parts = window.name.split(";").filter((item) => item && !item.startsWith(`${nameKey}=`));
    parts.push(`${nameKey}=${value}`);
    window.name = parts.join(";");
    try {
      localStorage.setItem(storageKey, value);
    } catch (_) {
      // window.name keeps file:// page navigation in sync when storage is unavailable.
    }
  }

  const saved = readState();
  if (saved === "1") page.classList.add("collapsed");
  if (saved === "0") page.classList.remove("collapsed");
  if (saved !== "0" && saved !== "1") saveState(page.classList.contains("collapsed"));

  document.querySelector(".collapse")?.addEventListener("click", () => {
    requestAnimationFrame(() => saveState(page.classList.contains("collapsed")));
  });

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!page.classList.contains("collapsed") || link.classList.contains("active")) return;
      const label = link.dataset.label || link.textContent.trim();
      const target = link.dataset.href || link.getAttribute("href") || routes[label];
      if (!target) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      saveState(true);
      link.classList.add("nav-switching");
      page.classList.add("nav-leaving");
      window.setTimeout(() => {
        window.location.href = target;
      }, transitionDuration);
    }, true);
  });
})();
