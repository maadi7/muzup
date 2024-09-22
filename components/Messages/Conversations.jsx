import React,{useEffect, useState} from 'react';
import { useUserStore } from '../../lib/store';
import Link from 'next/link';
import FriendList from './FriendList';
import axios from 'axios';

const Conversations = () => {
    const [selectedFriendId, setSelectedFriendId] = useState(null);
    const [conversation, setConversation] = useState([]);
    const url = process.env.NEXT_PUBLIC_SERVER_URL;
    const { user } = useUserStore();
    
  useEffect(() => {
    const getConversation = async () => {
      try {
        const res = await axios.get(`${url}/api/conversation/` + user?._id);
        setConversation(res.data);
        // console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    }
    getConversation();
  }, [user, url]);
  const selectedFriend = conversation.find(friend => 
    friend.members.includes(selectedFriendId)
  );
  const handleSelectFriend = (friendId) => {
    // console.log('Friend selected:', friendId);
    setSelectedFriendId(friendId);
  }
  return (
    <div className="p-4">
    <h1 className='text-primary text-3xl font-bold font-playfair px-4 py-4'>MUZUP</h1>
    {conversation.map((friend, index) => (
      <Link     key={index} href={`/messages/${friend.members.find(m => m !== user._id)}`}  >
      <div 
        className={`cursor-pointer }`}
        >
        <FriendList 
          friend={friend} 
          onSelectFriend={handleSelectFriend}
          isSelected={friend.members.find(m => m !== user._id) === selectedFriendId}
          />
      </div>
    </Link>
    ))}
  </div>
  )
}

export default Conversations