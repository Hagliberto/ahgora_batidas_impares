# Arquitetura

## Objetivo

Separar regras, casos de uso, adaptadores e interface sem alterar o comportamento da aplicação nem exigir infraestrutura adicional.

## Regra de dependência

As camadas de maior nível não conhecem detalhes de arquivo, armazenamento ou DOM. A ordem conceitual é:

```text
Domínio
  ↑
Aplicação
  ↑
Adaptadores de infraestrutura e apresentação
  ↑
Bootstrap
```

Como o projeto precisa funcionar diretamente por `file://`, os arquivos são carregados como scripts clássicos em ordem explícita. As responsabilidades continuam separadas por diretório.

## Camadas

### Domain

Diretório: `assets/js/domain/`

Contém regras puras:

- normalização de texto;
- tratamento de matrícula;
- interpretação de datas;
- classificação de status;
- separação de código e nome do departamento.

Essa camada não acessa DOM, `localStorage`, arquivos ou exportadores.

### Application

Diretório: `assets/js/application/`

Orquestra os casos de uso:

- carregar registros;
- popular opções;
- aplicar filtros;
- ordenar;
- calcular agregações;
- coordenar atualização da visualização.

### Infrastructure

Diretório: `assets/js/infrastructure/`

Implementa detalhes externos:

- leitura de JSON, CSV e XLSX;
- persistência em `localStorage`;
- geração de ZIP/XLSX;
- exportação de PDF e PNG;
- download de arquivos.

Os parsers funcionam como **Adapters**, convertendo estruturas externas para o formato canônico da aplicação.

### Presentation

Diretório: `assets/js/presentation/`

Responsável por:

- renderização de cards, tabela, calendário, ranking e modais;
- eventos de interface;
- navegação;
- atalhos;
- mensagens ao usuário.

### Core, Config e Shared

- `core/runtime.js`: estado, seletores, aliases e ícones.
- `config/sample-data.js`: amostra fictícia.
- `shared/ui-helpers.js`: funções transversais de interface.

## Padrões aplicados

- **Adapter:** parsers de JSON, CSV e XLSX.
- **Facade:** `loadData`, `renderAll` e os exportadores apresentam entradas simples para subsistemas maiores.
- **Strategy:** classificação visual por status e possibilidade de evolução dos formatos de exportação.
- **State:** o objeto `state` concentra o estado explícito da sessão.
- **Observer/Event-driven UI:** eventos do DOM disparam atualização dos casos de uso e renderizadores.

## Fluxo principal

```text
Arquivo do usuário
  → File Parser
  → Normalização canônica
  → Estado da aplicação
  → Filtros e agregações
  → Renderizadores
  → Exportadores / localStorage
```

## Restrições arquiteturais

1. Funções de domínio não podem acessar DOM.
2. Renderizadores não devem interpretar formatos de arquivo.
3. Exportadores recebem dados já normalizados.
4. Novos formatos devem ser implementados em `infrastructure/import`.
5. Alterações de interface não devem modificar as regras de normalização.
