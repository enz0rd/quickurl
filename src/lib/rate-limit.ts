import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export const userRateLimit = async (userId: string, plan: 'free' | 'pro') => {
    const planLimits = {
        free: 20,
        pro: 200
    }

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const key = `rate:${userId}:${yearMonth}`;
    console.log(key);
    const current = await redis.get<number>(key);
    const max = planLimits[plan] ?? 100;

    if(current && current >= max) {
        return {
            allowed: false,
            remaining: 0,
            limit: max
        }
    }

    await redis.incr(key);

    // define expiration date - 31 days
    if(!current) {
        await redis.expire(key, 30 * 24 * 60 * 60);
    }

    return {
        allowed: true,
        remaining: current ? max - (current + 1) : max - 1,
        limit: max
    }
}