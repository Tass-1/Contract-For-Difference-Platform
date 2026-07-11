"use client";
import GetPrice from "@/components/GetPrice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useRouter } from "next/navigation";
import { api } from '@/lib/api';

export default function Markets (){
    interface BinanceData{
        highPrice: string;
        lowPrice: string;
        vol: string;
        qouteVol: string;
        priceChange: string;

    }
    const [btc , setBtc] = useState<BinanceData | null>(null);
    const [eth , setEth] = useState<BinanceData | null>(null);
    const [sol , setSol] = useState<BinanceData | null>(null);
    const symbol = useStore(state => state.symbol)
    const setSymbol = useStore(state => state.setSymbol)
    const router = useRouter();
    function Clickiee( s: string){
        setSymbol(s);
        router.push("/trade")
    }
    useEffect(() => {
    async function getChange(){
      await Promise.all(["BTCUSDT" , "ETHUSDT", "SOLUSDT"].map(async sym => {
          const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`);
          if(sym == "BTCUSDT"){ setBtc({
            highPrice: response.data.highPrice,
            lowPrice: response.data.lowPrice,
            vol: response.data.volume,
            qouteVol: response.data.quoteVolume,
            priceChange: response.data.priceChangePercent
          })}
          if(sym == "SOLUSDT"){ setSol({
            highPrice: response.data.highPrice,
            lowPrice: response.data.lowPrice,
            vol: response.data.volume,
            qouteVol: response.data.quoteVolume,
            priceChange: response.data.priceChangePercent
          })}
          if(sym == "ETHUSDT"){ setEth({
            highPrice: response.data.highPrice,
            lowPrice: response.data.lowPrice,
            vol: response.data.volume,
            qouteVol: response.data.quoteVolume,
            priceChange: response.data.priceChangePercent
          })}
        })
      )
    } 
    getChange();

    const interval = setInterval(getChange , 6000);
    return () => {
      clearInterval(interval)
    }
  }  , [])

    return (
        <div className="min-h-screen bg-og p-10">
            <div className="max-w-7xl mx-auto mt-10">
                <div className="mb-8 pl-2">
                    <h1 className="text-4xl font-sans font-bold text-white tracking-wide">Market Overview</h1>
                    <p className="text-muted-foreground mt-2 tracking-wider">Real-time 24h metrics and volume for supported CFDs.</p>
                </div>
                <div className="bg-og border border-white/5 p-4 rounded-3xl shadow-2xl">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow className="">
                                <TableHead> Currencies </TableHead>
                                <TableHead> Value </TableHead>
                                <TableHead> 24High </TableHead>
                                <TableHead> 24Low </TableHead>
                                <TableHead> Volume </TableHead>
                                <TableHead> Quote Volume </TableHead>
                                <TableHead> Percentage Change </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="cursor-pointer" onClick={() => Clickiee("BTCUSDT")} >
                                <TableCell className="font-bold tracking-wider text-base"> BTC/USDT </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> <GetPrice s={"BTCUSDT"}/> </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(btc?.highPrice).toFixed(3)} </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(btc?.lowPrice).toFixed(3)}</TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(btc?.vol).toFixed(3)}</TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(btc?.qouteVol).toFixed(3)} USDT</TableCell>
                                <TableCell className={`text-base text-muted-foreground font-sans tracking-wider ${Number(btc?.priceChange) >= 0 ? "text-profit" : "text-loss"}`}> {Number(btc?.priceChange).toFixed(3)}</TableCell>
                            </TableRow>
                            <TableRow className="cursor-pointer" onClick={() => Clickiee("ETHUSDT")}>
                                <TableCell className="font-bold tracking-wider text-base"> ETH/USDT </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> <GetPrice s={"ETHUSDT"}/> </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(eth?.highPrice).toFixed(3)} </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(eth?.lowPrice).toFixed(3)}</TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(eth?.vol).toFixed(3)}</TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(eth?.qouteVol).toFixed(3)} USDT</TableCell>
                                <TableCell className={`text-base text-muted-foreground font-sans tracking-wider ${Number(eth?.priceChange) >= 0 ? "text-profit" : "text-loss"}`}> {Number(eth?.priceChange).toFixed(3)}</TableCell>
                            </TableRow>
                            <TableRow className="cursor-pointer" onClick={() => Clickiee("SOLUSDT")}>
                                <TableCell className="font-bold tracking-wider text-base"> SOL/USDT </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> <GetPrice s={"SOLUSDT"}/> </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(sol?.highPrice).toFixed(3)} </TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(sol?.lowPrice).toFixed(3)}</TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(sol?.vol).toFixed(3)}</TableCell>
                                <TableCell className="text-base text-muted-foreground font-sans tracking-wider"> {Number(sol?.qouteVol).toFixed(3)} USDT</TableCell>
                                <TableCell className={`text-base text-muted-foreground font-sans tracking-wider ${Number(sol?.priceChange) >= 0 ? "text-profit" : "text-loss"}`}> {Number(sol?.priceChange).toFixed(3)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}