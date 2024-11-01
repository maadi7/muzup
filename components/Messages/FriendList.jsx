import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../lib/store';
import axios from "axios"

const FriendList = ({ friend }) => {
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
  
  }, [ friend, user]);


  const handleClick = () => {
    console.log(friend.members.find((m) => m !== user?._id));
  }

  return (
    <div className=" h-full overflow-y-auto">
      <div className='flex' >
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
               
              </div>
            </div>
          </li>
      </ul>
      </div>
    </div>
  );
};

export default FriendList;
