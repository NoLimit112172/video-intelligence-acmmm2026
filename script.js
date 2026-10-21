"use strict";

// Navigation remains usable with a keyboard and closes after choosing a section.
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");
function closeMenu() {
  if (!menuButton || !navigation) return;
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
}
if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const open = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  const navigationLinks = Array.from(navigation.querySelectorAll('a[href^="#"]'));
  function selectNavigation(hash) {
    navigationLinks.forEach(link => {
      const selected = link.getAttribute("href") === hash;
      link.classList.toggle("current", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  navigationLinks.forEach(link => link.addEventListener("click", () => {
    // Keep the chosen underline while the pointer leaves and the page scrolls.
    selectNavigation(link.getAttribute("href"));
    closeMenu();
  }));
  window.addEventListener("hashchange", () => selectNavigation(window.location.hash));
  selectNavigation(window.location.hash);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && navigation.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener("click", event => {
    if (event.target instanceof Element && !event.target.closest(".site-header")) closeMenu();
  });
}

// Pointer coordinates drive decorative layers; frames run only while easing.
const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let motionEnabled = !reducedMotion.matches;
let pointerFrame = 0;
let lastPointerTime = 0;
let currentX = 0;
let currentY = 0;
let targetX = 0;
let targetY = 0;
const waveArea = document.querySelector(".hero-waves");
const waveLayers = Array.from(document.querySelectorAll(".wave-layer"));
let waveRate = 1;
let targetWaveRate = 1;
let waveRateFrame = 0;
let lastWaveRateTime = 0;

function applyWaveRate() {
  // Changing playback rate preserves the current phase of each CSS animation.
  waveLayers.forEach(layer => layer.getAnimations().forEach(animation => {
    animation.updatePlaybackRate(waveRate);
  }));
}
function easeWaveRate(time) {
  waveRateFrame = 0;
  if (!motionEnabled || document.hidden || hero?.dataset.inView === "false") {
    calmWaves();
    return;
  }
  const elapsed = lastWaveRateTime ? Math.min(time - lastWaveRateTime, 50) : 16.67;
  lastWaveRateTime = time;
  waveRate += (targetWaveRate - waveRate) * (1 - Math.exp(-elapsed / 160));
  const settled = Math.abs(targetWaveRate - waveRate) < 0.005;
  if (settled) {
    waveRate = targetWaveRate;
    lastWaveRateTime = 0;
  }
  applyWaveRate();
  if (!settled) waveRateFrame = requestAnimationFrame(easeWaveRate);
}
function setWaveSpeed(fast) {
  targetWaveRate = fast && motionEnabled && finePointer.matches ? 2.5 : 1;
  if (waveArea) waveArea.dataset.speed = targetWaveRate > 1 ? "fast" : "slow";
  if (!waveRateFrame) waveRateFrame = requestAnimationFrame(easeWaveRate);
}
function calmWaves() {
  if (waveRateFrame) cancelAnimationFrame(waveRateFrame);
  waveRateFrame = 0;
  lastWaveRateTime = 0;
  waveRate = targetWaveRate = 1;
  if (waveArea) waveArea.dataset.speed = "slow";
  applyWaveRate();
}
if (waveArea) {
  waveArea.dataset.speed = "slow";
  waveArea.addEventListener("pointerenter", event => {
    if (event.pointerType !== "touch") setWaveSpeed(true);
  });
  waveArea.addEventListener("pointerleave", () => setWaveSpeed(false));
  waveArea.addEventListener("pointercancel", calmWaves);
}

function writePointer() {
  if (!hero) return;
  hero.style.setProperty("--pointer-x", currentX.toFixed(4));
  hero.style.setProperty("--pointer-y", currentY.toFixed(4));
}
function stopPointer() {
  if (pointerFrame) cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  lastPointerTime = 0;
  currentX = currentY = targetX = targetY = 0;
  writePointer();
}
function easePointer(time) {
  pointerFrame = 0;
  if (!motionEnabled || !finePointer.matches || document.hidden) {
    stopPointer();
    return;
  }
  const elapsed = lastPointerTime ? Math.min(time - lastPointerTime, 50) : 16.67;
  lastPointerTime = time;
  const blend = 1 - Math.exp(-elapsed / 85);
  currentX += (targetX - currentX) * blend;
  currentY += (targetY - currentY) * blend;
  const settled = Math.abs(targetX - currentX) < 0.0005 && Math.abs(targetY - currentY) < 0.0005;
  if (settled) {
    currentX = targetX;
    currentY = targetY;
    lastPointerTime = 0;
  }
  writePointer();
  if (!settled) pointerFrame = requestAnimationFrame(easePointer);
}
function queuePointer() {
  if (!pointerFrame && motionEnabled && finePointer.matches && !document.hidden) {
    pointerFrame = requestAnimationFrame(easePointer);
  }
}
function updateMotion() {
  if (reducedMotion.matches) motionEnabled = false;
  if (hero) hero.dataset.motion = motionEnabled ? "enabled" : "paused";
  if (!motionEnabled) {
    stopPointer();
    calmWaves();
  }
}
if (hero) {
  writePointer();
  if ("IntersectionObserver" in window) {
    const heroVisibility = new IntersectionObserver(entries => {
      const inView = entries[0].isIntersecting;
      hero.dataset.inView = String(inView);
      if (!inView) {
        stopPointer();
        calmWaves();
      }
    });
    heroVisibility.observe(hero);
  }
  hero.addEventListener("pointermove", event => {
    if (!motionEnabled || !finePointer.matches || event.pointerType === "touch") return;
    const bounds = hero.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    targetX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1));
    targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1));
    queuePointer();
  }, { passive: true });
  hero.addEventListener("pointerleave", () => {
    targetX = targetY = 0;
    queuePointer();
  });
  hero.addEventListener("pointercancel", stopPointer);
}
function observeMedia(query, callback) {
  if (query.addEventListener) query.addEventListener("change", callback);
  else if (query.addListener) query.addListener(callback);
}
observeMedia(reducedMotion, () => {
  // Decorative motion follows the system preference without a page-level toggle.
  motionEnabled = !reducedMotion.matches;
  updateMotion();
});
observeMedia(finePointer, () => {
  if (!finePointer.matches) {
    stopPointer();
    calmWaves();
  }
});
document.addEventListener("visibilitychange", () => {
  if (hero) hero.dataset.pageVisible = String(!document.hidden);
  if (document.hidden) {
    stopPointer();
    calmWaves();
  }
});
if (hero) hero.dataset.pageVisible = String(!document.hidden);
updateMotion();

