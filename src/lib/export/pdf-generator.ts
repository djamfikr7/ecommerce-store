import puppeteer from 'puppeteer'

export interface PDFReportOptions {
  title: string
  subtitle?: string
  dateRange?: { startDate: string; endDate: string }
  generatedBy?: string
  sections: PDFSection[]
}

export interface PDFSection {
  title?: string
  type: 'table' | 'chart' | 'summary' | 'text'
  data?: PDFTableData
  chartConfig?: PDFChartConfig
  text?: string
  summaryItems?: PDFSummaryItem[]
}

export interface PDFTableData {
  headers: string[]
  rows: string[][]
  totals?: string[]
}

export interface PDFChartConfig {
  type: 'bar' | 'line' | 'pie'
  title: string
  labels: string[]
  values: number[]
  colors?: string[]
}

export interface PDFSummaryItem {
  label: string
  value: string
  trend?: number
}

const DEFAULT_COLORS = [
  '#06b6d4',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
  '#14b8a6',
]

function generateChartSVG(config: PDFChartConfig): string {
  const colors = config.colors || DEFAULT_COLORS
  const width = 600
  const height = 300
  const padding = { top: 40, right: 40, bottom: 60, left: 80 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  if (config.type === 'pie') {
    return generatePieChartSVG(config, colors, width, height)
  }

  const maxVal = Math.max(...config.values, 1)
  const barWidth =
    config.type === 'bar' ? Math.max(10, (chartWidth / Math.max(config.labels.length, 1)) * 0.6) : 0
  const xStep = chartWidth / Math.max(config.labels.length - 1, 1)

  let barsOrLine = ''

  if (config.type === 'bar') {
    config.values.forEach((val, i) => {
      const barH = (val / maxVal) * chartHeight
      const x =
        padding.left +
        (chartWidth / config.labels.length) * i +
        (chartWidth / config.labels.length - barWidth) / 2
      const y = padding.top + chartHeight - barH
      barsOrLine += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${colors[i % colors.length]}" rx="3"/>`
      barsOrLine += `<text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="11" fill="#94a3b8">${formatNum(val)}</text>`
    })
  } else {
    let pathD = ''
    config.values.forEach((val, i) => {
      const x = padding.left + i * xStep
      const y = padding.top + chartHeight - (val / maxVal) * chartHeight
      pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
      barsOrLine += `<circle cx="${x}" cy="${y}" r="4" fill="${colors[0]}"/>`
      barsOrLine += `<text x="${x}" y="${y - 10}" text-anchor="middle" font-size="10" fill="#94a3b8">${formatNum(val)}</text>`
    })
    barsOrLine =
      `<path d="${pathD}" fill="none" stroke="${colors[0]}" stroke-width="2.5"/>` + barsOrLine
  }

  const xLabels = config.labels
    .map((label, i) => {
      const x =
        config.type === 'bar'
          ? padding.left +
            (chartWidth / config.labels.length) * i +
            chartWidth / config.labels.length / 2
          : padding.left + i * xStep
      return `<text x="${x}" y="${height - 15}" text-anchor="middle" font-size="11" fill="#64748b" transform="rotate(-30 ${x} ${height - 15})">${label}</text>`
    })
    .join('')

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const y = padding.top + (chartHeight / 4) * i
    const val = maxVal - (maxVal / 4) * i
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#1e293b" stroke-dasharray="4"/>
            <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#64748b">${formatNum(val)}</text>`
  }).join('')

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px">
    <text x="${width / 2}" y="25" text-anchor="middle" font-size="14" font-weight="600" fill="#e2e8f0">${config.title}</text>
    ${gridLines}${barsOrLine}${xLabels}
  </svg>`
}

function generatePieChartSVG(
  config: PDFChartConfig,
  colors: string[],
  width: number,
  height: number,
): string {
  const cx = width / 2 - 80
  const cy = height / 2 + 10
  const r = Math.min(width, height) / 2 - 50
  const total = config.values.reduce((s, v) => s + v, 0) || 1

  let paths = ''
  let cumulativeAngle = -90

  config.values.forEach((val, i) => {
    const angle = (val / total) * 360
    const startAngle = cumulativeAngle
    const endAngle = cumulativeAngle + angle
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const largeArc = angle > 180 ? 1 : 0

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${colors[i % colors.length]}" opacity="0.85"/>`
    cumulativeAngle = endAngle
  })

  const legend = config.labels
    .map((label, i) => {
      const ly = 30 + i * 22
      const val = config.values[i] ?? 0
      return `<rect x="${width - 160}" y="${ly}" width="12" height="12" rx="3" fill="${colors[i % colors.length]}"/>
            <text x="${width - 142}" y="${ly + 11}" font-size="11" fill="#cbd5e1">${label} (${formatNum(val)})</text>`
    })
    .join('')

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a;border-radius:12px">
    <text x="${width / 2}" y="25" text-anchor="middle" font-size="14" font-weight="600" fill="#e2e8f0">${config.title}</text>
    ${paths}${legend}
  </svg>`
}

function formatNum(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return val.toFixed(val % 1 === 0 ? 0 : 2)
}

function renderSection(section: PDFSection): string {
  let html = ''

  if (section.title) {
    html += `<h2 style="color:#e2e8f0;font-size:18px;margin:24px 0 12px;padding-bottom:8px;border-bottom:1px solid #1e293b">${section.title}</h2>`
  }

  switch (section.type) {
    case 'summary':
      if (section.summaryItems) {
        html +=
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin:16px 0">'
        for (const item of section.summaryItems) {
          const trendColor = item.trend && item.trend >= 0 ? '#10b981' : '#ef4444'
          const trendText =
            item.trend !== undefined
              ? `<span style="color:${trendColor};font-size:12px">${item.trend >= 0 ? '↑' : '↓'} ${Math.abs(item.trend)}%</span>`
              : ''
          html += `<div style="background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:20px">
            <p style="color:#94a3b8;font-size:13px;margin:0 0 8px">${item.label}</p>
            <p style="color:#e2e8f0;font-size:24px;font-weight:700;margin:0">${item.value} ${trendText}</p>
          </div>`
        }
        html += '</div>'
      }
      break

    case 'table':
      if (section.data) {
        const { headers, rows, totals } = section.data
        html += '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px">'
        html += '<thead><tr>'
        for (const h of headers) {
          html += `<th style="background:#0f172a;color:#94a3b8;padding:10px 12px;text-align:left;border-bottom:2px solid #1e293b;font-size:11px;text-transform:uppercase;letter-spacing:0.05em">${h}</th>`
        }
        html += '</tr></thead><tbody>'
        for (const row of rows) {
          html += '<tr>'
          for (const cell of row) {
            html += `<td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#cbd5e1">${cell}</td>`
          }
          html += '</tr>'
        }
        if (totals) {
          html += '<tr style="background:#0f172a;font-weight:600">'
          for (const cell of totals) {
            html += `<td style="padding:10px 12px;border-bottom:2px solid #1e293b;color:#e2e8f0">${cell}</td>`
          }
          html += '</tr>'
        }
        html += '</tbody></table>'
      }
      break

    case 'chart':
      if (section.chartConfig) {
        html += `<div style="margin:16px 0">${generateChartSVG(section.chartConfig)}</div>`
      }
      break

    case 'text':
      if (section.text) {
        html += `<p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:16px 0">${section.text}</p>`
      }
      break
  }

  return html
}

