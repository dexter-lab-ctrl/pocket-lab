<#
.SYNOPSIS
  Configure Visual Studio Code for Pocket Lab development on Windows + WSL2 Ubuntu.

.DESCRIPTION
  Installs required VS Code extensions on the Windows host when the `code` CLI is
  available, writes repository-local VS Code workspace configuration, and attempts
  to install Linux-side Remote WSL extensions inside the selected Ubuntu distro
  when the WSL `code` helper is already available.

  This script does not install Ubuntu packages or bootstrap Pocket Lab inside WSL.
  It complements the Phase 1 Windows host preflight and prepares the editor,
  debugger, tasks, and recommended extensions for the later WSL2 Ubuntu bootstrap.

.PARAMETER ExpectedDistro
  Expected Ubuntu WSL distro name. Defaults to $env:POCKETLAB_WSL_DISTRO, then Ubuntu.

.PARAMETER SkipExtensionInstall
  Only write .vscode configuration files. Do not install VS Code extensions.

.PARAMETER IncludeOptionalExtensions
  Install optional productivity extensions in addition to the required Pocket Lab set.

.PARAMETER ReportPath
  Path for the generated JSON report. Defaults to
  .pocketlab-dev/reports/vscode-configuration.json.

.PARAMETER JsonOnly
  Emit only JSON to stdout.

.EXAMPLE
  pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/configure-vscode.ps1

.EXAMPLE
  pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/configure-vscode.ps1 -ExpectedDistro Ubuntu-22.04 -IncludeOptionalExtensions
#>

