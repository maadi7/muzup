// components/RecentlyPlayed.tsx

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function RecentlyPlayed() {
  const { data, error } = useSWR('/api/spotify/recently-played', fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  if (!data.items || !Array.isArray(data.items)) return <div>No recently played tracks found</div>;

  return (
    <div>
      <h2>Your Recently Played Tracks</h2>
      <ul>
        {data.items.map((item: any) => (
          <li key={item.track.id}>
            <div>
              <img src={item.track.album.images[0].url} alt={item.track.name} width={50} />
            </div>
            <div>
              <p>{item.track.name}</p>
              <p>{item.track.artists[0].name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
