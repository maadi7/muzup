// components/OnlineStatus.js
import React from "react";

const OnlineStatus = ({ isOnline }) => {
  return (
    <div className={`online-status ${isOnline ? "online" : "offline"}`}>
      <span className="status-dot"></span>
      {isOnline ? "Online" : "Offline"}
    </div>
  );
};

export default OnlineStatus;
