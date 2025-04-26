// hooks/useSocket.js - Updated
import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useUserStore } from "../lib/store";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5555";

let socketInstance = null;

const useSocket = () => {
  const { user } = useUserStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [messageStatuses, setMessageStatuses] = useState({});
  const [conversationStatuses, setConversationStatuses] = useState({}); // Store message statuses by conversation
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // Initialize or get socket instance
  const getSocket = useCallback(() => {
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: false,
      });
    }
    return socketInstance;
  }, []);

  // Connect to socket server
  const connect = useCallback(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, [getSocket]);

  // Initialize socket listeners
  useEffect(() => {
    if (!user?._id) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Connection events
    const onConnect = () => {
      console.log("Socket connected");
      setIsConnected(true);
      socket.emit("addUser", user._id);
    };

    const onDisconnect = (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);

      // Attempt reconnection
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      reconnectTimerRef.current = setTimeout(() => {
        console.log("Attempting to reconnect...");
        socket.connect();
      }, 3000);
    };

    const onConnectError = (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    };

    // Online users
    const onGetUsers = (users) => {
      setOnlineUsers(users);
    };

    // Message status updates
    const onMessageStatus = ({ messageId, status, conversationId }) => {
      console.log(
        `Message ${messageId} status changed to ${status} in conversation ${conversationId}`
      );

      // Update both global message status and conversation-specific status
      setMessageStatuses((prev) => ({
        ...prev,
        [messageId]: status,
      }));

      // Update conversation-specific status tracking
      setConversationStatuses((prev) => {
        const updatedConvo = { ...prev };
        if (!updatedConvo[conversationId]) {
          updatedConvo[conversationId] = {};
        }
        updatedConvo[conversationId][messageId] = status;
        return updatedConvo;
      });
    };

    // Typing indicators
    const onUserTyping = ({ senderId, conversationId }) => {
      setTypingUsers((prev) => ({ ...prev, [conversationId]: senderId }));
    };

    const onUserStoppedTyping = ({ senderId, conversationId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[conversationId];
        return updated;
      });
    };

    // Notifications
    const onNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadNotificationsCount((prev) => prev + 1);
    };

    // Register event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("getUsers", onGetUsers);
    socket.on("messageStatus", onMessageStatus);
    socket.on("userTyping", onUserTyping);
    socket.on("userStoppedTyping", onUserStoppedTyping);
    socket.on("newNotification", onNewNotification);

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Add user to online users when connected
    if (socket.connected && user?._id) {
      socket.emit("addUser", user._id);
    }

    // Cleanup function
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("getUsers", onGetUsers);
      socket.off("messageStatus", onMessageStatus);
      socket.off("userTyping", onUserTyping);
      socket.off("userStoppedTyping", onUserStoppedTyping);
      socket.off("newNotification", onNewNotification);
    };
  }, [user, getSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
    };
  }, []);

  // Send a message
  const sendMessage = useCallback(
    ({ sender, receiverId, text, conversationId, messageId }) => {
      const socket = socketRef.current;
      if (socket?.connected) {
        // Update local state first for immediate feedback
        setMessageStatuses((prev) => ({
          ...prev,
          [messageId]: "sent",
        }));

        // Update conversation-specific state
        setConversationStatuses((prev) => {
          const updatedConvo = { ...prev };
          if (!updatedConvo[conversationId]) {
            updatedConvo[conversationId] = {};
          }
          updatedConvo[conversationId][messageId] = "sent";
          return updatedConvo;
        });

        // Send message through socket
        socket.emit("sendMessage", {
          sender,
          receiverId,
          text,
          conversationId,
          messageId,
        });
      } else {
        console.warn("Socket not connected, reconnecting...");
        connect();
      }
    },
    [connect]
  );

  // Subscribe to incoming messages
  const subscribeToMessages = useCallback(
    (callback) => {
      const socket = socketRef.current;

      if (!socket) return () => {};

      const onGetMessage = (message) => {
        // Mark as delivered when we receive it
        if (message.messageId && user?._id) {
          socket.emit("messageDelivered", {
            messageId: message.messageId,
            senderId: message.sender,
            receiverId: user._id,
            conversationId: message.conversationId,
          });

          // Update conversation-specific status right away
          setConversationStatuses((prev) => {
            const updatedConvo = { ...prev };
            if (!updatedConvo[message.conversationId]) {
              updatedConvo[message.conversationId] = {};
            }
            updatedConvo[message.conversationId][message.messageId] =
              "delivered";
            return updatedConvo;
          });
        }

        // Call the provided callback with the message
        callback(message);
      };

      socket.on("getMessage", onGetMessage);

      // Return cleanup function
      return () => {
        socket.off("getMessage", onGetMessage);
      };
    },
    [user]
  );

  // Mark message as seen
  const markMessageAsSeen = useCallback(
    (senderId, receiverId, conversationId, messageId) => {
      const socket = socketRef.current;

      if (socket?.connected) {
        // Update local state first
        setMessageStatuses((prev) => ({
          ...prev,
          [messageId]: "seen",
        }));

        // Update conversation-specific status
        setConversationStatuses((prev) => {
          const updatedConvo = { ...prev };
          if (!updatedConvo[conversationId]) {
            updatedConvo[conversationId] = {};
          }
          updatedConvo[conversationId][messageId] = "seen";
          return updatedConvo;
        });

        // Notify server
        socket.emit("messageSeen", {
          sender: senderId,
          receiverId,
          conversationId,
          messageId,
        });
      }
    },
    []
  );

  // Send typing status
  const sendTypingStatus = useCallback(
    (senderId, receiverId, conversationId, isTyping) => {
      const socket = socketRef.current;

      if (socket?.connected) {
        socket.emit(isTyping ? "typing" : "stopTyping", {
          senderId,
          receiverId,
          conversationId,
        });
      }
    },
    []
  );

  // Mark notifications as read
  const markNotificationsRead = useCallback(
    (notificationIds) => {
      const socket = socketRef.current;

      if (socket?.connected && user?._id) {
        socket.emit("markNotificationsRead", {
          userId: user._id,
          notificationIds,
        });

        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds.includes(notification._id)
              ? { ...notification, read: true }
              : notification
          )
        );

        // Update unread count
        const readCount = notificationIds.length;
        setUnreadNotificationsCount((prev) => Math.max(0, prev - readCount));
      }
    },
    [user]
  );

  // Initialize message statuses - Updated to handle conversation-specific storage
  const initializeMessageStatuses = useCallback((statuses, conversationId) => {
    // Update global message statuses
    setMessageStatuses((prev) => ({
      ...prev,
      ...statuses,
    }));

    // Update conversation-specific status tracking
    setConversationStatuses((prev) => {
      const updatedConvo = { ...prev };
      if (!updatedConvo[conversationId]) {
        updatedConvo[conversationId] = {};
      }
      // Merge new statuses with any existing ones for this conversation
      updatedConvo[conversationId] = {
        ...updatedConvo[conversationId],
        ...statuses,
      };
      return updatedConvo;
    });
  }, []);

  // Get message status - Now checks conversation-specific status first
  const getMessageStatus = useCallback(
    (messageId, conversationId) => {
      // First try to get conversation-specific status
      if (
        conversationId &&
        conversationStatuses[conversationId] &&
        conversationStatuses[conversationId][messageId]
      ) {
        return conversationStatuses[conversationId][messageId];
      }
      // Fall back to global status
      return messageStatuses[messageId] || "sent";
    },
    [messageStatuses, conversationStatuses]
  );

  // Check if a user is online
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.some((user) => user[0] === userId);
    },
    [onlineUsers]
  );

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;

    try {
      const response = await fetch(`/api/notifications/${user._id}`);
      const data = await response.json();

      setNotifications(data);
      setUnreadNotificationsCount(
        data.filter((notification) => !notification.read).length
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [user]);

  // Initial fetch of notifications
  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return {
    isConnected,
    onlineUsers,
    isUserOnline,
    sendMessage,
    subscribeToMessages,
    typingUsers,
    sendTypingStatus,
    markMessageAsSeen,
    getMessageStatus,
    messageStatuses,
    conversationStatuses,
    initializeMessageStatuses,
    notifications,
    unreadNotificationsCount,
    markNotificationsRead,
    fetchNotifications,
  };
};

export default useSocket;
