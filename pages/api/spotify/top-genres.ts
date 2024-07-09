// pages/api/spotify/top-genres.ts

import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = session.accessToken;

  try {
    // Fetch the user's top genres from Spotify
    const response = await fetch('https://api.spotify.com/v1/me/top/artists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch top genres');
    }

    const data = await response.json();
    
    // Extract genres from the response
    const genres = data.items.map((artist: any) => artist.genres).flat();

    // Count occurrences of each genre
    const genreCount = genres.reduce((acc: any, genre: string) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    // Convert genreCount to an array of objects for easier manipulation
    const genreArray = Object.keys(genreCount).map((genre) => ({
      genre,
      count: genreCount[genre],
    }));

    // Sort genres by count (descending)
    genreArray.sort((a, b) => b.count - a.count);

    res.status(200).json(genreArray);
  } catch (error) {
    console.error('Error fetching top genres:', error);
    res.status(500).json({ error: 'Failed to fetch top genres' });
  }
}
