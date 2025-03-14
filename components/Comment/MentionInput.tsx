import { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  profilePic?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  users: User[];
  placeholder: string;
  initialMention?: string;
}

const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  users,
  placeholder,
  initialMention,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Initialize input with @mention if provided
  useEffect(() => {
    if (initialMention && !inputValue) {
      setInputValue(`@${initialMention} `);
      onChange(`@${initialMention} `);
    }
  }, [initialMention]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Handle mentions suggestions
    const lastWord = newValue.split(" ").pop() || "";
    if (lastWord.startsWith("@") && lastWord.length > 1) {
      const query = lastWord.slice(1).toLowerCase();
      const filtered = users.filter((user) =>
        user.username.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectUser = (username: string) => {
    const words = inputValue.split(" ");
    words[words.length - 1] = `@${username} `;
    const newValue = words.join(" ");
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full p-2 rounded-lg border-2 border-gray-300 focus:border-gray-600 outline-none"
      />
      {showSuggestions && filteredUsers.length > 0 && (
        <div className="absolute left-0 right-0 bg-white border rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg z-10">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectUser(user.username)}
            >
              @{user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
