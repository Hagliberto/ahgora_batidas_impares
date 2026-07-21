#requires -Version 7.0
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$repoUrl = "https://github.com/Hagliberto/ahgora_batidas_impares.git"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetRoot = Join-Path (Split-Path $sourceRoot -Parent) "batidas_impares-publish-v1.10.0-$timestamp"

function Invoke-External {
    param(
        [Parameter(Mandatory)][string]$FilePath,
        [Parameter(Mandatory)][string[]]$Arguments,
        [string]$WorkingDirectory = $sourceRoot
    )

    Push-Location $WorkingDirectory
    try {
        Write-Host "`n> $FilePath $($Arguments -join ' ')" -ForegroundColor Cyan
        & $FilePath @Arguments
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao executar: $FilePath $($Arguments -join ' ')"
        }
    }
    finally {
        Pop-Location
    }
}

function Copy-ProjectItem {
    param([Parameter(Mandatory)][string]$RelativePath)

    $source = Join-Path $sourceRoot $RelativePath
    if (-not (Test-Path $source)) {
        return
    }

    $destination = Join-Path $targetRoot $RelativePath
    $destinationParent = Split-Path $destination -Parent
    if (-not (Test-Path $destinationParent)) {
        New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    }

    Copy-Item -Path $source -Destination $destination -Recurse -Force
}

try {
    Write-Host "Recuperacao segura e publicacao da v1.10.0" -ForegroundColor Magenta

    foreach ($command in @("git", "node", "npm", "pwsh")) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
            throw "O comando '$command' nao foi encontrado no PATH."
        }
    }

    $package = Get-Content (Join-Path $sourceRoot "package.json") -Raw | ConvertFrom-Json
    $manifest = Get-Content (Join-Path $sourceRoot "project.manifest.json") -Raw | ConvertFrom-Json
    $index = Get-Content (Join-Path $sourceRoot "index.html") -Raw

    if ($package.version -ne "1.10.0" -or $manifest.version -ne "1.10.0") {
        throw "O projeto de origem nao esta na versao 1.10.0."
    }

    if ($index -notmatch 'content=["'']1\.10\.0["'']' -or $index -notmatch 'v1\.10\.0') {
        throw "O index.html de origem nao possui a versao 1.10.0."
    }

    Write-Host "`nValidando o pacote antes da recuperacao..." -ForegroundColor Yellow
    Invoke-External -FilePath "npm" -Arguments @("test")
    Invoke-External -FilePath "npm" -Arguments @("run", "check:js")

    if (Test-Path $targetRoot) {
        throw "A pasta de destino ja existe: $targetRoot"
    }

    Invoke-External -FilePath "git" -Arguments @("clone", $repoUrl, $targetRoot) -WorkingDirectory (Split-Path $targetRoot -Parent)
    Invoke-External -FilePath "git" -Arguments @("switch", "dev") -WorkingDirectory $targetRoot
    Invoke-External -FilePath "git" -Arguments @("fetch", "--all", "--prune", "--tags") -WorkingDirectory $targetRoot

    $difference = ((& git -C $targetRoot rev-list --left-right --count "origin/dev...dev").Trim() -split "\s+")
    if ([int]$difference[0] -ne 0 -or [int]$difference[1] -ne 0) {
        throw "O clone novo nao ficou alinhado com origin/dev."
    }

    Write-Host "`nSubstituindo o conteudo pelo pacote v1.10.0..." -ForegroundColor Yellow
    Get-ChildItem -Path $targetRoot -Force |
        Where-Object { $_.Name -ne ".git" } |
        Remove-Item -Recurse -Force

    $officialPaths = @(
        ".editorconfig",
        ".gitattributes",
        ".gitignore",
        "LEIA-ME.txt",
        "README.md",
        "CHANGELOG.md",
        "CONTRIBUTING.md",
        "index.html",
        "assets",
        "docs",
        "exemplos",
        "package.json",
        "project.manifest.json",
        "tests",
        "scripts/check-js.js",
        "scripts/publish-v1.10.0.ps1",
        "scripts/recover-and-publish-v1.10.0.ps1"
    )

    foreach ($path in $officialPaths) {
        Copy-ProjectItem -RelativePath $path
    }

    Write-Host "`nClone novo preparado em:" -ForegroundColor Green
    Write-Host $targetRoot -ForegroundColor Green

    Invoke-External -FilePath "npm" -Arguments @("test") -WorkingDirectory $targetRoot
    Invoke-External -FilePath "npm" -Arguments @("run", "check:js") -WorkingDirectory $targetRoot

    Write-Host "`nIniciando a publicacao robusta..." -ForegroundColor Yellow
    Invoke-External -FilePath "pwsh" -Arguments @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", (Join-Path $targetRoot "scripts/publish-v1.10.0.ps1")
    ) -WorkingDirectory $targetRoot

    Write-Host "`nPROCESSO CONCLUIDO" -ForegroundColor Green
    Write-Host "Use este clone daqui em diante:" -ForegroundColor Green
    Write-Host $targetRoot -ForegroundColor Green
    Write-Host "Nao faca novos commits ou pushes pelo clone antigo." -ForegroundColor Yellow
}
catch {
    Write-Host "`nRECUPERACAO/PUBLICACAO INTERROMPIDA" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if (Test-Path $targetRoot) {
        Write-Host "Clone temporario preservado para inspecao: $targetRoot" -ForegroundColor Yellow
    }
    exit 1
}
