$ErrorActionPreference = "Stop"

$APP_NAME = "SkillVault"
$VERSION = (Get-Content package.json | ConvertFrom-Json).version
$BUILD_DIR = "dist"
$RELEASE_DIR = "${BUILD_DIR}/${APP_NAME}-Windows"

Write-Host "==> Packaging ${APP_NAME} v${VERSION} for Windows..."

if (Test-Path $RELEASE_DIR) {
    Remove-Item -Recurse -Force $RELEASE_DIR
}

if (-not (Test-Path ".next/standalone")) {
    Write-Host "Building Next.js..."
    npm run build
}

Write-Host "Creating release directory structure..."
New-Item -ItemType Directory -Force -Path "${RELEASE_DIR}/Server" | Out-Null

Write-Host "Copying standalone server output..."
Copy-Item -Recurse .next/standalone/* "${RELEASE_DIR}/Server/"
Copy-Item -Recurse .next/standalone/.next "${RELEASE_DIR}/Server/"
New-Item -ItemType Directory -Force -Path "${RELEASE_DIR}/Server/.next/static" | Out-Null
Copy-Item -Recurse .next/static/* "${RELEASE_DIR}/Server/.next/static/"

if (Test-Path "public") {
    Copy-Item -Recurse public "${RELEASE_DIR}/Server/public"
}

Write-Host "Copying database migrations..."
New-Item -ItemType Directory -Force -Path "${RELEASE_DIR}/Server/db/migrations" | Out-Null
Copy-Item -Recurse db/migrations/* "${RELEASE_DIR}/Server/db/migrations/"

Write-Host "Bundling Node.js runtime..."
$NODE_EXE = (Get-Command node).Source
Copy-Item $NODE_EXE "${RELEASE_DIR}/node.exe"
Write-Host "  Bundled: $(Split-Path $NODE_EXE -Leaf) -> node.exe"

Write-Host "Generating application icon..."
$ICON_SOURCE = "icon/icon.png"
if (Test-Path $ICON_SOURCE) {
    Add-Type -AssemblyName System.Drawing
    $sizes = @(16, 32, 48, 64, 128, 256)
    $bmpList = @()
    foreach ($s in $sizes) {
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $ICON_SOURCE))
        $bmp = New-Object System.Drawing.Bitmap($s, $s)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $s, $s)
        $g.Dispose()
        $bmpList += $bmp
    }
    $img.Dispose()
    $icoPath = "${RELEASE_DIR}/SkillVault.ico"
    $stream = [System.IO.File]::Create($icoPath)
    $writer = New-Object System.IO.BinaryWriter($stream)
    $writer.Write([UInt16]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]$bmpList.Count)
    $headerSize = 6 + ($bmpList.Count * 16)
    $dataOffset = $headerSize
    foreach ($bmp in $bmpList) {
        $ms = New-Object System.IO.MemoryStream
        $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngData = $ms.ToArray()
        $ms.Dispose()
        $writer.Write([byte]$bmp.Width)
        $writer.Write([byte]$bmp.Height)
        $writer.Write([byte]0)
        $writer.Write([byte]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]32)
        $writer.Write([UInt32]$pngData.Length)
        $writer.Write([UInt32]$dataOffset)
        $dataOffset += $pngData.Length
        $bmp.Tag = $pngData
    }
    foreach ($bmp in $bmpList) {
        $writer.Write([byte[]]$bmp.Tag)
        $bmp.Dispose()
    }
    $writer.Dispose()
    $stream.Dispose()
    Write-Host "  Icon created from ${ICON_SOURCE}"
} else {
    Write-Host "  No icon source found at ${ICON_SOURCE}"
}

Write-Host "Building C# project..."
dotnet publish windows/SkillVault/SkillVault.csproj -c Release -r win-x64 --self-contained false -o $RELEASE_DIR

Write-Host "Creating .zip archive..."
$ZIP_PATH = "${BUILD_DIR}/${APP_NAME}-Windows-v${VERSION}.zip"
if (Test-Path $ZIP_PATH) {
    Remove-Item -Force $ZIP_PATH
}
Compress-Archive -Path "${RELEASE_DIR}/*" -DestinationPath $ZIP_PATH

Write-Host ""
Write-Host "Packaged: ${BUILD_DIR}/${APP_NAME}-Windows-v${VERSION}.zip"
Write-Host "Release directory: ${RELEASE_DIR}"
