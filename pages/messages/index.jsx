import React, { useState, useEffect } from 'react';
import FriendList from '../../components/Messages/FriendList';
import Chat from '../../components/Messages/Chat';
import useSocket from '../../hooks/useSocket';
import axios from 'axios';
import { useUserStore } from '../../lib/store';
import { useRouter } from 'next/router';
import SideBar from '../../components/Messages/SideBar';
import Link from 'next/link';
import Conversations from '../../components/Messages/Conversations';

const Messages = () => {
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const { messages, sendMessage } = useSocket();
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const { spotifySession, user } = useUserStore();

  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);

 

  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await axios.get(`${url}/api/conversation/` + user._id);
        setConversation(res.data);
        // console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    getConversation();
  }, [user, url]);

  const handleSelectFriend = (friendId) => {
    console.log('Friend selected:', friendId);
    setSelectedFriendId(friendId);
  }

  // Find selected friend's conversation details
  const selectedFriend = conversation.find(friend => 
    friend.members.includes(selectedFriendId)
  );

  return (
    <div className="flex w-full h-screen">
    <SideBar/>
      <div className="w-1/3 h-full border-r border-gray-300 overflow-y-auto">
       <Conversations/>
      </div>
      <div className="w-2/3 h-full">
         
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">Select a friend to start chatting</p>
          </div>
      
      </div>
    </div>
  );
};

export default Messages;