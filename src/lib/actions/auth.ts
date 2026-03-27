/**
 * Authentication Server Actions
 * Server actions for client-side authentication operations
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/lib/auth';
import {
  createUser,
  getUserByEmail,
  updateUserProfile,
  updateUserPassword,
} from '@/lib/db-actions/auth';
import {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/lib/db-actions/address';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
} from '@/lib/validators/auth';
import {
  InvalidCredentialsError,
  EmailExistsError,
  UserNotFoundError,
  ValidationError,
} from '@/lib/errors/auth';
import type { RegisterInput, LoginInput, UpdateProfileInput, AddressInput, UpdateAddressInput } from '@/lib/validators/auth';

// Validation helper
function validateInput<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      const zodError = error as { errors: Array<{ message: string; path: string[] }> };
      const firstError = zodError.errors[0];
      throw new ValidationError(
        firstError?.message || 'Validation failed',
        firstError?.path?.[0]?.toString()
      );
    }
    throw new ValidationError('Validation failed');
  }
}

/**
 * Register a new user account
 */
export async function registerAction(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string | undefined,
  };

  const validated = validateInput(registerSchema, data);

  try {
    const user = await createUser(validated);
    return { success: true, user: { id: user.id, email: user.email } };
  } catch (error) {
    if (error instanceof EmailExistsError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

/**
 * Sign in with credentials
 */
export async function signInAction(formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validated = validateInput(loginSchema, data);

  try {
    await nextAuthSignIn('credentials', {
      email: validated.email,
      password: validated.password,
      redirectTo: '/',
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid email or password' };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuthAction(provider: 'google' | 'github', callbackUrl?: string) {
  await nextAuthSignIn(provider, { callbackUrl });
}

/**
 * Sign out
 */
export async function signOutAction() {
  await nextAuthSignOut({ redirectTo: '/login' });
}

/**
 * Get current session
 */
export async function getSessionAction() {
  const session = await auth();
  return session;
}

/**
 * Update user profile
 */
export async function updateProfileAction(userId: string, formData: FormData) {
  const data = {
    name: formData.get('name') as string | null,
    image: formData.get('image') as string | null,
    phone: formData.get('phone') as string | null,
  };

  const validated = validateInput(updateProfileSchema, data);

  try {
    const user = await updateUserProfile(userId, validated);
    revalidatePath('/account');
    revalidatePath('/profile');
    return { success: true, user };
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return { success: false, error: 'User not found' };
    }
    throw error;
  }
}

/**
 * Update user password
 */
export async function updatePasswordAction(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  // Validate new password
  const passwordSchema = registerSchema.pick({ password: true });
  validateInput(passwordSchema, { password: newPassword });

  try {
    // Verify current password first
    const { authenticateUser } = await import('@/lib/db-actions/auth');
    await authenticateUser((await auth())?.user?.email || '', currentPassword);

    // Update password
    await updateUserPassword(userId, newPassword);
    revalidatePath('/account');
    return { success: true };
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return { success: false, error: 'Current password is incorrect' };
    }
    throw error;
  }
}

// Address Actions

/**
 * Add a new address
 */
export async function addAddressAction(userId: string, formData: FormData) {
  const data = {
    type: formData.get('type') as 'SHIPPING' | 'BILLING' | 'BOTH',
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    addressLine1: formData.get('addressLine1') as string,
    addressLine2: formData.get('addressLine2') as string | null,
    city: formData.get('city') as string,
    state: formData.get('state') as string | null,
    postalCode: formData.get('postalCode') as string,
    country: (formData.get('country') as string) || 'US',
    phone: formData.get('phone') as string | null,
    isDefault: formData.get('isDefault') === 'true',
  };

  const validated = validateInput(addressSchema, data);

  try {
    const address = await createAddress(userId, validated);
    revalidatePath('/account/addresses');
    return { success: true, address };
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      return { success: false, error: 'User not found' };
    }
    throw error;
  }
}

/**
 * Get user addresses
 */
export async function getAddressesAction(userId: string) {
  const addresses = await getUserAddresses(userId);
  return addresses;
}

/**
 * Update an address
 */
export async function editAddressAction(
  addressId: string,
  userId: string,
  formData: FormData
) {
  const data = {
    type: formData.get('type') as 'SHIPPING' | 'BILLING' | 'BOTH' | undefined,
    firstName: formData.get('firstName') as string | undefined,
    lastName: formData.get('lastName') as string | undefined,
    addressLine1: formData.get('addressLine1') as string | undefined,
    addressLine2: formData.get('addressLine2') as string | null | undefined,
    city: formData.get('city') as string | undefined,
    state: formData.get('state') as string | null | undefined,
    postalCode: formData.get('postalCode') as string | undefined,
    country: formData.get('country') as string | undefined,
    phone: formData.get('phone') as string | null | undefined,
    isDefault: formData.get('isDefault') === 'true' ? true :
               formData.get('isDefault') === 'false' ? false : undefined,
  };

  const validated = validateInput(updateAddressSchema, data);

  try {
    const address = await updateAddress(addressId, userId, validated);
    revalidatePath('/account/addresses');
    return { success: true, address };
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      const authError = error as { message: string };
      if (authError.message.includes('unauthorized')) {
        return { success: false, error: 'You are not authorized to update this address' };
      }
    }
    throw error;
  }
}

/**
 * Delete an address
 */
export async function removeAddressAction(addressId: string, userId: string) {
  try {
    await deleteAddress(addressId, userId);
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      const authError = error as { message: string };
      if (authError.message.includes('unauthorized')) {
        return { success: false, error: 'You are not authorized to delete this address' };
      }
    }
    throw error;
  }
}

/**
 * Set default address
 */
export async function setDefaultAddressAction(addressId: string, userId: string) {
  try {
    const address = await setDefaultAddress(addressId, userId);
    revalidatePath('/account/addresses');
    return { success: true, address };
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      const authError = error as { message: string };
      if (authError.message.includes('unauthorized')) {
        return { success: false, error: 'You are not authorized to update this address' };
      }
    }
    throw error;
  }
}
