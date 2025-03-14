import { FaEllipsisV, FaHeart, FaPaperPlane, FaRegHeart } from "react-icons/fa";
import ActionModal from "../Reusables/ActionModal";
import ReplyComponent from "./ReplyComment";
import MentionInput from "./MentionInput";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import { useEffect, useState } from "react";

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

const CommentComponent: React.FC<{
  comment: Comment;
  postId: string;
  onDelete: () => void;
  currentUser: User | null;
  users: User[];
}> = ({ comment, postId, onDelete, currentUser, users }) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [commentUser, setCommentUser] = useState<User | null>(null);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
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
        const { data } = await axios.get(
          `${url}/api/user/?userId=${comment.userId}`
        );
        setCommentUser(data);
        setIsLiked(comment.likes?.includes(currentUser?._id || ""));
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
        const { data } = await axios.post(
          `${url}/api/post/${postId}/comment/${comment._id}/reply`,
          {
            userId: currentUser._id,
            name: currentUser.username,
            text: replyText,
            replyingTo: comment._id,
            parentComment: comment._id,
            replyToId: null,
          }
        );
        setReplies((prev) => [data, ...prev]);
        setReplyText("");
        setShowReplyInput(false);
      } catch (error) {
        console.error("Error adding reply:", error);
      }
    }
  };

  const handleLikeComment = async () => {
    if (!currentUser) return;
    try {
      await axios.put(`${url}/api/post/${postId}/comment/${comment._id}/like`, {
        userId: currentUser._id,
      });
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await axios.delete(`${url}/api/post/${postId}/comment/${comment._id}`, {
        data: { userId: currentUser?._id },
      });
      onDelete();
      setIsActionModalOpen(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
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
    return "just now";
  };

  return (
    <div className="flex flex-col mb-4">
      <div className="flex items-start">
        <Link href={`/profile/${commentUser?._id}`}>
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <Image
              src={commentUser?.profilePic || "/noAvatar.webp"}
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
              <span className="font-semibold text-sm mr-2">
                {commentUser?.username}
              </span>
              <span className="text-xs text-gray-500">
                {getTimeAgo(comment.createdAt)}
              </span>
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
                {showReplies
                  ? "Hide Replies"
                  : `View ${replies.length} Replies`}
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
              onDelete={() =>
                setReplies((prev) => prev.filter((r) => r._id !== reply._id))
              }
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

export default CommentComponent;
