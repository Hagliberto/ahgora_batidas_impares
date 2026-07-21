/**
 * pdf-exporter.js
 * Geração do relatório PDF detalhado.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

const cp1252Map = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};
function latinBytes(s) {
  const out = [];
  for (const ch of String(s)) {
    const c = ch.codePointAt(0);
    out.push(c <= 255 ? c : (cp1252Map[c] ?? 63));
  }
  return new Uint8Array(out);
}
function pdfEsc(s) {
  return String(s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}
function pdfColor(hex) {
  const v = hex.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16) / 255,
    parseInt(v.slice(2, 4), 16) / 255,
    parseInt(v.slice(4, 6), 16) / 255,
  ]
    .map((n) => n.toFixed(3))
    .join(" ");
}
function wrapChars(text, max) {
  text = String(text ?? "");
  if (text.length <= max) return [text];
  const words = text.split(/\s+/),
    lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length <= max)
      line = (line + " " + w).trim();
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines
    .slice(0, 2)
    .map((l, i) =>
      i === 1 && lines.length > 2
        ? l.slice(0, Math.max(1, max - 1)) + "…"
        : l,
    );
}
function buildPdf() {
  const rows = state.filtered,
    perPage = 15,
    pages = [];
  for (let start = 0; start < rows.length; start += perPage) {
    const part = rows.slice(start, start + perPage),
      pageNo = pages.length + 1;
    let c = "";
    const rect = (x, y, w, h, color, stroke = "#dce3ed") => {
        c += `${pdfColor(color)} rg ${x} ${y} ${w} ${h} re f\n${pdfColor(stroke)} RG ${x} ${y} ${w} ${h} re S\n`;
      },
      text = (x, y, t, size = 7, bold = false, color = "#243247") => {
        c += `${pdfColor(color)} rg BT /F${bold ? 2 : 1} ${size} Tf ${x} ${y} Td (${pdfEsc(t)}) Tj ET\n`;
      };
    text(18, 567, "Relatório de Batidas Ímpares", 15, true, "#174ea6");
    text(
      18,
      552,
      `${rows.length} ocorrência(s) • ${dateRangeText(rows)} • Arquivo: ${state.fileName}`,
      8,
      false,
      "#667085",
    );
    text(
      730,
      567,
      `Página ${pageNo} de ${Math.ceil(rows.length / perPage)}`,
      8,
      true,
      "#667085",
    );
    const cols = [
      ["Dia", 58, "#5b43b5"],
      ["Matrícula", 62, "#314b9c"],
      ["Nome", 150, "#165b9f"],
      ["Status", 112, "#b4233a"],
      ["Departamento", 252, "#167049"],
      ["Cargo", 147, "#b56a10"],
    ];
    let x = 18,
      y = 520;
    for (const [h, w, color] of cols) {
      rect(x, y, w, 24, color, color);
      text(x + 4, y + 8, h, 7, true, "#ffffff");
      x += w;
    }
    y -= 30;
    for (const r of part) {
      x = 18;
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
        rect(x, y, w, 30, fills[i]);
        const lines = wrapChars(
          vals[i],
          Math.max(6, Math.floor(w / (i === 4 ? 4.8 : 5.2))),
        );
        lines.forEach((line, li) =>
          text(
            x + 4,
            y + 18 - li * 9,
            line,
            6.4,
            i === 1 || i === 3,
            i === 3
              ? statusGroup(r.status) === "gestor"
                ? "#9f2634"
                : statusGroup(r.status) === "empregado"
                  ? "#116879"
                  : "#8a4b08"
              : "#243247",
          ),
        );
        x += w;
      });
      y -= 30;
    }
    text(
      18,
      22,
      `Gerado localmente em ${formatDateTimeBr()} pela Visão consolidada das batidas ímpares.`,
      6.5,
      false,
      "#7b8798",
    );
    pages.push(c);
  }
  const objects = {
    1: "<< /Type /Catalog /Pages 2 0 R >>",
    3: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    4: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  };
  const kids = [];
  pages.forEach((content, i) => {
    const contentId = 5 + i * 2,
      pageId = 6 + i * 2,
      len = latinBytes(content).length;
    kids.push(`${pageId} 0 R`);
    objects[contentId] =
      `<< /Length ${len} >>\nstream\n${content}\nendstream`;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
  });
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${kids.join(" ")}] >>`;
  const max = Math.max(...Object.keys(objects).map(Number));
  let chunks = [latinBytes("%PDF-1.4\n%âãÏÓ\n")],
    offset = chunks[0].length,
    offsets = [0];
  for (let id = 1; id <= max; id++) {
    const obj = latinBytes(
      `${id} 0 obj\n${objects[id] || "<<>>"}\nendobj\n`,
    );
    offsets[id] = offset;
    chunks.push(obj);
    offset += obj.length;
  }
  const xrefOffset = offset;
  let xref = `xref\n0 ${max + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= max; id++)
    xref += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  xref += `trailer\n<< /Size ${max + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  chunks.push(latinBytes(xref));
  return concatBytes(chunks);
}
function exportPdf() {
  if (!ensureData()) return;
  showLoading("Gerando PDF detalhado...");
  setTimeout(() => {
    try {
      downloadBlob(
        new Blob([buildPdf()], { type: "application/pdf" }),
        `batidas_impares_detalhado_${fileStamp()}.pdf`,
      );
      toast(
        "PDF gerado",
        "Relatório em paisagem com colunas e status coloridos.",
      );
    } catch (e) {
      toast("Erro ao gerar PDF", e.message, "error", 5000);
    } finally {
      hideLoading();
    }
  }, 40);
}
