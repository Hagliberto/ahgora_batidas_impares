/**
 * runtime.js
 * Seletores, estado da aplicação, aliases de campos e ícones.
 * Carregado como script clássico para manter compatibilidade com abertura via file://.
 */

"use strict";

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const state = {
  raw: [],
  filtered: [],
  fileName: "",
  currentPage: 1,
  pageSize: 50,
  sortKey: "dateValue",
  sortDir: "desc",
  view: "table",
  quickStatus: "",
  statFilter: null,
  selectedEmployees: new Set(),
};
const fieldAliases = {
  matricula: [
    "matricula",
    "matrícula",
    "registration",
    "employee id",
    "employeeid",
  ],
  nome: ["nome", "name", "colaborador", "empregado"],
  departamento: [
    "departamento",
    "department",
    "setor",
    "lotacao",
    "lotação",
  ],
  cargo: ["cargo", "job", "funcao", "função"],
  dia: ["dia", "data", "date"],
  status: ["status", "situacao", "situação", "pendencia", "pendência"],
  localizacoes: [
    "localizacoes",
    "localizações",
    "locations",
    "location",
    "localizacao",
    "localização",
  ],
};
const icons = {
  all: '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>',
  person:
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"/></svg>',
  manager:
    '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c.7-4 2.7-6 6-6 1.7 0 3.1.5 4.1 1.4"/><path d="M17 13v6m-3-3h6"/></svg>',
  repeat:
    '<svg viewBox="0 0 24 24"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  dept: '<svg viewBox="0 0 24 24"><path d="M4 21V7l8-4 8 4v14"/><path d="M8 10h2m4 0h2M8 14h2m4 0h2M8 18h8"/></svg>',
  calendar:
    '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/></svg>',
};
