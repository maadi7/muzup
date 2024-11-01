// components/OnlineStatus.js
import React from 'react';
import useSocket from '../../hooks/useSocket';

const OnlineStatus = ({ userId }) => {
  const { onlineUsers } = useSocket();
  const isOnline = onlineUsers.some(user => user.userId === userId);

  return (
    <div className={`online-status ${isOnline ? 'online' : 'offline'}`}>
      <span className="status-dot"></span>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};

export default OnlineStatus;