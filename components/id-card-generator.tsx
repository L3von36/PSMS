"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { jsPDF } from "jspdf"

export function IDCardGenerator({ students }: { students: any[] }) {
    const generatePDF = (student: any) => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: [85, 55] // Standard ID card size
        })

        doc.setFontSize(12)
        doc.text("Antigravity PSMS", 42.5, 10, { align: "center" })
        doc.setFontSize(10)
        doc.text("STUDENT ID CARD", 42.5, 15, { align: "center" })

        doc.rect(5, 20, 20, 25) // Photo placeholder
        doc.text("PHOTO", 15, 32.5, { align: "center" })

        doc.setFontSize(9)
        doc.text(`Name: ${student.firstName} ${student.lastName}`, 30, 25)
        doc.text(`Grade: ${student.grade}`, 30, 30)
        doc.text(`ID: ${student.id.substring(0, 8)}`, 30, 35)

        doc.save(`${student.firstName}_ID.pdf`)
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map(student => (
                <Card key={student.id}>
                    <CardHeader>
                        <CardTitle className="text-sm">{student.firstName} {student.lastName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => generatePDF(student)} className="w-full">
                            Download ID Card
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
