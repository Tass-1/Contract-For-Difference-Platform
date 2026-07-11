import WebSocket from "ws";
import mongoose from "mongoose";
import { OrderModel, PositionModel, UserModel } from "../models/schema";
import redis from "../config/Redis";
import {Server} from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

interface CandleData{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}


export const TradingEngine = (io: any) => {
    const streams = ["btcusdt@kline_1m" , "solusdt@kline_1m" , "ethusdt@kline_1m"].join('/')
    const binanceWsURL = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const binanceWS = new WebSocket(binanceWsURL);
    binanceWS.on('message' ,async (message:string) => {
        const rawData =  await JSON.parse(message);
        const data = rawData.data;
        const kline = data.k;
        const symbol = data.s;
        const currentPrice = parseFloat(kline.c)
        await redis.set(`${symbol}_PRICE`, currentPrice);
        const IssolPrice = await redis.get('SOLUSDT_PRICE');
        const solPrice = IssolPrice ? parseFloat(IssolPrice) : 1
        if(symbol == "BTCUSDT" || symbol == "SOLUSDT" || symbol == "ETHUSDT"){

            const [redisDataPOS, redisDataLimit] = await Promise.all([
                    redis.hvals(`position:${symbol}`),
                    redis.hvals(`limitOrder:${symbol}`)
                ]);
            const positions = redisDataPOS.map(item => JSON.parse(item));
            // positions.forEach((p, idx) => {
            //     const m = Number(p.margin);
            //     const e = Number(p.entryPrice);
            //     const q = Number(p.quantity);
            //     if (isNaN(m) || isNaN(e) || isNaN(q)) {
            //         console.error(`BAD POSITION [${idx}]:`, JSON.stringify(p));
            //     }
            // });
            const limitOrders = redisDataLimit.map(item => JSON.parse(item));

            for( let i = 0; i < limitOrders.length ; i++){
                const orderId = new mongoose.Types.ObjectId(limitOrders[i].orderId);
                if( limitOrders[i].side == "LONG" && currentPrice <= limitOrders[i].limitPrice || limitOrders[i].side == "SHORT" && currentPrice >= limitOrders[i].limitPrice){
                    const positionSize = Number(limitOrders[i].margin * limitOrders[i].leverage)
                    const limitOrderToPOS = await PositionModel.create({ // limit idhar haiii ....................................................
                        userId: limitOrders[i].userId,
                        symbol: limitOrders[i].symbol,
                        side: limitOrders[i].side,
                        type: "Limit Order",
                        margin: limitOrders[i].margin,
                        entryPrice:limitOrders[i].limitPrice,
                        quantity:limitOrders[i].quantity,
                        leverage: limitOrders[i].leverage,
                        positionSize: positionSize,
                        liquidationPrice: limitOrders[i].liquidationPrice,
                        stopLoss: limitOrders[i].stopLoss,
                        takeProfit: limitOrders[i].takeProfit,
                        realizedPnL: null,
                        closingPrice: null,
                        status: "filled",
                        closedAt: null,
                        openedAt: Date.now()

                    })
                    
                    const redisUser = {
                        positionId: limitOrderToPOS._id,
                        userId: limitOrderToPOS.userId,
                        symbol: symbol,
                        side: limitOrderToPOS.side,
                        entryPrice: limitOrderToPOS.entryPrice,
                        quantity: limitOrderToPOS.quantity,
                        margin: limitOrderToPOS.margin,
                        leverage: limitOrderToPOS.leverage,
                        liquidationPrice: limitOrderToPOS.liquidationPrice,
                        stopLoss: limitOrderToPOS.stopLoss,
                        takeProfit: limitOrderToPOS.takeProfit
                    }
                    await Promise.all([
                            OrderModel.updateOne({ _id: orderId} ,{ status:"filled" , positionId: limitOrderToPOS._id , filledAt: Date.now()}),
                            redis.hdel(`limitOrder:${limitOrderToPOS.symbol}` , limitOrders[i].orderId),
                            redis.hset(`position:${symbol}`, limitOrderToPOS._id.toString() , JSON.stringify(redisUser))
                    ])
                    
                }
            }
            for ( let i =0; i < positions.length; i++){
                const mongoPOSId = new mongoose.Types.ObjectId(positions[i].positionId)
                const mongoUSRId = new mongoose.Types.ObjectId(positions[i].userId)
                
                if( currentPrice <= positions[i].liquidationPrice && positions[i].side == 'LONG' || currentPrice >= positions[i].liquidationPrice && positions[i].side == 'SHORT'){
                    const PnL = positions[i].side == "LONG" ? (currentPrice - positions[i].entryPrice) * positions[i].quantity : (positions[i].entryPrice - currentPrice) * positions[i].quantity;
                    
                    await Promise.all([
                        PositionModel.updateOne({
                        _id: mongoPOSId
                    },{
                        realizedPnL: PnL,
                        status: "liquidated",
                        closingPrice: currentPrice,
                        closedAt: Date.now()
                    }),
                    redis.hdel(`position:${positions[i].symbol}` , positions[i].positionId)
                    ])
                    
                    continue;
                    
                } 
                
                else if( (currentPrice >= positions[i].takeProfit || currentPrice <= positions[i].stopLoss ) && positions[i].side == 'LONG' || (currentPrice >= positions[i].stopLoss || currentPrice <= positions[i].takeProfit) && positions[i].side == 'SHORT'){
                    const PnL = positions[i].side == "LONG" ? (currentPrice - positions[i].entryPrice) * positions[i].quantity : (positions[i].entryPrice - currentPrice)* positions[i].quantity;
                    const PnLsol = PnL / solPrice;
                    const refund = Math.max(0,positions[i].margin + PnLsol);
                    
                    await Promise.all([
                            UserModel.updateOne({
                            _id: mongoUSRId
                        }, {
                            $inc:{balance: refund}
                        }),
                        PositionModel.updateOne({
                            _id: mongoPOSId
                        },{
                            realizedPnL: PnL,
                            status: "closed",
                            closingPrice: currentPrice,
                            closedAt: Date.now()
                        }),
                        redis.hdel(`position:${positions[i].symbol}` , positions[i].positionId)
                    ])
                    
                    continue;
                    
                } else{
                    const livePnL = positions[i].side == "LONG" ? (currentPrice - positions[i].entryPrice )* positions[i].quantity : (positions[i].entryPrice - currentPrice) * positions[i].quantity;
                    io.to(positions[i].userId).emit("position-update" , {
                        positionId: positions[i].positionId,
                        pnl: livePnL,
                        currentPrice: currentPrice,
                        symbol: positions[i].symbol,
                        side: positions[i].side,
                        entryPrice: positions[i].entryPrice,
                        leverage: positions[i].leverage,
                        liquidationPrice: positions[i].liquidationPrice
                    })
                }

            }
            




            io.emit(`get${symbol}-price` , currentPrice);
            const liveCandle : CandleData = {
            time: Math.floor((kline.t/1000)/60)*60,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
        } 
        // console.log("Emitting candle for", symbol, "to", io.engine?.clientsCount, "clients");
        io.emit(`live-candle-${symbol}` , liveCandle);

        
        
        // console.log(liveCandle)
        
    }
        
    });

    binanceWS.on('close' , () => {
        console.log("Dropped connection reconnecting ....");
        setTimeout(() => TradingEngine(io) , 3000)
    })
}

