# Aplica o design definitivo no projeto do app.
#
# Os arquivos desta rodada ficam no projeto do Open Design (Design Files) e o
# projeto do app vive em outra pasta. Este script copia os seis de uma vez, e
# confere o hash de cada um depois de copiar — se algum não bater, ele avisa.
#
# Uso (PowerShell, nesta pasta do Design Files):
#   .\aplicar-design.ps1
#   .\aplicar-design.ps1 -Repo "D:\outro\caminho\App GestaoFinanceira"
#   .\aplicar-design.ps1 -WhatIf     # só mostra o que faria

param(
  [string]$Repo = "C:\Users\edils\OneDrive\Edilson\Trabalho\App GestaoFinanceira",
  [switch]$WhatIf,
  # Copia só o que ainda não existe no app. Use quando o repositório já recebeu
  # os arquivos e evoluiu por lá: reaplicar por cima desfaria as mudanças feitas
  # no app (a rota `mais`, por exemplo).
  [switch]$SomenteNovos
)

$ErrorActionPreference = "Stop"
$origem = $PSScriptRoot

$mapa = [ordered]@{
  "src\constants\tokens.js"                    = "src\constants\tokens.js"
  "src\index.css"                              = "src\index.css"
  "src\components\shell\AppShell.jsx"          = "src\components\shell\AppShell.jsx"
  "src\components\ui\BalanceHero.jsx"          = "src\components\ui\BalanceHero.jsx"
  "src\components\ui\BalanceChart.jsx"         = "src\components\ui\BalanceChart.jsx"
  "src\components\ui\BillCard.jsx"             = "src\components\ui\BillCard.jsx"
  "src\components\ui\MemberFilterIcon.jsx"     = "src\components\ui\MemberFilterIcon.jsx"
  "src\components\ui\ResumoCards.jsx"          = "src\components\ui\ResumoCards.jsx"
  "src\components\ui\MonthAnalysis.jsx"        = "src\components\ui\MonthAnalysis.jsx"
}

if (-not (Test-Path -LiteralPath (Join-Path $Repo "src\App.jsx"))) {
  throw "Não achei src\App.jsx em '$Repo'. Passe o caminho certo com -Repo."
}

$novos = 0; $trocados = 0

foreach ($de in $mapa.Keys) {
  $para = $mapa[$de]
  $origemArquivo = Join-Path $origem $de
  $destino = Join-Path $Repo $para

  if (-not (Test-Path -LiteralPath $origemArquivo)) { throw "Falta o arquivo de origem: $de" }

  $existe = Test-Path -LiteralPath $destino
  if ($existe -and $SomenteNovos) { Write-Output ("pula      {0}  (já existe no app)" -f $para); continue }
  $acao = if ($existe) { "substitui" } else { "cria    " }
  if ($existe) { $trocados++ } else { $novos++ }

  Write-Output ("{0}  {1}" -f $acao, $para)

  if (-not $WhatIf) {
    $pastaDestino = Split-Path -Parent $destino
    if (-not (Test-Path -LiteralPath $pastaDestino)) { New-Item -ItemType Directory -Path $pastaDestino -Force | Out-Null }
    Copy-Item -LiteralPath $origemArquivo -Destination $destino -Force

    $a = (Get-FileHash -LiteralPath $origemArquivo -Algorithm SHA256).Hash
    $b = (Get-FileHash -LiteralPath $destino -Algorithm SHA256).Hash
    if ($a -ne $b) { throw "A cópia de $para não confere." }
  }
}

Write-Output ""
Write-Output ("{0} arquivos novos, {1} substituídos." -f $novos, $trocados)
Write-Output "Agora: pnpm dev e siga a seção 5 de APLICAR-DESIGN-DEFINITIVO.md."
Write-Output "Se algo sair do lugar: git diff e git checkout -- src/ volta tudo."
