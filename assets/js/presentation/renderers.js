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
    statuses = [
      ...new Set(state.filtered.map((r) => r.status).filter(Boolean)),
    ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));

  return `<div class="cards-toolbar"><div class="cards-toolbar-copy"><strong>Visão agrupada por empregado</strong><span>${totalEmployees.toLocaleString("pt-BR")} empregado(s) • ${totalOccurrences.toLocaleString("pt-BR")} pendência(s). Use os pills para refinar o recorte.</span></div><div class="cards-toolbar-pills"><button class="record-filter-pill accent ${!state.quickStatus ? "active" : ""}" data-card-toolbar-filter="all">Todos <strong>${totalOccurrences}</strong></button>${statuses
    .map((status) => {
      const count = state.filtered.filter((r) => r.status === status).length;
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

function pageCardGroups() {
  const groups = groupRecordsByEmployee(),
    start = (state.currentPage - 1) * state.pageSize;
  return groups.slice(start, start + state.pageSize);
}

function renderEmployeeCard(group) {
  const primary = group.records[0],
    department = departmentParts(group.departamento),
    statusCounts = new Map();

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
    occurrenceRows = group.records
      .map((record, index) => {
        const iso = record.dateObj
          ? `${record.dateObj.getFullYear()}-${String(record.dateObj.getMonth() + 1).padStart(2, "0")}-${String(record.dateObj.getDate()).padStart(2, "0")}`
          : "";
        return `<div class="employee-occurrence-row"><button class="occurrence-date-pill" type="button" data-card-filter="date" data-value="${escapeHtml(iso)}"><span>${escapeHtml(record.dia || "—")}</span><small>Dia ${index + 1} de ${group.records.length}</small></button><div class="occurrence-status"><span class="status-pill ${statusClass(record.status)}">${escapeHtml(record.status)}</span></div><div class="occurrence-location" title="${escapeHtml(record.localizacoes || "")}">${escapeHtml(record.localizacoes || "Localização não informada")}</div><button class="detail-btn occurrence-detail-btn" data-card-id="${record.id}" title="Abrir detalhes da ocorrência"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></button></div>`;
      })
      .join("");

  return `<article class="employee-record-card ${recurrence ? "is-recurrent" : ""} ${cardStatusClass(primary.status)}"><div class="employee-card-accent"></div><div class="employee-card-top"><div class="employee-card-identity"><span class="mat-pill large centered">${escapeHtml(group.matricula)}</span><div><h3>${escapeHtml(group.nome || "Sem nome")}</h3><p>${escapeHtml(group.cargo || "Cargo não informado")}</p></div></div>${recurrenceBadge}</div><div class="employee-card-filter-row"><button class="record-filter-pill dept-filter" type="button" data-card-filter="dept" data-value="${escapeHtml(group.departamento || "")}">${escapeHtml(department.code || department.name || "Departamento")}</button>${statusPills}</div><div class="employee-card-department"><span>Departamento</span><strong>${escapeHtml((department.code ? department.code + " — " : "") + (department.name || "Não informado"))}</strong></div><details class="employee-occurrences" ${group.records.length <= 4 ? "open" : ""}><summary><span>Pendências do empregado</span><strong>${group.records.length}</strong><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></summary><div class="employee-occurrence-list">${occurrenceRows}</div></details></article>`;
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
    ? `${buildCardsToolbar()}<div class="employee-cards-grid">${groups
        .map(renderEmployeeCard)
        .join("")}</div>`
    : "";

  $$('[data-card-id]').forEach((button) =>
    button.addEventListener("click", () => openDetails(button.dataset.cardId)),
  );

  $$('[data-card-filter]').forEach((button) =>
    button.addEventListener("click", () =>
      applyCardFilter(button.dataset.cardFilter, button.dataset.value || ""),
    ),
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

function buildCalendarMonth(monthDate, bounds, recordsByDay, sideLabel) {
  const year = monthDate.getFullYear(),
    month = monthDate.getMonth(),
    firstDayIndex = new Date(year, month, 1).getDay(),
    totalDays = new Date(year, month + 1, 0).getDate(),
    weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  let html = `<section class="calendar-month-card"><div class="calendar-month-head"><div><h3>${new Date(year, month).toLocaleString("pt-BR", { month: "long", year: "numeric" })}</h3><p>${sideLabel}</p></div><span class="calendar-month-range">${month === bounds.startMonth.getMonth() && year === bounds.startMonth.getFullYear() ? "21 até o fim do mês" : "1 a 20 do mês"}</span></div><div class="calendar-grid dual">`;

  weekdays.forEach(
    (w) => (html += `<div class="calendar-day-head">${w}</div>`),
  );

  for (let i = 0; i < firstDayIndex; i++)
    html += '<div class="calendar-cell other-month"></div>';

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month, day),
      dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      dayRecords = recordsByDay[dateStr] || [];

    const inPeriod =
      dateObj.getTime() >= bounds.startDate.getTime() &&
      dateObj.getTime() <= bounds.endDate.getTime();

    html += `<div class="calendar-cell ${inPeriod ? "period-active" : "period-muted"}" onclick="window.focusOnDay('${dateStr}')"><div class="calendar-cell-top"><div class="calendar-cell-num">${day}</div>${dayRecords.length ? `<span class="calendar-count-pill">${dayRecords.length}</span>` : ""}</div><div class="calendar-badges-wrap">${dayRecords
      .map((r) => {
        const bg =
          statusGroup(r.status) === "empregado"
            ? "var(--cyan)"
            : statusGroup(r.status) === "gestor"
              ? "var(--red)"
              : "var(--amber)";
        return `<div class="calendar-badge" style="background:${bg}" title="${escapeHtml(r.nome || "Sem nome")} • Matrícula: ${escapeHtml(r.matricula)} • Status: ${escapeHtml(r.status)}" onclick="event.stopPropagation(); window.openDetails('${r.id}')">${escapeHtml((r.nome || "Sem nome").split(" ")[0])}</div>`;
      })
      .join("")}</div></div>`;
  }

  const totalCellsWritten = firstDayIndex + totalDays;
  const rem = totalCellsWritten % 7;
  if (rem > 0) {
    for (let i = 0; i < 7 - rem; i++)
      html += '<div class="calendar-cell other-month"></div>';
  }

  html += "</div></section>";
  return html;
}

function resolveOperationalPeriod(rows) {
  const dates = rows
    .map((r) => r.dateObj)
    .filter(Boolean)
    .sort((a, b) => a - b);
  const ref = dates[0] || new Date();
  const startMonth =
    ref.getDate() >= 21
      ? new Date(ref.getFullYear(), ref.getMonth(), 1)
      : new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const endMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 1);
  const startDate = new Date(startMonth.getFullYear(), startMonth.getMonth(), 21);
  const endDate = new Date(endMonth.getFullYear(), endMonth.getMonth(), 20);
  return { startMonth, endMonth, startDate, endDate };
}

function renderCalendar() {
  const container = $("#calendarView"),
    table = $("#tableWrap"),
    cards = $("#cardsView"),
    empty = $("#emptyState"),
    pag = $("#paginationWrapper");
  if (state.view !== "calendar") {
    container.style.display = "none";
    pag.style.display = "flex";
    return;
  }

  table.style.display = "none";
  cards.classList.remove("show");
  pag.style.display = "none";

  const rows = state.filtered;
  if (!rows.length) {
    container.style.display = "none";
    empty.classList.add("show");
    return;
  }

  container.style.display = "block";
  empty.classList.remove("show");

  const bounds = resolveOperationalPeriod(rows);
  const recordsByDay = {};

  rows.forEach((r) => {
    if (!r.dateObj) return;
    const dateStr = `${r.dateObj.getFullYear()}-${String(r.dateObj.getMonth() + 1).padStart(2, "0")}-${String(r.dateObj.getDate()).padStart(2, "0")}`;
    if (!recordsByDay[dateStr]) recordsByDay[dateStr] = [];
    recordsByDay[dateStr].push(r);
  });

  const statusLegend = { empregado: 0, gestor: 0, outro: 0 };
  rows.forEach((record) => {
    const group = statusGroup(record.status);
    statusLegend[group === "empregado" || group === "gestor" ? group : "outro"]++;
  });

  container.innerHTML = `<div class="period-calendar-shell"><div class="period-calendar-header"><div><h3>Calendário operacional da competência</h3><p>Visualização de ${formatDate(bounds.startDate)} a ${formatDate(bounds.endDate)} com destaque apenas para o período efetivo de conferência.</p></div><div class="period-calendar-legend"><span class="legend-pill active">Período em destaque: 21 → 20</span><span class="legend-pill muted">Dias fora do período ficam em cinza claro</span></div></div><div class="calendar-status-legend" aria-label="Legenda por responsável da pendência"><span class="calendar-status-key employee"><i></i><span>Pendente do empregado</span><strong>${statusLegend.empregado}</strong></span><span class="calendar-status-key manager"><i></i><span>Pendente do gestor</span><strong>${statusLegend.gestor}</strong></span><span class="calendar-status-key other"><i></i><span>Outras situações</span><strong>${statusLegend.outro}</strong></span></div><div class="period-calendar-pair">${buildCalendarMonth(bounds.startMonth, bounds, recordsByDay, "Mês de abertura do período")} ${buildCalendarMonth(bounds.endMonth, bounds, recordsByDay, "Mês de fechamento do período")}</div></div>`;
}

function renderPagination() {
  const totalItems =
      state.view === "cards"
        ? groupRecordsByEmployee().length
        : state.filtered.length,
    itemLabel = state.view === "cards" ? "empregado(s)" : "registro(s)",
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
