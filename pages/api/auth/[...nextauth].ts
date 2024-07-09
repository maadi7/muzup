// pages/api/auth/[...nextauth].ts

import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const spotifyScopes = [
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'playlist-read-private',
].join(',');

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: `https://accounts.spotify.com/authorize?scope=${spotifyScopes}`,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token; // If using refresh tokens
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});
