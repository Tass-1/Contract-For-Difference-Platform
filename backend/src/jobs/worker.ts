
import {Worker} from "bullmq";
import {connection} from "./queue";
import redis  from "../config/Redis";
import schema from "../models/schema";
import {UserModel} from "../models/schema";
import mongoose from "mongoose";
import {OrderModel} from "../models/schema";

const worker = new Worker(
    "limitOrders",
    async (job) => {
        console.log("looking for jobs to remove")
        if(job.name == "remove-expired-orders"){
            try{
                const keys = await redis.keys("limitOrder:*");
                for( const key of keys){
                    const orders = await redis.hgetall(key);

                    for ( const orderId in orders){
                        const order = JSON.parse(orders[orderId]);

                        if(new Date(order.expiry) < new Date()){
                            const userId = new mongoose.Types.ObjectId(order.userId)
                            const OrderId = new mongoose.Types.ObjectId(order.orderId)
                            await Promise.all([
                                UserModel.updateOne({ _id: userId} , {$inc: {balance: order.margin}}),
                                OrderModel.updateOne({ _id: OrderId} , {status:"expired"}),
                                redis.hdel(key,orderId)
                            ])
                        }
                    }
                }
            }
            catch(err){
                console.error("Worker process error" , err)
                throw err
            }
            
        }
    },
    {connection}
)