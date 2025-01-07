import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createObjectCsvWriter } from 'csv-writer'
import path from 'path'
import { mkdir, readFile, unlink } from 'fs/promises'

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

    // Check if CSV export is requested
    const searchParams = new URL(request.url).searchParams
    const format = searchParams.get('format')

    if (format === 'csv') {
      const headers = [
        { id: 'email', title: 'Email' },
        { id: 'submittedAt', title: 'Submitted At' },
        ...form.questions.map((q) => ({
          id: q.id,
          title: q.title,
        })),
      ]

      const records = form.responses.map((response) => {
        const record = {
          email: response.email,
          submittedAt: response.createdAt.toISOString(),
        }

        form.questions.forEach((question) => {
          const answer = response.answers.find(
            (a) => a.questionId === question.id
          )
          record[question.id] = answer?.value || ''
        })

        return record
      })

      try {
        const tmpDir = path.join(process.cwd(), 'tmp')
        await mkdir(tmpDir, { recursive: true })

        const csvPath = path.join(tmpDir, `form-${params.formId}.csv`)
        const csvWriter = createObjectCsvWriter({
          path: csvPath,
          header: headers,
        })

        await csvWriter.writeRecords(records)
        const fileContent = await readFile(csvPath)
        await unlink(csvPath).catch(console.error)

        return new NextResponse(fileContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${form.title}-responses.csv"`,
          },
        })
      } catch (error) {
        console.error('Error generating CSV:', error)
        return NextResponse.json(
          { error: 'Error generating CSV' },
          { status: 500 }
        )
      }
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