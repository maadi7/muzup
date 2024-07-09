import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getUserTopArtists } from '../../../utils/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = session.accessToken;
  try {
    const topArtists = await getUserTopArtists(accessToken as string);
    res.status(200).json(topArtists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top artists' });
  }
}
