export interface UserSeed {
  email: string
  name: string
  password: string // plain text — hashed at runtime
  role: 'SUPERADMIN' | 'ADMIN' | 'USER'
  image: string
}

export const users: UserSeed[] = [
  {
    email: 'superadmin@example.com',
    name: 'Super Admin',
    password: 'password123',
    role: 'SUPERADMIN',
    image: '/images/avatars/superadmin.jpg',
  },
  {
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'password123',
    role: 'ADMIN',
    image: '/images/avatars/admin.jpg',
  },
  {
    email: 'customer1@example.com',
    name: 'Alice Johnson',
    password: 'password123',
    role: 'USER',
    image: '/images/avatars/customer1.jpg',
  },
  {
    email: 'customer2@example.com',
    name: 'Bob Smith',
    password: 'password123',
    role: 'USER',
    image: '/images/avatars/customer2.jpg',
  },
  {
    email: 'customer3@example.com',
    name: 'Carol Williams',
    password: 'password123',
    role: 'USER',
    image: '/images/avatars/customer3.jpg',
  },
]
