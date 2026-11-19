# Security+ Quest automated tests.
# Runs every qa/*.html test page in headless Microsoft Edge (WebGL via SwiftShader) with a throwaway
# browser profile, so your real saved progress is never touched.
#
# Usage (from the security-quest folder):
#   powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1                       # all tests, each at its own sizes
#   powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1 -Only leave
#   powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1 -Sizes 2048x1280      # override window sizes
#
# Window sizes: a page can declare <meta name="qa-sizes" content="1366x768,1920x1080,...">. Default: 1366x768.
# Each page writes a report into <pre id="qaout">: JavaScript errors first, then "---", then result lines.
# A run fails on any JavaScript error or any line starting with FAIL / STUCK / HARNESS, or "BLACK CANVAS".
# Reports are saved to qa/out/<test>@<size>.txt. Exit code: 0 = all passed, 1 = failures, 2 = setup problem.
param([string[]]$Only, [string[]]$Sizes)
# "-Sizes a,b" arrives as one string when run with -File; split it.
if ($Sizes) { $Sizes = $Sizes | ForEach-Object { $_ -split '\s*,\s*' } | Where-Object { $_ } }
if ($Only)  { $Only  = $Only  | ForEach-Object { $_ -split '\s*,\s*' } | Where-Object { $_ } }

$qa  = $PSScriptRoot
$out = Join-Path $qa 'out'
New-Item -ItemType Directory -Force $out | Out-Null

$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
        Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { Write-Host 'Microsoft Edge was not found; it is needed to run the tests headless.'; exit 2 }

$tests = Get-ChildItem $qa -Filter *.html | Where-Object { -not $Only -or $Only -contains $_.BaseName }
if (-not $tests) { Write-Host "No test pages matched: $Only"; exit 2 }

$failed = 0
foreach ($t in $tests) {
  $src = [IO.File]::ReadAllText($t.FullName)
  $pageSizes = if ($Sizes) { $Sizes } elseif ($src -match '<meta name="qa-sizes" content="([^"]+)"') { $matches[1] -split '\s*,\s*' } else { @('1366x768') }
  foreach ($size in $pageSizes) {
    if ($size -notmatch '^(\d+)x(\d+)$') { Write-Host "Bad size '$size' (use WIDTHxHEIGHT)"; $failed++; continue }
    $w = $matches[1]; $h = $matches[2]
    $label = "$($t.BaseName)@$size"
    $prof = Join-Path $env:TEMP ('sq-qa-' + [guid]::NewGuid())
    $dom  = Join-Path $out "$label.dom.html"
    $url  = 'file:///' + ($t.FullName -replace '\\', '/') + '?run=1'
    $edgeArgs = @('--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run',
              "--user-data-dir=$prof", "--window-size=$w,$h", '--allow-file-access-from-files',
              '--virtual-time-budget=1800000', '--dump-dom', $url)
    $start = Get-Date
    $p = Start-Process -FilePath $edge -ArgumentList $edgeArgs -RedirectStandardOutput $dom -RedirectStandardError "$dom.err" -PassThru -WindowStyle Hidden
    if (-not $p.WaitForExit(420000)) { $p.Kill(); Write-Host "TIMEOUT  $label"; $failed++; continue }
    Start-Sleep -Seconds 4   # Edge child processes release the output file shortly after exit

    $text = ''
    try {
      $fs = [IO.File]::Open($dom, 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs, [Text.Encoding]::UTF8)
      $text = $sr.ReadToEnd(); $sr.Close()
    } catch { Write-Host "Could not read output for ${label}: $($_.Exception.Message)" }

    # The last <pre id="qaout"> is the real report (earlier matches are text inside the page's own script).
    $m = [regex]::Matches($text, '(?s)<pre id="qaout">(.*?)</pre>')
    if ($m.Count -lt 2) { Write-Host "NO REPORT $label (the page did not finish; see $dom)"; $failed++; continue }
    $lines = ([System.Net.WebUtility]::HtmlDecode($m[$m.Count - 1].Groups[1].Value) -split "\r?\n") | ForEach-Object { $_ -replace ' litPixels=snapTimeout', '' }
    $sep = [array]::IndexOf($lines, '---')
    $errors = if ($sep -gt 0) { $lines[0..($sep - 1)] | Where-Object { $_.Trim() } } else { @() }
    $bad = $lines | Where-Object { $_ -match '^(FAIL|STUCK|HARNESS)|BLACK CANVAS' }
    $passes = ($lines | Where-Object { $_ -match '^(PASS|OK) ' }).Count

    $lines | Set-Content -Path (Join-Path $out "$label.txt") -Encoding UTF8
    $secs = [int]((Get-Date) - $start).TotalSeconds
    if ($errors.Count -or $bad.Count) {
      $failed++
      Write-Host ("FAIL     {0}  ({1} passed, {2} problems, {3} JS errors, {4}s)" -f $label, $passes, $bad.Count, $errors.Count, $secs)
      $errors + $bad | Select-Object -First 25 | ForEach-Object { Write-Host "         $_" }
    } else {
      Write-Host ("PASS     {0}  ({1} checks, {2}s)" -f $label, $passes, $secs)
    }
    Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue
  }
}

if ($failed) { Write-Host "`n$failed test run(s) failed. Full reports: $out"; exit 1 }
Write-Host "`nAll test runs passed. Reports: $out"; exit 0
