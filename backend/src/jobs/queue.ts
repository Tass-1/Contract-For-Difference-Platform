import {Queue} from "bullmq";

export const connection = {
    host: "localhost",
    port: 6379
}

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