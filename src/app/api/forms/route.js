import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    console.log(request)
    const forms = await prisma.form.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { responses: true }
        }
      }
    })
    return NextResponse.json(forms)
  } catch (error) {
    console.error('Error fetching forms:', error)
    return NextResponse.json(
      { error: 'Error fetching forms' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { title, description, color, questions } = await request.json()
    
    console.log('Received questions:', questions); // Add this debug log

    const form = await prisma.form.create({
      data: {
        title,
        description,
        color, 
        questions: {
          create: questions.map((q, index) => {
            console.log('Creating question with imageUrl:', q.imageUrl); // Add this debug log
            return {
              type: q.type,
              title: q.title,
              options: q.options || [],
              required: q.required,
              order: index,
              imageUrl: q.imageUrl || '',
            };
          }),
        },
      },
      include: {
        questions: {
          select: {
            id: true,
            type: true,
            title: true,
            options: true,
            required: true,
            order: true,
            imageUrl: true, // Make sure this is included
          }
        },
      },
    })

    return NextResponse.json(form, { status: 201 })
  } catch (error) {
    console.error('Error creating form:', error)
    return NextResponse.json(
      { error: 'Error creating form' },
      { status: 500 }
    )
  }
}