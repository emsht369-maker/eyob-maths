(function () {
  "use strict";
  const links = [
    ["GCSE rooms", "/rooms.html?path=gcse"], ["ML rooms", "/rooms.html?path=ml"]
  ];
  const stylesReady = new Promise(resolve => {
    const existing = document.querySelector('link[data-site-header-styles]');
    if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", resolve, { once: true }); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/site-header.css";
    link.dataset.siteHeaderStyles = "";
    link.onload = link.onerror = resolve;
    document.head.append(link);
  });
  function render() {
    const current = location.pathname;
    let activity = {};
    try { activity = JSON.parse(localStorage.getItem("mathmaster_activity") || "{}"); } catch (_) {}
    const points = Math.max(0, Number(activity.points) || 0);
    const dates = Array.isArray(activity.days) ? activity.days : [];
    let streak = 0; const date = new Date();
    while (dates.includes(date.toLocaleDateString("en-CA"))) { streak += 1; date.setDate(date.getDate() - 1); }
    let menu = document.querySelector(".site-menu");
    if (!menu) { menu = document.createElement("nav"); menu.className = "site-menu"; document.body.prepend(menu); }
    menu.setAttribute("aria-label", "Main menu");
    const link = ([label, href]) => {
      const target = new URL(href, location.origin);
      const isRoomPath = target.pathname === "/rooms.html" && current === target.pathname && selectedPath === target.searchParams.get("path");
      const isCurrent = isRoomPath || current === target.pathname && !target.search || current.startsWith(target.pathname.replace(/\.html$/, "/"));
      return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ""}>${label}</a>`;
    };
    const selectedPath = new URLSearchParams(location.search).get("path");
    menu.innerHTML = `<a class="mm-brand" href="/index.html" aria-label="Math Master home"><span class="mm-brand-mark" aria-hidden="true">M</span><b class="mm-brand-name">Math Master</b></a>${links.map(link).join("")}<span class="nav-points" data-nav-points aria-label="${points} points">★ <span>${points}</span> points</span><span class="nav-streak" aria-label="${streak} day streak">🔥 <span>${streak}</span> day${streak === 1 ? "" : "s"}</span><details class="site-menu-drawer"><summary aria-label="Open navigation">☰</summary><div class="site-menu-drawer-panel">${links.map(link).join("")}<span class="nav-points">★ <span>${points}</span> points</span><span class="nav-streak">🔥 <span>${streak}</span> day${streak === 1 ? "" : "s"}</span></div></details>`;
    menu.querySelector(".site-menu-drawer").addEventListener("toggle", event => event.currentTarget.querySelector("summary").setAttribute("aria-label", event.currentTarget.open ? "Close navigation" : "Open navigation"));
  }
  window.MathMasterSharedHeader = Object.freeze({ render });
  window.addEventListener("mm2:points", event => {
    let activity = {};
    try { activity = JSON.parse(localStorage.getItem("mathmaster_activity") || "{}"); } catch (_) {}
    const points = Math.max(0, Number(event.detail?.totalPoints) || Number(activity.points) || Number(document.querySelector("[data-nav-points] span")?.textContent) || 0);
    document.querySelectorAll(".site-menu .nav-points").forEach(chip => {
      const value = chip.querySelector("span");
      if (value) value.textContent = String(points);
      chip.setAttribute("aria-label", `${points} points`);
    });
  });
  stylesReady.then(render);
})();
