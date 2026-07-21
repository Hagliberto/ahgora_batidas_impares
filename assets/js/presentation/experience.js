/**
 * experience.js
 * Preferências essenciais da interface, filtros ativos e atalhos visuais.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

const UI_PREFERENCES_KEY = "batidasImparesUiV2";

function readUiPreferences() {
  try {
    return JSON.parse(localStorage.getItem(UI_PREFERENCES_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveUiPreferences() {
  const accordions = {};
  $$('[data-accordion]').forEach((button) => {
    accordions[button.dataset.accordion] =
      button.getAttribute("aria-expanded") === "true";
  });
  const preferences = {
    view: state.view,
    pageSize: $("#pageSize")?.value || "50",
    cardGrouping: state.cardGrouping,
    accordions,
  };
  localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(preferences));
}

function updateViewControls() {
  $$(".segmented button[data-view]").forEach((button) => {
    const active = button.dataset.view === state.view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function restoreUiPreferences() {
  const preferences = readUiPreferences();
  if (["table", "cards", "calendar"].includes(preferences.view))
    state.view = preferences.view;

  if (preferences.pageSize && $("#pageSize"))
    $("#pageSize").value = String(preferences.pageSize);

  if (["employee", "department"].includes(preferences.cardGrouping))
    state.cardGrouping = preferences.cardGrouping;

  if (preferences.accordions) {
    $$('[data-accordion]').forEach((button) => {
      const targetId = button.dataset.accordion;
      if (!(targetId in preferences.accordions)) return;
      const open = Boolean(preferences.accordions[targetId]),
        target = $("#" + targetId);
      button.setAttribute("aria-expanded", String(open));
      if (target) target.hidden = !open;
    });
  }

  updateViewControls();
}

function activeFilterDescriptors() {
  const filters = [],
    search = $("#searchInput")?.value.trim(),
    status = $("#statusFilter")?.value,
    dept = $("#deptFilter")?.value,
    from = $("#dateFrom")?.value,
    to = $("#dateTo")?.value;

  if (search) filters.push({ key: "search", label: "Busca", value: search });
  if (state.selectedEmployees.size)
    filters.push({
      key: "employees",
      label: "Empregados",
      value: `${state.selectedEmployees.size} selecionado(s)`,
    });
  if (status)
    filters.push({ key: "status", label: "Status", value: status });
  if (dept) {
    const parts = departmentParts(dept);
    filters.push({
      key: "department",
      label: "Departamento",
      value: parts.code ? `${parts.code} — ${parts.name}` : parts.name,
    });
  }
  if (from && to && from === to)
    filters.push({
      key: "dates",
      label: "Dia",
      value: formatDate(new Date(from + "T12:00:00")),
    });
  else if (from || to)
    filters.push({
      key: "dates",
      label: "Período",
      value: `${from ? formatDate(new Date(from + "T12:00:00")) : "início"} → ${to ? formatDate(new Date(to + "T12:00:00")) : "fim"}`,
    });

  if (state.statFilter) {
    const labels = {
      colab: "Pendentes do empregado",
      gestor: "Pendentes do gestor",
      repeat: "Reincidentes",
      dept: "Maior concentração",
      date: "Dia mais recente",
    };
    filters.push({
      key: "stat",
      label: "Indicador",
      value: labels[state.statFilter.key] || "Card selecionado",
    });
  }
  return filters;
}

function renderActiveFilters() {
  const filters = activeFilterDescriptors(),
    shell = $("#activeFilterShell"),
    chips = $("#activeFilterChips");
  if (!shell || !chips) return;
  shell.hidden = !filters.length;
  const contextualClearButton = $("#resultsClearFiltersBtn");
  if (contextualClearButton) {
    contextualClearButton.disabled = !filters.length;
    contextualClearButton.classList.toggle("is-disabled", !filters.length);
  }
  $("#activeFilterCount").textContent = filters.length;
  chips.innerHTML = filters
    .map(
      (filter) =>
        `<button class="active-filter-chip" type="button" data-remove-filter="${filter.key}" title="Remover este filtro"><span><b>${escapeHtml(filter.label)}:</b> ${escapeHtml(filter.value)}</span><i>×</i></button>`,
    )
    .join("");
}

function renderExperienceSummary() {
  renderActiveFilters();
  updateViewControls();
}

function removeActiveFilter(key) {
  if (key === "search") $("#searchInput").value = "";
  if (key === "employees") {
    state.selectedEmployees.clear();
    populateEmployeeOptions();
    closeEmployeeMenu();
  }
  if (key === "status") {
    $("#statusFilter").value = "";
    state.quickStatus = "";
  }
  if (key === "department") $("#deptFilter").value = "";
  if (key === "dates") {
    $("#dateFrom").value = "";
    $("#dateTo").value = "";
  }
  if (key === "stat") state.statFilter = null;
  state.currentPage = 1;
  renderQuickFilters();
  applyFilters();
}

function updateScrollTopButton() {
  const button = $("#scrollTopBtn");
  if (button) button.classList.toggle("show", window.scrollY > 420);
}

function bindExperienceControls() {
  $("#clearActiveFiltersBtn")?.addEventListener("click", resetFilters);
  $("#resultsClearFiltersBtn")?.addEventListener("click", resetFilters);
  $("#emptyImportBtn")?.addEventListener("click", () =>
    $("#fileInput").click(),
  );
  $("#emptyClearFiltersBtn")?.addEventListener("click", resetFilters);
  $("#activeFilterChips")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-filter]");
    if (button) removeActiveFilter(button.dataset.removeFilter);
  });
  $("#scrollTopBtn")?.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" }),
  );
  window.addEventListener("scroll", updateScrollTopButton, { passive: true });
  updateScrollTopButton();
}
