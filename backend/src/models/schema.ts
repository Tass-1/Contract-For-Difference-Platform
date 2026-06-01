import mongoose , {model , Schema} from "mongoose";

const UserSchema = new Schema({
    pubkey: {type: String , unique: true},
    nonce: String,
    balance: {type: Number, default: 0}
})

const DepositSchema = new Schema({
    txnSignature: {type: String , unique: true},
    userId: String,
    amount: Number,
},{
    timestamps:true
});

const WithdrawlSchema = new Schema({
    txnSignature: {type: String , unique: true},
    userId: String,
    amount: Number,
},{
    timestamps:true
});

const OrderSchema = new Schema({
    userId: {type: String},
    symbol: String,
    side: String,
    type: String,
    margin: Number,
    leverage: Number,
    status: String,
    liquidationPrice: Number,
    quantity: Number,
    stopLoss: {type:Number, default: null},
    takeProfit: {type:Number, default: null},
    limitPrice: {type:Number, default: null},
    expiry: {type:Date, default: null},
    positionId: {type: String, default: null},
    filledAt: {type: Date , default: Date.now}

})

const PositionSchema = new Schema({
    userId: {type: String},
    symbol: String,
    side: String,
    type: String,
    margin: Number,
    entryPrice: Number,
    quantity: Number,
    leverage: Number,
    positionSize: Number,
    liquidationPrice: Number,
    stopLoss: {type:Number, default: null},
    takeProfit: {type:Number, default: null},
    realizedPnL: {type:Number, default: null},
    closingPrice: {type:Number, default: null},
    status: {type:String, default: "filled"},
    openedAt: {type:Date, default: Date.now},
    closedAt: {type:Date, default: null},
    

})




export const UserModel =  model("users" , UserSchema)
export const DepositModel =  model("deposits" , DepositSchema)
export const WithdrawlModel =  model("withdrawls" , WithdrawlSchema)
export const OrderModel =  model("orders" , OrderSchema)
export const PositionModel =  model("positions" , PositionSchema)