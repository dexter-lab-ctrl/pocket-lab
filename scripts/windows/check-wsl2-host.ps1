<#
.SYNOPSIS
  Pocket Lab Phase 1 Windows host preflight for WSL2 + Ubuntu development.

.DESCRIPTION
  Verifies that the Windows 10 host is ready to run Pocket Lab's Ubuntu-based
  development environment through WSL2. This script does not install packages,
  clone the repository, or modify the Ubuntu distro. It only checks host-side
  prerequisites and writes a machine-readable report for onboarding evidence.

.PARAMETER ExpectedDistro
  The expected Ubuntu WSL distro name. Defaults to $env:POCKETLAB_WSL_DISTRO,
  then Ubuntu. If Ubuntu is installed with a versioned name such as Ubuntu-22.04,
  the script accepts that as long as it is a WSL2 distro.

.PARAMETER ReportPath
  Path for the generated JSON report. Defaults to
  .pocketlab-dev/reports/windows-host-preflight.json.

.PARAMETER JsonOnly
  Emit only JSON to stdout. Useful for CI wrappers.

.EXAMPLE
  pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/check-wsl2-host.ps1

.EXAMPLE
  pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/windows/check-wsl2-host.ps1 -ExpectedDistro Ubuntu-22.04
#>

[CmdletBinding()]
param(
    [string]$ExpectedDistro = $(if ($env:POCKETLAB_WSL_DISTRO) { $env:POCKETLAB_WSL_DISTRO } else { 'Ubuntu' }),
    [string]$ReportPath = '.pocketlab-dev/reports/windows-host-preflight.json',
    [switch]$JsonOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$checks = [System.Collections.Generic.List[object]]::new()
$script:SelectedDistro = $null

function Add-Check {
    param(
        [Parameter(Mandatory)] [string]$Name,
        [Parameter(Mandatory)] [ValidateSet('host','wsl','docker','developer-tools','optional')] [string]$Category,
        [Parameter(Mandatory)] [ValidateSet('OK','WARN','FAIL','INFO')] [string]$Status,
        [Parameter(Mandatory)] [bool]$Required,
        [string]$Details = '',
        [string]$Remediation = ''
    )
    $checks.Add([pscustomobject]@{
        name        = $Name
        category    = $Category
        status      = $Status
        required    = $Required
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

function Write-CheckTable {
    if ($JsonOnly) { return }
    Write-Host ''
    Write-Host 'Pocket Lab Windows host preflight' -ForegroundColor Cyan
    Write-Host '=================================' -ForegroundColor Cyan
    foreach ($check in $checks) {
        $color = switch ($check.status) {
            'OK'   { 'Green' }
            'WARN' { 'Yellow' }
            'FAIL' { 'Red' }
            default { 'Gray' }
        }
        $requiredText = if ($check.required) { 'required' } else { 'optional' }
        Write-Host ('[{0}] {1} ({2})' -f $check.status, $check.name, $requiredText) -ForegroundColor $color
        if ($check.details) { Write-Host ('  {0}' -f $check.details) }
        if ($check.status -ne 'OK' -and $check.remediation) { Write-Host ('  Fix: {0}' -f $check.remediation) -ForegroundColor Yellow }
    }
}

# Windows host version
try {
    $os = Get-CimInstance -ClassName Win32_OperatingSystem
    $version = [System.Version]::Parse($os.Version)
    if ($version.Major -ge 10) {
        Add-Check -Name 'Windows version' -Category host -Status OK -Required $true -Details "$($os.Caption) build $($os.BuildNumber)"
    } else {
        Add-Check -Name 'Windows version' -Category host -Status FAIL -Required $true -Details "$($os.Caption) $($os.Version)" -Remediation 'Use Windows 10 or newer for the supported Pocket Lab WSL2 workflow.'
    }
} catch {
    Add-Check -Name 'Windows version' -Category host -Status FAIL -Required $true -Details $_.Exception.Message -Remediation 'Run from Windows PowerShell/PowerShell 7 on the Windows host.'
}

# PowerShell 7+
if ($PSVersionTable.PSVersion.Major -ge 7) {
    Add-Check -Name 'PowerShell 7' -Category host -Status OK -Required $true -Details "PowerShell $($PSVersionTable.PSVersion)"
} else {
    Add-Check -Name 'PowerShell 7' -Category host -Status FAIL -Required $true -Details "PowerShell $($PSVersionTable.PSVersion)" -Remediation 'Install PowerShell 7 and re-run this script with pwsh.'
}

# Optional Windows features - informational because reading these may require policy/admin access on some hosts.
foreach ($featureName in @('Microsoft-Windows-Subsystem-Linux','VirtualMachinePlatform')) {
    try {
        $feature = Get-WindowsOptionalFeature -Online -FeatureName $featureName -ErrorAction Stop
        $status = if ($feature.State -eq 'Enabled') { 'OK' } else { 'FAIL' }
        $fix = if ($featureName -eq 'Microsoft-Windows-Subsystem-Linux') { 'Enable Windows Subsystem for Linux, reboot, then install Ubuntu.' } else { 'Enable Virtual Machine Platform, reboot, then run wsl --set-default-version 2.' }
        Add-Check -Name $featureName -Category host -Status $status -Required $true -Details "State: $($feature.State)" -Remediation $fix
    } catch {
        Add-Check -Name $featureName -Category host -Status WARN -Required $false -Details 'Could not query optional feature state from this shell.' -Remediation 'Confirm WSL and Virtual Machine Platform are enabled from Windows Features or with elevated PowerShell.'
    }
}

# Required Windows tools
if (Test-CommandExists 'wsl.exe') {
    $wslStatus = Invoke-Capture { wsl.exe --status }
    if ($wslStatus.exitCode -eq 0) {
        Add-Check -Name 'WSL command' -Category wsl -Status OK -Required $true -Details (($wslStatus.output -split "`n" | Select-Object -First 3) -join '; ')
    } else {
        Add-Check -Name 'WSL command' -Category wsl -Status FAIL -Required $true -Details $wslStatus.output -Remediation 'Install or repair WSL, then run wsl --status successfully.'
    }
} else {
    Add-Check -Name 'WSL command' -Category wsl -Status FAIL -Required $true -Details 'wsl.exe not found in PATH.' -Remediation 'Install WSL2 and Ubuntu from Windows features or Microsoft Store.'
}

if (Test-CommandExists 'git.exe') {
    $gitVersion = Invoke-Capture { git.exe --version }
    Add-Check -Name 'Git for Windows' -Category developer-tools -Status OK -Required $true -Details $gitVersion.output
} else {
    Add-Check -Name 'Git for Windows' -Category developer-tools -Status FAIL -Required $true -Details 'git.exe not found in PATH.' -Remediation 'Install Git for Windows and restart the terminal.'
}

# Ubuntu WSL distro and version
if (Test-CommandExists 'wsl.exe') {
    $list = Invoke-Capture { wsl.exe -l -v }
    if ($list.exitCode -ne 0) {
        Add-Check -Name 'Ubuntu WSL distro' -Category wsl -Status FAIL -Required $true -Details $list.output -Remediation 'Install Ubuntu with wsl --install -d Ubuntu or from Microsoft Store.'
    } else {
        $clean = ($list.output -replace "`0", '')
        $distros = @()
        foreach ($line in ($clean -split "`r?`n")) {
            if ($line -match '^\s*\*?\s*(?<name>\S+)\s+(?<state>\S+)\s+(?<version>\d+)\s*$' -and $Matches.name -ne 'NAME') {
                $distros += [pscustomobject]@{
                    name    = $Matches.name
                    state   = $Matches.state
                    version = [int]$Matches.version
                }
            }
        }
        $exact = $distros | Where-Object { $_.name -eq $ExpectedDistro } | Select-Object -First 1
        $ubuntu = if ($exact) { $exact } else { $distros | Where-Object { $_.name -like 'Ubuntu*' } | Select-Object -First 1 }
        if (-not $ubuntu) {
            Add-Check -Name 'Ubuntu WSL distro' -Category wsl -Status FAIL -Required $true -Details "Expected Ubuntu distro '$ExpectedDistro'. Found: $($distros.name -join ', ')" -Remediation 'Install Ubuntu in WSL2, then re-run the preflight.'
        } elseif ($ubuntu.version -ne 2) {
            $script:SelectedDistro = $ubuntu.name
            Add-Check -Name 'Ubuntu WSL distro' -Category wsl -Status FAIL -Required $true -Details "Found $($ubuntu.name), but WSL version is $($ubuntu.version)." -Remediation "Run: wsl --set-version $($ubuntu.name) 2"
        } else {
            $script:SelectedDistro = $ubuntu.name
            Add-Check -Name 'Ubuntu WSL distro' -Category wsl -Status OK -Required $true -Details "Found $($ubuntu.name), state=$($ubuntu.state), version=$($ubuntu.version)."
        }
    }
}

# Docker Desktop host checks
if (Test-CommandExists 'docker.exe') {
    $dockerVersion = Invoke-Capture { docker.exe --version }
    Add-Check -Name 'Docker CLI on Windows' -Category docker -Status OK -Required $true -Details $dockerVersion.output

    $dockerInfo = Invoke-Capture { docker.exe info --format '{{.ServerVersion}}' }
    if ($dockerInfo.exitCode -eq 0 -and $dockerInfo.output) {
        Add-Check -Name 'Docker Desktop engine' -Category docker -Status OK -Required $true -Details "Docker engine server version $($dockerInfo.output)"
    } else {
        Add-Check -Name 'Docker Desktop engine' -Category docker -Status FAIL -Required $true -Details $dockerInfo.output -Remediation 'Start Docker Desktop and wait until the engine is running.'
    }

    $compose = Invoke-Capture { docker.exe compose version }
    if ($compose.exitCode -eq 0) {
        Add-Check -Name 'Docker Compose plugin' -Category docker -Status OK -Required $true -Details $compose.output
    } else {
        Add-Check -Name 'Docker Compose plugin' -Category docker -Status FAIL -Required $true -Details $compose.output -Remediation 'Install/update Docker Desktop so docker compose is available.'
    }
} else {
    Add-Check -Name 'Docker CLI on Windows' -Category docker -Status FAIL -Required $true -Details 'docker.exe not found in PATH.' -Remediation 'Install Docker Desktop and restart PowerShell.'
    Add-Check -Name 'Docker Desktop engine' -Category docker -Status FAIL -Required $true -Details 'Cannot check engine because docker.exe is missing.' -Remediation 'Install and start Docker Desktop.'
    Add-Check -Name 'Docker Compose plugin' -Category docker -Status FAIL -Required $true -Details 'Cannot check Compose because docker.exe is missing.' -Remediation 'Install Docker Desktop with the Compose plugin.'
}

try {
    $dockerDesktopProcess = Get-Process -Name 'Docker Desktop' -ErrorAction SilentlyContinue
    if ($dockerDesktopProcess) {
        Add-Check -Name 'Docker Desktop process' -Category docker -Status OK -Required $true -Details 'Docker Desktop process is running.'
    } else {
        Add-Check -Name 'Docker Desktop process' -Category docker -Status WARN -Required $false -Details 'Docker Desktop process name was not found.' -Remediation 'If docker info fails, start Docker Desktop from the Start menu.'
    }
} catch {
    Add-Check -Name 'Docker Desktop process' -Category docker -Status WARN -Required $false -Details $_.Exception.Message -Remediation 'Use docker info as the source of truth for engine availability.'
}

# Docker Desktop WSL integration check
if ($script:SelectedDistro) {
    $distro = $script:SelectedDistro
    $dockerInWsl = Invoke-Capture { wsl.exe -d $distro -- sh -lc 'docker version >/tmp/pocketlab-docker-version.txt 2>&1' }
    if ($dockerInWsl.exitCode -eq 0) {
        Add-Check -Name 'Docker Desktop WSL integration' -Category docker -Status OK -Required $true -Details "Docker is reachable from WSL distro '$distro'."
    } else {
        Add-Check -Name 'Docker Desktop WSL integration' -Category docker -Status FAIL -Required $true -Details $dockerInWsl.output -Remediation "Enable Docker Desktop Settings > Resources > WSL Integration for distro '$distro', then re-run this preflight."
    }

    $uname = Invoke-Capture { wsl.exe -d $distro -- uname -a }
    if ($uname.exitCode -eq 0) {
        Add-Check -Name 'Ubuntu kernel access' -Category wsl -Status OK -Required $true -Details $uname.output
    } else {
        Add-Check -Name 'Ubuntu kernel access' -Category wsl -Status FAIL -Required $true -Details $uname.output -Remediation "Run: wsl -d $distro -- uname -a and fix any distro startup errors."
    }
} else {
    Add-Check -Name 'Docker Desktop WSL integration' -Category docker -Status FAIL -Required $true -Details 'No usable Ubuntu WSL2 distro was selected.' -Remediation 'Install or convert Ubuntu to WSL2 before checking Docker WSL integration.'
    Add-Check -Name 'Ubuntu kernel access' -Category wsl -Status FAIL -Required $true -Details 'No usable Ubuntu WSL2 distro was selected.' -Remediation 'Install or repair Ubuntu WSL2.'
}

# Optional developer tooling recommendations
if ((Test-CommandExists 'code.cmd') -or (Test-CommandExists 'code.exe') -or (Test-CommandExists 'code')) {
    $code = Invoke-Capture { code --version }
    Add-Check -Name 'Visual Studio Code' -Category optional -Status OK -Required $false -Details (($code.output -split "`n" | Select-Object -First 1) -join '')

    $extensions = Invoke-Capture { code --list-extensions }
    if ($extensions.exitCode -eq 0 -and ($extensions.output -split "`r?`n") -contains 'ms-vscode-remote.remote-wsl') {
        Add-Check -Name 'VS Code Remote - WSL extension' -Category optional -Status OK -Required $false -Details 'ms-vscode-remote.remote-wsl is installed.'
    } else {
        Add-Check -Name 'VS Code Remote - WSL extension' -Category optional -Status WARN -Required $false -Details 'Remote - WSL extension was not detected.' -Remediation 'Install the VS Code Remote - WSL extension for the recommended Pocket Lab editing/debugging workflow.'
    }
} else {
    Add-Check -Name 'Visual Studio Code' -Category optional -Status WARN -Required $false -Details 'code command not found.' -Remediation 'Install VS Code and enable the command-line launcher for the recommended workflow.'
    Add-Check -Name 'VS Code Remote - WSL extension' -Category optional -Status WARN -Required $false -Details 'Cannot check extension because VS Code CLI is unavailable.' -Remediation 'Install VS Code and the Remote - WSL extension.'
}

if (Test-CommandExists 'wt.exe') {
    Add-Check -Name 'Windows Terminal' -Category optional -Status OK -Required $false -Details 'wt.exe is available.'
} else {
    Add-Check -Name 'Windows Terminal' -Category optional -Status WARN -Required $false -Details 'wt.exe not found.' -Remediation 'Install Windows Terminal for a better WSL/PowerShell development workflow.'
}

$requiredFailures = @($checks | Where-Object { $_.required -and $_.status -eq 'FAIL' })
$warnings = @($checks | Where-Object { $_.status -eq 'WARN' })
$overallStatus = if ($requiredFailures.Count -eq 0) { 'PASS' } else { 'FAIL' }

$report = [pscustomobject]@{
    schema        = 'pocketlab.windowsHostPreflight/v1'
    generated_at  = (Get-Date).ToUniversalTime().ToString('o')
    expected_distro = $ExpectedDistro
    selected_distro = $script:SelectedDistro
    overall_status  = $overallStatus
    required_failures = $requiredFailures.Count
    warnings = $warnings.Count
    checks   = $checks
}

$reportDir = Split-Path -Parent $ReportPath
if ($reportDir -and -not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}
$report | ConvertTo-Json -Depth 8 | Out-File -FilePath $ReportPath -Encoding utf8

if ($JsonOnly) {
    $report | ConvertTo-Json -Depth 8
} else {
    Write-CheckTable
    Write-Host ''
    Write-Host "Report: $ReportPath" -ForegroundColor Cyan
    if ($overallStatus -eq 'PASS') {
        Write-Host 'Windows host preflight passed. This host is ready for the Phase 2 Ubuntu WSL bootstrap.' -ForegroundColor Green
    } else {
        Write-Host "Windows host preflight failed with $($requiredFailures.Count) required failure(s). Fix the required items above before Phase 2." -ForegroundColor Red
    }
}

if ($overallStatus -ne 'PASS') {
    exit 1
}
