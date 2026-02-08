"use server"

import { prisma } from "@/lib/prisma"

export type SearchResult = {
    id: string
    type: 'student' | 'parent' | 'exam' | 'subject'
    title: string
    subtitle: string
    url: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const [students, parents, exams, subjects] = await Promise.all([
        prisma.student.findMany({
            where: {
                OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } },
                    { email: { contains: query } },
                    { phone: { contains: query } },
                ]
            },
            take: 5
        }),
        prisma.parent.findMany({
            where: {
                OR: [
                    { firstName: { contains: query } },
                    { lastName: { contains: query } },
                    { phone: { contains: query } },
                ]
            },
            take: 5
        }),
        prisma.exam.findMany({
            where: {
                title: { contains: query }
            },
            include: { subject: true },
            take: 5
        }),
        prisma.subject.findMany({
            where: {
                name: { contains: query }
            },
            take: 5
        })
    ])

    const results: SearchResult[] = [
        ...students.map(s => ({
            id: s.id,
            type: 'student' as const,
            title: `${s.firstName} ${s.lastName}`,
            subtitle: `Grade ${s.grade}`,
            url: `/dashboard/students` // In real app, might have student/id
        })),
        ...parents.map(p => ({
            id: p.id,
            type: 'parent' as const,
            title: `${p.firstName} ${p.lastName}`,
            subtitle: `Phone: ${p.phone}`,
            url: `/dashboard/students` // Parents are managed on students page usually
        })),
        ...exams.map(e => ({
            id: e.id,
            type: 'exam' as const,
            title: e.title,
            subtitle: `Subject: ${e.subject.name}`,
            url: `/dashboard/exams`
        })),
        ...subjects.map(s => ({
            id: s.id,
            type: 'subject' as const,
            title: s.name,
            subtitle: `Level ${s.gradeLevel}`,
            url: `/dashboard/exams`
        }))
    ]

    return results
}
