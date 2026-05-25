import express from 'express';
import fetch from 'node-fetch';

const app = express();
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = 'https://nyxium-music.vercel.app/callback'; // replace with your deployed domain

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Step 1: Login route
app.get('/login', (req, res) => {
  const scope = 'user-top-read user-read-playback-state playlist-read-private';
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authUrl);
});

// Step 2: Callback route
app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });
  const data = await response.json();
  res.json(data); // contains access_token + refresh_token
});

app.listen(3000, () => console.log('Nyxium Music server running on port 3000'));
app.get('/dashboard', (req, res) => {
  if (!req.session.access_token) {
    // Not logged in → redirect to Spotify auth
    res.redirect('/login');
  } else {
    // Already logged in → show dashboard
    res.sendFile(__dirname + '/dashboard.html');
  }
});

