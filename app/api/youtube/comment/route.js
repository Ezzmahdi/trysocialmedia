import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const tokens = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tokens.json')));
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const requestBody = {
      snippet: {
        videoId: 'id', // Update this with the actual video ID
        topLevelComment: {
          snippet: {
            textOriginal: 'Testing backend side',
          },
        },
      },
    };

    youtube.commentThreads.insert(
      {
        part: 'snippet',
        resource: requestBody,
      },
      (err, response) => {
        if (err) {
          console.error('Error posting comment: ', err);
          res.status(500).send(err);
          return;
        }
        res.status(200).send(response.data);
      }
    );
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
