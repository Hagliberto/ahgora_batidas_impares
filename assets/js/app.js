/**
 * app.js
 * Bootstrap da aplicação.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function init() {
  if (typeof restoreUiPreferences === "function") restoreUiPreferences();
  bind();
  if (restore()) {
    loadData(state.raw, state.fileName, false);
    toast(
      "Dados restaurados",
      "A última importação salva neste navegador foi recuperada.",
    );
  } else
    loadData(
      normalizeRows(SAMPLE_DATA),
      "Amostra fictícia incorporada",
      false,
    );
}
init();
