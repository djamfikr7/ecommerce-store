// Redis client stub for development
// In production, this would be a real Redis client using ioredis or redis package

export const redis = {
  ping: async () => {
    // Mock ping - in production this would ping real Redis
    return Promise.resolve('PONG')
  },
  get: async (key: string) => {
    // In production, this would get from Redis
    return null
  },
  set: async (key: string, value: string, options?: { EX?: number }) => {
    // In production, this would set in Redis
    return 'OK'
  },
  del: async (key: string | string[]) => {
    // In production, this would delete from Redis
    return 0
  },
  expire: async (key: string, seconds: number) => {
    // In production, this would set expiry
    return true
  },
}
