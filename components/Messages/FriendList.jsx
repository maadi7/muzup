import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useUserStore } from '../../lib/store';
import { useRouter } from 'next/router';
import axios from "axios"

const FriendList = ({ friend, onSelectFriend }) => {
  const user = useUserStore((state)=> state.user )
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [currentFriend, setCurrentFriend] = useState(null)

  useEffect(() =>{
    const friendId = friend.members.find((m) => m !== user?._id);
    const getUser = async () =>{
      try {
        const res = await axios(`${url}/api/user?userId=`+friendId);
        setCurrentFriend(res.data)
      } 
      catch (error) {
        console.log(error);
      }
    }
    getUser();
  
  }, [ friend, user])
  const handleClick = () => {
    console.log('Friend clicked:', currentFriend?.username); // Debug log
    onSelectFriend(friend.members.find((m) => m !== user?._id));
    console.log(friend.members.find((m) => m !== user?._id));
    
  }

  return (
    <div className=" h-full overflow-y-auto">
   
      <div className='flex ' >

      <ul className='w-full ' >

        
          <li
            key={friend.id}
            onClick={handleClick}
            className="cursor-pointer p-2 my-2 hover:bg-gray-200 rounded-md w-full"
          >
            <div className="flex items-center ">
              <img
                src={currentFriend?.profilePic || 'http://df/com'}
                alt={currentFriend?.username}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <p className="font-semibold font-raleway">{currentFriend?.username}</p>
                {/* <p className="text-sm text-gray-500 font-nunito">{friend.lastMessage}</p> */}
              </div>
            </div>
          </li>
      </ul>
      </div>
    </div>
  );
};

export default FriendList;
