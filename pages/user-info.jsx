import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';


const UserInfo = () => {
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const { data: session } = useSession();
  console.log(session?.user?.image);

  useEffect(() => {
    if (session?.user?.image) {
      setProfilePicPreview(session.user.image);
    }
  }, [session]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to backend)
    console.log('Username:', username);
    console.log('Birthdate:', birthdate);
    console.log('Profile Pic:', profilePic);
    console.log('Terms Accepted:', termsAccepted);

    // Reset form fields if needed
    setUsername('');
    setBirthdate('');
    setProfilePic(null);
    setTermsAccepted(false);
    setProfilePicPreview(null);
  };

  useEffect(()=>{
    
  }, [])

  return (
    <>
     <h1 className="text-3xl font-bold mb-6 text-center text-primary mt-10">MUZUP</h1>
    <div className="max-w-md mx-auto p-6  rounded-lg shadow-md mt-20 ">
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
      </div>

      {/* Profile Picture Input */}
      <div className="mb-4">
        <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">
          Profile Picture(Optional)
        </label>
        <input
          type="file"
          id="profilePic"
          name="profilePic"
          onChange={handleProfilePicChange}
          defaultValue={session?.user?.image}
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
        onClick={handleSubmit}
        className="bg-primary hover:bg-indigo-700 mt-10 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 w-full"
      >
        Submit
      </button>
    </div>
    </>
  );
}

export default UserInfo;
