'use client';

import GetPrice from "@/components/GetPrice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useRouter } from "next/navigation";

interface BinanceData {
    highPrice: string;
    lowPrice: string;
    vol: string;
    qouteVol: string;
    priceChange: string;
}

interface MarketTicker {
    symbol: string;
    displayName: string;
    baseAsset: string;
}

export default function Markets() {
    const [marketData, setMarketData] = useState<Record<string, BinanceData>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const setSymbol = useStore(state => state.setSymbol);
    const router = useRouter();

    const targetMarkets: MarketTicker[] = [
        { symbol: "BTCUSDT", displayName: "BTC / USDT", baseAsset: "Bitcoin" },
        { symbol: "ETHUSDT", displayName: "ETH / USDT", baseAsset: "Ethereum" },
        { symbol: "SOLUSDT", displayName: "SOL / USDT", baseAsset: "Solana" }
    ];

    function handleRowClick(s: string) {
        setSymbol(s);
        router.push("/trade");
    }

    useEffect(() => {
        async function getChange() {
            try {
                const updatedData: Record<string, BinanceData> = {};
                await Promise.all(
                    targetMarkets.map(async (market) => {
                        const response = await axios.get(
                            `https://api.binance.com/api/v3/ticker/24hr?symbol=${market.symbol}`
                        );
                        updatedData[market.symbol] = {
                            highPrice: response.data.highPrice,
                            lowPrice: response.data.lowPrice,
                            vol: response.data.volume,
                            qouteVol: response.data.quoteVolume,
                            priceChange: response.data.priceChangePercent,
                        };
                    })
                );
                setMarketData((prev) => ({ ...prev, ...updatedData }));
            } catch (err) {
                console.error(err);
            }
        }

        getChange();
        const interval = setInterval(getChange, 6000);
        return () => clearInterval(interval);
    }, []);

    const filteredMarkets = targetMarkets.filter(
        (m) =>
            m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.baseAsset.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatNumber = (val: string | undefined, decimals = 2) => {
        if (!val) return "0.00";
        return Number(val).toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    return (
        <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] p-6 md:p-10 selection:bg-[#f0b90b]/30">
            <div className="max-w-7xl mx-auto mt-6">
                
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-[28px] font-semibold tracking-tight text-[#eaecef]">Markets</h1>
                        <p className="text-[13px] text-[#848e9c] mt-1">Real-time assets, 24h volume metrics and trading stats.</p>
                    </div>

                    <div className="relative w-full md:w-[280px]">
                        <input
                            type="text"
                            placeholder="Search asset..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 bg-[#161a1e] border border-[#2b3139] rounded-[4px] px-3 text-[13px] text-[#eaecef] outline-none placeholder:text-[#3b444f] focus:border-[#5c6370] transition-colors"
                        />
                    </div>
                </div>

                <div className="bg-[#191a1d] border border-[#2b3139] rounded-[8px] overflow-hidden shadow-xl">
                    <Table className="w-full">
                        <TableHeader className="bg-[#191a1d]/40 border-b border-[#2b3139]">
                            <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="h-10 text-[12px] font-medium text-[#848e9c] px-6">Asset</TableHead>
                                <TableHead className="h-10 text-[12px] font-medium text-[#848e9c] text-right">Price</TableHead>
                                <TableHead className="h-10 text-[12px] font-medium text-[#848e9c] text-right hidden sm:table-cell">24h High</TableHead>
                                <TableHead className="h-10 text-[12px] font-medium text-[#848e9c] text-right hidden sm:table-cell">24h Low</TableHead>
                                <TableHead className="h-10 text-[12px] font-medium text-[#848e9c] text-right hidden md:table-cell">24h Volume</TableHead>
                                <TableHead className="h-10 text-[12px] font-medium text-[#848e9c] text-right hidden lg:table-cell">Quote Volume</TableHead>
                                <TableHead className="h-10 text-[12px] font-medium text-[#848e9c] text-right pr-6">24h Change</TableHead>
                            </TableRow>
                        </TableHeader>
                        
                        <TableBody>
                            {filteredMarkets.map((market) => {
                                const ticker = marketData[market.symbol];
                                const isPositive = Number(ticker?.priceChange) >= 0;

                                return (
                                    <TableRow
                                        key={market.symbol}
                                        onClick={() => handleRowClick(market.symbol)}
                                        className="border-b border-[#2b3139]/50 cursor-pointer hover:bg-[#1e2329]/40 transition-colors duration-150"
                                    >
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-semibold text-[#eaecef]">
                                                    {market.displayName}
                                                </span>
                                                <span className="text-[12px] text-[#848e9c]">
                                                    {market.baseAsset}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right py-4 font-medium text-[14px] tabular-nums">
                                            <GetPrice s={market.symbol} />
                                        </TableCell>

                                        <TableCell className="text-right py-4 text-[#eaecef]/80 text-[13px] tabular-nums hidden sm:table-cell">
                                            {formatNumber(ticker?.highPrice, 2)}
                                        </TableCell>

                                        <TableCell className="text-right py-4 text-[#eaecef]/80 text-[13px] tabular-nums hidden sm:table-cell">
                                            {formatNumber(ticker?.lowPrice, 2)}
                                        </TableCell>

                                        <TableCell className="text-right py-4 text-[#eaecef]/70 text-[13px] tabular-nums hidden md:table-cell">
                                            {formatNumber(ticker?.vol, 0)}
                                        </TableCell>

                                        <TableCell className="text-right py-4 text-[#848e9c] text-[13px] tabular-nums hidden lg:table-cell">
                                            {formatNumber(ticker?.qouteVol, 2)} <span className="text-[11px]">USDT</span>
                                        </TableCell>

                                        <TableCell className="text-right py-4 pr-6 font-medium text-[13px] tabular-nums">
                                            <span className={isPositive ? "text-[#2ebd85]" : "text-[#e0294a]"}>
                                                {isPositive ? "+" : ""}
                                                {formatNumber(ticker?.priceChange, 2)}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                
            </div>
        </div>
    );
}