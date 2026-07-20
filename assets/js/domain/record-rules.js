/**
 * record-rules.js
 * Regras puras de normalização, datas, matrícula, departamento e status.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function normalizeText(v) {
  return String(v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
function escapeHtml(v) {
  return String(v ?? "").replace(
    /[&<>"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
}
function extractSix(v) {
  const digits = String(v ?? "").replace(/\D/g, "");
  return (
    digits.slice(-6).padStart(Math.min(6, digits.length), "0") ||
    String(v ?? "").slice(-6)
  );
}
function parseDateValue(v) {
  if (v instanceof Date && !isNaN(v)) return v;
  if (typeof v === "number" && v > 20000 && v < 80000) {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
    );
  }
  const s = String(v ?? "").trim();
  if (!s) return null;
  let m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (m) {
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    return isNaN(d) ? null : d;
  }
  m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
function formatDate(d) {
  return d
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(d)
    : "";
}
function departmentParts(v) {
  const s = String(v ?? "").trim(),
    m = s.match(/^([^\s-]+)\s*-\s*(.*)$/);
  return m ? { code: m[1], name: m[2] } : { code: "", name: s };
}
function statusGroup(s) {
  const n = normalizeText(s);
  if (n.includes("gestor")) return "gestor";
  if (n.includes("colaborador") || n.includes("empregado"))
    return "empregado";
  return "outro";
}
function statusClass(s) {
  const g = statusGroup(s);
  return g === "empregado"
    ? "status-colab"
    : g === "gestor"
      ? "status-gestor"
      : "status-other";
}
function statusColor(s) {
  const g = statusGroup(s);
  return g === "empregado"
    ? "#0e7490"
    : g === "gestor"
      ? "#b42318"
      : "#b54708";
}
function cardStatusClass(s) {
  const g = statusGroup(s);
  return g === "empregado"
    ? "status-card-employee"
    : g === "gestor"
      ? "status-card-manager"
      : "status-card-other";
}
