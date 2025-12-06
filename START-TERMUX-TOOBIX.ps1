# Quick launcher for Toobix work on Termux (Android) from Windows
# - Opens a PowerShell window in the local repo
# - Starts SSH into Termux (passwordlos empfohlen via id_ed25519)
# Customize host/user/port below if your network changes.

$RepoPath   = "C:\Dev\Projects\AI\Toobix-Unified"
$TermuxHost = "10.126.0.92"
$TermuxPort = 8022
$TermuxUser = "u0_a806"
$SshKey     = "$env:USERPROFILE\.ssh\id_ed25519"  # passe an, falls du einen anderen Key nutzt

if (-not (Test-Path $RepoPath)) {
  Write-Error "Repo-Pfad nicht gefunden: $RepoPath"
  exit 1
}

$sshArgs = @("-p", $TermuxPort, "-i", $SshKey, "$TermuxUser@$TermuxHost")

# Öffne ein neues PowerShell-Fenster, gehe ins Repo und starte SSH
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$RepoPath`"; ssh $($sshArgs -join ' ')"
)

Write-Host "Neues PowerShell-Fenster wurde geöffnet. Dort bist du im Repo und per SSH auf dem Handy."
