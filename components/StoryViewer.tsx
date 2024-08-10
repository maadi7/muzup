// StoryViewer.tsx
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface StoryViewerProps {
  user: {
    username: string;
    userImg: string;
    stories: string[]; // URLs of story images
  };
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <button onClick={onClose} className="absolute top-4 right-4 text-white">
        <CloseIcon fontSize="large" />
      </button>
      <div className="relative w-full max-w-2xl">
        <h2 className="text-white text-center mb-4 text-2xl">{user.username}</h2>
        <div className="flex overflow-x-scroll snap-x">
          {user.stories.map((story, index) => (
            <div key={index} className="flex-shrink-0 w-full snap-center">
              <img src={story} alt={`Story ${index}`} className="w-full h-[80vh] object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
