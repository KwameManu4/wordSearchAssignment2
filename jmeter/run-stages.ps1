<#
.SYNOPSIS
  Runs jmeter\load-test.jmx at staged load levels (x1, x10, x100, x1000, x10000)
  against the throwaway Docker container, one stage after another.

.DESCRIPTION
  For every stage it:
    1. recreates the load-test container with a fresh data volume (so every stage
       starts from the same data and earlier stages can't slow later ones down),
    2. runs JMeter headless (no GUI, which would distort the results),
    3. writes raw results (.jtl), an HTML report, and Docker CPU/memory samples,
    4. writes results\summary.csv (average, median, p95, p99, throughput, error %).

  It only ever resets a container and volume whose names contain "load", so it
  cannot touch your real word-search container or its data volume.

.EXAMPLE
  .\jmeter\run-stages.ps1                         # all stages
  .\jmeter\run-stages.ps1 -Stages x1,x10,x100     # a subset
  .\jmeter\run-stages.ps1 -Stages x1 -DurationOverride 20   # quick smoke test
#>
param(
  [string]$JMeterHome = "C:\Users\notkw\Downloads\apache-jmeter-5.6.3\apache-jmeter-5.6.3",
  [string]$JavaHome   = "C:\Program Files\Java\jdk-17",
  [string[]]$Stages   = @('x1', 'x10', 'x100', 'x1000', 'x10000'),
  [string]$Container  = 'word-search-load',
  [string]$Volume     = 'word-search-load-data',
  [string]$Image      = 'word-search-app',
  [int]$HostPort      = 3001,
  [string]$Cpus       = '2',        # fixed limits make results repeatable and explainable
  [string]$Memory     = '2g',
  [int]$CooldownSeconds = 20,
  [int]$DurationOverride = 0,       # seconds; 0 = use the stage's own duration
  [switch]$NoReset
)

$ErrorActionPreference = 'Stop'

# `-Stages x1,x10` arrives as one string when the script is started with `powershell -File`
$Stages = @($Stages | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim() } | Where-Object { $_ })

# Users per stage, ramp-up and duration in seconds. Duration includes the ramp-up,
# so each stage has a steady-state period after all users have started.
$stageConfig = [ordered]@{
  x1     = @{ Users = 1;     Ramp = 1;   Duration = 120 }
  x10    = @{ Users = 10;    Ramp = 10;  Duration = 120 }
  x100   = @{ Users = 100;   Ramp = 30;  Duration = 120 }
  x1000  = @{ Users = 1000;  Ramp = 90;  Duration = 240 }
  x10000 = @{ Users = 10000; Ramp = 180; Duration = 300 }
}

# --- safety: never reset anything that isn't clearly a load-test container/volume
if ($Container -notmatch 'load' -or $Volume -notmatch 'load') {
  throw "Refusing to reset '$Container' / '$Volume': both names must contain 'load' so the real app and its data are never touched."
}

$root       = Split-Path -Parent $PSScriptRoot
$plan       = Join-Path $PSScriptRoot 'load-test.jmx'
$resultsDir = Join-Path $PSScriptRoot 'results'
$jmeter     = Join-Path $JMeterHome 'bin\jmeter.bat'
if (-not (Test-Path $jmeter)) { throw "JMeter not found at $jmeter. Pass -JMeterHome." }
if (-not (Test-Path (Join-Path $JavaHome 'bin\java.exe'))) { throw "Java not found under $JavaHome. Pass -JavaHome." }
New-Item -ItemType Directory -Force -Path $resultsDir | Out-Null

$env:JAVA_HOME = $JavaHome
$env:PATH      = "$JavaHome\bin;$env:PATH"
$env:JVM_ARGS  = '-Xms1g -Xmx8g'   # x10000 needs far more heap than JMeter's 1 GB default

