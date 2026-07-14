"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/app/store/useStore";
import GetPrice from "./GetPrice";
import LivePnl from "./LivePnl";

export default function Positions() {
    const [fun, setFun] = useState<string>("Open Positions");
    const { isLoggedIn, setIsLoggedIn, setBalance } = useStore();
    const [data, setData] = useState<any[]>([]);

    async function Close(sym: string, id: string) {
        const response = await api.post("/api/closePositions", {
            symbol: sym,
            positionId: id
        }, {
            headers: {
                authorization: localStorage.getItem("authorization")
            }
        });
        
        if (response.data.balance !== undefined) {
            setBalance(Number(response.data.balance));
        }
        await GetPos();
    }

    async function GetPos() {
        const response = await api.post("/api/positions", {
            option: fun
        }, {
            headers: {
                authorization: localStorage.getItem("authorization")
            }
        });
        if (response) {
            setData(response.data);
        }
    }

    useEffect(() => {
        if (isLoggedIn) {
            GetPos();
        }
    }, [fun, isLoggedIn]);

    return (
        <div className="w-full h-full flex flex-col font-sans bg-[#0b0e11]">
            
            
            <div className="shrink-0 h-[40px] flex items-end gap-6 px-4 border-b border-[#1e2329] pt-2">
                <button
                    onClick={() => setFun("Open Positions")}
                    className={`pb-2 text-[12px] font-semibold tracking-wide transition-all border-b-2 ${fun === "Open Positions" ? "border-[#eaecef] text-[#eaecef]" : "border-transparent text-[#7f848f] hover:text-[#b0b5c0]"}`}
                >
                    OPEN POSITIONS <span className="ml-1 text-[#7f848f] font-mono font-normal">({fun === "Open Positions" ? data.length : 0})</span>
                </button>
                <button
                    onClick={() => setFun("Order History")}
                    className={`pb-2 text-[12px] font-semibold tracking-wide transition-all border-b-2 ${fun === "Order History" ? "border-[#eaecef] text-[#eaecef]" : "border-transparent text-[#7f848f] hover:text-[#b0b5c0]"}`}
                >
                    ORDER HISTORY
                </button>
                <button
                    onClick={() => setFun("Trade History")}
                    className={`pb-2 text-[12px] font-semibold tracking-wide transition-all border-b-2 ${fun === "Trade History" ? "border-[#eaecef] text-[#eaecef]" : "border-transparent text-[#7f848f] hover:text-[#b0b5c0]"}`}
                >
                    TRADE HISTORY
                </button>
            </div>

           
            <div className="flex-1 overflow-y-auto hide-scrollbar relative">
                <Table className="w-full">
                    <TableHeader>
                        
                        <TableRow className="sticky top-0 z-20 bg-[#0b0e11] border-b border-[#1e2329] shadow-sm hover:bg-[#0b0e11]">
                            <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Symbol</TableHead>
                            {fun === "Order History" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Type</TableHead>}
                            <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Side</TableHead>
                            {fun !== "Order History" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Entry Price</TableHead>}
                            {fun === "Open Positions" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Current Price</TableHead>}
                            {fun === "Trade History" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Closing Price</TableHead>}
                            {fun === "Order History" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Quantity</TableHead>}
                            {fun !== "Order History" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">PnL (ROE-USDT)</TableHead>}
                            {fun === "Order History" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Liq. Price</TableHead>}
                            <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Leverage</TableHead>
                            {fun === "Open Positions" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9">Liq. Price</TableHead>}
                            {fun === "Open Positions" && <TableHead className="text-[10px] font-bold text-[#7f848f] uppercase tracking-wider h-9 text-right pr-4">Action</TableHead>}
                        </TableRow>
                    </TableHeader>
                    
                    <TableBody>
                        {data.map((pos) => {
                            return (
                                <TableRow key={pos._id} className="border-b border-[#1e2329]/50 hover:bg-[#131418] transition-colors group">
                                    
                                    <TableCell className="py-2.5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-bold tracking-wide text-[13px] text-[#eaecef]">{pos.symbol}</span>
                                            <Badge variant="outline" className="w-fit text-[9px] h-3.5 px-1 py-0 text-[#b0b5c0] border-[#333741] font-mono leading-none flex items-center justify-center bg-[#22242a]">
                                                {pos.margin}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    
                                    {fun === "Order History" && <TableCell className="text-[13px] text-[#b0b5c0] font-mono">{pos.type}</TableCell>}
                                    
                                    <TableCell className={`text-[12px] font-bold tracking-wide ${pos.side === "LONG" ? "text-profit" : "text-loss"}`}>
                                        {pos.side}
                                    </TableCell>
                                    
                                    {fun !== "Order History" && <TableCell className="text-[13px] text-[#b0b5c0] font-mono tabular-nums">{pos.entryPrice}</TableCell>}
                                    
                                    {fun === "Open Positions" && <TableCell className="text-[13px] text-[#eaecef] font-mono tabular-nums"><GetPrice s={pos.symbol} /></TableCell>}
                                    
                                    {fun === "Trade History" && (
                                        <TableCell className="text-[13px] text-[#eaecef] font-mono tabular-nums">
                                            {pos.closingPrice?.toFixed(2) ? pos.closingPrice?.toFixed(2) : <GetPrice s={pos.symbol} />}
                                        </TableCell>
                                    )}
                                    
                                    {fun === "Order History" && <TableCell className="text-[13px] text-[#b0b5c0] font-mono tabular-nums">{pos.quantity.toFixed(6)}</TableCell>}
                                    {fun === "Order History" && <TableCell className="text-[13px] text-[#b0b5c0] font-mono tabular-nums">{pos.liquidationPrice?.toFixed(4)}</TableCell>}
                                    
                                    {fun === "Trade History" && (
                                        <TableCell className={`text-[13px] font-mono font-semibold tabular-nums ${pos.realizedPnL ? (pos.realizedPnL >= 0 ? "text-profit" : "text-loss") : "text-[#7f848f]"}`}>
                                            {pos.realizedPnL?.toFixed(2) ? pos.realizedPnL?.toFixed(2) : <LivePnl positionId={pos._id} />}
                                        </TableCell>
                                    )}
                                    
                                    {fun === "Open Positions" && (
                                        <TableCell className="text-[13px] font-mono font-semibold tabular-nums">
                                            <LivePnl positionId={pos._id} />
                                        </TableCell>
                                    )}
                                    
                                    <TableCell className="text-[13px] text-[#b0b5c0] font-mono">{pos.leverage}x</TableCell>
                                    
                                    {fun === "Open Positions" && <TableCell className="text-[13px] text-loss font-mono tabular-nums">{pos.liquidationPrice?.toFixed(4)}</TableCell>}
                                    
                                    {fun === "Open Positions" && (
                                        <TableCell className="text-right pr-4">
                                            <Button 
                                                variant="secondary" 
                                                size="sm" 
                                                onClick={() => Close(pos.symbol, pos._id)} 
                                                className="h-7 px-3 cursor-pointer text-[11px] font-semibold tracking-wide bg-[#22242a] text-[#eaecef] border border-[#333741] hover:bg-[#7c3b42] hover:border-[#8f444c] hover:text-white transition-colors"
                                            >
                                                Close
                                            </Button>
                                        </TableCell>
                                    )}
                                    
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                
                {data.length === 0 && (
                    <div className="w-full flex flex-col items-center justify-center py-12 text-[#7f848f]">
                        <span className="text-[13px]">No {fun.toLowerCase()} found.</span>
                    </div>
                )}
            </div>
        </div>
    );
}