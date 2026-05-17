# Database Configuration
$SA_PASSWORD = "Your_Strong_Password_123!"
$DATABASE = "PetShopDb"

Write-Host "Searching for SQL Server container..." -ForegroundColor Cyan

# Find the container name for the 'db' service
$container = docker ps --filter "ancestor=mcr.microsoft.com/mssql/server:2022-latest" --format "{{.Names}}" | Select-Object -First 1

if (-not $container) {
    Write-Host "Error: SQL Server container not found. Make sure docker-compose is running." -ForegroundColor Red
    exit
}

Write-Host "Found container: $container" -ForegroundColor Green
Write-Host "Fetching tables from database: $DATABASE..." -ForegroundColor Cyan

# SQL Command to get table names
$getTablesSql = "SET NOCOUNT ON; SELECT name FROM sys.tables;"

# Execute sqlcmd to get tables
$tables = docker exec -i $container /opt/mssql-tools18/bin/sqlcmd `
    -S localhost -U sa -P $SA_PASSWORD -d $DATABASE -C -h -1 -Q $getTablesSql

if ($null -eq $tables -or $tables.Count -eq 0) {
    Write-Host "No tables found or could not connect to the database." -ForegroundColor Yellow
    exit
}

foreach ($table in $tables) {
    $tableName = $table.Trim()
    if ([string]::IsNullOrWhiteSpace($tableName)) { continue }

    Write-Host "`n" + ("=" * 50) -ForegroundColor Gray
    Write-Host " TABLE: $tableName" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host ("=" * 50) -ForegroundColor Gray

    # SQL Command to select all data
    $selectSql = "SELECT * FROM [$tableName];"

    # Execute sqlcmd to get table data
    docker exec -i $container /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P $SA_PASSWORD -d $DATABASE -C -W -Q $selectSql
}

Write-Host "`nFinished logging all tables." -ForegroundColor Green
