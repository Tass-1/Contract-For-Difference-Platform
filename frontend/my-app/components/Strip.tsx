"use client";
import { useStore } from "@/app/store/useStore"
import axios from "axios"
import { useEffect, useState } from "react";
import GetPrice from "./GetPrice";


export default function Strip(){
    const symbol = useStore((state) => state.symbol);
    
    // const response = axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    // console.log(response)
    interface BinanceData{
        highPrice: string;
        lowPrice: string;
        vol: string;
        qouteVol: string;

    }
    const [data , setData] = useState<BinanceData | null>(null);
    useEffect(()=> {
        async function getData(){
            const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
            setData({
                highPrice: response.data.highPrice,
                lowPrice: response.data.lowPrice,
                vol: response.data.volume,
                qouteVol: response.data.quoteVolume
            })
        }
        if(symbol){
            getData()
        }

        const interval = setInterval(getData , 5000);
        return () => clearInterval(interval)
        
     } , [symbol])
    // async function getData() {
        
    //     const highPrice = response.data.highPrice;o
    //     const lowPrice = response.data.lowPrice;
    //     const volume = response.data.volume;
    //     const quoteVol = response.data.quoteVolume;
    // }
    // getData()
    
    return (
        <div className="w-250 h-18 rounded-md flex items-center p-4 bg-og mb-1 gap-10  ">
            <div className="text-2xl">
                {symbol}
            </div>
            <div>
                <h1 className="text-xl text-white"><GetPrice s={symbol}/></h1>
            </div>
            <div className="flex flex-col text-gray-600 text-sm justify-between ">
                24h High
                <div className="text-white text-xs">
                    {parseFloat(data?.highPrice).toFixed(2)}
                </div>
            </div>     
            <div className="flex flex-col text-gray-600 text-sm justify-between ">
                24h Low
                <div className="text-white text-xs">
                    {parseFloat(data?.lowPrice).toFixed(2)}
                </div>
            </div>     
            <div className="flex flex-col text-gray-600  text-sm justify-between ">
                24h Volume
                <div className="text-white text-xs">
                    {parseFloat(data?.vol).toFixed(2)}
                </div>
            </div>     
            <div className="flex flex-col text-gray-600 text-sm justify-between ">
                24h Vol USDT
                <div className="text-white text-xs">
                    {parseFloat(data?.qouteVol).toFixed(2)}
                </div>
            </div>     
        </div>
    )
}