/**
 * dashboard-service.js
 * Casos de uso de carregamento, filtros, ordenação e agregações.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function updateImportButton() {
  $("#importBtnLabel").textContent = state.raw.length
    ? "Trocar arquivo"
    : "Importar arquivo";
}
function loadData(rows, fileName, save = true) {
  state.raw = rows;
  state.fileName = fileName;
  state.currentPage = 1;
  state.quickStatus = "";
  state.statFilter = null;
  state.selectedEmployees.clear();
  $("#fileNamePill").textContent = fileName;
  $("#loadedAtPill").textContent =
    `${rows.length.toLocaleString("pt-BR")} registros`;
  populateFilters();
  if (save) persist();
  applyFilters();
  $("#dropZone").classList.remove("show");
  updateImportButton();
}
function uniqueSorted(key) {
  return [
    ...new Set(state.raw.map((r) => r[key]).filter(Boolean)),
  ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
}
function fillSelect(id, values, placeholder, format = (v) => v) {
  const el = $(id),
    current = el.value;
  el.innerHTML =
    `<option value="">${escapeHtml(placeholder)}</option>` +
    values
      .map(
        (v) =>
          `<option value="${escapeHtml(v)}">${escapeHtml(format(v))}</option>`,
      )
      .join("");
  if (values.includes(current)) el.value = current;
}
function employeeKey(r) {
  return `${r.matricula}|${r.nome}`;
}
function updateEmployeeTrigger() {
  const count = state.selectedEmployees.size,
    text = $("#employeeSelectText"),
    badge = $("#employeeSelectBadge");
  if (!count) text.textContent = "Todos os colaboradores";
  else if (count === 1) {
    const key = [...state.selectedEmployees][0],
      r = state.raw.find((x) => employeeKey(x) === key);
    text.textContent = r
      ? `${r.matricula} — ${r.nome}`
      : "1 colaborador selecionado";
  } else text.textContent = `${count} colaboradores selecionados`;
  badge.textContent = count;
  badge.classList.toggle("show", count > 0);
}
function populateEmployeeOptions() {
  const people = [
      ...new Map(state.raw.map((r) => [employeeKey(r), r])).values(),
    ].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")),
    valid = new Set(people.map(employeeKey));
  state.selectedEmployees = new Set(
    [...state.selectedEmployees].filter((k) => valid.has(k)),
  );
  $("#employeeOptions").innerHTML = people.length
    ? people
        .map((r) => {
          const key = employeeKey(r),
            checked = state.selectedEmployees.has(key) ? "checked" : "";
          return `<label class="employee-option"><input type="checkbox" value="${escapeHtml(key)}" ${checked}><span><strong>${escapeHtml(r.nome || "Sem nome")}</strong><span>${escapeHtml(r.matricula)}</span></span></label>`;
        })
        .join("")
    : '<div class="employee-empty">Nenhum colaborador disponível.</div>';
  updateEmployeeTrigger();
}
function populateFilters() {
  fillSelect(
    "#statusFilter",
    uniqueSorted("status"),
    "Todos os status",
  );
  fillSelect(
    "#deptFilter",
    uniqueSorted("departamento"),
    "Todos os departamentos",
    (v) => {
      const p = departmentParts(v);
      return p.code ? `${p.code} — ${p.name}` : p.name;
    },
  );
  populateEmployeeOptions();
  renderQuickFilters();
}
function renderQuickFilters() {
  const statuses = uniqueSorted("status"),
    total = state.raw.length;
  $("#quickFilters").innerHTML =
    `<button class="quick-pill ${!state.quickStatus && !state.statFilter ? "active" : ""}" data-status="">Todos <strong>${total}</strong></button>` +
    statuses
      .map((s) => {
        const count = state.raw.filter((r) => r.status === s).length;
        return `<button class="quick-pill ${state.quickStatus === s && !state.statFilter ? "active" : ""}" data-status="${escapeHtml(s)}">${escapeHtml(s)} <strong>${count}</strong></button>`;
      })
      .join("");
  $$("#quickFilters .quick-pill").forEach((b) =>
    b.addEventListener("click", () => {
      state.statFilter = null;
      state.quickStatus = b.dataset.status;
      $("#statusFilter").value = state.quickStatus;
      state.currentPage = 1;
      renderQuickFilters();
      applyFilters();
    }),
  );
}
function applyStatFilter(r) {
  const f = state.statFilter;
  if (!f) return true;
  if (f.type === "status") return statusGroup(r.status) === f.value;
  if (f.type === "repeat") return f.mats.includes(r.matricula);
  if (f.type === "dept") return r.departamento === f.value;
  if (f.type === "date") return r.dateValue === f.value;
  return true;
}
function applyFilters() {
  const q = normalizeText($("#searchInput").value),
    status = $("#statusFilter").value,
    dept = $("#deptFilter").value,
    from = $("#dateFrom").value
      ? new Date($("#dateFrom").value + "T00:00:00").getTime()
      : null,
    to = $("#dateTo").value
      ? new Date($("#dateTo").value + "T23:59:59").getTime()
      : null;
  state.pageSize = +$("#pageSize").value || 50;
  state.filtered = state.raw.filter((r) => {
    if (
      q &&
      !normalizeText(
        [
          r.dia,
          r.matricula,
          r.matriculaOriginal,
          r.nome,
          r.status,
          r.departamento,
          r.cargo,
          r.localizacoes,
        ].join(" "),
      ).includes(q)
    )
      return false;
    if (status && r.status !== status) return false;
    if (dept && r.departamento !== dept) return false;
    if (
      state.selectedEmployees.size &&
      !state.selectedEmployees.has(employeeKey(r))
    )
      return false;
    if (from !== null && (!r.dateValue || r.dateValue < from))
      return false;
    if (to !== null && (!r.dateValue || r.dateValue > to)) return false;
    return applyStatFilter(r);
  });
  state.quickStatus = status;
  sortFiltered();
  const itemCount =
      state.view === "cards"
        ? new Set(state.filtered.map((record) => employeeKey(record))).size
        : state.filtered.length,
    pages = Math.max(1, Math.ceil(itemCount / state.pageSize));
  if (state.currentPage > pages) state.currentPage = pages;
  renderAll();
}
function sortFiltered() {
  const dir = state.sortDir === "asc" ? 1 : -1,
    key = state.sortKey;
  state.filtered.sort((a, b) => {
    let av = a[key] ?? "",
      bv = b[key] ?? "";
    if (typeof av === "number" && typeof bv === "number")
      return (av - bv) * dir;
    return (
      String(av).localeCompare(String(bv), "pt-BR", {
        numeric: true,
        sensitivity: "base",
      }) * dir
    );
  });
}
function dateRangeText(rows) {
  const dates = rows
    .map((r) => r.dateValue)
    .filter(Boolean)
    .sort((a, b) => a - b);
  return dates.length
    ? `${formatDate(new Date(dates[0]))} a ${formatDate(new Date(dates.at(-1)))}`
    : "Período não informado";
}
function employeeCounts(rows = state.filtered) {
  const m = new Map();
  rows.forEach((r) => {
    const k = `${r.matricula}|${r.nome}`,
      item = m.get(k) || {
        matricula: r.matricula,
        nome: r.nome,
        count: 0,
      };
    item.count++;
    m.set(k, item);
  });
  return [...m.values()].sort(
    (a, b) =>
      b.count - a.count || a.nome.localeCompare(b.nome, "pt-BR"),
  );
}
function renderAll() {
  renderStats();
  renderRanking();
  renderDistribution();
  renderTable();
  renderCards();
  renderCalendar();
  renderPagination();
  updateSortMarks();
  $("#resultCount").textContent =
    state.filtered.length.toLocaleString("pt-BR");
}
