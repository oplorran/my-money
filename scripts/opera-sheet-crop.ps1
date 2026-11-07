Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile("c:\Users\herme\nextjs\Open\my-money\docs\opera-ui.png")
$w = [int]($src.Width * 0.55); $h = [int]($src.Height * 0.9)
$x = [int](($src.Width - $w) / 2); $y = [int]($src.Height * 0.06)
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0,0,$w,$h), (New-Object System.Drawing.Rectangle $x,$y,$w,$h), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$bmp.Save("c:\Users\herme\nextjs\Open\my-money\docs\opera-sheet-crop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$src.Dispose(); $bmp.Dispose()
"OK"
