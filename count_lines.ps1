$totalLines = 0
$fileCount = 0

Get-ChildItem -Path . -Include *.ts,*.tsx,*.js,*.jsx,*.css,*.sql,*.json,*.md -Recurse | 
    Where-Object { $_.FullName -notmatch 'node_modules|dist|build|\.git' } |
    ForEach-Object {
        $lines = (Get-Content $_.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        $totalLines += $lines
        $fileCount++
        Write-Host "$($_.Name): $lines lines"
    }

Write-Host "`nTotal files: $fileCount"
Write-Host "Total lines: $totalLines"

