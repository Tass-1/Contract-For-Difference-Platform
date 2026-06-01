import 'dotenv/config';
import express from "express";
import WebSocket from "ws";
import {Server} from "socket.io";
import http from "http";
import cors from "cors"
import crypto from 'crypto';
import mongoose from "mongoose" ;
import {UserModel , DepositModel, WithdrawlModel, OrderModel, PositionModel} from "./models/schema";
import jwt from 'jsonwebtoken';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import {Connection} from '@solana/web3.js'
import {AuthMiddleware, SocketMiddleware} from "./middleware/AuthMiddleware";
import console = require("console");
import {Transaction, SystemProgram , PublicKey , Keypair , LAMPORTS_PER_SOL} from "@solana/web3.js";
import redis from './config/Redis';
import {startOrder} from "./jobs/queue"
import "./jobs/worker";
import rootRouter from './routes/index';

import {TradingEngine} from './engine/tradingEngine';



const app = express();

const server = http.createServer(app)
app.use(cors({
    origin:"http://localhost:3000",
    methods:['GET' , 'POST']
}))

app.use(express.json())

const io= new Server(server , {
    cors:{
        origin:"http://localhost:3000",
        methods:['GET' , 'POST']
    }
})
app.set('io' , io);

const PORT = 4000

server.listen(PORT , () => {
    console.log("Hello paji")
})
const JWT_SECRET = process.env.JWT_SECRET; // add kar diyato .env
const connection:any = process.env.connection// to .env added
const ison:any = mongoose.connect(connection).then( async () => {
    console.log("db is on ");
    await SyncRedis();
    await startOrder();
    TradingEngine(io);
}). catch( err => {
    console.error("kuch to err hai db ya redis" , err)
});



app.use("/", rootRouter)

// interface CandleData{
//     time: number;
//     open: number;
//     high: number;
//     low: number;
//     close: number;
// }

// let SYMBOL = "BTCUSDT";
// let interval = "1m";

// app.get("/api/history" , async (req,res) => {
//         try{
//             const url = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=1m&limit=500`;
//             const resp = await fetch(url);
//             const data = await resp.json();
//             // console.log(data)

//             const formatData: CandleData[] = data.map((rawCandle: any[]) => {
//                 return{
//                     time: rawCandle[0]/1000,
//                     open: parseFloat(rawCandle[1]),
//                     high: parseFloat(rawCandle[2]),
//                     low: parseFloat(rawCandle[3]),
//                     close: parseFloat(rawCandle[4])
//                 };
//             });
//             // console.log(formatData);
//             res.json(formatData)
//         }
//         catch(e){
//             console.error("smth went wrong " , e)
//         }
//     }
// )

// app.post("/auth/nonce", async (req,res) => {
//     const pubkey: any = req.body.pubkey;
//     const nonce: String = crypto.randomBytes(16).toString('base64');
//     await UserModel.findOneAndUpdate(
//         {pubkey: pubkey},
//         {nonce: nonce},
//         {upsert: true , new: true, setDefaultOnInsert: true}
//     )
//     console.log("got req")
//     res.json({nonce:nonce})
// })

// app.post("/auth/verify", async (req,res) => {
//     const sign = req.body.sign;
//     const pubkey = req.body.pubkey;
//     const U =  await UserModel.findOne({
//         pubkey:pubkey
//     })
//     if(U){
//         const Nnonce = new TextEncoder().encode(U.nonce); 
//         console.log(sign);
//         const orginPubkey = bs58.decode(pubkey);
//         const UintSign = new Uint8Array(sign);
//         const verify: Boolean = nacl.sign.detached.verify(Nnonce, UintSign, orginPubkey);
//         console.log(verify);
//         if(verify){
//             const token = jwt.sign({publicKey:U.pubkey , userId: U._id}, JWT_SECRET, {expiresIn: '3d'})
//             res.json({token:token})
//         }
//         else{
//             res.json({message:"smnth bad brotha"})
//         }
//     }
    
// })


