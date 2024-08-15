import React, { useState, useRef, useEffect } from 'react';
import { Oval } from 'react-loader-spinner';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SongSearch from '@/lib/SongSearch';
import { useUserStore } from '../lib/store';
import playSong from "../utils/playSong"
import {  VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon } from '@mui/icons-material';

interface Story {
  id: number;
  username: string;
  img: string;
  songId?: string;
}

interface StoryGroup {
  userId: number;
  username: string;
  stories: Story[];
}

interface Comment {
  id: number;
  username: string;
  text: string;
}

interface Post {
  id: number;
  username: string;
  userImg: string;
  img: string;
  caption: string;
  likes: number;
  comments: Comment[];
}

interface StoryViewProps {
  storyGroup: StoryGroup;
  currentStoryIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}



const StoryView: React.FC<StoryViewProps> = ({ storyGroup, currentStoryIndex, onClose, onPrev, onNext }) => {
  const { stories } = storyGroup;
  const currentStory = stories[currentStoryIndex];
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // State to manage mute/unmute
  const { spotifySession } = useUserStore();
  const audioRef = useRef<HTMLAudioElement | null>(null); // Ref to control the audio element

  useEffect(() => {
    const play = async () => {
      if (currentStory?.songId && spotifySession?.accessToken) {
        if (audioRef.current) {
          audioRef.current.pause(); // Pause the currently playing audio
          audioRef.current.src = ''; // Clear the current source
        }

        // Play the new story's song
        const audio = await playSong(currentStory?.songId, spotifySession?.accessToken);
        if (audio) {
          audioRef.current = audio; // Update the ref to the new audio element
          audio.muted = isMuted; // Apply the mute setting
        } else {
          console.warn('No audio returned from playSong.');
        }
      }
    };

    play();

    return () => {
      // Clean up: stop audio when the component is unmounted or the story changes
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [currentStory?.songId, spotifySession, currentStoryIndex]);

  useEffect(() => {
    // Apply mute setting to the current audio
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 20000; // 20 seconds

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        clearInterval(timer);
        onNext();
      }
    }, 100);

    return () => clearInterval(timer);
  }, [currentStoryIndex]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative w-full max-w-md h-[80vh] bg-white rounded-lg overflow-hidden">
        {/* Loader bar at the top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div
            className="bg-blue-500 h-full"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          ></div>
        </div>
        {/* Mute button */}
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
          <h3 className="font-semibold">{storyGroup.username}</h3>
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


const Feed: React.FC = () => {
  const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});
  const [newPost, setNewPost] = useState<{ img: string; caption: string; song?: Track | null }>({ img: '', caption: '', song: null });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [openStoryIndex, setOpenStoryIndex] = useState<number | null>(null);
  const [selectedSong, setSelectedSong] = useState<Track | null>(null);
  const { spotifySession } = useUserStore();

  const handleSelectSong = (song: Track) => {
    setSelectedSong(song);
    console.log(song);
  };
  
  const [openStoryGroupIndex, setOpenStoryGroupIndex] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const toggleComments = (postId: number) => {
    setVisibleComments(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  const handlePostSubmit = async () => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'MuzupApp');

      setLoading(true);

      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dnl96eqgs/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log(data);
        const postData = {
          // other post data
          song: selectedSong,
        };
        console.log('Submitting post with song:', postData);

        setNewPost({
          ...newPost,
          img: data.secure_url,
          song: selectedSong,
        });
        setImageFile(null);
        toast.success('Post submitted successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Error uploading image. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    console.log('New Post:', newPost);
    setNewPost({ img: '', caption: '' });
  };

  const removeImage = () => {
    setNewPost({ ...newPost, img: '' });
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
      const storyGroup = openStoryGroupIndex !== null ? storyGroups[openStoryGroupIndex] : null;
      if (storyGroup && prevIndex < storyGroup.stories.length - 1) {
        return prevIndex + 1;
      } else {
        closeStoryView(); // Close the story view if no more stories
        return prevIndex;
      }
    });
  };

  // Dummy data
  const storyGroups: StoryGroup[] = [
    {
      userId: 1,
      username: 'user1',
      stories: [
        { id: 1, username: 'user1', img: 'https://res.cloudinary.com/dnl96eqgs/image/upload/v1723322222/vbyejwrl3zo2ci4qtyvq.png', songId: "0tgVpDi06FyKpA1z0VMD4v" },
        { id: 2, username: 'user1', img: 'https://res.cloudinary.com/dnl96eqgs/image/upload/v1723321610/iovll4uhqiwwysgfy5kz.png', songId: "0tgVpDi06FyKpA1z0VMD4v" }
      ]
    },
    {
      userId: 2,
      username: 'user2',
      stories: [
        { id: 3, username: 'user2', img: 'https://via.placeholder.com/400x600' }
      ]
    },
    {
      userId: 3,
      username: 'user3',
      stories: [
        { id: 4, username: 'user3', img: 'https://via.placeholder.com/400x600' },
        { id: 5, username: 'user3', img: 'https://via.placeholder.com/400x600' },
        { id: 6, username: 'user3', img: 'https://via.placeholder.com/400x600' }
      ]
    }
  ];

  const posts: Post[] = [
    {
      id: 1,
      username: 'user1',
      userImg: 'https://via.placeholder.com/50',
      img: 'https://via.placeholder.com/600x400',
      caption: 'This is an amazing post!',
      likes: 120,
      comments: [
        { id: 1, username: 'user2', text: 'Nice post!' },
        { id: 2, username: 'user3', text: 'Great shot!' }
      ]
    },
    {
      id: 2,
      username: 'user4',
      userImg: 'https://via.placeholder.com/50',
      img: 'https://via.placeholder.com/600x400',
      caption: 'Another beautiful day!',
      likes: 200,
      comments: [
        { id: 1, username: 'user5', text: 'Awesome!' },
        { id: 2, username: 'user6', text: 'Lovely!' }
      ]
    }
  ];

  return (
    <div className="w-full">
      {/* Profile Section with Stories */}
      <div className="py-4 px-12 relative">
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
          {storyGroups.map((story, index) => (
            <div key={story.userId} className="flex flex-col items-center mb-6">
              <div 
                className="w-20 h-20 rounded-full overflow-hidden cursor-pointer"
                onClick={() => openStoryView(index)}
              >
                <img
                  src={story.img}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-sm font-semibold font-raleway">{story.username}</h2>
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
      </div>

      {/* Post Creation Section */}
      <div className="px-16 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 font-raleway">Create a New Post</h3>
          <textarea
  
            placeholder="Write a caption..."
            value={newPost.caption}
            onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
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
              <img src={newPost.img} alt="Preview" className="w-full h-[400px] object-cover rounded-lg" />
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
          <h4 className='font-raleway font-bold' >Selected Song:</h4>
          <p className='font-nunito mt-1 font-semibold' >{selectedSong.name} by {selectedSong.artists.map(artist => artist.name).join(', ')}</p>
        </div>
      )}
          <button
            onClick={handlePostSubmit}
            className="bg-primary text-white p-2 rounded-lg w-full font-nunito"
          >
            Post
          </button>

          {loading && <Oval color="#3498db" height={40} width={40} />}
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-24">
        {posts.map((post) => (
          <div key={post.id} className="mb-6 border-b pb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={post.userImg}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold font-nunito">{post.username}</h3>
              </div>
            </div>

            <img src={post.img} alt="Post" className="w-full mb-4 rounded-lg object-cover" />

            <p className="mb-4 font-raleway font-bold">{post.caption}</p>

            <div className="flex items-center mb-4">
              <div className="flex gap-x-4 items-center flex-grow">
                <div className="flex items-center">
                  <button className="mr-1">
                    <FavoriteIcon />
                  </button>
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center cursor-pointer">
                  <button className="mr-1" onClick={() => toggleComments(post.id)}>
                    <CommentIcon />
                  </button>
                  <span onClick={() => toggleComments(post.id)}>{post.comments.length}</span>
                </div>
              </div>
              <div className="flex items-center ml-auto">
                <button>
                  <ShareIcon />
                </button>
              </div>
            </div>

            {visibleComments[post.id] && (
              <div>
                {post.comments.map((comment) => (
                  <div key={comment.id} className="flex items-center mb-2">
                    <h4 className="font-semibold mr-2 font-nunito">{comment.username}</h4>
                    <p className="font-raleway">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Story View Modal */}
      {openStoryGroupIndex !== null && storyGroups[openStoryGroupIndex] && (
        <StoryView
          storyGroup={storyGroups[openStoryGroupIndex]}
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