[CmdletBinding()]
param(
    [string]$ExpectedDistro = $(if ($env:POCKETLAB_WSL_DISTRO) { $env:POCKETLAB_WSL_DISTRO } else { 'Ubuntu' }),
    [switch]$SkipExtensionInstall,
    [switch]$IncludeOptionalExtensions,
    [string]$ReportPath = '.pocketlab-dev/reports/vscode-configuration.json',
    [switch]$JsonOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repoRoot

$results = [System.Collections.Generic.List[object]]::new()

function Add-Result {
    param(
        [Parameter(Mandatory)] [string]$Name,
        [Parameter(Mandatory)] [ValidateSet('OK','WARN','FAIL','INFO')] [string]$Status,
        [string]$Details = '',
        [string]$Remediation = ''
    )
    $results.Add([pscustomobject]@{
        name        = $Name
        status      = $Status
        details     = $Details
        remediation = $Remediation
    }) | Out-Null
}

function Test-CommandExists {
    param([Parameter(Mandatory)] [string]$Command)
    return [bool](Get-Command $Command -ErrorAction SilentlyContinue)
}

function Invoke-Capture {
    param([Parameter(Mandatory)] [scriptblock]$Command)
    try {
        $output = & $Command 2>&1
        return [pscustomobject]@{
            exitCode = $LASTEXITCODE
            output   = (($output | Out-String) -replace "`0", '').Trim()
        }
    } catch {
        return [pscustomobject]@{
            exitCode = 1
            output   = $_.Exception.Message
        }
    }
}

function Write-ResultTable {
    if ($JsonOnly) { return }
    Write-Host ''
    Write-Host 'Pocket Lab VS Code configuration' -ForegroundColor Cyan
    Write-Host '=================================' -ForegroundColor Cyan
    foreach ($item in $results) {
        $color = switch ($item.status) {
            'OK'   { 'Green' }
            'WARN' { 'Yellow' }
            'FAIL' { 'Red' }
            default { 'Gray' }
        }
        Write-Host ('[{0}] {1}' -f $item.status, $item.name) -ForegroundColor $color
        if ($item.details) { Write-Host ('  {0}' -f $item.details) }
        if ($item.status -ne 'OK' -and $item.remediation) { Write-Host ('  Fix: {0}' -f $item.remediation) -ForegroundColor Yellow }
    }
}

function Install-CodeExtension {
    param(
        [Parameter(Mandatory)] [string]$ExtensionId,
        [Parameter(Mandatory)] [ValidateSet('Windows','WSL')] [string]$Target
    )

    if ($SkipExtensionInstall) {
        Add-Result -Name "$Target extension $ExtensionId" -Status INFO -Details 'Extension installation skipped by request.'
        return
    }

    if ($Target -eq 'Windows') {
        if (-not (Test-CommandExists 'code.cmd')) {
            Add-Result -Name "Windows extension $ExtensionId" -Status WARN -Details 'code.cmd not found in PATH.' -Remediation 'Install VS Code, enable the Shell Command: Install code command in PATH action, then rerun.'
            return
        }
        $install = Invoke-Capture { code.cmd --install-extension $ExtensionId --force }
        if ($install.exitCode -eq 0) {
            Add-Result -Name "Windows extension $ExtensionId" -Status OK -Details 'Installed or already present.'
        } else {
            Add-Result -Name "Windows extension $ExtensionId" -Status WARN -Details $install.output -Remediation 'Install the extension manually from VS Code Extensions if automatic install failed.'
        }
        return
    }

    if (-not (Test-CommandExists 'wsl.exe')) {
        Add-Result -Name "WSL extension $ExtensionId" -Status WARN -Details 'wsl.exe not found.' -Remediation 'Run the Windows host preflight and install/repair WSL2.'
        return
    }

    $hasWslCode = Invoke-Capture { wsl.exe -d $ExpectedDistro -- bash -lc 'command -v code >/dev/null 2>&1' }
    if ($hasWslCode.exitCode -ne 0) {
        Add-Result -Name "WSL extension $ExtensionId" -Status WARN -Details "The VS Code Remote WSL helper is not available inside $ExpectedDistro yet." -Remediation "Open the repo once with: wsl -d $ExpectedDistro -- bash -lc 'cd ~/pocket-lab && code .' then rerun this script."
        return
    }

    $escapedExtension = $ExtensionId.Replace("'", "'\\''")
    $install = Invoke-Capture { wsl.exe -d $ExpectedDistro -- bash -lc "code --install-extension '$escapedExtension' --force" }
    if ($install.exitCode -eq 0) {
        Add-Result -Name "WSL extension $ExtensionId" -Status OK -Details 'Installed or already present in the remote WSL VS Code server.'
    } else {
        Add-Result -Name "WSL extension $ExtensionId" -Status WARN -Details $install.output -Remediation 'Open VS Code in Remote - WSL mode and install the recommended workspace extensions.'
    }
}

$requiredWindowsExtensions = @(
    'ms-vscode-remote.remote-wsl',
    'ms-vscode-remote.remote-containers',
    'ms-vscode.powershell'
)

$requiredWorkspaceExtensions = @(
    'ms-python.python',
    'ms-python.vscode-pylance',
    'ms-python.black-formatter',
    'charliermarsh.ruff',
    'dbaeumer.vscode-eslint',
    'esbenp.prettier-vscode',
    'ms-playwright.playwright',
    'redhat.vscode-yaml',
    'redhat.ansible',
    'timonwong.shellcheck',
    'ms-azuretools.vscode-docker',
    'github.vscode-github-actions',
    'bierner.markdown-mermaid',
    'yzhang.markdown-all-in-one'
)

$optionalExtensions = @(
    'eamodio.gitlens',
    'DavidAnson.vscode-markdownlint',
    'streetsidesoftware.code-spell-checker'
)

$allRecommendations = @()
$allRecommendations += $requiredWindowsExtensions
$allRecommendations += $requiredWorkspaceExtensions
if ($IncludeOptionalExtensions) { $allRecommendations += $optionalExtensions }
$allRecommendations = $allRecommendations | Sort-Object -Unique

$vscodeDir = Join-Path $repoRoot '.vscode'
New-Item -ItemType Directory -Force -Path $vscodeDir | Out-Null

$extensionsJson = [ordered]@{
    recommendations = @($allRecommendations)
    unwantedRecommendations = @()
} | ConvertTo-Json -Depth 5
Set-Content -Path (Join-Path $vscodeDir 'extensions.json') -Value ($extensionsJson + "`n") -Encoding UTF8
Add-Result -Name '.vscode/extensions.json' -Status OK -Details 'Workspace extension recommendations written.'

$settings = [ordered]@{
    'python.defaultInterpreterPath' = '${workspaceFolder}/.venv/bin/python'
    'python.terminal.activateEnvironment' = $true
    'python.testing.pytestEnabled' = $true
    'python.testing.unittestEnabled' = $false
    'python.testing.pytestArgs' = @('tests','pocket-lab-final-structure/runtime/tests')
    'editor.formatOnSave' = $true
    'editor.codeActionsOnSave' = [ordered]@{
        'source.fixAll.eslint' = 'explicit'
        'source.organizeImports' = 'explicit'
    }
    'files.eol' = "`n"
    'files.trimTrailingWhitespace' = $true
    'files.insertFinalNewline' = $true
    'eslint.validate' = @('javascript','javascriptreact','typescript','typescriptreact')
    'yaml.validate' = $true
    'yaml.format.enable' = $true
    'terminal.integrated.defaultProfile.linux' = 'bash'
    'terminal.integrated.cwd' = '${workspaceFolder}'
    'playwright.reuseBrowser' = $true
    'markdown.extension.toc.updateOnSave' = $false
}
$settingsJson = $settings | ConvertTo-Json -Depth 10
Set-Content -Path (Join-Path $vscodeDir 'settings.json') -Value ($settingsJson + "`n") -Encoding UTF8
Add-Result -Name '.vscode/settings.json' -Status OK -Details 'Workspace settings written for WSL2 Ubuntu development.'

$tasks = @'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Pocket Lab: dev up",
      "type": "shell",
      "command": "task dev:up",
      "problemMatcher": []
    },
    {
      "label": "Pocket Lab: dev status",
      "type": "shell",
      "command": "task dev:status",
      "problemMatcher": []
    },
    {
      "label": "Pocket Lab: dev down",
      "type": "shell",
      "command": "task dev:down",
      "problemMatcher": []
    },
    {
      "label": "Pocket Lab: backend tests",
      "type": "shell",
      "command": "python3 -m pytest -q pocket-lab-final-structure/runtime/tests tests/backend",
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "Pocket Lab: frontend build",
      "type": "shell",
      "command": "npm run build",
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "Pocket Lab: Playwright tests",
      "type": "shell",
      "command": "npx playwright test",
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "Pocket Lab: docs full check",
      "type": "shell",
      "command": "task docs:api && task docs:events && task docs:operations && task docs:architecture && task docs:threat-model:check && task docs:threat-model:drift && task docs:threat-model:sync:check && task docs:runbooks:full-check && mkdocs build --strict",
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "Pocket Lab: NATS stack test",
      "type": "shell",
      "command": "task test:nats",
      "group": "test",
      "problemMatcher": []
    }
  ]
}
'@
Set-Content -Path (Join-Path $vscodeDir 'tasks.json') -Value $tasks -Encoding UTF8
Add-Result -Name '.vscode/tasks.json' -Status OK -Details 'Pocket Lab development, test, and docs tasks written.'

