'use client';
import { generateKeyPair } from "@solana/kit"
import { useWallet } from "@solana/wallet-adapter-react";
import { useRef } from "react";
import axios from "axios";



export default function WithdrawMoney () {

    const WithdrawAmount = useRef(null)
    const wallet = useWallet();
    async function withraw(){
        const response = await axios.post("http://localhost:4000/withdraw" , {
            amount: Number(WithdrawAmount.current?.value)
        },{
                headers:{
                    'authorization': localStorage.getItem('authorization')
                }
            })
        console.log(response.data?.message)
    }
    



    return(
        <div>
            <h1>HELLO</h1>
            <input type="Number" placeholder="Amount" ref={WithdrawAmount} className="bg-blue-200"/>
            <button className="text-white bg-red-900 p-2" onClick={withraw}> WITHDRAW </button>
        </div>
    )
}