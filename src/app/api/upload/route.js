import { cloudinary } from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const data = await request.json();
    const fileStr = data.image;
    
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: 'forms',
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { message: 'Error uploading file' },
      { status: 500 }
    );
  }
}