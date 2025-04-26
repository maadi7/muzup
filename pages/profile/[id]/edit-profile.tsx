import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import Leftbar from "@/components/Leftbar";
import SideBar from "@/components/Messages/SideBar";
import Loader from "@/components/Loader";

const EditProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await axios.get(`${url}/api/user?userId=${id}`);
          const userData = response.data;
          setUsername(userData.username || "");
          setBio(userData.bio || "");
          setProfilePic(userData.profilePic || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [id]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      let imageUrl = profilePic;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "MuzupApp");

        const cloudinaryResponse = await fetch(
          "https://api.cloudinary.com/v1_1/dnl96eqgs/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const cloudinaryData = await cloudinaryResponse.json();
        imageUrl = cloudinaryData.secure_url;
      }

      const response = await axios.put(`${url}/api/user/${id}`, {
        userId: id,
        username: username,
        bio: bio,
        profilePic: imageUrl,
      });

      router.push(`/profile/${id}`);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex lg:w-[70%] w-full h-full">
      <div className="hidden md:block min-w-1/6 h-screen sticky border-r-2">
        <Leftbar />
      </div>

      <div className="block md:hidden h-screen sticky border-r-2">
        <SideBar />
      </div>

      <div className="flex-1 md:p-8 p-4">
        <h1 className="text-2xl font-bold mb-5 font-nunito">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            <label
              htmlFor="username"
              className="block mb-2 font-semibold font-raleway"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block mb-2 font-semibold font-raleway"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label
              htmlFor="profilePic"
              className="block mb-2 font-semibold font-raleway"
            >
              Profile Picture
            </label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              onChange={handleImageUpload}
              className="border p-2 rounded w-full"
            />
            {previewUrl && (
              <div className="mt-4">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
            )}
            {!previewUrl && profilePic && (
              <div className="mt-4">
                <Image
                  src={profilePic}
                  alt="Current Profile"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded flex-grow"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-300 text-gray-700 p-2 rounded flex-grow"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
