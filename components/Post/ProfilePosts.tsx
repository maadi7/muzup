import { Post } from "@/types/Post";
import Image from "next/image";
import React, { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import PostInfo from "./Modal/PostInfo";

interface ProfilePost {
  profilePost: Post;
}

const ProfilePosts: React.FC<ProfilePost> = ({ profilePost }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePostClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsModalOpen(true);
  };

  return (
    <div
      className="relative h-60 w-full overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handlePostClick}
    >
      <Image
        src={profilePost.img}
        alt={`${profilePost.caption}`}
        layout="fill"
        className="object-cover rounded-md transition-opacity group-hover:opacity-75"
      />

      {/* Overlay with likes and comments that appears on hover */}
      <div
        className={`absolute cursor-pointer inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-8 transition-opacity duration-200 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 text-white">
          <Heart fill="white" size={24} />
          <span className="text-lg font-semibold">
            {profilePost.likes?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-2 text-white">
          <MessageCircle fill="white" size={24} />
          <span className="text-lg font-semibold">
            {profilePost.comments?.length || 0}
          </span>
        </div>
      </div>
      <PostInfo
        post={profilePost}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePosts;
