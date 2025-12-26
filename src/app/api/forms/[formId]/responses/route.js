import { NextResponse } from 'next/server'
import  prisma  from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(request, { params }) {
  try {
    const form = await prisma.form.findUnique({
      where: { id: params.formId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        responses: {
          include: {
            answers: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    const searchParams = new URL(request.url).searchParams
    const format = searchParams.get('format')

    if (format === 'excel') {
      const headers = [
        'Email',
        'Submitted At',
        ...form.questions.map(q => q.title)
      ]

      const rows = form.responses.map(response => [
        response.email,
        response.createdAt.toISOString(),
        ...form.questions.map(question => {
          const answer = response.answers.find(a => a.questionId === question.id)
          return answer?.value || ''
        })
      ])

      const data = [headers, ...rows]

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)

      const colWidths = headers.map(() => ({ wch: 20 }))
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Responses')

      const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

      return new NextResponse(excelBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${form.title}-responses.xlsx"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      })
    }

    return NextResponse.json(form.responses)
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Error fetching responses' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const body = await request.json()
    const { email, answers } = body

    const response = await prisma.response.create({
      data: {
        formId: params.formId,
        email,
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
      include: {
        answers: true,
      },
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error submitting response:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already submitted this form' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error submitting response' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { email, answers } = body

    const result = await prisma.$transaction(async (tx) => {
      const existingResponse = await tx.response.findUnique({
        where: {
          formId_email: {
            formId: params.formId,
            email: email,
          },
        },
        include: {
          answers: {
            include: {
              question: true
            }
          },
        },
      })

      if (!existingResponse) {
        throw new Error('NO_RESPONSE_FOUND')
      }

      const previousAnswers = existingResponse.answers.map(answer => ({
        questionId: answer.questionId,
        questionTitle: answer.question.title,
        previousValue: answer.value,
        newValue: answers.find(a => a.questionId === answer.questionId)?.value || null
      }))

      await tx.answer.deleteMany({
        where: {
          responseId: existingResponse.id,
        },
      })

      const updatedResponse = await tx.response.update({
        where: {
          id: existingResponse.id,
        },
        data: {
          answers: {
            create: answers.map((a) => ({
              questionId: a.questionId,
              value: a.value,
            })),
          },
        },
        include: {
          answers: {
            include: {
              question: true
            }
          },
        },
      })

      return {
        previousResponse: {
          email: existingResponse.email,
          createdAt: existingResponse.createdAt,
          answers: previousAnswers
        },
        updatedResponse: updatedResponse
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating response:', error)
    
    if (error.message === 'NO_RESPONSE_FOUND') {
      return NextResponse.json(
        { error: 'No existing response found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Error updating response' },
      { status: 500 }
    )
  }
}
