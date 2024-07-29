import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
  const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,pages_show_list,pages_manage_posts&response_type=code`;

  return NextResponse.redirect(authUrl);
}
