export interface CSVColumn<T = Record<string, unknown>> {
  key: string
  header: string
  transform?: (row: T) => string
}

export interface CSVExportOptions<T = Record<string, unknown>> {
  columns: CSVColumn<T>[]
  filename: string
  data?: T[]
  dataFetcher?: (offset: number, limit: number) => Promise<T[]>
  totalCountFetcher?: () => Promise<number>
  selectedColumns?: string[]
  dateFrom?: string
  dateTo?: string
}

function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function generateCSVHeaders<T>(columns: CSVColumn<T>[], selectedColumns?: string[]): string {
  const filtered = selectedColumns
    ? columns.filter((c) => selectedColumns.includes(c.key))
    : columns
  return filtered.map((c) => escapeCSVField(c.header)).join(',')
}

export function rowToCSVRow<T>(
  row: T,
  columns: CSVColumn<T>[],
  selectedColumns?: string[],
): string {
  const filtered = selectedColumns
    ? columns.filter((c) => selectedColumns.includes(c.key))
    : columns
  return filtered
    .map((col) => {
      const value = col.transform
        ? col.transform(row)
        : String((row as Record<string, unknown>)[col.key] ?? '')
      return escapeCSVField(value)
    })
    .join(',')
}

export function generateCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  selectedColumns?: string[],
): string {
  const header = generateCSVHeaders(columns, selectedColumns)
  const rows = data.map((row) => rowToCSVRow(row, columns, selectedColumns))
  return [header, ...rows].join('\n')
}

const BATCH_SIZE = 5000

export async function* streamCSVBatched<T>(
  options: CSVExportOptions<T>,
): AsyncGenerator<string, void, unknown> {
  const { columns, dataFetcher, totalCountFetcher, data, selectedColumns } = options

  if (data) {
    yield generateCSV(data, columns, selectedColumns)
    return
  }

  if (!dataFetcher || !totalCountFetcher) {
    throw new Error('Either data or dataFetcher + totalCountFetcher must be provided')
  }

  const totalCount = await totalCountFetcher()
  const totalBatches = Math.ceil(totalCount / BATCH_SIZE)

  for (let batch = 0; batch < totalBatches; batch++) {
    const offset = batch * BATCH_SIZE
    const batchData = await dataFetcher(offset, BATCH_SIZE)
    const csvChunk =
      batch === 0
        ? generateCSV(batchData, columns, selectedColumns)
        : '\n' + batchData.map((row) => rowToCSVRow(row, columns, selectedColumns)).join('\n')

    yield csvChunk
  }
}

export function formatCurrency(cents: number, currency: string = 'USD'): string {
  return `${(cents / 100).toFixed(2)} ${currency}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().slice(0, 19).replace('T', ' ')
}
