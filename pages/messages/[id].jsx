// pages/messages/[id].js
import React, { useEffect, useState, useRef, useCallback } from "react";
import SideBar from "../../components/Messages/SideBar";
import { useUserStore } from "../../lib/store";
import Conversations from "../../components/Messages/Conversations";
import { useRouter } from "next/router";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import useSocket from "../../hooks/useSocket";
import MatchModal from "../../components/MatchModel";
import Image from "next/image";
import ConnectionStatus from "../../components/Messages/ConnectionStatus";
import OnlineStatus from "../../components/Messages/OnlineStatus";
import TypingIndicator from "../../components/Messages/TypingIndicator";
import MessageStatus from "../../components/Messages/MessageStatus";
import { debounce } from "lodash";

const Chat = () => {
  const { user } = useUserStore();
  const router = useRouter();
  const { id } = router.query;
  const url = process.env.NEXT_PUBLIC_SERVER_URL;
  const [currentFriend, setCurrentFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const messageContainerRef = useRef(null);

  const {
    isConnected,
    sendMessage,
    subscribeToMessages,
    typingUsers,
    sendTypingStatus,
    markMessageAsSeen,
    getMessageStatus,
    messageStatuses,
    initializeMessageStatuses,
    isUserOnline,
  } = useSocket();

  // Debounced typing status
  const debouncedTypingStatus = useRef(
    debounce((userId, receiverId, conversationId, isTyping) => {
      sendTypingStatus(userId, receiverId, conversationId, isTyping);
    }, 300)
  ).current;

  // Add message to local state
  const addMessage = useCallback((message) => {
    const messageWithTime = {
      ...message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: message.status || "sent",
    };

    setMessages((prev) => [...prev, messageWithTime]);
  }, []);

  // Subscribe to incoming messages
  useEffect(() => {
    // Skip if no conversation ID
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages((message) => {
      // Only add if message belongs to current conversation
      if (message.conversationId === conversationId) {
        addMessage(message);

        // Mark as seen immediately if recipient is current user
        if (message.sender === currentFriend?._id && user?._id) {
          markMessageAsSeen(
            message.sender,
            user._id,
            conversationId,
            message.messageId || message._id
          );
        }
      }
    });

    return unsubscribe;
  }, [
    subscribeToMessages,
    conversationId,
    addMessage,
    currentFriend,
    user,
    markMessageAsSeen,
  ]);

  // Load messages when conversation ID changes
  useEffect(() => {
    const getMessages = async () => {
      if (!conversationId) return;

      setIsLoading(true);
      try {
        const { data } = await axios.get(
          `${url}/api/messages/${conversationId}`
        );

        // Format messages with timestamp and set up status tracking
        const messagesWithTime = data.map((msg) => ({
          ...msg,
          time: new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        // Initialize status tracking for all messages with the conversationId
        const initialStatuses = {};
        data.forEach((msg) => {
          initialStatuses[msg._id] = msg.status || "sent";
        });

        initializeMessageStatuses(initialStatuses, conversationId);
        setMessages(messagesWithTime);

        // Mark unread messages as seen
        const unreadMessages = data.filter(
          (msg) =>
            msg.sender === currentFriend?._id &&
            msg.status !== "seen" &&
            user?._id
        );

        unreadMessages.forEach((msg) => {
          markMessageAsSeen(msg.sender, user?._id, conversationId, msg._id);
        });
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getMessages();
  }, [
    conversationId,
    url,
    currentFriend,
    user,
    markMessageAsSeen,
    initializeMessageStatuses,
  ]);

  // Get or create conversation
  useEffect(() => {
    const getConversation = async () => {
      if (!id || !user?._id) return;

      try {
        // Try to find existing conversation
        const response = await axios.get(
          `${url}/api/conversation/find/${user._id}/${id}`
        );

        if (response.data) {
          setConversationId(response.data._id);
          // Find the other user in the conversation
          setCurrentFriend(
            response.data.members.find((member) => member._id !== user._id)
          );
        } else {
          // If no conversation exists, create one
          const newConversation = await axios.post(`${url}/api/conversation`, {
            senderId: user._id,
            receiverId: id,
          });
          setConversationId(newConversation.data._id);
        }
      } catch (error) {
        console.error("Error getting/creating conversation:", error);
      }
    };

    getConversation();
  }, [id, user, url]);

  // Get friend details
  useEffect(() => {
    const fetchFriend = async () => {
      if (!id) return;

      try {
        const res = await axios(`${url}/api/user?userId=${id}`);
        setCurrentFriend(res.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchFriend();
  }, [id, url]);

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !currentFriend) return;

    try {
      // Save message to database
      const res = await axios.post(`${url}/api/messages`, {
        sender: user?._id,
        text: newMessage.trim(),
        conversationId: conversationId,
        receiverId: currentFriend?._id,
      });

      // Send via socket
      sendMessage({
        sender: user?._id,
        text: newMessage.trim(),
        conversationId: conversationId,
        receiverId: currentFriend?._id,
        messageId: res.data._id,
      });

      // Add to local messages
      addMessage({
        ...res.data,
        sender: user?._id,
      });

      // Clear message input
      setNewMessage("");

      // Reset typing status
      debouncedTypingStatus(
        user?._id,
        currentFriend?._id,
        conversationId,
        false
      );
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle typing indicators
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Only send typing events if we have necessary IDs
    if (user?._id && currentFriend?._id && conversationId) {
      // Send typing status
      debouncedTypingStatus(
        user._id,
        currentFriend._id,
        conversationId,
        e.target.value.length > 0
      );
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Open match modal
  const handleMatch = () => {
    setIsMatchModalOpen(true);
  };

  // Close match modal
  const closeMatchModal = () => {
    setIsMatchModalOpen(false);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex w-full h-screen">
      <SideBar />
      <div className="w-1/3 h-full border-r border-gray-300 overflow-y-auto">
        <Conversations />
      </div>
      <div className="py-4 h-full flex flex-col w-full">
        {currentFriend ? (
          <>
            <div className="flex items-center mb-4 pb-2 border-b-2 w-full px-4">
              <img
                src={currentFriend.profilePic}
                alt={currentFriend.username}
                className="w-10 h-10 rounded-full mr-2"
              />
              <div>
                <h2 className="text-xl font-bold font-raleway">
                  {currentFriend.username}
                </h2>
                <OnlineStatus isOnline={isUserOnline(currentFriend._id)} />
              </div>
            </div>

            {/* {!isConnected && <ConnectionStatus />} */}

            <div
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto px-4 relative"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Start a conversation with {currentFriend.username}
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`mb-2 p-2 rounded-md flex items-end ${
                      message.sender === user?._id
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    {message.sender !== user?._id && (
                      <Image
                        src={currentFriend?.profilePic || ""}
                        alt={currentFriend?.username || "UserImage"}
                        className="w-8 h-8 rounded-full mx-2 mb-2"
                        width={32}
                        height={32}
                      />
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs font-nunito font-semibold text-start ${
                        message.sender === user?._id
                          ? "bg-purple-100 text-right"
                          : "bg-green-100 text-left"
                      }`}
                    >
                      <p className="break-words">
                        {message.text}
                        <sub className="text-[10px] text-gray-500 p-2">
                          {message.time}
                        </sub>
                      </p>
                    </div>

                    {message.sender === user?._id && (
                      <MessageStatus
                        status={getMessageStatus(message._id, conversationId)}
                      />
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            {typingUsers[conversationId] === currentFriend?._id && (
              <TypingIndicator />
            )}

            <div className="mt-4 flex items-center p-2 px-4">
              <input
                type="text"
                placeholder="Type a message"
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full p-2 border rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 rounded-md mr-2 text-purple-600 hover:text-purple-800 disabled:text-gray-400"
                disabled={!newMessage.trim()}
              >
                <SendIcon fontSize="large" />
              </button>
              <button
                onClick={handleMatch}
                className="bg-primary text-white p-2 rounded-md shadow-lg hover:bg-purple-700 transition"
              >
                Match
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-xl mb-2">Select a conversation</p>
              <p>or start a new one</p>
            </div>
          </div>
        )}
      </div>

      <MatchModal
        isOpen={isMatchModalOpen}
        onClose={closeMatchModal}
        currentUser={user}
        currentFriend={currentFriend}
      />
    </div>
  );
};

export default Chat;
