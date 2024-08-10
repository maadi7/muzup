"use client"

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import HomePage from '@/components/HomePage';
import {useUserStore} from "../lib/store"
import axios from 'axios';


export default function Home() {
  const router = useRouter();
  const addUser = useUserStore((state) => state?.addUser);
  const user = useUserStore((state) => state.user)
  const setSpotifySession = useUserStore((state) => state.setSpotifySession);
  const { data: session, status } = useSession();
 

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          console.log(session.user.email);
          const { data: user } = await axios.get("http://localhost:3001/api/user/email", {
            params: { email: session.user.email },
          });
          console.log(user);
          addUser(user);
          router.replace("/dashboard")
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    
  
    if (status === 'loading') return; // Do nothing while loading
  
    if (session?.user && user) {
      router.replace('/dashboard');
    }

    if (session) {
      setSpotifySession({
        accessToken: session.accessToken,
        expiresAt: session.expires,
        user: {
          email: session.user.email,
          image: session.user.image,
          name: session.user.name,
        },
      });
    }
   

    if (session?.user) {
      fetchUserData();
    }

    
  
    console.log(session);
  }, [session, status, router, setSpotifySession]);


  console.log('Session:', session);

  return (
    <div>
      <Navbar/>

        <>
        <HomePage/>
        </>
  
    
      
    </div>
  );
}
