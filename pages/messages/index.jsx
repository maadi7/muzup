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
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const {  user } = useUserStore();
  const router = useRouter();
  

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
