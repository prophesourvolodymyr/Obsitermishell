# Rebuild node-pty for Obsidian's Electron version
# PowerShell script for Windows

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$DaemonDir = Join-Path $ProjectRoot "daemon"

Write-Host "Rebuilding node-pty for Obsidian's Electron version..." -ForegroundColor Yellow

# Check if daemon directory exists
if (-not (Test-Path $DaemonDir)) {
    Write-Host "Error: daemon directory not found at $DaemonDir" -ForegroundColor Red
    exit 1
}

Set-Location $DaemonDir

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing daemon dependencies..." -ForegroundColor Yellow
    npm install
}

# Get Obsidian's Electron version (25.8.4 as of current Obsidian)
$ElectronVersion = "25.8.4"

Write-Host "Rebuilding node-pty for Electron $ElectronVersion..." -ForegroundColor Yellow

# Rebuild node-pty for Electron
npx @electron/rebuild -f -w node-pty -v $ElectronVersion

Write-Host "✓ node-pty rebuilt successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Copy the plugin to your Obsidian vault: .obsidian/plugins/obsitermishell/"
Write-Host "2. Reload the plugin in Obsidian"
Write-Host "3. The daemon will start automatically when the plugin loads"