const agendaItems = Array.from(document.querySelectorAll(".agenda-item"));
const agendaButton = document.querySelector("#agenda-toggle");
function updateAgendaButton() {
  if (!agendaButton) return;
  const allOpen = agendaItems.length > 0 && agendaItems.every(item => item.open);
  agendaButton.textContent = allOpen ? "Collapse all" : "Expand all";
  agendaButton.setAttribute("aria-expanded", String(allOpen));
}
if (agendaButton) agendaButton.addEventListener("click", () => {
  const open = !agendaItems.every(item => item.open);
  agendaItems.forEach(item => { item.open = open; });
  updateAgendaButton();
});
agendaItems.forEach(item => item.addEventListener("toggle", updateAgendaButton));
updateAgendaButton();

// Category and search are applied together, including authors and venues.
const filters = Array.from(document.querySelectorAll("[data-filter]"));
const papers = Array.from(document.querySelectorAll(".paper"));
const paperSearch = document.querySelector("#paper-search");
const readingStatus = document.querySelector("#reading-status");
const readingEmpty = document.querySelector("#reading-empty");
const readingReset = document.querySelector("#reading-reset");
const initialFilter = filters.find(button => button.getAttribute("aria-pressed") === "true");
let selectedFilter = initialFilter ? initialFilter.dataset.filter : "all";
const normalizeSearch = text => text.toLocaleLowerCase("en").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const paperText = new Map(papers.map(paper => [paper, normalizeSearch(paper.textContent)]));
function updateReading() {
  const query = paperSearch ? paperSearch.value.trim() : "";
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  let visible = 0;
  papers.forEach(paper => {
    const matchesTopic = selectedFilter === "all" || paper.dataset.topic === selectedFilter;
    const matchesSearch = terms.every(term => paperText.get(paper).includes(term));
    paper.hidden = !matchesTopic || !matchesSearch;
    if (!paper.hidden) visible++;
  });
  filters.forEach(button => {
    const active = button.dataset.filter === selectedFilter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (readingStatus) {
    readingStatus.textContent = `Showing ${visible} of ${papers.length} papers${query ? ` matching “${query}”` : ""}.`;
  }
  if (readingEmpty) readingEmpty.hidden = visible !== 0;
}
filters.forEach(button => button.addEventListener("click", () => {
  selectedFilter = button.dataset.filter;
  updateReading();
}));
if (paperSearch) {
  paperSearch.addEventListener("input", updateReading);
  paperSearch.addEventListener("keydown", event => {
    if (event.key === "Escape" && paperSearch.value) {
      paperSearch.value = "";
      updateReading();
      event.preventDefault();
    }
  });
}
if (readingReset) readingReset.addEventListener("click", () => {
  if (paperSearch) paperSearch.value = "";
  selectedFilter = "all";
  updateReading();
  if (paperSearch) paperSearch.focus();
});
updateReading();
