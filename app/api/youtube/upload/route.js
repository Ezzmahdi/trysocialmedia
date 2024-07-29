import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import prismadb from '@/lib/prismadb';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const userId = formData.get('userId');
    const videoTitle = formData.get('videoTitle');
    const videoDescription = formData.get('videoDescription');
    const videoFile = formData.get('videoFile');

    const user = await prismadb.socialPlatforms.findUnique({
      where: { userId },
    });

    if (!user || !user.YoutubeToken) {
      return NextResponse.json({ error: 'User not authenticated with YouTube' }, { status: 401 });
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: user.YoutubeToken,
    });

    // Upload video to YouTube
    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
        },
        status: {
          privacyStatus: 'public',
        },
      },
      media: {
        body: videoFile,
      },
    });

    return NextResponse.json({ message: 'Video uploaded successfully', data: response.data });
  } catch (error) {
    console.error('Error uploading video:', error.response?.data || error.message);
    return NextResponse.json({ error: 'Error uploading video' }, { status: 400 });
  }
}
