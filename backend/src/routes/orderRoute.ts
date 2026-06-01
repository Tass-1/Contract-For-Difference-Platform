import express from "express";
import redis from "../config/Redis";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { UserModel, OrderModel, PositionModel } from "../models/schema";
const router = express.Router();
import {orderSchema} from "../validators/orderValidator"


router.post("/order" , AuthMiddleware , async (req , res) => {
    const isValid = orderSchema.safeParse(req.body);
    if(!isValid.success){
        return res.status(400).json({message:"invalid args"})
    }
    const {margin , leverage , side , symbol , takeProfit , stopLoss, type } = isValid.data;
    const user = await UserModel.findOne({
        pubkey: req.publickey
    })
    if(user){
        if(margin > Number(user.balance)){
            return res.json({message:"Not enough Funds"})
        }
        console.log("user found");
        const positon = margin*leverage;
        const entryPrice = parseFloat(await redis.get(`${symbol}_PRICE`));
        const solPrice = parseFloat(await redis.get("SOLUSDT_PRICE"));

        if(!entryPrice || !solPrice){
            return res.status(400).json({message:"Price data unavailable"});
        }
        const positonSize = positon*solPrice;
        const quantity = positonSize/entryPrice;
        const marginInUSD = margin*solPrice;
        const liquidationPrice = side === "LONG" ? entryPrice - (marginInUSD/quantity) : entryPrice + (marginInUSD/quantity); 
        const order = await OrderModel.create({
            userId: req.userId,
            symbol: symbol,
            side: side,
            type: type,
            margin: margin,
            leverage:leverage,
            status:"filled",
            quantity: quantity,
            liquidationPrice: liquidationPrice,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            limitPrice:null,
            expiry: null


        })
        if(order){
            console.log("order added");
            await user.updateOne({$inc:{balance: -margin}});
            const position = await PositionModel.create({
                userId: req.userId,
                symbol: symbol,
                side: side,
                type: type,
                margin: margin,
                leverage:leverage,
                status:"filled",
                entryPrice: entryPrice,
                quantity: quantity,
                positionSize:positonSize,
                liquidationPrice: liquidationPrice,
                stopLoss: stopLoss,
                takeProfit: takeProfit
             })
             if(position){
                console.log("position added");
                await OrderModel.updateOne({_id: order._id} , {positionId: position._id})
                const redisUser = {
                    positionId: position._id,
                    userId: req.userId,
                    symbol: symbol,
                    side: side,
                    entryPrice: entryPrice,
                    quantity: quantity,
                    margin: margin,
                    leverage: leverage,
                    liquidationPrice: liquidationPrice,
                    stopLoss: stopLoss,
                    takeProfit: takeProfit
                }
                const listLength = await redis.hset(`position:${symbol}`, position._id.toString() , JSON.stringify(redisUser));
                console.log(`redis done ${listLength}`);
                return res.json({
                    success: true,
                    position: {
                        positionId: position._id,
                        symbol: symbol,
                        side: side,
                        entryPrice: entryPrice,
                        quantity: quantity,
                        margin: margin,
                        leverage: leverage,
                        liquidationPrice: liquidationPrice,
                        positionSize : positonSize,
                        stopLoss : stopLoss,
                        takeProfit: takeProfit,
                        openedAt: position.openedAt
                    },
                    newBalance: user.balance - margin
                })
                console.log("ran fine")
             }
        }
        
        console.log("Order is restored")
        
    }
    
    return res.status(500).json({message:"Failed due to some error"})
})

export default router;