// StoryView.tsx

import React, { useState, useRef, useEffect } from 'react';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon } from '@mui/icons-material';
import { useUserStore } from '../lib/store';
import playSong from "../utils/playSong";
import axios from 'axios';
import {  User } from '@/types/Feed';
import { useAudioContext } from '../context/AudioContext';

interface Story {
  _id: string;
  img: string;
  songId?: string;
  createdAt: string;
  updatedAt: string;
}

interface StoryGroup {
  _id: string;
  userId: string;
  username: string;
  stories: Story[];
  createdAt: string;
  __v: number;
}

interface StoryViewProps {
  storyGroup: StoryGroup;
  currentStoryIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const StoryView: React.FC<StoryViewProps> = ({ storyGroup, currentStoryIndex, onClose, onPrev, onNext }) => {
  const { stories } = storyGroup;
  const currentStory = stories[currentStoryIndex];
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { spotifySession } = useUserStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [visibleComments, setVisibleComments] = useState<{ [key: string]: boolean }>({});
  const [user, setUser] = useState<User | null>(null);
  const { stopAllAudio, currentAudio } = useAudioContext();

  useEffect(()=>{
    const fetchUser = async () => {
        try {
          const {data} = await axios.get(`${url}/api/user/?userId=${storyGroup.userId}`);
          setUser(data)
        } catch (error) {
          console.log(error);
        }
      }
      fetchUser();
  }, [storyGroup.userId]);

  useEffect(() => {
    const play = async () => {
      if (currentStory?.songId && spotifySession?.accessToken) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }

        const audio = await playSong(currentStory?.songId, spotifySession?.accessToken);
        if (audio) {
          audioRef.current = audio;
          audio.muted = isMuted;
        
        } else {
          console.warn('No audio returned from playSong.');
        }
      }
    };

    play();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [currentStory?.songId, spotifySession, currentStoryIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 20000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        clearInterval(timer);
        onNext();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [currentStoryIndex, onNext]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md h-[80vh] bg-white rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div
            className="bg-blue-500 h-full"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          ></div>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-16 text-white bg-gray-800 rounded-full p-2"
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </button>
        <img src={currentStory.img} alt="Story" className="w-full h-full object-cover" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-gray-800 rounded-full p-2"
        >
          <CloseIcon />
        </button>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-semibold">{user?.username}</h3>
        </div>
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2"
        >
          <ArrowBackIos />
        </button>
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-gray-800 bg-opacity-50 rounded-full p-2"
        >
          <ArrowForwardIos />
        </button>
      </div>
    </div>
  );
};

export { StoryView, type StoryGroup, type Story };