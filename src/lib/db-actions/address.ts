/**
 * Address Management Database Actions
 * Server actions for user address CRUD operations
 */

import { prisma } from '@/lib/prisma';
import { CreateAddressInput, UpdateAddressInput, Address } from '@/types/auth';
import { UnauthorizedError, UserNotFoundError } from '@/lib/errors/auth';

/**
 * Create a new address for a user
 * @param userId - User ID
 * @param data - Address creation data
 * @returns Created address
 */
export async function createAddress(
  userId: string,
  data: CreateAddressInput
): Promise<Address> {
  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new UserNotFoundError(userId);
  }

  // If this is set as default, unset other defaults of the same type
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId,
        type: {
          in: [data.type, 'BOTH'],
        },
        isDefault: true,
      },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId,
      type: data.type,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      addressLine1: data.addressLine1.trim(),
      addressLine2: data.addressLine2?.trim(),
      city: data.city.trim(),
      state: data.state?.trim(),
      postalCode: data.postalCode.trim(),
      country: data.country || 'US',
      phone: data.phone,
      isDefault: data.isDefault || false,
    },
  });

  return address;
}

/**
 * Get all addresses for a user
 * @param userId - User ID
 * @returns List of user's addresses
 */
export async function getUserAddresses(userId: string): Promise<Address[]> {
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return addresses;
}

/**
 * Get a single address by ID
 * @param addressId - Address ID
 * @param userId - User ID (for ownership verification)
 * @returns Address or null if not found
 */
export async function getAddressById(
  addressId: string,
  userId: string
): Promise<Address | null> {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  return address;
}

/**
 * Update an existing address
 * @param addressId - Address ID
 * @param userId - User ID (for ownership verification)
 * @param data - Address update data
 * @returns Updated address
 */
export async function updateAddress(
  addressId: string,
  userId: string,
  data: UpdateAddressInput
): Promise<Address> {
  // Verify ownership
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!existingAddress) {
    throw new UnauthorizedError('update this address');
  }

  // If setting as default, unset other defaults
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId,
        type: {
          in: [data.type || existingAddress.type, 'BOTH'],
        },
        isDefault: true,
        id: { not: addressId },
      },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: addressId },
    data: {
      type: data.type,
      firstName: data.firstName?.trim(),
      lastName: data.lastName?.trim(),
      addressLine1: data.addressLine1?.trim(),
      addressLine2: data.addressLine2?.trim(),
      city: data.city?.trim(),
      state: data.state?.trim(),
      postalCode: data.postalCode?.trim(),
      country: data.country,
      phone: data.phone,
      isDefault: data.isDefault,
    },
  });

  return address;
}

/**
 * Delete an address
 * @param addressId - Address ID
 * @param userId - User ID (for ownership verification)
 */
export async function deleteAddress(
  addressId: string,
  userId: string
): Promise<void> {
  // Verify ownership
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new UnauthorizedError('delete this address');
  }

  await prisma.address.delete({
    where: { id: addressId },
  });
}

/**
 * Set an address as the default for its type
 * @param addressId - Address ID
 * @param userId - User ID (for ownership verification)
 * @returns Updated address
 */
export async function setDefaultAddress(
  addressId: string,
  userId: string
): Promise<Address> {
  // Verify ownership
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new UnauthorizedError('set this address as default');
  }

  // Unset other defaults of the same type
  await prisma.address.updateMany({
    where: {
      userId,
      type: {
        in: [address.type, 'BOTH'],
      },
      isDefault: true,
      id: { not: addressId },
    },
    data: { isDefault: false },
  });

  // Set this address as default
  const updatedAddress = await prisma.address.update({
    where: { id: addressId },
    data: { isDefault: true },
  });

  return updatedAddress;
}

/**
 * Get default shipping address for a user
 * @param userId - User ID
 * @returns Default shipping address or null
 */
export async function getDefaultShippingAddress(
  userId: string
): Promise<Address | null> {
  const address = await prisma.address.findFirst({
    where: {
      userId,
      type: {
        in: ['SHIPPING', 'BOTH'],
      },
      isDefault: true,
    },
  });

  return address;
}

/**
 * Get default billing address for a user
 * @param userId - User ID
 * @returns Default billing address or null
 */
export async function getDefaultBillingAddress(
  userId: string
): Promise<Address | null> {
  const address = await prisma.address.findFirst({
    where: {
      userId,
      type: {
        in: ['BILLING', 'BOTH'],
      },
      isDefault: true,
    },
  });

  return address;
}

/**
 * Count user's addresses
 * @param userId - User ID
 * @returns Number of addresses
 */
export async function countUserAddresses(userId: string): Promise<number> {
  const count = await prisma.address.count({
    where: { userId },
  });

  return count;
}
