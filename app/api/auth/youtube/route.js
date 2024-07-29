import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code not provided' }, { status: 400 });
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        redirect_uri: process.env.YOUTUBE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Assume you have a way to get the userId (e.g., from a session or user info)
    const user = await auth(request); // Make sure to handle Clerk's authentication
    const userId = user?.id;

    // Save the token to the database
    await prisma.socialPlatforms.upsert({
      where: { userId },
      update: { YoutubeToken: accessToken },
      create: { userId, YoutubeToken: accessToken },
    });

    return NextResponse.redirect('/your-success-page'); // Redirect to a success page or any other page
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}
