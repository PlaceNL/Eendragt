const redis = require('async-redis');
const redisClient = redis.createClient();
export const Redis = redisClient;