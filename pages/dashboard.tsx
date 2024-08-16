"use client"

import Feed from '@/components/Feed'
import Leftbar from '@/components/Leftbar'
import Rightbar from '@/components/Rightbar'
import React, {useEffect} from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';


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
    return null; 
  }
  return (
    <div className='w-full h-full flex'>
      <div className='min-w-1/6 border-r-2'>
        <Leftbar />
      </div>
      <div className='w-[60%] border-l-2'>
        <Feed />
      </div>
      <div className='w-1/5'>
        <Rightbar />
      </div>
    </div>
  )
}

export default Dashboard
