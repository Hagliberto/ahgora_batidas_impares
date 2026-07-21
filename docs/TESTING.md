# Testes

## Testes automatizados

Com Node.js 18 ou superior instalado:

```bash
npm test
npm run check:js
```

Os testes usam apenas recursos nativos do Node.js e não instalam dependências. O comando `npm run check:js` é multiplataforma e funciona no Windows, Linux e macOS.

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
- múltiplos colaboradores por toggles animados;
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
- ZIP por departamento com PDF, PNG e XLSX;
- abertura dos arquivos gerados.

### Persistência

1. Importe um arquivo.
2. Recarregue a página.
3. Confirme a restauração.
4. Use **Limpar dados**.
5. Recarregue novamente e confirme que a importação não foi restaurada.

## Verificações técnicas realizadas na v1.10.0

- validação sintática de 15 arquivos JavaScript com o validador multiplataforma `scripts/check-js.js`;
- validação do comando `npm run check:js` sem dependências Unix;
- conferência de referências locais no `index.html`;
- conferência de abertura e integridade do ZIP;
- comparação do conteúdo funcional extraído do arquivo original.
- execução de 14 testes automatizados sem falhas;
- validação dos agrupamentos por empregado e departamento;
- validação dos expanders fechados por padrão, controle abrir/fechar todos e exportação individual por departamento;
- validação do ZIP por departamento nos três formatos;
- validação do agrupamento departamental como padrão e dos toggles de colaboradores;
- validação da animação uniforme dos ícones;
- validação do botão contextual de limpeza de filtros;
- validação do padrão brasileiro de data e hora nas exportações;
- validação da folha de estilo wide e das animações vetoriais do Guia Rápido.

