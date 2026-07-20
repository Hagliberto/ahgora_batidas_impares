# ADR-001 — Modularização compatível com execução local

- **Status:** Aceito
- **Data:** 20/07/2026
- **Versão:** 1.5.0

## Contexto

O projeto era distribuído em um único `index.html` com HTML, CSS e JavaScript incorporados. Isso dificultava manutenção, revisão, testes e evolução.

A aplicação também precisa continuar abrindo diretamente no navegador, sem servidor local.

## Decisão

1. Separar CSS e JavaScript em arquivos por responsabilidade.
2. Organizar JavaScript em camadas inspiradas em Clean Architecture.
3. Manter scripts clássicos carregados em ordem explícita.
4. Não utilizar `type="module"` nesta versão, pois navegadores podem restringir módulos ES quando o documento é aberto por `file://`.
5. Manter zero dependências externas e zero etapa obrigatória de build.

## Consequências positivas

- arquivos menores e mais fáceis de revisar;
- responsabilidades explícitas;
- manutenção isolada de parsers, exportadores e interface;
- documentação rastreável;
- preservação do uso offline e local.

## Consequências negativas

- a ordem dos scripts deve ser respeitada;
- os símbolos compartilhados permanecem no escopo global lexical dos scripts clássicos;
- uma futura migração para ES Modules exigirá servidor local ou empacotamento.

## Evolução recomendada

Quando houver infraestrutura de build ou hospedagem HTTP, migrar para ES Modules e testes automatizados por camada.
