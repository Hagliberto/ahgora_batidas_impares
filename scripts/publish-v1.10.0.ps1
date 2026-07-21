#requires -Version 7.0
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$version = "v1.10.0"
$versionNumber = "1.10.0"
$releaseBranch = "release/v1.10.0"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Set-Location $projectRoot

function Invoke-External {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter(Mandatory)][string[]]$Arguments
    )

    Write-Host "`n> $FilePath $($Arguments -join ' ')" -ForegroundColor Cyan
    & $FilePath @Arguments

    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao executar: $FilePath $($Arguments -join ' ')"
    }
}

function Invoke-Git {
    param([Parameter(Mandatory)][string[]]$Arguments)
    Invoke-External -FilePath "git" -Arguments $Arguments
}

function Invoke-Npm {
    param([Parameter(Mandatory)][string[]]$Arguments)
    Invoke-External -FilePath "npm" -Arguments $Arguments
}

function Assert-Command {
    param([Parameter(Mandatory)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "O comando '$Name' nao foi encontrado no PATH."
    }
}

function Assert-Version {
    $requiredFiles = @(
        "index.html",
        "package.json",
        "project.manifest.json",
        "README.md",
        "CHANGELOG.md",
        "scripts/check-js.js",
        "assets/css/12-v1100-ux.css",
        "assets/js/infrastructure/export/department-zip-exporter.js"
    )

    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            throw "Arquivo obrigatorio nao encontrado: $file"
        }
    }

    $package = Get-Content "package.json" -Raw | ConvertFrom-Json
    $manifest = Get-Content "project.manifest.json" -Raw | ConvertFrom-Json
    $index = Get-Content "index.html" -Raw
    $readme = Get-Content "README.md" -Raw
    $changelog = Get-Content "CHANGELOG.md" -Raw

    if ($package.version -ne $versionNumber) {
        throw "package.json esta em '$($package.version)', esperado '$versionNumber'."
    }

    if ($package.scripts.'check:js' -ne "node scripts/check-js.js") {
        throw "O script check:js nao usa o validador multiplataforma."
    }

    if ($manifest.version -ne $versionNumber) {
        throw "project.manifest.json esta em '$($manifest.version)', esperado '$versionNumber'."
    }

    if ($index -notmatch 'content=["'']1\.10\.0["'']') {
        throw "A metatag da versao 1.10.0 nao foi encontrada no index.html."
    }

    if ($index -notmatch 'v1\.10\.0') {
        throw "A identificacao visual v1.10.0 nao foi encontrada no index.html."
    }

    if ($readme -notmatch 'v1\.10\.0') {
        throw "A versao v1.10.0 nao foi encontrada no README.md."
    }

    if ($changelog -notmatch '\[1\.10\.0\]') {
        throw "A secao [1.10.0] nao foi encontrada no CHANGELOG.md."
    }

    Write-Host "Versao v1.10.0 validada." -ForegroundColor Green
}

function Assert-RefDoesNotExist {
    & git show-ref --verify --quiet "refs/heads/$releaseBranch"
    if ($LASTEXITCODE -eq 0) {
        throw "A branch local '$releaseBranch' ja existe."
    }

    & git ls-remote --exit-code --heads origin $releaseBranch *> $null
    if ($LASTEXITCODE -eq 0) {
        throw "A branch remota '$releaseBranch' ja existe."
    }

    & git rev-parse --quiet --verify "refs/tags/$version" *> $null
    if ($LASTEXITCODE -eq 0) {
        throw "A tag local '$version' ja existe."
    }

    & git ls-remote --exit-code --tags origin "refs/tags/$version" *> $null
    if ($LASTEXITCODE -eq 0) {
        throw "A tag remota '$version' ja existe."
    }
}

