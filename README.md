# Ahgora — Batidas Ímpares

Aplicação web local para importar, consultar, filtrar e exportar a **Lista de Batidas Ímpares** do TOTVS Ahgora.

## Visão geral

O projeto funciona diretamente no navegador, sem servidor, banco de dados ou dependências externas. Os arquivos JSON, CSV e XLSX são processados localmente e a última importação pode ser mantida no `localStorage`.

## Recursos

- Importação de JSON, CSV e XLSX.
- Matrícula reduzida aos seis últimos dígitos.
- Filtros por colaborador, status, departamento e período.
- Seleção de múltiplos colaboradores.
- Cards e indicadores interativos.
- Visualização em tabela, cards e calendário.
- Exportação para PDF, PNG e XLSX.
- Persistência local da última importação.
- Atalhos de teclado: `/` abre a busca e `Esc` limpa os filtros.
- Processamento integralmente local no navegador.

## Como executar

1. Extraia o arquivo ZIP.
2. Abra `index.html` no Chrome, Edge ou Firefox atualizado.
3. Importe um arquivo ou utilize a amostra fictícia incorporada.

Não é necessário instalar pacotes ou iniciar servidor.

## Estrutura

```text
.
├── index.html
├── assets/
│   ├── css/
│   └── js/
│       ├── application/
│       ├── config/
│       ├── core/
│       ├── domain/
│       ├── infrastructure/
│       ├── presentation/
│       └── shared/
├── docs/
│   ├── architecture/
│   ├── reference/
│   ├── USER_GUIDE.md
│   ├── TESTING.md
│   └── SECURITY.md
└── exemplos/
```

A explicação completa das dependências e responsabilidades está em [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

## Compatibilidade

O projeto usa scripts clássicos externos, em ordem explícita, para continuar funcionando quando `index.html` é aberto diretamente por `file://`. Essa decisão evita exigir servidor local apenas para carregar módulos ES.

## Documentação

- [Guia do usuário](docs/USER_GUIDE.md)
- [Arquitetura](docs/architecture/ARCHITECTURE.md)
- [Estrutura do projeto](docs/architecture/PROJECT_STRUCTURE.md)
- [Decisão de modularização](docs/architecture/decisions/ADR-001-MODULARIZACAO.md)
- [Testes](docs/TESTING.md)
- [Segurança e privacidade](docs/SECURITY.md)
- [Contribuição](CONTRIBUTING.md)
- [Histórico de versões](CHANGELOG.md)

## Versão

**v1.5.0**