// app.post("/deposit", AuthMiddleware ,async (req,res) => {
//     const TxnSignature = req.body.signature;
//     const claimAmount = req.body.amount;
//     const isTransaction = await conn.getTransaction(TxnSignature , {
//         commitment:"confirmed",
//         maxSupportedTransactionVersion: 0
//     })
//     const Keys = isTransaction?.transaction.message.accountKeys;
//     console.log("deposit par aa gyi");
//     for( let i=0; i<Keys.length ; i++){
//         if(Keys[i].toBase58() == "EGxEqNs8wg83T4CVoV312aMpBzyMcF3Fdx5o4K8USVMK"){
//             console.log("found key")
//             const DepoAmount = (isTransaction?.meta?.postBalances[i] - isTransaction?.meta?.preBalances[i])/1_000_000_000;
//             if(DepoAmount == claimAmount){
//                 await DepositModel.create({
//                     txnSignature:TxnSignature,
//                     userId: req.userId,
//                     amount:DepoAmount
//                 })
//                 await UserModel.updateOne({
//                     pubkey:req.publickey
//                 },{
//                     $inc:{balance:DepoAmount}
//                 })
//                 console.log("sahi hai bhai ")
//             }
//             break;
//         }
//     }
//     console.log(Keys)
// })


// app.post("/withdraw" , AuthMiddleware , async (req,res) => {
//     const amount = req.body.amount;
//     const user = await UserModel.findOne({
//         pubkey: req.publickey
//     })
//     if(user){
//         console.log("user found");
//         if(amount > user.balance){
//             return res.json({message:"Not Enough Funds"})
//         }
//         console.log("entered with");
//         console.log(process.env.PRIVATE_KEY)
//         const secretKey = bs58.decode(process.env.PRIVATE_KEY);
        
//         const serverKeypair = Keypair.fromSecretKey(secretKey);
//         const transaction = new Transaction();
//         transaction.add(
//             SystemProgram.transfer({
//                 fromPubkey: new PublicKey(process.env.PUBLIC_KEY),
//                 toPubkey: new PublicKey(req.publickey),
//                 lamports: amount*LAMPORTS_PER_SOL
//             })
//         )
//         const Latestblockhash = await conn.getLatestBlockhash();
//         transaction.recentBlockhash = Latestblockhash.blockhash;
//         transaction.feePayer = new PublicKey(process.env.PUBLIC_KEY) 
//         const TxnSignature = await conn.sendTransaction(transaction , [serverKeypair])
//         const confirmation = await conn.confirmTransaction({
//             blockhash: Latestblockhash.blockhash,
//             lastValidBlockHeight: Latestblockhash.lastValidBlockHeight,
//             signature: TxnSignature
//         })
//         console.log(confirmation)
//         if(confirmation.value.err == null){
//             await UserModel.updateOne({
//                 pubkey: req.publickey
//             },{
//                 $inc: {balance: -amount}
//             })
//             await WithdrawlModel.create({
//                 txnSignature: TxnSignature,
//                 userId: req.userId,
//                 amount: amount
//             })
//             return res.json({message:"Money transferred Successfully!"})
//         }
//     }
// })


// app.get("/test/btc" , async (req , res) => {
//     let displayPrice = await redis.get("BTCUSDT_PRICE");
//     io.emit("btc-price" , displayPrice);
//     res.json({price: displayPrice})
// })

// app.post("/order" , AuthMiddleware , async (req , res) => {
//     const margin = req.body.margin;
//     const leverage = req.body.leverage;
//     const side= req.body.side;
//     const symbol = req.body.symbol;
//     const stopLoss = req.body.stopLoss;
//     const takeProfit= req.body.takeProfit;
//     const type= req.body.type;
//     // const expiry= req.body.expiry;
//     // const limitPrice= req.body.limitPrice;
//     const user = await UserModel.findOne({
//         pubkey: req.publickey
//     })
//     if(user){
//         if(margin > Number(user.balance)){
//             return res.json({message:"Not enough Funds"})
//         }
//         console.log("user found");
//         const positon = margin*leverage;
//         const entryPrice = parseFloat(await redis.get(`${symbol}_PRICE`));
//         const solPrice = parseFloat(await redis.get("SOLUSDT_PRICE"));
//         const positonSize = positon*solPrice;
//         const quantity = positonSize/entryPrice;
//         const marginInUSD = margin*solPrice;
//         const liquidationPrice = side === "LONG" ? entryPrice - (marginInUSD/quantity) : entryPrice + (marginInUSD/quantity); 
//         const order = await OrderModel.create({
//             userId: req.userId,
//             symbol: symbol,
//             side: side,
//             type: type,
//             margin: margin,
//             leverage:leverage,
//             status:"filled",
//             quantity: quantity,
//             liquidationPrice: liquidationPrice,
//             stopLoss: stopLoss,
//             takeProfit: takeProfit,
//             limitPrice:null,
//             expiry: null


