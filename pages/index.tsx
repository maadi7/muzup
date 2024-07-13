"use client"

import Navbar from '@/components/Navbar';
import Playlists from '@/components/Playlists';
import RecentlyPlayed from '@/components/RecentlyPlayed';
import TopArtists from '@/components/TopArtists';
import TopGenres from '@/components/TopGenres';
import { useRouter } from 'next/router';
import { useSession, signIn, signOut } from 'next-auth/react';
import HomePage from '@/components/HomePage'


export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();
  if (session) {
    router.replace('/user-info'); // Replace with your actual user info page path
    return null; //  Render nothing while redirecting
  }


  console.log('Session:', session);

  return (
    <div>
      <Navbar/>
      {!session ? (
        <>
        <HomePage/>
          {/* <p className='text-[18px]' >Not signed in</p>
          <button className='ml-5 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700' onClick={() => signIn('spotify')}>Sign in with Spotify</button> */}
        </>
      ) : (
        <>
          {/* <h1 className='' >Signed in as {session.user.email}</h1>
          <h3>Hi, {session.user.name}</h3>
          <button className='ml-5 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'  onClick={() => signOut()}>Sign out</button>
          <TopArtists/>
          <RecentlyPlayed/>
          <TopGenres/>
         <Playlists/> */}
         <h1>Some Error Occured</h1>
         
         
        </>
        
      )}
      
    </div>
  );
}
