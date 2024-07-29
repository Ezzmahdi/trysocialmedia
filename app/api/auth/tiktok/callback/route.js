import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server'; // Adjust import based on your setup

const prisma = new PrismaClient();

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect('/callback?error=Authorization%20code%20not%20provided');
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_key: process.env.TIKTOK_CLIENT_ID,
        client_secret: process.env.TIKTOK_CLIENT_SECRET,
        redirect_uri: process.env.TIKTOK_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.data.access_token;

    // Get userId from Clerk
    const user = await auth(request); // Make sure to handle Clerk's authentication
    const userId = user?.id;

    if (!userId) {
      throw new Error('User ID not found');
    }

    // Save the token to the database
    await prisma.socialPlatforms.upsert({
      where: { userId },
      update: {
        Tiktok: true,
        TiktokToken: accessToken,
      },
      create: {
        userId,
        Tiktok: true,
        TiktokToken: accessToken,
      },
    });

    return NextResponse.redirect('/callback?success=true');
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.redirect('/callback?error=Authentication%20error');
  }
}
