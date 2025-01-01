import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useUserStore } from '../lib/store';

const socketURL = 'http://localhost:5555';
let socket;

const useSocket = () => {
  const { user } = useUserStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [seenMessages, setSeenMessages] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);


  const socketRef = useRef();
  const reconnectInterval = useRef();

  const connectSocket = useCallback(() => {
    console.log('Attempting to connect socket...');
    socket = io(socketURL, { 
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      if (user?._id) {
        socket.emit("addUser", user._id);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('Connection error:', error);
      setIsConnected(false);
    });

    socket.on('getUsers', (users) => {
      console.log('Online users:', users);
      setOnlineUsers(users);
    });

    // Clear any existing interval
    if (reconnectInterval.current) {
      clearInterval(reconnectInterval.current);
    }

    // Set up reconnection interval
    reconnectInterval.current = setInterval(() => {
      if (!socket.connected) {
        console.log('Attempting to reconnect...');
        socket.connect();
      }
    }, 5000); // Try to reconnect every 5 seconds
  }, [user]);

  useEffect(() => {
    if (socketRef.current) {
      // Add listener for new notifications
      socketRef.current.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadNotificationsCount(prev => prev + 1);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('newNotification');
      }
    };
  }, []);

  const markNotificationsAsRead = useCallback((notificationIds) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('markNotificationsRead', { 
        userId: user?._id, 
        notificationIds 
      });
    }
  }, [user]);


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

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('sendMessage', message);
    } else {
      console.log('Socket is not connected. Attempting to reconnect...');
      connectSocket();
    }
  }, [connectSocket]);

  const subscribeToMessages = useCallback((callback) => {
    if (socketRef.current) {
      socketRef.current.on('getMessage', (message) => {
        callback(message);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('getMessage');
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("userTyping", ({ senderId, conversationId }) => {
        setTypingUsers(prev => ({ ...prev, [conversationId]: senderId }));
      });

      socketRef.current.on("userStoppedTyping", ({ senderId, conversationId }) => {
        setTypingUsers(prev => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });
      });

      socketRef.current.on("messageSeenUpdate", ({ senderId, receiverId, conversationId, messageId }) => {
        setSeenMessages(prev => ({
          ...prev,
          [conversationId]: { senderId, receiverId, messageId }
        }));
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("userTyping");
        socketRef.current.off("userStoppedTyping");
        socketRef.current.off("messageSeenUpdate");
      }
    };
  }, []);

  const sendTypingStatus = useCallback((senderId, receiverId, conversationId, isTyping) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(isTyping ? "typing" : "stopTyping", { senderId, receiverId, conversationId });
    }
  }, []);

  const markMessageAsSeen = useCallback((senderId, receiverId, conversationId, messageId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("messageSeen", { senderId, receiverId, conversationId, messageId });
    }
  }, []);



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
    };
};

export default useSocket;