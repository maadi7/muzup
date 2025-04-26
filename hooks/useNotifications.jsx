// hooks/useNotifications.js
import { useState, useEffect } from "react";
import axios from "axios";
import { useUserStore } from "../lib/store";

const useNotifications = (page = 1) => {
  const { user } = useUserStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;

  const fetchNotifications = async (pageNum = 1) => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${url}/api/notifications?page=${pageNum}`,
        {
          withCredentials: true,
        }
      );

      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  };

  const markNotificationsAsRead = async (notificationIds) => {
    try {
      await axios.post(
        `${url}/api/notifications/mark-read`,
        { notificationIds },
        {
          withCredentials: true,
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notificationIds.includes(notification._id)
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page, user?._id]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markNotificationsAsRead,
  };
};

export default useNotifications;
