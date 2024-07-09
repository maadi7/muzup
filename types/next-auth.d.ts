import NextAuth, { DefaultSession, DefaultUser, DefaultAccount } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
    error?: string;
  }

  interface User extends DefaultUser {
    id: string;
  }

  interface Account extends DefaultAccount {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    userId?: string;
  }
}
