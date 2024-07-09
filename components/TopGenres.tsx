// components/TopGenres.tsx

import { useSession } from 'next-auth/react';
import useSWR from 'swr';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
};

const TopGenres = () => {
  const { data: session } = useSession();
  const { data: genres, error } = useSWR('/api/spotify/top-genres', fetcher);

  if (error) return <div>Error loading genres</div>;
  if (!session) return <div>Please sign in</div>;

  return (
    <div>
      <h2>Your Top Genres</h2>
      {genres ? (
        <ul>
          {genres.map((genre: { genre: string; count: number }) => (
            <li key={genre.genre}>
              {genre.genre} ({genre.count})
            </li>
          ))}
        </ul>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default TopGenres;
