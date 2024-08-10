"use client"

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { getUserTopArtists, getUserTopTracks, getUserPlaylists, getUserRecentlyPlayed } from '../utils/spotify';
import {  signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import {useUserStore} from "../lib/store"


const UserInfo = () => {

  const addUser = useUserStore((state) => state?.addUser);
  const user = useUserStore((state) => state.user)
  const setSpotifySession = useUserStore((state) => state.setSpotifySession);
  const { data: session, status } = useSession();
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const router = useRouter();
  

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          const { data: user } = await axios.get("http://localhost:3001/api/user/email", {
            params: { email: session.user.email },
          });
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
    if (session?.user?.image) {
      setProfilePicPreview(session.user.image);
    }

    if (session?.user) {
      fetchUserData();
    }

  
    console.log(session);
  }, [session, status, router, setSpotifySession]);
  



  if (!session) {
    return null; // Return null or a loading spinner while checking session
  }


  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleBirthdateChange = (e) => {
    setBirthdate(e.target.value);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);

    // Preview image before upload
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePicPreview(null);
    }
  };

  const handleTermsChange = (e) => {
    setTermsAccepted(e.target.checked);
  };

  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(birthdate).getFullYear();

    if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
      toast.error('Username must be at least 3 characters long');
    }
    if (!birthdate) {
      errors.birthdate = 'Birthdate is required';
      toast.error('Birthdate is required');
    } else if (birthYear >= currentYear) {
      errors.birthdate = `Birth year must be less than ${currentYear}`;
      toast.error(`Birth year must be less than ${currentYear}`);
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // If no profile picture is selected, use session.user.image
      const finalProfilePic = profilePic || session?.user?.image;

      try {
        // Get top artists using the access token
        const accessToken = session?.accessToken;
        const topArtistsData = accessToken ? await getUserTopArtists(accessToken) : [];
        const topTracksData = accessToken ? await getUserTopTracks(accessToken) : [];
        const playListData = accessToken ? await getUserPlaylists(accessToken) : [];
        const recentlyPlayedData = accessToken ? await getUserRecentlyPlayed(accessToken) : [];
        console.log(recentlyPlayedData);

        // Extract the names of the artists
        const topArtists = topArtistsData.items;
        const topTracks = topTracksData.items;
        const playList = playListData.items;
        const recentlyPlayed = recentlyPlayedData.items;
        
        const extractedArtists = topArtists.map(artist => ({
          id: artist.id,
          followers: artist.followers.total, 
          genres: artist.genres,
          images: artist.images.map(image => image.url), 
          name: artist.name,
          popularity: artist.popularity,
          type: artist.type
        }));

        const extractedTopTracks = topTracks.map(track => ({
          id: track.id,
          name: track.name,
          popularity: track.popularity,
          is_local: track.is_local,
          album: {
            album_type: track.album.album_type,
            id: track.album.id,
            name: track.album.name,
            images: track.album.images.map(image => image.url)
          },
          artists: track.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
            type: artist.type
          })),
          preview_url: track.preview_url,
          type: track.type,
          track_number: track.track_number
        }));

        const extractedRecentlyPlayed = recentlyPlayed.map((song) => ({
          played_at: song.played_at,
          id: song.track.id,
          name: song.track.name,
          popularity: song.track.popularity,
          is_local: song.track.is_local,
          album: {
            album_type: song.track.album.album_type,
            id: song.track.album.id,
            name: song.track.album.name,
            images: song.track.album.images.map(image => image.url)
          },
          artists: song.track.artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
            type: artist.type
          })),
          preview_url: song.track.preview_url,
          type: song.track.type,
          track_number: song.track.track_number
        })); 

        console.log("username:", username);
        console.log('Terms Accepted:', recentlyPlayed);
        

        const response = await axios.post(`http://localhost:3001/api/auth/form-sumbit`, {
          username: username,
          email: session?.user?.email,
          birthdate: birthdate,
          profilePic: finalProfilePic,
          topArtists: extractedArtists,
          topTracks: extractedTopTracks,
          recentlyPlayed: extractedRecentlyPlayed
        });
        if (response.status === 201) {
          toast.success('Form submitted successfully');
          addUser({
            _id: response.data._id, // Assuming the response contains the user ID
            username,
            email: session?.user?.email,
            birthdate: new Date(birthdate),
            profilePic: finalProfilePic,
            topArtists: extractedArtists,
            topTracks: extractedTopTracks,
            recentlyPlayed: extractedRecentlyPlayed,
            followers: response.data.followers,
            followings: response.data.followings,
            pendingRequests: response.data.pendingRequests,
            requestedTo: response.data.requestedTo,
            createdAt: new Date(response.data.createdAt), 
            updatedAt: new Date(response.data.updatedAt), 
          });

          setSpotifySession({
            accessToken: session.accessToken,
            expiresAt: session.expires,
            user: {
              email: session.user.email,
              image: session.user.image,
              name: session.user.name,
            }
          });

          setUsername('');
          setBirthdate('');
          setProfilePic(null);
          setTermsAccepted(false);
          setProfilePicPreview(session?.user?.image || null);
          setErrors({});
                  // Redirect to dashboard
        router.push('/dashboard');
            console.log(response.data);
        } else {
          toast.error('Failed to submit the form');
          console.log(response.data);
        }
      } catch (error) {
        if (error?.response?.status === 401) {
          toast.error(error.response.data);
        } 
       
        else {
          toast.error('An error occurred while submitting the form');
        }

        console.log(error?.response?.status);
        console.error(error);
      }
    }
  };
  console.log(session?.user?.email);

  return (
    <>
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6 text-center text-primary mt-10">MUZUP</h1>
      <div className="max-w-md mx-auto p-6 rounded-lg shadow-md mt-20">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {/* Profile Picture Preview */}
            {profilePicPreview && (
              <div className="flex justify-center mb-4">
                <img
                  src={profilePicPreview}
                  alt="Profile Preview"
                  className="rounded-full w-20 h-20 object-cover border-2 border-gray-200"
                />
              </div>
            )}

            {/* Username Input */}
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Birthdate Input */}
          <div className="mb-4">
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
              Birthdate
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={birthdate}
              onChange={handleBirthdateChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
            {errors.birthdate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthdate}</p>
            )}
          </div>

          {/* Profile Picture Input */}
          <div className="mb-4">
            <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">
              Profile Picture (Optional)
            </label>
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              onChange={handleProfilePicChange}
              accept=".jpg, .jpeg, .png"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Terms Checkbox */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                I accept the terms and conditions
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-primary hover:bg-indigo-700 mt-10 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 w-full"
          >
            Submit
          </button>
        </form>
        <h3>Hi, {session?.user?.name}</h3>
        <button className='ml-5 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'  onClick={() => signOut()}>Sign out</button>
        <h3>Hi, {session?.user?.name}</h3>
        <button className='ml-5 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'  onClick={() => signIn()}>Sign out</button>
      </div>
    </>
  );
}

export default UserInfo;
