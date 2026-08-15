$base='http://localhost:5001/api'
Write-Host '=== E2E START ==='
$rand=Get-Random -Maximum 100000
$name = "E2E Test $rand"
$email = "e2e+$rand@example.com"
$pw = 'Password123!'
Write-Host "Registering $email"
try {
  $reg = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -Body (ConvertTo-Json @{name=$name;email=$email;password=$pw}) -ContentType 'application/json' -ErrorAction Stop
  Write-Host "Register OK"
  Write-Host ($reg | ConvertTo-Json -Depth 5)
} catch { Write-Host "Register FAILED: $_"; exit 1 }

$token = $reg.token
if (-not $token) { Write-Host 'No token returned on register' ; exit 1 }

Write-Host 'Testing login with correct credentials'
try { $login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body (ConvertTo-Json @{email=$email; password=$pw}) -ContentType 'application/json' -ErrorAction Stop; Write-Host 'Login OK'; Write-Host ($login | ConvertTo-Json -Depth 5) } catch { Write-Host "Login FAILED: $_"; exit 1 }
$token2 = $login.token

Write-Host 'Calling GET /api/auth/me with token'
try { $me = Invoke-RestMethod -Uri "$base/auth/me" -Method Get -Headers @{Authorization = "Bearer $token2"} -ErrorAction Stop; Write-Host 'GET /me OK'; Write-Host ($me | ConvertTo-Json -Depth 5) } catch { Write-Host "GET /me FAILED: $_"; exit 1 }

# Create audit
Write-Host "Creating audit for https://example.com"
try {
  $auditResp = Invoke-RestMethod -Uri "$base/audits" -Method Post -Headers @{Authorization = "Bearer $token2"} -Body (ConvertTo-Json @{url='https://example.com'}) -ContentType 'application/json' -ErrorAction Stop
  Write-Host 'Create audit response:'
  Write-Host ($auditResp | ConvertTo-Json -Depth 5)
} catch { Write-Host "Create audit FAILED: $_"; exit 1 }

$aid = $auditResp.audit._id

Write-Host "Fetching audits list"
try { $audits = Invoke-RestMethod -Uri "$base/audits" -Method Get -Headers @{Authorization = "Bearer $token2"} -ErrorAction Stop; Write-Host "Audits count: $($audits.count)"; Write-Host ($audits | ConvertTo-Json -Depth 5) } catch { Write-Host "Get audits FAILED: $_"; exit 1 }

Write-Host "Fetching single audit $aid"
try { $single = Invoke-RestMethod -Uri "$base/audits/$aid" -Method Get -Headers @{Authorization = "Bearer $token2"} -ErrorAction Stop; Write-Host 'Single audit OK'; Write-Host ($single | ConvertTo-Json -Depth 5) } catch { Write-Host "Get single audit FAILED: $_"; exit 1 }

# Create second user and audit
$name2 = "E2E2 $rand"
$email2 = "e2e2+$rand@example.com"
$pw2 = 'Password123!'
Write-Host "Registering second user $email2"
try { $reg2 = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -Body (ConvertTo-Json @{name=$name2;email=$email2;password=$pw2}) -ContentType 'application/json' -ErrorAction Stop; Write-Host 'Register2 OK'; Write-Host ($reg2 | ConvertTo-Json -Depth 5) } catch { Write-Host "Register2 FAILED: $_"; exit 1 }
$token3 = $reg2.token
Write-Host 'User2 creating audit https://example.org'
try { $audit2 = Invoke-RestMethod -Uri "$base/audits" -Method Post -Headers @{Authorization = "Bearer $token3"} -Body (ConvertTo-Json @{url='https://example.org'}) -ContentType 'application/json' -ErrorAction Stop; Write-Host 'User2 audit created'; Write-Host ($audit2 | ConvertTo-Json -Depth 5) } catch { Write-Host "User2 create FAILED: $_"; exit 1 }
$aid2 = $audit2.audit._id

Write-Host "Attempting to fetch user2 audit with user1 token (should fail)"
try { $cross = Invoke-RestMethod -Uri "$base/audits/$aid2" -Method Get -Headers @{Authorization = "Bearer $token2"} -ErrorAction Stop; Write-Host 'ERROR: cross-user access succeeded unexpectedly'; Write-Host ($cross | ConvertTo-Json -Depth 5); exit 1 } catch { Write-Host 'Cross-user access blocked as expected'; if ($_.Exception.Response) { Write-Host $_.Exception.Response.StatusCode.Value__ } }

# Unauthenticated access
Write-Host 'Testing unauthenticated access to /api/audits (should fail)'
try { $ua = Invoke-RestMethod -Uri "$base/audits" -Method Get -ErrorAction Stop; Write-Host 'ERROR: unauthenticated access succeeded'; exit 1 } catch { Write-Host 'Unauthenticated access blocked as expected'; if ($_.Exception.Response) { Write-Host $_.Exception.Response.StatusCode.Value__ } }

# Invalid token
Write-Host 'Testing invalid token'
try { $it = Invoke-RestMethod -Uri "$base/audits" -Method Get -Headers @{Authorization = "Bearer invalidtoken"} -ErrorAction Stop; Write-Host 'ERROR: invalid token accepted'; exit 1 } catch { Write-Host 'Invalid token rejected as expected'; if ($_.Exception.Response) { Write-Host $_.Exception.Response.StatusCode.Value__ } }

# Delete user1 audit
Write-Host "Deleting audit $aid"
try { $del = Invoke-RestMethod -Uri "$base/audits/$aid" -Method Delete -Headers @{Authorization = "Bearer $token2"} -ErrorAction Stop; Write-Host 'Delete OK'; Write-Host ($del | ConvertTo-Json -Depth 5) } catch { Write-Host "Delete FAILED: $_"; exit 1 }

Write-Host '=== E2E COMPLETE ==='