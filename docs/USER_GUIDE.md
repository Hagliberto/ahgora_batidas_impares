# Guia do Usuário

## 1. Abrir a aplicação

Abra o arquivo `index.html` em um navegador atualizado.

## 2. Obter o relatório no TOTVS Ahgora

1. Acesse **PontoWeb → Analytics → Painéis**.
2. Abra o painel **Batidas Ímpares**.
3. Na tabela **Lista de Batidas Ímpares**, clique no menu de três pontos.
4. Escolha **Fazer download de resultados**.
5. Selecione JSON, CSV ou XLSX.
6. Mantenha **Manter os dados formatados** marcado.
7. Clique em **Baixar**.

## 3. Importar

Clique em **Importar arquivo** ou arraste o arquivo para a área de importação.

Formatos aceitos:

- `.json`
- `.csv`
- `.xlsx`

## 4. Consultar

Use os filtros de colaborador, busca, status, departamento e período. Os cards estatísticos também funcionam como filtros rápidos.

## 5. Visualizar

A aplicação oferece três modos:

- **Tabela:** visão detalhada e ordenável.
- **Cards:** inicia no agrupamento por departamento e permite alternar para agrupamento por empregado. As pendências de cada empregado aparecem em colunas, com matrícula em destaque, selo de reincidência e filtros em pill. As localizações não são exibidas nessa visão para manter os cards mais objetivos. Na visão por departamento, todos os setores iniciam recolhidos em expanders independentes.
- **Calendário:** dois meses no período operacional de 21 a 20. Cada mês funciona como um expander independente; quando apenas um estiver aberto, ele ocupa o centro da visualização. Dias, legendas e ocorrências possuem tooltips informativos.

## 6. Exportar

O menu de exportação disponibiliza:

- PDF detalhado.
- PNG detalhado.
- XLSX estruturado com resumo.
- ZIP por departamento, com uma pasta para cada setor e relatórios em PDF, PNG e XLSX.

Datas e horários são apresentados no padrão brasileiro (`DD/MM/AAAA HH:mm:ss`). Os nomes dos arquivos usam formato compatível com o Windows: `DD.MM.AAAA_HH.MM.SS`.

## 7. Atalhos

| Atalho | Ação |
|---|---|
| `/` | Abre a seção de análise e posiciona o foco na busca |
| `Esc` | Fecha modal aberto ou limpa os filtros |

## 8. Privacidade

Nenhum dado é enviado para servidores. O processamento e a persistência ocorrem localmente no navegador.


## Recursos de usabilidade

- Use a tecla `/` para abrir a busca já existente na seção de análise.
- Os filtros ativos aparecem em pills e podem ser removidos individualmente.
- A appbar mantém apenas as ações essenciais: guia, importar, exportar, limpar e tela cheia.
- Os ícones usam cores funcionais para facilitar o reconhecimento das ações.
- No calendário, clique no cabeçalho de cada mês para ocultar ou exibir seu conteúdo.
- Use **Abrir ambos** ou **Recolher** para controlar os dois meses de uma vez.
- Passe o mouse sobre dias, pendências e legendas para consultar tooltips detalhados.
- Use o botão com ícone de lixeira no cabeçalho da Visualização para limpar rapidamente todos os filtros ativos.
- Na aba Cards, o padrão é **Por departamento**. Use **Por empregado** para alternar o agrupamento.
- Use **Abrir todos** ou **Fechar todos** para controlar os expanders departamentais exibidos.
- No filtro de colaboradores, ative ou desative cada empregado por meio dos toggles animados posicionados antes do nome.
- Em **Por departamento**, clique no cabeçalho para abrir o setor. Use **Exportar** para baixar PDF, PNG ou XLSX somente daquele departamento; os demais filtros ativos continuam sendo respeitados.
- Todos os ícones interativos da aplicação usam a mesma animação vetorial do Guia Rápido ao passar o mouse.
- A visualização escolhida e o estado das seções principais são preservados no navegador.
