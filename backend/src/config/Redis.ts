

const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';




const redis = new Redis(redisUrl);

redis.on('connect' , () => {
    console.log("redis is on")
})

export default redis;

