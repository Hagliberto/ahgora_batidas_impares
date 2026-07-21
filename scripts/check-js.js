"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "..");
const javascriptRoot = path.join(projectRoot, "assets", "js");

function collectJavaScriptFiles(directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectJavaScriptFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

function fail(message) {
  console.error(`\nErro: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(javascriptRoot)) {
  fail(`diretório JavaScript não encontrado: ${javascriptRoot}`);
}

const files = collectJavaScriptFiles(javascriptRoot).sort((a, b) =>
  a.localeCompare(b, "en"),
);

if (!files.length) {
  fail("nenhum arquivo JavaScript foi encontrado em assets/js.");
}

let failures = 0;

for (const file of files) {
  const relativePath = path.relative(projectRoot, file);
  process.stdout.write(`Verificando ${relativePath}... `);

  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  if (result.error) {
    failures += 1;
    console.log("FALHOU");
    console.error(result.error.message);
    continue;
  }

  if (result.status === 0) {
    console.log("OK");
    continue;
  }

  failures += 1;
  console.log("FALHOU");

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
}

if (failures > 0) {
  fail(`${failures} arquivo(s) JavaScript apresentaram erro de sintaxe.`);
}

console.log(
  `\nValidação concluída: ${files.length} arquivo(s) JavaScript aprovados.`,
);
