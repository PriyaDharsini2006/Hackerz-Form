import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createObjectCsvWriter } from 'csv-writer'
import path from 'path'
import { mkdir, readFile } from 'fs/promises'

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
      // Format data for CSV
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

      // Ensure tmp directory exists
      const tmpDir = path.join(process.cwd(), 'tmp')
      await mkdir(tmpDir, { recursive: true })

      const csvPath = path.join(tmpDir, `form-${params.formId}.csv`)
      const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: headers,
      })

      await csvWriter.writeRecords(records)

      // Read the file and return it
      const fileContent = await readFile(csvPath, 'utf-8')

      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=form-${params.formId}.csv`,
        },
      })
    }

    // Return JSON response if CSV is not requested
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

    // Check if email already exists for this form
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

    // Create response with answers
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