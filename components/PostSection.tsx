import React, { useState, useEffect, useRef } from 'react';
import { Post, User } from '@/types/Feed';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import axios from 'axios';
import noProfile from "../assets/noAvatar.webp";
import Image from 'next/image';
import playSong from "../utils/playSong"; 
import { useUserStore } from '../lib/store';
import { useAudioContext } from '../context/AudioContext';
import SendIcon from '@mui/icons-material/Send';

let currentAudioPost: HTMLAudioElement | null = null;

const Comment = () => {

}

const PostSection = ({ post }: { post: Post }) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [user, setUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newComment, setNewComment] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { spotifySession } = useUserStore();
  const [visibleComments, setVisibleComments] = useState<{ [key: string]: boolean }>({});
  const { stopAllAudio, currentAudio } = useAudioContext();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${url}/api/user/?userId=${post.userId}`);
        setUser(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [post.userId]);

  const play = async () => {
    if (post?.songId && spotifySession?.accessToken) {
      if (currentAudioPost && currentAudioPost !== audioRef.current) {
        currentAudioPost.pause();
      }

      const audio = await playSong(post.songId, spotifySession.accessToken);
      if (audio) {
        audioRef.current = audio;
        audio.loop = true;
        audio.muted = isMuted;
        currentAudioPost = audio;
        audio.play();
        setIsPlaying(true);

        audio.addEventListener('pause', () => setIsPlaying(false));
      } else {
        console.warn('No audio returned from playSong.');
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        setIsPlaying(false);
      }
    };
  }, []);

  const toggleComments = (postId: string) => {
    setVisibleComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        await axios.post(`${url}/api/post/${post._id}/comment`, {
          id: user?._id,
          name:user?.username,
          text: newComment,
        });
        setNewComment('');
        // Optionally, fetch the updated comments here
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={user?.profilePic ? user.profilePic : noProfile}
            alt="User"
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        </div>
        <div className="ml-4">
          <h3 className="font-semibold font-nunito">{user?.username}</h3>
        </div>
      </div>

      <div className="relative">
        <img src={post.img} alt="Post" className="w-full mb-4 rounded-lg object-cover" />
        {post.songId && (
          <button 
            onClick={isPlaying ? () => audioRef.current?.pause() : play} 
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-lg"
          >
            {isPlaying ? <VolumeUpIcon /> : <VolumeOffIcon />}
          </button>
        )}
      </div>

      <p className="mb-4 font-raleway font-bold">{post.caption}</p>

      <div className="flex items-center mb-4">
        <div className="flex gap-x-4 items-center flex-grow">
          <div className="flex items-center">
            <button className="mr-1">
              <FavoriteIcon />
            </button>
            <span>{post.likes?.length}</span>
          </div>
          <div className="flex items-center cursor-pointer">
            <button className="mr-1" onClick={() => toggleComments(post._id)}>
              <CommentIcon />
            </button>
            <span onClick={() => toggleComments(post._id)}>
              {post.comments && post.comments.length}
            </span>
          </div>
        </div>
        <div className="flex items-center ml-auto">
          <button>
            <ShareIcon />
          </button>
        </div>
      </div>

      {visibleComments[post._id] && (
        <div className="py-4 px-2 rounded-lg mt-4">
          {post.comments && post.comments.map((comment) => (
            <div key={comment.id} className="flex items-center mb-5">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                <Image
                  src={user?.profilePic ? user.profilePic : noProfile}
                  alt="User"
                  className="w-full h-full object-cover"
                  width={30}
                  height={30}
                />
              </div>
              <div className="flex flex-col">
                <h4 className="font-semibold text-sm">{comment.name}</h4>
                <p className="text-sm text-gray-700">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleCommentSubmit} className="flex items-center mt-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow p-2 rounded-lg border-b-2 border-gray-300 focus:border-gray-600 outline-none"
        />
        <button
          type="submit"
          className="ml-2 hover:text-primary mt-1"
        >
          <SendIcon/>
        </button>
      </form>
    </div>
  );
};

export default PostSection;
