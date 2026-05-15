import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: number;
      role?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role?: string;
    dbId?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    dbId?: number;
  }
}
