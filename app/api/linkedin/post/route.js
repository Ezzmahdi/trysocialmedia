import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server'; // Adjust import based on your setup

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { content } = await request.json();

    // Get userId from Clerk
    const user = await auth(request); // Make sure to handle Clerk's authentication
    const userId = user?.id; // Adjust based on Clerk's user object

    if (!userId) {
      throw new Error('User ID not found');
    }

    // Retrieve the LinkedIn access token from the database
    const userPlatforms = await prisma.socialPlatforms.findUnique({
      where: { userId },
    });

    if (!userPlatforms?.LinkedInToken) {
      throw new Error('LinkedIn token not found');
    }

    const accessToken = userPlatforms.LinkedInToken;

    // Create the post content
    const postContent = {
      author: `urn:li:person:${userId}`, // LinkedIn specific user ID
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    // Make the API request to post content on LinkedIn
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postContent),
    });

    if (!response.ok) {
      throw new Error('Failed to post content on LinkedIn');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error posting to LinkedIn:', error);
    return NextResponse.json({ error: 'Failed to post content on LinkedIn' }, { status: 500 });
  }
}
