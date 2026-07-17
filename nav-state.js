(function () {
  const page = document.querySelector(".page");
  if (!page) return;

  const storageKey = "brandInsightSidebarCollapsed";
  const nameKey = "brandInsightSidebar";
  const transitionDuration = 320;
  const routes = {
    "监测项目列表": "index.html",
    "报告管理": "report-management.html",
    "报告模板中心": "template.html",
    "账号管理": "account-management.html",
    "刷新记录日志": "refresh-log.html",
    "互动量刷新管理": "interaction-refresh-management.html"
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

  const collapseButton = document.querySelector(".collapse");
  const breadcrumbToggle = document.querySelector(".menu-icon");
  const setSidebarCollapsed = (collapsed) => {
    page.classList.toggle("collapsed", collapsed);
    saveState(collapsed);
    const label = collapsed ? "展开导航" : "收起导航";
    collapseButton?.setAttribute("aria-label", label);
    breadcrumbToggle?.setAttribute("aria-label", label);
  };
  const toggleSidebar = () => setSidebarCollapsed(!page.classList.contains("collapsed"));

  collapseButton?.addEventListener("click", (event) => {
    // Some pages have an older inline handler. Capture the event so one click only toggles once.
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    toggleSidebar();
  }, true);

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

  document.querySelectorAll(".nav-link").forEach((link) => {
    const label = link.dataset.label || link.textContent.trim();
    const target = link.dataset.href || link.getAttribute("href") || routes[label];
    if (!target) return;
    link.addEventListener("click", (event) => {
      if (link.classList.contains("active") || page.classList.contains("collapsed")) return;
      event.preventDefault();
      window.location.href = target;
    });
  });

  if (breadcrumbToggle) {
    breadcrumbToggle.setAttribute("role", "button");
    breadcrumbToggle.setAttribute("tabindex", "0");
    breadcrumbToggle.setAttribute("aria-label", "收起导航");
    breadcrumbToggle.style.cursor = "pointer";
    breadcrumbToggle.addEventListener("click", toggleSidebar);
    breadcrumbToggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleSidebar();
      }
    });
  }

  const interactionMetrics = document.querySelectorAll(".metric-icon");
  if (interactionMetrics.length) {
    const metricAssets = [
      "interaction-metric-total.svg",
      "interaction-metric-manual.svg",
      "interaction-metric-auto.svg",
      "interaction-metric-content.svg",
      "interaction-metric-comment.svg",
      "interaction-metric-success.svg"
    ];
    interactionMetrics.forEach((icon, index) => {
      icon.replaceChildren(Object.assign(document.createElement("img"), {
        src: `assets/${metricAssets[index]}`,
        alt: ""
      }));
    });

    const trendAssets = ["interaction-rank-up.svg", "interaction-rank-down.svg", "interaction-rank-down.svg", "interaction-rank-up.svg", "interaction-rank-stable.svg"];
    const rankBadges = [
      `<svg class="rank-badge-svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="排名 1" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="18" rx="2" fill="url(#rank-gradient-1)"/><path d="M9.3518 4.432H10.1198V13H9.1358V5.632C8.5958 6.184 7.9238 6.568 7.1198 6.808V5.824C7.5038 5.716 7.9118 5.548 8.3198 5.308C8.7278 5.044 9.0638 4.756 9.3518 4.432Z" fill="white"/><defs><linearGradient id="rank-gradient-1" x1="-4.5" y1="-8.4375" x2="15.1875" y2="14.0625" gradientUnits="userSpaceOnUse"><stop stop-color="#FF99AD"/><stop offset="0.5" stop-color="#C897FF"/><stop offset="1" stop-color="#7A5CFF"/></linearGradient></defs></svg>`,
      `<svg class="rank-badge-svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="排名 2" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="18" rx="2" fill="url(#rank-gradient-2)"/><path d="M9.12234 4.264C9.91434 4.264 10.5623 4.492 11.0783 4.948C11.5823 5.404 11.8463 6.016 11.8463 6.76C11.8463 7.504 11.5583 8.176 11.0063 8.776C10.7063 9.088 10.1183 9.556 9.23034 10.156C8.13834 10.888 7.51434 11.548 7.35834 12.124H11.8583V13H6.14634C6.14634 12.22 6.42234 11.512 6.99834 10.876C7.33434 10.492 7.94634 9.976 8.85834 9.352C9.53034 8.872 9.97434 8.524 10.2023 8.284C10.6343 7.816 10.8623 7.3 10.8623 6.748C10.8623 6.22 10.7063 5.824 10.3943 5.536C10.0823 5.248 9.63834 5.104 9.08634 5.104C8.49834 5.104 8.04234 5.296 7.73034 5.704C7.39434 6.088 7.21434 6.664 7.20234 7.42H6.21834C6.21834 6.46 6.49434 5.692 7.02234 5.128C7.55034 4.552 8.25834 4.264 9.12234 4.264Z" fill="white"/><defs><linearGradient id="rank-gradient-2" x1="-4.5" y1="-8.4375" x2="15.1875" y2="14.0625" gradientUnits="userSpaceOnUse"><stop stop-color="#FF99AD"/><stop offset="0.5" stop-color="#C897FF"/><stop offset="1" stop-color="#7A5CFF"/></linearGradient></defs></svg>`,
      `<svg class="rank-badge-svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-label="排名 3" xmlns="http://www.w3.org/2000/svg"><rect width="18" height="18" rx="2" fill="url(#rank-gradient-3)"/><path d="M9.08634 4.264C9.90234 4.264 10.5743 4.468 11.0783 4.888C11.5703 5.308 11.8223 5.872 11.8223 6.592C11.8223 7.552 11.3543 8.2 10.4183 8.512C10.9223 8.668 11.3063 8.908 11.5703 9.244C11.8583 9.58 12.0023 10 12.0023 10.504C12.0023 11.284 11.7263 11.92 11.1863 12.412C10.6343 12.916 9.91434 13.168 9.02634 13.168C8.21034 13.168 7.55034 12.952 7.03434 12.544C6.42234 12.04 6.08634 11.308 6.01434 10.348H7.01034C7.03434 11.02 7.26234 11.536 7.68234 11.884C8.04234 12.172 8.48634 12.328 9.02634 12.328C9.63834 12.328 10.1303 12.148 10.5023 11.8C10.8383 11.464 11.0183 11.044 11.0183 10.54C11.0183 10.024 10.8503 9.628 10.5143 9.34C10.1783 9.052 9.72234 8.92 9.12234 8.92H8.42634V8.152H9.08634C9.66234 8.152 10.0943 8.02 10.3943 7.768C10.6943 7.504 10.8503 7.132 10.8503 6.652C10.8503 6.172 10.6943 5.8 10.4063 5.536C10.0943 5.248 9.65034 5.116 9.09834 5.116C8.52234 5.116 8.07834 5.26 7.75434 5.572C7.41834 5.884 7.22634 6.328 7.16634 6.904H6.19434C6.26634 6.076 6.57834 5.428 7.10634 4.96C7.61034 4.492 8.27034 4.264 9.08634 4.264Z" fill="white"/><defs><linearGradient id="rank-gradient-3" x1="-4.5" y1="-8.4375" x2="15.1875" y2="14.0625" gradientUnits="userSpaceOnUse"><stop stop-color="#FF99AD"/><stop offset="0.5" stop-color="#C897FF"/><stop offset="1" stop-color="#7A5CFF"/></linearGradient></defs></svg>`
    ];
    document.querySelectorAll(".rank-table tbody tr").forEach((row, index) => {
      const rankCell = row.firstElementChild;
      let rank = row.querySelector(".rank-num");
      if (index < 3 && rankCell) {
        rankCell.innerHTML = rankBadges[index];
        rank = null;
      }
      if (index >= 3 && !rank && rankCell) {
        rank = document.createElement("i");
        rank.className = "rank-num";
        rank.textContent = rankCell.textContent.trim();
        rankCell.replaceChildren(rank);
      }
      if (index < 3 && rank) {
        rank.classList.add("top");
        rank.style.background = "linear-gradient(138.814deg, rgb(255, 153, 173) 36.667%, rgb(200, 151, 255) 22.188%, rgb(122, 92, 255) 81.042%)";
        rank.style.color = "#fff";
      }
      const trendCell = row.lastElementChild;
      if (trendCell) {
        trendCell.replaceChildren(Object.assign(document.createElement("img"), {
          className: "rank-trend",
          src: `assets/${trendAssets[index]}`,
          alt: ""
        }));
      }
    });
    const rankTitle = document.querySelector(".rank-panel .panel-title");
    if (rankTitle) rankTitle.textContent = "维度排行分析";
  }
})();
