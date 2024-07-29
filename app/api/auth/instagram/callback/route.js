import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/callback?error=Authorization%20code%20not%20provided');
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // Get userId from Clerk
    const user = await auth(request); // Make sure to handle Clerk's authentication
    const clerkUserId = user?.id;

    if (!clerkUserId) {
      throw new Error('Clerk User ID not found');
    }

    // Save the token to the database
    await prisma.socialPlatforms.upsert({
      where: { userId: clerkUserId },
      update: {
        Instagram: true,
        InstagramToken: accessToken,
      },
      create: {
        userId: clerkUserId,
        Instagram: true,
        InstagramToken: accessToken,
      },
    });

    return NextResponse.redirect('/callback?success=true');
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.redirect('/callback?error=Authentication%20error');
  }
}
