/**
 * NextAuth Type Declarations
 * Extend NextAuth types with our custom types
 */

import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';
import type { UserRole } from '@/types/auth';

// Extend the default session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: UserRole;
  }
}

// Extend the default JWT
declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
  }
}
