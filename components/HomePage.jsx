import React from 'react';
import banner from '@/assets/banner3.png'; // Assuming banner.png is in the public folder
import Image from 'next/image';
import spotify from "@/assets/spotify.png";
import { useSession, signIn, signOut } from 'next-auth/react';

const HomePage = () => {
  return (
    <div className='py-12 px-24 relative w-full flex items-center gap-48 '>
      <div className="top-0 right-0 left-0 bottom-0  bg-contain absolute -z-10 opacity-4">
      <Image src={banner} alt='MUZUP'  width={795} className='bg-contain w-full max-h-[85.7vh] ' />
      </div>
      <div className='flex flex-col justify-between !w-[700px] text-white' >
        <h1 className="text-4xl font-bold leading-[50px] mb-10">Want to share your music experience with others?</h1>
        <p className="text-lg font-semibold mb-10">Create your Account Now!</p>
        <button className="bg-primary hover:bg-primary text-[#ffffff] font-semibold py-2 px-4 rounded w-[200px] mt-24 flex justify-center items-center gap-3"
        onClick={() => signIn('spotify')}
        >
            Add Spotify
            <Image src={spotify} alt='spotify' height={20} width={20} />
            </button>
      </div>
    </div>
  );
}

export default HomePage;
