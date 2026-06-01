import express from "express"
import nacl from "tweetnacl";
import { UserModel } from "../models/schema";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bs58 from 'bs58';
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
router.post("/auth/nonce", async (req,res) => {
    const pubkey: any = req.body.pubkey;
    const nonce: String = crypto.randomBytes(16).toString('base64');
    await UserModel.findOneAndUpdate(
        {pubkey: pubkey},
        {nonce: nonce},
        {upsert: true , returnDocument: "after", setDefaultOnInsert: true}
    )
    console.log("got req")
    res.json({nonce:nonce})
})

router.post("/auth/verify", async (req,res) => {
    const sign = req.body.sign;
    const pubkey = req.body.pubkey;
    const U =  await UserModel.findOne({
        pubkey:pubkey
    })
    if(U){
        const Nnonce = new TextEncoder().encode(U.nonce); 
        console.log(sign);
        const orginPubkey = bs58.decode(pubkey);
        const UintSign = new Uint8Array(sign);
        const verify: Boolean = nacl.sign.detached.verify(Nnonce, UintSign, orginPubkey);
        console.log(verify);
        if(verify){
            U.nonce = null;
            await U.save();
            const token = jwt.sign({publicKey:U.pubkey , userId: U._id}, JWT_SECRET, {expiresIn: '3d'})
            res.json({token:token})
        }
        else{
            res.json({message:"smnth bad brotha"})
        }
    }
    
})

export default router;