//         })
//         if(order){
//             console.log("order added");
//             await user.updateOne({$inc:{balance: -margin}});
//             const position = await PositionModel.create({
//                 userId: req.userId,
//                 symbol: symbol,
//                 side: side,
//                 type: type,
//                 margin: margin,
//                 leverage:leverage,
//                 status:"filled",
//                 entryPrice: entryPrice,
//                 quantity: quantity,
//                 positionSize:positonSize,
//                 liquidationPrice: liquidationPrice,
//                 stopLoss: stopLoss,
//                 takeProfit: takeProfit
//              })
//              if(position){
//                 console.log("position added");
//                 await OrderModel.updateOne({_id: order._id} , {positionId: position._id})
//                 const redisUser = {
//                     positionId: position._id,
//                     userId: req.userId,
//                     symbol: symbol,
//                     side: side,
//                     entryPrice: entryPrice,
//                     quantity: quantity,
//                     margin: margin,
//                     leverage: leverage,
//                     liquidationPrice: liquidationPrice,
//                     stopLoss: stopLoss,
//                     takeProfit: takeProfit
//                 }
//                 const listLength = await redis.hset(`position:${symbol}`, position._id.toString() , JSON.stringify(redisUser));
//                 console.log(`redis done ${listLength}`);
//                 return res.json({
//                     success: true,
//                     position: {
//                         positionId: position._id,
//                         symbol: symbol,
//                         side: side,
//                         entryPrice: entryPrice,
//                         quantity: quantity,
//                         margin: margin,
//                         leverage: leverage,
//                         liquidationPrice: liquidationPrice,
//                         positionSize : positonSize,
//                         stopLoss : stopLoss,
//                         takeProfit: takeProfit,
//                         openedAt: position.openedAt
//                     },
//                     newBalance: user.balance - margin
//                 })
//                 console.log("ran fine")
//              }
//         }
        
//         console.log("Order is restored")
        
//     }
    
//     return res.status(500).json({message:"Failed due to some error"})
// })

// app.post("/limit-order", AuthMiddleware, async (req,res) => {
//     const {margin , leverage , side , symbol , takeProfit , stopLoss, limitPrice , expiry, type } = req.body;
//     const user = await UserModel.findOne({
//         pubkey: req.publickey
//     })
//     if(user){
//         if(margin > Number(user.balance)){
//             return res.json({message:"Not enough Funds"})
//         }
//         console.log("user found");
//         const positon = margin*leverage;
//         const realLimitPrice = Number(limitPrice)
//         const entryPrice = parseFloat(await redis.get(`${symbol}_PRICE`));
//         const solPrice = parseFloat(await redis.get("SOLUSDT_PRICE"));
//         const positonSize = positon*solPrice;
//         const quantity = positonSize/realLimitPrice;
//         const marginInUSD = margin*solPrice;
//         const liquidationPrice = side === "LONG" ? realLimitPrice - (marginInUSD/quantity) : realLimitPrice + (marginInUSD/quantity); 
//         const order = await OrderModel.create({
//             userId: req.userId,
//             symbol: symbol,
//             side: side,
//             type: type,
//             margin: margin,
//             leverage:leverage,
//             status:"waiting",
//             limitPrice:realLimitPrice,
//             expiry: expiry,
//             liquidationPrice:liquidationPrice,
//             stopLoss:stopLoss,
//             takeProfit:takeProfit,
//             quantity:quantity

