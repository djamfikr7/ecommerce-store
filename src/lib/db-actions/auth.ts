/**
 * Authentication Database Actions
 * Server actions for user authentication and management
 */

import { hash, compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { CreateUserInput, UpdateProfileInput, AuthUser, UserWithAddress } from '@/types/auth'
import {
  AuthError,
  InvalidCredentialsError,
  EmailExistsError,
  UserNotFoundError,
} from '@/lib/errors/auth'

const BCRYPT_ROUNDS = 12

/**
 * Create a new user account
 * @param data - User creation data including email, password, and optional name
 * @returns Created user without password
 */
export async function createUser(data: CreateUserInput): Promise<AuthUser> {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  })

  if (existingUser) {
    throw new EmailExistsError(data.email)
  }

  // Hash password if provided
  const hashedPassword = data.password ? await hash(data.password, BCRYPT_ROUNDS) : undefined

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
  })

  return user
}

/**
 * Authenticate a user with email and password
 * @param email - User email
 * @param password - User password
 * @returns Authenticated user
 * @throws InvalidCredentialsError if credentials are invalid
 */
export async function authenticateUser(email: string, password: string): Promise<AuthUser> {
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
  })

  if (!user) {
    throw new InvalidCredentialsError()
  }

  // If user doesn't have a password (OAuth-only account)
  if (!user.password) {
    throw new InvalidCredentialsError()
  }

  // Verify password
  const isValidPassword = await compare(password, user.password)

  if (!isValidPassword) {
    throw new InvalidCredentialsError()
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
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
  })

  return user
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
  })

  return user
}

/**
 * Update user profile
 * @param userId - User ID
 * @param data - Profile update data
 * @returns Updated user
 */
export async function updateUserProfile(
  userId: string,
  data: UpdateProfileInput,
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
  })

  return user
}

/**
 * Get user with addresses
 * @param userId - User ID
 * @returns User with addresses or null if not found
 */
export async function getUserWithAddresses(userId: string): Promise<UserWithAddress | null> {
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
  })

  return user
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
  providerAccountId: string,
): Promise<void> {
  // Check if account is already linked to another user
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId,
      },
    },
  })

  if (existingAccount && existingAccount.userId !== userId) {
    throw new AuthError(
      `This ${provider} account is already linked to another user`,
      'ACCOUNT_ALREADY_LINKED',
      409,
    )
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
  })

  return !!user?.password
}

/**
 * Update user password
 * @param userId - User ID
 * @param newPassword - New plain text password
 */
export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hash(newPassword, BCRYPT_ROUNDS)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
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
  })

  return admins
}

/**
 * Create a verification token for email verification
 * @param email - User email
 * @returns Verification token
 */
export async function createVerificationToken(email: string): Promise<string> {
  const { randomBytes } = await import('crypto')
  const token = randomBytes(32).toString('hex')
  const code = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email.toLowerCase() },
  })

  // Create new token (store both token and code in the token field, separated by |)
  await prisma.verificationToken.create({
    data: {
      identifier: email.toLowerCase(),
      token: `${token}|${code}`,
      expires,
    },
  })

  return token
}

/**
 * Get verification code for display in email
 * @param email - User email
 * @returns 6-digit verification code
 */
export async function getVerificationCode(email: string): Promise<string | null> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email.toLowerCase(),
      expires: { gt: new Date() },
    },
  })

  if (!verificationToken) {
    return null
  }

  // Extract code from token field (format: token|code)
  const parts = verificationToken.token.split('|')
  return parts[1] || null
}

/**
 * Verify email with token
 * @param token - Verification token from email link
 * @returns True if verification successful
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token: { startsWith: token },
      expires: { gt: new Date() },
    },
  })

  if (!verificationToken) {
    return false
  }

  // Update user's emailVerified field
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  })

  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      },
    },
  })

  return true
}

/**
 * Verify email with 6-digit code
 * @param code - 6-digit verification code
 * @param email - User email (optional, for additional security)
 * @returns True if verification successful
 */
export async function verifyEmailCode(code: string, email?: string): Promise<boolean> {
  const whereClause: any = {
    expires: { gt: new Date() },
  }

  if (email) {
    whereClause.identifier = email.toLowerCase()
  }

  const verificationTokens = await prisma.verificationToken.findMany({
    where: whereClause,
  })

  // Find token that contains the code
  const matchingToken = verificationTokens.find((vt) => {
    const parts = vt.token.split('|')
    return parts[1] === code
  })

  if (!matchingToken) {
    return false
  }

  // Update user's emailVerified field
  await prisma.user.update({
    where: { email: matchingToken.identifier },
    data: { emailVerified: new Date() },
  })

  // Delete the used token
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: matchingToken.identifier,
        token: matchingToken.token,
      },
    },
  })

  return true
}

/**
 * Check if user email is verified
 * @param email - User email
 * @returns True if email is verified
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { emailVerified: true },
  })

  return !!user?.emailVerified
}
