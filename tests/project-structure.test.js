"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

test("index referencia somente assets locais existentes", () => {
  const html = read("index.html");
  const references = [
    ...html.matchAll(/<(?:link|script)\b[^>]+(?:href|src)="([^"]+)"/g),
  ].map((match) => match[1]);

  assert.ok(references.length >= 21);
  assert.ok(references.includes("assets/icons/favicon.svg"));
  assert.ok(references.includes("assets/css/07-experience.css"));
  assert.ok(references.includes("assets/css/08-polish.css"));
  assert.ok(references.includes("assets/css/09-v180.css"));
  assert.ok(references.includes("assets/js/presentation/experience.js"));
  for (const reference of references) {
    assert.equal(
      fs.existsSync(path.join(ROOT, reference)),
      true,
      `Referência ausente: ${reference}`,
    );
  }
});

test("bootstrap permanece como último script", () => {
  const html = read("index.html");
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(
    (match) => match[1],
  );

  assert.equal(scripts.at(-1), "assets/js/app.js");
  assert.ok(
    scripts.indexOf("assets/js/domain/record-rules.js") <
      scripts.indexOf("assets/js/application/dashboard-service.js"),
  );
  assert.ok(
    scripts.indexOf("assets/js/application/dashboard-service.js") <
      scripts.indexOf("assets/js/presentation/controller.js"),
  );
  assert.ok(
    scripts.indexOf("assets/js/presentation/renderers.js") <
      scripts.indexOf("assets/js/presentation/experience.js"),
  );
  assert.ok(
    scripts.indexOf("assets/js/presentation/experience.js") <
      scripts.indexOf("assets/js/presentation/controller.js"),
  );
});

test("documentação arquitetural obrigatória está presente", () => {
  const required = [
    "README.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "docs/USER_GUIDE.md",
    "docs/TESTING.md",
    "docs/SECURITY.md",
    "docs/architecture/ARCHITECTURE.md",
    "docs/architecture/PROJECT_STRUCTURE.md",
    "docs/architecture/decisions/ADR-001-MODULARIZACAO.md",
    "docs/reference/CLEAN_ARCHITECTURE.md",
    "docs/reference/DESIGN_PATTERNS.md"
  ];

  for (const file of required) {
    assert.equal(fs.existsSync(path.join(ROOT, file)), true, `Ausente: ${file}`);
  }
});

test("guia do TOTVS usa componentes vetoriais e não capturas de tela", () => {
  const html = read("index.html");

  assert.equal(/<img\b/i.test(html), false);
  assert.match(html, /class="totvs-preview preview-pontoweb"/);
  assert.match(html, /class="totvs-preview preview-analytics"/);
  assert.match(html, /class="totvs-preview preview-paineis"/);
  assert.match(html, /class="totvs-preview preview-batidas"/);
});

test("cards agrupados e legenda do calendário estão implementados", () => {
  const renderers = read("assets/js/presentation/renderers.js");

  assert.match(renderers, /function groupRecordsByEmployee/);
  assert.match(renderers, /recurrence-badge/);
  assert.match(renderers, /employee-occurrences/);
  assert.match(renderers, /calendar-status-legend/);
});


test("favicon e experiência simplificada estão integrados", () => {
  const html = read("index.html");
  const experience = read("assets/js/presentation/experience.js");
  const polish = read("assets/css/08-polish.css");
  const renderers = read("assets/js/presentation/renderers.js");
  const manifest = JSON.parse(read("project.manifest.json"));

  assert.match(html, /assets\/icons\/favicon\.svg/);
  assert.match(html, /id="activeFilterShell"/);
  assert.match(html, /id="scrollTopBtn"/);
  assert.match(html, /class="welcome-paper welcome-modern"/);
  assert.doesNotMatch(html, /id="contextStrip"/);
  assert.doesNotMatch(html, /id="quickSearchBtn"/);
  assert.doesNotMatch(html, /id="toggleSectionsBtn"/);
  assert.doesNotMatch(html, /id="densityBtn"/);
  assert.match(experience, /function renderExperienceSummary/);
  assert.match(experience, /function renderActiveFilters/);
  assert.match(experience, /function restoreUiPreferences/);
  assert.match(renderers, /calendar-month-expander/);
  assert.match(renderers, /calendar-layout-single/);
  assert.match(renderers, /data-tooltip/);
  assert.match(polish, /#exportMenuBtn/);
  assert.match(polish, /\.welcome-hero/);
  assert.match(polish, /\.has-tooltip/);
  assert.equal(manifest.version, "1.8.2");
});


test("cards por empregado e departamento, guia wide e exportação brasileira estão integrados", () => {
  const html = read("index.html");
  const renderers = read("assets/js/presentation/renderers.js");
  const experience = read("assets/js/presentation/experience.js");
  const helpers = read("assets/js/shared/ui-helpers.js");
  const xlsx = read("assets/js/infrastructure/export/export-core-xlsx.js");
  const css = read("assets/css/09-v180.css");

  assert.match(html, /id="resultsClearFiltersBtn"/);
  assert.match(renderers, /function groupRecordsByDepartment/);
  assert.match(renderers, /data-card-grouping="employee"/);
  assert.match(renderers, /data-card-grouping="department"/);
  assert.match(renderers, /employee-occurrence-list column-layout/);
  assert.doesNotMatch(renderers, /occurrence-location/);
  assert.match(experience, /resultsClearFiltersBtn/);
  assert.match(helpers, /function formatDateTimeBr/);
  assert.match(helpers, /String\(d\.getDate\(\)\).*String\(d\.getMonth\(\) \+ 1\)/s);
  assert.match(xlsx, /formatDateTimeBr\(\)/);
  assert.match(css, /\.welcome-paper\.welcome-modern/);
  assert.match(css, /guide-icon-draw/);
});


test("tooltip de limpeza abre para baixo sem sobrepor o expander anterior", () => {
  const css = read("assets/css/10-v181-hotfix.css");

  assert.match(css, /results-clear-filter\.has-tooltip::before/);
  assert.match(css, /top:\s*calc\(100% \+ 3px\)/);
  assert.match(css, /results-clear-filter\.has-tooltip::after/);
  assert.match(css, /top:\s*calc\(100% \+ 8px\)/);
  assert.match(css, /bottom:\s*auto/);
});


test("validador JavaScript é multiplataforma e não depende de utilitários Unix", () => {
  const packageJson = JSON.parse(read("package.json"));
  const validator = read("scripts/check-js.js");

  assert.equal(packageJson.scripts["check:js"], "node scripts/check-js.js");
  assert.ok(validator.includes("spawnSync(process.execPath"));
  assert.match(validator, /collectJavaScriptFiles/);
  assert.match(validator, /windowsHide:\s*true/);
  assert.doesNotMatch(packageJson.scripts["check:js"], /(?:^|\s)(?:find|xargs|sort)(?:\s|$)/);
  assert.equal(fs.existsSync(path.join(ROOT, ".gitattributes")), true);
  assert.equal(fs.existsSync(path.join(ROOT, "scripts/publish-v1.8.2.ps1")), true);
});
