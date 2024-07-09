// pages/api/spotify/recently-played.ts

import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = session.accessToken;

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recently played tracks');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    res.status(500).json({ error: 'Failed to fetch recently played tracks' });
  }
}
