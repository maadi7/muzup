import React, { useState, useEffect, useRef } from "react";
import { PostComment } from "@/types/Feed";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import noProfile from "../../../assets/noAvatar.webp";
import Image from "next/image";
import playSong from "@/utils/playSong";
import { useUserStore } from "@/lib/store";
import CommentComponent from "../../Comment/CommentComponent";

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

interface PostPopupProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

let currentAudioPost: HTMLAudioElement | null = null;

const PostInfo = ({ post, isOpen, onClose }: PostPopupProps) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [newComment, setNewComment] = useState("");
  const [postComments, setPostComments] = useState<Array<PostComment>>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isDebounced, setIsDebounced] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { spotifySession, user } = useUserStore();

  // Fetch all users
  useEffect(() => {
    const fetchAllUsers = async () => {
      const res = await axios.get(`${url}/api/user/all`);
      if (res.data) {
        setUsers(res.data);
      }
    };
    fetchAllUsers();
  }, [url]);

  // Reset page and fetch comments when modal is opened
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchComments(1);
    }
  }, [isOpen, post._id]);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        setIsPlaying(false);
      }
    };
  }, []);

  const fetchComments = async (pageNum: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `${url}/api/post/all/${post._id}?page=${pageNum}&limit=4`
      );
      if (pageNum === 1) {
        setPostComments(data.comments);
      } else {
        setPostComments((prevComments) => [...prevComments, ...data.comments]);
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

  const play = async () => {
    if (isDebounced) return;
    setIsDebounced(true);

    if (post?.songId && spotifySession?.accessToken) {
      if (currentAudioPost && currentAudioPost !== audioRef.current) {
        currentAudioPost.pause();
        currentAudioPost.src = "";
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

          audio.addEventListener("pause", () => setIsPlaying(false));
          audio.addEventListener("ended", () => setIsPlaying(false));
        } else {
          console.warn("No audio returned from playSong.");
        }
      } catch (error) {
        console.error("Error playing song:", error);
      } finally {
        setTimeout(() => setIsDebounced(false), 300);
      }
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

        const { data } = await axios.post(
          `${url}/api/post/${post._id}/comment`,
          commentData
        );
        setNewComment("");
        setPostComments((prevComments) => [data, ...prevComments]);
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-4xl h-5/6 flex overflow-hidden">
        <div className="w-1/2 h-full bg-black flex flex-col items-center justify-center relative">
          <img
            src={post.img}
            alt="Post"
            className="max-w-full max-h-full object-contain"
          />
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
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
                onDelete={() =>
                  setPostComments((prev) =>
                    prev.filter((c) => c._id !== comment._id)
                  )
                }
              />
            ))}
            {hasMore && (
              <button
                onClick={loadMoreComments}
                className="text-blue-500 hover:text-blue-700 font-semibold mt-2 w-full"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More Comments"}
              </button>
            )}
          </div>
          <form
            onSubmit={handleCommentSubmit}
            className="flex items-center p-4 border-t"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-grow p-2 rounded-lg border-2 border-gray-300 focus:border-gray-600 outline-none"
            />
            <button type="submit" className="ml-2 hover:text-primary">
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostInfo;
