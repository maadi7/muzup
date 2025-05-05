import axios from "axios";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaEllipsisV, FaHeart, FaPaperPlane, FaRegHeart } from "react-icons/fa";
import MentionInput from "./MentionInput";
import ActionModal from "../Reusables/ActionModal";

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

const ReplyComponent: React.FC<{
  reply: Reply;
  postId: string;
  commentId: string;
  currentUser: User | null;
  users: User[];
  onDelete: () => void;
  setReplies: any;
}> = ({
  reply,
  postId,
  commentId,
  currentUser,
  users,
  onDelete,
  setReplies,
}) => {
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(reply.likes?.length || 0);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [nestedReplies, setNestedReplies] = useState<Reply[]>(
    reply.replies || []
  );
  const [showNestedReplies, setShowNestedReplies] = useState(false);

  useEffect(() => {
    if (currentUser?._id) {
      setIsLiked(reply.likes?.includes(currentUser._id));
    }
  }, [reply.likes, currentUser]);

  const handleLikeReply = async () => {
    if (!currentUser) return;
    try {
      await axios.put(
        `${url}/api/post/${postId}/comment/${commentId}/reply/${reply._id}/like`,
        {
          userId: currentUser._id,
        }
      );
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  const handleDeleteReply = async () => {
    try {
      await axios.delete(
        `${url}/api/post/${postId}/comment/${commentId}/reply/${reply._id}`,
        {
          data: { userId: currentUser?._id },
        }
      );
      onDelete();
      setIsActionModalOpen(false);
    } catch (error) {
      console.error("Error deleting reply:", error);
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
            replyingTo: commentId,
            parentComment: commentId,
            replyToId: reply._id,
          }
        );
        setReplies((prev: any) => [data, ...prev]);
        setReplyText("");
        setShowReplyInput(false);
      } catch (error) {
        console.error("Error adding nested reply:", error);
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
    return "just now";
  };

  return (
    <div className="ml-8 mt-2">
      <div className="flex items-start">
        <Link href={`/profile/${reply.userId}`}>
          <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
            <Image
              src={"/noAvatar.webp"}
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
              <span className="text-xs text-gray-500">
                {getTimeAgo(reply.createdAt)}
              </span>
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
                {showNestedReplies
                  ? "Hide Replies"
                  : `View ${nestedReplies.length} Replies`}
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
                  onDelete={() =>
                    setNestedReplies((prev) =>
                      prev.filter((r) => r._id !== nestedReply._id)
                    )
                  }
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

export default ReplyComponent;