//         })
//         if(order){
//             console.log("order added");
//             await user.updateOne({$inc:{balance: -margin}});
//                 const redisUser = {
//                     orderId: order._id,
//                     userId: req.userId,
//                     symbol: symbol,
//                     side: side,
//                     expiry: expiry,
//                     limitPrice: realLimitPrice,
//                     margin: margin,
//                     leverage: leverage,
//                     liquidationPrice: liquidationPrice,
//                     stopLoss: stopLoss,
//                     takeProfit: takeProfit,
//                     quantity: quantity
//                 }
//                 const listLength = await redis.hset(`limitOrder:${symbol}`, order._id.toString() , JSON.stringify(redisUser));
//                 console.log(`redis done ${listLength}`);
//                 return res.json({
//                     success: true,
//                     position: {
//                         orderId: order._id,
//                         symbol: symbol,
//                         side: side,
//                         entryPrice: realLimitPrice,
//                         quantity: quantity,
//                         margin: margin,
//                         leverage: leverage,
//                         liquidationPrice: liquidationPrice,
//                         positionSize : positonSize,
//                         stopLoss : stopLoss,
//                         takeProfit: takeProfit,
//                     },
//                     newBalance: user.balance - margin
//                 })
//                 console.log("ran fine")
//              }
//         }

// })

// app.post("/api/positions", AuthMiddleware, async(req, res) => {

//     const userId = req.userId;
//     const response = await PositionModel.find({
//         userId: userId,
//         status:"filled"
//     })
//     res.json(response)

// })

// app.post("/api/trades", AuthMiddleware, async(req, res) => {

//     const userId = req.userId;
//     const response = await PositionModel.find({
//         userId: userId,
//         status:"closed"
//     })
//     res.json(response)

// })

// app.post("/api/closePositions",AuthMiddleware , async (req,res) => {
//     const userId = req.userId;
//     const posId = req.body.positionId;
//     const mongoPOSId = new mongoose.Types.ObjectId(posId);
//     const mongoUSRId = new mongoose.Types.ObjectId(userId);
//     const symbol = req.body.symbol;
//     const redisData = await redis.hget(`position:${symbol}`, posId);
//     if(!redisData){
//         console.log("Position not found");
//         return res.status(403).json({message:"Position Not found"})
//     }
//     const positions = JSON.parse(redisData)
//     if(positions.userId != userId){
//         console.log("Not your trade");
//         return res.status(403).json({message:"Not your trade"})
//     }
//     const currentPrice = Number(await redis.get(`${symbol}_PRICE`));
//     const solPrice = Number(await redis.get("SOLUSDT_PRICE"));
//     const PnL = positions.side == "LONG" ? (currentPrice - positions.entryPrice) * positions.quantity : (positions.entryPrice - currentPrice)* positions.quantity;
//                 const PnLsol = PnL / solPrice;
//                 const refund = Math.max(0,positions.margin + PnLsol);
//                 await UserModel.updateOne({
//                     _id: mongoUSRId
//                 }, {
//                     $inc:{balance: refund}
//                 })
//                 await PositionModel.updateOne({
//                     _id: mongoPOSId
//                 },{
//                     realizedPnL: PnL,
//                     status: "closed",
//                     closingPrice: currentPrice,
//                     closedAt: Date.now()
//                 })
//                 await redis.hdel(`position:${symbol}` , positions.positionId)

//                 return res.json({
//                     success: true,
//                     message:"Position Closed",
//                     PnL:PnL,
//                     refund: refund
//                 })
    
//     }
// )


async function SyncRedis(){
    
    const positions = await PositionModel.find({status:"filled"});
    const limitOrders = await OrderModel.find({status:"waiting"});
    const keys = await redis.keys('position:*')
    if(keys.length > 0){
        await redis.del(...keys);
    }

    for(const pos of positions){
        const redisUser = {
                positionId: pos._id,        
                userId: pos.userId,
                symbol: pos.symbol,
                side: pos.side,
                entryPrice: pos.entryPrice,
                quantity: pos.quantity,
                margin: pos.margin,
                leverage: pos.leverage,
                liquidationPrice: pos.liquidationPrice,
                stopLoss: pos.stopLoss,
                takeProfit: pos.takeProfit 
            };
            await redis.hset(`position:${pos.symbol}`, pos._id.toString() , JSON.stringify(redisUser));
    }   
    for(const ods of limitOrders){
        const redisUser = {
                orderId: ods._id,        
                userId: ods.userId,
                symbol: ods.symbol,
                side: ods.side,
                limitPrice: ods.limitPrice,
                expiry: ods.expiry,
                margin: ods.margin,
                leverage: ods.leverage,
                liquidationPrice: ods.liquidationPrice,
                stopLoss: ods.stopLoss,
                takeProfit: ods.takeProfit,
                quantity: ods.quantity,
                
            };
            await redis.hset(`limitOrder:${ods.symbol}`, ods._id.toString() , JSON.stringify(redisUser));
    }
            console.log("Redi Hydration done")

}

