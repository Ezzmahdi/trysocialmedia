import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.TIKTOK_CLIENT_ID;
  const redirectUri = process.env.TIKTOK_REDIRECT_URI;
  const authUrl = `https://open-api.tiktok.com/platform/oauth/connect/?client_key=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user.info.basic,video.upload`;

  return NextResponse.redirect(authUrl);
}
