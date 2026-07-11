
import {Worker} from "bullmq";
import {connection} from "./queue.ts";
import redis  from "../config/Redis.ts";
import schema from "../models/schema.ts";
import {UserModel} from "../models/schema.ts";
import mongoose from "mongoose";
import {OrderModel} from "../models/schema.ts";

const worker = new Worker(
    "limitOrders",
    async (job) => {
        console.log("looking for jobs to remove")
        if(job.name == "remove-expired-orders"){
            const keys = await redis.keys("limitOrder:*");
            for( const key of keys){
                const orders = await redis.hgetall(key);

                for ( const orderId in orders){
                    const order = JSON.parse(orders[orderId]);

                    if(new Date(order.expiry) < new Date()){
                        const userId = new mongoose.Types.ObjectId(order.userId)
                        const OrderId = new mongoose.Types.ObjectId(order.orderId)
                        await UserModel.updateOne({ _id: userId} , {$inc: {balance: order.margin}});
                        await OrderModel.updateOne({ _id: OrderId} , {status:"expired"});
                        await redis.hdel(key,orderId)
                    }
                }
            }
        }
    },
    {connection}
)