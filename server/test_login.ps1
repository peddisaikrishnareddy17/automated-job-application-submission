$ErrorActionPreference = 'Stop'
$body = @{email='admin@example.com'; password='password'} | ConvertTo-Json
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$login = Invoke-RestMethod -Uri 'http://localhost:4000/auth/login' -Method POST -Body $body -ContentType 'application/json' -WebSession $s
Write-Output "LOGIN RESPONSE:"
$login | ConvertTo-Json
Write-Output "--- ME ---"
$me = Invoke-RestMethod -Uri 'http://localhost:4000/auth/me' -WebSession $s
$me | ConvertTo-Json