io.use(SocketMiddleware);
io.on('connection' , (socket) =>{
    const userId = socket.data.userId;
    if(!socket.data.isGuest && userId){
        socket.join(userId)
    console.log(`room for ${userId}`)

    }else{
        console.log("Guest connected");
    }
    
   
})
//-----------------------------------------------------------------------------HNADLER WS---------------------------------------------------
//-----------------------------------------------------------------------------HNADLER WS---------------------------------------------------
//-----------------------------------------------------------------------------HNADLER WS---------------------------------------------------
//-----------------------------------------------------------------------------HNADLER WS---------------------------------------------------

// const streams = ["btcusdt@kline_1m" , "solusdt@kline_1m" , "ethusdt@kline_1m"].join('/')
// const binanceWsURL = `wss://stream.binance.com:9443/stream?streams=${streams}`;
// const binanceWS = new WebSocket(binanceWsURL);
// binanceWS.on('message' ,async (message:string) => {
//     const rawData =  await JSON.parse(message);
//     const data = rawData.data;
//     const kline = data.k;
//     const symbol = data.s;
//     const currentPrice = parseFloat(kline.c)
//     await redis.set(`${symbol}_PRICE`, currentPrice);
//     const IssolPrice = await redis.get('SOLUSDT_PRICE');
//     const solPrice = IssolPrice ? parseFloat(IssolPrice) : 1
//     if(symbol == "BTCUSDT" || symbol == "SOLUSDT" || symbol == "ETHUSDT"){

//         const [redisDataPOS, redisDataLimit] = await Promise.all([
//                 redis.hvals(`position:${symbol}`),
//                 redis.hvals(`limitOrder:${symbol}`)
//             ]);
//         const positions = redisDataPOS.map(item => JSON.parse(item));
//         // positions.forEach((p, idx) => {
//         //     const m = Number(p.margin);
//         //     const e = Number(p.entryPrice);
//         //     const q = Number(p.quantity);
//         //     if (isNaN(m) || isNaN(e) || isNaN(q)) {
//         //         console.error(`BAD POSITION [${idx}]:`, JSON.stringify(p));
//         //     }
//         // });
//         const limitOrders = redisDataLimit.map(item => JSON.parse(item));

//         for( let i = 0; i < limitOrders.length ; i++){
//             const orderId = new mongoose.Types.ObjectId(limitOrders[i].orderId);
//             if( limitOrders[i].side == "LONG" && currentPrice <= limitOrders[i].limitPrice || limitOrders[i].side == "SHORT" && currentPrice >= limitOrders[i].limitPrice){
//                 const positionSize = Number(limitOrders[i].margin * limitOrders[i].leverage)
//                 const limitOrderToPOS = await PositionModel.create({ // limit idhar haiii ....................................................
//                     userId: limitOrders[i].userId,
//                     symbol: limitOrders[i].symbol,
//                     side: limitOrders[i].side,
//                     type: "Limit Order",
//                     margin: limitOrders[i].margin,
//                     entryPrice:limitOrders[i].limitPrice,
//                     quantity:limitOrders[i].quantity,
//                     leverage: limitOrders[i].leverage,
//                     positionSize: positionSize,
//                     liquidationPrice: limitOrders[i].liquidationPrice,
//                     stopLoss: limitOrders[i].stopLoss,
//                     takeProfit: limitOrders[i].takeProfit,
//                     realizedPnL: null,
//                     closingPrice: null,
//                     status: "filled",
//                     closedAt: null,
//                     openedAt: Date.now()

//                 })
                
