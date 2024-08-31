// import React, { useState, useEffect } from 'react';
// import SendIcon from '@mui/icons-material/Send';
// import axios from 'axios';
// import { useUserStore } from '../../lib/store';

// const Chat = ({ selectedFriendId, messages, sendMessage, currentChat }) => {
//   const [inputValue, setInputValue] = useState('');
//   const url = process.env.NEXT_PUBLIC_SERVER_URL;
//   const [currentFriend, setCurrentFriend] = useState(null)
//   const {user} = useUserStore();

//   useEffect(()=>{
//     const fetchFriend = async () => {
//       try {
//         const res = await axios(`${url}/api/user?userId=`+selectedFriendId);
//         setCurrentFriend(res.data)
//       } 
//       catch (error) {
//         console.log(error);
//       }

//     }
//     fetchFriend();
//   }, [selectedFriendId])

//   console.log(messages);

//   useEffect(() =>{
//     const getMessage = async () =>{
//       try {
//         const res = await axios.get(`${url}/api/message/`+currentChat?._id);
//         setMessages(res.data);
//       } catch (error) {
//         console.log(error);
//       }
      
//     }
//     getMessage();
//    }, [currentChat]);

//   if (!selectedFriendId) {
//     return <div className="p-4 flex items-center justify-center h-full text-3xl">Select a friend to start chatting.</div>;
//   }


//   const handleSendMessage = async (e) => {
//     e.preventDefault();

//     const receiverId = currentChat.members.find(
//     (member) => member !== user?._id);

//     sendMessage({ senderId: user?._id, receiverId: selectedFriendId, text: newMessage });

//     const message = {
//       sender: user._id,
//       text: newMessages,
//       conversationId: currentChat._id
//     }
//     try {
//       const res = await axios.post("https://iserver.onrender.com/api/message", message);
//       setMessages([...messages, res.data]);
//       setNewMessages("");
//     } catch (error) {
//       console.log(error);
//     }

    
//     setInputValue(''); 
//   };

//   const handleMatch = (e) => {
   
  
//     console.log("Match button clicked");
//   };

//   return (
//     <div className="py-4 h-full flex flex-col">
//       {/* Friend Header */}
//       <div className="flex items-center mb-4 pb-2 border-b-2 w-full">
//         <img
//           src={currentFriend?.profilePic}
//           alt={currentFriend?.username}
//           className="w-10 h-10 rounded-full mr-2"
//         />
//         <h2 className="text-xl font-bold font-raleway">{currentFriend?.username}</h2>
//       </div>

//       {/* Messages List */}
//       <div className="flex-1 overflow-y-auto px-4 ">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`mb-2 p-2 rounded-md flex items-end ${
//               message.isMine ? 'flex-row-reverse' : 'flex-row'
//             }`}
//           >
//             {/* <img
//               src={message.isMine ? 'https://via.placeholder.com/60' : selectedFriend.avatar}
//               alt={message.isMine ? 'You' : selectedFriend.name}
//               className="w-8 h-8 rounded-full mx-2"
//             /> */}
//             <div
//               className={`p-2 rounded-lg max-w-xs font-nunito font-semibold ${
//                 message.isMine ? 'bg-purple-100 text-right' : 'bg-green-100 text-left'
//               }`}
//             >
//               <p>{message.text}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input Field and Buttons */}
//       <div className="mt-4 flex items-center p-2">
//         <input
//           type="text"
//           placeholder="Type a message"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           className="w-full p-2 border rounded-md mr-2"
//         />
//         <button
//           onClick={handleSendMessage}
//           className=" p-2 rounded-md mr-2"
//         >
//           <SendIcon fontSize='large' />
//         </button>
//         <button
//           onClick={handleMatch}
//           className="bg-primary text-white p-2 rounded-md shadow-lg"
//         >
//           Match
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;
