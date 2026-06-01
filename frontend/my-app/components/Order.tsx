'use client';

import axios from "axios";
import { useRef } from "react";


export default function Order() {

    const amount = useRef(null);
    const leverage = useRef(null);
    const symbol = useRef(null);
    const side = useRef(null);
    const stopLoss = useRef(null);
    const takeProfit = useRef(null);
    const limitPrice = useRef(null);
    const expiry = useRef(null);
    const type = useRef<String>(null);
    async function order() {
        console.log("buttonon")
        const margin = Number(amount?.current?.value);
        const leverageNum= Number(leverage?.current?.value);
        

        if( type?.current?.value == "Market"){
            console.log("DOing work for market ordr")
            const response = await axios.post("http://localhost:4000/order",{
                margin: margin,
                leverage: leverageNum,
                symbol: symbol?.current?.value,
                side: side?.current?.value,
                stopLoss : Number(stopLoss?.current?.value),
                takeProfit: Number(takeProfit?.current?.value),
                type: type?.current?.value
            }, {
                headers:{
                    'authorization': localStorage.getItem('authorization')
                }
            })
            console.log(response.data)
         }
         else{
            console.log("DOing work for limit ordr")
            const response = await axios.post("http://localhost:4000/limit-order",{
                margin: margin,
                leverage: leverageNum,
                symbol: symbol?.current?.value,
                side: side?.current?.value,
                stopLoss : Number(stopLoss?.current?.value),
                takeProfit: Number(takeProfit?.current?.value),
                type: type?.current?.value,
                limitPrice: Number(limitPrice?.current?.value),
                expiry: new Date(expiry?.current?.value)
            }, {
                headers:{
                    'authorization': localStorage.getItem('authorization')
                }
            })
         }
    }
        
    


    return(
        <div>
            <input type="Number" placeholder="margin" ref={amount}  className="text-white p-1 bg-blue-200" />
            <input type="Number" placeholder="leverage" ref={leverage}  className="text-white p-1 bg-blue-200" />
            <input type="Number" placeholder="stop loss" ref={stopLoss}  className="text-white p-1 bg-blue-200"/>
            <input type="Number" placeholder="take profit" ref={takeProfit}  className="text-white p-1 bg-blue-200"/>
            <input type="text" placeholder="type" ref={type}  className="text-white p-1 bg-blue-200"/>
            <select name="SYMBOL" ref={symbol}  className="text-white p-1 bg-blue-200"> 
                <option value="BTCUSDT"  className="text-white p-1 bg-blue-200"> BTCUSDT </option>
                <option value="ETHUSDT"  className="text-white p-1 bg-blue-200"> ETHUSDT </option>
                <option value="SOLUSDT"  className="text-white p-1 bg-blue-200"> SOLUSDT </option>
            </select>
            <select name="SIDE" ref={side}  className="text-white p-1 bg-blue-200">
                <option value="LONG"  className="text-white p-1 bg-blue-200"> LONG </option>
                <option value="SHORT"  className="text-white p-1 bg-blue-200"> SHORT </option>
            </select>
            <input type="date" placeholder="expiry" ref={expiry}  className="text-white p-1 bg-blue-200"/>
            <input type="Number" placeholder="limit price" ref={limitPrice}  className="text-white p-1 bg-blue-200"/>
            <button className="rounder bg-blue-400 px-5 py-2 cursor-pointer" onClick={order}> Click me to test ORDER </button>
        </div>
    )
}