[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$version = "v1.8.2"
$versionNumber = "1.8.2"
$hotfixBranch = "hotfix/v1.8.2-validacao-multiplataforma"
$stashName = "hotfix-v1.8.2-validacao-multiplataforma"
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
        throw "O comando '$Name' não foi encontrado no PATH."
    }
}

function Assert-Version {
    $requiredFiles = @(
        "index.html",
        "package.json",
        "project.manifest.json",
        "README.md",
        "CHANGELOG.md",
        "scripts/check-js.js"
    )

    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            throw "Arquivo obrigatório não encontrado: $file"
        }
    }

    $package = Get-Content "package.json" -Raw | ConvertFrom-Json
    $manifest = Get-Content "project.manifest.json" -Raw | ConvertFrom-Json
    $index = Get-Content "index.html" -Raw
    $readme = Get-Content "README.md" -Raw
    $changelog = Get-Content "CHANGELOG.md" -Raw

    if ($package.version -ne $versionNumber) {
        throw "package.json está em '$($package.version)', esperado '$versionNumber'."
    }

    if ($package.scripts.'check:js' -ne "node scripts/check-js.js") {
        throw "O script check:js do package.json não está configurado para o validador multiplataforma."
    }

    if ($manifest.version -ne $versionNumber) {
        throw "project.manifest.json está em '$($manifest.version)', esperado '$versionNumber'."
    }

    if ($index -notmatch 'content=["'']1\.8\.2["'']') {
        throw "A metatag da versão 1.8.2 não foi encontrada no index.html."
    }

    if ($index -notmatch 'v1\.8\.2') {
        throw "A identificação visual v1.8.2 não foi encontrada no index.html."
    }

    if ($readme -notmatch 'v1\.8\.2') {
        throw "A versão v1.8.2 não foi encontrada no README.md."
    }

    if ($changelog -notmatch '\[1\.8\.2\]') {
        throw "A seção [1.8.2] não foi encontrada no CHANGELOG.md."
    }

    Write-Host "Versão v1.8.2 validada." -ForegroundColor Green
}

function Assert-RefDoesNotExist {
    & git show-ref --verify --quiet "refs/heads/$hotfixBranch"
    if ($LASTEXITCODE -eq 0) {
        throw "A branch local '$hotfixBranch' já existe."
    }

    & git ls-remote --exit-code --heads origin $hotfixBranch *> $null
    if ($LASTEXITCODE -eq 0) {
        throw "A branch remota '$hotfixBranch' já existe."
    }

    & git rev-parse --quiet --verify "refs/tags/$version" *> $null
    if ($LASTEXITCODE -eq 0) {
        throw "A tag local '$version' já existe."
    }

    & git ls-remote --exit-code --tags origin "refs/tags/$version" *> $null
    if ($LASTEXITCODE -eq 0) {
        throw "A tag remota '$version' já existe."
    }
}

