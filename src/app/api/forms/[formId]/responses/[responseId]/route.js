import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request,
  { params }
) {
  try {
    const response = await prisma.response.findFirst({
      where: {
        id: params.responseId,
        formId: params.formId,
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

export async function DELETE(
  request,
  { params }
) {
  try {
    await prisma.response.delete({
      where: {
        id: params.responseId,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting response:', error)
    return NextResponse.json(
      { error: 'Error deleting response' },
      { status: 500 }
    )
  }
}