import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(request) {
  const user = await auth(request); // Make sure to handle Clerk's authentication
  const clerkUserId = user?.id;

  if (!clerkUserId) {
    return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
  }

  const { imageUrl, caption } = await request.json();
  if (!imageUrl) {
    return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
  }

  const userRecord = await prisma.socialPlatforms.findUnique({
    where: { userId: clerkUserId },
  });

  if (!userRecord || !userRecord.InstagramToken) {
    return NextResponse.json({ error: 'No Instagram token found for user' }, { status: 400 });
  }

  try {
    // Step 1: Create media container
    const containerResponse = await fetch(`https://graph.instagram.com/me/media?access_token=${userRecord.InstagramToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
      }),
    });

    if (!containerResponse.ok) {
      throw new Error('Failed to create media container');
    }

    const containerData = await containerResponse.json();
    const containerId = containerData.id;

    // Step 2: Publish media container
    const publishResponse = await fetch(`https://graph.instagram.com/me/media_publish?access_token=${userRecord.InstagramToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: containerId,
      }),
    });

    if (!publishResponse.ok) {
      throw new Error('Failed to publish media');
    }

    const publishData = await publishResponse.json();

    return NextResponse.json({ success: true, data: publishData });
  } catch (error) {
    console.error('Error during media upload:', error);
    return NextResponse.json({ error: 'Media upload error' }, { status: 500 });
  }
}
