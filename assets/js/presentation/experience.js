/**
 * experience.js
 * Preferências de interface, resumo contextual, filtros ativos e atalhos visuais.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

const UI_PREFERENCES_KEY = "batidasImparesUiV1";

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
    density: document.body.classList.contains("density-compact")
      ? "compact"
      : "comfortable",
    pageSize: $("#pageSize")?.value || "50",
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

function updateDensityControl() {
  const compact = document.body.classList.contains("density-compact"),
    button = $("#densityBtn");
  if (!button) return;
  button.setAttribute("aria-pressed", String(compact));
  button.title = compact
    ? "Usar espaçamento confortável"
    : "Usar visualização compacta";
}

function updateSectionsControl() {
  const button = $("#toggleSectionsBtn");
  if (!button) return;
  const hasCollapsed = $$('[data-accordion]').some(
    (item) => item.getAttribute("aria-expanded") !== "true",
  );
  const label = button.querySelector("span");
  if (label) label.textContent = hasCollapsed ? "Expandir" : "Recolher";
  button.title = hasCollapsed
    ? "Expandir todas as seções"
    : "Recolher todas as seções";
}

function restoreUiPreferences() {
  const preferences = readUiPreferences();
  if (["table", "cards", "calendar"].includes(preferences.view))
    state.view = preferences.view;

  document.body.classList.toggle(
    "density-compact",
    preferences.density === "compact",
  );

  if (preferences.pageSize && $("#pageSize"))
    $("#pageSize").value = String(preferences.pageSize);

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
  updateDensityControl();
  updateSectionsControl();
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
  $("#activeFilterCount").textContent = filters.length;
  chips.innerHTML = filters
    .map(
      (filter) =>
        `<button class="active-filter-chip" type="button" data-remove-filter="${filter.key}" title="Remover este filtro"><span><b>${escapeHtml(filter.label)}:</b> ${escapeHtml(filter.value)}</span><i>×</i></button>`,
    )
    .join("");
}

function renderExperienceSummary() {
  const file = state.fileName || "Nenhum arquivo",
    rows = state.filtered.length ? state.filtered : state.raw,
    employees = new Set(state.filtered.map((record) => employeeKey(record)))
      .size;

  if ($("#contextFileName")) {
    $("#contextFileName").textContent = file;
    $("#contextFileName").title = file;
  }
  if ($("#contextPeriod"))
    $("#contextPeriod").textContent = dateRangeText(rows);
  if ($("#contextRecords"))
    $("#contextRecords").textContent = state.filtered.length.toLocaleString(
      "pt-BR",
    );
  if ($("#contextEmployees"))
    $("#contextEmployees").textContent = employees.toLocaleString("pt-BR");

  renderActiveFilters();
  updateViewControls();
  updateDensityControl();
  updateSectionsControl();
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

function toggleAllAccordions() {
  const buttons = $$('[data-accordion]'),
    shouldOpen = buttons.some(
      (button) => button.getAttribute("aria-expanded") !== "true",
    );
  buttons.forEach((button) => {
    const target = $("#" + button.dataset.accordion);
    button.setAttribute("aria-expanded", String(shouldOpen));
    if (target) target.hidden = !shouldOpen;
  });
  updateSectionsControl();
  saveUiPreferences();
}

function openGlobalSearch() {
  const analysis = $('[data-accordion="analysisBody"]');
  if (analysis && analysis.getAttribute("aria-expanded") !== "true")
    toggleAccordion(analysis);
  openCompactSearch();
}

function toggleDensity() {
  document.body.classList.toggle("density-compact");
  updateDensityControl();
  saveUiPreferences();
  toast(
    "Densidade alterada",
    document.body.classList.contains("density-compact")
      ? "Visualização compacta ativada."
      : "Espaçamento confortável restaurado.",
  );
}

function updateScrollTopButton() {
  const button = $("#scrollTopBtn");
  if (button) button.classList.toggle("show", window.scrollY > 420);
}

function bindExperienceControls() {
  $("#quickSearchBtn")?.addEventListener("click", openGlobalSearch);
  $("#toggleSectionsBtn")?.addEventListener("click", toggleAllAccordions);
  $("#densityBtn")?.addEventListener("click", toggleDensity);
  $("#clearActiveFiltersBtn")?.addEventListener("click", resetFilters);
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
