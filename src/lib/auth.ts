/**
 * NextAuth v5 (Auth.js) Configuration
 * Authentication configuration with credentials and OAuth providers
 */

import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/db-actions/auth';
import type { NextAuthConfig, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { UserRole } from '@/types/auth';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      role: UserRole;
    };
  }

  interface User {
    role?: UserRole;
  }
}

// Extend JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    verifyRequest: '/verify-request',
    newUser: '/register',
  },
  providers: [
    // Credentials Provider for email/password login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await authenticateUser(email, password);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch {
          // Don't expose details in error message for security
          return null;
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // GitHub OAuth Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  callbacks: {
    /**
     * Called during sign in.
     * For OAuth accounts, this links the OAuth account to the user.
     * For credentials, we just verify the user exists.
     */
    async signIn({ user, account, profile }) {
      // Always allow sign in for verified users
      if (account?.type === 'oauth') {
        // For OAuth, we automatically link accounts if email matches
        // The PrismaAdapter handles the Account linking
        return true;
      }

      // For credentials, user is already verified in authorize callback
      return true;
    },

    /**
     * Called when creating or updating a JWT token.
     * We add user data to the token here.
     */
    async jwt({ token, user, account, profile }) {
      // On initial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as User).role || 'USER';
      }

      // If we have an OAuth account but no user in token yet,
      // fetch the user from database
      if (account?.type === 'oauth' && !token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          select: { id: true, role: true },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role as UserRole;
        }
      }

      // Refresh role from database on each token refresh
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        });

        if (dbUser) {
          token.role = dbUser.role as UserRole;
        }
      }

      return token;
    },

    /**
     * Called when accessing the session.
     * We add user data to the session here.
     */
    async session({ session, token }): Promise<Session> {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }

      return session;
    },
  },
  events: {
    /**
     * Called when a user creates an account (including OAuth)
     */
    async createUser({ user }) {
      // You could trigger welcome email, create default cart, etc.
      console.log(`New user created: ${user.id}`);
    },

    /**
     * Called when linking an account
     */
    async linkAccount({ user, account }) {
      console.log(`Account linked for user ${user.id}: ${account.provider}`);
    },

    /**
     * Called on sign out
     */
    async signOut({ token }) {
      if (token?.id) {
        console.log(`User signed out: ${token.id}`);
      }
    },
  },
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('NextAuth Debug:', code, metadata);
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Get the current session server-side
 * Use this in Server Components and Route Handlers
 */
export const getSession = auth;

/**
 * Check if a user is authenticated
 * Returns the session if authenticated, null otherwise
 */
export const requireAuth = auth;

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === role;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await hasRole('ADMIN');
  const superAdmin = await hasRole('SUPERADMIN');
  return role || superAdmin;
}
