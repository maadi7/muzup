import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUserStore } from '../lib/store';

const socketURL = 'http://localhost:5555';
let socket;

const useSocket = () => {
  const { user } = useUserStore()
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    if (!socket) {
      socket = io(socketURL, { transports: ['websocket'] });
    }
    socketRef.current = socket;

    if (user?._id) {
      socket.emit("addUser", user._id);
    }

    socket.on('getMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('getMessage');
    };
  }, [user]);

  const sendMessage = (message) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', message);
    }
  };

  return { messages, sendMessage };
};

export default useSocket;