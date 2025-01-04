// app/api/forms/[formId]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    req,
    { params }
) {
    try {
        const { formId } = params
        const body = await req.json()
        const { title, description, questions } = body

        const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
                title,
                description,
                questions: {
                    deleteMany: {
                        formId,
                        id: { notIn: questions.filter((q) => q.id).map((q) => q.id) }
                    },
                    upsert: questions.map((question, index) => ({
                        where: {
                            id: question.id || 'new-id-' + index
                        },
                        create: {
                            type: question.type,
                            title: question.title,
                            options: question.options || [],
                            required: question.required,
                            order: index,
                            imageUrl: question.imageUrl
                        },
                        update: {
                            type: question.type,
                            title: question.title,
                            options: question.options || [],
                            required: question.required,
                            order: index,
                            imageUrl: question.imageUrl
                        }
                    }))
                }
            },
            include: {
                questions: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        })

        return NextResponse.json(updatedForm)
    } catch (error) {
        console.error(error)
        return NextResponse.json(
            { error: 'Failed to update form' },
            { status: 500 }
        )
    }
}