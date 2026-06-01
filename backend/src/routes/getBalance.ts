import express from "express"
import {AuthMiddleware} from "../middleware/AuthMiddleware"
import mongoose = require("mongoose")
import {UserModel} from "../models/schema"



const router = express.Router()

router.post("/getBalance" , AuthMiddleware , async (req,res) => {
    const ID = new mongoose.Types.ObjectId(req.userId);
    const resp = await UserModel.findOne({
        _id: ID
    })
    if(resp){
        const balance = parseFloat(resp.balance)
        return res.json({balance: balance})
    }
    return res.json({message:"some error in gettin balance"})
    
    
} )

export default router


