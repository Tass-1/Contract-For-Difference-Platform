'use client';
import { useEffect, useState } from "react";

interface TickerData {
    symbol: string;
    price: string;
    change: number;
}


const initialTickers: Record<string, TickerData> = {
    "BTCUSDT": { symbol: "BTCUSDT", price: "...", change: 0 },
    "ETHUSDT": { symbol: "ETHUSDT", price: "...", change: 0 },
    "SOLUSDT": { symbol: "SOLUSDT", price: "...", change: 0 },
    "BNBUSDT": { symbol: "BNBUSDT", price: "...", change: 0 },
    "XRPUSDT": { symbol: "XRPUSDT", price: "...", change: 0 }
};

export default function TickerTape() {
    
    const [tickers, setTickers] = useState<Record<string, TickerData>>(initialTickers);

    useEffect(() => {
        const streams = "btcusdt@ticker/ethusdt@ticker/solusdt@ticker/bnbusdt@ticker/xrpusdt@ticker";
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setTickers((prev) => ({
                ...prev,
                [data.s]: {
                    symbol: data.s,
                    price: parseFloat(data.c).toFixed(2),
                    change: parseFloat(data.P) 
                }
            }));
        };

        return () => ws.close();
    }, []);

    const tickerList = Object.values(tickers);

    

    return (
        <div className="w-full bg-black/40 border-y border-white/10 overflow-hidden flex items-center h-10">
            <div className="animate-marquee flex gap-10 pl-10 cursor-default">
                {[...tickerList, ...tickerList].map((coin, i) => {
                    const isPositive = coin.change >= 0;
                    return (
                        <div key={i} className="flex gap-2 items-center text-sm font-mono whitespace-nowrap">
                            <span className="text-white font-bold">{coin.symbol.replace("USDT", "")}</span>
                            <span className="text-muted-foreground">${coin.price}</span>
                            
                           
                            <span className={isPositive ? "text-profit" : "text-loss"}>
                                {coin.price === "..." ? "" : (isPositive ? "+" : "") + coin.change.toFixed(2) + "%"}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}