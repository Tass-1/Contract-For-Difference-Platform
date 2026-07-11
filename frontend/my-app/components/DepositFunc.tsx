'use client';

import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import { useRef } from "react";
import { api } from '@/lib/api';



export default function DepositFunc(){

    const sol = useRef(null);
    const wallet = useWallet();
    const connection = new Connection("https://api.devnet.solana.com/")
    const pubkey = wallet.publicKey;
    async function Deposit(){
        const inputSol = Number(sol.current?.value)
        if(!pubkey|| !inputSol || inputSol<=0){
            return res.json({message:"BAd boy"})
        }
        try{
            const transaction = new Transaction();
            transaction.add(
            SystemProgram.transfer({
                fromPubkey: pubkey,
                toPubkey: new PublicKey("EGxEqNs8wg83T4CVoV312aMpBzyMcF3Fdx5o4K8USVMK"),
                lamports: inputSol*LAMPORTS_PER_SOL
            })
        )
            const Latestblockhash = await connection.getLatestBlockhash()
            transaction.recentBlockhash = Latestblockhash.blockhash;
            transaction.feePayer = pubkey;
            const signature = await wallet.sendTransaction(transaction , connection )
            console.log("chal gya bc")
            await connection.confirmTransaction({
                blockhash: Latestblockhash.blockhash,
                lastValidBlockHeight: Latestblockhash.lastValidBlockHeight,
                signature:signature

            })
            const response = await api.post("/deposit" , {
                amount:inputSol,
                signature:signature
            },{
                headers:{
                    'authorization': localStorage.getItem('authorization')
                }
            })
            
        }
        catch(e){
            console.log("smth went wront" , e)
        }
        
    }

    return(
        <div>
            <input type="number" placeholder="Enter Value" ref={sol} className="text-white p-1 bg-blue-200" />
            <button onClick={Deposit} className="rounder bg-blue-400 px-5 py-2 cursor-pointer">Deposit</button>
        </div>
    )
}