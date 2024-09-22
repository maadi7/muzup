import React, { useEffect, useState } from 'react';
import SideBar from '../components/Messages/SideBar';
import Leftbar from '@/components/Leftbar';
import Image from 'next/image';
import { User, useUserStore } from '@/lib/store';
import axios from 'axios';
import Link from 'next/link';
import noProfile from "../assets/noAvatar.webp";

const Notifications = () => {
  const { user } = useUserStore();
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [pendingFriends, setPendingFriends] = useState<User[]>([]);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        const res = await axios.get(`${url}/api/user?userId=${user?._id}`);
        setPendingRequests(res.data.pendingRequests);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    if (user?._id) {
      fetchPendingRequest();
    }
  }, [user?._id]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const fetchedFriends = await Promise.all(
          pendingRequests.map(async (id) => {
            const res = await axios.get(`${url}/api/user?userId=${id}`);
            return res.data; // Assuming this returns a user object
          })
        );
        setPendingFriends(fetchedFriends);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    if (pendingRequests.length > 0) {
      fetchAllUsers();
    }
  }, [pendingRequests]);



  // Handle accept friend request
  const handleAccept = async (friendId: string) => {
    try {
      await axios.put(`${url}/api/user/${user?._id}/accept-request`, { requesterId: friendId });
      setPendingRequests((prev) =>
        prev.filter((id) => id !== friendId)
      );
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  // Handle decline friend request
  const handleDecline = async (friendId: string) => {
    try {
      await axios.put(`${url}/api/user/${user?._id}/reject-request`, { requesterId: friendId });
      setPendingRequests((prev) =>
        prev.filter((id) => id !== friendId)
      );
    } catch (error) {
      console.error('Error declining request:', error);
    }
  };

  const dummyNotifications = [
    {
      id: 1,
      profilePic: '/images/user1.jpg',
      username: 'john_doe',
      action: 'liked your post',
      time: '2h',
      postImage: '/images/post1.jpg',
    },
    {
      id: 2,
      profilePic: '/images/user2.jpg',
      username: 'jane_doe',
      action: 'started following you',
      time: '4h',
    },
    {
      id: 3,
      profilePic: '/images/user3.jpg',
      username: 'alex_smith',
      action: 'commented on your post: "Awesome!"',
      time: '6h',
      postImage: '/images/post2.jpg',
    },
    {
      id: 4,
      profilePic: '/images/user4.jpg',
      username: 'emma_wilson',
      action: 'mentioned you in a comment: "@your_username check this out!"',
      time: '1d',
    },
  ];

  return (
    <div className="flex w-full h-screen">
      {/* Leftbar only visible on medium screens and above */}
      <div className="hidden md:block min-w-1/6 h-full border-r-2">
        <Leftbar />
      </div>

      {/* Sidebar only visible on small screens */}
      <div className="block md:hidden">
        <SideBar />
      </div>

      {/* Centered Content area */}
      <div className="flex flex-1 justify-center items-center ">
        <div className="h-full w-full max-w-2xl p-4 overflow-y-auto ">
          <h2 className="text-2xl font-bold uppercase mb-10 text-center font-nunito">Notifications</h2>

          {/* Pending Friend Requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Pending Friend Requests</h3>
              {pendingFriends.map((friend) => (
                <div key={friend._id} className="flex items-center justify-between mb-4 p-4  rounded-lg">
                  <div className='flex items-center' >
                  <Link href={`/profile/${friend._id}`} >
        <div className="w-10 h-10 rounded-full overflow-hidden mr-1">
          <Image
            src={friend.profilePic ? friend.profilePic : noProfile}
            alt="User"
            className="w-full h-full object-cover"
            width={40}
            height={40}
          />
        </div>
        </Link>
                    <p className="text-sm"><span className="font-bold">{friend.username}</span>requested to follow you</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(friend._id)}
                      className="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-all duration-300 text-black rounded-lg font-nunito font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(friend._id)}
                      className="ml-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 transition-all duration-300 text-black rounded-lg font-nunito font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notifications */}
          <div className="w-full">
            {dummyNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image src={notification.profilePic} alt={notification.username} width={48} height={48} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-nunito">
                    <span className="font-semibold font-raleway">{notification.username}</span> {notification.action}
                  </p>
                  <span className="text-xs text-gray-500">{notification.time}</span>
                </div>
                {notification.postImage && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden ml-4">
                    <Image src={notification.postImage} alt="post" width={48} height={48} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
