/**
 * NextAuth Route Handler
 * Handles GET and POST requests for authentication
 */

import { handlers } from '@/lib/auth';

/**
 * GET handler for NextAuth
 * Used for session verification and CSRF token retrieval
 */
export const GET = handlers.GET;

/**
 * POST handler for NextAuth
 * Used for sign in, sign out, and other authentication actions
 */
export const POST = handlers.POST;
