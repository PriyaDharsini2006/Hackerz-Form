// app/api/upload/route.js
import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const filename = `${Date.now()}-${file.name}`
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    const filepath = path.join(uploadDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Return the URL for the uploaded file
    return NextResponse.json({ 
      url: `/uploads/${filename}` 
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    )
  }
}