function buildReportHTML(options: PDFReportOptions): string {
  const dateStr = options.dateRange
    ? `${options.dateRange.startDate.slice(0, 10)} — ${options.dateRange.endDate.slice(0, 10)}`
    : ''

  const sectionsHtml = options.sections.map(renderSection).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #020617;
      color: #e2e8f0;
      padding: 40px;
    }
  </style>
</head>
<body>
  <div style="margin-bottom:32px;border-bottom:2px solid #1e293b;padding-bottom:24px">
    <h1 style="color:#e2e8f0;font-size:28px;font-weight:700;margin-bottom:4px">${options.title}</h1>
    ${options.subtitle ? `<p style="color:#94a3b8;font-size:16px">${options.subtitle}</p>` : ''}
    ${dateStr ? `<p style="color:#64748b;font-size:13px;margin-top:8px">Period: ${dateStr}</p>` : ''}
    ${options.generatedBy ? `<p style="color:#64748b;font-size:12px;margin-top:4px">Generated by ${options.generatedBy} on ${new Date().toISOString().slice(0, 19).replace('T', ' ')}</p>` : ''}
  </div>
  ${sectionsHtml}
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #1e293b;color:#475569;font-size:11px;text-align:center">
    Generated by E-Commerce Admin Panel &middot; Confidential
  </div>
</body>
</html>`
}

export async function generatePDFReport(options: PDFReportOptions): Promise<Buffer> {
  const html = buildReportHTML(options)

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '12mm',
        bottom: '15mm',
        left: '12mm',
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
