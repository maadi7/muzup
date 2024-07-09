// components/Playlists.tsx

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Playlists() {
  const { data, error } = useSWR('/api/spotify/playlists', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  if (!data.items || !Array.isArray(data.items)) return <div>No playlists found</div>;
  {console.log(data)}

  return (
    <div>
      <h2>Your Playlists</h2>
      <ul>
        {data.items.map((playlist: { id: string; name: string }) => (
          <li key={playlist.id}>{playlist.name}</li>
        ))}
      </ul>
    </div>
  );
}
