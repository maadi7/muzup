import axios from 'axios';
import { useUserStore } from '../../lib/store';

const refreshToken = async () => {
  console.log("here");
  const { spotifySession, setSpotifySession } = useUserStore.getState();

  if (!spotifySession) return;

  console.log(process.env.SPOTIFY_CLIENT_ID);
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', {
      grant_type: 'refresh_token',
      refresh_token: spotifySession.refreshToken, // Assuming you have saved the refresh token
    }, {
      headers: {
        Authorization: `Basic ${btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const { access_token, expires_in } = response.data;

    setSpotifySession({
      ...spotifySession,
      accessToken: access_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
    });

    console.log("Spotify access token refreshed");
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
  }
};

export default refreshToken;
