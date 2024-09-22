import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Leftbar from '@/components/Leftbar';
import SideBar from '@/components/Messages/SideBar';
import { User } from '@/lib/store';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Modal } from '@mui/material';
import { useUserStore } from '@/lib/store';
import Link from 'next/link';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockIcon from '@mui/icons-material/Lock';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile: React.FC = () => {
  const router = useRouter();
  const [paramsId, setParamsId] = useState<string>();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [followStatus, setFollowStatus] = useState<"Follow" | "Requested" | "Unfollow" | "Accept" | "Reject">("Follow");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allPost, setAllPost] = useState<any[]>([]);
  const { user } = useUserStore();
  const [openAboutModal, setOpenAboutModal] = useState(false);
  const handleOpenAboutModal = () => setOpenAboutModal(true);
  const handleCloseAboutModal = () => setOpenAboutModal(false);
  
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const domain = process.env.NEXT_PUBLIC_CLIENT_URL;

  useEffect(() => {
    if (typeof router.query.id === 'string') {
      setParamsId(router.query.id);
    }
  }, [router.query.id]);

  useEffect(() => {
    const fetchFriend = async () => {
      if (paramsId && url) {
        try {
          const res = await axios.get<User>(`${url}/api/user?userId=${paramsId}`);
          setProfileUser(res.data);
          const allPostRes = await axios.get(`${url}/api/post/profile/${res.data?.username}`);
          setAllPost(allPostRes.data);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchFriend();
  }, [paramsId, url]);

  useEffect(() => {
    const handleFollowStatus = () => {
      if (profileUser && user?._id) {
        if (profileUser.followers.includes(user._id)) {
          setFollowStatus("Unfollow");
        } else if (profileUser.pendingRequests.includes(user._id)) {
          setFollowStatus("Requested");
        } else if (user.pendingRequests.includes(profileUser._id)) {
          console.log(user.pendingRequests);
          setFollowStatus("Accept");
        } else {
          setFollowStatus("Follow");
        }
      }
    };
    handleFollowStatus();
  }, [profileUser, user?._id]);

  const handleFollowAction = async () => {
    if (!paramsId || !user?._id || !url) return;

    try {
      setLoading(true);

      let response;
      if (followStatus === "Follow") {
        response = await axios.put(`${url}/api/user/${paramsId}/follow`, { userId: user._id });
        setFollowStatus(profileUser?.isPrivate ? "Requested" : "Unfollow");
        if (!profileUser?.isPrivate) {
          setProfileUser(prevUser => prevUser ? {
            ...prevUser,
            followers: [...prevUser.followers, user._id]
          } : null);
        }
      } else if (followStatus === "Unfollow" || followStatus === "Requested") {
        response = await axios.put(`${url}/api/user/${paramsId}/unfollow`, { userId: user._id });
        setFollowStatus("Follow");
        setProfileUser(prevUser => prevUser ? {
          ...prevUser,
          followers: prevUser.followers.filter(id => id !== user._id),
          pendingRequests: prevUser.pendingRequests.filter(id => id !== user._id)
        } : null);
      } else if (followStatus === "Accept") {
        response = await axios.put(`${url}/api/user/${user._id}/accept-request`, { requesterId: paramsId });
        setFollowStatus("Unfollow");
        // Update local user state to reflect accepted request
      } else if (followStatus === "Reject") {
        response = await axios.put(`${url}/api/user/${user._id}/reject-request`, { requesterId: paramsId });
        setFollowStatus("Follow");
        // Update local user state to reflect rejected request
      }

      if (response?.status === 200) {
        console.log("Follow action successful");
      }

    } catch (error) {
      console.error("Error handling follow action:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockAction = async () =>{
    try {
      if(paramsId && user){
        await axios.put(`${url}/api/user/${user._id}/unblock`, { userId: paramsId});
        setProfileUser(prevUser => prevUser ? {
          ...prevUser,
          blockedByMe: prevUser.blockedByMe.filter(id => id !== user._id),
        } : null);
      }
      
    } catch (error) {
      console.log(error);
    }

  }
  const handleBlock = async () =>{
    try {
      if(paramsId && user){
        await axios.put(`${url}/api/user/${user._id}/block`, { userId: paramsId });
        setProfileUser(prevUser => prevUser ? {
          ...prevUser,
          blockedByMe: [...prevUser.blockedByMe, user._id]
        } : null);
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);


  return (
    <div className="flex w-full h-full flex-col">
    <div className="flex h-full">
      <div className="hidden md:block min-w-1/6 h-screen sticky border-r-2">
        <Leftbar />
      </div>

      <div className="block md:hidden h-screen sticky border-r-2">
        <SideBar />
      </div>

      <div className='flex flex-col items-center justify-center w-full h-full'>
        <div className="flex flex-1 justify-center mt-10">
          <div className="w-36 h-36 relative mr-10">
            {profileUser?.profilePic && (
              <Image
                src={profileUser.profilePic}
                alt={profileUser.username || 'Profile Picture'}
                layout="fill"
                className="rounded-full object-cover"
              />
            )}
          </div>
          <div className="ml-8 flex flex-col">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold">{profileUser?.username}</h2>
              {paramsId === user?._id   ? (
                <Link href={`/profile/${profileUser?._id}/edit-profile`} >
                <button
                  className="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-all duration-300 text-black rounded-lg font-nunito font-semibold"
                  >
                  Edit Profile
                </button>
                </Link>
              ) : (
               
                user && profileUser?.blockedByMe?.includes(user?._id) ? (
                  <button
                    onClick={handleUnblockAction}
                    className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 transition-all duration-300 text-white rounded-lg font-nunito font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      "Unblock"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleFollowAction}
                    className={`ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-all duration-300 text-black rounded-lg font-nunito font-semibold relative flex items-center justify-center min-w-20`}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          ></path>
                        </svg>
                      </div>
                    ) : (
                      followStatus
                    )}
                  </button>
                )
              )}

{paramsId !== user?._id && paramsId && !((profileUser?.blockedByMe || []).includes(paramsId)) && (
  <Link href={`/messages/${paramsId}`}>
    <button className="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-all duration-300 text-black rounded-lg font-nunito font-semibold">
      Message
    </button>
  </Link>
)}

              <button onClick={handleOpenModal} className="ml-4">
                &#x22EE;
              </button>
            </div>
            <div className="flex space-x-4 mt-5">
              <div>
                <span className="font-semibold">{allPost?.length}</span> posts
              </div>
              <div>
                <span className="font-semibold">{profileUser?.followers.length}</span> followers
              </div>
              <div>
                <span className="font-semibold">{profileUser?.followings.length}</span> following
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 px-8 w-full">
          {(user?._id === paramsId || (!profileUser?.isPrivate || profileUser?.followers.includes(user?._id))) ? (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">Posts</h3>
              <div className="grid grid-cols-3 gap-4 pb-10">
                {allPost.map((post, index) => (
                  <div key={index} className="relative h-60 w-full">
                    {post.img && (
                      <Image
                        src={post.img}
                        alt={`Post ${index}`}
                        layout="fill"
                        className="object-cover rounded-md"
                      />
                    )}
                  </div>
                ))}
              </div>    
            </> 
          ) : (
            <h3 className="text-xl font-semibold text-center mb-4 flex items-center justify-center">
              This Account Is Private <LockIcon className="ml-2"/>
            </h3>
          )}
        </div>
      </div>
    </div>
      <Modal open={openModal} onClose={handleCloseModal}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-1/4 rounded-lg shadow-lg">
          <ul className="flex flex-col items-center justify-center py-1 font-semibold font-raleway" 
          onClick={handleCloseModal}
          >
            {paramsId !== user?._id && (
              <li className="cursor-pointer p-2 hover:bg-gray-100 w-full text-center border-b-2" onClick={handleBlock}>Block</li>
            )}
           <li 
        className="cursor-pointer p-2 hover:bg-gray-100 w-full text-center border-b-2" 
        onClick={() => {
          navigator.clipboard.writeText(`${domain}/profile/${paramsId}`);
          toast.success("Copied to clipboard!");
          handleCloseModal()
        }}
      >
        Share
      </li>
      <li
  onClick={handleOpenAboutModal}
  className="cursor-pointer p-2 hover:bg-gray-100 w-full text-center border-b-2"
>
  About this account
</li>

            <li
              onClick={handleCloseModal}
              className="cursor-pointer p-2 hover:bg-gray-100 w-full text-center"
            >
              Cancel
            </li>
          </ul>
        </div>
      </Modal>
      <Modal open={openAboutModal} onClose={handleCloseAboutModal}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-1/4 rounded-lg shadow-lg p-4">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              {profileUser?.profilePic && (
                <Image
                  src={profileUser.profilePic}
                  alt={`${profileUser.username}'s profile picture`}
                  layout="fill"
                  className="rounded-full object-cover"
                />
              )}
            </div>
            <p className="text-lg font-semibold">{profileUser?.username}</p>
            <p className='black font-nunito font-semibold mt-2' >Date joined</p>
            <p className="text-gray-600 flex ">
               <CalendarMonthIcon className='mr-1'/> {new Date(profileUser?.createdAt).toLocaleDateString()}</p>
            <button
              onClick={handleCloseAboutModal}
              className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-all duration-300 text-black rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default Profile;