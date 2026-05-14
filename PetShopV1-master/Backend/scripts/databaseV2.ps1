# Database Configuration
$SA_PASSWORD = "Your_Strong_Password_123!"
$DATABASE = "PetShopDb"

# Use clear, standard characters for better compatibility
$Separator = "=" * 60
Write-Host "`n$Separator" -ForegroundColor DarkGray
Write-Host "  DATABASE INSPECTOR V2: $DATABASE" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "$Separator" -ForegroundColor DarkGray

# Find the container name
$container = docker ps --filter "ancestor=mcr.microsoft.com/mssql/server:2022-latest" --format "{{.Names}}" | Select-Object -First 1

if (-not $container) {
    Write-Host "Error: SQL Server container not found." -ForegroundColor Red
    exit
}

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

    # 2. Get Row Count
    $countSql = "SET NOCOUNT ON; SELECT COUNT(*) FROM [$tableName];"
    $rowCountStr = docker exec -i $container /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P $SA_PASSWORD -d $DATABASE -C -h -1 -Q $countSql
    $rowCount = $rowCountStr.Trim()

    # Visual Header
    Write-Host "`n[ TABLE: $tableName ] (Rows: $rowCount)" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host ("-" * 60) -ForegroundColor Gray

    if ($rowCount -eq "0") {
        Write-Host "  (No data found in this table)" -ForegroundColor DarkGray
        continue
    }

    # 3. Fetch Data as JSON for perfect formatting
    $selectSql = "SET NOCOUNT ON; SELECT * FROM [$tableName] FOR JSON PATH;"
    $jsonResult = docker exec -i $container /opt/mssql-tools18/bin/sqlcmd `
        -S localhost -U sa -P $SA_PASSWORD -d $DATABASE -C -h -1 -W -Q $selectSql

    if ($jsonResult) {
        $jsonString = $jsonResult -join ""
        try {
            $data = $jsonString | ConvertFrom-Json
            # Auto-size columns to fit the terminal
            $data | Format-Table -AutoSize
        } catch {
            Write-Host "  [Streaming raw data...]" -ForegroundColor DarkCyan
            docker exec -i $container /opt/mssql-tools18/bin/sqlcmd `
                -S localhost -U sa -P $SA_PASSWORD -d $DATABASE -C -W -Q "SELECT * FROM [$tableName];"
        }
    }
}

Write-Host "`n✅ Inspection Complete (V2)." -ForegroundColor Green
