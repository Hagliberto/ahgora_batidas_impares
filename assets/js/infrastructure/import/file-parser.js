/**
 * file-parser.js
 * Adapters para JSON, CSV e XLSX e conversão para registros canônicos.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

function canonicalKey(key) {
  const n = normalizeText(key)
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ");
  for (const [canonical, aliases] of Object.entries(fieldAliases))
    if (aliases.some((a) => normalizeText(a) === n)) return canonical;
  return null;
}
function normalizeRows(rows) {
  if (!Array.isArray(rows))
    throw new Error("O arquivo não contém uma lista de registros.");
  const out = [];
  rows.forEach((row, index) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) return;
    const mapped = {};
    Object.entries(row).forEach(([k, v]) => {
      const ck = canonicalKey(k);
      if (ck && (mapped[ck] === undefined || mapped[ck] === ""))
        mapped[ck] = v;
    });
    const originalMat = String(mapped.matricula ?? "").trim(),
      date = parseDateValue(mapped.dia);
    if (
      !originalMat &&
      !mapped.nome &&
      !mapped.dia &&
      !mapped.status &&
      !mapped.departamento
    )
      return;
    out.push({
      id: `r${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`,
      matriculaOriginal: originalMat,
      matricula: extractSix(originalMat),
      nome: String(mapped.nome ?? "").trim(),
      departamento: String(mapped.departamento ?? "").trim(),
      cargo: String(mapped.cargo ?? "").trim(),
      diaOriginal: mapped.dia ?? "",
      dateValue: date ? date.getTime() : 0,
      dateObj: date,
      dia: date ? formatDate(date) : String(mapped.dia ?? "").trim(),
      status: String(mapped.status ?? "").trim() || "Não informado",
      localizacoes: String(mapped.localizacoes ?? "").trim(),
    });
  });
  if (!out.length)
    throw new Error(
      "Nenhum registro válido foi identificado. Verifique os nomes das colunas.",
    );
  return out;
}
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  const first = text.split(/\r?\n/).find((l) => l.trim()) || "",
    candidates = [";", ",", "\t", "|"];
  let delimiter = ";",
    max = -1;
  for (const d of candidates) {
    const count = (
      first.match(new RegExp(d === "|" ? "\\|" : d, "g")) || []
    ).length;
    if (count > max) {
      max = count;
      delimiter = d;
    }
  }
  const rows = [];
  let row = [],
    cell = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i],
      next = text[i + 1];
    if (ch === '"' && quoted && next === '"') {
      cell += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      quoted = !quoted;
      continue;
    }
    if (ch === delimiter && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }
  if (rows.length < 2) throw new Error("CSV sem linhas de dados.");
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .map((cols) =>
      Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""])),
    );
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === "undefined")
    throw new Error(
      "Seu navegador não oferece descompactação nativa para XLSX. Use Chrome, Edge ou Firefox atualizado.",
    );
  const ds = new DecompressionStream("deflate-raw"),
    stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function unzip(buffer) {
  const data = new Uint8Array(buffer),
    view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let eocd = -1;
  for (
    let i = data.length - 22;
    i >= Math.max(0, data.length - 65557);
    i--
  ) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0)
    throw new Error(
      "Arquivo XLSX inválido: diretório ZIP não encontrado.",
    );
  const entries = view.getUint16(eocd + 10, true),
    cdOffset = view.getUint32(eocd + 16, true),
    decoder = new TextDecoder("utf-8");
  let p = cdOffset;
  const files = new Map();
  for (let i = 0; i < entries; i++) {
    if (view.getUint32(p, true) !== 0x02014b50)
      throw new Error("Estrutura ZIP inválida.");
    const method = view.getUint16(p + 10, true),
      compSize = view.getUint32(p + 20, true),
      nameLen = view.getUint16(p + 28, true),
      extraLen = view.getUint16(p + 30, true),
      commentLen = view.getUint16(p + 32, true),
      localOffset = view.getUint32(p + 42, true),
      name = decoder.decode(data.slice(p + 46, p + 46 + nameLen));
    const localNameLen = view.getUint16(localOffset + 26, true),
      localExtraLen = view.getUint16(localOffset + 28, true),
      start = localOffset + 30 + localNameLen + localExtraLen,
      compressed = data.slice(start, start + compSize);
    let bytes;
    if (method === 0) bytes = compressed;
    else if (method === 8) bytes = await inflateRaw(compressed);
    else
      throw new Error(
        `Método de compactação XLSX não suportado (${method}).`,
      );
    files.set(name, bytes);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}
function xmlText(bytes) {
  return new TextDecoder("utf-8").decode(bytes);
}
function colIndex(ref) {
  const m = String(ref).match(/^([A-Z]+)/i);
  if (!m) return 0;
  let n = 0;
  for (const ch of m[1].toUpperCase())
    n = n * 26 + ch.charCodeAt(0) - 64;
  return n - 1;
}
async function readXlsx(buffer) {
  const files = await unzip(buffer),
    parser = new DOMParser(),
    workbookBytes = files.get("xl/workbook.xml");
  if (!workbookBytes)
    throw new Error("Pasta de trabalho XLSX não encontrada.");
  const workbook = parser.parseFromString(
      xmlText(workbookBytes),
      "application/xml",
    ),
    firstSheet = workbook.getElementsByTagName("sheet")[0];
  if (!firstSheet) throw new Error("Nenhuma planilha encontrada.");
  const relId =
    firstSheet.getAttribute("r:id") ||
    firstSheet.getAttributeNS(
      "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "id",
    );
  let sheetPath = "xl/worksheets/sheet1.xml";
  const relBytes = files.get("xl/_rels/workbook.xml.rels");
  if (relBytes && relId) {
    const relDoc = parser.parseFromString(
      xmlText(relBytes),
      "application/xml",
    );
    for (const rel of relDoc.getElementsByTagName("Relationship"))
      if (rel.getAttribute("Id") === relId) {
        let target =
          rel.getAttribute("Target") || "worksheets/sheet1.xml";
        target = target.replace(/^\//, "");
        sheetPath = target.startsWith("xl/")
          ? target
          : "xl/" + target.replace(/^\.\//, "");
        break;
      }
  }
  const shared = [];
  const ss = files.get("xl/sharedStrings.xml");
  if (ss) {
    const ssDoc = parser.parseFromString(
      xmlText(ss),
      "application/xml",
    );
    for (const si of ssDoc.getElementsByTagName("si"))
      shared.push(
        [...si.getElementsByTagName("t")]
          .map((t) => t.textContent || "")
          .join(""),
      );
  }
  const sheetBytes = files.get(sheetPath);
  if (!sheetBytes)
    throw new Error("A primeira planilha do XLSX não foi encontrada.");
  const sheet = parser.parseFromString(
      xmlText(sheetBytes),
      "application/xml",
    ),
    matrix = [];
  for (const row of sheet.getElementsByTagName("row")) {
    const rowIndex = Math.max(
      0,
      (+row.getAttribute("r") || matrix.length + 1) - 1,
    );
    matrix[rowIndex] = matrix[rowIndex] || [];
    for (const c of row.getElementsByTagName("c")) {
      const idx = colIndex(c.getAttribute("r")),
        type = c.getAttribute("t");
      let val = "";
      if (type === "inlineStr")
        val = [...c.getElementsByTagName("t")]
          .map((t) => t.textContent || "")
          .join("");
      else {
        const v = c.getElementsByTagName("v")[0]?.textContent ?? "";
        val =
          type === "s"
            ? (shared[+v] ?? "")
            : type === "b"
              ? v === "1"
                ? "TRUE"
                : "FALSE"
              : v;
      }
      matrix[rowIndex][idx] = val;
    }
  }
  const nonEmpty = matrix.filter(
    (r) => r && r.some((v) => String(v ?? "").trim() !== ""),
  );
  if (nonEmpty.length < 2)
    throw new Error("A primeira planilha não possui linhas de dados.");
  const headers = nonEmpty[0].map((v) => String(v ?? "").trim());
  return nonEmpty
    .slice(1)
    .map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""])),
    );
}
async function readFile(file) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (ext === "json") {
    const obj = JSON.parse(await file.text()),
      rows = Array.isArray(obj)
        ? obj
        : obj.data || obj.rows || obj.items || obj.results || obj.value;
    return normalizeRows(rows);
  }
  if (ext === "csv" || file.type.includes("csv"))
    return normalizeRows(parseCsv(await file.text()));
  if (ext === "xlsx")
    return normalizeRows(await readXlsx(await file.arrayBuffer()));
  throw new Error("Formato não suportado. Use JSON, CSV ou XLSX.");
}
