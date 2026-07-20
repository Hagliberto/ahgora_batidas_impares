# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

## [1.6.0] — 20/07/2026

### Adicionado

- favicon vetorial próprio em `assets/icons/favicon.svg`;
- barra de contexto com arquivo atual, período, registros filtrados e empregados;
- barra de filtros ativos com remoção individual e limpeza geral;
- alternância entre densidade compacta e confortável;
- controle para expandir ou recolher todas as seções;
- botão flutuante de retorno ao topo;
- persistência da visualização, densidade, paginação e estado dos expanders.

### Melhorado

- appbar com hierarquia mais clara, indicador de processamento local e acesso direto à pesquisa;
- guia do TOTVS refeito apenas com componentes vetoriais, sem capturas de tela;
- botões de visualização com ícones e estados acessíveis;
- estados vazios com ações diretas de importação e limpeza de filtros;
- foco de teclado, contraste, hover, espaçamento, responsividade e suporte a movimento reduzido;
- consistência do versionamento exibido no HTML, manifesto, documentação e pacote.

### Corrigido

- teste do guia vetorial que detectava imagens ainda presentes no HTML da versão anterior;
- referências inconsistentes de versão entre a interface e os metadados do projeto.

## [1.5.0] — 20/07/2026

### Adicionado

- cards agrupados por empregado;
- selo visual de reincidência;
- expander com todas as pendências do empregado;
- legenda do calendário por responsável da pendência;
- componentes vetoriais inspirados na navegação do TOTVS.

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
