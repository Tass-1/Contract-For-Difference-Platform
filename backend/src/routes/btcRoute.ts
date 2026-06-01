import express from "express";
import redis from "../config/Redis.ts";
const router = express.Router();



router.get("/test/btc" , async (req , res) => {
    let displayPrice = await redis.get("BTCUSDT_PRICE");
    const io = req.app.get("io");
    io.emit("btc-price" , displayPrice);
    res.json({price: displayPrice})
})

export default router;
