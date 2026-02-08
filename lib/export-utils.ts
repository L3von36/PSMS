import Papa from 'papaparse'

/**
 * Centrally managed utility to export data to CSV and trigger a browser download.
 */
export function exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return

    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
}
