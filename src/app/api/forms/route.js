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
    const { title, description, color, questions, link } = await request.json()
    
    console.log('Received questions:', questions);

    const form = await prisma.form.create({
      data: {
        title,
        description,
        color, 
        link,
        questions: {
          create: questions.map((q, index) => {
            console.log('Creating question with imageUrl:', q.imageUrl);
            return {
              type: q.type,
              title: q.title,
              options: q.options || [],
              required: q.required,
              order: index,
              imageUrl: q.imageUrl || '',
              link: q.link || '',
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
            imageUrl: true,
            link: true,
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