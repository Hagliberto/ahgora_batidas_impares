/**
 * controller.js
 * Controladores de interação, importação, navegação e atalhos.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

async function handleFile(file) {
  if (!file) return;
  showLoading(`Lendo ${file.name}...`);
  try {
    const rows = await readFile(file);
    loadData(rows, file.name, true);
    toast(
      "Arquivo importado",
      `${rows.length} registro(s) identificado(s).`,
    );
  } catch (e) {
    toast("Falha na importação", e.message, "error", 5500);
  } finally {
    hideLoading();
    $("#fileInput").value = "";
  }
}
function resetFilters() {
  ["searchInput", "dateFrom", "dateTo"].forEach(
    (id) => ($("#" + id).value = ""),
  );
  ["statusFilter", "deptFilter"].forEach(
    (id) => ($("#" + id).value = ""),
  );
  state.selectedEmployees.clear();
  populateEmployeeOptions();
  closeEmployeeMenu();
  closeCompactSearch();
  state.quickStatus = "";
  state.statFilter = null;
  state.currentPage = 1;
  renderQuickFilters();
  applyFilters();
  closeModal("manageModal");
  toast("Filtros limpos", "A visualização completa foi restaurada.");
}
function clearData() {
  if (
    !confirm(
      "Deseja remover os dados carregados e apagar a cópia salva neste navegador?",
    )
  )
    return;
  state.raw = [];
  state.filtered = [];
  state.fileName = "Nenhum arquivo";
  state.statFilter = null;
  state.selectedEmployees.clear();
  localStorage.removeItem("batidasImparesDataV3");
  localStorage.removeItem("batidasImparesDataV2");
  populateFilters();
  applyFilters();
  $("#fileNamePill").textContent = "Nenhum arquivo";
  $("#loadedAtPill").textContent = "0 registros";
  $("#dropZone").classList.add("show");
  updateImportButton();
  closeModal("manageModal");
  toast(
    "Dados removidos",
    "O painel está pronto para uma nova importação.",
  );
}
function showDashboard() {
  $("#welcomeScreen").hidden = true;
  $("#appShell").hidden = false;
  document.body.classList.remove("welcome-mode");
  window.scrollTo({ top: 0, behavior: "auto" });
}
function showWelcome() {
  $("#appShell").hidden = true;
  $("#welcomeScreen").hidden = false;
  document.body.classList.add("welcome-mode");
  window.scrollTo({ top: 0, behavior: "auto" });
}
function toggleAccordion(button) {
  const target = $("#" + button.dataset.accordion),
    open = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!open));
  target.hidden = open;
  if (typeof updateSectionsControl === "function") updateSectionsControl();
  if (typeof saveUiPreferences === "function") saveUiPreferences();
}
function openCompactSearch() {
  const shell = $("#compactSearch");
  shell.classList.add("open");
  setTimeout(() => $("#searchInput").focus(), 0);
}
function closeCompactSearch() {
  const shell = $("#compactSearch");
  if (!$("#searchInput").value) shell.classList.remove("open");
}
function openEmployeeMenu() {
  const btn = $("#employeeSelectBtn"),
    menu = $("#employeeMenu");
  menu.classList.add("open");
  btn.classList.add("open");
  btn.setAttribute("aria-expanded", "true");
}
function closeEmployeeMenu() {
  const btn = $("#employeeSelectBtn"),
    menu = $("#employeeMenu");
  menu.classList.remove("open");
  btn.classList.remove("open");
  btn.setAttribute("aria-expanded", "false");
}
function toggleEmployeeMenu() {
  if ($("#employeeMenu").classList.contains("open"))
    closeEmployeeMenu();
  else openEmployeeMenu();
}
function bind() {
  if (typeof bindExperienceControls === "function") bindExperienceControls();
  $("#importBtn").addEventListener("click", () =>
    $("#fileInput").click(),
  );
  $("#dropZone").addEventListener("click", () =>
    $("#fileInput").click(),
  );
  $("#dropZone").addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") $("#fileInput").click();
  });
  $("#fileInput").addEventListener("change", (e) =>
    handleFile(e.target.files[0]),
  );
  ["dragenter", "dragover"].forEach((ev) =>
    document.addEventListener(ev, (e) => {
      e.preventDefault();
      $("#dropZone").classList.add("drag", "show");
    }),
  );
  ["dragleave", "drop"].forEach((ev) =>
    document.addEventListener(ev, (e) => {
      e.preventDefault();
      $("#dropZone").classList.remove("drag");
    }),
  );
  document.addEventListener("drop", (e) =>
    handleFile(e.dataTransfer.files[0]),
  );
  $("#exportMenuBtn").addEventListener("click", () =>
    openModal("exportModal"),
  );
  $("#manageMenuBtn").addEventListener("click", () =>
    openModal("manageModal"),
  );
  $("#clearFiltersChoice").addEventListener("click", resetFilters);
  $("#clearDataChoice").addEventListener("click", clearData);
  $$("[data-export]").forEach((b) =>
    b.addEventListener("click", () => {
      closeModal("exportModal");
      const t = b.dataset.export;
      if (t === "pdf") exportPdf();
      if (t === "png") exportPng();
      if (t === "xlsx") exportXlsx();
    }),
  );
  $$(".modal-close").forEach((b) =>
    b.addEventListener("click", () => closeModal(b.dataset.close)),
  );
  $$(".modal").forEach((m) =>
    m.addEventListener("click", (e) => {
      if (e.target === m) closeModal(m.id);
    }),
  );
  $("#enterDashboardBtn").addEventListener("click", showDashboard);
  $("#homeGuideBtn").addEventListener("click", showWelcome);
  $$("[data-accordion]").forEach((b) =>
    b.addEventListener("click", () => toggleAccordion(b)),
  );
  const deb = debounce(() => {
    state.currentPage = 1;
    applyFilters();
  });
  $("#searchInput").addEventListener("input", deb);
  $("#searchToggleBtn").addEventListener("click", openCompactSearch);
  $("#searchCloseBtn").addEventListener("click", () => {
    if ($("#searchInput").value) {
      $("#searchInput").value = "";
      state.currentPage = 1;
      applyFilters();
    }
    closeCompactSearch();
  });
  $("#employeeSelectBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleEmployeeMenu();
  });
  $("#employeeMenu").addEventListener("click", (e) =>
    e.stopPropagation(),
  );
  $("#employeeOptions").addEventListener("change", (e) => {
    if (!e.target.matches("input[type=checkbox]")) return;
    const key = e.target.value;
    if (e.target.checked) state.selectedEmployees.add(key);
    else state.selectedEmployees.delete(key);
    updateEmployeeTrigger();
    state.currentPage = 1;
    applyFilters();
  });
  $("#employeeSelectAll").addEventListener("click", () => {
    $$("#employeeOptions input[type=checkbox]").forEach((cb) => {
      cb.checked = true;
      state.selectedEmployees.add(cb.value);
    });
    updateEmployeeTrigger();
    state.currentPage = 1;
    applyFilters();
  });
  $("#employeeClearAll").addEventListener("click", () => {
    $$("#employeeOptions input[type=checkbox]").forEach(
      (cb) => (cb.checked = false),
    );
    state.selectedEmployees.clear();
    updateEmployeeTrigger();
    state.currentPage = 1;
    applyFilters();
  });
  document.addEventListener("click", (e) => {
    if (!$("#employeeMultiselect").contains(e.target))
      closeEmployeeMenu();
  });
  [
    "statusFilter",
    "deptFilter",
    "dateFrom",
    "dateTo",
    "pageSize",
  ].forEach((id) =>
    $("#" + id).addEventListener("change", () => {
      if (id === "statusFilter") {
        state.quickStatus = $("#statusFilter").value;
        state.statFilter = null;
        renderQuickFilters();
      }
      state.currentPage = 1;
      applyFilters();
      if (id === "pageSize" && typeof saveUiPreferences === "function")
        saveUiPreferences();
    }),
  );
  $("#fullscreenBtn").addEventListener("click", () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen(),
  );
  $$("#dataTable th[data-sort]").forEach((th) =>
    th.addEventListener("click", () => {
      const k = th.dataset.sort;
      if (state.sortKey === k)
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      else {
        state.sortKey = k;
        state.sortDir = k === "dateValue" ? "desc" : "asc";
      }
      sortFiltered();
      state.currentPage = 1;
      renderTable();
      renderCards();
      renderPagination();
      updateSortMarks();
    }),
  );

  $$(".segmented button").forEach((b) =>
    b.addEventListener("click", () => {
      state.view = b.dataset.view;
      state.currentPage = 1;
      $$(".segmented button").forEach((x) => {
        const active = x === b;
        x.classList.toggle("active", active);
        x.setAttribute("aria-pressed", String(active));
      });
      renderTable();
      renderCards();
      renderCalendar();
      renderPagination();
      if (typeof renderExperienceSummary === "function")
        renderExperienceSummary();
      if (typeof saveUiPreferences === "function") saveUiPreferences();
    }),
  );

  document.addEventListener("keydown", (e) => {
    if (!$("#appShell").hidden && e.key === "Escape") {
      const open = $(".modal.open");
      if (open) closeModal(open.id);
      else resetFilters();
    }
    if (
      !$("#appShell").hidden &&
      e.key === "/" &&
      !["INPUT", "SELECT", "TEXTAREA"].includes(
        document.activeElement.tagName,
      )
    ) {
      e.preventDefault();
      if (typeof openGlobalSearch === "function") openGlobalSearch();
      else openCompactSearch();
    }
  });
}
