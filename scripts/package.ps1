$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$extensionRoot = Join-Path $projectRoot 'extension'
$manifest = Get-Content -LiteralPath (Join-Path $extensionRoot 'manifest.json') -Raw | ConvertFrom-Json
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
if ($manifest.version -ne $package.version) { throw 'Package and manifest versions differ.' }
$destination = Join-Path $projectRoot 'dist'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$zipPath = Join-Path $destination "Toolkit-for-Accelo-v$($manifest.version).zip"
# The manifest must be at the archive root for stores and unpacked installation.
Compress-Archive -Path (Join-Path $extensionRoot '*') -DestinationPath $zipPath -Force
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $names = @($zip.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
  if ('manifest.json' -notin $names) { throw 'Packaged manifest is not at the root.' }
  foreach ($size in 16,32,48,128) { if ("icons/icon-$size.png" -notin $names) { throw "Missing $size px icon." } }
  if ($names | Where-Object { $_ -match '(^|/)(qa|tests|node_modules|experimental)/|\.env|QA\.md|outlook' }) { throw 'Development files entered the install package.' }
} finally { $zip.Dispose() }
$sha256 = [System.Security.Cryptography.SHA256]::Create()
$stream = [System.IO.File]::OpenRead($zipPath)
try { $hash = [System.BitConverter]::ToString($sha256.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() }
finally { $stream.Dispose(); $sha256.Dispose() }
"$hash  $([System.IO.Path]::GetFileName($zipPath))" | Set-Content -LiteralPath "$zipPath.sha256" -Encoding ascii
Write-Output "Packaged $zipPath"
