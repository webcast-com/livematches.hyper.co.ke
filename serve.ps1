# Simple PowerShell HTTP Server for ScoreHub
# Usage: powershell -ExecutionPolicy Bypass -File serve.ps1

$port = 8000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host ""
Write-Host "  ScoreHub Dev Server" -ForegroundColor Cyan
Write-Host "  Serving: $root" -ForegroundColor Gray
Write-Host "  URL:     http://localhost:$port" -ForegroundColor Green
Write-Host "  Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff2"= "font/woff2"
    ".woff" = "font/woff"
    ".ttf"  = "font/ttf"
}

while ($listener.IsListening) {
    try {
        $ctx   = $listener.GetContext()
        $req   = $ctx.Request
        $resp  = $ctx.Response

        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        $filePath = Join-Path $root ($urlPath.TrimStart("/").Replace("/", "\"))

        if (Test-Path $filePath -PathType Leaf) {
            $ext  = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $resp.ContentType   = $mime
            $resp.ContentLength64 = $bytes.Length
            # CORS headers so the ESPN API fetch works
            $resp.Headers.Add("Access-Control-Allow-Origin", "*")
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "  200  $urlPath" -ForegroundColor DarkGray
        } else {
            $resp.StatusCode = 404
            $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $resp.OutputStream.Write($body, 0, $body.Length)
            Write-Host "  404  $urlPath" -ForegroundColor Yellow
        }

        $resp.Close()
    } catch {
        # Ignore closed-connection errors on shutdown
    }
}
