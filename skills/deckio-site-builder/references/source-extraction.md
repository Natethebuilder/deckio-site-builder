# Extracting source material

## GitHub repo or lab folder
```powershell
git clone --depth 1 --branch <branch> https://github.com/<org>/<repo>.git $env:TEMP\src-repo
```
Read the README, the lab/module folder index files, the prerequisites and the clean-up docs. Collect:
- the module list, each with a one-line goal
- tools and accounts needed, which become `PREP` and `SETUP`
- the architecture components, which can feed an architecture-map widget
- deployment and clean-up commands, which become `CLEANUP`
- logos and diagrams (check the licence before reusing them)

## PowerPoint (.pptx)
A normal .pptx is a zip archive, so no Python or Office is needed. `Expand-Archive` fails in some PowerShell builds; use `ZipFile` instead:

```powershell
$src = 'C:\path\deck.pptx'; $out = "$env:TEMP\pptx-x"
Remove-Item $out -Recurse -Force -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::ExtractToDirectory($src, $out)
Get-ChildItem "$out\ppt\slides\slide*.xml" | Sort-Object { [int]($_.BaseName -replace '\D') } | ForEach-Object {
  $t = ([xml](Get-Content $_ -Raw)).SelectNodes('//*[local-name()="t"]') | ForEach-Object { $_.'#text' }
  "--- $($_.BaseName)"; ($t -join ' ')
}
Get-ChildItem "$out\ppt\media"   # images and logos
```
On macOS or Linux, run `unzip -o deck.pptx -d /tmp/pptx-x` and read the same files.

Three cases you will hit:
1. **Text comes back.** Use it as the outline.
2. **No text, but full-slide PNGs in `ppt/media`.** Decks exported from DECKIO are image-only. Open the PNGs with the `view` tool and read them.
3. **`End of Central Directory record could not be found`.** Check the first bytes: `D0 CF 11 E0` means the file is sensitivity-labelled or encrypted (an OLE container). You can't unzip it. Ask the user to export it to PDF or PNG from PowerPoint (File → Export), or to save an unlabelled copy. If the computer-use tools are available, you can drive PowerPoint's export yourself.
   ```powershell
   (([IO.File]::ReadAllBytes($src)[0..3]) | % { '{0:X2}' -f $_ }) -join ' '   # 50 4B 03 04 = zip, D0 CF 11 E0 = protected
   ```

To see normal slides as images, export them to PNG from PowerPoint, or use LibreOffice (`soffice --headless --convert-to pdf deck.pptx`). Then view them to copy the layout and tone.

## An existing DECKIO site
Copy its structure rather than its content. `src/content.js` shows the scope, and `src/viz/*` and `src/theme/*` hold the reusable interactive pieces.
