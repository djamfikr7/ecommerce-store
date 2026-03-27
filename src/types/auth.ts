/**
 * Authentication Type Definitions
 */

// Input Types
export interface CreateUserInput {
  email: string;
  password?: string;
  name?: string;
  image?: string;
}

export interface UpdateProfileInput {
  name?: string;
  image?: string;
  phone?: string;
}

export interface CreateAddressInput {
  type: AddressType;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  type?: AddressType;
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH';

// Database Types
export interface UserWithAddress {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  addresses: Address[];
}

export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';

export interface Address {
  id: string;
  userId: string;
  type: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// NextAuth Type Extensions
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    role: UserRole;
  };
  expires: string;
}

export interface AuthUser {
  id: string;
  email: string;
  emailVerified?: Date | null;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
  phone?: string | null;
}

// JWT Payload Type
export interface JWTPayload {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  iat?: number;
  exp?: number;
  sub?: string;
}
