import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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
      // Create headers row
      const headers = [
        'Email',
        'Submitted At',
        ...form.questions.map(q => q.title)
      ]

      // Create data rows
      const rows = form.responses.map(response => [
        response.email,
        response.createdAt.toISOString(),
        ...form.questions.map(question => {
          const answer = response.answers.find(a => a.questionId === question.id)
          return answer?.value || ''
        })
      ])

      // Combine headers and data
      const data = [headers, ...rows]

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)

      // Set column widths
      const colWidths = headers.map(() => ({ wch: 20 }))
      ws['!cols'] = colWidths

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Responses')

      // Generate buffer
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

    const existingResponse = await prisma.response.findUnique({
      where: {
        formId_email: {
          formId: params.formId,
          email: email,
        },
      },
    })

    if (existingResponse) {
      return NextResponse.json(
        { error: 'You have already submitted this form' },
        { status: 400 }
      )
    }

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

    const existingResponse = await prisma.response.findUnique({
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
      return NextResponse.json(
        { error: 'No existing response found' },
        { status: 404 }
      )
    }

    const previousAnswers = existingResponse.answers.map(answer => ({
      questionId: answer.questionId,
      questionTitle: answer.question.title,
      previousValue: answer.value,
      newValue: answers.find(a => a.questionId === answer.questionId)?.value || null
    }))
    await prisma.answer.deleteMany({
      where: {
        responseId: existingResponse.id,
      },
    })
    const updatedResponse = await prisma.response.update({
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

    return NextResponse.json({
      previousResponse: {
        email: existingResponse.email,
        createdAt: existingResponse.createdAt,
        answers: previousAnswers
      },
      updatedResponse: updatedResponse
    })
  } catch (error) {
    console.error('Error updating response:', error)
    return NextResponse.json(
      { error: 'Error updating response' },
      { status: 500 }
    )
  }
}