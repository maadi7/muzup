"use client"

import Navbar from '@/components/Navbar';
import { useSession, signIn, signOut } from 'next-auth/react';


export default function Home() {
  const { data: session } = useSession();

  console.log('Session:', session);

  return (
    <div>
      <Navbar/>
      {!session ? (
        <>
          <p className='text-[18px]' >Not signed in</p>
          <button className='ml-5 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700' onClick={() => signIn('spotify')}>Sign in with Spotify</button>
        </>
      ) : (
        <>
          <h1 className='' >Signed in as {session.user.email}</h1>
          <h3>Hi, {session.user.name}</h3>
          {/* {session.user.image && (
            <Image src={session.user.image} alt="profile pic" width={100} height={100} />
          )} */}
          <button className='ml-5 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'  onClick={() => signOut()}>Sign out</button>
         
        </>
        
      )}
      
    </div>
  );
}
