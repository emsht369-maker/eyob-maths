"use strict";

function setupMobileNavigation() {
  const menu = document.querySelector(".site-menu");
  if (!menu) return;
  let more = menu.querySelector(".site-menu-more");
  if (!more) {
    // The shared header now has its own mobile drawer. Do not recreate a
    // second, legacy "More" menu when the page uses that header.
    if (menu.querySelector(".site-menu-drawer")) return;
    more = document.createElement("details");
    more.className = "site-menu-more";
    more.innerHTML = "<summary>More</summary><div class=\"site-menu-submenu\"></div>";
    menu.append(more);
  }
  const submenu = more.querySelector(".site-menu-submenu");
  if (!submenu) return;
  addMobileProgressChips(menu, more);
  const hrefs = new Set([...submenu.querySelectorAll("a[href]")].map(link => link.href));
  [...menu.querySelectorAll(":scope > a[href]")].slice(1).forEach(link => {
    if (hrefs.has(link.href)) return;
    const copy = link.cloneNode(true);
    copy.removeAttribute("aria-current");
    submenu.append(copy);
    hrefs.add(link.href);
  });
  const summary = more.querySelector(":scope > summary");
  summary.setAttribute("aria-label", "Open navigation menu");
  if (summary.dataset.mobileMenuReady !== "true") more.addEventListener("toggle", () => {
    summary.setAttribute("aria-label", more.open ? "Close navigation menu" : "Open navigation menu");
  });
  summary.dataset.mobileMenuReady = "true";
  submenu.addEventListener("click", event => {
    if (event.target.closest("a")) {
      more.open = false;
      summary.setAttribute("aria-label", "Open navigation menu");
    }
  });
}

function addMobileProgressChips(menu, more) {
  let activity = {};
  try {
    activity = JSON.parse(localStorage.getItem("mathmaster_activity") || "{}");
  } catch (error) {
    console.error("Saved learning progress is not valid JSON.", error);
  }
  if (!menu.querySelector(".nav-points")) {
    const points = Math.max(0, Number(activity.points) || 0);
    const chip = document.createElement("span");
    chip.className = "nav-points mobile-nav-stat";
    chip.dataset.navPoints = "";
    chip.setAttribute("aria-label", `${points} points`);
    chip.innerHTML = `★ <span>${points}</span> points`;
    menu.insertBefore(chip, more);
  }
  if (!menu.querySelector(".nav-streak")) {
    const days = Array.isArray(activity.days) ? activity.days : [];
    let streak = 0;
    const date = new Date();
    while (days.includes(date.toLocaleDateString("en-CA"))) {
      streak += 1;
      date.setDate(date.getDate() - 1);
    }
    const chip = document.createElement("span");
    chip.className = "nav-streak mobile-nav-stat";
    chip.setAttribute("aria-label", `${streak} day streak`);
    chip.innerHTML = `🔥 <span>${streak}</span> day${streak === 1 ? "" : "s"}`;
    menu.insertBefore(chip, more);
  }
}

function initializeMobileNavigation() {
  setupMobileNavigation();
  const menu = document.querySelector(".site-menu");
  if (menu) new MutationObserver(setupMobileNavigation).observe(menu, { childList: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMobileNavigation, { once: true });
} else {
  initializeMobileNavigation();
}
