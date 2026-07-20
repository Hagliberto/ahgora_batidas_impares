# Contribuição

## Princípios

- Preserve o funcionamento local e offline.
- Evite dependências externas sem justificativa arquitetural.
- Mantenha cada arquivo com responsabilidade única.
- Não mova regras de negócio para renderizadores.
- Não faça parsers manipularem elementos de interface.
- Atualize documentação e `CHANGELOG.md` junto com o código.

## Convenções

### JavaScript

- `"use strict"` em todos os arquivos.
- Funções e variáveis em `camelCase`.
- Constantes em `UPPER_SNAKE_CASE` quando realmente imutáveis.
- Mensagens de erro compreensíveis para o usuário.
- Escape de conteúdo antes de inserir texto externo em HTML.

### CSS

- Respeite a numeração e a ordem dos arquivos.
- Use os tokens definidos em `:root`.
- Evite estilos inline novos.
- Teste os breakpoints existentes.

### Commits

Sugestão de padrão:

```text
feat(import): adiciona novo formato de entrada
fix(filters): corrige seleção múltipla
refactor(export): separa gerador de XLSX
docs(architecture): registra decisão técnica
```

## Checklist de pull request

- [ ] Funcionalidade testada com a amostra.
- [ ] JSON, CSV e XLSX continuam importando.
- [ ] Exportações continuam abrindo.
- [ ] Não foram adicionadas chamadas de rede.
- [ ] Documentação foi atualizada.
- [ ] Versão e changelog foram revisados.
