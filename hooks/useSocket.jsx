import { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { useUserStore } from "../lib/store";

const socketURL = "http://localhost:5555";
let socket;

const useSocket = () => {
  const { user } = useUserStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [seenMessages, setSeenMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [messageStatuses, setMessageStatuses] = useState({});

  const socketRef = useRef();
  const reconnectInterval = useRef();

  const connectSocket = useCallback(() => {
    console.log("Attempting to connect socket...");
    socket = io(socketURL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
      if (user?._id) {
        socket.emit("addUser", user._id);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.log("Connection error:", error);
      setIsConnected(false);
    });

    socket.on("getUsers", (users) => {
      console.log("Online users:", users);
      setOnlineUsers(users);
    });

    socket.on("messageSeen", ({ messageId }) => {
      console.log(messageId, "seen");
      setMessageStatuses((prev) => ({
        ...prev,
        [messageId]: "seen",
      }));
    });

    // Clear any existing interval
    if (reconnectInterval.current) {
      clearInterval(reconnectInterval.current);
    }

    // Set up reconnection interval
    reconnectInterval.current = setInterval(() => {
      if (!socket.connected) {
        console.log("Attempting to reconnect...");
        socket.connect();
      }
    }, 5000);
  }, [user]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadNotificationsCount((prev) => prev + 1);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newNotification");
      }
    };
  }, []);

  const markNotificationsAsRead = useCallback(
    (notificationIds) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("markNotificationsRead", {
          userId: user?._id,
          notificationIds,
        });
      }
    },
    [user]
  );

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
      }
    };
  }, [connectSocket]);

  const sendMessage = useCallback(
    (message) => {
      if (socketRef.current && socketRef.current.connected) {
        // Set initial status as 'sent'
        console.log(message, "111");
        setMessageStatuses((prev) => ({
          ...prev,
          [message._id]: "sent",
        }));
        socketRef.current.emit("sendMessage", message);
      } else {
        connectSocket();
      }
    },
    [connectSocket]
  );

  // Clean up the subscribeToMessages function in useSocket.js
  const subscribeToMessages = useCallback(
    (callback) => {
      if (socketRef.current) {
        socketRef.current.on("getMessage", (message) => {
          // Mark message as delivered when received
          if (message.messageId || message._id) {
            socketRef.current.emit("messageDelivered", {
              messageId: message.messageId || message._id,
              senderId: message.sender,
              receiverId: user?._id,
            });
          }
          callback(message);
        });
      }
      return () => {
        if (socketRef.current) {
          socketRef.current.off("getMessage");
        }
      };
    },
    [user]
  );

  // Remove the duplicate getMessage handler in the useEffect below
  // And remove the duplicate getMessage handler from your useEffect

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("userTyping", ({ senderId, conversationId }) => {
        setTypingUsers((prev) => ({ ...prev, [conversationId]: senderId }));
      });

      socketRef.current.on(
        "userStoppedTyping",
        ({ senderId, conversationId }) => {
          setTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[conversationId];
            return updated;
          });
        }
      );

      socket.on("initializeMessageStatuses", (statuses) => {
        setMessageStatuses((prev) => ({
          ...prev,
          ...statuses,
        }));
      });

      socketRef.current.on("messageStatus", ({ messageId, status }) => {
        console.log(messageId, "status", status);
        setMessageStatuses((prev) => ({
          ...prev,
          [messageId]: status,
        }));
        console.log(messageStatuses);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("userTyping");
        socketRef.current.off("userStoppedTyping");
        socketRef.current.off("messageSeenUpdate");
      }
    };
  }, [connectSocket]);

  const initializeMessageStatuses = useCallback((statuses) => {
    setMessageStatuses((prev) => ({
      ...prev,
      ...statuses,
    }));
  }, []);

  const sendTypingStatus = useCallback(
    (senderId, receiverId, conversationId, isTyping) => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit(isTyping ? "typing" : "stopTyping", {
          senderId,
          receiverId,
          conversationId,
        });
      }
    },
    []
  );
  const markMessageAsSeen = useCallback(
    (senderId, receiverId, conversationId, messageId) => {
      if (socketRef.current && socketRef.current.connected) {
        console.log(`Marking message as seen: ${messageId}`);

        // Immediately update local state
        setMessageStatuses((prev) => ({
          ...prev,
          [messageId]: "seen",
        }));

        // Then notify server
        socketRef.current.emit("messageSeen", {
          senderId,
          receiverId,
          conversationId,
          messageId,
        });
      }
    },
    []
  );

  const getMessageStatus = useCallback(
    (messageId) => {
      return messageStatuses[messageId] || "sent";
    },
    [messageStatuses]
  );

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    subscribeToMessages,
    typingUsers,
    seenMessages,
    markMessageAsSeen,
    sendTypingStatus,
    notifications,
    unreadNotificationsCount,
    markNotificationsAsRead,
    getMessageStatus,
    messageStatuses,
    initializeMessageStatuses,
  };
};

export default useSocket;
