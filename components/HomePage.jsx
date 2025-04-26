import React from "react";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import spotify from "@/assets/spotify.png";
import backgroundImage from "@/assets/banner4.png"; // Path to the uploaded background image

const HomePage = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#121212] text-white">
      {/* Background Image */}
      <div className="absolute inset-0  z-0">
        <Image
          src={backgroundImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>{" "}
        {/* Dark overlay */}
      </div>

      {/* Content Section */}
      <div className="relative z-10 text-center px-6 md:px-0 max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-nunito !leading-[60px] font-extrabold  mb-6 drop-shadow-lg">
          Want to share your music experience with others?
        </h1>
        <p className="text-lg md:text-xl font-medium mb-6">
          Create your Account Now!
        </p>
        <div className="flex justify-center">
          {" "}
          {/* Added flexbox container */}
          <button
            className="bg-[#1DB954] hover:bg-[#1aa34a] text-white font-bold py-3 px-6 rounded-lg flex items-center gap-3 transition duration-300 ease-in-out transform hover:scale-105"
            onClick={() => signIn("spotify")}
          >
            Add Spotify
            <Image src={spotify} alt="spotify" height={24} width={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
