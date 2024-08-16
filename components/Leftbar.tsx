import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

const Leftbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const iconSize = 28;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const navigation = [
    { name: "Home", href: "/dashboard", icon: <HomeIcon style={{ fontSize: iconSize }} className="nav-icon" /> },
    { name: "Search", href: "#", icon: <SearchIcon style={{ fontSize: iconSize }} className="nav-icon" />, onClick: () => setIsModalVisible(true) },
    { name: "Messages", href: "/messages", icon: <MessageIcon style={{ fontSize: iconSize }} className="nav-icon" /> },
    { name: "Notifications", href: "/notifications", icon: <NotificationsIcon style={{ fontSize: iconSize }} className="nav-icon" /> },
    { name: "Profile", href: "/profile", src: session?.user.image }
  ];

  return (
    <div className='flex flex-col items-start py-6 px-6 sticky top-0 left-0'>
      <div>
        <h1 className='text-black text-4xl h-[15vh] font-bold font-playfair'>MUZUP</h1>
      </div>
      <div className='flex flex-col mt-10 items-start text-[16px] font-raleway uppercase font-semibold'>
        {
          navigation.map((item, index) => (
            <div
              key={index}
              className='mb-5 flex items-center cursor-pointer hover:bg-gray-200 w-full px-4 py-4 rounded-lg group'
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
                className='w-[35px] h-[35px] rounded-full object-cover' 
                width={35}
                height={35}
                />}

              </span>
              <p>
                {item.name}
              </p>
            </div>
          ))
        }
      </div>

      {isModalVisible && (
        <div className='fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white w-[600px] h-[450px] p-6 rounded-lg shadow-lg relative z-50'>
            <button onClick={() => setIsModalVisible(false)} className='absolute top-2 right-2'>
              <CloseIcon />
            </button>
            <div className='relative mt-6 w-full'>
              <input
                type='text'
                placeholder='Search...'
                className='w-full p-2 pl-10 border border-gray-300 rounded-lg'
              />
              <SearchIcon className='absolute left-2 top-2' />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leftbar;
