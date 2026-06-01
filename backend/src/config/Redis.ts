

const Redis = require('ioredis');
const redis = new Redis({
    host:'localhost',
    port:6379
});

redis.on('connect' , () => {
    console.log("redis is on")
})

export default redis;

