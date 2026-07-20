/**
 * export-core-xlsx.js
 * Infraestrutura comum de download e geração de XLSX sem dependências externas.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function ensureData() {
  if (!state.filtered.length) {
    toast(
      "Nada para exportar",
      "Ajuste os filtros ou importe um arquivo.",
      "warn",
    );
    return false;
  }
  return true;
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++)
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function u16(n) {
  return new Uint8Array([n & 255, (n >>> 8) & 255]);
}
function u32(n) {
  return new Uint8Array([
    n & 255,
    (n >>> 8) & 255,
    (n >>> 16) & 255,
    (n >>> 24) & 255,
  ]);
}
function concatBytes(parts) {
  const len = parts.reduce((a, b) => a + b.length, 0),
    out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
function zipStore(files) {
  const enc = new TextEncoder(),
    locals = [],
    centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = enc.encode(file.name),
      data =
        typeof file.data === "string"
          ? enc.encode(file.data)
          : file.data,
      crc = crc32(data),
      local = concatBytes([
        u32(0x04034b50),
        u16(20),
        u16(0x0800),
        u16(0),
        u16(0),
        u16(0),
        u32(crc),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        name,
        data,
      ]);
    locals.push(local);
    const central = concatBytes([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(0x0800),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(name.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      name,
    ]);
    centrals.push(central);
    offset += local.length;
  }
  const centralData = concatBytes(centrals),
    localData = concatBytes(locals),
    eocd = concatBytes([
      u32(0x06054b50),
      u16(0),
      u16(0),
      u16(files.length),
      u16(files.length),
      u32(centralData.length),
      u32(localData.length),
      u16(0),
    ]);
  return concatBytes([localData, centralData, eocd]);
}
function xmlEsc(v) {
  return String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
}
function colName(n) {
  let s = "";
  while (n > 0) {
    n--;
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}
function xCell(ref, value, style = 0) {
  if (typeof value === "number" && Number.isFinite(value))
    return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
  return `<c r="${ref}" t="inlineStr" s="${style}"><is><t xml:space="preserve">${xmlEsc(value)}</t></is></c>`;
}
function sheetXml(headers, rows, widths, styleFn) {
  let xml =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>' +
    widths
      .map(
        (w, i) =>
          `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`,
      )
      .join("") +
    "</cols><sheetData>";
  xml +=
    '<row r="1" ht="24" customHeight="1">' +
    headers
      .map((h, i) =>
        xCell(colName(i + 1) + "1", h, styleFn("header", i, h)),
      )
      .join("") +
    "</row>";
  rows.forEach((row, ri) => {
    const r = ri + 2;
    xml +=
      `<row r="${r}" ht="22" customHeight="1">` +
      headers
        .map((h, i) =>
          xCell(
            colName(i + 1) + r,
            row[i] ?? "",
            styleFn("body", i, row[i], row),
          ),
        )
        .join("") +
      "</row>";
  });
  xml +=
    '</sheetData><autoFilter ref="A1:' +
    colName(headers.length) +
    (rows.length + 1) +
    '"/><pageMargins left="0.25" right="0.25" top="0.4" bottom="0.4" header="0.2" footer="0.2"/></worksheet>';
  return xml;
}
function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="3"><font><sz val="10"/><name val="Calibri"/><family val="2"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Calibri"/></font><font><b/><color rgb="FF243247"/><sz val="10"/><name val="Calibri"/></font></fonts><fills count="18"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7F8FB"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFBF9FF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7FBFF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFAFB"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF8FDF9"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFFDF8"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF7FCFD"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE7F8FC"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFFE5E8"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF405268"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF5B43B5"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF314B9C"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF165B9F"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFB4233A"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF167049"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFB56A10"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border/><border><left style="thin"><color rgb="FFDDE4EE"/></left><right style="thin"><color rgb="FFDDE4EE"/></right><top style="thin"><color rgb="FFDDE4EE"/></top><bottom style="thin"><color rgb="FFDDE4EE"/></bottom></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="18"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="0" fillId="2" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="9" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="10" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="6" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="7" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="0" fillId="8" borderId="1" xfId="0" applyFill="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="12" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="13" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="14" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="15" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="16" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="17" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="11" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFill="1" applyFont="1" applyBorder="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
}
function exportXlsx() {
  if (!ensureData()) return;
  showLoading("Gerando XLSX estruturado...");
  setTimeout(() => {
    try {
      const headers = [
          "Dia",
          "Matrícula",
          "Nome",
          "Status",
          "Departamento",
          "Cargo",
          "Localizações",
        ],
        rows = state.filtered.map((r) => [
          r.dia,
          r.matricula,
          r.nome,
          r.status,
          r.departamento,
          r.cargo,
          r.localizacoes,
        ]),
        headerStyles = [9, 10, 11, 12, 13, 14, 15],
        bodyStyles = [1, 2, 3, 0, 6, 7, 8];
      const details = sheetXml(
        headers,
        rows,
        [13, 13, 34, 24, 52, 34, 60],
        (type, i, val) =>
          type === "header"
            ? headerStyles[i]
            : i === 3
              ? statusGroup(val) === "empregado"
                ? 4
                : statusGroup(val) === "gestor"
                  ? 5
                  : 1
              : bodyStyles[i],
      );
      const summaryRows = employeeCounts().map((r, i) => [
          i + 1,
          r.matricula,
          r.nome,
          r.count,
        ]),
        summary = sheetXml(
          ["Posição", "Matrícula", "Nome", "Batidas ímpares"],
          summaryRows,
          [10, 13, 38, 18],
          (type, i) =>
            type === "header" ? [15, 10, 11, 12][i] : [1, 2, 3, 6][i],
        );
      const metaRows = [
          ["Relatório", "Batidas ímpares"],
          ["Arquivo de origem", state.fileName],
          ["Registros filtrados", state.filtered.length],
          ["Período", dateRangeText(state.filtered)],
          ["Gerado em", new Date().toLocaleString("pt-BR")],
        ],
        meta = sheetXml(
          ["Informação", "Valor"],
          metaRows,
          [24, 70],
          (type, i) => (type === "header" ? [15, 10][i] : [16, 17][i]),
        );
      const files = [
        {
          name: "[Content_Types].xml",
          data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
        },
        {
          name: "_rels/.rels",
          data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
        },
        {
          name: "xl/workbook.xml",
          data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="Detalhes" sheetId="1" r:id="rId1"/><sheet name="Resumo por colaborador" sheetId="2" r:id="rId2"/><sheet name="Informações" sheetId="3" r:id="rId3"/></sheets></workbook>`,
        },
        {
          name: "xl/_rels/workbook.xml.rels",
          data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet3.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
        },
        { name: "xl/styles.xml", data: stylesXml() },
        { name: "xl/worksheets/sheet1.xml", data: details },
        { name: "xl/worksheets/sheet2.xml", data: summary },
        { name: "xl/worksheets/sheet3.xml", data: meta },
      ];
      downloadBlob(
        new Blob([zipStore(files)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `batidas_impares_detalhado_${fileStamp()}.xlsx`,
      );
      toast(
        "XLSX gerado",
        "Planilha estruturada com cores, filtros e três abas.",
      );
    } catch (e) {
      toast("Erro ao gerar XLSX", e.message, "error", 5000);
    } finally {
      hideLoading();
    }
  }, 40);
}
