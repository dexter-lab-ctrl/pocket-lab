<#
.SYNOPSIS
  Bootstrap the Pocket Lab Ubuntu development environment inside WSL2.

.DESCRIPTION
  Runs the Ubuntu-side setup/check scripts from Windows PowerShell 7. The real
  Pocket Lab development environment is created inside the Linux filesystem,
  defaulting to /home/<user>/pocket-lab, so existing Ubuntu Taskfile workflows
  remain the source of truth.

.PARAMETER ExpectedDistro
  Expected Ubuntu WSL distro name. Defaults to $env:POCKETLAB_WSL_DISTRO, then Ubuntu.

.PARAMETER LinuxRepoPath
  Target Pocket Lab repository path inside Ubuntu. Defaults to $env:POCKETLAB_WSL_REPO_PATH,
  then /home/<user>/pocket-lab.

.PARAMETER CheckOnly
  Run the Ubuntu-side checker only. Does not install packages or sync the repo.

.PARAMETER SkipRepoSync
  Do not sync the current Windows repo into LinuxRepoPath.

.PARAMETER ReportPath
  Windows-side wrapper report path. Defaults to .pocketlab-dev/reports/wsl-ubuntu-bootstrap-wrapper.json.
#>

[CmdletBinding()]
param(
    [string]$ExpectedDistro = $(if ($env:POCKETLAB_WSL_DISTRO) { $env:POCKETLAB_WSL_DISTRO } else { 'Ubuntu' }),
    [string]$LinuxRepoPath = $(if ($env:POCKETLAB_WSL_REPO_PATH) { $env:POCKETLAB_WSL_REPO_PATH } else { '/home/$USER/pocket-lab' }),
    [switch]$CheckOnly,
    [switch]$SkipRepoSync,
    [string]$ReportPath = '.pocketlab-dev/reports/wsl-ubuntu-bootstrap-wrapper.json'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Ok($Message) { Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Info($Message) { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
function Write-Fail($Message) { Write-Host "[FAIL] $Message" -ForegroundColor Red }

function Invoke-WslChecked {
    param([string[]]$Arguments)
    $output = & wsl.exe @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    if ($output) { $output | ForEach-Object { Write-Host $_ } }
    if ($exitCode -ne 0) {
        throw "wsl.exe failed with exit code ${exitCode}: $($Arguments -join ' ')"
    }
}

Write-Host ''
Write-Host 'Pocket Lab Phase 2 WSL2 Ubuntu bootstrap wrapper'
Write-Host '==================================================='

$repoRoot = (Resolve-Path '.').Path
if (-not (Test-Path (Join-Path $repoRoot 'Taskfile.yml'))) {
    throw 'Run this command from the Pocket Lab repository root containing Taskfile.yml.'
}

if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
    throw 'wsl.exe was not found. Run Phase 1 Windows host preflight first.'
}

$wslList = & wsl.exe -l -v 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { throw 'Unable to query WSL distributions.' }
$wslListClean = $wslList -replace [string][char]0, ''
if ($wslListClean -notmatch "(?m)^\s*\*?\s*$([regex]::Escape($ExpectedDistro))\s+") {
    throw "Expected WSL distro '$ExpectedDistro' was not found. Available distros:`n$wslListClean"
}
Write-Ok "WSL distro '$ExpectedDistro' found"

$windowsRepoForWsl = $repoRoot -replace '\\', '/'
$sourcePath = (& wsl.exe -d $ExpectedDistro -- wslpath -a "$windowsRepoForWsl" 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($sourcePath)) {
    throw "Unable to translate Windows repo path to WSL path: $repoRoot"
}
Write-Ok "Windows repo path visible inside WSL as $sourcePath"

$targetRepoExpression = $LinuxRepoPath
if ($targetRepoExpression -eq '/home/$USER/pocket-lab') {
    $targetRepoExpression = '$HOME/pocket-lab'
}

$scriptName = if ($CheckOnly) { 'scripts/dev/check-wsl-ubuntu-dev.sh' } else { 'scripts/dev/setup-wsl-ubuntu-dev.sh' }
$scriptPath = Join-Path $repoRoot $scriptName
if (-not (Test-Path $scriptPath)) {
    throw "Missing $scriptName. Apply the Phase 2 patch files before running this wrapper."
}

$repoSyncFlag = if ($SkipRepoSync) { '1' } else { '0' }
$checkOnlyFlag = if ($CheckOnly) { '1' } else { '0' }

$bash = @"
set -Eeuo pipefail
cd '$sourcePath'
export POCKETLAB_WSL_SOURCE_ROOT='$sourcePath'
export POCKETLAB_WSL_REPO_PATH="$targetRepoExpression"
export POCKETLAB_WSL_SKIP_REPO_SYNC='$repoSyncFlag'
export POCKETLAB_WSL_CHECK_ONLY='$checkOnlyFlag'
bash '$scriptName'
"@

Invoke-WslChecked -Arguments @('-d', $ExpectedDistro, '--', 'bash', '-lc', $bash)

New-Item -ItemType Directory -Force -Path (Split-Path $ReportPath -Parent) | Out-Null
$report = [ordered]@{
    schema = 'pocketlab.wslUbuntuBootstrapWrapper/v1'
    generated_at_utc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    expected_distro = $ExpectedDistro
    windows_repo_root = $repoRoot
    wsl_source_path = $sourcePath
    linux_repo_path = $LinuxRepoPath
    check_only = [bool]$CheckOnly
    skip_repo_sync = [bool]$SkipRepoSync
    status = 'OK'
}
$report | ConvertTo-Json -Depth 8 | Set-Content -Path $ReportPath -Encoding UTF8
Write-Ok "Wrapper report written to $ReportPath"
Write-Host ''
Write-Host 'Phase 2 wrapper completed.'
