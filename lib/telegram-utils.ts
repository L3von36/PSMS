/**
 * Ethiopian School Localization: Telegram Integration Draft
 * 
 * In Ethiopia, Telegram bots are widely used by schools to:
 * 1. Publish exam results.
 * 2. Send attendance alerts.
 * 3. Share school announcements.
 * 
 * This file outlines the structure for a results checker bot.
 */

import { prisma } from "@/lib/prisma"
import { calculateEthiopianLetter } from "@/lib/utils"

// Mock function representing a Telegram Bot message handler
// In production, use 'telegraf' or 'node-telegram-bot-api'
export async function handleTelegramMessage(chatId: string, text: string) {
    // Expected format: /result [Student_ID]
    if (text.startsWith("/result")) {
        const studentId = text.split(" ")[1]

        if (!studentId) {
            return "Please provide a Student ID. Format: /result PSMS-123"
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                grades: {
                    include: { subject: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        if (!student) {
            return "Student not found. Please check the ID and try again."
        }

        let message = `📊 *Results for ${student.firstName} ${student.lastName}*\n`
        message += `Grade: ${student.grade} ${student.section || ""}\n\n`

        if (student.grades.length === 0) {
            message += "No grades recorded yet."
        } else {
            student.grades.forEach((g: any) => {
                const letter = calculateEthiopianLetter(g.score)
                message += `🔹 *${g.subject.name}*: ${g.score}% (${letter}) - ${g.category}\n`
            })
        }

        return message
    }

    return "Welcome to PSMS Results Bot! Use /result [ID] to check your child's performance."
}
