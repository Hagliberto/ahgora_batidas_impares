"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");

function createContext() {
  return vm.createContext({
    console,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    Uint32Array,
    DataView,
    ArrayBuffer,
    Blob: global.Blob,
    URL,
    Intl,
    Date,
    Math,
    Set,
    Map,
    DecompressionStream: global.DecompressionStream,
    DOMParser: class {},
    document: {
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
  });
}

function load(context, relativePath) {
  const filename = path.join(ROOT, relativePath);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}

test("regras de domínio normalizam os dados principais", () => {
  const context = createContext();
  load(context, "assets/js/config/sample-data.js");
  load(context, "assets/js/core/runtime.js");
  load(context, "assets/js/domain/record-rules.js");

  const result = vm.runInContext(
    `({
      sampleSize: SAMPLE_DATA.length,
      normalized: normalizeText("Árvore Útil"),
      matricula: extractSix("01UNIDEX0101001021"),
      manager: statusGroup("Pendente do Gestor"),
      employee: statusGroup("Pendente do Empregado"),
      department: departmentParts("100100100 - UNIDADE CENTRAL")
    })`,
    context,
  );

  assert.equal(result.sampleSize, 18);
  assert.equal(result.normalized, "arvore util");
  assert.equal(result.matricula, "001021");
  assert.equal(result.manager, "gestor");
  assert.equal(result.employee, "empregado");
  assert.deepEqual(
    JSON.parse(JSON.stringify(result.department)),
    { code: "100100100", name: "UNIDADE CENTRAL" },
  );
});

test("adapter CSV produz registros canônicos", () => {
  const context = createContext();
  load(context, "assets/js/config/sample-data.js");
  load(context, "assets/js/core/runtime.js");
  load(context, "assets/js/domain/record-rules.js");
  load(context, "assets/js/infrastructure/import/file-parser.js");

  const result = vm.runInContext(
    `normalizeRows(parseCsv(
      "Matrícula;Nome;Departamento;Dia;Status\\n" +
      "01UNIDEX0101001021;ANA MARTINS;100 - CENTRAL;20/07/2026;Pendente do Gestor"
    ))[0]`,
    context,
  );

  assert.equal(result.matricula, "001021");
  assert.equal(result.nome, "ANA MARTINS");
  assert.equal(result.departamento, "100 - CENTRAL");
  assert.equal(result.dia, "20/07/2026");
  assert.equal(result.status, "Pendente do Gestor");
});
