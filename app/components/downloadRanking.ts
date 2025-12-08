import type {
  Ranking,
  DepartedPlayersRecord,
  RankingOrder,
  RankingParameter,
  RankingRow,
} from '../types.js'
import { getParameterLabel, getParameterValue } from './rankingTable.js'

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

const generateRankingTableHTML = (
  rankingGroups: Ranking[],
  departedPlayers: DepartedPlayersRecord,
  rankingOrder: RankingOrder
): string => {
  let tableHTML = '<table class="result-table">'

  const headerCells = [
    '<th>Platz</th>',
    '<th>Name</th>',
    ...rankingOrder.map(
      (param) => `<th>${escapeHtml(getParameterLabel(param))}</th>`
    ),
  ]
  tableHTML += `<tr>${headerCells.join('')}</tr>`

  let rank = 1
  let dark = true
  for (const group of rankingGroups) {
    for (const row of group) {
      const [name] = row
      const isDeparted = departedPlayers && departedPlayers[name] !== undefined
      const departedText = isDeparted
        ? ` (nach Runde ${departedPlayers[name]})`
        : ''

      const dataCells = [
        `<td>${rank}</td>`,
        `<td>${escapeHtml(name)}${escapeHtml(departedText)}</td>`,
        ...rankingOrder.map(
          (param) => `<td>${escapeHtml(getParameterValue(row, param))}</td>`
        ),
      ]

      tableHTML += `<tr class="${dark ? 'dark' : 'bright'} ${
        isDeparted ? 'departed' : ''
      }">${dataCells.join('')}</tr>`
    }
    dark = !dark
    rank += group.length
  }

  tableHTML += '</table>'
  return tableHTML
}

const generateDownloadHTML = (
  title: string,
  rankingGroups: Ranking[],
  departedPlayers: DepartedPlayersRecord,
  rankingOrder: RankingOrder
): string => {
  const tableHTML = generateRankingTableHTML(
    rankingGroups,
    departedPlayers,
    rankingOrder
  )

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Endstand - ${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 900px;
      margin: auto;
      font-family: sans-serif;
      font-size: 20px;
      padding: 12px;
    }

    .flex {
      display: flex;
      gap: 12px;
    }

    .center {
      margin-left: auto;
      margin-right: auto;
    }

    h1, h2 {
      font-weight: normal;
      margin: 0px 0px 6px 0px;
      padding: 0;
    }

    table.result-table {
      margin-top: 24px;
      width: 100%;
      border-collapse: collapse;
    }

    table.result-table th {
      text-align: left;
      font-weight: bold;
    }

    table.result-table tr.dark {
      background: #eee;
    }

    table.result-table tr.departed {
      opacity: 0.6;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="flex">
    <h1 class="center">${escapeHtml(title)}</h1>
  </div>
  <div class="flex">
    <h2 class="center">Endstand</h2>
  </div>
  ${tableHTML}
</body>
</html>`
}

const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9äöüÄÖÜß\s-]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}

export const downloadRankingHTML = (
  title: string,
  rankingGroups: Ranking[],
  departedPlayers: DepartedPlayersRecord,
  rankingOrder: RankingOrder
): void => {
  const htmlContent = generateDownloadHTML(
    title,
    rankingGroups,
    departedPlayers,
    rankingOrder
  )
  const sanitizedTitle = sanitizeFilename(title)
  const filename = `Endstand_${sanitizedTitle}.html`

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
