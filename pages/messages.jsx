import React, { useState } from 'react';
import FriendList from '../components/Messages/FriendList';
import Chat from '../components/Messages/Chat';

const Messages = () => {
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const friends = [
    { id: 1, name: 'Aditya', avatar: 'https://via.placeholder.com/100', lastMessage: 'Hey there!' },
    { id: 2, name: 'Abhishek', avatar: 'https://via.placeholder.com/100', lastMessage: 'What\'s up?' },
    // Add more friends here
  ];

  const messages = [
    { text: 'Hey!', isMine: true },
    { text: 'Hi, how are you?', isMine: false },
    { text: 'Hi, how are you?', isMine: false },
    { text: 'Hi, how are you?', isMine: false },
    // Add more messages here
  ];

  const selectedFriend = friends.find(friend => friend.id === selectedFriendId);

  return (
    <div className="flex w-full h-[100vh]">
      <div className="w-1/3 !h-full">
        <FriendList  friends={friends} onSelectFriend={setSelectedFriendId} />
      </div>
      <div className="w-2/3 !h-full">
        <Chat selectedFriend={selectedFriend} messages={messages} />
      </div>
    </div>
  );
};

export default Messages;
