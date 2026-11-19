# Security+ Quest automated tests.
# Runs every qa/*.html test page in headless Microsoft Edge (WebGL via SwiftShader, 1366x768) with a
# throwaway browser profile, so your real saved progress is never touched.
#
# Usage (from the security-quest folder):
#   powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1            # all tests
#   powershell -ExecutionPolicy Bypass -File qa\run-tests.ps1 -Only leave
#
# Each page writes a report into <pre id="qaout">: JavaScript errors first, then "---", then result lines.
# A run fails on any JavaScript error or any line starting with FAIL / STUCK / HARNESS, or "BLACK CANVAS".
# Reports are saved to qa/out/<test>.txt. Exit code: 0 = all passed, 1 = failures, 2 = setup problem.
param([string[]]$Only)

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
  $prof = Join-Path $env:TEMP ('sq-qa-' + [guid]::NewGuid())
  $dom  = Join-Path $out "$($t.BaseName).dom.html"
  $url  = 'file:///' + ($t.FullName -replace '\\', '/') + '?run=1'
  $edgeArgs = @('--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run',
            "--user-data-dir=$prof", '--window-size=1366,768', '--allow-file-access-from-files',
            '--virtual-time-budget=900000', '--dump-dom', $url)
  $start = Get-Date
  $p = Start-Process -FilePath $edge -ArgumentList $edgeArgs -RedirectStandardOutput $dom -RedirectStandardError "$dom.err" -PassThru -WindowStyle Hidden
  if (-not $p.WaitForExit(300000)) { $p.Kill(); Write-Host "TIMEOUT  $($t.Name)"; $failed++; continue }
  Start-Sleep -Seconds 4   # Edge child processes release the output file shortly after exit

  $text = ''
  try {
    $fs = [IO.File]::Open($dom, 'Open', 'Read', 'ReadWrite'); $sr = New-Object IO.StreamReader($fs, [Text.Encoding]::UTF8)
    $text = $sr.ReadToEnd(); $sr.Close()
  } catch { Write-Host "Could not read output for $($t.Name): $($_.Exception.Message)" }

  # The last <pre id="qaout"> is the real report (earlier matches are the template text inside the page's own script).
  $m = [regex]::Matches($text, '(?s)<pre id="qaout">(.*?)</pre>')
  if ($m.Count -lt 2) { Write-Host "NO REPORT $($t.Name) (the page did not finish; see $dom)"; $failed++; continue }
  $lines = ([System.Net.WebUtility]::HtmlDecode($m[$m.Count - 1].Groups[1].Value) -split "\r?\n") | ForEach-Object { $_ -replace ' litPixels=snapTimeout', '' }
  $sep = [array]::IndexOf($lines, '---')
  $errors = if ($sep -gt 0) { $lines[0..($sep - 1)] | Where-Object { $_.Trim() } } else { @() }
  $bad = $lines | Where-Object { $_ -match '^(FAIL|STUCK|HARNESS)|BLACK CANVAS' }
  $passes = ($lines | Where-Object { $_ -match '^(PASS|OK) ' }).Count

  $lines | Set-Content -Path (Join-Path $out "$($t.BaseName).txt") -Encoding UTF8
  $secs = [int]((Get-Date) - $start).TotalSeconds
  if ($errors.Count -or $bad.Count) {
    $failed++
    Write-Host ("FAIL     {0}  ({1} passed, {2} problems, {3} JS errors, {4}s)" -f $t.Name, $passes, $bad.Count, $errors.Count, $secs)
    $errors + $bad | Select-Object -First 25 | ForEach-Object { Write-Host "         $_" }
  } else {
    Write-Host ("PASS     {0}  ({1} checks, {2}s)" -f $t.Name, $passes, $secs)
  }
  Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue
}

if ($failed) { Write-Host "`n$failed test page(s) failed. Full reports: $out"; exit 1 }
Write-Host "`nAll test pages passed. Reports: $out"; exit 0