$launch = @'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Pocket Lab: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "cwd": "${workspaceFolder}/pocket-lab-final-structure",
      "args": [
        "runtime.api_fastapi.pocket_lab_fastapi_server:app",
        "--host",
        "127.0.0.1",
        "--port",
        "8000",
        "--reload"
      ],
      "env": {
        "POCKETLAB_ENV": "dev",
        "POCKETLAB_STATE_DIR": "${workspaceFolder}/.pocketlab-dev/state",
        "POCKETLAB_NATS_URL": "nats://127.0.0.1:4222",
        "POCKETLAB_NATS_REQUIRED": "1",
        "POCKETLAB_NATS_REQUIRE_JETSTREAM": "1"
      },
      "console": "integratedTerminal",
      "justMyCode": false
    },
    {
      "name": "Pocket Lab: Worker",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/pocket-lab-final-structure/runtime/workers/pocketlab_worker.py",
      "cwd": "${workspaceFolder}/pocket-lab-final-structure",
      "env": {
        "POCKETLAB_ENV": "dev",
        "POCKETLAB_STATE_DIR": "${workspaceFolder}/.pocketlab-dev/state",
        "POCKETLAB_NATS_URL": "nats://127.0.0.1:4222",
        "POCKETLAB_NATS_REQUIRED": "1",
        "POCKETLAB_NATS_REQUIRE_JETSTREAM": "1"
      },
      "console": "integratedTerminal",
      "justMyCode": false
    },
    {
      "name": "Pocket Lab: Frontend in browser",
      "type": "pwa-chrome",
      "request": "launch",
      "url": "http://127.0.0.1:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ],
  "compounds": [
    {
      "name": "Pocket Lab: API + Worker",
      "configurations": [
        "Pocket Lab: FastAPI",
        "Pocket Lab: Worker"
      ],
      "stopAll": true
    }
  ]
}
'@
Set-Content -Path (Join-Path $vscodeDir 'launch.json') -Value $launch -Encoding UTF8
Add-Result -Name '.vscode/launch.json' -Status OK -Details 'FastAPI, worker, and browser debug configurations written.'

