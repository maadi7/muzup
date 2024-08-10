import React, { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';

const Chat = ({ selectedFriend, messages }) => {
  const [inputValue, setInputValue] = useState('');

  if (!selectedFriend) {
    return <div className="p-4 flex items-center justify-center h-full text-3xl">Select a friend to start chatting.</div>;
  }

  const handleSendMessage = () => {
    // Implement send message logic
    console.log("Message sent:", inputValue);
    setInputValue(''); // Clear input field
  };

  const handleMatch = () => {
    // Implement match logic
    console.log("Match button clicked");
  };

  return (
    <div className="py-4 h-full flex flex-col">
      {/* Friend Header */}
      <div className="flex items-center mb-4 pb-2 border-b-2 w-full">
        <img
          src={selectedFriend.avatar}
          alt={selectedFriend.name}
          className="w-10 h-10 rounded-full mr-2"
        />
        <h2 className="text-xl font-bold font-raleway">{selectedFriend.name}</h2>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 ">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-md flex items-end ${
              message.isMine ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* <img
              src={message.isMine ? 'https://via.placeholder.com/60' : selectedFriend.avatar}
              alt={message.isMine ? 'You' : selectedFriend.name}
              className="w-8 h-8 rounded-full mx-2"
            /> */}
            <div
              className={`p-2 rounded-lg max-w-xs font-nunito font-semibold ${
                message.isMine ? 'bg-purple-100 text-right' : 'bg-green-100 text-left'
              }`}
            >
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input Field and Buttons */}
      <div className="mt-4 flex items-center p-2">
        <input
          type="text"
          placeholder="Type a message"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 border rounded-md mr-2"
        />
        <button
          onClick={handleSendMessage}
          className=" p-2 rounded-md mr-2"
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
  );
};

export default Chat;
