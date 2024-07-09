import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Artist = {
  id: string;
  name: string;
};

type TopArtistsResponse = {
  items: Artist[];
};

export default function TopArtists() {
  const { data, error } = useSWR<TopArtistsResponse>('/api/spotify/top-artists', fetcher);

  if (error) return <div>Failed to load top artists</div>;
  if (!data) return <div>Loading...</div>;

  console.log('Top Artists Data:', data);

  return (
    <div>
      <h2>Your Top Artists</h2>
      <ul>
        {data?.items?.map((artist) => (
          <li key={artist.id}>{artist.name}</li>
        ))}
      </ul>
    </div>
  );
}
