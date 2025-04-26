import React, { useEffect, useState } from "react";
import SideBar from "../components/Messages/SideBar";
import Leftbar from "@/components/Leftbar";
import Image from "next/image";
import { User, useUserStore } from "@/lib/store";
import axios from "axios";
import Link from "next/link";
import noProfile from "../assets/noAvatar.webp";
import useSocket from "@/hooks/useSocket"; // Import the new socket hook
import useNotifications from "@/hooks/useNotifications"; // Import the new notifications hook
import { formatDistanceToNow } from "date-fns";
import NotificationCenter from "../components/Notification/NotificationCenter";

const Notifications = () => {
  const { user } = useUserStore();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;

  // Use the new notification hooks
  const { notifications, unreadCount, markNotificationsAsRead } = useSocket();
  const { markNotificationsAsRead: apiMarkNotificationsAsRead } =
    useNotifications();

  useEffect(() => {
    const fetchPendingRequest = async () => {
      try {
        const res = await axios.get(`${url}/api/user?userId=${user?._id}`);
        setPendingRequests(res.data.pendingRequests);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
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
            return res.data;
          })
        );
        setPendingFriends(fetchedFriends);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    if (pendingRequests.length > 0) {
      fetchAllUsers();
    }
  }, [pendingRequests]);

  // Handle accept friend request
  const handleAccept = async (friendId) => {
    try {
      await axios.put(`${url}/api/user/${user?._id}/accept-request`, {
        requesterId: friendId,
      });
      setPendingRequests((prev) => prev.filter((id) => id !== friendId));
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  // Handle decline friend request
  const handleDecline = async (friendId) => {
    try {
      await axios.put(`${url}/api/user/${user?._id}/reject-request`, {
        requesterId: friendId,
      });
      setPendingRequests((prev) => prev.filter((id) => id !== friendId));
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  // Handle marking notifications as read
  const handleMarkNotificationAsRead = (notificationId) => {
    markNotificationsAsRead([notificationId]);
    apiMarkNotificationsAsRead([notificationId]);
  };

  // Get notification message based on type
  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case "message":
        return `New message from ${notification.sender.username}`;
      case "friendRequest":
        return `${notification.sender.username} sent you a friend request`;
      case "postLike":
        return `${notification.sender.username} liked your post`;
      case "postComment":
        return `${notification.sender.username} commented on your post`;
      default:
        return "New notification";
    }
  };

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

      <NotificationCenter />

      {/* Centered Content area */}
      <div className="flex flex-1 justify-center items-center ">
        <div className="h-full w-full max-w-2xl p-4 overflow-y-auto ">
          <h2 className="text-2xl font-bold uppercase mb-10 text-center font-nunito">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                {unreadCount}
              </span>
            )}
          </h2>

          {/* Pending Friend Requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">
                Pending Friend Requests
              </h3>
              {pendingFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between mb-4 p-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <Link href={`/profile/${friend._id}`}>
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-1">
                        <Image
                          src={
                            friend.profilePic ? friend.profilePic : noProfile
                          }
                          alt="User"
                          className="w-full h-full object-cover"
                          width={40}
                          height={40}
                        />
                      </div>
                    </Link>
                    <p className="text-sm">
                      <span className="font-bold">{friend.username}</span>{" "}
                      requested to follow you
                    </p>
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
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`flex items-center mb-4 p-3 rounded-lg cursor-pointer ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleMarkNotificationAsRead(notification._id)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={notification.sender?.avatar || noProfile}
                      alt={notification.sender?.username || "User"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-nunito">
                      {getNotificationMessage(notification)}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {/* Optional: Add a way to view related content */}
                  {notification.entityType === "post" &&
                    notification.entityId && (
                      <Link href={`/post/${notification.entityId}`}>
                        <div className="w-12 h-12 rounded-lg overflow-hidden ml-4">
                          {/* Placeholder for post image if available */}
                          <Image
                            src={notification.entityId.image || noProfile}
                            alt="post"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </Link>
                    )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
