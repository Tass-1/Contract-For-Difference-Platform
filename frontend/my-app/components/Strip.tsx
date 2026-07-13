"use client";
import { useStore } from "@/app/store/useStore"
import axios from "axios"
import { useEffect, useState } from "react";
import GetPrice from "./GetPrice";


export default function Strip(){
    const symbol = useStore((state) => state.symbol);
    
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
    
    return (
        <div className="w-full h-16 rounded-t-md flex items-center px-5 bg-og mb-1 gap-6 overflow-x-auto border-b border-white/5">
            <div className="flex items-center gap-3 pr-6 border-r border-white/10 shrink-0">
                <span className="text-lg font-bold tracking-widest text-white">{symbol}</span>
                <span className="text-lg font-mono text-profit"><GetPrice s={symbol}/></span>
            </div>
            <div className="flex flex-col justify-center pr-6 border-r border-white/10 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-profit"></span>
                    24h High
                </div>
                <div className="text-white text-xs font-mono mt-0.5">
                    {parseFloat(data?.highPrice).toFixed(2)}
                </div>
            </div>
            <div className="flex flex-col justify-center pr-6 border-r border-white/10 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-loss"></span>
                    24h Low
                </div>
                <div className="text-white text-xs font-mono mt-0.5">
                    {parseFloat(data?.lowPrice).toFixed(2)}
                </div>
            </div>
            <div className="flex flex-col justify-center pr-6 border-r border-white/10 shrink-0">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">24h Volume</div>
                <div className="text-white text-xs font-mono mt-0.5">
                    {parseFloat(data?.vol).toFixed(2)}
                </div>
            </div>
            <div className="flex flex-col justify-center shrink-0">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">24h Vol USDT</div>
                <div className="text-white text-xs font-mono mt-0.5">
                    {parseFloat(data?.qouteVol).toFixed(2)}
                </div>
            </div>
        </div>
    )
}