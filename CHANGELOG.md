# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

## [1.5.0] — 20/07/2026

### Alterado

- removidas as capturas de tela usadas no guia do TOTVS;
- passos do guia reconstruídos com ícones vetoriais e componentes visuais inspirados nos blocos originais de PontoWeb, Analytics, Painéis, Batidas Ímpares e download;
- cards reorganizados em uma visão agrupada por empregado;
- paginação dos cards passou a contabilizar empregados, evitando dividir as pendências do mesmo empregado entre páginas;
- calendário recebeu legenda visual por responsável da pendência;
- troca entre Tabela, Cards e Calendário agora reinicia corretamente a paginação.

### Adicionado

- selo exclusivo de reincidência com total de pendências;
- expander de pendências dentro de cada card de empregado;
- filtros em pill por departamento, status e dia diretamente nos cards;
- contadores de pendências do empregado, gestor e outras situações na legenda do calendário.

### Removido

- pasta `assets/img/` criada na versão anterior para as imagens do passo a passo.

## [1.4.0] — 20/07/2026

### Alterado

- destaque visual da matrícula na coluna de visualização por meio de pill centralizado;
- calendário operacional reformulado para o período 21 de um mês até 20 do mês seguinte, com dois calendários lado a lado e dias fora da janela em cinza claro;
- cards aprimorados com pills de filtro rápido por status, departamento e dia;
- modal de detalhes reforçado com resumo do dia, total de pendências do empregado e navegação entre outras ocorrências da mesma matrícula;
- expander de instruções de download com imagens mais próximas da interface original do TOTVS Ahgora.

### Adicionado

- ativos visuais locais do guia de download em `assets/img/`;
- legenda e realce operacional no modo calendário.

## [1.3.0] — 20/07/2026

### Alterado

- modularização do antigo `index.html` monolítico;
- separação dos estilos em seis folhas CSS ordenadas;
- separação do JavaScript por camadas e responsabilidades;
- organização de domínio, aplicação, infraestrutura e apresentação;
- atualização da versão exibida para v1.3.0;
- conversão do guia operacional para Markdown.

### Adicionado

- documentação de arquitetura;
- mapa da estrutura do projeto;
- ADR da estratégia de modularização;
- guia de testes;
- documento de segurança e privacidade;
- guia de contribuição;
- referências de Clean Architecture e Design Patterns;
- `.editorconfig` e `.gitignore`.

### Mantido

- execução direta por `file://`;
- funcionamento offline;
- importação JSON, CSV e XLSX;
- persistência local;
- filtros, tabela, cards e calendário;
- exportações PDF, PNG e XLSX;
- exemplos existentes.

## [1.2.1]

- versão monolítica recebida como base da modularização.
