import React, { useState, useEffect, useRef } from "react";
import { PostComment } from "@/types/Feed";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { FaHeart, FaRegHeart, FaEllipsisV, FaPaperPlane } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import noProfile from "../assets/noAvatar.webp";
import Image from "next/image";
import playSong from "../utils/playSong";
import { useUserStore } from "../lib/store";
import SendIcon from "@mui/icons-material/Send";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import {
  differenceInHours,
  differenceInDays,
  differenceInMinutes,
} from "date-fns";
import Link from "next/link";
import LikeInfo from "./Post/Modal/LikeInfo";
import ActionModal from "./Reusables/ActionModal";
import MentionInput from "./Comment/MentionInput";
import ReplyComponent from "./Comment/ReplyComment";
import CommentComponent from "./Comment/CommentComponent";
import PostPopupModal from "./Post/Modal/PostInfo";
import PostInfo from "./Post/Modal/PostInfo";

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

const PostSection = ({ post }: { post: Post }) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newComment, setNewComment] = useState("");
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
  // const [showLikeModal, setShowLikeModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const res = await axios.get(`${url}/api/user/all`);
      if (res.data) {
        setUsers(res.data);
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (user && post.likes.includes(user?._id)) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [post.likes, user]);

  const LikeHandler = async () => {
    try {
      await axios.put(`${url}/api/post/${post._id}/like`, {
        userId: user?._id,
      });
      setLiked(isLike ? like - 1 : like + 1);
      setIsLiked(!isLike);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${url}/api/user/?userId=${post.userId}`
        );
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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
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
        <Image
          src={post.img}
          alt="Post"
          className="w-full h-[500px] mb-4 rounded-lg object-contain bg-black z-10"
          height={500}
          width={500}
        />
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
              {isLike ? (
                <FavoriteIcon style={{ color: "red" }} />
              ) : (
                <FavoriteBorderOutlinedIcon />
              )}
            </button>
            <span className="cursor-pointer" onClick={() => setIsOpen(true)}>
              {like}
            </span>
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

      <LikeInfo userIds={post.likes} isOpen={isOpen} setIsOpen={setIsOpen} />

      <PostInfo
        post={post}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default PostSection;
