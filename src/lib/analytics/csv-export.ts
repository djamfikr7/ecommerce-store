'use client'

interface ExportColumn {
  key: string
  label: string
}

export function exportToCSV(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
) {
  const header = columns.map((c) => `"${c.label}"`).join(',')
  const rows = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key]
        if (typeof val === 'number') return val
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`
        return `"${String(val ?? '')}"`
      })
      .join(','),
  )

  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
