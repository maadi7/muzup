import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useUserStore } from '@/lib/store';
import Image from 'next/image';
import Leftbar from '@/components/Leftbar';
import SideBar from '@/components/Messages/SideBar';
import Loader from '@/components/Loader'; // Assuming you have a loader component

const EditProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Extract the id from the URL
  const { user } = useUserStore();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(''); // For storing the image URL from Cloudinary
  const [imageFile, setImageFile] = useState<File | null>(null); // For storing the uploaded file
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (id) {
        try {
          setLoading(true);
          const url = process.env.NEXT_PUBLIC_SERVER_URL;
          const response = await axios.get(`${url}/api/user?userId=${id}`);
          const userData = response.data;
          setUsername(userData.username || '');
          setBio(userData.bio || '');
          setProfilePic(userData.profilePic || '');
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Create FormData to send to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'MuzupApp'); // Replace with your Cloudinary preset name

      try {
        setLoading(true);
        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dnl96eqgs/image/upload', {
          method: 'POST',
          body: formData,
        });
        const cloudinaryData = await cloudinaryResponse.json();
        setProfilePic(cloudinaryData.secure_url); // Store the Cloudinary URL in profilePic
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      const url = process.env.NEXT_PUBLIC_SERVER_URL;
      const response = await axios.put(`${url}/api/user/${id}`, {
        username,
        bio,
        profilePic, // Submit the image URL from Cloudinary
      });

      router.push(`/profile/${id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <Loader />; // Replace with your loader component
  }

  return (
    <div className="flex w-full h-full">
      <div className="hidden md:block min-w-1/6 h-screen sticky border-r-2">
        <Leftbar />
      </div>

      <div className="block md:hidden h-screen sticky border-r-2">
        <SideBar />
      </div>

      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-5">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-2 font-semibold">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block mb-2 font-semibold">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label htmlFor="profilePic" className="block mb-2 font-semibold">Profile Picture</label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={handleImageUpload}
              className="border p-2 rounded w-full"
            />
            {profilePic && (
              <div className="mt-4">
                <Image src={profilePic} alt="Profile" width={100} height={100} className="rounded-full" />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded w-full mt-4"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
