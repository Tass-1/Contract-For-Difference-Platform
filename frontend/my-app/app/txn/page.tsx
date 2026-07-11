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
        <div className="">
               
                <div className="flex py-10 items-center h-screen flex-col rounded-xl bg-og">
                    <div className="mt-5 p-5 bg-muted rounded-xl">
                        <div className="flex py-1 px-1 w-xl justify-between items-center rounded-xl gap-1 bg-black">
                            <div className={` w-full text-mute px-1 py-1 rounded-xl text-xl font-thin flex justify-center cursor-pointer ${option == "Withdraw" ? "bg-yellow-300/90 text-black" : null}`} onClick={() => {setOption("Withdraw")}} > Withdraw </div>
                            <div className={` w-full text-mute px-1 font-sans py-1 text-xl rounded-xl font-thin flex justify-center cursor-pointer ${option == "Deposit" ? "bg-[#f2c14b] text-black" : null}`} onClick={() => {setOption("Deposit")}}> Deposit</div>
                        </div>
                        <div>
                            <input type="text" placeholder="Amount (SOL)" onChange={(e) => setAmt(e.target.value)} className="bg-og p-4 m-4 rounded-xl h-40 w-135 text-6xl text-[#4c5666]" />
                        </div>
                        <div className="bg-black/90 p-4 mx-4 my-1 rounded-xl h-20 w-135 text-5xl text-[#4c5666]"> 
                            {(Number(amt) * currPrice).toFixed(4)}
                        </div>
                        <div className="p-4 flex items-center justify-center">
                            <button className = {`bg-profit text-black cursor-pointer rounded-md font-medium font-sans p-3 w-100 h-20 text-3xl hover:scale-102 hover:bg-[#26a698] active:scale-100 transition-all duration-300 ease-out ${!isLoggedIn ? "disabled" : null} `} onClick={submit}> {option}</button>
                    
                        </div>
                    </div>
                </div>
        </div>
    )
}