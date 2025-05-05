// components/Notifications/NotificationCenter.js
import React, { useState, useEffect, useRef } from "react";
import { Badge, Avatar } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import useSocket from "../../hooks//useSocket";
import { useRouter } from "next/router";
import Link from "next/link";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationsRead,
    fetchNotifications,
  } = useSocket();
  const dropdownRef = useRef(null);
  const router = useRouter();

  console.log(notifications, "/////");
  useEffect(() => {
    // Fetch notifications when component mounts
    fetchNotifications();
    // Set up an interval to periodically fetch notifications
    const interval = setInterval(fetchNotifications, 60000); // Every minute

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);

    // Mark all as read when opening
    if (!isOpen && unreadNotificationsCount > 0) {
      const unreadIds = notifications
        .filter((notification) => !notification.read)
        .map((notification) => notification._id);

      if (unreadIds.length > 0) {
        markNotificationsRead(unreadIds);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    // Handle different notification types
    switch (notification.type) {
      case "message":
        router.push(`/messages/${notification.sender}`);
        break;
      case "follow":
        router.push(`/profile/${notification.sender}`);
        break;
      case "like":
      case "comment":
        if (notification.referenceModel === "Post") {
          router.push(`/post/${notification.reference}`);
        }
        break;
      default:
        break;
    }

    // Close dropdown
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMin = Math.floor(diffInMs / 60000);
    const diffInHrs = Math.floor(diffInMin / 60);
    const diffInDays = Math.floor(diffInHrs / 24);

    if (diffInMin < 1) return "just now";
    if (diffInMin < 60) return `${diffInMin}m ago`;
    if (diffInHrs < 24) return `${diffInHrs}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  // Helper function to get notification message
  const getNotificationMessage = (notification) => {
    const { type, content, sender } = notification;
    const senderName = sender?.username || "Someone";

    switch (type) {
      case "message":
        return `${senderName} sent you a message: "${
          content.length > 20 ? content.substring(0, 20) + "..." : content
        }"`;
      case "follow":
        return `${senderName} started following you`;
      case "like":
        return `${senderName} liked your post`;
      case "comment":
        return `${senderName} commented on your post: "${
          content.length > 20 ? content.substring(0, 20) + "..." : content
        }"`;
      default:
        return content;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="bg-white p-2 rounded-full focus:outline-none"
      >
        <Badge badgeContent={unreadNotificationsCount} color="error">
          <NotificationsIcon fontSize="medium" />
        </Badge>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="px-4 py-2 flex justify-between items-center bg-gray-100">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer flex items-start ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <Avatar
                    src={notification.sender?.profilePic}
                    alt={notification.sender?.username || "User"}
                    className="mr-3 w-10 h-10"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 bg-gray-100 text-center">
              <Link
                href="/notifications"
                className="text-primary text-sm font-medium hover:underline"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
