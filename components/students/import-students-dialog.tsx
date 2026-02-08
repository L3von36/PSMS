"use client"

import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, X, Check, FileText, AlertCircle, Download } from 'lucide-react'
import { bulkCreateStudents } from '@/actions/student'
import { toast } from 'sonner'

export function ImportStudentsDialog({ 
    onClose 
}: { 
    onClose: () => void 
}) {
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [isImporting, setIsImporting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setPreviewData(results.data)
                    setError(null)
                },
                error: (err) => {
                    setError('Failed to parse CSV file')
                    console.error(err)
                }
            })
        }
    }

    const handleImport = async () => {
        if (previewData.length === 0) return

        setIsImporting(true)
        try {
            const result = await bulkCreateStudents(previewData)
            if (result.success) {
                toast.success(result.message)
                onClose()
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            toast.error('An error occurred during import')
        } finally {
            setIsImporting(false)
        }
    }

    const downloadTemplate = () => {
        const csvContent = "firstName,lastName,grade,section,email,phone\nJohn,Doe,10,A,john@example.com,+251912345678"
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'students_template.csv'
        a.click()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-primary/10">
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold">Import Students</h2>
                        <p className="text-sm text-muted-foreground mt-1 text-balanced">Upload a CSV file with student data to import in bulk.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Upload Area */}
                    {!file ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold">1. Choose File</h3>
                                <button 
                                    onClick={downloadTemplate}
                                    className="text-xs flex items-center gap-1 text-primary hover:underline"
                                >
                                    <Download className="h-3 w-3" /> Download Template
                                </button>
                            </div>
                            <label className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors border-primary/20 hover:border-primary/40">
                                <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                <p className="text-xs text-muted-foreground mt-1">CSV file only (max 5MB)</p>
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB • {previewData.length} rows detected</p>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} className="text-xs text-red-600 hover:underline">Change File</button>
                            </div>

                            {/* Preview Table */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold">2. Preview & Verify</h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto max-h-[300px]">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-muted border-b">
                                                <tr>
                                                    <th className="px-3 py-2">First Name</th>
                                                    <th className="px-3 py-2">Last Name</th>
                                                    <th className="px-3 py-2">Grade</th>
                                                    <th className="px-3 py-2">Section</th>
                                                    <th className="px-3 py-2">Email</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {previewData.slice(0, 10).map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/50">
                                                        <td className="px-3 py-2">{row.firstName}</td>
                                                        <td className="px-3 py-2">{row.lastName}</td>
                                                        <td className="px-3 py-2">{row.grade}</td>
                                                        <td className="px-3 py-2">{row.section || '-'}</td>
                                                        <td className="px-3 py-2">{row.email || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {previewData.length > 10 && (
                                        <div className="px-3 py-2 bg-muted/30 border-t text-center">
                                            <p className="text-[10px] text-muted-foreground">Showing first 10 rows of {previewData.length}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex items-start gap-4 border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">Important</p>
                            <p className="text-[11px] text-amber-700 dark:text-amber-500 leading-relaxed">
                                Ensure your CSV headers exactly match: <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">firstName</code>, <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">lastName</code>, <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">grade</code>. Other fields are optional.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-muted/50 flex gap-3">
                    <button 
                        onClick={onClose} 
                        className="flex-1 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleImport}
                        disabled={!file || isImporting || previewData.length === 0}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                    >
                        {isImporting ? 'Importing...' : <><Check className="h-4 w-4" /> Confirm Import</>}
                    </button>
                </div>
            </div>
        </div>
    )
}
