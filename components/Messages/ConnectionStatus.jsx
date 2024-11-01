import React from 'react';
import useSocket from '../../hooks/useSocket';

const ConnectionStatus = () => {
  const { isConnected } = useSocket();

  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};

export default ConnectionStatus;