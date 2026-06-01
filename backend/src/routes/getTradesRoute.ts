import express from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { PositionModel } from "../models/schema";
const router = express.Router();

router.post("/api/trades", AuthMiddleware, async(req, res) => {

    const userId = req.userId;
    const response = await PositionModel.find({
        userId: userId,
        status:"closed"
    })
    res.json(response)

})

export default router;