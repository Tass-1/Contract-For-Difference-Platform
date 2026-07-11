import {Queue} from "bullmq";
import IORedis from "ioredis";


const redisUrl = process.env.REDIS_URL;

export const connection = redisUrl 
    ? new IORedis(redisUrl, { maxRetriesPerRequest: null }) 
    : new IORedis({ host: "localhost", port: 6379, maxRetriesPerRequest: null });

export const LimitOrderQueue = new Queue("limitOrders" , {connection});



export async function startOrder() {
    await LimitOrderQueue.add(
        "remove-expired-orders",
        {},
        {
            repeat: {
                pattern: "* * * * *"
            },
            removeOnComplete: true,
        }
    );
    console.log("BULL MQ JOB IS RUNNING")
}