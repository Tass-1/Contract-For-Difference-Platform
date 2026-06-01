import express from "express";
import redis from "../config/Redis";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { UserModel, OrderModel } from "../models/schema";
import {limitSchema} from "../validators/orderValidator"
const router = express.Router();



router.post("/limit-order", AuthMiddleware, async (req,res) => {
    const isValid = limitSchema.safeParse(req.body);
    if(!isValid.success){
        console.log(isValid.error.errors)
        return res.status(400).json({message:"Invalid args", error: isValid.error.errors})
    }
    const {margin , leverage , side , symbol , takeProfit , stopLoss, limitPrice , expiry, type } = isValid.data;
    const user = await UserModel.findOne({
        pubkey: req.publickey
    })
    if(user){
        if(margin > Number(user.balance)){
            return res.json({message:"Not enough Funds"})
        }
        console.log("user found");
        const positon = margin*leverage;
        const realLimitPrice = Number(limitPrice)
        const solPrice = parseFloat(await redis.get("SOLUSDT_PRICE"));
        const positonSize = positon*solPrice;
        const quantity = positonSize/realLimitPrice;
        const marginInUSD = margin*solPrice;
        const liquidationPrice = side === "LONG" ? realLimitPrice - (marginInUSD/quantity) : realLimitPrice + (marginInUSD/quantity); 
        const order = await OrderModel.create({
            userId: req.userId,
            symbol: symbol,
            side: side,
            type: type,
            margin: margin,
            leverage:leverage,
            status:"waiting",
            limitPrice:realLimitPrice,
            expiry: expiry,
            liquidationPrice:liquidationPrice,
            stopLoss:stopLoss,
            takeProfit:takeProfit,
            quantity:quantity

        })
        if(order){
            console.log("order added");
            await user.updateOne({$inc:{balance: -margin}});
                const redisUser = {
                    orderId: order._id,
                    userId: req.userId,
                    symbol: symbol,
                    side: side,
                    expiry: expiry,
                    limitPrice: realLimitPrice,
                    margin: margin,
                    leverage: leverage,
                    liquidationPrice: liquidationPrice,
                    stopLoss: stopLoss,
                    takeProfit: takeProfit,
                    quantity: quantity
                }
                const listLength = await redis.hset(`limitOrder:${symbol}`, order._id.toString() , JSON.stringify(redisUser));
                console.log(`redis done ${listLength}`);
                return res.json({
                    success: true,
                    position: {
                        orderId: order._id,
                        symbol: symbol,
                        side: side,
                        entryPrice: realLimitPrice,
                        quantity: quantity,
                        margin: margin,
                        leverage: leverage,
                        liquidationPrice: liquidationPrice,
                        positionSize : positonSize,
                        stopLoss : stopLoss,
                        takeProfit: takeProfit,
                    },
                    newBalance: user.balance - margin
                })
                console.log("ran fine")
             }
        }

})

export default router;