/**
 * ui-helpers.js
 * Utilidades compartilhadas de interface e controle de feedback.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function formatDateTimeBr(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function fileStamp() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}_${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}.${String(d.getSeconds()).padStart(2, "0")}`;
}
function showLoading(t = "Processando...") {
  $("#loadingText").textContent = t;
  $("#loading").classList.add("show");
}
function hideLoading() {
  $("#loading").classList.remove("show");
}
function toast(title, message = "", type = "success", duration = 3400) {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<div><strong>${escapeHtml(title)}</strong>${message ? `<span>${escapeHtml(message)}</span>` : ""}</div>`;
  $("#toastWrap").append(el);
  setTimeout(() => el.remove(), duration);
}
function debounce(fn, wait = 180) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
function openModal(id) {
  $("#" + id).classList.add("open");
}
function closeModal(id) {
  $("#" + id).classList.remove("open");
}
