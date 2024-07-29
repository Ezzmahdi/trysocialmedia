'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    const response = await fetch('/api/youtube/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Upload successful:', data);
    } else {
      console.error('Upload failed:', data);
    }
  };

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.YOUTUBE_REDIRECT_URI);
  const scope = 'https://www.googleapis.com/auth/youtube.upload'; // Adjust scope as needed

  // Construct the authorization URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  const [content, setContent] = useState('');

  

  const handlePostToLinkedIn = async () => {
    const response = await fetch('/api/linkedin/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      alert('Post was successfully made to LinkedIn!');
    } else {
      alert('Failed to post to LinkedIn.');
    }
  };


  const [videoFile, setVideoFile] = useState(null);

  const handleVideoUpload = async () => {
    if (!videoFile) {
      alert('Please select a video file first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('videoFile', videoFile);

      const response = await fetch('/api/tiktok/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert('Video uploaded successfully!');
      } else {
        alert('Video upload failed.');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Video upload error.');
    }
  };

  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

  const handleMediaUpload = async () => {
    if (!imageUrl) {
      alert('Please provide an image URL first.');
      return;
    }

    try {
      const response = await fetch('/api/instagram/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          caption,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Media uploaded successfully!');
      } else {
        alert('Media upload failed.');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Media upload error.');
    }
  };

  const [pageId, setPageId] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrlFacebook, setImageUrlFacebook] = useState('');

  const handleMediaUploadFacebook = async () => {
    if (!pageId || !message || !imageUrl) {
      alert('Please provide all required fields.');
      return;
    }

    try {
      const response = await fetch('/api/facebook/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId,
          message,
          imageUrl,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Media uploaded successfully!');
      } else {
        alert('Media upload failed.');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Media upload error.');
    }
  };

  const handleYoutubeAuth = () => {
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  const handleLinkedInAuth = () => {
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI}&scope=${process.env.NEXT_PUBLIC_LINKEDIN_SCOPES}`;
  };

  const handleTikTokAuth = () => {
    window.location.href = '/api/auth/tiktok';
  }

  const handleInstagramAuth = () => {
    window.location.href = '/api/auth/instagram';
  };

  const handleFacebookAuth = () => {
    window.location.href = '/api/auth/facebook';
  };

  return (
    
    <div>
      <div classname="p-7">
        <h4>Welcome to OAuth Integration</h4>

        <button className="button p-4" onClick={handleYoutubeAuth}> Authorize with YouTube </button>

        <button className="button p-4" onClick={handleLinkedInAuth}> Authorize LinkedIn </button>
        
        <button className="button p-4" onClick={handleTikTokAuth}> Authorize TikTok </button>

        <button className="button p-4" onClick={handleInstagramAuth}> Authorize Instagram </button>

        <button className="button p-4" onClick={handleFacebookAuth}> Authorize Facebook </button>
      
      </div>
      {/* <form onSubmit={handleSubmit} className='p-6 m-4'>
        <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} required />
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
        <button type="submit">Upload Video</button>
      </form>
      <input
        type="text"
        placeholder="Facebook Page ID"
        value={pageId}
        onChange={(e) => setPageId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button onClick={handleMediaUpload}>Upload Media to Facebook</button>
      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button onClick={handleMediaUpload}>Upload Media to Instagram</button>
      <div className='p-7 m-4'>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here..."
        />
        <button onClick={handlePostToLinkedIn}>Post to LinkedIn</button>
      </div>
      <div className='p-7 m-4'>
        <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
          />
        <button onClick={handleVideoUpload}>Upload Video to TikTok</button>
      </div> */}
    </div>
  );
}
