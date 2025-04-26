import React, { useState, useEffect } from "react";
import Image from "next/image";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import MessageIcon from "@mui/icons-material/Message";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useUserStore } from "../../lib/store";
import { useRouter } from "next/router";
import axios from "axios";

const SideBar = () => {
  const router = useRouter();
  const iconSize = 28;
  const { spotifySession, user } = useUserStore();
  const [profilePic, setProfilePic] = useState(null);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${url}/api/user?userId=${user?._id}`);
        if (response && response.data.profilePic) {
          setProfilePic(response.data.profilePic);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const navigation = [
    {
      href: "/dashboard",
      icon: <HomeIcon style={{ fontSize: iconSize }} className="nav-icon" />,
    },
    {
      href: "#",
      icon: <SearchIcon style={{ fontSize: iconSize }} className="nav-icon" />,
      onClick: () => setIsModalVisible(true),
    },
    {
      href: "/messages",
      icon: <MessageIcon style={{ fontSize: iconSize }} className="nav-icon" />,
    },
    {
      href: "/notifications",
      icon: (
        <NotificationsIcon
          style={{ fontSize: iconSize }}
          className="nav-icon"
        />
      ),
    },
    { href: `/profile/${user?._id}`, src: profilePic || "" },
  ];

  return (
    <div className="w-16 h-full border-r border-gray-300 flex flex-col items-center justify-center py-4">
      {navigation.map((item, index) => (
        <div
          key={index}
          className="mb-5 flex items-center justify-center cursor-pointer w-12 h-12 rounded-full hover:bg-gray-200"
          onClick={() => {
            if (item.onClick) {
              item.onClick();
            } else {
              router.push(item.href);
            }
          }}
        >
          {item.icon ? (
            item.icon
          ) : (
            <Image
              src={item?.src}
              alt="profile pic"
              className="w-[30px] h-[30px] rounded-full object-cover"
              width={30}
              height={30}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SideBar;
