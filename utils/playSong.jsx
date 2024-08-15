// src/utils/playSong.js

import axios from 'axios';
import refreshToken from '@/pages/api/refreshToken';
import { useUserStore } from '@/lib/store'; // Adjust the path as necessary

/**
 * Function to play a song on Spotify using the provided songId.
 * @param {string} songId - The Spotify song ID to be played.
 * @param {string} accessToken - The user's Spotify access token.
 * @returns {Promise<HTMLAudioElement|null>} The Audio object if the preview URL is available, otherwise null.
 */
const playSong = async (songId, accessToken) => {
  const { setSpotifySession } = useUserStore.getState(); // Retrieve the state updater function

  try {
    // Make the request to get track details
    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${songId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { preview_url } = response.data;

    if (preview_url) {
      // Play the preview URL
      const audio = new Audio(preview_url);
      audio.play().then(() => {
        console.log('Playing preview:', preview_url);
      }).catch(error => {
        console.error('Error playing preview:', error);
      });
      return audio;
    } else {
      console.log('No preview URL available for this track.');
      return null;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('Access token expired, refreshing and retrying...');

      try {
        await refreshToken();
        const { spotifySession } = useUserStore.getState();
        const newAccessToken = spotifySession?.accessToken;

        if (newAccessToken) {
          // Retry the request with the new access token
          const retryResponse = await axios.get(
            `https://api.spotify.com/v1/tracks/${songId}`,
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          const { preview_url } = retryResponse.data;

          if (preview_url) {
            // Play the preview URL
            const audio = new Audio(preview_url);
            audio.play().then(() => {
              console.log('Playing preview after retry:', preview_url);
            }).catch(error => {
              console.error('Error playing preview after retry:', error);
            });
            return audio;
          } else {
            console.log('No preview URL available for this track after retry.');
            return null;
          }
        } else {
          console.error('Failed to retrieve new access token.');
          return null;
        }
      } catch (retryError) {
        console.error('Error refreshing the token or retrying the request:', retryError);
        return null;
      }
    } else {
      console.error('Error getting track details:', error);
      return null;
    }
  }
};

export default playSong;
