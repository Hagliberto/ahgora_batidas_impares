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
- Visualização em tabela, cards agrupados por empregado ou departamento e calendário operacional 21 → 20.
- Departamentos exibidos em expanders fechados por padrão, com resumo de empregados e pendências.
- Exportação individual por departamento em PDF, PNG ou XLSX, respeitando os demais filtros ativos.
- Pacote ZIP por departamento com arquivos PDF, PNG e XLSX organizados em pastas.
- Controle para abrir ou fechar todos os expanders de departamento.
- Visualização em Cards inicia por departamento.
- Seleção de colaboradores com toggles responsivos e animados.
- Ícones interativos da aplicação usam a mesma animação vetorial do Guia Rápido.
- Exportação para PDF, PNG e XLSX.
- Persistência local da última importação e das preferências de interface.
- Atalhos de teclado: `/` abre a busca e `Esc` limpa os filtros.
- Favicon vetorial próprio, compatível com abertura local.
- Filtros ativos removíveis individualmente.
- Appbar simplificada, com somente as ações essenciais.
- Ícones funcionais com cores próprias para facilitar a identificação.
- Calendários mensais independentes, expansíveis e centralizados quando abertos isoladamente.
- Tooltips detalhados nos dias, pendências, legendas e controles do calendário.
- Guia rápido em formato wide, com cards coloridos, hierarquia tipográfica moderna e ícones vetoriais animados no hover.
- Pendências organizadas em colunas dentro de cada card, sem exibir localizações nessa visão.
- Botão contextual para limpar os filtros diretamente no expander de visualização.
- Datas e horas das exportações padronizadas em português do Brasil.
- Botão flutuante para retorno ao topo.
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
│   ├── icons/
│   └── js/
│       ├── application/
│       ├── config/
│       ├── core/
│       ├── domain/
│       ├── infrastructure/
│       ├── presentation/
│       └── shared/
├── scripts/
│   ├── check-js.js
│   └── publish-v1.10.0.ps1
├── docs/
│   ├── architecture/
│   ├── reference/
│   ├── USER_GUIDE.md
│   ├── TESTING.md
│   └── SECURITY.md
└── exemplos/
```

A explicação completa das dependências e responsabilidades está em [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

## Validação técnica

Com Node.js 18 ou superior:

```bash
npm test
npm run check:js
```

O validador JavaScript utiliza apenas APIs nativas do Node.js e funciona no Windows, Linux e macOS.

## Publicação da v1.10.0

Depois de extrair o pacote sobre o repositório e permanecer na branch `dev`, execute no PowerShell 7:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\publish-v1.10.0.ps1
```

Quando o clone local ainda possuir o histórico anterior à remoção de `OLD`, utilize o recuperador. Ele cria um clone novo a partir do remoto reescrito, aplica o pacote e inicia a publicação:

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File .\scripts\recover-and-publish-v1.10.0.ps1
```

O script valida a versão, executa os testes, cria a branch `release/v1.10.0`, integra em `dev` e `main`, cria a tag anotada, alinha `dev` e `main` no mesmo commit e publica todas as referências em um push atômico.
Ele também bloqueia a publicação quando identifica um clone anterior à reescrita do histórico que removeu a pasta `OLD`; nesse caso, a versão deve ser aplicada sobre o clone novo validado.

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

**v1.10.0**