function Reset-Target {
  Write-Host "  resetting $Container (fresh volume $Volume)..."
  docker rm -f $Container 2>$null | Out-Null
  docker volume rm $Volume 2>$null | Out-Null
  docker run -d --name $Container -p "${HostPort}:3000" --cpus=$Cpus --memory=$Memory -v "${Volume}:/app/sqlite" $Image | Out-Null
  $up = $false
  for ($i = 0; $i -lt 60 -and -not $up; $i++) {
    try { $up = (Invoke-WebRequest "http://localhost:$HostPort/api/health" -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200 }
    catch { Start-Sleep -Seconds 1 }
  }
  if (-not $up) { throw "Container did not become healthy on port $HostPort." }
  # warm-up so the first stage doesn't pay for cold start
  foreach ($p in '/wordle', '/api/wordlist', '/api/stats') {
    Invoke-WebRequest "http://localhost:$HostPort$p" -UseBasicParsing -TimeoutSec 30 | Out-Null
  }
}

function Get-StageSummary($jtl, $stage, $users) {
  $rows = Import-Csv $jtl
  if (-not $rows) { return $null }
  $elapsed = @($rows | ForEach-Object { [int]$_.elapsed } | Sort-Object)
  $n = $elapsed.Count
  $pick = { param($p) $elapsed[[Math]::Min($n - 1, [int][Math]::Ceiling($p * $n) - 1)] }
  $start = ($rows | ForEach-Object { [int64]$_.timeStamp } | Measure-Object -Minimum).Minimum
  $end   = ($rows | ForEach-Object { [int64]$_.timeStamp + [int]$_.elapsed } | Measure-Object -Maximum).Maximum
  $seconds = [Math]::Max(1, ($end - $start) / 1000)
  $errors  = @($rows | Where-Object { $_.success -ne 'true' }).Count
  [pscustomobject]@{
    Stage          = $stage
    Users          = $users
    Samples        = $n
    AvgMs          = [Math]::Round(($elapsed | Measure-Object -Average).Average, 1)
    MedianMs       = & $pick 0.50
    P95Ms          = & $pick 0.95
    P99Ms          = & $pick 0.99
    MaxMs          = $elapsed[-1]
    ThroughputRps  = [Math]::Round($n / $seconds, 1)
    ErrorPct       = [Math]::Round(100 * $errors / $n, 2)
  }
}

$summary = @()
$first = $true
foreach ($stage in $Stages) {
  if (-not $stageConfig.Contains($stage)) { throw "Unknown stage '$stage'. Use: $($stageConfig.Keys -join ', ')" }
  $cfg = $stageConfig[$stage]
  $duration = if ($DurationOverride -gt 0) { $DurationOverride } else { $cfg.Duration }
  $ramp = [Math]::Min($cfg.Ramp, [Math]::Max(1, $duration - 1))

  # 70% generated-activity users, 20% builder users, 10% dashboard users
  $usersB = [int][Math]::Round($cfg.Users * 0.2)
  $usersC = [int][Math]::Round($cfg.Users * 0.1)
  $usersA = $cfg.Users - $usersB - $usersC

  Write-Host ""
  Write-Host "=== $stage : $($cfg.Users) users (A=$usersA B=$usersB C=$usersC), ramp ${ramp}s, duration ${duration}s ===" -ForegroundColor Cyan

  if (-not $first -and $CooldownSeconds -gt 0) { Write-Host "  cooling down ${CooldownSeconds}s..."; Start-Sleep -Seconds $CooldownSeconds }
  if (-not $NoReset) { Reset-Target }
  $first = $false

  $jtl    = Join-Path $resultsDir "$stage.jtl"
  $report = Join-Path $resultsDir "$stage-report"
  $stats  = Join-Path $resultsDir "$stage-docker-stats.csv"
  # JMeter refuses to write a report into a folder that already exists
  foreach ($old in $jtl, $report, $stats) { if (Test-Path $old) { Remove-Item $old -Recurse -Force } }

  # sample the container's CPU and memory every few seconds while the test runs
  $statsJob = Start-Job -ScriptBlock {
    param($c, $file)
    'time,cpu,memory' | Set-Content $file
    while ($true) {
      $line = docker stats $c --no-stream --format '{{.CPUPerc}},{{.MemUsage}}' 2>$null
      if ($line) { "$(Get-Date -Format o),$($line -replace ' / ',' / ')" | Add-Content $file }
      Start-Sleep -Seconds 3
    }
  } -ArgumentList $Container, $stats

  try {
    & $jmeter -n -t $plan `
      "-Jhost=localhost" "-Jport=$HostPort" `
      "-JusersA=$usersA" "-JusersB=$usersB" "-JusersC=$usersC" `
      "-Jramp=$ramp" "-Jduration=$duration" `
      "-Jsummariser.interval=15" `
      -l $jtl -e -o $report
  }
  finally {
    Stop-Job $statsJob -ErrorAction SilentlyContinue
    Remove-Job $statsJob -Force -ErrorAction SilentlyContinue
  }

  $row = Get-StageSummary $jtl $stage $cfg.Users
  if ($row) {
    $summary += $row
    $row | Format-List | Out-String | Write-Host
  }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Green
$summary | Format-Table -AutoSize
# written once at the end, so re-running never stacks duplicate rows
$summary | Export-Csv -Path (Join-Path $resultsDir 'summary.csv') -NoTypeInformation
Write-Host "HTML reports: $resultsDir\<stage>-report\index.html"
