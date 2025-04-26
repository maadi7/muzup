// components/Messages/MessageStatus.js
import React from "react";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const MessageStatus = ({ status }) => {
  // Handle undefined status gracefully
  if (!status) return <DoneIcon fontSize="small" className="text-gray-400" />;

  return (
    <div className="ml-1 text-xs">
      {status === "sending" && (
        <AccessTimeIcon fontSize="small" className="text-gray-400" />
      )}
      {status === "sent" && (
        <DoneIcon fontSize="small" className="text-gray-400" />
      )}
      {status === "delivered" && (
        <DoneIcon fontSize="small" className="text-blue-500" />
      )}
      {status === "seen" && (
        <DoneAllIcon fontSize="small" className="text-blue-500" />
      )}
      {status === "error" && (
        <ErrorOutlineIcon fontSize="small" className="text-red-500" />
      )}
    </div>
  );
};

export default MessageStatus;
