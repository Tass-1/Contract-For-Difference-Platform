import express from "express";
import  mongoose  from "mongoose";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { UserModel, PositionModel } from "../models/schema";
import redis  from "../config/Redis";
import {Connection} from '@solana/web3.js'
const router = express.Router();
const conn = new Connection("https://api.devnet.solana.com/");

router.post("/api/closePositions",AuthMiddleware , async (req,res) => {
    const userId = req.userId;
    const posId = req.body.positionId;
    const mongoPOSId = new mongoose.Types.ObjectId(posId);
    const mongoUSRId = new mongoose.Types.ObjectId(userId);
    const symbol = req.body.symbol;
    const redisData = await redis.hget(`position:${symbol}`, posId);
    if(!redisData){
        console.log("Position not found");
        return res.status(403).json({message:"Position Not found"})
    }
    const positions = JSON.parse(redisData)
    if(positions.userId != userId){
        console.log("Not your trade");
        return res.status(403).json({message:"Not your trade"})
    }
    const currentPrice = Number(await redis.get(`${symbol}_PRICE`));
    const solPrice = Number(await redis.get("SOLUSDT_PRICE"));
    const PnL = positions.side == "LONG" ? (currentPrice - positions.entryPrice) * positions.quantity : (positions.entryPrice - currentPrice)* positions.quantity;
                const PnLsol = PnL / solPrice;
                const refund = Math.max(0,positions.margin + PnLsol);
                const user = await UserModel.findOneAndUpdate({
                    _id: mongoUSRId
                }, {
                    $inc:{balance: refund}
                },{new: true})
                await PositionModel.updateOne({
                    _id: mongoPOSId
                },{
                    realizedPnL: PnL,
                    status: "closed",
                    closingPrice: currentPrice,
                    closedAt: Date.now()
                })
                await redis.hdel(`position:${symbol}` , positions.positionId)

                return res.json({
                    success: true,
                    message:"Position Closed",
                    PnL:PnL,
                    refund: refund,
                    balance: user?.balance
                })
    
    }
)

export default router;