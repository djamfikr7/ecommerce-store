/**
 * Authentication Database Actions
 * Server actions for user authentication and management
 */

import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  CreateUserInput,
  UpdateProfileInput,
  AuthUser,
  UserWithAddress,
} from '@/types/auth';
import {
  AuthError,
  InvalidCredentialsError,
  EmailExistsError,
  UserNotFoundError,
} from '@/lib/errors/auth';

const BCRYPT_ROUNDS = 12;

/**
 * Create a new user account
 * @param data - User creation data including email, password, and optional name
 * @returns Created user without password
 */
export async function createUser(data: CreateUserInput): Promise<AuthUser> {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUser) {
    throw new EmailExistsError(data.email);
  }

  // Hash password if provided
  const hashedPassword = data.password
    ? await hash(data.password, BCRYPT_ROUNDS)
    : undefined;

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name?.trim(),
      image: data.image,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Authenticate a user with email and password
 * @param email - User email
 * @param password - User password
 * @returns Authenticated user
 * @throws InvalidCredentialsError if credentials are invalid
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      phone: true,
      password: true, // Select password for verification
    },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  // If user doesn't have a password (OAuth-only account)
  if (!user.password) {
    throw new InvalidCredentialsError();
  }

  // Verify password
  const isValidPassword = await compare(password, user.password);

  if (!isValidPassword) {
    throw new InvalidCredentialsError();
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Get user by ID
 * @param id - User ID
 * @returns User or null if not found
 */
export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Get user by email
 * @param email - User email
 * @returns User or null if not found
 */
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Update user profile
 * @param userId - User ID
 * @param data - Profile update data
 * @returns Updated user
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<AuthUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name?.trim(),
      image: data.image,
      phone: data.phone,
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Get user with addresses
 * @param userId - User ID
 * @returns User with addresses or null if not found
 */
export async function getUserWithAddresses(
  userId: string
): Promise<UserWithAddress | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: {
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      },
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      addresses: {
        select: {
          id: true,
          userId: true,
          type: true,
          firstName: true,
          lastName: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
          phone: true,
          isDefault: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return user;
}

/**
 * Link an OAuth account to a user
 * @param userId - User ID
 * @param provider - OAuth provider name
 * @param providerAccountId - OAuth provider account ID
 */
export async function linkOAuthAccount(
  userId: string,
  provider: string,
  providerAccountId: string
): Promise<void> {
  // Check if account is already linked to another user
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
  });

  if (existingAccount && existingAccount.userId !== userId) {
    throw new AuthError(
      `This ${provider} account is already linked to another user`,
      'ACCOUNT_ALREADY_LINKED',
      409
    );
  }
}

/**
 * Check if user has a password set
 * @param userId - User ID
 * @returns True if user has a password
 */
export async function userHasPassword(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });

  return !!user?.password;
}

/**
 * Update user password
 * @param userId - User ID
 * @param newPassword - New plain text password
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const hashedPassword = await hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

/**
 * Get all admin users
 * @returns List of admin users
 */
export async function getAdminUsers(): Promise<AuthUser[]> {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SUPERADMIN'],
      },
    },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
      image: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return admins;
}
