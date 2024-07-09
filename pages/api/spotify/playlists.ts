// pages/api/spotify/playlists.ts

import { getSession } from 'next-auth/react';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = session.accessToken;

  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch playlists' });
  }

  const data = await response.json();
  res.status(200).json(data);
}
