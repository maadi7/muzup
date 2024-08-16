import React from 'react';

// Sample data for user suggestions
const suggestions = [
  {
    id: 1,
    username: 'suggestedUser1',
    profilePic: 'https://via.placeholder.com/50' // Replace with actual image URL
  },
  {
    id: 2,
    username: 'suggestedUser2',
    profilePic: 'https://via.placeholder.com/50' // Replace with actual image URL
  },
  {
    id: 3,
    username: 'suggestedUser3',
    profilePic: 'https://via.placeholder.com/50' // Replace with actual image URL
  }
];

const Rightbar = () => {
  return (
    <div className="py-4 pr-4 font-raleway">
      <h2 className="text-lg font-semibold mb-8 font-raleway">Suggestions for You</h2>
      <div>
        {suggestions.map(user => (
          <div key={user.id} className="flex  mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src={user.profilePic}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-4 mt-1">
              <h3 className="font-bold mb-1 font-nunito">{user.username}</h3>
              <p className='text-sm font-semibold hover:text-primary cursor-pointer text-gray-600' >Let&apos;s Match</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rightbar;
