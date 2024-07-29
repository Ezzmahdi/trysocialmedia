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
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to get access token:', errorText);
      return NextResponse.redirect('/callback?error=Failed%20to%20get%20access%20token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const { userId } = auth(request);

    if (!userId) {
      throw new Error('User ID not found');
    }

    await prisma.socialPlatforms.upsert({
      where: { userId },
      update: { LinkedInToken: accessToken },
      create: { userId, LinkedInToken: accessToken },
    });

    return NextResponse.redirect('/callback?success=true');
  } catch (error) {
    console.error('Error during authentication:', error);
    return NextResponse.redirect('/callback?error=Authentication%20error');
  }
}
 