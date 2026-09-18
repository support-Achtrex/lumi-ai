Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\hp\.gemini\antigravity\brain\b7099bf4-e55d-4656-9e0e-08652deb06ad\.user_uploaded\media_1789758188100.png"
if (-not (Test-Path $srcPath)) {
    Write-Error "Source image not found: $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Icon($targetPath, $width, $height) {
    $targetDir = [System.IO.Path]::GetDirectoryName($targetPath)
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($srcImg, 0, 0, $width, $height)
    $g.Dispose()
    
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved icon: $targetPath ($($width)x$($height))"
}

function Create-ForegroundIcon($targetPath, $totalSize, $iconSize) {
    $targetDir = [System.IO.Path]::GetDirectoryName($targetPath)
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    $bmp = New-Object System.Drawing.Bitmap($totalSize, $totalSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    
    $x = ($totalSize - $iconSize) / 2
    $y = ($totalSize - $iconSize) / 2
    $g.DrawImage($srcImg, $x, $y, $iconSize, $iconSize)
    $g.Dispose()
    
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved foreground icon: $targetPath ($($totalSize)x$($totalSize))"
}

function Create-Splash($targetPath, $w, $h) {
    $targetDir = [System.IO.Path]::GetDirectoryName($targetPath)
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    # Dark modern gradient background #050E1A to #0A192F
    $bgColor = [System.Drawing.Color]::FromArgb(255, 5, 14, 26)
    $g.Clear($bgColor)
    
    $minDim = [Math]::Min($w, $h)
    $logoSize = [Math]::Max(120, [int]($minDim * 0.36))
    if ($logoSize -gt 360) { $logoSize = 360 }
    
    $x = [int](($w - $logoSize) / 2)
    $y = [int](($h - $logoSize) / 2)
    
    $g.DrawImage($srcImg, $x, $y, $logoSize, $logoSize)
    $g.Dispose()
    
    $bmp.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved splash: $targetPath ($($w)x$($h))"
}

# 1. Public & frontend assets
Copy-Item $srcPath "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\public\favicon.png" -Force
Copy-Item $srcPath "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\public\logo.png" -Force
Resize-Icon "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\assets\icon.png" 512 512
Resize-Icon "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\assets\icon-only.png" 512 512
Resize-Icon "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\assets\logo.png" 512 512

# 2. Android Mipmap Launcher Icons
$densities = @(
    @{ name = "mipmap-ldpi";   size = 36;  fg = 81;   fgSize = 54 },
    @{ name = "mipmap-mdpi";   size = 48;  fg = 108;  fgSize = 72 },
    @{ name = "mipmap-hdpi";   size = 72;  fg = 162;  fgSize = 108 },
    @{ name = "mipmap-xhdpi";  size = 96;  fg = 216;  fgSize = 144 },
    @{ name = "mipmap-xxhdpi"; size = 144; fg = 324;  fgSize = 216 },
    @{ name = "mipmap-xxxhdpi";size = 192; fg = 432;  fgSize = 288 }
)

$resDir = "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\android\app\src\main\res"

foreach ($d in $densities) {
    $folder = Join-Path $resDir $d.name
    Resize-Icon (Join-Path $folder "ic_launcher.png") $d.size $d.size
    Resize-Icon (Join-Path $folder "ic_launcher_round.png") $d.size $d.size
    Create-ForegroundIcon (Join-Path $folder "ic_launcher_foreground.png") $d.fg $d.fgSize
}

# 3. Android Splash Screens
$splashSizes = @(
    @{ folder = "drawable";                w = 480;  h = 800 },
    @{ folder = "drawable-night";          w = 480;  h = 800 },
    @{ folder = "drawable-port-ldpi";      w = 240;  h = 320 },
    @{ folder = "drawable-port-mdpi";      w = 320;  h = 480 },
    @{ folder = "drawable-port-hdpi";      w = 480;  h = 800 },
    @{ folder = "drawable-port-xhdpi";     w = 720;  h = 1280 },
    @{ folder = "drawable-port-xxhdpi";    w = 960;  h = 1600 },
    @{ folder = "drawable-port-xxxhdpi";   w = 1280; h = 1920 },
    @{ folder = "drawable-port-night-ldpi";      w = 240;  h = 320 },
    @{ folder = "drawable-port-night-mdpi";      w = 320;  h = 480 },
    @{ folder = "drawable-port-night-hdpi";      w = 480;  h = 800 },
    @{ folder = "drawable-port-night-xhdpi";     w = 720;  h = 1280 },
    @{ folder = "drawable-port-night-xxhdpi";    w = 960;  h = 1600 },
    @{ folder = "drawable-port-night-xxxhdpi";   w = 1280; h = 1920 },
    @{ folder = "drawable-land-ldpi";      w = 320;  h = 240 },
    @{ folder = "drawable-land-mdpi";      w = 480;  h = 320 },
    @{ folder = "drawable-land-hdpi";      w = 800;  h = 480 },
    @{ folder = "drawable-land-xhdpi";     w = 1280; h = 720 },
    @{ folder = "drawable-land-xxhdpi";    w = 1600; h = 960 },
    @{ folder = "drawable-land-xxxhdpi";   w = 1920; h = 1280 },
    @{ folder = "drawable-land-night-ldpi";      w = 320;  h = 240 },
    @{ folder = "drawable-land-night-mdpi";      w = 480;  h = 320 },
    @{ folder = "drawable-land-night-hdpi";      w = 800;  h = 480 },
    @{ folder = "drawable-land-night-xhdpi";     w = 1280; h = 720 },
    @{ folder = "drawable-land-night-xxhdpi";    w = 1600; h = 960 },
    @{ folder = "drawable-land-night-xxxhdpi";   w = 1920; h = 1280 }
)

foreach ($s in $splashSizes) {
    $folder = Join-Path $resDir $s.folder
    Create-Splash (Join-Path $folder "splash.png") $s.w $s.h
}

Create-Splash "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\assets\splash.png" 1280 1920
Create-Splash "c:\Users\hp\Desktop\Achtrex LLC\lumi-ai\frontend\assets\splash-dark.png" 1280 1920

$srcImg.Dispose()
Write-Host "ALL BRAND ASSETS & LAUNCHER ICONS SUCCESSFULLY GENERATED!"
