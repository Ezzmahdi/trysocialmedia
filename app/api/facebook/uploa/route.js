import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request) {
  const user = await auth(request);
  const clerkUserId = user?.id;

  if (!clerkUserId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
  }

  const { pageId, message, imageUrl } = await request.json();
  if (!pageId || !message || !imageUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const userRecord = await prisma.socialPlatforms.findUnique({
    where: { userId: clerkUserId },
  });

  if (!userRecord || !userRecord.FacebookToken) {
    return NextResponse.json({ error: 'No Facebook token found for user' }, { status: 400 });
  }

  try {
    const postResponse = await fetch(`https://graph.facebook.com/${pageId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userRecord.FacebookToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: imageUrl,
        caption: message,
      }),
    });

    if (!postResponse.ok) {
      throw new Error('Failed to upload media');
    }

    const postData = await postResponse.json();

    return NextResponse.json({ success: true, data: postData });
  } catch (error) {
    console.error('Error during media upload:', error);
    return NextResponse.json({ error: 'Media upload error' }, { status: 500 });
  }
}
