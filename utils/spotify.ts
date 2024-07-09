// lib/spotify.ts
import axios from 'axios';

const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1';

const getSpotifyData = async (url: string, accessToken: string) => {
  try {
    const response = await axios.get(`${SPOTIFY_API_BASE_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Spotify:', error);
    throw error;
  }
};

export const getUserPlaylists = async (accessToken: string) => {
  return getSpotifyData('/me/playlists', accessToken);
};

export const getUserTopArtists = async (accessToken: string) => {
  return getSpotifyData('/me/top/artists', accessToken);
};

export const getUserTopTracks = async (accessToken: string) => {
  return getSpotifyData('/me/top/tracks', accessToken);
};
