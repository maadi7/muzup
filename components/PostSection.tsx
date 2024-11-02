import React, { useState, useEffect, useRef } from 'react';
import {  PostComment } from '@/types/Feed';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { FaHeart, FaRegHeart, FaEllipsisV, FaPaperPlane } from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import noProfile from "../assets/noAvatar.webp";
import Image from 'next/image';
import playSong from "../utils/playSong"; 
import { useUserStore } from '../lib/store';
import SendIcon from '@mui/icons-material/Send';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { differenceInHours, differenceInDays, differenceInMinutes } from 'date-fns';
import Link from 'next/link';



interface User {
  _id: string;
  username: string;
  profilePic?: string;
}

interface Reply {
  _id: string;
  userId: string;
  name: string;
  text: string;
  likes: string[];
  replies: Reply[];    
  createdAt: string;
}

interface Comment {
  _id: string;
  userId: string;
  name: string;
  text: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
}

interface Post {
  _id: string;
  userId: string;
  caption: string;
  img: string;
  likes: string[];
  songId?: string;
  comments: Comment[];
}

let currentAudioPost: HTMLAudioElement | null = null;


const ReplyComponent: React.FC<{
  reply: Reply;
  postId: string;
  commentId: string;
  currentUser: User | null;
  users: User[];
  onDelete: () => void;
  setReplies: any
}> = ({ reply, postId, commentId, currentUser, users, onDelete, setReplies }) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reply.likes?.length || 0);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [nestedReplies, setNestedReplies] = useState<Reply[]>(reply.replies || []);
  const [showNestedReplies, setShowNestedReplies] = useState(false);

  useEffect(() => {
    if(currentUser?._id){
      setIsLiked(reply.likes?.includes(currentUser._id));
    }
  }, [reply.likes, currentUser]); 

  const handleLikeReply = async () => {
    if (!currentUser) return;
    try {
      await axios.put(`${url}/api/post/${postId}/comment/${commentId}/reply/${reply._id}/like`, {
        userId: currentUser._id
      });
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const handleDeleteReply = async () => {
    try {
      await axios.delete(`${url}/api/post/${postId}/comment/${commentId}/reply/${reply._id}`, {
        data: { userId: currentUser?._id }
      });
      onDelete();
      setIsActionModalOpen(false);
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleNestedReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && currentUser) {
      try {
        const { data } = await axios.post(
          `${url}/api/post/${postId}/comment/${commentId}/reply`,
          {
            userId: currentUser._id,
            name: currentUser.username,
            text: replyText,
            replyingTo:commentId,
            parentComment:commentId,
            replyToId: reply._id,
          
          }
        );
        setReplies(prev => [data, ...prev]);
        setReplyText('');
        setShowReplyInput(false);
      } catch (error) {
        console.error('Error adding nested reply:', error);
      }
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const date = new Date(createdAt);
    const days = differenceInDays(now, date);
    const hours = differenceInHours(now, date);
    const mins = differenceInMinutes(now, date);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (mins > 0) return `${mins}m`;
    return 'just now';
  };

  return (
    <div className="ml-8 mt-2">
      <div className="flex items-start">
        <Link href={`/profile/${reply.userId}`}>
          <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
            <Image
              src={'/noAvatar.webp'}
              alt="User"
              className="w-full h-full object-cover"
              width={24}
              height={24}
            />
          </div>
        </Link>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-semibold text-xs mr-2">{reply.name}</span>
              <span className="text-xs text-gray-500">{getTimeAgo(reply.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handleLikeReply}>
                {isLiked ? (
                  <FaHeart className="text-red-500 text-xs" />
                ) : (
                  <FaRegHeart className="text-xs" />
                )}
              </button>
              <span className="text-xs">{likeCount}</span>
              <button onClick={() => setIsActionModalOpen(true)}>
                <FaEllipsisV className="text-xs" />
              </button>
            </div>
          </div>
          <p className="text-xs mt-1">{reply.text}</p>
          <div className="flex items-center mt-1 space-x-4">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Reply
            </button>
            {nestedReplies.length > 0 && (
              <button
                onClick={() => setShowNestedReplies(!showNestedReplies)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {showNestedReplies ? 'Hide Replies' : `View ${nestedReplies.length} Replies`}
              </button>
            )}
          </div>
          
          {showReplyInput && (
            <form onSubmit={handleNestedReplySubmit} className="mt-2">
             <MentionInput
  value={replyText}
  onChange={setReplyText}
  users={users}
  placeholder="Write a reply..."
  initialMention={reply.name}
/>
              <button
                type="submit"
                className="mt-2 text-blue-500 hover:text-blue-600"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>
          )}

          {showNestedReplies && nestedReplies.length > 0 && (
            <div className="mt-2">
              {nestedReplies.map((nestedReply) => (
                <ReplyComponent
                  key={nestedReply._id}
                  reply={nestedReply}
                  postId={postId}
                  commentId={commentId}
                  currentUser={currentUser}
                  users={users}
                  onDelete={() => setNestedReplies(prev => prev.filter(r => r._id !== nestedReply._id))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onDelete={handleDeleteReply}
        onReport={() => {}}
        isOwner={currentUser?._id === reply.userId}
      />
    </div>
  );
};

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  users: User[];
  placeholder: string;
  initialMention?: string;
}


const MentionInput: React.FC<MentionInputProps> = ({ 
  value, 
  onChange, 
  users, 
  placeholder,
  initialMention 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Initialize input with @mention if provided
  useEffect(() => {
    if (initialMention && !inputValue) {
      setInputValue(`@${initialMention} `);
      onChange(`@${initialMention} `);
    }
  }, [initialMention]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Handle mentions suggestions
    const lastWord = newValue.split(' ').pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      const query = lastWord.slice(1).toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectUser = (username: string) => {
    const words = inputValue.split(' ');
    words[words.length - 1] = `@${username} `;
    const newValue = words.join(' ');
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg border-2 border-gray-300 focus:border-gray-600 outline-none"
      />
      {showSuggestions && filteredUsers.length > 0 && (
        <div className="absolute left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg z-10">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectUser(user.username)}
            >
              @{user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const ActionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  isOwner: boolean;
}> = ({ isOpen, onClose, onDelete, onReport, isOwner }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-80 overflow-hidden">
        {isOwner ? (
          <>
            <button
              onClick={onDelete}
              className="w-full p-4 text-red-500 hover:bg-gray-100 text-left"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="w-full p-4 text-gray-700 hover:bg-gray-100 text-left border-t"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onReport}
              className="w-full p-4 text-red-500 hover:bg-gray-100 text-left"
            >
              Report
            </button>
            <button
              onClick={onClose}
              className="w-full p-4 text-gray-700 hover:bg-gray-100 text-left border-t"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const CommentComponent: React.FC<{
  comment: Comment;
  postId: string;
  onDelete: () => void;
  currentUser: User | null;
  users: User[];
}> = ({ comment, postId, onDelete, currentUser, users }) => {
  console.log(comment._id)
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [commentUser, setCommentUser] = useState<User | null>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<Reply[]>(comment.replies || []);
  const [showReplies, setShowReplies] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes?.length || 0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${url}/api/user/?userId=${comment.userId}`);
        setCommentUser(data);
        setIsLiked(comment.likes?.includes(currentUser?._id || ''));
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, [comment.userId, currentUser]);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim() && currentUser) {
      try {
        const { data } = await axios.post(`${url}/api/post/${postId}/comment/${comment._id}/reply`, {
          userId: currentUser._id,
          name: currentUser.username,
          text: replyText,
          replyingTo:comment._id,
            parentComment:comment._id,
            replyToId: null,
        });
        setReplies(prev => [data, ...prev]);
        setReplyText('');
        setShowReplyInput(false);
      } catch (error) {
        console.error('Error adding reply:', error);
      }
    }
  };

  const handleLikeComment = async () => {
    if (!currentUser) return;
    try {
      await axios.put(`${url}/api/post/${postId}/comment/${comment._id}/like`, {
        userId: currentUser._id
      });
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`${url}/api/post/${postId}/comment/${comment._id}`, {
        data: { userId: currentUser?._id }
      });
      onDelete();
      setIsActionModalOpen(false);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const now = new Date();
    const date = new Date(createdAt);
    const days = differenceInDays(now, date);
    const hours = differenceInHours(now, date);
    const mins = differenceInMinutes(now, date);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (mins > 0) return `${mins}m`;
    return 'just now';
  };

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-start">
        <Link href={`/profile/${commentUser?._id}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <Image
              src={commentUser?.profilePic || '/noAvatar.webp'}
              alt="User"
              className="w-full h-full object-cover"
              width={32}
              height={32}
            />
          </div>
        </Link>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-semibold text-sm mr-2">{commentUser?.username}</span>
              <span className="text-xs text-gray-500">{getTimeAgo(comment.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={handleLikeComment}>
                {isLiked ? (
                  <FaHeart className="text-red-500 text-sm" />
                ) : (
                  <FaRegHeart className="text-sm" />
                )}
              </button>
              <span className="text-sm">{likeCount}</span>
              <button onClick={() => setIsActionModalOpen(true)}>
                <FaEllipsisV className="text-sm" />
              </button>
            </div>
          </div>
          <p className="text-sm my-1">{comment.text}</p>
          <div className="flex items-center mt-1 space-x-4">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Reply
            </button>
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {showReplies ? 'Hide Replies' : `View ${replies.length} Replies`}
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyInput && (
        <form onSubmit={handleReplySubmit} className="mt-2 ml-11">
          <MentionInput
            value={replyText}
            onChange={setReplyText}
            users={users}
            placeholder="Write a reply..."
            initialMention={comment.name}
          />
          <button
            type="submit"
            className="mt-2 text-blue-500 hover:text-blue-600"
          >
            <FaPaperPlane />
          </button>
        </form>
      )}

{showReplies && replies.length > 0 && (
        <div className="ml-11 mt-2">
          {replies.map((reply) => (
            <ReplyComponent
              key={reply._id}
              reply={reply}
              postId={postId}
              commentId={comment._id}
              currentUser={currentUser}
              users={users}
              onDelete={() => setReplies(prev => prev.filter(r => r._id !== reply._id))}
              setReplies={setReplies}
            />
          ))}
        </div>
      )}

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onDelete={handleDeleteComment}
        onReport={() => {}}
        isOwner={currentUser?._id === comment.userId}
      />
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);
  const [like, setLiked] = useState(post.likes.length);
  const [isLike, setIsLiked] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(()=>{
    const fetchAllUsers = async () =>{
      const res = await axios.get(`${url}/api/user/all`)
      if(res.data){
        setUsers(res.data)
      }
    }
    fetchAllUsers()
  }, [])

  useEffect(()=>{
    if(user && post.likes.includes(user?._id)){
      setIsLiked(true);
    }else{
      setIsLiked(false)
    }
  }, [post.likes, user])

  const LikeHandler = async () => {
    try{
      await axios.put(`${url}/api/post/${post._id}/like`, {userId: user?._id})
      setLiked(isLike ? like - 1 : like + 1);
      setIsLiked(!isLike);
    }catch(err){
      console.log(err);
    }
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
        currentAudioPost.src = '';
        currentAudioPost = null;
      }

      try {
        const audio = await playSong(post.songId, spotifySession.accessToken);
        if (audio) {
          audioRef.current = audio;
          audio.loop = true;
          audio.muted = isMuted;
          currentAudioPost = audio;
          audio.play();
          setIsPlaying(true);

          audio.addEventListener('pause', () => setIsPlaying(false));
          audio.addEventListener('ended', () => setIsPlaying(false));
        } else {
          console.warn('No audio returned from playSong.');
        }
      } catch (error) {
        console.error('Error playing song:', error);
      } finally {
        setTimeout(() => setIsDebounced(false), 300);
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
        const commentData = {
          id: user?._id,
          name: user?.username,
          text: newComment,
        
        };
  
        const { data } = await axios.post(`${url}/api/post/${post._id}/comment`, commentData);
        setNewComment('');
        setPostComments(prevComments => [data, ...prevComments]);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  return (
    <div className="mb-6 border-b pb-4">
      <div className="flex items-center mb-4">
        <Link href={`/profile/${currentUser?._id}`}>
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
            <button className="mr-1" onClick={LikeHandler}>
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
                <div className="flex">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                    <Image 
                      src={user?.profilePic || noProfile} 
                      width={30} 
                      height={30} 
                      alt="profile"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <h2 className="text-xl font-semibold">{user?.username}</h2>
                </div>
                <button onClick={closeModal}>
                  <CloseIcon />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-4">
                {postComments.map((comment) => (
                  <CommentComponent 
                    key={comment._id} 
                    comment={comment}
                    currentUser={user}
                    users={users}
                    postId={post._id}
                    onDelete={() => setPostComments(prev => prev.filter(c => c._id !== comment._id))}
                  />
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
                  <SendIcon />
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