try {
    Write-Host "Publicação robusta do Batidas Ímpares $version" -ForegroundColor Magenta

    foreach ($command in @("git", "node", "npm")) {
        Assert-Command -Name $command
    }

    & git rev-parse --is-inside-work-tree *> $null
    if ($LASTEXITCODE -ne 0) {
        throw "A pasta atual não é um repositório Git."
    }

    $currentBranch = (& git branch --show-current).Trim()
    if ($currentBranch -ne "dev") {
        throw "O processo deve começar na branch dev. Branch atual: '$currentBranch'."
    }

    & git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`nAlterações já adicionadas ao stage:" -ForegroundColor Yellow
        & git diff --cached --name-status
        throw "Revise ou limpe o stage antes de continuar."
    }

    Assert-Version
    Invoke-Git @("fetch", "--all", "--prune", "--tags")
    Assert-RefDoesNotExist

    $devDifference = ((& git rev-list --left-right --count "origin/dev...dev").Trim() -split "\s+")
    $remoteOnly = [int]$devDifference[0]
    $localOnly = [int]$devDifference[1]

    if ($remoteOnly -gt 0) {
        throw "A dev local está atrás da origin/dev por $remoteOnly commit(s). Atualize-a antes de continuar."
    }

    if ($localOnly -gt 0) {
        Write-Host "A dev possui $localOnly commit(s) local(is) ainda não publicado(s); eles serão preservados." -ForegroundColor Yellow
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
        throw "Nenhuma alteração oficial da v1.8.2 foi encontrada. Extraia o pacote sobre o projeto antes de executar este script."
    }

    Write-Host "`nValidação antes da criação do hotfix..." -ForegroundColor Yellow
    Invoke-Npm @("test")
    Invoke-Npm @("run", "check:js")

    $stashArguments = @("stash", "push", "-u", "-m", $stashName, "--") + $projectPaths
    Invoke-Git $stashArguments

    Invoke-Git @("switch", "main")
    Invoke-Git @("pull", "--ff-only", "origin", "main")
    Invoke-Git @("switch", "-c", $hotfixBranch)
    Invoke-Git @("stash", "pop", "stash@{0}")

    Assert-Version

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
        Write-Host "`nArquivos proibidos encontrados no stage:" -ForegroundColor Red
        $blockedFiles | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        & git restore --staged -- $blockedFiles
        throw "ZIPs, checksums ou arquivos da pasta OLD foram removidos do stage. Revise antes de tentar novamente."
    }

    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        throw "Nenhuma alteração foi adicionada ao commit da v1.8.2."
    }

    Invoke-Git @("diff", "--cached", "--check")
    Invoke-Git @("diff", "--cached", "--stat")

    Invoke-Git @(
        "commit",
        "-m", "fix(tooling): tornar a validação JavaScript multiplataforma",
        "-m", "Substitui find, sort e xargs por um validador escrito em Node.js puro.",
        "-m", "Permite executar npm run check:js no PowerShell, Prompt de Comando, Linux, macOS e integração contínua.",
        "-m", "Adiciona normalização de finais de linha, atualiza testes, documentação, changelog e versão para v1.8.2."
    )

    Assert-Version
    Invoke-Npm @("test")
    Invoke-Npm @("run", "check:js")

    $trackedChanges = @(& git status --porcelain --untracked-files=no)
    if ($trackedChanges.Count -gt 0) {
        Write-Host "`nAlterações rastreadas restantes:" -ForegroundColor Yellow
        $trackedChanges | ForEach-Object { Write-Host $_ }
        throw "A branch de hotfix não ficou limpa após o commit."
    }

    Invoke-Git @("switch", "main")
    Invoke-Git @(
        "merge",
        "--no-ff",
        $hotfixBranch,
        "-m", "hotfix(v1.8.2): publicar validação JavaScript multiplataforma"
    )

    Assert-Version
    Invoke-Npm @("test")
    Invoke-Npm @("run", "check:js")

    Invoke-Git @(
        "tag",
        "-a",
        $version,
        "-m",
        "Batidas Ímpares v1.8.2 — validação JavaScript multiplataforma e normalização de finais de linha."
    )

    Invoke-Git @("switch", "dev")
    Invoke-Git @(
        "merge",
        "--no-ff",
        $hotfixBranch,
        "-m", "merge(hotfix): integrar correção v1.8.2 na dev"
    )

    Assert-Version
    Invoke-Npm @("test")
    Invoke-Npm @("run", "check:js")

    Invoke-Git @(
        "push",
        "--atomic",
        "origin",
        $hotfixBranch,
        "main",
        "dev",
        $version
    )

    Invoke-Git @("status")
    Invoke-Git @(
        "log",
        "--oneline",
        "--decorate",
        "--graph",
        "--all",
        "-n",
        "20"
    )

    Write-Host "`nHotfix v1.8.2 publicado com sucesso." -ForegroundColor Green
    Write-Host "Fluxo: $hotfixBranch -> main + dev -> tag $version" -ForegroundColor Green
}
catch {
    Write-Host "`nPUBLICAÇÃO INTERROMPIDA" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Nenhuma referência remota é enviada antes da etapa final de push atômico." -ForegroundColor Yellow
    exit 1
}
