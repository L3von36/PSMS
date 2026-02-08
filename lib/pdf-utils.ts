import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF with autotable types
declare module 'jspdf' {
    interface jsPDF {
        autoTable: any
    }
}

export type ReportCardData = {
    studentName: string
    studentId: string
    grade: string
    term: string
    photoUrl?: string | null
    grades: {
        subject: string
        score: number
        grade: string
        category: string
    }[]
    attendance: string
    teacherComments: string
}

export type ReceiptData = {
    receiptNo: string
    date: string
    studentName: string
    studentId: string
    grade: string
    amount: number
    method: string
    status: string
    description: string
}

export const generateReportCardPDF = (data: ReportCardData) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    // Header
    doc.setFillColor(31, 41, 55) // Dark Gray
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('ANTIGRAVITY PRIVATE SCHOOL', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.text('123 Educational Blvd, Addis Ababa, Ethiopia | +251 112 345 678', pageWidth / 2, 30, { align: 'center' })

    // Student Info Header
    doc.setTextColor(31, 41, 55)
    doc.setFontSize(16)
    doc.text(`OFFICIAL REPORT CARD - ${data.academicYear || '2017 E.C.'}`, pageWidth / 2, 55, { align: 'center' })

    doc.setDrawColor(200, 200, 200)
    doc.line(20, 60, pageWidth - 20, 60)

    // Student Details
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Student Name:', 20, 75)
    doc.setFont('helvetica', 'normal')
    doc.text(data.studentName, 55, 75)

    doc.setFont('helvetica', 'bold')
    doc.text('Student ID:', 20, 82)
    doc.setFont('helvetica', 'normal')
    doc.text(data.studentId, 55, 82)

    doc.setFont('helvetica', 'bold')
    doc.text('Grade:', pageWidth / 2 + 10, 75)
    doc.setFont('helvetica', 'normal')
    doc.text(data.grade, pageWidth / 2 + 45, 75)

    doc.setFont('helvetica', 'bold')
    doc.text('Semester/Term:', pageWidth / 2 + 10, 82)
    doc.setFont('helvetica', 'normal')
    doc.text(data.term, pageWidth / 2 + 45, 82)

    // Grades Table
    const tableData = data.grades.map(g => [g.subject, g.category, `${g.score}%`, g.grade])

    doc.autoTable({
        startY: 95,
        head: [['Subject', 'Category', 'Score', 'Grade']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10, cellPadding: 5 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 15

    // Summary & Comments
    doc.setFont('helvetica', 'bold')
    doc.text('Attendance:', 20, finalY)
    doc.setFont('helvetica', 'normal')
    doc.text(data.attendance, 50, finalY)

    doc.setFont('helvetica', 'bold')
    doc.text('Teacher Comments:', 20, finalY + 10)
    doc.setFont('helvetica', 'normal')
    doc.rect(20, finalY + 15, pageWidth - 40, 30)
    doc.text(data.teacherComments, 25, finalY + 22, { maxWidth: pageWidth - 50 })

    // Footer / Signatures
    doc.setFontSize(10)
    doc.text('______________________', 40, finalY + 65)
    doc.text('Class Teacher', 50, finalY + 70)

    doc.text('______________________', pageWidth - 80, finalY + 65)
    doc.text('School Principal', pageWidth - 70, finalY + 70)

    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' })

    doc.save(`${data.studentName.replace(/\s+/g, '_')}_Report_Card.pdf`)
}

export const generateReceiptPDF = (data: ReceiptData) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width

    // Professional Receipt Layout
    doc.setFillColor(79, 70, 229) // Indigo
    doc.rect(0, 0, pageWidth, 5, 'F')

    doc.setFontSize(24)
    doc.setTextColor(79, 70, 229)
    doc.setFont('helvetica', 'bold')
    doc.text('OFFICIAL RECEIPT', 20, 25)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'normal')
    doc.text('ANTIGRAVITY PRIVATE SCHOOL', pageWidth - 20, 20, { align: 'right' })
    doc.text('Addis Ababa, Ethiopia', pageWidth - 20, 25, { align: 'right' })
    doc.text('Tel: +251 112 345 678', pageWidth - 20, 30, { align: 'right' })

    // Receipt Meta
    doc.setDrawColor(240, 240, 240)
    doc.line(20, 40, pageWidth - 20, 40)

    doc.setTextColor(50, 50, 50)
    doc.setFontSize(11)
    doc.text(`Receipt No: #${data.receiptNo}`, 20, 50)
    doc.text(`Date: ${data.date}`, pageWidth - 20, 50, { align: 'right' })

    // Bill To
    doc.setFillColor(249, 250, 251)
    doc.rect(20, 60, pageWidth - 40, 40, 'F')

    doc.setFont('helvetica', 'bold')
    doc.text('BILL TO:', 30, 70)
    doc.setFont('helvetica', 'normal')
    doc.text(`${data.studentName} (${data.studentId})`, 30, 78)
    doc.text(`Grade: ${data.grade}`, 30, 85)

    // Payment Details Table
    doc.autoTable({
        startY: 110,
        head: [['Description', 'Payment Method', 'Status', 'Total Amount']],
        body: [
            [data.description, data.method, data.status.toUpperCase(), `ETB ${data.amount.toLocaleString()}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
        columnStyles: {
            3: { halign: 'right', fontStyle: 'bold' }
        }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 30

    // Total Banner
    doc.setFillColor(79, 70, 229)
    doc.rect(pageWidth - 100, finalY - 15, 80, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.text(`TOTAL: ETB ${data.amount.toLocaleString()}`, pageWidth - 90, finalY - 2)

    // Verification
    doc.setTextColor(150, 150, 150)
    doc.setFontSize(9)
    doc.text('Thank you for your payment. This is a computer-generated receipt.', 20, finalY + 40)

    doc.setDrawColor(0, 0, 0)
    doc.setLineDashPattern([2, 1], 0)
    doc.line(pageWidth - 80, finalY + 30, pageWidth - 20, finalY + 30)
    doc.text('Authorized Signature', pageWidth - 75, finalY + 35)

    doc.save(`Receipt_${data.receiptNo}.pdf`)
}
