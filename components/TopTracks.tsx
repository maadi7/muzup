import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TopTracks() {
  const { data, error } = useSWR('/api/spotify/top-tracks', fetcher);

  if (error) return <div>Failed to load top tracks</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Top Tracks</h2>
      <ul>
        {data?.items?.map((track: { id: string; name: string }) => (
          <li key={track.id}>{track.name}</li>
        ))}
      </ul>
    </div>
  );
}
