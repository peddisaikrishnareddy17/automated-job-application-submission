$ErrorActionPreference = 'Stop'
$body = @{email='admin@example.com'} | ConvertTo-Json
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$response = Invoke-RestMethod -Uri 'http://localhost:4000/auth/impersonate' -Method POST -Body $body -ContentType 'application/json' -WebSession $s -ErrorAction Stop
Write-Output "IMPERSONATE RESPONSE:"; $response | ConvertTo-Json
# Now call /auth/me using same session
$me = Invoke-RestMethod -Uri 'http://localhost:4000/auth/me' -WebSession $s
Write-Output "--- ME ---"; $me | ConvertTo-Json
