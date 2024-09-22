import React, { useEffect, useState, useRef } from 'react';
import SideBar from '../../components/Messages/SideBar';
import { useUserStore } from '../../lib/store';
import Conversations from '../../components/Messages/Conversations';
import { useRouter } from 'next/router';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import useSocket from '../../hooks/useSocket';
import MatchModal from '../../components/MatchModel';
import Image from 'next/image';

const Chat = () => {
  const { user } = useUserStore();
  const router = useRouter();
  const { id } = router.query; 
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [currentFriend, setCurrentFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [members, setMembers]  =useState([]);
  const [newMessages, setNewMessages] = useState('');
  const { messages: socketMessages, sendMessage } = useSocket();
  const messagesEndRef = useRef(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [paramsId, setParamsId] = useState(null);

  useEffect(()=>{
     setParamsId(router.query.id);
   //console.log(router.query.id);
  },[router.query.id])

  useEffect(() => {
    if (socketMessages.length > 0) {
      const lastMessage = socketMessages[socketMessages.length - 1];
      const messageWithTime = {
        ...lastMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, messageWithTime]);
    }
  }, [socketMessages]);

  useEffect(() => {
    const getConversations = async () => {
      if (id) {
        try {
          const { data } = await axios.get(`${url}/api/conversation/find/${user?._id}/${paramsId}`);
          setConversationId(data._id);
          setMembers(data.members);
          console.log(members);
          console.log(paramsId);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getConversations();
  }, [paramsId, user]);

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
  }, [conversationId]);

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
    if (newMessages === "") return;
    
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    sendMessage({ senderId: user?._id, receiverId: currentFriend?._id, text: newMessages });
       
    const message = {
      sender: user?._id,
      text: newMessages,
      conversationId: conversationId,
    };
    try {
      const res = await axios.post(`${url}/api/messages`, message);
      setMessages(prev => [...prev, {...res.data, time: currentTime}]);
      setNewMessages('');
    } catch (error) {
      console.log(error);
    }
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
          <h2 className="text-xl font-bold font-raleway">{currentFriend?.username}</h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 ">
        {messages?.map((message, index) => (
 //message.conversationId === conversationId && (
              <div
                key={index}
                className={`mb-2 p-2 rounded-md flex items-end ${
                  message.sender === user?._id ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {message.sender !== user?._id &&
                  <img
                    src={currentFriend?.profilePic}
                    alt={currentFriend?.username}
                    className="w-8 h-8 rounded-full mx-2 mb-2"
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
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 flex items-center p-2">
          <input
            type="text"
            placeholder="Type a message"
            value={newMessages}
            onChange={(e) => setNewMessages(e.target.value)}
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