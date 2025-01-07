import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { formId, email } = params

    const response = await prisma.response.findUnique({
      where: {
        formId_email: {
          formId: formId,
          email: decodeURIComponent(email),
        },
      },
      include: {
        answers: true,
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching response:', error)
    return NextResponse.json(
      { error: 'Error fetching response' },
      { status: 500 }
    )
  }
}