import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';

const MatchModal = ({ isOpen, onClose, currentUser, currentFriend }) => {
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const url = process.env.NEXT_PUBLIC_SERVER_URL;

  const getMatchText = (percentage) => {
    if (percentage >= 90) return "Best Friends!";
    if (percentage >= 70) return "Great Match!";
    if (percentage >= 50) return "Good Friends";
    if (percentage >= 30) return "Casual Friends";
    return "Just Getting to Know Each Other";
  };

  useEffect(() => {
    let animationInterval;
    let apiTimeout;

    const fetchMatchPercentage = async () => {
      try {
        const { data } = await axios.get(`${url}/api/match/${currentFriend._id}/${currentUser._id}`);
        
        clearInterval(animationInterval);
        setMatchPercentage(data.matchPercentage);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    const randomPercentage = () => Math.floor(Math.random() * 101);

    if (isOpen) {
      setLoading(true);
      setMatchPercentage(randomPercentage());

      animationInterval = setInterval(() => {
        setMatchPercentage(randomPercentage());
      }, 200);

      apiTimeout = setTimeout(fetchMatchPercentage, 3000);
    }

    return () => {
      clearInterval(animationInterval);
      clearTimeout(apiTimeout);
    };
  }, [isOpen, currentFriend?._id, currentUser?._id, url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 font-raleway">Muzup Meter</h2>
        <div className="flex items-center justify-between w-full">
          <img src={currentUser?.profilePic || '/default-profile.png'} alt={currentUser?.username} className="w-20 h-20 rounded-full" />
          <div className="w-40 h-40 m-10">
            <CircularProgressbar
              value={matchPercentage}
              text={`${matchPercentage}%`}
              styles={buildStyles({
                textColor: '#333',
                pathColor: `rgba(62, 152, 199, ${matchPercentage / 100})`,
                trailColor: '#d6d6d6',
                textSize: '16px',
                pathTransitionDuration: 0.2,
              })}
              strokeWidth={8}
            />
          </div>
          <img src={currentFriend?.profilePic || '/default-profile.png'} alt={currentFriend?.username} className="w-20 h-20 rounded-full" />
        </div>
        <div className="mt-4 text-center">
          <p className="font-semibold text-lg">{getMatchText(matchPercentage)}</p>
          {loading && <p className="text-sm text-gray-500">Calculating your friendship...</p>}
        </div>
        <button onClick={onClose} className="bg-primary text-white px-4 py-2 rounded-md mt-4">
          Close
        </button>
      </div>
    </div>
  );
};

export default MatchModal;