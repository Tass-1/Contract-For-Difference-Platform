"use client";
import { useStore } from "@/app/store/useStore"
import axios from "axios"
import { useEffect, useState } from "react";
import GetPrice from "./GetPrice";

interface BinanceData {
    highPrice: string;
    lowPrice: string;
    vol: string;
    qouteVol: string;
}

export default function Strip() {
    const symbol = useStore((state) => state.symbol);
    const [data, setData] = useState<BinanceData | null>(null);

    useEffect(() => {
        let isMounted = true; 

        async function getData() {
            try {
                const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
                if (isMounted) {
                    setData({
                        highPrice: response.data.highPrice,
                        lowPrice: response.data.lowPrice,
                        vol: response.data.volume,
                        qouteVol: response.data.quoteVolume
                    });
                }
            } catch (error) {
                console.error(error);
            }
        }
        
        if (symbol) {
            getData();
        }

        const interval = setInterval(getData, 5000);
        
        return () => {
            isMounted = false;
            clearInterval(interval);
        }
    }, [symbol]);

    const formatNumber = (numStr?: string) => {
        if (!numStr) return "---";
        const num = parseFloat(numStr);
        return num > 1000 
            ? num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
            : num.toFixed(2);
    };

    return (
        <div className="w-full h-[60px] flex items-center px-5 bg-og mb-1 overflow-x-auto hide-scrollbar select-none border-b border-white/5">
            
            <div className="flex items-center gap-6 pr-6 min-w-max">
                <div className="flex items-baseline gap-1">
                    <span className="text-[22px] font-semibold text-[#eaecef] tracking-tight">
                        {symbol?.replace('USDT', '')}
                    </span>
                    <span className="text-[13px] font-medium text-[#848e9c]">
                        /USDT
                    </span>
                </div>
                <div className="text-[18px] font-medium tabular-nums text-profit">
                    <GetPrice s={symbol}/>
                </div>
            </div>

            <div className="w-px h-7 bg-white/10 mx-2 shrink-0 rounded-full"></div>

            <div className="flex items-center gap-10 pl-6 min-w-max">
                
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#848e9c] leading-none">24h High</span>
                    <span className="text-[14px] font-medium text-[#eaecef] tabular-nums leading-none">
                        {formatNumber(data?.highPrice)}
                    </span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#848e9c] leading-none">24h Low</span>
                    <span className="text-[14px] font-medium text-[#eaecef] tabular-nums leading-none">
                        {formatNumber(data?.lowPrice)}
                    </span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#848e9c] leading-none">
                        24h Vol ({symbol?.replace('USDT', '') || 'Base'})
                    </span>
                    <span className="text-[14px] font-medium text-[#eaecef] tabular-nums leading-none">
                        {formatNumber(data?.vol)}
                    </span>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#848e9c] leading-none">
                        24h Vol (USDT)
                    </span>
                    <span className="text-[14px] font-medium text-[#eaecef] tabular-nums leading-none">
                        {formatNumber(data?.qouteVol)}
                    </span>
                </div>

            </div>
            
        </div>
    )
}