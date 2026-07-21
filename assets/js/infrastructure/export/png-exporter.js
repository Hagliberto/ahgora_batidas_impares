/**
 * png-exporter.js
 * Geração do relatório PNG detalhado.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

async function exportPng() {
  if (!ensureData()) return;
  showLoading("Gerando imagem PNG detalhada...");
  try {
    const chunks = [];
    for (let i = 0; i < state.filtered.length; i += 300)
      chunks.push(state.filtered.slice(i, i + 300));
    for (let pi = 0; pi < chunks.length; pi++) {
      const rows = chunks[pi],
        scale = 2,
        width = 1800,
        rowH = 38,
        headerH = 210,
        height = headerH + rowH * (rows.length + 1) + 45,
        canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#174ea6";
      ctx.font = "bold 27px Arial";
      ctx.fillText("Relatório de Batidas Ímpares", 34, 42);
      ctx.fillStyle = "#667085";
      ctx.font = "14px Arial";
      ctx.fillText(
        `${state.filtered.length} ocorrência(s) • ${dateRangeText(state.filtered)} • Gerado em ${formatDateTimeBr()} • ${state.fileName}`,
        34,
        66,
      );
      if (chunks.length > 1)
        ctx.fillText(`Parte ${pi + 1} de ${chunks.length}`, 1600, 42);
      const cards = [
        ["Ocorrências", state.filtered.length, "#eaf2ff", "#174ea6"],
        [
          "Colaboradores",
          new Set(state.filtered.map((r) => r.matricula)).size,
          "#f0edff",
          "#5b43b5",
        ],
        [
          "Pend. empregado",
          state.filtered.filter(
            (r) => statusGroup(r.status) === "empregado",
          ).length,
          "#e7f8fc",
          "#0e7490",
        ],
        [
          "Pend. gestor",
          state.filtered.filter(
            (r) => statusGroup(r.status) === "gestor",
          ).length,
          "#fff0ef",
          "#b42318",
        ],
      ];
      let cx = 34;
      for (const [lab, val, bg, fg] of cards) {
        ctx.fillStyle = bg;
        ctx.fillRect(cx, 88, 270, 82);
        ctx.fillStyle = fg;
        ctx.font = "bold 26px Arial";
        ctx.fillText(String(val), cx + 16, 125);
        ctx.font = "bold 12px Arial";
        ctx.fillText(lab.toUpperCase(), cx + 16, 151);
        cx += 286;
      }
      const cols = [
        ["Dia", 120, "#5b43b5"],
        ["Matrícula", 130, "#314b9c"],
        ["Nome", 300, "#165b9f"],
        ["Status", 230, "#b4233a"],
        ["Departamento", 620, "#167049"],
        ["Cargo", 330, "#b56a10"],
      ];
      let x = 34,
        y = 188;
      ctx.font = "bold 13px Arial";
      for (const [h, w, color] of cols) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, rowH);
        ctx.fillStyle = "#fff";
        ctx.fillText(h, x + 10, y + 24);
        x += w;
      }
      y += rowH;
      ctx.font = "12px Arial";
      for (const r of rows) {
        x = 34;
        const vals = [
            r.dateObj ? formatDate(r.dateObj) : r.dia,
            r.matricula,
            r.nome,
            r.status,
            r.departamento,
            r.cargo,
          ],
          fills = [
            "#fbf9ff",
            "#f8f9ff",
            "#f7fbff",
            statusGroup(r.status) === "empregado"
              ? "#e7f8fc"
              : statusGroup(r.status) === "gestor"
                ? "#ffe5e8"
                : "#fff7e8",
            "#f8fdf9",
            "#fffdf8",
          ];
        cols.forEach(([h, w], i) => {
          ctx.fillStyle = fills[i];
          ctx.fillRect(x, y, w, rowH);
          ctx.strokeStyle = "#dfe6f1";
          ctx.strokeRect(x, y, w, rowH);
          ctx.save();
          ctx.beginPath();
          ctx.rect(x + 7, y + 2, w - 14, rowH - 4);
          ctx.clip();
          ctx.fillStyle =
            i === 3
              ? statusGroup(r.status) === "gestor"
                ? "#9f2634"
                : statusGroup(r.status) === "empregado"
                  ? "#116879"
                  : "#8a4b08"
              : "#243247";
          ctx.font = (i === 1 || i === 3 ? "bold " : "") + "12px Arial";
          ctx.fillText(String(vals[i] ?? ""), x + 9, y + 24);
          ctx.restore();
          x += w;
        });
        y += rowH;
      }
      ctx.fillStyle = "#7b8798";
      ctx.font = "11px Arial";
      ctx.fillText(
        `Gerado localmente em ${formatDateTimeBr()} • Colunas e status diferenciados por cor.`,
        34,
        height - 18,
      );
      const blob = await new Promise((res) =>
        canvas.toBlob(res, "image/png"),
      );
      downloadBlob(
        blob,
        `batidas_impares_detalhado_${fileStamp()}${chunks.length > 1 ? `_parte_${pi + 1}` : ""}.png`,
      );
      await new Promise((r) => setTimeout(r, 180));
    }
    toast(
      "PNG gerado",
      chunks.length > 1
        ? `${chunks.length} imagens foram geradas.`
        : "Imagem detalhada criada com sucesso.",
    );
  } catch (e) {
    toast("Erro ao gerar PNG", e.message, "error", 5000);
  } finally {
    hideLoading();
  }
}