//                 const redisUser = {
//                     positionId: limitOrderToPOS._id,
//                     userId: limitOrderToPOS.userId,
//                     symbol: symbol,
//                     side: limitOrderToPOS.side,
//                     entryPrice: limitOrderToPOS.entryPrice,
//                     quantity: limitOrderToPOS.quantity,
//                     margin: limitOrderToPOS.margin,
//                     leverage: limitOrderToPOS.leverage,
//                     liquidationPrice: limitOrderToPOS.liquidationPrice,
//                     stopLoss: limitOrderToPOS.stopLoss,
//                     takeProfit: limitOrderToPOS.takeProfit
//                 }
//                 await Promise.all([
//                          OrderModel.updateOne({ _id: orderId} ,{ status:"filled" , positionId: limitOrderToPOS._id , filledAt: Date.now()}),
//                          redis.hdel(`limitOrder:${limitOrderToPOS.symbol}` , limitOrders[i].orderId),
//                          redis.hset(`position:${symbol}`, limitOrderToPOS._id.toString() , JSON.stringify(redisUser))
//                 ])
                
//             }
//         }
//         for ( let i =0; i < positions.length; i++){
//             const mongoPOSId = new mongoose.Types.ObjectId(positions[i].positionId)
//             const mongoUSRId = new mongoose.Types.ObjectId(positions[i].userId)
            
//             if( currentPrice <= positions[i].liquidationPrice && positions[i].side == 'LONG' || currentPrice >= positions[i].liquidationPrice && positions[i].side == 'SHORT'){
//                 const PnL = positions[i].side == "LONG" ? (currentPrice - positions[i].entryPrice) * positions[i].quantity : (positions[i].entryPrice - currentPrice) * positions[i].quantity;
                
//                 await Promise.all([
//                      PositionModel.updateOne({
//                     _id: mongoPOSId
//                 },{
//                     realizedPnL: PnL,
//                     status: "liquidated",
//                     closingPrice: currentPrice,
//                     closedAt: Date.now()
//                 }),
//                  redis.hdel(`position:${positions[i].symbol}` , positions[i].positionId)
//                 ])
                
//                 continue;
                
//             } 
            
//             else if( (currentPrice >= positions[i].takeProfit || currentPrice <= positions[i].stopLoss ) && positions[i].side == 'LONG' || (currentPrice >= positions[i].stopLoss || currentPrice <= positions[i].takeProfit) && positions[i].side == 'SHORT'){
//                 const PnL = positions[i].side == "LONG" ? (currentPrice - positions[i].entryPrice) * positions[i].quantity : (positions[i].entryPrice - currentPrice)* positions[i].quantity;
//                 const PnLsol = PnL / solPrice;
//                 const refund = Math.max(0,positions[i].margin + PnLsol);
                
//                 await Promise.all([
//                         UserModel.updateOne({
//                         _id: mongoUSRId
//                     }, {
//                         $inc:{balance: refund}
//                     }),
//                     PositionModel.updateOne({
//                         _id: mongoPOSId
//                     },{
//                         realizedPnL: PnL,
//                         status: "closed",
//                         closingPrice: currentPrice,
//                         closedAt: Date.now()
//                     }),
//                     redis.hdel(`position:${positions[i].symbol}` , positions[i].positionId)
//                 ])
                
//                 continue;
                
//             } else{
//                 const livePnL = positions[i].side == "LONG" ? (currentPrice - positions[i].entryPrice )* positions[i].quantity : (positions[i].entryPrice - currentPrice) * positions[i].quantity;
//                 io.to(positions[i].userId).emit("position-update" , {
//                     positionId: positions[i].positionId,
//                     pnl: livePnL,
//                     currentPrice: currentPrice
//                 })
//             }

//         }
        




//         io.emit(`get${symbol}-price` , currentPrice);
//         const liveCandle : CandleData = {
//         time: Math.floor((kline.t/1000)/60)*60,
//         open: parseFloat(kline.o),
//         high: parseFloat(kline.h),
//         low: parseFloat(kline.l),
//         close: parseFloat(kline.c),
//     } 
//     io.emit(`live-candle-${symbol}` , liveCandle);
    
    
//     // console.log(liveCandle)
    
// }
    
// });
    


