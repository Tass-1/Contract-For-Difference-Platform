"use client";
import NavBar from "@/components/Navigation";
import WalletAdapter from "@/components/walletAdapter";
import { useRef, useState } from "react";
import { useStore } from "../store/useStore";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import { api } from '@/lib/api';


export default function Txn(){
    return(
        <div>
            <TxnContent/>
        </div>
            
        
    )
}


function TxnContent(){
    const [option , setOption] = useState("Withdraw") 
    const isLoggedIn = useStore(state => state.isLoggedIn)
    const setBalance = useStore(state => state.setBalance)
    const wallet = useWallet()
    const {connection} = useConnection()
    const [amt , setAmt] = useState<number | string>("")
    const symbol = "SOLUSDT"
    const currPrice = useStore(state => state.livePrice[symbol])
    async function submit(){
        if( option == "Deposit"){
            const Comppubkey = new PublicKey("EGxEqNs8wg83T4CVoV312aMpBzyMcF3Fdx5o4K8USVMK");
            const pubkey = wallet.publicKey
            const inputSol = Number(amt)
            if(!pubkey|| !inputSol || inputSol<=0){
                console.log(pubkey)
                console.log("!pubkey || !sol || sol < = 0")
                return;
            }
            try{
                const transaction = new Transaction();
                transaction.add(
                SystemProgram.transfer({
                    fromPubkey: pubkey,
                    toPubkey: Comppubkey,
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

                setBalance(response.data.newBalance)
            }
            catch(e){
                console.log("smth went wront" , e)
            }

        } else if(option == "Withdraw"){
                const response = await api.post("/withdraw" , {
                amount: Number(amt)
            },{
                    headers:{
                        'authorization': localStorage.getItem('authorization')
                    }
                })
            console.log(response.data?.message)
            setBalance(response.data.newBalance)
        }
    }
    
    return(
        <div className="flex justify-center items-center min-h-screen bg-og px-4">

            <div className="w-full max-w-md rounded-3xl bg-muted border border-white/10 shadow-2xl shadow-black/50 p-2">

                <div className="flex p-1 justify-between items-center rounded-2xl gap-1 bg-black/40 m-2">
                    <button
                        type="button"
                        onClick={() => setOption("Withdraw")}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${option == "Withdraw" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
                    >
                        Withdraw
                    </button>
                    <button
                        type="button"
                        onClick={() => setOption("Deposit")}
                        className={`w-full py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all cursor-pointer ${option == "Deposit" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
                    >
                        Deposit
                    </button>
                </div>

                <div className="mx-2 mt-4 rounded-2xl bg-black/30 border border-white/5 p-5">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{option == "Deposit" ? "You pay" : "You receive"}</span>
                        <span className="text-xs text-muted-foreground font-mono">SOL</span>
                    </div>
                    <input
                        type="text"
                        placeholder="0.00"
                        value={amt}
                        onChange={(e) => setAmt(e.target.value)}
                        className="w-full bg-transparent outline-none text-5xl font-mono text-white placeholder:text-white/20"
                    />
                    <div className="mt-3 pt-3 border-t border-white/5 text-sm font-mono text-muted-foreground">
                        ≈ {(Number(amt) * currPrice || 0).toFixed(2)} USDT
                    </div>
                </div>

                <div className="p-2 mt-4">
                    <button
                        className={`w-full rounded-2xl font-semibold text-lg py-4 transition-all duration-300 ease-out bg-profit text-black hover:bg-[#26a698] active:scale-[0.98] cursor-pointer ${!isLoggedIn ? "opacity-50 pointer-events-none" : ""}`}
                        onClick={submit}
                    >
                        {option}
                    </button>
                    {!isLoggedIn && (
                        <div className="text-center text-xs text-muted-foreground mt-3">Connect your wallet to continue</div>
                    )}
                </div>

            </div>
        </div>
    )
}