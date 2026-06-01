import { Keypair, Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import express from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { UserModel, WithdrawlModel } from "../models/schema";
import bs58 from 'bs58';
import {Connection} from "@solana/web3.js";
import {z} from "zod";
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
const conn = new Connection("https://api.devnet.solana.com/");

const wSchema = z.object({
    amount: z.number().min(0.01, "Margin should be positive")
})

router.post("/withdraw" , AuthMiddleware , async (req,res) => {
    const isValid = wSchema.safeParse(req.body);
    if(!isValid.success){
        return res.status(400).json({message:"Invalid args"})
    }
    const {amount} = isValid.data;
    const user = await UserModel.findOne({
        pubkey: req.publickey
    })
    if(user){
        console.log("user found");
        if(amount > user.balance){
            return res.json({message:"Not Enough Funds"})
        }
        console.log("entered with");
        console.log(process.env.PRIVATE_KEY)
        const secretKey = bs58.decode(process.env.PRIVATE_KEY);
        
        const serverKeypair = Keypair.fromSecretKey(secretKey);
        const transaction = new Transaction();
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(process.env.PUBLIC_KEY),
                toPubkey: new PublicKey(req.publickey),
                lamports: amount*LAMPORTS_PER_SOL
            })
        )
        const Latestblockhash = await conn.getLatestBlockhash();
        transaction.recentBlockhash = Latestblockhash.blockhash;
        transaction.feePayer = new PublicKey(process.env.PUBLIC_KEY) 
        const TxnSignature = await conn.sendTransaction(transaction , [serverKeypair])
        const confirmation = await conn.confirmTransaction({
            blockhash: Latestblockhash.blockhash,
            lastValidBlockHeight: Latestblockhash.lastValidBlockHeight,
            signature: TxnSignature
        })
        console.log(confirmation)
        if(confirmation.value.err == null){
            const user = await UserModel.findOneAndUpdate({
                pubkey: req.publickey
            },{
                $inc: {balance: -amount}
            }, {new: true})
            await WithdrawlModel.create({
                txnSignature: TxnSignature,
                userId: req.userId,
                amount: amount
            })
            return res.json({message:"Money transferred Successfully!", newBalance: user?.balance})
        }
    }
})


export default router;