try {
    Write-Host "Publicacao robusta do Batidas Impares $version" -ForegroundColor Magenta

    if ($PSVersionTable.PSEdition -ne "Core") {
        throw "Execute este script com PowerShell 7: pwsh -File .\scripts\publish-v1.10.0.ps1"
    }

    foreach ($command in @("git", "node", "npm")) {
        Assert-Command -Name $command
    }

    & git rev-parse --is-inside-work-tree *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "A pasta atual nao e um repositorio Git."
    }

    $currentBranch = (& git branch --show-current).Trim()
    if ($currentBranch -ne "dev") {
        throw "O processo deve comecar na branch dev. Branch atual: '$currentBranch'."
    }

    & git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        & git diff --cached --name-status
        throw "Existem alteracoes previamente adicionadas ao stage."
    }

    Assert-Version
    Invoke-Git @("fetch", "--all", "--prune", "--tags")
    Assert-RefDoesNotExist

    $devDifference = ((& git rev-list --left-right --count "origin/dev...dev").Trim() -split "\s+")
    $remoteOnly = [int]$devDifference[0]
    $localOnly = [int]$devDifference[1]

    if ($remoteOnly -gt 0 -and $localOnly -gt 0) {
        throw "A dev local e a origin/dev possuem historicos divergentes ($localOnly commit(s) locais e $remoteOnly remotos). Isso ocorre quando o clone antigo e usado depois da reescrita que removeu OLD. Use o clone novo validado e extraia o pacote nele."
    }

    if ($remoteOnly -gt 0) {
        throw "A dev local esta atras da origin/dev por $remoteOnly commit(s). Execute git pull --ff-only antes de continuar."
    }

    if ($localOnly -gt 0) {
        throw "A dev local possui $localOnly commit(s) ainda nao publicados. Publique ou reorganize esses commits antes de iniciar a release."
    }

    $candidatePaths = @(
        ".editorconfig",
        ".gitattributes",
        ".gitignore",
        ".github",
        "LEIA-ME.txt",
        "README.md",
        "CHANGELOG.md",
        "CONTRIBUTING.md",
        "LICENSE",
        "index.html",
        "assets",
        "docs",
        "exemplos",
        "package.json",
        "package-lock.json",
        "project.manifest.json",
        "scripts",
        "tests"
    )

    $projectPaths = @(
        $candidatePaths |
            Where-Object { Test-Path $_ } |
            Select-Object -Unique
    )

    $officialChanges = @(& git status --porcelain -- $projectPaths)
    if ($officialChanges.Count -eq 0) {
        throw "Nenhuma alteracao oficial da v1.10.0 foi encontrada. Extraia o pacote sobre o projeto antes de executar."
    }

    Write-Host "`nValidacao antes da criacao da release..." -ForegroundColor Yellow
    Invoke-Npm @("test")
    Invoke-Npm @("run", "check:js")

    Invoke-Git @("switch", "-c", $releaseBranch)

    $addArguments = @("add", "-A", "--") + $projectPaths
    Invoke-Git $addArguments

    $stagedFiles = @(& git diff --cached --name-only)
    $blockedFiles = @(
        $stagedFiles | Where-Object {
            $_ -match '(^|/).*\.zip$' -or
            $_ -match '(^|/).*\.zip\.sha256$' -or
            $_ -match '^OLD/'
        }
    )

    if ($blockedFiles.Count -gt 0) {
        $blockedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        & git restore --staged -- $blockedFiles
        throw "ZIPs, checksums ou arquivos OLD foram removidos do stage."
    }

    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        throw "Nenhuma alteracao foi adicionada ao commit da v1.10.0."
    }

    Invoke-Git @("diff", "--cached", "--check")
    Invoke-Git @("diff", "--cached", "--stat")

    Invoke-Git @(
        "commit",
        "-m", "feat(exportacao): adicionar pacote ZIP e aprimorar a experiencia dos cards",
        "-m", "Adiciona pacote ZIP com PDF, PNG e XLSX separados por departamento e preserva os filtros ativos.",
        "-m", "Define a visao por departamento como padrao, inclui controle para abrir ou fechar todos os expanders e moderniza a selecao de colaboradores com toggles.",
        "-m", "Aplica a animacao vetorial do Guia Rapido aos icones da aplicacao e atualiza acessibilidade, testes e documentacao da v1.10.0."
    )

    Assert-Version
    Invoke-Npm @("test")
    Invoke-Npm @("run", "check:js")

    $trackedChanges = @(& git status --porcelain --untracked-files=no)
    if ($trackedChanges.Count -gt 0) {
        $trackedChanges | ForEach-Object { Write-Host $_ }
        throw "A branch de release nao ficou limpa apos o commit."
    }

    Invoke-Git @("switch", "dev")
    Invoke-Git @("merge", "--ff-only", $releaseBranch)

    Invoke-Git @("switch", "main")
    Invoke-Git @("pull", "--ff-only", "origin", "main")
    Invoke-Git @(
        "merge",
        "--no-ff",
        "dev",
        "-m", "release(v1.10.0): publicar ZIP por departamento e melhorias de usabilidade"
    )

    Assert-Version
    Invoke-Npm @("test")
    Invoke-Npm @("run", "check:js")

    Invoke-Git @(
        "tag",
        "-a",
        $version,
        "-m",
        "Batidas Impares v1.10.0 - ZIP por departamento, expanders globais, toggles animados e agrupamento departamental por padrao."
    )

    # Alinha dev e main no mesmo commit para evitar sugestoes de PR sem arquivos alterados.
    Invoke-Git @("switch", "dev")
    Invoke-Git @("merge", "--ff-only", "main")

    Invoke-Git @(
        "push",
        "--atomic",
        "origin",
        $releaseBranch,
        "main",
        "dev",
        $version
    )

    Invoke-Git @("status")
    Invoke-Git @("log", "--oneline", "--decorate", "--graph", "--all", "-n", "20")

    Write-Host "`nVersao v1.10.0 publicada com sucesso." -ForegroundColor Green
    Write-Host "main e dev terminaram alinhadas no mesmo commit." -ForegroundColor Green
}
catch {
    Write-Host "`nPUBLICACAO INTERROMPIDA" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Nenhuma referencia remota e enviada antes do push atomico final." -ForegroundColor Yellow
    exit 1
}
