import React from "react";
import { Check, CheckCheck } from "lucide-react";

const MessageStatus = ({ status }) => {
  return (
    <div className="text-xs text-gray-500 ml-2">
      {status === "sent" && <Check className="w-4 h-4" />}
      {status === "delivered" && <CheckCheck className="w-4 h-4" />}
      {status === "seen" && <CheckCheck className="w-4 h-4 text-blue-500" />}
    </div>
  );
};

export default MessageStatus;
