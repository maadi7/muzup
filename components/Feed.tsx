// Feed.tsx
import React, { useState, useRef, useEffect } from "react";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SongSearch from "@/lib/SongSearch";
import { useUserStore } from "../lib/store";
import { Post } from "../types/Feed";
import PostSection from "./PostSection";
import axios from "axios";
import { StoryView, StoryGroup } from "./StoryView";
import Loader from "./Loader";
import { useAudioContext } from "../context/AudioContext"; // Import the hook

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

const Feed: React.FC = () => {
  const [visibleComments, setVisibleComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [newPost, setNewPost] = useState<{
    img: string;
    caption: string;
    song?: Track | null;
  }>({ img: "", caption: "", song: null });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedSong, setSelectedSong] = useState<Track | null>(null);
  const [allPost, setAllPost] = useState<Array<Post> | []>([]);
  const [allStory, setAllStory] = useState<Array<StoryGroup> | []>([]);
  const [profilePics, setProfilePics] = useState<{ [key: string]: string }>({});
  const { user } = useUserStore();
  const [openStoryGroupIndex, setOpenStoryGroupIndex] = useState<number | null>(
    null
  );
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;

  const { stopAllAudio, currentAudio } = useAudioContext(); // Get stopAllAudio from context

  useEffect(() => {
    const getAllTimelinePosts = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5555/api/post/timeline/${user?._id}`
        );
        setAllPost(data);
      } catch (error) {
        console.log(error);
      }
    };
    getAllTimelinePosts();
  }, [user?._id]);

  useEffect(() => {
    const getAllTimelineStories = async () => {
      try {
        const { data } = await axios.get(
          `${url}/api/story/following/${user?._id}`
        );
        setAllStory(data);

        // Fetch profile pictures for each user
        const profilePicRequests = data.map(async (storyGroup: StoryGroup) => {
          const userId = storyGroup.userId; // Adjust this if the userId field is named differently
          const { data } = await axios.get(`${url}/api/user/?userId=${userId}`);
          return { userId, profilePic: data.profilePic };
        });

        const profilePicsData = await Promise.all(profilePicRequests);
        const profilePicsMap = profilePicsData.reduce((acc, curr) => {
          acc[curr.userId] = curr.profilePic;
          return acc;
        }, {} as { [key: string]: string });

        setProfilePics(profilePicsMap);
      } catch (error) {
        console.log(error);
      }
    };
    getAllTimelineStories();
  }, [user?._id]);

  const handleSelectSong = (song: Track) => {
    setSelectedSong(song);
    console.log(song);
  };

  const handlePostSubmit = async () => {
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "MuzupApp");

      setLoading(true);

      try {
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dnl96eqgs/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        console.log(data);

        // Use the Cloudinary URL and explicitly pass the songId
        const postData = {
          userId: user?._id,
          caption: newPost.caption,
          img: data.secure_url, // Ensure the Cloudinary URL is used
          songId: selectedSong?.id || "", // Explicitly pass the selected song's ID
        };

        try {
          const { data: postResponse } = await axios.post(
            `${url}/api/post`,
            postData
          );
          console.log(postResponse);
          toast.success("Post submitted successfully!");
        } catch (error) {
          toast.error(error?.message);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error uploading image. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    console.log("New Post:", newPost);
    setNewPost({ img: "", caption: "", song: null });
    setSelectedSong(null); // Clear selected song after submission
  };

  const removeImage = () => {
    setNewPost({ ...newPost, img: "" });
    setImageFile(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setNewPost({
        ...newPost,
        img: URL.createObjectURL(file),
      });
    }
  };

  const openStoryView = (index: number) => {
    stopAllAudio(); // Stop any playing audio

    setOpenStoryGroupIndex(index);
    setCurrentStoryIndex(0);
  };

  const closeStoryView = () => {
    setOpenStoryGroupIndex(null);
  };

  const goToPrevStory = () => {
    setCurrentStoryIndex((prevIndex) => {
      if (prevIndex > 0) {
        return prevIndex - 1;
      } else {
        return 0;
      }
    });
  };

  const goToNextStory = () => {
    setCurrentStoryIndex((prevIndex) => {
      const storyGroup =
        openStoryGroupIndex !== null ? allStory[openStoryGroupIndex] : null;
      if (storyGroup && prevIndex < storyGroup.stories.length - 1) {
        return prevIndex + 1;
      } else {
        closeStoryView();
        return prevIndex;
      }
    });
  };

  return (
    <div className="w-full">
      {/* Profile Section with Stories */}
      {/* <div className="py-4 px-12 relative">
        <button
          className="absolute left-8 top-14 transform -translate-y-1/2"
          onClick={scrollLeft}
        >
          <ArrowBackIos />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-x-4 overflow-x-hidden z-10"
        >
          {allStory.map((storyGroup, index) => (
            <div key={storyGroup._id} className="flex flex-col items-center mb-6">
              <div 
                className="w-20 h-20 rounded-full overflow-hidden cursor-pointer"
                onClick={() => openStoryView(index)}
              >
                <img
                  src={profilePics[storyGroup.userId] || '/default-avatar.png'}  // Use fetched profilePic or a default image
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-sm font-semibold font-raleway">{storyGroup.username}</h2>
              </div>
            </div>
          ))}
        </div>
        <button
          className="absolute right-6 top-14 transform -translate-y-1/2"
          onClick={scrollRight}
        >
          <ArrowForwardIos />
        </button>
      </div> */}

      {/* Post Creation Section */}
      <div className="px-16 mb-6 py-10">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 font-raleway">
            Create a New Post
          </h3>
          <textarea
            placeholder="Write a caption..."
            value={newPost.caption}
            onChange={(e) =>
              setNewPost({ ...newPost, caption: e.target.value })
            }
            className="w-full h-32 p-2 border rounded-lg mb-4"
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-200 p-2 rounded-lg w-full mb-4 font-nunito"
          >
            Upload Image
          </button>

          {newPost.img && (
            <div className="relative mb-4">
              <img
                src={newPost.img}
                alt="Preview"
                className="w-full h-[400px] object-cover rounded-lg"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-gray-200 p-1 rounded-full"
              >
                <CloseIcon />
              </button>
            </div>
          )}
          <SongSearch onSelectSong={handleSelectSong} />
          {selectedSong && (
            <div>
              <h4 className="font-raleway font-bold">Selected Song:</h4>
              <p className="font-nunito mt-1 font-semibold">
                {selectedSong.name} by{" "}
                {selectedSong.artists.map((artist) => artist.name).join(", ")}
              </p>
            </div>
          )}
          <button
            onClick={handlePostSubmit}
            className="bg-primary text-white p-2 rounded-lg w-full font-nunito"
          >
            Post
          </button>

          {loading && <Loader />}
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-24">
        {allPost?.map((post) => (
          <div key={post._id}>
            <PostSection post={post} />
          </div>
        ))}
      </div>

      {/* Story View Modal */}
      {openStoryGroupIndex !== null && allStory[openStoryGroupIndex] && (
        <StoryView
          storyGroup={allStory[openStoryGroupIndex]}
          currentStoryIndex={currentStoryIndex}
          onClose={closeStoryView}
          onPrev={goToPrevStory}
          onNext={goToNextStory}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Feed;
