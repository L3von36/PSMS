'use client'

import { Button } from "@/components/ui/button"
import { CreditCard, Download, Loader2 } from "lucide-react"
import { useState } from "react"

// Create a separate file for this later if it grows
import jsPDF from "jspdf"

export function StudentIdCardButton({ student }: { student: any }) {
    const [generating, setGenerating] = useState(false)

    const generateIdCard = async () => {
        setGenerating(true)
        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: [85.6, 54] // Credit card size
            })

            // Background Design
            doc.setFillColor(63, 81, 181) // Indigo Primary
            doc.rect(0, 0, 85.6, 54, 'F')
            
            // White Content Area
            doc.setFillColor(255, 255, 255)
            doc.roundedRect(2, 2, 81.6, 50, 2, 2, 'F')

            // School Header
            doc.setFontSize(10)
            doc.setTextColor(63, 81, 181)
            doc.setFont("helvetica", "bold")
            doc.text("EXCELLENCE ACADEMY", 42.8, 8, { align: 'center' })
            
            doc.setFontSize(6)
            doc.setTextColor(100, 100, 100)
            doc.setFont("helvetica", "normal")
            doc.text("STUDENT IDENTITY CARD", 42.8, 11, { align: 'center' })

            // Photo Placeholder logic
            if (student.photoUrl) {
                // In real app, we'd fetch the base64 or load the image
                // doc.addImage(student.photoUrl, 'JPEG', 5, 15, 20, 25)
                doc.setDrawColor(200, 200, 200)
                doc.rect(5, 15, 20, 25)
                doc.setFontSize(6)
                doc.text("PHOTO", 15, 28, { align: 'center' })
            } else {
                doc.setDrawColor(200, 200, 200)
                doc.rect(5, 15, 20, 25)
                doc.setFontSize(6)
                doc.text("PHOTO", 15, 28, { align: 'center' })
            }

            // Student Details
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            
            const labelX = 30
            const valX = 50
            let y = 18
            const gap = 5

            doc.text("Name:", labelX, y)
            doc.setFont("helvetica", "normal")
            doc.text(`${student.firstName} ${student.lastName}`, valX, y)
            
            y += gap
            doc.setFont("helvetica", "bold")
            doc.text("ID No:", labelX, y)
            doc.setFont("helvetica", "normal")
            doc.text(student.id.slice(-6).toUpperCase(), valX, y)

            y += gap
            doc.setFont("helvetica", "bold")
            doc.text("Grade:", labelX, y)
            doc.setFont("helvetica", "normal")
            doc.text(`${student.grade}-${student.section || ''}`, valX, y)

            y += gap
            doc.setFont("helvetica", "bold")
            doc.text("Expire:", labelX, y)
            doc.setFont("helvetica", "normal")
            doc.text("June 2027", valX, y)

            // Barcode Placeholder
            doc.setFillColor(0, 0, 0)
            doc.rect(30, 42, 40, 6, 'F')

            doc.save(`${student.firstName}_ID.pdf`)

        } catch (e) {
            console.error(e)
            alert("Failed to generate ID")
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={generateIdCard} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            Generate ID
        </Button>
    )
}
