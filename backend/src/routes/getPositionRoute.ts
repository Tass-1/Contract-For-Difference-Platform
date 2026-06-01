import express from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { PositionModel } from "../models/schema";
import {OrderModel} from  "../models/schema";
const router = express.Router();

router.post("/api/positions", AuthMiddleware, async(req, res) => {

    const userId = req.userId;
    const option = req.body.option;
    if(option == "Trade History"){
        const response = await PositionModel.find({
        userId: userId,
        })
        res.json(response)
    }
    if(option == "Order History"){
        const response = await OrderModel.find({
        userId: userId
        })
        res.json(response)
    }
    if(option == "Open Positions"){
        const response = await PositionModel.find({
        userId: userId,
        status: "filled"
        })
        res.json(response)
    }
    

})

export default router;