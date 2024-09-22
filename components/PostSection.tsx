import React, { useState, useEffect, useRef } from 'react';
import { Post, User, PostComment } from '@/types/Feed';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import noProfile from "../assets/noAvatar.webp";
import Image from 'next/image';
import playSong from "../utils/playSong"; 
import { useUserStore } from '../lib/store';
import { useAudioContext } from '../context/AudioContext';
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { formatDistanceToNow, differenceInHours, differenceInDays } from 'date-fns';
import Link from 'next/link';

let currentAudioPost: HTMLAudioElement | null = null;


const Comment = ({ comment }: { comment: PostComment }) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [commentUser, setCommentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${url}/api/user/?userId=${comment.id}`);
        setCommentUser(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [comment]);

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const commentDate = new Date(createdAt);
    const hours = differenceInHours(now, commentDate);
    const days = differenceInDays(now, commentDate);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'just now';
  };

  return (
    <div key={comment._id} className="flex items-start mb-6 border-b pb-3">
      <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
        <Image
          src={commentUser?.profilePic ? commentUser.profilePic : noProfile}
          alt="User"
          className="w-full h-full object-cover"
          width={40}
          height={40}
        />
      </div>
      <div className="flex flex-col flex-grow">
        <div className="flex items-center mb-1">
          <h4 className="font-semibold text-sm mr-2">{commentUser?.username}</h4>
          <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-700">{comment.text}</p>
      </div>
    </div>
  );
};

const PostSection = ({ post }: { post: Post }) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postComments, setPostComments] = useState<Array<PostComment>>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { spotifySession, user } = useUserStore();
  const { stopAllAudio, currentAudio } = useAudioContext();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);
  const [like, setLiked] = useState(post.likes.length);
  const [isLike, setIsLiked] = useState(false);


useEffect(()=>{
  if(user && post.likes.includes(user?._id)){
    setIsLiked(true);
  }else{
    setIsLiked(false)
  }
}, [post.likes])

  const LikeHandler = async () => {
    try{
        await axios.put(`${url}/api/post/${post._id}/like`, {userId: user?._id})
    }catch(err){
        console.log(err);
    }
    setLiked(isLike ? like - 1 : like + 1);
    setIsLiked(!isLike);
}

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${url}/api/user/?userId=${post.userId}`);
        setCurrentUser(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [post.userId]);

  const play = async () => {
    if (isDebounced) return;
    setIsDebounced(true);

    if (post?.songId && spotifySession?.accessToken) {
      if (currentAudioPost && currentAudioPost !== audioRef.current) {
        currentAudioPost.pause();
        currentAudioPost.src = ''; // Clean up the previous audio's src
        currentAudioPost = null; // Clear the reference
      }

      try {
        const audio = await playSong(post.songId, spotifySession.accessToken);
        if (audio) {
          audioRef.current = audio;
          audio.loop = true;
          audio.muted = isMuted;
          currentAudioPost = audio; // Set current audio reference
          audio.play();
          setIsPlaying(true);

          audio.addEventListener('pause', () => setIsPlaying(false));
          audio.addEventListener('ended', () => setIsPlaying(false)); // Handle end of track
        } else {
          console.warn('No audio returned from playSong.');
        }
      } catch (error) {
        console.error('Error playing song:', error);
      } finally {
        setTimeout(() => setIsDebounced(false), 300); // Adjust debounce delay as needed
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

  const openModal = () => {
    setIsModalOpen(true);
    setPage(1);
    fetchComments(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchComments = async (pageNum: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${url}/api/post/all/${post._id}?page=${pageNum}&limit=4`);
      if (pageNum === 1) {
        setPostComments(data.comments);
      } else {
        setPostComments(prevComments => [...prevComments, ...data.comments]);
      }
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreComments = () => {
    if (!isLoading && hasMore) {
      fetchComments(page + 1);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        console.log(user?.username);
        const { data } = await axios.post(`${url}/api/post/${post._id}/comment`, {
          id: user?._id,
          name: user?.username,
          text: newComment,
        });
        setNewComment('');
        setPostComments(prevComments => [data, ...prevComments]);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  return (
    <div className="mb-6 border-b pb-4 ">
      <div className="flex items-center mb-4">
        <Link href={`/profile/${currentUser?._id}`} >
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={currentUser?.profilePic ? currentUser.profilePic : noProfile}
            alt="User"
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        </div>
        </Link>
        <div className="ml-4">
          <h3 className="font-semibold font-nunito">{currentUser?.username}</h3>
        </div>
      </div>

      <div className="relative">
        <img src={post.img} alt="Post" className="w-full h-full mb-4 rounded-lg object-cover" />
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
            <button className="mr-1" onClick={LikeHandler} >
            {isLike ? <FavoriteIcon style={{ color: 'red' }} /> : <FavoriteBorderOutlinedIcon />}
            </button>
            <span>{like}</span>
          </div>
          <div className="flex items-center cursor-pointer" onClick={openModal}>
            <button className="mr-1">
              <CommentIcon />
            </button>
            <span>{post.comments && post.comments.length}</span>
          </div>
        </div>
        <div className="flex items-center ml-auto">
          <button>
            <ShareIcon />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-4xl h-5/6 flex overflow-hidden">
            <div className="w-1/2 h-full bg-black flex flex-col items-center justify-center relative">
              <img src={post.img} alt="Post" className="max-w-full max-h-full object-contain" />
              {post.songId && (
                <div className="absolute bottom-4 right-4">
                  <button 
                    onClick={isPlaying ? () => audioRef.current?.pause() : play} 
                    className="bg-white p-2 rounded-full shadow-lg"
                  >
                    {isPlaying ? <VolumeUpIcon /> : <VolumeOffIcon />}
                  </button>
                </div>
              )}
            </div>
            <div className="w-1/2 h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <div className='flex' >

                <div className='w-8 h-8 rounded-full overflow-hidden mr-3' >

                <Image src={user.profilePic} width={30} height={30} alt='profile' 
          className="w-full h-full object-cover" />
          </div>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
          </div>
                <button onClick={closeModal}>
                  <CloseIcon />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-4">
                {postComments.map((comment) => (
                  <Comment key={comment._id} comment={comment} />
                ))}
                {hasMore && (
                  <button
                    onClick={loadMoreComments}
                    className="text-blue-500 hover:text-blue-700 font-semibold mt-2 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Comments'}
                  </button>
                )}
              </div>
              <form onSubmit={handleCommentSubmit} className="flex items-center p-4 border-t">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow p-2 rounded-lg border-2 border-gray-300 focus:border-gray-600 outline-none"
                />
                <button
                  type="submit"
                  className="ml-2 hover:text-primary"
                >
                  <SendIcon/>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
  
export default PostSection;
