import { signIn } from 'next-auth/react';
import React from 'react';

const Login: React.FC = () => (
  <div>
    <h1>Login to Muzup</h1>
    <button onClick={() => signIn('spotify')}>Login with Spotify</button>
  </div>
);

export default Login;
