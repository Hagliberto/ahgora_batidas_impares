# Estrutura do Projeto

## Raiz

| Caminho | Responsabilidade |
|---|---|
| `index.html` | Estrutura semântica da aplicação e ordem de carregamento |
| `README.md` | Visão geral, execução e links de documentação |
| `CHANGELOG.md` | Histórico de versões |
| `CONTRIBUTING.md` | Convenções de manutenção |
| `.editorconfig` | Padronização básica dos editores |
| `.gitignore` | Arquivos que não devem entrar no repositório |

## CSS

Os arquivos são numerados para documentar e garantir a ordem de cascata.

| Arquivo | Conteúdo |
|---|---|
| `01-foundation.css` | tokens, reset, appbar, guia, importação e indicadores |
| `02-components.css` | filtros, painéis, tabela, cards, modais e feedback |
| `03-responsive-dashboard.css` | responsividade da estrutura principal |
| `04-welcome-and-analysis.css` | tela inicial e painel analítico |
| `05-responsive-application.css` | ajustes responsivos complementares |
| `06-calendar.css` | calendário mensal |

## JavaScript

| Diretório | Conteúdo |
|---|---|
| `config/` | dados e configurações estáticas |
| `core/` | runtime e estado |
| `domain/` | regras puras |
| `application/` | casos de uso |
| `infrastructure/import/` | leitores e adapters de arquivo |
| `infrastructure/storage/` | persistência local |
| `infrastructure/export/` | exportadores |
| `presentation/` | renderização e controladores |
| `shared/` | utilidades transversais |
| `app.js` | inicialização final |

## Ordem de carregamento

A ordem dos `<script>` em `index.html` é parte do contrato do projeto. `app.js` deve permanecer por último.


## Recursos de experiência da v1.8.0

- `assets/icons/favicon.svg`: identidade visual do navegador.
- `assets/css/07-experience.css`: filtros ativos, acessibilidade e recursos essenciais de navegação.
- `assets/css/08-polish.css`: guia rápido moderno, cores funcionais dos ícones e tooltips.
- `assets/css/09-v180.css`: agrupamento dos cards, pendências em colunas, Guia Rápido wide e animações no hover.
- `assets/css/06-calendar.css`: calendários mensais expansíveis e layout centralizado.
- `assets/js/presentation/experience.js`: preferências essenciais e filtros ativos.
- `assets/js/presentation/renderers.js`: renderização e controle dos expanders do calendário.
