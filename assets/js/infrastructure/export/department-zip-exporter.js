/**
 * department-zip-exporter.js
 * Gera um pacote ZIP com PDF, PNG e XLSX separados por departamento.
 * Todo o processamento ocorre localmente no navegador.
 */

"use strict";

function departmentZipContext(group) {
  const parts = departmentParts(group.departamento),
    displayName =
      (parts.code ? `${parts.code} — ` : "") +
      (parts.name || group.departamento || "Departamento não informado"),
    token = safeFileSegment(displayName) || "departamento_sem_nome";
  return {
    rows: group.records,
    scopeLabel: `Departamento ${displayName}`,
    fileToken: `departamento_${token}`,
    title: `Batidas Ímpares — ${displayName}`,
    displayName,
    token,
  };
}

async function exportDepartmentsZip() {
  const groups = groupRecordsByDepartment(state.filtered);
  if (!groups.length || !ensureData(state.filtered)) return;

  showLoading("Preparando pacote ZIP por departamento...");
  try {
    const files = [],
      stamp = fileStamp(),
      generatedAt = formatDateTimeBr(),
      summaryLines = [
        "BATIDAS ÍMPARES — PACOTE POR DEPARTAMENTO",
        "",
        `Gerado em: ${generatedAt}`,
        `Arquivo de origem: ${state.fileName}`,
        `Período: ${dateRangeText(state.filtered)}`,
        `Departamentos: ${groups.length}`,
        `Registros: ${state.filtered.length}`,
        "",
        "Estrutura:",
        "- Cada pasta representa um departamento.",
        "- Dentro de cada pasta existem os formatos PDF, PNG e XLSX.",
        "- Os arquivos respeitam todos os filtros ativos no momento da exportação.",
        "",
        "Departamentos incluídos:",
      ];

    for (let index = 0; index < groups.length; index++) {
      const group = groups[index],
        context = departmentZipContext(group),
        folder = `${String(index + 1).padStart(2, "0")}_${context.token}`,
        baseName = `batidas_impares_${context.token}_${stamp}`;

      $("#loadingText").textContent =
        `Gerando ${index + 1} de ${groups.length}: ${context.displayName}`;

      summaryLines.push(
        `${index + 1}. ${context.displayName} — ${group.employees.length} empregado(s), ${group.records.length} pendência(s)`,
      );

      files.push({
        name: `departamentos/${folder}/PDF/${baseName}.pdf`,
        data: buildPdf(context),
      });
      files.push({
        name: `departamentos/${folder}/XLSX/${baseName}.xlsx`,
        data: buildXlsx(context),
      });

      const pngFiles = await buildPngFiles(context);
      pngFiles.forEach((pngFile, pngIndex) => {
        files.push({
          name: `departamentos/${folder}/PNG/${baseName}${pngFiles.length > 1 ? `_parte_${pngIndex + 1}` : ""}.png`,
          data: pngFile.data,
        });
      });

      await new Promise((resolve) => setTimeout(resolve, 20));
    }

    files.unshift({
      name: "LEIA-ME.txt",
      data: summaryLines.join("\r\n"),
    });

    $("#loadingText").textContent = "Montando o arquivo ZIP...";
    const zipBytes = zipStore(files);
    downloadBlob(
      new Blob([zipBytes], { type: "application/zip" }),
      `batidas_impares_por_departamento_${stamp}.zip`,
    );
    toast(
      "ZIP por departamento gerado",
      `${groups.length} departamento(s) exportado(s) em PDF, PNG e XLSX.`,
      "success",
      5200,
    );
  } catch (error) {
    toast(
      "Erro ao gerar ZIP",
      error?.message || "Não foi possível montar o pacote por departamento.",
      "error",
      6000,
    );
  } finally {
    hideLoading();
  }
}
