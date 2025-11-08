# Script to convert all hardcoded pink colors to CSS variables

$files = Get-ChildItem -Path "client/src" -Filter "*.css" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace hex colors
    $content = $content -replace '#FF6B9D', 'var(--primary-light)'
    $content = $content -replace '#E91E63', 'var(--primary)'
    $content = $content -replace '#C2185B', 'var(--primary-dark)'
    
    # Replace gradient
    $content = $content -replace 'linear-gradient\(135deg, var\(--primary-light\) 0%, var\(--primary\) 100%\)', 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)'
    
    # Replace rgba - need to be careful with this
    $content = $content -replace 'rgba\(233,\s*30,\s*99,', 'rgba(var(--primary-rgb),'
    
    Set-Content -Path $file.FullName -Value $content
    Write-Host "Updated: $($file.FullName)"
}

Write-Host "`nConversion complete!"
