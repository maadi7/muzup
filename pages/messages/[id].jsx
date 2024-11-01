import React, { useEffect, useState, useRef, useCallback } from 'react';
import SideBar from '../../components/Messages/SideBar';
import { useUserStore } from '../../lib/store';
import Conversations from '../../components/Messages/Conversations';
import { useRouter } from 'next/router';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import useSocket from '../../hooks/useSocket';
import MatchModal from '../../components/MatchModel';
import Image from 'next/image';
import ConnectionStatus from '../../components/Messages/ConnectionStatus';
import OnlineStatus from '../../components/Messages/OnlineStatus';
import TypingIndicator from '../../components/Messages/TypingIndicator';

const Chat = () => {
  const { user } = useUserStore();
  const router = useRouter();
  const { id } = router.query; 
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [currentFriend, setCurrentFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const { sendMessage, subscribeToMessages, typingUsers, seenMessages, sendTypingStatus, markMessageAsSeen } = useSocket();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const [lastSeenMessageId, setLastSeenMessageId] = useState(null);

  const addMessage = useCallback((message) => {
    const messageWithTime = {
      ...message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, messageWithTime]);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToMessages((message) => {
      if (message.conversationId === conversationId) {
        addMessage(message);
      }
    });
    return unsubscribe;
  }, [subscribeToMessages, conversationId, addMessage]);

  useEffect(() => {
    if (messages.length > 0 && conversationId && currentFriend?._id) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === currentFriend?._id && lastMessage._id !== lastSeenMessageId) {
        markMessageAsSeen(user?._id, currentFriend?._id, conversationId, lastMessage._id);
      }
    }
  }, [messages, conversationId, currentFriend, user, markMessageAsSeen, lastSeenMessageId]);

  useEffect(() => {
    if (seenMessages[conversationId]) {
      setLastSeenMessageId(seenMessages[conversationId].messageId);
    }
  }, [seenMessages, conversationId]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const { data } = await axios.get(`${url}/api/messages/${conversationId}`);
        const messagesWithTime = data.map(msg => ({
          ...msg,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(messagesWithTime);
      } catch (error) {
        console.log(error);
      }
    };
    if (conversationId) {
      getMessages();
    }
  }, [conversationId, url]);

  useEffect(() => {
    const getConversations = async () => {
      if (id && user?._id) {
        try {
          const { data } = await axios.get(`${url}/api/conversation/find/${user._id}/${id}`);
          setConversationId(data._id);
          setCurrentFriend(data.members.find(member => member._id !== user._id));
        } catch (error) {
          console.log(error);
        }
      }
    };
    getConversations();
  }, [id, user, url]);

  useEffect(() => {
    const fetchFriend = async () => {
      if (id) {
        try {
          const res = await axios(`${url}/api/user?userId=${id}`);
          setCurrentFriend(res.data);
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchFriend();
  }, [id, url]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage === "") return;
    
    const messageData = {
      sender: user?._id,
      text: newMessage,
      conversationId: conversationId,
      receiverId: currentFriend?._id
    };

    try {
      const res = await axios.post(`${url}/api/messages`, messageData);
      addMessage(res.data);
      setNewMessage('');
      sendMessage(messageData);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(user?._id, currentFriend?._id, conversationId, true);
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(user?._id, currentFriend?._id, conversationId, false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleMatch = (e) => {
    setIsMatchModalOpen(true);
  };

  const closeMatchModal = () => {
    setIsMatchModalOpen(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className='flex w-full h-screen'>
      <SideBar />
      <div className="w-1/3 h-full border-r border-gray-300 overflow-y-auto">
        <Conversations />
      </div>
      <div className="py-4 h-full flex flex-col w-full">
        <div className="flex items-center mb-4 pb-2 border-b-2 w-full">
          <img
            src={currentFriend?.profilePic}
            alt={currentFriend?.username}
            className="w-10 h-10 rounded-full mr-2"
          />
          <div>
            <h2 className="text-xl font-bold font-raleway">{currentFriend?.username}</h2>
            <OnlineStatus userId={currentFriend?._id} />
          </div>
        </div>
        <ConnectionStatus />

        <div className="flex-1 overflow-y-auto px-4 ">
          {messages?.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-md flex items-end ${
                message.sender === user?._id ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {message.sender !== user?._id &&
                <Image
                  src={currentFriend?.profilePic || ""}
                  alt={currentFriend?.username || "UserImage"}
                  className="w-8 h-8 rounded-full mx-2 mb-2"
                  width={32}
                  height={32}
                />
              }
              <div
                className={`px-3 py-2 rounded-lg max-w-xs font-nunito font-semibold text-start ${
                  message.sender === user?._id ? 'bg-purple-100 text-right' : 'bg-green-100 text-left'
                }`}
              >
                <p>{message.text}
                <sub className="text-[10px] text-gray-500 p-2">{message.time}</sub>
                </p>
              </div>
              {message.sender === user?._id && index === messages.length - 1 && 
               seenMessages[conversationId]?.messageId === message._id && (
                <div className="text-xs text-gray-500 ml-2">Seen</div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
          {typingUsers[conversationId] === currentFriend?._id && <TypingIndicator />}

        <div className="mt-4 flex items-center p-2">
          <input
            type="text"
            placeholder="Type a message"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="w-full p-2 border rounded-md mr-2"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 rounded-md mr-2"
          >
            <SendIcon fontSize='large' />
          </button>
          <button
            onClick={handleMatch}
            className="bg-primary text-white p-2 rounded-md shadow-lg"
          >
            Match
          </button>
        </div>
      </div> 
      <MatchModal
        isOpen={isMatchModalOpen}
        onClose={closeMatchModal}
        currentUser={user}
        currentFriend={currentFriend}
      />
    </div>
  );
}

export default Chat;