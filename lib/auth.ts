import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { sql } from '@/lib/db';
import CredentialsProvider from 'next-auth/providers/credentials';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      id: 'google-onetap',
      name: 'Google One Tap',
      credentials: {
        credential: { type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.credential) return null;
        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: credentials.credential,
            audience: process.env.GOOGLE_CLIENT_ID,
          });
          const payload = ticket.getPayload();
          if (!payload || !payload.email) return null;

          return {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            image: payload.picture,
          };
        } catch (error) {
          console.error('Google One Tap verification failed:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user.email) return false;

      try {
        // Check if admin
        const admins: any[] = await sql('SELECT * FROM admins WHERE email = $1 AND status = $2', [user.email, 'ACTIVE']);
        if (admins.length > 0) {
          user.role = 'ADMIN';
          user.dbId = admins[0].id;
          return true;
        }

        // Check if user
        const users: any[] = await sql('SELECT * FROM users WHERE email = $1', [user.email]);
        if (users.length > 0) {
          user.role = 'USER';
          user.dbId = users[0].id;
          return true;
        }

        // If neither, assign a temporary role 'NEW_USER'
        // The middleware will catch this and redirect to /register
        user.role = 'NEW_USER';
        return true;
      } catch (error) {
        console.error('Error during signIn check', error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      // initial sign in
      if (user) {
        token.role = user.role;
        token.dbId = user.dbId;
      }
      
      // Update session if user has just registered
      if (trigger === 'update' && session?.role === 'USER') {
        token.role = 'USER';
        token.dbId = session.dbId;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.dbId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect back to login on error
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
