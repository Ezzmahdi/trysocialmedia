import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request) {
  const user = await auth(request); // Make sure to handle Clerk's authentication
  const userId = user?.id;

  if (!userId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
  }

  const { videoFile } = await request.json();
  if (!videoFile) {
    return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
  }

  const userRecord = await prisma.socialPlatforms.findUnique({
    where: { userId },
  });

  if (!userRecord || !userRecord.TiktokToken) {
    return NextResponse.json({ error: 'No TikTok token found for user' }, { status: 400 });
  }

  try {
    const uploadResponse = await fetch('https://open-api.tiktok.com/share/video/upload/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userRecord.TiktokToken}`,
      },
      body: JSON.stringify({
        video_file: videoFile,
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload video');
    }

    const uploadData = await uploadResponse.json();

    return NextResponse.json({ success: true, data: uploadData });
  } catch (error) {
    console.error('Error during video upload:', error);
    return NextResponse.json({ error: 'Video upload error' }, { status: 500 });
  }
}