if (Test-CommandExists 'code.cmd') {
    $version = Invoke-Capture { code.cmd --version }
    Add-Result -Name 'VS Code CLI on Windows' -Status OK -Details (($version.output -split "`n" | Select-Object -First 1) -join '')
} else {
    Add-Result -Name 'VS Code CLI on Windows' -Status WARN -Details 'code.cmd not found in PATH.' -Remediation 'Install VS Code and enable the code command in PATH.'
}

foreach ($extension in $requiredWindowsExtensions) {
    Install-CodeExtension -ExtensionId $extension -Target Windows
}

foreach ($extension in $requiredWorkspaceExtensions) {
    Install-CodeExtension -ExtensionId $extension -Target Windows
}

if ($IncludeOptionalExtensions) {
    foreach ($extension in $optionalExtensions) {
        Install-CodeExtension -ExtensionId $extension -Target Windows
    }
}

# Attempt Remote WSL extension install for extensions that must execute in the Linux workspace.
foreach ($extension in $requiredWorkspaceExtensions) {
    Install-CodeExtension -ExtensionId $extension -Target WSL
}

$report = [ordered]@{
    generated_at_utc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    repo_root = $repoRoot
    expected_distro = $ExpectedDistro
    skipped_extension_install = [bool]$SkipExtensionInstall
    included_optional_extensions = [bool]$IncludeOptionalExtensions
    required_windows_extensions = $requiredWindowsExtensions
    required_workspace_extensions = $requiredWorkspaceExtensions
    optional_extensions = $optionalExtensions
    results = @($results)
}

$resolvedReportPath = if ([System.IO.Path]::IsPathRooted($ReportPath)) { $ReportPath } else { Join-Path $repoRoot $ReportPath }
$reportDir = Split-Path -Parent $resolvedReportPath
if ($reportDir) { New-Item -ItemType Directory -Force -Path $reportDir | Out-Null }
$reportJson = $report | ConvertTo-Json -Depth 10
Set-Content -Path $resolvedReportPath -Value ($reportJson + "`n") -Encoding UTF8
Add-Result -Name 'VS Code configuration report' -Status OK -Details $resolvedReportPath

Write-ResultTable
if ($JsonOnly) { $reportJson }

$failures = @($results | Where-Object { $_.status -eq 'FAIL' })
if ($failures.Count -gt 0) {
    if (-not $JsonOnly) { Write-Host "`nVS Code configuration completed with blocking failures." -ForegroundColor Red }
    exit 1
}

if (-not $JsonOnly) { Write-Host "`nVS Code configuration completed. Review warnings before Phase 2 if any Remote WSL extension install was deferred." -ForegroundColor Green }
