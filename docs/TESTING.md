# Testes

## Testes automatizados

Com Node.js 18 ou superior instalado:

```bash
npm test
npm run check:js
```

Os testes usam apenas recursos nativos do Node.js e não instalam dependências.

## Verificações mínimas antes de publicar

### Inicialização

- abrir `index.html` diretamente;
- confirmar exibição da tela inicial;
- clicar em **Acessar painel**;
- confirmar carregamento da amostra fictícia.

### Importação

Testar os arquivos em `exemplos/`:

- JSON;
- CSV;
- XLSX;
- versões fictícias.

### Filtros

- busca por nome, matrícula, departamento e cargo;
- status;
- departamento;
- múltiplos colaboradores;
- intervalo de datas;
- quantidade de linhas;
- cards estatísticos.

### Visualização

- tabela;
- cards;
- calendário;
- ordenação;
- paginação;
- detalhes.

### Exportação

- PDF;
- PNG;
- XLSX;
- abertura dos arquivos gerados.

### Persistência

1. Importe um arquivo.
2. Recarregue a página.
3. Confirme a restauração.
4. Use **Limpar dados**.
5. Recarregue novamente e confirme que a importação não foi restaurada.

## Verificações técnicas realizadas na v1.8.0

- validação sintática de todos os arquivos JavaScript com `node --check`;
- conferência de referências locais no `index.html`;
- conferência de abertura e integridade do ZIP;
- comparação do conteúdo funcional extraído do arquivo original.
- execução de 9 testes automatizados sem falhas;
- validação dos agrupamentos por empregado e departamento;
- validação do botão contextual de limpeza de filtros;
- validação do padrão brasileiro de data e hora nas exportações;
- validação da folha de estilo wide e das animações vetoriais do Guia Rápido.

