/**
 * renderers.js
 * Renderização dos indicadores, ranking, tabela, cards, calendário e detalhes.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function renderStats() {
  const base = state.raw,
    counts = new Map();
  base.forEach((r) =>
    counts.set(r.matricula, (counts.get(r.matricula) || 0) + 1),
  );
  const repeated = [...counts].filter(([, n]) => n > 1).map(([m]) => m),
    deptMap = new Map(),
    dateMap = new Map();
  base.forEach((r) => {
    deptMap.set(r.departamento, (deptMap.get(r.departamento) || 0) + 1);
    dateMap.set(r.dateValue, (dateMap.get(r.dateValue) || 0) + 1);
  });
  const topDept = [...deptMap].sort((a, b) => b[1] - a[1])[0] || [
      "",
      0,
    ],
    latest = [...dateMap]
      .filter(([d]) => d)
      .sort((a, b) => b[0] - a[0])[0] || [0, 0];
  const colab = base.filter(
      (r) => statusGroup(r.status) === "empregado",
    ).length,
    gestor = base.filter(
      (r) => statusGroup(r.status) === "gestor",
    ).length;
  const items = [
    {
      key: "all",
      label: "Todas as ocorrências",
      value: base.length,
      foot: "Exibir o arquivo completo",
      accent: "#174ea6",
      soft: "#eaf2ff",
      icon: icons.all,
      filter: null,
    },
    {
      key: "colab",
      label: "Pendente do Empregado",
      value: colab,
      foot: "Aguardando ação do empregado",
      accent: "#0e7490",
      soft: "#e7f8fc",
      icon: icons.person,
      filter: { type: "status", value: "empregado" },
    },
    {
      key: "gestor",
      label: "Pendente do Gestor",
      value: gestor,
      foot: "Aguardando ação da gestão",
      accent: "#b42318",
      soft: "#fff0ef",
      icon: icons.manager,
      filter: { type: "status", value: "gestor" },
    },
    {
      key: "repeat",
      label: "Reincidentes",
      value: base.filter((r) => repeated.includes(r.matricula)).length,
      foot: `${repeated.length} matrícula(s) com repetição`,
      accent: "#5b43b5",
      soft: "#f0edff",
      icon: icons.repeat,
      filter: { type: "repeat", mats: repeated },
    },
    {
      key: "dept",
      label: "Maior concentração",
      value: topDept[1],
      foot: departmentParts(topDept[0]).name || "Sem departamento",
      accent: "#067647",
      soft: "#eafaf2",
      icon: icons.dept,
      filter: { type: "dept", value: topDept[0] },
    },
    {
      key: "date",
      label: "Dia mais recente",
      value: latest[1],
      foot: latest[0] ? formatDate(new Date(latest[0])) : "Sem data",
      accent: "#b54708",
      soft: "#fff7e8",
      icon: icons.calendar,
      filter: { type: "date", value: latest[0] },
    },
  ];
  $("#statsGrid").innerHTML = items
    .map(
      (i) =>
        `<button class="stat ${state.statFilter?.key === i.key ? "active" : ""}" data-stat="${i.key}" style="--accent:${i.accent};--accent-soft:${i.soft}"><div class="stat-head"><span>${i.label}</span><span class="stat-icon">${i.icon}</span></div><div class="stat-value">${Number(i.value).toLocaleString("pt-BR")}</div><div class="stat-foot" title="${escapeHtml(i.foot)}">${escapeHtml(i.foot)}</div><span class="stat-filter-hint">filtrar</span></button>`,
    )
    .join("");
  $$("#statsGrid .stat").forEach((b, idx) =>
    b.addEventListener("click", () => {
      const item = items[idx];
      if (item.key === "all" || state.statFilter?.key === item.key)
        state.statFilter = null;
      else state.statFilter = { key: item.key, ...item.filter };
      state.currentPage = 1;
      renderQuickFilters();
      applyFilters();
    }),
  );
}

function renderRanking() {
  const data = employeeCounts(),
    max = data[0]?.count || 1;
  $("#rankingList").innerHTML = data.length
    ? data
        .map(
          (r, i) =>
            `<div class="rank-item"><div class="rank-pos">${i + 1}</div><div class="rank-name"><strong title="${escapeHtml(r.nome)}">${escapeHtml(r.nome || "Sem nome")}</strong><span>${escapeHtml(r.matricula)}</span><div class="rank-bar"><i style="width:${(r.count / max) * 100}%"></i></div></div><div class="rank-count">${r.count}</div></div>`,
        )
        .join("")
    : '<div class="card-sub">Nenhum colaborador no recorte.</div>';
}

function renderDistribution() {
  const map = new Map();
  state.filtered.forEach((r) =>
    map.set(r.status, (map.get(r.status) || 0) + 1),
  );
  const data = [...map].sort((a, b) => b[1] - a[1]),
    total = state.filtered.length || 1;
  $("#statusDistribution").innerHTML = data.length
    ? data
        .map(
          ([s, n]) =>
            `<div class="dist-row"><div><div class="dist-label"><span><i class="dist-dot" style="background:${statusColor(s)}"></i>${escapeHtml(s)}</span><span>${Math.round((n / total) * 100)}%</span></div><div class="dist-track"><i style="width:${(n / total) * 100}%;background:${statusColor(s)}"></i></div></div><span class="dist-value">${n}</span></div>`,
        )
        .join("")
    : '<div class="card-sub">Nenhum status no recorte.</div>';
}

function pageRows() {
  const start = (state.currentPage - 1) * state.pageSize;
  return state.filtered.slice(start, start + state.pageSize);
}

function renderTable() {
  const rows = pageRows(),
    table = $("#tableWrap"),
    empty = $("#emptyState");
  if (state.view !== "table") {
    table.style.display = "none";
    return;
  }
  table.style.display = rows.length ? "block" : "none";
  empty.classList.toggle("show", !rows.length);
  $("#tableBody").innerHTML = rows
    .map((r) => {
      const p = departmentParts(r.departamento);
      return `<tr><td><button class="detail-btn" data-id="${r.id}" title="Ver detalhes"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></button></td><td>${escapeHtml(r.dia || "—")}</td><td class="mat-col"><span class="mat-pill">${escapeHtml(r.matricula)}</span></td><td>${escapeHtml(r.nome || "—")}</td><td><span class="status-pill ${statusClass(r.status)}">${escapeHtml(r.status)}</span></td><td class="dept-cell">${p.code ? `<span class="dept-code">${escapeHtml(p.code)}</span>` : ""}${escapeHtml(p.name || "—")}</td><td>${escapeHtml(r.cargo || "—")}</td><td class="location-cell" title="${escapeHtml(r.localizacoes)}">${escapeHtml(r.localizacoes || "—")}</td></tr>`;
    })
    .join("");
  $$("#tableBody .detail-btn").forEach((b) =>
    b.addEventListener("click", () => openDetails(b.dataset.id)),
  );
}

function buildCardsToolbar() {
  const totalOccurrences = state.filtered.length,
    totalEmployees = groupRecordsByEmployee().length,
    totalDepartments = groupRecordsByDepartment().length,
    statuses = [
      ...new Set(state.filtered.map((record) => record.status).filter(Boolean)),
    ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));

  const groupingLabel =
      state.cardGrouping === "department"
        ? `${totalDepartments.toLocaleString("pt-BR")} departamento(s) • ${totalEmployees.toLocaleString("pt-BR")} empregado(s)`
        : `${totalEmployees.toLocaleString("pt-BR")} empregado(s) • ${totalOccurrences.toLocaleString("pt-BR")} pendência(s)`,
    departmentToggle =
      state.cardGrouping === "department"
        ? `<button class="department-toggle-all has-tooltip" type="button" data-department-toggle-all aria-label="Abrir todos os departamentos" data-tooltip="Abrir todos os departamentos"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="m8 10 4 4 4-4"/></svg><span>Abrir todos</span></button>`
        : "";

  return `<div class="cards-toolbar enhanced"><div class="cards-toolbar-copy"><strong>${state.cardGrouping === "department" ? "Visão agrupada por departamento" : "Visão agrupada por empregado"}</strong><span>${groupingLabel}. As pendências são organizadas em colunas para facilitar a conferência.</span></div><div class="cards-grouping-actions"><div class="cards-grouping-switch" role="group" aria-label="Agrupamento dos cards"><button type="button" data-card-grouping="employee" class="${state.cardGrouping === "employee" ? "active" : ""}" aria-pressed="${state.cardGrouping === "employee"}"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"/></svg><span>Por empregado</span></button><button type="button" data-card-grouping="department" class="${state.cardGrouping === "department" ? "active" : ""}" aria-pressed="${state.cardGrouping === "department"}"><svg viewBox="0 0 24 24"><path d="M4 21V7l8-4 8 4v14"/><path d="M8 10h2m4 0h2M8 14h2m4 0h2M8 18h8"/></svg><span>Por departamento</span></button></div>${departmentToggle}</div><div class="cards-toolbar-pills"><button class="record-filter-pill accent ${!state.quickStatus ? "active" : ""}" data-card-toolbar-filter="all">Todos <strong>${totalOccurrences}</strong></button>${statuses
    .map((status) => {
      const count = state.filtered.filter((record) => record.status === status).length;
      return `<button class="record-filter-pill ${state.quickStatus === status ? "active" : ""}" data-card-toolbar-filter="status" data-value="${escapeHtml(status)}">${escapeHtml(status)} <strong>${count}</strong></button>`;
    })
    .join("")}</div></div>`;
}

function groupRecordsByEmployee(rows = state.filtered) {
  const groups = new Map();
  rows.forEach((record) => {
    const key = employeeKey(record),
      item = groups.get(key) || {
        key,
        matricula: record.matricula,
        nome: record.nome,
        departamento: record.departamento,
        cargo: record.cargo,
        records: [],
      };
    item.records.push(record);
    groups.set(key, item);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      records: group.records.sort(
        (a, b) => (a.dateValue || 0) - (b.dateValue || 0),
      ),
    }))
    .sort(
      (a, b) =>
        b.records.length - a.records.length ||
        String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"),
    );
}

function groupRecordsByDepartment(rows = state.filtered) {
  const groups = new Map();
  rows.forEach((record) => {
    const key = record.departamento || "Departamento não informado",
      item = groups.get(key) || {
        key,
        departamento: key,
        records: [],
      };
    item.records.push(record);
    groups.set(key, item);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      employees: groupRecordsByEmployee(group.records),
    }))
    .sort((a, b) => {
      const ap = departmentParts(a.departamento),
        bp = departmentParts(b.departamento);
      return String(ap.name || ap.code || "").localeCompare(
        String(bp.name || bp.code || ""),
        "pt-BR",
        { numeric: true },
      );
    });
}

function currentCardGroups() {
  return state.cardGrouping === "department"
    ? groupRecordsByDepartment()
    : groupRecordsByEmployee();
}

function pageCardGroups() {
  const groups = currentCardGroups(),
    start = (state.currentPage - 1) * state.pageSize;
  return groups.slice(start, start + state.pageSize);
}

function renderOccurrenceColumn(record, index, total) {
  const iso = record.dateObj
    ? `${record.dateObj.getFullYear()}-${String(record.dateObj.getMonth() + 1).padStart(2, "0")}-${String(record.dateObj.getDate()).padStart(2, "0")}`
    : "";
  return `<article class="employee-occurrence-column ${cardStatusClass(record.status)}"><div class="occurrence-column-head"><button class="occurrence-date-pill" type="button" data-card-filter="date" data-value="${escapeHtml(iso)}" title="Filtrar apenas esta data"><span>${escapeHtml(record.dia || "—")}</span><small>Pendência ${index + 1} de ${total}</small></button><button class="detail-btn occurrence-detail-btn" data-card-id="${record.id}" title="Abrir detalhes da ocorrência" aria-label="Abrir detalhes da ocorrência"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></button></div><div class="occurrence-column-status"><span class="status-pill ${statusClass(record.status)}">${escapeHtml(record.status)}</span></div></article>`;
}

function renderEmployeeCard(group, options = {}) {
  const primary = group.records[0],
    department = departmentParts(group.departamento),
    statusCounts = new Map(),
    insideDepartment = Boolean(options.insideDepartment);

  group.records.forEach((record) =>
    statusCounts.set(record.status, (statusCounts.get(record.status) || 0) + 1),
  );

  const recurrence = group.records.length > 1,
    recurrenceBadge = recurrence
      ? `<span class="recurrence-badge"><svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>Reincidente • ${group.records.length} pendências</span>`
      : `<span class="single-occurrence-badge">1 pendência</span>`,
    statusPills = [...statusCounts]
      .map(
        ([status, count]) =>
          `<button class="record-filter-pill status-filter ${statusClass(status)}" type="button" data-card-filter="status" data-value="${escapeHtml(status)}">${escapeHtml(status)} <strong>${count}</strong></button>`,
      )
      .join(""),
    occurrenceColumns = group.records
      .map((record, index) => renderOccurrenceColumn(record, index, group.records.length))
      .join("");

  const departmentFilter = insideDepartment
    ? ""
    : `<button class="record-filter-pill dept-filter" type="button" data-card-filter="dept" data-value="${escapeHtml(group.departamento || "")}" title="Filtrar este departamento">${escapeHtml(department.code || department.name || "Departamento")}</button>`;
  const departmentBlock = insideDepartment
    ? ""
    : `<div class="employee-card-department"><span>Departamento</span><strong>${escapeHtml((department.code ? department.code + " — " : "") + (department.name || "Não informado"))}</strong></div>`;

  return `<article class="employee-record-card ${insideDepartment ? "inside-department" : ""} ${recurrence ? "is-recurrent" : ""} ${cardStatusClass(primary.status)}"><div class="employee-card-accent"></div><div class="employee-card-top"><div class="employee-card-identity"><span class="mat-pill large centered">${escapeHtml(group.matricula)}</span><div><h3>${escapeHtml(group.nome || "Sem nome")}</h3><p>${escapeHtml(group.cargo || "Cargo não informado")}</p></div></div>${recurrenceBadge}</div><div class="employee-card-filter-row">${departmentFilter}${statusPills}</div>${departmentBlock}<details class="employee-occurrences" open><summary><span>Pendências do empregado</span><strong>${group.records.length}</strong><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></summary><div class="employee-occurrence-list column-layout">${occurrenceColumns}</div></details></article>`;
}

function renderDepartmentGroup(group) {
  const department = departmentParts(group.departamento),
    employeeCount = group.employees.length,
    occurrenceCount = group.records.length,
    departmentName =
      (department.code ? `${department.code} — ` : "") +
      (department.name || group.departamento || "Não informado"),
    departmentValue = escapeHtml(group.departamento || "");

  return `<details class="department-card-group department-expander" data-department-group="${departmentValue}"><summary class="department-group-head"><div class="department-group-icon"><svg viewBox="0 0 24 24"><path d="M4 21V7l8-4 8 4v14"/><path d="M8 10h2m4 0h2M8 14h2m4 0h2M8 18h8"/></svg></div><div class="department-group-copy"><span>${escapeHtml(department.code || "DEPARTAMENTO")}</span><h3>${escapeHtml(department.name || group.departamento || "Não informado")}</h3><p>${employeeCount.toLocaleString("pt-BR")} empregado(s) • ${occurrenceCount.toLocaleString("pt-BR")} pendência(s)</p></div><div class="department-group-actions"><button class="record-filter-pill dept-filter" type="button" data-card-filter="dept" data-value="${departmentValue}" title="Exibir somente este departamento"><svg viewBox="0 0 24 24"><path d="M4 5h16l-6 7v5l-4 2v-7z"/></svg><span>Filtrar</span></button><div class="department-export-control"><button class="department-export-trigger" type="button" data-department-export-toggle="${departmentValue}" aria-expanded="false" title="Exportar somente os dados deste departamento"><svg class="department-export-main-icon" viewBox="0 0 24 24"><path d="M12 3v12m0 0-4-4m4 4 4-4"/><path d="M5 19h14"/></svg><span>Exportar</span><svg class="department-export-caret" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="department-export-menu" data-department-export-menu="${departmentValue}" role="menu" hidden><div class="department-export-menu-head"><strong>Exportar departamento</strong><span>${escapeHtml(departmentName)}</span><small>Os arquivos respeitam os demais filtros ativos.</small></div><button type="button" role="menuitem" data-department-export-format="pdf" data-department="${departmentValue}"><span class="department-export-format-icon pdf"><svg viewBox="0 0 24 24"><path d="M6 2h9l3 3v17H6z"/><path d="M15 2v4h4M8.5 15h7M8.5 18h5M8.5 11h7"/></svg></span><span><strong>PDF</strong><small>Relatório em paisagem</small></span></button><button type="button" role="menuitem" data-department-export-format="png" data-department="${departmentValue}"><span class="department-export-format-icon png"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4 17 5-5 4 4 2-2 5 4"/></svg></span><span><strong>PNG</strong><small>Imagem detalhada</small></span></button><button type="button" role="menuitem" data-department-export-format="xlsx" data-department="${departmentValue}"><span class="department-export-format-icon xlsx"><svg viewBox="0 0 24 24"><path d="M6 2h9l3 3v17H6z"/><path d="M15 2v4h4M9 11l5 6m0-6-5 6"/></svg></span><span><strong>XLSX</strong><small>Planilha com três abas</small></span></button></div></div><span class="department-expander-chevron" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></div></summary><div class="department-employees-grid">${group.employees
    .map((employee) => renderEmployeeCard(employee, { insideDepartment: true }))
    .join("")}</div></details>`;
}

function closeDepartmentExportMenus(exceptMenu = null) {
  $$('[data-department-export-menu]').forEach((menu) => {
    if (menu === exceptMenu) return;
    menu.hidden = true;
    const control = menu.closest('.department-export-control'),
      trigger = control?.querySelector('[data-department-export-toggle]');
    trigger?.setAttribute('aria-expanded', 'false');
    control?.classList.remove('open');
  });
}

function departmentExportContext(departmentValue) {
  const group = groupRecordsByDepartment().find(
      (item) => item.departamento === departmentValue,
    ),
    department = departmentParts(departmentValue),
    displayName =
      (department.code ? `${department.code} — ` : "") +
      (department.name || departmentValue || "Departamento não informado");
  return {
    rows: group?.records || [],
    scopeLabel: `Departamento ${displayName}`,
    fileToken: `departamento_${displayName}`,
    title: `Batidas Ímpares — ${displayName}`,
  };
}

function updateDepartmentToggleAllButton() {
  const button = $("[data-department-toggle-all]"),
    expanders = $$(".department-expander");
  if (!button || !expanders.length) return;
  const allOpen = expanders.every((expander) => expander.open),
    label = button.querySelector("span");
  button.classList.toggle("all-open", allOpen);
  button.setAttribute(
    "aria-label",
    allOpen ? "Fechar todos os departamentos" : "Abrir todos os departamentos",
  );
  button.dataset.tooltip = allOpen
    ? "Fechar todos os departamentos"
    : "Abrir todos os departamentos";
  if (label) label.textContent = allOpen ? "Fechar todos" : "Abrir todos";
}

function toggleAllDepartmentExpanders() {
  const expanders = $$(".department-expander");
  if (!expanders.length) return;
  const shouldOpen = !expanders.every((expander) => expander.open);
  expanders.forEach((expander) => (expander.open = shouldOpen));
  updateDepartmentToggleAllButton();
}

function bindCardControls() {
  $$('[data-card-id]').forEach((button) =>
    button.addEventListener("click", () => openDetails(button.dataset.cardId)),
  );

  $$('[data-card-filter]').forEach((button) =>
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyCardFilter(button.dataset.cardFilter, button.dataset.value || "");
    }),
  );

  $$('[data-card-toolbar-filter]').forEach((button) =>
    button.addEventListener("click", () => {
      if (button.dataset.cardToolbarFilter === "all") {
        $("#statusFilter").value = "";
        state.quickStatus = "";
        state.statFilter = null;
        state.currentPage = 1;
        renderQuickFilters();
        applyFilters();
        return;
      }
      applyCardFilter(
        button.dataset.cardToolbarFilter,
        button.dataset.value || "",
      );
    }),
  );

  $$('[data-card-grouping]').forEach((button) =>
    button.addEventListener("click", () => {
      const grouping = button.dataset.cardGrouping;
      if (!["employee", "department"].includes(grouping)) return;
      state.cardGrouping = grouping;
      state.currentPage = 1;
      renderCards();
      renderPagination();
      if (typeof saveUiPreferences === "function") saveUiPreferences();
    }),
  );

  $("[data-department-toggle-all]")?.addEventListener(
    "click",
    toggleAllDepartmentExpanders,
  );
  $$(".department-expander").forEach((expander) =>
    expander.addEventListener("toggle", updateDepartmentToggleAllButton),
  );
  updateDepartmentToggleAllButton();

  $$('[data-department-export-toggle]').forEach((button) =>
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const control = button.closest('.department-export-control'),
        menu = control?.querySelector('[data-department-export-menu]'),
        willOpen = Boolean(menu?.hidden);
      closeDepartmentExportMenus(willOpen ? menu : null);
      if (!menu) return;
      menu.hidden = !willOpen;
      button.setAttribute('aria-expanded', String(willOpen));
      control.classList.toggle('open', willOpen);
    }),
  );

  $$('[data-department-export-format]').forEach((button) =>
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const context = departmentExportContext(button.dataset.department || ""),
        format = button.dataset.departmentExportFormat;
      closeDepartmentExportMenus();
      if (format === "pdf") exportPdf(context);
      if (format === "png") exportPng(context);
      if (format === "xlsx") exportXlsx(context);
    }),
  );

  if (!window.__departmentExportOutsideBound) {
    document.addEventListener("click", (event) => {
      if (!event.target.closest('.department-export-control'))
        closeDepartmentExportMenus();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDepartmentExportMenus();
    });
    window.__departmentExportOutsideBound = true;
  }
}

function renderCards() {
  const groups = pageCardGroups(),
    cards = $("#cardsView"),
    empty = $("#emptyState");
  cards.classList.toggle(
    "show",
    state.view === "cards" && groups.length > 0,
  );
  if (state.view !== "cards") {
    cards.innerHTML = "";
    return;
  }

  empty.classList.toggle("show", !groups.length);
  cards.innerHTML = groups.length
    ? `${buildCardsToolbar()}<div class="${state.cardGrouping === "department" ? "department-groups-list" : "employee-cards-grid"}">${groups
        .map((group) =>
          state.cardGrouping === "department"
            ? renderDepartmentGroup(group)
            : renderEmployeeCard(group),
        )
        .join("")}</div>`
    : "";

  bindCardControls();
}

function applyCardFilter(type, value) {
  if (!value && type !== "all") return;
  if (type === "status") {
    $("#statusFilter").value = value;
    state.quickStatus = value;
    state.statFilter = null;
    renderQuickFilters();
  }
  if (type === "dept") $("#deptFilter").value = value;
  if (type === "date") {
    $("#dateFrom").value = value;
    $("#dateTo").value = value;
  }
  state.currentPage = 1;
  applyFilters();
}

const CALENDAR_EXPANDERS_KEY = "batidasImparesCalendarMonthsV1";

function readCalendarExpanderPreferences() {
  try {
    const value = JSON.parse(
      localStorage.getItem(CALENDAR_EXPANDERS_KEY) || "null",
    );
    return value && typeof value === "object"
      ? value
      : { opening: true, closing: true };
  } catch {
    return { opening: true, closing: true };
  }
}

function saveCalendarExpanderPreferences() {
  const preferences = {};
  $$("#calendarMonthPair .calendar-month-expander").forEach((panel) => {
    preferences[panel.dataset.calendarKey] = panel.open;
  });
  localStorage.setItem(CALENDAR_EXPANDERS_KEY, JSON.stringify(preferences));
}

function calendarDayTooltip(dateObj, dayRecords, inPeriod) {
  const label = formatDate(dateObj),
    period = inPeriod ? "dentro do período 21 → 20" : "fora do período operacional";
  if (!dayRecords.length)
    return `${label} • ${period} • sem pendências no recorte atual`;

  const groups = { empregado: 0, gestor: 0, outro: 0 };
  dayRecords.forEach((record) => {
    const group = statusGroup(record.status);
    groups[group === "empregado" || group === "gestor" ? group : "outro"]++;
  });
  const parts = [];
  if (groups.empregado) parts.push(`${groups.empregado} do empregado`);
  if (groups.gestor) parts.push(`${groups.gestor} do gestor`);
  if (groups.outro) parts.push(`${groups.outro} outra(s)`);
  return `${label} • ${period} • ${dayRecords.length} pendência(s): ${parts.join(", ")} • clique para filtrar o dia`;
}

function buildCalendarMonth(
  monthDate,
  bounds,
  recordsByDay,
  sideLabel,
  calendarKey,
) {
  const year = monthDate.getFullYear(),
    month = monthDate.getMonth(),
    firstDayIndex = new Date(year, month, 1).getDay(),
    totalDays = new Date(year, month + 1, 0).getDate(),
    weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    monthLabel = new Date(year, month).toLocaleString("pt-BR", {
      month: "long",
      year: "numeric",
    }),
    rangeLabel =
      month === bounds.startMonth.getMonth() &&
      year === bounds.startMonth.getFullYear()
        ? "21 até o fim do mês"
        : "1 a 20 do mês",
    preferences = readCalendarExpanderPreferences(),
    open = preferences[calendarKey] !== false,
    monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`,
    monthRecords = Object.entries(recordsByDay)
      .filter(([date]) => date.startsWith(monthPrefix))
      .reduce((sum, [, records]) => sum + records.length, 0),
    tone = calendarKey === "opening" ? "opening" : "closing";

  let html = `<details class="calendar-month-expander ${tone}" data-calendar-key="${calendarKey}" ${open ? "open" : ""}><summary class="calendar-month-trigger"><span class="calendar-month-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/><path d="M8 14h3m2 0h3m-8 3h3"/></svg></span><span class="calendar-month-copy"><strong>${monthLabel}</strong><small>${sideLabel}</small></span><span class="calendar-month-meta"><span class="calendar-month-total">${monthRecords} pendência(s)</span><span class="calendar-month-range">${rangeLabel}</span></span><span class="calendar-month-chevron"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></summary><div class="calendar-month-body"><div class="calendar-month-help"><span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>Clique no número do dia para filtrar. Passe o mouse sobre dias e pendências para visualizar detalhes.</span></div><div class="calendar-grid dual">`;

  weekdays.forEach(
    (weekday) =>
      (html += `<div class="calendar-day-head">${weekday}</div>`),
  );

  for (let index = 0; index < firstDayIndex; index++)
    html += '<div class="calendar-cell other-month" aria-hidden="true"></div>';

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month, day),
      dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayRecords = recordsByDay[dateStr] || [],
      inPeriod =
        dateObj.getTime() >= bounds.startDate.getTime() &&
        dateObj.getTime() <= bounds.endDate.getTime(),
      tooltip = calendarDayTooltip(dateObj, dayRecords, inPeriod);

    html += `<div class="calendar-cell ${inPeriod ? "period-active" : "period-muted"}"><button type="button" class="calendar-day-button has-tooltip" data-tooltip="${escapeHtml(tooltip)}" aria-label="${escapeHtml(tooltip)}" onclick="window.focusOnDay('${dateStr}')"><span class="calendar-cell-num">${day}</span>${dayRecords.length ? `<span class="calendar-count-pill">${dayRecords.length}</span>` : ""}</button><div class="calendar-badges-wrap">${dayRecords
      .slice(0, 3)
      .map((record) => {
        const group = statusGroup(record.status),
          badgeClass =
            group === "empregado"
              ? "employee"
              : group === "gestor"
                ? "manager"
                : "other",
          badgeTooltip = `${record.nome || "Sem nome"} • matrícula ${record.matricula || "—"} • ${record.status || "Status não informado"} • clique para abrir os detalhes`;
        return `<button type="button" class="calendar-badge ${badgeClass} has-tooltip" data-tooltip="${escapeHtml(badgeTooltip)}" aria-label="${escapeHtml(badgeTooltip)}" onclick="event.stopPropagation(); window.openDetails('${record.id}')">${escapeHtml((record.nome || "Sem nome").split(" ")[0])}</button>`;
      })
      .join("")}${dayRecords.length > 3 ? `<span class="calendar-more-badge has-tooltip" data-tooltip="Há mais ${dayRecords.length - 3} pendência(s) neste dia. Clique no número do dia para isolar todas.">+${dayRecords.length - 3} outras</span>` : ""}</div></div>`;
  }

  const totalCellsWritten = firstDayIndex + totalDays,
    remainder = totalCellsWritten % 7;
  if (remainder > 0) {
    for (let index = 0; index < 7 - remainder; index++)
      html += '<div class="calendar-cell other-month" aria-hidden="true"></div>';
  }

  html += "</div></div></details>";
  return html;
}

function updateCalendarMonthLayout(persist = true) {
  const wrapper = $("#calendarMonthPair");
  if (!wrapper) return;
  const panels = $$("#calendarMonthPair .calendar-month-expander"),
    openPanels = panels.filter((panel) => panel.open);
  wrapper.classList.toggle("calendar-layout-double", openPanels.length === 2);
  wrapper.classList.toggle("calendar-layout-single", openPanels.length === 1);
  wrapper.classList.toggle("calendar-layout-closed", openPanels.length === 0);
  panels.forEach((panel) =>
    panel.classList.toggle("is-only-open", openPanels.length === 1 && panel.open),
  );
  if (persist) saveCalendarExpanderPreferences();
}

function bindCalendarMonthExpanders() {
  $$("#calendarMonthPair .calendar-month-expander").forEach((panel) =>
    panel.addEventListener("toggle", () => updateCalendarMonthLayout()),
  );
  $("#calendarOpenAll")?.addEventListener("click", () => {
    $$("#calendarMonthPair .calendar-month-expander").forEach(
      (panel) => (panel.open = true),
    );
    updateCalendarMonthLayout();
  });
  $("#calendarCloseAll")?.addEventListener("click", () => {
    $$("#calendarMonthPair .calendar-month-expander").forEach(
      (panel) => (panel.open = false),
    );
    updateCalendarMonthLayout();
  });
  updateCalendarMonthLayout(false);
}

function resolveOperationalPeriod(rows) {
  const dates = rows
    .map((record) => record.dateObj)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const reference = dates[0] || new Date(),
    startMonth =
      reference.getDate() >= 21
        ? new Date(reference.getFullYear(), reference.getMonth(), 1)
        : new Date(reference.getFullYear(), reference.getMonth() - 1, 1),
    endMonth = new Date(
      startMonth.getFullYear(),
      startMonth.getMonth() + 1,
      1,
    ),
    startDate = new Date(
      startMonth.getFullYear(),
      startMonth.getMonth(),
      21,
    ),
    endDate = new Date(endMonth.getFullYear(), endMonth.getMonth(), 20);
  return { startMonth, endMonth, startDate, endDate };
}

function renderCalendar() {
  const container = $("#calendarView"),
    table = $("#tableWrap"),
    cards = $("#cardsView"),
    empty = $("#emptyState"),
    pagination = $("#paginationWrapper");
  if (state.view !== "calendar") {
    container.style.display = "none";
    pagination.style.display = "flex";
    return;
  }

  table.style.display = "none";
  cards.classList.remove("show");
  pagination.style.display = "none";

  const rows = state.filtered;
  if (!rows.length) {
    container.style.display = "none";
    empty.classList.add("show");
    return;
  }

  container.style.display = "block";
  empty.classList.remove("show");

  const bounds = resolveOperationalPeriod(rows),
    recordsByDay = {};

  rows.forEach((record) => {
    if (!record.dateObj) return;
    const dateStr = `${record.dateObj.getFullYear()}-${String(record.dateObj.getMonth() + 1).padStart(2, "0")}-${String(record.dateObj.getDate()).padStart(2, "0")}`;
    if (!recordsByDay[dateStr]) recordsByDay[dateStr] = [];
    recordsByDay[dateStr].push(record);
  });

  const statusLegend = { empregado: 0, gestor: 0, outro: 0 };
  rows.forEach((record) => {
    const group = statusGroup(record.status);
    statusLegend[group === "empregado" || group === "gestor" ? group : "outro"]++;
  });

  container.innerHTML = `<div class="period-calendar-shell"><div class="period-calendar-header"><div><span class="calendar-kicker">COMPETÊNCIA OPERACIONAL</span><h3>Calendário de ${formatDate(bounds.startDate)} a ${formatDate(bounds.endDate)}</h3><p>Abra ou recolha cada mês de forma independente. Quando somente um calendário estiver aberto, ele ocupará o centro da visualização.</p></div><div class="calendar-panel-actions"><button type="button" id="calendarOpenAll" class="calendar-action-button has-tooltip" data-tooltip="Exibir os dois calendários lado a lado"><svg viewBox="0 0 24 24"><path d="M4 5h7v14H4zM13 5h7v14h-7z"/></svg><span>Abrir ambos</span></button><button type="button" id="calendarCloseAll" class="calendar-action-button has-tooltip" data-tooltip="Recolher os dois calendários e manter apenas os cabeçalhos"><svg viewBox="0 0 24 24"><path d="M5 8h14M7 12h10M9 16h6"/></svg><span>Recolher</span></button></div></div><div class="period-calendar-legend"><span class="legend-pill active">Período em destaque: 21 → 20</span><span class="legend-pill muted">Dias fora do período em cinza claro</span></div><div class="calendar-status-legend" aria-label="Legenda por responsável da pendência"><span class="calendar-status-key employee has-tooltip" data-tooltip="Ocorrências que aguardam ação do empregado"><i></i><span>Pendente do empregado</span><strong>${statusLegend.empregado}</strong></span><span class="calendar-status-key manager has-tooltip" data-tooltip="Ocorrências que aguardam ação da gestão"><i></i><span>Pendente do gestor</span><strong>${statusLegend.gestor}</strong></span><span class="calendar-status-key other has-tooltip" data-tooltip="Demais situações identificadas no arquivo"><i></i><span>Outras situações</span><strong>${statusLegend.outro}</strong></span></div><div class="period-calendar-pair" id="calendarMonthPair">${buildCalendarMonth(bounds.startMonth, bounds, recordsByDay, "Mês de abertura do período", "opening")} ${buildCalendarMonth(bounds.endMonth, bounds, recordsByDay, "Mês de fechamento do período", "closing")}</div></div>`;

  bindCalendarMonthExpanders();
}

function renderPagination() {
  const totalItems =
      state.view === "cards"
        ? currentCardGroups().length
        : state.filtered.length,
    itemLabel =
      state.view === "cards"
        ? state.cardGrouping === "department"
          ? "departamento(s)"
          : "empregado(s)"
        : "registro(s)",
    totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));

  if (state.currentPage > totalPages) state.currentPage = totalPages;

  $("#pageInfo").textContent =
    `Página ${state.currentPage} de ${totalPages} • ${totalItems.toLocaleString("pt-BR")} ${itemLabel}`;
  let pages = [];
  for (let i = 1; i <= totalPages; i++)
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - state.currentPage) <= 2
    )
      pages.push(i);
  pages = [...new Set(pages)];
  let html = `<button class="page-btn" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? "disabled" : ""}>‹</button>`,
    prev = 0;
  for (const page of pages) {
    if (prev && page - prev > 1)
      html += '<span style="padding:0 2px;color:#98a2b3">…</span>';
    html += `<button class="page-btn ${page === state.currentPage ? "active" : ""}" data-page="${page}">${page}</button>`;
    prev = page;
  }
  html += `<button class="page-btn" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? "disabled" : ""}>›</button>`;
  $("#pageControls").innerHTML = html;
  $$("#pageControls .page-btn:not(:disabled)").forEach((button) =>
    button.addEventListener("click", () => {
      state.currentPage = +button.dataset.page;
      renderTable();
      renderCards();
      renderPagination();
      $("#tableWrap").scrollTop = 0;
      $("#cardsView").scrollTop = 0;
    }),
  );
}

function updateSortMarks() {
  $$('[id^="sort-"]').forEach((x) => (x.textContent = ""));
  const mark = $("#sort-" + state.sortKey);
  if (mark) mark.textContent = state.sortDir === "asc" ? "▲" : "▼";
}

function openDetails(id) {
  const r = state.raw.find((x) => x.id === id);
  if (!r) return;
  const employeeOccurrences = state.raw
      .filter((x) => x.matricula === r.matricula)
      .sort((a, b) => (a.dateValue || 0) - (b.dateValue || 0)),
    same = employeeOccurrences.length,
    p = departmentParts(r.departamento),
    occurrenceList =
      same > 1
        ? `<section class="detail-occurrence-section"><div class="detail-section-title">Outras pendências do empregado</div><div class="occurrence-list">${employeeOccurrences
            .map(
              (item) => `<button type="button" class="occurrence-chip ${item.id === r.id ? "active" : ""}" onclick="window.openDetails('${item.id}')"><span>${escapeHtml(item.dia || "—")}</span><small>${escapeHtml(item.status || "Status")}</small></button>`,
            )
            .join("")}</div></section>`
        : "";

  $("#modalContent").innerHTML =
    `<div class="detail-hero"><div><div class="detail-name">${escapeHtml(r.nome || "Sem nome")}</div><div class="detail-mat"><span class="mat-pill large">${escapeHtml(r.matricula)}</span></div></div><span class="status-pill ${statusClass(r.status)}">${escapeHtml(r.status)}</span></div><div class="detail-summary"><div class="detail-summary-pill"><label>Dia da ocorrência</label><strong>${escapeHtml(r.dia || "—")}</strong></div><div class="detail-summary-pill"><label>Total de pendências do empregado</label><strong>${same}</strong></div><div class="detail-summary-pill"><label>Departamento</label><strong>${escapeHtml(p.code || "—")}</strong></div></div><div class="detail-grid"><div class="detail-item"><label>Dia</label><div>${escapeHtml(r.dia || "—")}</div></div><div class="detail-item"><label>Matrícula completa</label><div>${escapeHtml(r.matriculaOriginal || "—")}</div></div><div class="detail-item full"><label>Status</label><div>${escapeHtml(r.status || "—")}</div></div><div class="detail-item full"><label>Departamento</label><div>${escapeHtml((p.code ? p.code + " — " : "") + (p.name || "—"))}</div></div><div class="detail-item full"><label>Cargo</label><div>${escapeHtml(r.cargo || "—")}</div></div><div class="detail-item full"><label>Localizações</label><div>${escapeHtml(r.localizacoes || "—")}</div></div></div>${occurrenceList}`;
  openModal("detailModal");
}
window.openDetails = openDetails;

window.focusOnDay = function (dateStr) {
  $("#dateFrom").value = dateStr;
  $("#dateTo").value = dateStr;

  state.view = "table";

  $$(".segmented button").forEach((x) => {
    x.classList.toggle("active", x.dataset.view === "table");
  });

  state.currentPage = 1;
  applyFilters();

  toast(
    "Dia isolado",
    `Exibindo ocorrências do dia ${formatDate(new Date(dateStr + "T12:00:00"))}`,
  );
};
