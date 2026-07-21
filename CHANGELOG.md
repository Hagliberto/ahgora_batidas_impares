# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

## [1.8.1] — 21/07/2026

### Corrigido

- tooltip do botão de limpar filtros no expander de Visualização reposicionado para abrir abaixo da ação;
- eliminação da sobreposição do tooltip com o expander imediatamente anterior;
- preservação do comportamento e do visual dos demais tooltips da aplicação.

## [1.8.0] — 21/07/2026

### Alterado

- reorganização das pendências de cada empregado em colunas compactas dentro dos cards;
- remoção das localizações da aba Cards para reduzir ruído visual;
- inclusão de alternância entre agrupamento por empregado e agrupamento por departamento;
- inclusão de botão com ícone para limpar os filtros diretamente no expander de visualização;
- ampliação do Guia Rápido para formato wide, com animações vetoriais no hover;
- padronização brasileira de data e hora nos relatórios e nos nomes dos arquivos exportados.

### Adicionado

- seções de departamento com contagem de empregados e pendências;
- persistência da preferência de agrupamento dos cards;
- folha de estilo `09-v180.css` para os novos componentes e animações.

## [1.7.0] — 20/07/2026

### Simplificado

- removidos da appbar os controles redundantes de pesquisa, expansão conjunta das seções e densidade;
- removida a faixa superior de quatro cards de contexto por repetir informações já disponíveis no painel;
- appbar reduzida às ações essenciais de guia, importação, exportação, limpeza e tela cheia.

### Melhorado

- guia rápido totalmente redesenhado com hierarquia tipográfica moderna, hero visual, cards coloridos e ícones vetoriais;
- ícones da appbar, seções, modos de visualização e exportações receberam cores funcionais próprias;
- cada mês do calendário passou a funcionar como expander independente;
- quando apenas um mês está aberto, o calendário é centralizado e ocupa uma área maior;
- adicionados controles para abrir ou recolher os dois calendários;
- dias, pendências, legendas e controles receberam tooltips detalhados;
- estado aberto ou fechado de cada mês é preservado localmente.

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
