"use client"

import Feed from '@/components/Feed'
import Leftbar from '@/components/Leftbar'
import Rightbar from '@/components/Rightbar'
import React, {useEffect} from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut, signIn } from 'next-auth/react';


const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    if (!session?.user) {
      router.replace('/user-info');
    }
    console.log(session);
  }, [session, status, router]);

  if (!session) {
    return null; // Return null or a loading spinner while checking session
  }
  return (
    <div className='w-full h-full flex'>
      <div className='w-1/4 border-r-2'>
        <Leftbar />
      </div>
      <div className='w-1/2 border-l-2'>
        <Feed />
      </div>
      <div className='w-1/5'>
        <Rightbar />
      </div>
    </div>
  )
}

export default Dashboard
