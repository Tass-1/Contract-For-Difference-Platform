import express from "express";
import { AuthMiddleware } from "../middleware/AuthMiddleware";
import { DepositModel, UserModel } from "../models/schema";
import {Connection} from '@solana/web3.js'
const router = express.Router();

const conn = new Connection("https://api.devnet.solana.com/");

router.post("/deposit", AuthMiddleware ,async (req,res) => {
    const TxnSignature = req.body.signature;
    const claimAmount = Number(req.body.amount);
    const isTransaction = await conn.getTransaction(TxnSignature , {
        commitment:"confirmed",
        maxSupportedTransactionVersion: 0
    })
    const Keys = isTransaction?.transaction.message.accountKeys;
    console.log("deposit par aa gyi");
    for( let i=0; i<Keys.length ; i++){
        if(Keys[i].toBase58() == "EGxEqNs8wg83T4CVoV312aMpBzyMcF3Fdx5o4K8USVMK"){
            console.log("found key")
            const DepoAmount = (isTransaction?.meta?.postBalances[i] - isTransaction?.meta?.preBalances[i])/1_000_000_000;
            if(DepoAmount == claimAmount){
                await DepositModel.create({
                    txnSignature:TxnSignature,
                    userId: req.userId,
                    amount:DepoAmount
                })
                const user = await UserModel.findOneAndUpdate({
                    pubkey:req.publickey
                },{
                    $inc:{balance:DepoAmount}
                }, {new: true})
                console.log("sahi hai bhai ")
                res.json({
                    newBalance: user?.balance
                })
            }
            break;
        }
    }
    console.log(Keys)
})

export default router;