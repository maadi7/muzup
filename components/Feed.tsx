import React, { useState, useRef } from 'react';
import { Oval } from 'react-loader-spinner'; // Import the loader
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS

const Feed = () => {

  const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});
  const [newPost, setNewPost] = useState({ img: '', caption: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);



  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
  
  const posts = [
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


  const handlePostSubmit = async () => {
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', 'MuzupApp'); // Update with your Cloudinary preset

      setLoading(true);

      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dnl96eqgs/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log(data);

        setNewPost({
          ...newPost,
          img: data.secure_url,
        });
        setImageFile(null);
        toast.success('Post submitted successfully!'); // Show success toaster
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Error uploading image. Please try again.'); // Show error toaster
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="w-full">
      {/* Profile Section */}
      <div className="py-4 px-12 relative ">
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
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img
                  src="https://res.cloudinary.com/dnl96eqgs/image/upload/v1722718156/itoakzl6jlji6ujaq3fc.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-sm font-semibold font-raleway">Username</h2>
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

      {/* Post Section */}
      <div className="px-16 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 font-raleway">Create a New Post</h3>
          <input
            type="text"
            placeholder="Write a caption..."
            value={newPost.caption}
            onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
            className="w-full p-2 border rounded-lg mb-4"
          />
          
          {/* Custom File Input */}
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
          
          {/* Image Preview */}
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
          
          {/* Post Button */}
          <button
            onClick={handlePostSubmit}
            className="bg-primary text-white p-2 rounded-lg w-full font-nunito"
          >
            Post
          </button>

          {/* Loader */}
          {loading && <Oval  color="#3498db" height={40} width={40} /> }
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-24">
        {posts.map((post) => (
          <div key={post.id} className="mb-6 border-b pb-4">
            {/* Post Header */}
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

            {/* Post Image */}
            <img src={post.img} alt="Post" className="w-full mb-4 rounded-lg object-cover" />

            {/* Post Caption */}
            <p className="mb-4 font-raleway font-bold">{post.caption}</p>

            {/* Post Actions */}
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

            {/* Comments */}
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

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Feed;
