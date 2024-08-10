import React from 'react';
import Image from 'next/image';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useUserStore } from '../../lib/store';
import { useRouter } from 'next/router';

const FriendList = ({ friends, onSelectFriend }) => {
  const session = useUserStore((state)=> state.spotifySession);
  const iconSize = 28;
 const router = useRouter();

  const navigation = [
    {  href: "/dashboard", icon: <HomeIcon style={{ fontSize: iconSize }} className="nav-icon" /> },
    {  href: "#", icon: <SearchIcon style={{ fontSize: iconSize }} className="nav-icon" />, onClick: () => setIsModalVisible(true) },
    {  href: "/messages", icon: <MessageIcon style={{ fontSize: iconSize }} className="nav-icon" /> },
    {  href: "/notifications", icon: <NotificationsIcon style={{ fontSize: iconSize }} className="nav-icon" /> },
    {  href: "/profile", src: session?.user?.image }
  ];


  return (
    <div className=" border-r h-full overflow-y-auto">
   
      <div className='flex ' >
        <div className='flex flex-col h-[100vh] border-r-2 items-center ml-4 justify-center' >
      {
           navigation.map((item, index) => (
            <div
              key={index}
              className='mb-5 flex items-center cursor-pointer  w-full py-2 rounded-lg group'
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  router.push(item.href);
                }
              }}
            >
              <span className='mr-4 nav-icon-wrapper'>
                {item.icon ? item.icon : <Image 
                src={item?.src} alt='profile pic' 
                className='w-[30px] h-[30px] rounded-full object-cover' 
                width={30}
                height={30}
                />}

              </span>
             
            </div>
          ))
        }
           </div>
      <ul className='w-full ' >
      <h1 className='text-black text-2xl mb-5 font-bold font-playfair px-4 py-4'>MUZUP</h1>
        {friends.map((friend) => (
          <li
            key={friend.id}
            onClick={() => onSelectFriend(friend.id)}
            className="cursor-pointer p-2 my-2 hover:bg-gray-200 rounded-md w-full"
          >
            <div className="flex items-center ">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <p className="font-semibold font-raleway">{friend.name}</p>
                <p className="text-sm text-gray-500 font-nunito">{friend.lastMessage}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default FriendList;
