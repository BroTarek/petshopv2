# Database Configuration
$SA_PASSWORD = "Your_Strong_Password_123!"
$DATABASE = "PetShopDb"

Write-Host "Searching for SQL Server container..." -ForegroundColor Cyan

# Find the container name
$container = docker ps --filter "ancestor=mcr.microsoft.com/mssql/server:2022-latest" --format "{{.Names}}" | Select-Object -First 1

if (-not $container) {
    Write-Host "Error: SQL Server container not found." -ForegroundColor Red
    exit
}

Write-Host "Found container: $container" -ForegroundColor Green
Write-Host "Fetching tables from database: $DATABASE..." -ForegroundColor Cyan

# 1. Get Table Names
$getTablesSql = "SET NOCOUNT ON; SELECT name FROM sys.tables;"
$tables = docker exec -i $container /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P $SA_PASSWORD -d $DATABASE -C -h -1 -Q $getTablesSql

if ($null -eq $tables -or $tables.Count -eq 0) {
    Write-Host "No tables found or database not ready." -ForegroundColor Yellow
    exit
}

foreach ($table in $tables) {
    $tableName = $table.Trim()
    if ([string]::IsNullOrWhiteSpace($tableName)) { continue }

    $separator = "=" * 50
    Write-Host "`n$separator" -ForegroundColor Gray
    Write-Host " TABLE: $tableName" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host $separator -ForegroundColor Gray

    # 2. Dump all data
    docker exec -i $container /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P $SA_PASSWORD -d $DATABASE -C -W -Q "SELECT * FROM [$tableName];"
}

Write-Host "`nFinished logging all tables." -ForegroundColor Green