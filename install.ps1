# Installs the deckio-site-builder skill into ~/.copilot/skills
$ErrorActionPreference = 'Stop'
$src = Join-Path $PSScriptRoot 'skills\deckio-site-builder'
$skillsRoot = Join-Path $HOME '.copilot\skills'
$dest = Join-Path $skillsRoot 'deckio-site-builder'

New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Get-ChildItem -Force $src | Where-Object { $_.Name -ne 'node_modules' } | ForEach-Object {
  Copy-Item -Recurse -Force $_.FullName $dest
}
$nm = Join-Path $dest 'scripts\node_modules'
if (Test-Path $nm) { Remove-Item -Recurse -Force $nm }

if (Get-Command npm -ErrorAction SilentlyContinue) {
  Write-Host 'Installing Playwright for scripts/verify.mjs ...'
  Push-Location (Join-Path $dest 'scripts')
  try {
    npm install --no-audit --no-fund --loglevel=error | Out-Null
    npx --yes playwright install chromium | Out-Null
  } catch { Write-Warning "Playwright setup failed: $_. Run 'npm install' in $dest\scripts later." }
  finally { Pop-Location }
} else {
  Write-Warning 'npm not found. Install Node 20+ and run "npm install" in the skill''s scripts folder.'
}

Write-Host "Installed to $dest"
Write-Host 'In Copilot CLI run: /skills reload   then   /skills list'
