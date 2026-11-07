param([string]$src, [string]$dst, [int]$width = 430)
$j = Get-Content $src -Raw | ConvertFrom-Json
$d = $j.result.data
if (-not $d) { $d = $j.data }
$tmp = [IO.Path]::GetTempFileName() + ".png"
[IO.File]::WriteAllBytes($tmp, [Convert]::FromBase64String($d))
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($tmp)
$h = [int]($img.Height * $width / $img.Width)
$bmp = New-Object System.Drawing.Bitmap $width, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($img, 0, 0, $width, $h)
$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $img.Dispose()
Remove-Item $tmp -ErrorAction SilentlyContinue
Write-Output ("ok " + (Get-Item $dst).Length)
