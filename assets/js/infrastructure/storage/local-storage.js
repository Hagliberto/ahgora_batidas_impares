/**
 * local-storage.js
 * Persistência e restauração local dos dados importados.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function persist() {
  try {
    localStorage.setItem(
      "batidasImparesDataV3",
      JSON.stringify({
        rows: state.raw,
        fileName: state.fileName,
        at: Date.now(),
      }),
    );
  } catch (e) {}
}
function restore() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("batidasImparesDataV3") ||
        localStorage.getItem("batidasImparesDataV2") ||
        "null",
    );
    if (saved?.rows?.length) {
      state.raw = saved.rows.map((r) => ({
        ...r,
        dateObj: r.dateValue ? new Date(r.dateValue) : null,
      }));
      state.fileName = saved.fileName || "Dados restaurados";
      return true;
    }
  } catch (e) {}
  return false;
}
