import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUserStore } from './store';
import refreshToken from '../pages/api/refreshToken';
import { Modal, Box, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Typography } from '@mui/material';
import { PlayArrow, Pause, Add } from '@mui/icons-material';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  preview_url?: string;
}

interface SongSearchProps {
  onSelectSong: (track: Track) => void;
}

const SongSearch: React.FC<SongSearchProps> = ({ onSelectSong }) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Track[]>([]);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { spotifySession } = useUserStore();

  useEffect(() => {
    if (!query) return;

    const searchSongs = async () => {
      try {
        // First, check if the token is expired and refresh it if necessary
        if (spotifySession && new Date(spotifySession.expiresAt) < new Date()) {
          console.log('Token expired, refreshing...');
          await refreshToken();
        }
    
        // After potential refresh, attempt to make the request
        const { data } = await axios.get('https://api.spotify.com/v1/search', {
          headers: {
            Authorization: `Bearer ${spotifySession?.accessToken}`,
          },
          params: {
            q: query,
            type: 'track',
            limit: 10,
          },
        });
    
        // If successful, update the results state
        setResults(data.tracks.items);
    
      } catch (error) {
        if (error.response?.status === 401) {
          console.error('Access token expired, refreshing and retrying...');
          await refreshToken();
          
          // Retry the search after refreshing the token
          try {
            const { data } = await axios.get('https://api.spotify.com/v1/search', {
              headers: {
                Authorization: `Bearer ${spotifySession?.accessToken}`,
              },
              params: {
                q: query,
                type: 'track',
                limit: 10,
              },
            });
            setResults(data.tracks.items);
          } catch (retryError) {
            console.error('Error searching songs after token refresh:', retryError);
          }
        } else {
          console.error('Error searching songs:', error);
        }
      }
    };
    

    const debounce = setTimeout(() => {
      searchSongs();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, spotifySession]);

  const handlePlayPreview = (track: Track) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (track.preview_url) {
      if (track.id === playingTrack) {
        // Toggle play/pause for the same track
        if (isPlaying) {
          audioRef.current?.pause();
          setIsPlaying(false);
        } else {
          audioRef.current?.play();
          setIsPlaying(true);
        }
      } else {
        // Play a new track
        audioRef.current = new Audio(track.preview_url);
        setPlayingTrack(track.id);
        setIsPlaying(true);
        audioRef.current.play();

        audioRef.current.onended = () => {
          // Replay the track when it ends
          audioRef.current?.play();
        };
      }
    }
  };

  const handleSelectSong = (track: Track) => {
    onSelectSong(track);
    setIsModalOpen(false);
  };

  return (
    <>
      <IconButton onClick={() => setIsModalOpen(true)}>
        <Add />
      </IconButton>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="song-search-modal"
        aria-describedby="search-for-songs-to-add"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}>
          <Typography variant="h6" component="h2" gutterBottom className='font-raleway'>
            Search for a Song
          </Typography>
          <TextField
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a song..."
            variant="outlined"
            margin="normal"
          />
          <List>
            {results.map((track) => (
              <ListItem
                key={track.id}
                secondaryAction={
                  <>
                    {track.preview_url && (
                      <IconButton edge="end" aria-label="play/pause" onClick={() => handlePlayPreview(track)}>
                        {playingTrack === track.id && isPlaying ? <Pause /> : <PlayArrow />}
                      </IconButton>
                    )}
                    <IconButton edge="end" aria-label="add" onClick={() => handleSelectSong(track)}>
                      <Add />
                    </IconButton>
                  </>
                }
              >
                <ListItemAvatar>
                  <Avatar alt={track.name} src={track.album.images[0].url} />
                </ListItemAvatar>
                <ListItemText
                  primary={track.name}
                  secondary={track.artists.map(artist => artist.name).join(', ')}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </>
  );
};

export default SongSearch;