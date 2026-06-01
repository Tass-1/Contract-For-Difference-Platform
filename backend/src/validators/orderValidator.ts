import {z} from "zod";

export const orderSchema = z.object({
    margin : z.number().min(0.1,"Minimum margin is 0.1").max(10,"Maximum margin is 10"),
    leverage : z.number().min(1,"Minimum leverage is 1").max(10,"Maximum leverage is 10"),
    side : z.enum(["LONG" , "SHORT"]),
    symbol : z.enum(["BTCUSDT" , "SOLUSDT" , "ETHUSDT"]),
    stopLoss : z.number().min(1,"Minimum stoploss is 1"),
    takeProfit : z.number().min(1,"Minimum takeprofit is 1"),
    type : z.enum(["Limit" , "Market"])
})

export const limitSchema = orderSchema.extend({
    limitPrice: z.number().min(1,"Minimum Limit price is 1"),
    expiry: z.union([z.string(), z.number()]).nullable().optional(),
})