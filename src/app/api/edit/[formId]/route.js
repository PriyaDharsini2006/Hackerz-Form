import { NextResponse } from 'next/server'
import  prisma  from '../../../../lib/prisma'

export async function PUT(
    req,
    { params }
) {
    try {
        const { formId } = params
        const body = await req.json()
        const { title, description, questions, color, isActive, link } = body

        const updatedForm = await prisma.form.update({
            where: { id: formId },
            data: {
                title,
                description,
                color,
                isActive,
                link,
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
                            imageUrl: question.imageUrl || '',
                            link: question.link || '',
                        },
                        update: {
                            type: question.type,
                            title: question.title,
                            options: question.options || [],
                            required: question.required,
                            order: index,
                            imageUrl: question.imageUrl || '',
                            link: question.link || '',
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
        console.error('Error updating form:', error)
        return NextResponse.json(
            { error: 'Failed to update form', details: error.message },
            { status: 500 }
        )
    }
}
